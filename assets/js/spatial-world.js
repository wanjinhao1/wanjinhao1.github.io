(() => {
  'use strict';

  /* Bespoke RF canvas engine. Same public surface as the Spatialfolio world
     module (class SpatialWorld, bind/resize/setMode/updateReadout/draw, the
     [data-spatial-world] bootstrap, window.SpatialWorld), but the 3D urban
     world is replaced by four RF visualizations: a signal feature space, an
     I/Q constellation diagram, an RF spectrogram waterfall and a UAV detection
     scope. Everything is 2D — no camera/projection is needed. */

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const mix = (a, b, amount) => a + (b - a) * amount;
  const smoothstep = (edge0, edge1, value) => {
    const t = clamp((value - edge0) / (edge1 - edge0 || 1), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const TAU = Math.PI * 2;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  class SpatialWorld {
    constructor(canvas) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d', { alpha: false, desynchronized: true });
      if (!this.context) return;

      this.scene = canvas.dataset.scene || 'hero';
      this.mode = canvas.dataset.mode || 'features';
      this.width = 1;
      this.height = 1;
      this.ratio = 1;
      this.seed = 71993;
      this.frame = 0;
      this.lastTime = 0;
      this.visible = true;
      this.documentVisible = !document.hidden;
      this.mobile = window.matchMedia('(max-width: 720px)').matches;
      this.quality = this.getQuality();

      this.pointer = { active: false, down: false, x: .63, y: .46, smoothX: .63, smoothY: .46, lastInteraction: 0 };
      this.probe = { x: 0, y: 0, radius: 112, targetRadius: 112, pulses: [], focus: null };

      /* Signal classes shared by the feature-space and constellation views. */
      this.semanticColors = {
        bpsk: '#79f3ee', qpsk: '#5ad1c4', p8: '#9a8cff', q16: '#ff9d66',
        q64: '#ffd98a', ofdm: '#b6a1e5', uav: '#ff6f6f', noise: '#6b8088'
      };
      this.semanticLabels = {
        bpsk: ['BPSK', 'binary phase shift'], qpsk: ['QPSK', 'quadrature phase'],
        p8: ['8-PSK', '8-ary phase'], q16: ['16-QAM', '16-quadrature amp.'],
        q64: ['64-QAM', '64-quadrature amp.'], ofdm: ['OFDM', 'multicarrier'],
        uav: ['UAV EMISSION', 'drone control link'], noise: ['NOISE', 'background floor']
      };
      this.classWeight = { uav: 1.5, q16: 1.12, q64: 1.05, p8: 1.0, ofdm: 0.9, qpsk: 0.92, bpsk: 0.78, noise: 0.4 };

      this.modeCopy = {
        features: ['Signal feature space', 'Move the probe to reveal classes · click to scan the neighbourhood', 'RF signal clusters', 'Move probe · click to scan'],
        constellation: ['I/Q constellation', 'Steer the decision region · click to classify a cluster', 'Modulation symbols', 'Move reticle · click to classify'],
        spectrum: ['RF spectrogram', 'Move the detection cursor · click to mark a signal of interest', 'Waterfall · freq × time', 'Move cursor · click to mark'],
        detection: ['UAV detection scope', 'Move the tracking cursor · click to lock an emitter track', 'Range–azimuth plan', 'Move cursor · click to lock track']
      };

      this.stars = [];
      this.featureSamples = [];
      this.constellation = null;
      this.spec = this.buildSpectrum();
      this.detect = this.buildDetection();

      this.generateWorld();
      this.bind();
      this.resize();
      this.updateReadout();
      this.draw(0, true);
    }

    getQuality() {
      const memory = navigator.deviceMemory || 8;
      if (this.mobile || memory <= 4) return .6;
      if (window.innerWidth < 1180) return .82;
      return 1;
    }

    random() {
      this.seed = (this.seed * 16807) % 2147483647;
      return (this.seed - 1) / 2147483646;
    }

    /* ---------- Data generation ---------- */

    generateWorld() {
      const clusters = [
        { kind: 'bpsk', cx: .17, cy: .22, n: 22, spread: .028 },
        { kind: 'qpsk', cx: .40, cy: .18, n: 24, spread: .030 },
        { kind: 'p8', cx: .64, cy: .22, n: 26, spread: .032 },
        { kind: 'q16', cx: .84, cy: .40, n: 30, spread: .034 },
        { kind: 'q64', cx: .80, cy: .66, n: 32, spread: .036 },
        { kind: 'ofdm', cx: .50, cy: .50, n: 28, spread: .045 },
        { kind: 'uav', cx: .24, cy: .74, n: 20, spread: .026 },
        { kind: 'noise', cx: .14, cy: .50, n: 30, spread: .10 }
      ];
      clusters.forEach((cluster) => {
        const count = Math.round(cluster.n * this.quality);
        for (let index = 0; index < count; index += 1) {
          const angle = this.random() * TAU;
          const radius = (cluster.kind === 'noise' ? Math.sqrt(this.random()) : this.random()) * cluster.spread;
          this.featureSamples.push({
            kind: cluster.kind,
            cx: cluster.cx + Math.cos(angle) * radius,
            cy: cluster.cy + Math.sin(angle) * radius,
            jx: .004 + this.random() * .012,
            jy: .004 + this.random() * .012,
            fx: .0004 + this.random() * .0012,
            fy: .0004 + this.random() * .0012,
            phx: this.random() * TAU,
            phy: this.random() * TAU,
            size: .78 + this.random() * .42,
            alpha: .5 + this.random() * .24
          });
        }
      });

      this.constellation = {
        radius: .2,
        panels: [
          { mod: 'qpsk', cx: .20, ideal: [[-1, -1], [1, -1], [-1, 1], [1, 1]], scale: .58 },
          { mod: 'p8', cx: .50, ideal: Array.from({ length: 8 }, (_, k) => [Math.cos(k * Math.PI / 4), Math.sin(k * Math.PI / 4)]), scale: .92 },
          { mod: 'q16', cx: .80, ideal: [-1.5, -.5, .5, 1.5].flatMap((x) => [-1.5, -.5, .5, 1.5].map((y) => [x, y])), scale: .34 }
        ].map((panel) => ({
          ...panel,
          samples: panel.ideal.flatMap((ideal, idx) => Array.from({ length: 5 }, (_, k) => ({
            owner: idx, ang: (k / 5) * TAU + this.random(), rad: .2 + this.random() * .3, ph: this.random() * TAU
          })))
        }))
      };

      for (let index = 0; index < 84; index += 1) {
        this.stars.push({ x: this.random(), y: this.random() * .6, alpha: .02 + this.random() * .12, size: this.random() > .88 ? 1.3 : .6 });
      }
    }

    buildSpectrum() {
      const cols = 140;
      const rows = 84;
      const spec = {
        cols, rows, grid: new Float32Array(cols * rows), head: 0, tick: 0, lastRow: -Infinity,
        carriers: [{ c: 30, a: .72, w: 6 }, { c: 70, a: .5, w: 5 }, { c: 108, a: .86, w: 7 }],
        burst: null, nextBurst: 40, markers: []
      };
      const canvas = document.createElement('canvas');
      canvas.width = cols; canvas.height = rows;
      spec.canvas = canvas;
      spec.context = canvas.getContext('2d');
      spec.image = spec.context.createImageData(cols, rows);
      const add = () => {
        spec.head = (spec.head - 1 + rows) % rows;
        const base = spec.head * cols;
        for (let c = 0; c < cols; c += 1) {
          let v = .05 + .045 * Math.random();
          v += .02 * Math.sin(c * .09 + spec.tick * .12);
          spec.carriers.forEach((car) => { v += car.a * Math.exp(-((c - car.c) ** 2) / (2 * car.w * car.w)); });
          if (spec.burst && spec.tick - spec.burst.born < spec.burst.life) {
            const fade = 1 - (spec.tick - spec.burst.born) / spec.burst.life;
            v += spec.burst.a * fade * Math.exp(-((c - spec.burst.c) ** 2) / (2 * spec.burst.w * spec.burst.w));
          }
          v += .03 * Math.max(0, Math.sin(spec.tick * .05 + c * .02));
          spec.grid[base + c] = clamp(v, 0, 1);
        }
        if (spec.burst && spec.tick - spec.burst.born >= spec.burst.life) spec.burst = null;
        if (!spec.burst && spec.tick >= spec.nextBurst) {
          spec.burst = { c: 12 + Math.random() * (cols - 24), born: spec.tick, life: 6 + Math.random() * 4, a: .58 + Math.random() * .2, w: 7 + Math.random() * 3 };
          spec.nextBurst = spec.tick + 55 + Math.random() * 70;
        }
        spec.tick += 1;
      };
      spec.add = add;
      for (let r = 0; r < rows; r += 1) add();
      return spec;
    }

    buildDetection() {
      return {
        sweep: 0,
        tracks: [
          { id: 'UAV-01', r: .46, th: .6, vr: .00045, vth: .0008, hist: [] },
          { id: 'UAV-02', r: .72, th: 2.1, vr: -.00032, vth: .0006, hist: [] },
          { id: 'UAV-03', r: .3, th: 4.0, vr: .0006, vth: -.00095, hist: [] }
        ],
        clutter: Array.from({ length: 46 }, () => ({ r: Math.random() * .5, th: Math.random() * TAU, tw: Math.random() * TAU })),
        locked: null
      };
    }

    /* ---------- Bind / resize / mode ---------- */

    bind() {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.canvas);

      const pointerMove = (event) => {
        const bounds = this.canvas.getBoundingClientRect();
        this.pointer.active = true;
        this.pointer.x = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
        this.pointer.y = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);
        this.pointer.lastInteraction = performance.now();
        if (reducedMotion) this.draw(performance.now(), true);
      };
      this.canvas.addEventListener('pointermove', pointerMove, { passive: true });
      this.canvas.addEventListener('pointerdown', (event) => {
        pointerMove(event);
        this.pointer.down = true;
        this.activateModeInteraction(performance.now());
        if (reducedMotion) this.draw(performance.now(), true);
      }, { passive: true });
      window.addEventListener('pointerup', () => { this.pointer.down = false; if (reducedMotion) this.draw(performance.now(), true); }, { passive: true });
      window.addEventListener('pointercancel', () => { this.pointer.down = false; if (reducedMotion) this.draw(performance.now(), true); }, { passive: true });
      this.canvas.addEventListener('pointerleave', () => { this.pointer.active = false; this.pointer.down = false; });

      this.visibilityObserver = new IntersectionObserver((entries) => {
        this.visible = entries[0]?.isIntersecting ?? true;
        if (this.visible && this.documentVisible && !reducedMotion && !this.frame) this.frame = requestAnimationFrame((time) => this.draw(time));
      }, { threshold: .01 });
      this.visibilityObserver.observe(this.canvas);

      document.addEventListener('visibilitychange', () => {
        this.documentVisible = !document.hidden;
        if (this.documentVisible && this.visible && !reducedMotion && !this.frame) this.frame = requestAnimationFrame((time) => this.draw(time));
      });

      document.querySelectorAll('[data-explorer-mode], [data-world-mode]').forEach((button) => {
        button.addEventListener('click', () => this.setMode(button.dataset.explorerMode || button.dataset.worldMode));
      });
    }

    resize() {
      const bounds = this.canvas.getBoundingClientRect();
      this.width = Math.max(1, bounds.width);
      this.height = Math.max(1, bounds.height);
      this.mobile = this.width < 700;
      this.ratio = Math.min(window.devicePixelRatio || 1, this.mobile ? 1.25 : 1.6);
      this.canvas.width = Math.round(this.width * this.ratio);
      this.canvas.height = Math.round(this.height * this.ratio);
      this.context.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
      if (reducedMotion) this.draw(performance.now(), true);
    }

    setMode(mode) {
      if (!this.modeCopy[mode]) return;
      this.mode = mode;
      document.querySelectorAll('[data-explorer-mode], [data-world-mode]').forEach((button) => {
        const buttonMode = button.dataset.explorerMode || button.dataset.worldMode;
        const active = buttonMode === mode;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      const role = document.querySelector('[data-roles]');
      const roleCopy = { features: 'RF signals', constellation: 'modulation classes', spectrum: 'spectral patterns', detection: 'UAV emitters' };
      if (role && roleCopy[mode]) {
        role.dataset.modeLocked = mode;
        role.textContent = roleCopy[mode];
        role.classList.remove('is-changing');
      }
      this.updateReadout();
      if (reducedMotion) this.draw(performance.now(), true);
    }

    updateReadout() {
      const copy = this.modeCopy[this.mode] || this.modeCopy.features;
      document.querySelectorAll('[data-world-title]').forEach((node) => { node.textContent = copy[0]; });
      document.querySelectorAll('[data-world-detail]').forEach((node) => { node.textContent = copy[1]; });
      document.querySelectorAll('[data-world-status]').forEach((node) => { node.textContent = copy[2]; });
      document.querySelectorAll('[data-world-interaction]').forEach((node) => { node.textContent = copy[3]; });
      document.querySelectorAll('.semantic-legend').forEach((node) => { node.hidden = this.mode !== 'features'; });
    }

    /* ---------- Interaction ---------- */

    activateModeInteraction(time) {
      if (this.mode === 'features' || this.mode === 'constellation') {
        if (!reducedMotion) {
          this.probe.pulses.push({ x: this.pointer.x, y: this.pointer.y, born: time });
          if (this.probe.pulses.length > 3) this.probe.pulses.shift();
        }
        return;
      }
      if (this.mode === 'spectrum') {
        const rect = this.spectrumRect();
        const col = clamp(Math.round((this.pointer.x * this.width - rect.x) / rect.w * this.spec.cols), 0, this.spec.cols - 1);
        this.spec.markers.push({ col, born: time });
        if (this.spec.markers.length > 5) this.spec.markers.shift();
        return;
      }
      if (this.mode === 'detection') {
        const center = this.scopeCenter();
        const px = this.pointer.smoothX * this.width;
        const py = this.pointer.smoothY * this.height;
        let nearest = null;
        let best = Infinity;
        this.detect.tracks.forEach((track) => {
          const tx = center.cx + track.r * center.maxR * Math.cos(track.th);
          const ty = center.cy + track.r * center.maxR * Math.sin(track.th);
          const d = Math.hypot(tx - px, ty - py);
          if (d < best) { best = d; nearest = track; }
        });
        if (nearest && best < center.maxR * .35) this.detect.locked = { id: nearest.id, born: time };
      }
    }

    updateProbe(time) {
      const minDimension = Math.min(this.width, this.height);
      const idleX = .6 + Math.sin(time * .00017) * .13;
      const idleY = .47 + Math.cos(time * .00013 + .8) * .12;
      const nx = this.pointer.active ? this.pointer.x : idleX;
      const ny = this.pointer.active ? this.pointer.y : idleY;
      const tx = nx * this.width;
      const ty = ny * this.height;
      const ease = reducedMotion ? 1 : (this.pointer.active ? .44 : .055);
      if (!this.probe.x || !this.probe.y) { this.probe.x = tx; this.probe.y = ty; }
      else { this.probe.x += (tx - this.probe.x) * ease; this.probe.y += (ty - this.probe.y) * ease; }
      const normalRadius = clamp(minDimension * (this.scene === 'explorer' ? .17 : .15), 76, 132);
      this.probe.targetRadius = this.pointer.down ? Math.min(normalRadius * 1.58, 198) : normalRadius;
      this.probe.radius += (this.probe.targetRadius - this.probe.radius) * (reducedMotion ? 1 : .1);
      this.probe.pulses = this.probe.pulses.filter((pulse) => time - pulse.born < 1150);
    }

    updateModeInteraction(time) {
      this.pointer.smoothX += (this.pointer.x - this.pointer.smoothX) * (reducedMotion ? 1 : .12);
      this.pointer.smoothY += (this.pointer.y - this.pointer.smoothY) * (reducedMotion ? 1 : .12);

      if (this.mode === 'spectrum' && !reducedMotion) {
        while (time - this.spec.lastRow > 70) { this.spec.add(); this.spec.lastRow += 70; }
        if (this.spec.lastRow === -Infinity || time - this.spec.lastRow > 1000) this.spec.lastRow = time;
      }

      if (this.mode === 'detection' && !reducedMotion) {
        this.detect.sweep = (time * .0004) % TAU;
        const scale = clamp((time - this.lastTime) / 16, 0, 2.5);
        this.detect.tracks.forEach((track) => {
          track.r += track.vr * scale;
          track.th = (track.th + track.vth * scale) % TAU;
          if (track.r < .14) { track.r = .14; track.vr = Math.abs(track.vr); }
          if (track.r > .96) { track.r = .96; track.vr = -Math.abs(track.vr); }
          track.hist.push({ r: track.r, th: track.th });
          if (track.hist.length > 44) track.hist.shift();
        });
      }
    }

    /* ---------- Drawing: shared ---------- */

    drawBackground(time) {
      const context = this.context;
      const gradient = context.createLinearGradient(0, 0, this.width, this.height);
      gradient.addColorStop(0, '#060d12');
      gradient.addColorStop(.54, this.scene === 'explorer' ? '#07121a' : '#081119');
      gradient.addColorStop(1, '#03070a');
      context.fillStyle = gradient;
      context.fillRect(0, 0, this.width, this.height);

      const glow = context.createRadialGradient(this.width * .66, this.height * .42, 20, this.width * .66, this.height * .5, Math.max(this.width, this.height) * .62);
      glow.addColorStop(0, 'rgba(60,150,158,.14)');
      glow.addColorStop(.5, 'rgba(30,80,96,.05)');
      glow.addColorStop(1, 'rgba(3,7,10,0)');
      context.fillStyle = glow;
      context.fillRect(0, 0, this.width, this.height);

      context.save();
      context.fillStyle = '#9fdce6';
      this.stars.forEach((star, index) => {
        context.globalAlpha = star.alpha;
        const drift = reducedMotion ? 0 : Math.sin(time * .00016 + index) * 1.4;
        context.fillRect(star.x * this.width + drift, star.y * this.height, star.size, star.size);
      });
      context.restore();
    }

    drawFog() {
      const context = this.context;
      const fog = context.createLinearGradient(0, 0, 0, this.height);
      fog.addColorStop(0, 'rgba(3,7,10,0)');
      fog.addColorStop(.76, 'rgba(3,7,10,.02)');
      fog.addColorStop(1, 'rgba(3,7,10,.66)');
      context.fillStyle = fog;
      context.fillRect(0, 0, this.width, this.height);
    }

    semanticAmount(px, py, time) {
      const distance = Math.hypot(px - this.probe.x, py - this.probe.y);
      let amount = .02 + .98 * (1 - smoothstep(this.probe.radius * .56, this.probe.radius, distance));
      this.probe.pulses.forEach((pulse) => {
        const progress = clamp((time - pulse.born) / 1150, 0, 1);
        const pd = Math.hypot(px - pulse.x * this.width, py - pulse.y * this.height);
        const wave = mix(this.probe.radius * .45, this.probe.radius * 2.25, progress);
        amount = Math.max(amount, (1 - smoothstep(10, 34, Math.abs(pd - wave))) * (1 - progress) * .82);
      });
      return clamp(amount, .02, 1);
    }

    /* ---------- Mode: feature space ---------- */

    drawFeatures(time) {
      const context = this.context;
      const scores = new Map();
      Object.keys(this.semanticColors).forEach((kind) => scores.set(kind, { score: 0, distance: Infinity }));

      context.save();
      context.fillStyle = '#7a93a0';
      this.featureSamples.forEach((sample) => {
        const px = (sample.cx + sample.jx * Math.sin(time * sample.fx + sample.phx)) * this.width;
        const py = (sample.cy + sample.jy * Math.cos(time * sample.fy + sample.phy)) * this.height;
        const size = clamp(sample.size * 1.5, .6, 2.6);
        context.globalAlpha = sample.alpha * .4;
        context.fillRect(px, py, size, size);
        const semantic = this.semanticAmount(px, py, time);
        if (semantic > .07) {
          context.fillStyle = this.semanticColors[sample.kind];
          context.globalAlpha = clamp(sample.alpha * semantic * .95, .04, .9);
          const ss = size * (1 + semantic * .2);
          context.fillRect(px - ss * .1, py - ss * .1, ss, ss);
          context.fillStyle = '#7a93a0';
        }
        const d = Math.hypot(px - this.probe.x, py - this.probe.y);
        if (d < this.probe.radius * .8) {
          const bucket = scores.get(sample.kind);
          bucket.score += (1 - d / (this.probe.radius * .8)) * (this.classWeight[sample.kind] || .5);
          if (d < bucket.distance) bucket.distance = d;
        }
      });
      context.restore();

      const ranked = [...scores.entries()].filter(([, v]) => v.score > 0).sort((a, b) => b[1].score - a[1].score);
      this.probe.focus = ranked[0] ? { kind: ranked[0][0] } : null;
    }

    /* ---------- Mode: I/Q constellation ---------- */

    drawConstellation(time) {
      const context = this.context;
      const minDim = Math.min(this.width, this.height);
      const R = minDim * (this.scene === 'explorer' ? .21 : .19);
      const cy = this.height * .5;
      const probeX = this.probe.x;
      const probeY = this.probe.y;

      let focusMod = null;
      let focusBest = Infinity;

      this.constellation.panels.forEach((panel) => {
        const cx = panel.cx * this.width;
        const s = R * panel.scale;
        const panelColor = this.semanticColors[panel.mod];

        context.save();
        context.strokeStyle = 'rgba(121,243,238,.16)';
        context.lineWidth = .6;
        context.beginPath();
        context.moveTo(cx - R, cy); context.lineTo(cx + R, cy);
        context.moveTo(cx, cy - R); context.lineTo(cx, cy + R);
        context.stroke();
        context.strokeStyle = 'rgba(121,243,238,.1)';
        context.beginPath();
        context.arc(cx, cy, R, 0, TAU);
        context.stroke();
        context.fillStyle = 'rgba(169,185,187,.55)';
        context.font = '8px "DM Mono", monospace';
        context.fillText(panel.mod === 'p8' ? '8-PSK' : panel.mod.toUpperCase(), cx - 16, cy + R + 16);
        context.fillText('I', cx + R - 8, cy - 4);
        context.fillText('Q', cx + 4, cy - R + 8);
        context.restore();

        const distToProbe = Math.hypot(cx - probeX, cy - probeY);
        const inside = distToProbe < R * 1.05;
        if (inside && distToProbe < focusBest) { focusBest = distToProbe; focusMod = panel.mod; }

        context.save();
        panel.samples.forEach((sm) => {
          const ideal = panel.ideal[sm.owner];
          const ipx = cx + ideal[0] * s;
          const ipy = cy + ideal[1] * s;
          const a = time * .0014 + sm.ang;
          const rr = sm.rad * s * (reducedMotion ? .7 : (.55 + .45 * Math.sin(time * .002 + sm.ph)));
          const px = ipx + Math.cos(a) * rr;
          const py = ipy + Math.sin(a) * rr;
          const semantic = inside ? this.semanticAmount(px, py, time) : .05;
          context.fillStyle = panelColor;
          context.globalAlpha = clamp(.18 + semantic * .8, .12, .92);
          const sz = 1.6 + semantic * 1.4;
          context.fillRect(px - sz * .5, py - sz * .5, sz, sz);
          context.fillStyle = panelColor;
          context.globalAlpha = inside ? .85 : .42;
          context.fillRect(ipx - 1.1, ipy - 1.1, 2.2, 2.2);
        });
        context.restore();
      });

      this.probe.focus = focusMod ? { kind: focusMod } : null;
    }

    /* ---------- Mode: RF spectrogram ---------- */

    spectrumRect() {
      const left = 30, right = 14, top = 16, bottom = 26;
      return { x: left, y: top, w: Math.max(40, this.width - left - right), h: Math.max(40, this.height - top - bottom) };
    }

    spectralColor(t) {
      const stops = [[0, 6, 14, 22], [.18, 18, 52, 66], [.4, 45, 130, 140], [.62, 121, 243, 238], [.8, 255, 180, 120], [1, 255, 235, 210]];
      for (let i = 0; i < stops.length - 1; i += 1) {
        const [p0, r0, g0, b0] = stops[i];
        const [p1, r1, g1, b1] = stops[i + 1];
        if (t <= p1) {
          const f = (t - p0) / (p1 - p0 || 1);
          return [Math.round(mix(r0, r1, f)), Math.round(mix(g0, g1, f)), Math.round(mix(b0, b1, f))];
        }
      }
      return [255, 235, 210];
    }

    drawSpectrum(time) {
      const context = this.context;
      const { cols, rows } = this.spec;
      const data = this.spec.image.data;
      for (let r = 0; r < rows; r += 1) {
        const src = ((this.spec.head + r) % rows) * cols;
        for (let c = 0; c < cols; c += 1) {
          const [R, G, B] = this.spectralColor(this.spec.grid[src + c]);
          const idx = (r * cols + c) * 4;
          data[idx] = R; data[idx + 1] = G; data[idx + 2] = B; data[idx + 3] = 255;
        }
      }
      this.spec.context.putImageData(this.spec.image, 0, 0);

      const rect = this.spectrumRect();
      context.save();
      context.imageSmoothingEnabled = true;
      context.drawImage(this.spec.canvas, 0, 0, cols, rows, rect.x, rect.y, rect.w, rect.h);
      context.strokeStyle = 'rgba(121,243,238,.28)';
      context.lineWidth = 1;
      context.strokeRect(rect.x, rect.y, rect.w, rect.h);
      context.restore();

      const px = clamp(this.pointer.smoothX * this.width, rect.x, rect.x + rect.w);
      const py = clamp(this.pointer.smoothY * this.height, rect.y, rect.y + rect.h);
      context.save();
      context.strokeStyle = 'rgba(216,244,247,.5)';
      context.lineWidth = .8;
      context.setLineDash([3, 4]);
      context.beginPath();
      context.moveTo(px, rect.y); context.lineTo(px, rect.y + rect.h);
      context.moveTo(rect.x, py); context.lineTo(rect.x + rect.w, py);
      context.stroke();
      context.setLineDash([]);
      const freq = 2.400 + ((px - rect.x) / rect.w) * .12;
      context.fillStyle = 'rgba(207,234,238,.78)';
      context.font = '8px "DM Mono", monospace';
      context.fillText(`f = ${freq.toFixed(3)} GHz`, px + 6, rect.y + 12);
      context.restore();

      this.spec.markers = this.spec.markers.filter((marker) => time - marker.born < 1500);
      this.spec.markers.forEach((marker) => {
        const progress = clamp((time - marker.born) / 1500, 0, 1);
        const mx = rect.x + (marker.col / cols) * rect.w;
        context.save();
        context.strokeStyle = `rgba(255,157,102,${.85 * (1 - progress * .5)})`;
        context.lineWidth = 1.1;
        context.strokeRect(mx - 3, rect.y, 6, rect.h);
        context.fillStyle = `rgba(255,180,120,${.9 * (1 - progress * .4)})`;
        context.font = '8px "DM Mono", monospace';
        context.fillText('SOI', mx + 6, rect.y + 12);
        context.restore();
      });

      context.save();
      context.fillStyle = 'rgba(169,185,187,.6)';
      context.font = '7px "DM Mono", monospace';
      context.fillText('FREQ →', rect.x + rect.w - 44, rect.y + rect.h + 16);
      context.save();
      context.translate(rect.x - 14, rect.y + 14);
      context.rotate(-Math.PI / 2);
      context.fillText('↓ TIME', 0, 0);
      context.restore();
      context.restore();
    }

    /* ---------- Mode: UAV detection scope ---------- */

    scopeCenter() {
      return { cx: this.width * .5, cy: this.height * .46, maxR: Math.min(this.width, this.height) * (this.scene === 'explorer' ? .42 : .38) };
    }

    drawDetection(time) {
      const context = this.context;
      const { cx, cy, maxR } = this.scopeCenter();

      context.save();
      const disc = context.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      disc.addColorStop(0, 'rgba(20,60,64,.34)');
      disc.addColorStop(1, 'rgba(6,13,18,0)');
      context.fillStyle = disc;
      context.beginPath();
      context.arc(cx, cy, maxR, 0, TAU);
      context.fill();

      context.strokeStyle = 'rgba(121,243,238,.2)';
      context.lineWidth = .7;
      [.33, .66, 1].forEach((f) => { context.beginPath(); context.arc(cx, cy, maxR * f, 0, TAU); context.stroke(); });
      for (let a = 0; a < 360; a += 30) {
        const rad = a * Math.PI / 180;
        context.beginPath();
        context.moveTo(cx, cy);
        context.lineTo(cx + Math.cos(rad) * maxR, cy + Math.sin(rad) * maxR);
        context.stroke();
      }

      context.fillStyle = 'rgba(121,243,238,.4)';
      context.font = '7px "DM Mono", monospace';
      [1, 2, 3].forEach((km, i) => { context.fillText(`${km}km`, cx + maxR * (.33 * (i + 1)) - 8, cy - 3); });
      context.fillText('N', cx - 3, cy - maxR - 4);

      /* Sweep with a fading trailing sector. */
      if (!reducedMotion) {
        for (let i = 0; i < 26; i += 1) {
          const a = this.detect.sweep - i * .035;
          context.strokeStyle = `rgba(121,243,238,${(1 - i / 26) * .32})`;
          context.lineWidth = i === 0 ? 1.2 : .6;
          context.beginPath();
          context.moveTo(cx, cy);
          context.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
          context.stroke();
        }
      }

      /* Clutter haze near the centre. */
      this.detect.clutter.forEach((cl) => {
        const px = cx + cl.r * maxR * Math.cos(cl.th);
        const py = cy + cl.r * maxR * Math.sin(cl.th);
        const tw = reducedMotion ? .3 : .2 + .25 * Math.abs(Math.sin(time * .001 + cl.tw));
        context.fillStyle = `rgba(120,170,168,${tw * .4})`;
        context.fillRect(px, py, 1.4, 1.4);
      });
      context.restore();

      const px = this.pointer.smoothX * this.width;
      const py = this.pointer.smoothY * this.height;

      this.detect.tracks.forEach((track) => {
        const tx = cx + track.r * maxR * Math.cos(track.th);
        const ty = cy + track.r * maxR * Math.sin(track.th);
        const lit = !reducedMotion && Math.abs(((this.detect.sweep - track.th) % TAU + TAU) % TAU) < .25;

        context.save();
        if (track.hist.length > 1) {
          context.strokeStyle = 'rgba(255,111,111,.4)';
          context.lineWidth = 1;
          context.beginPath();
          track.hist.forEach((h, i) => {
            const hx = cx + h.r * maxR * Math.cos(h.th);
            const hy = cy + h.r * maxR * Math.sin(h.th);
            if (i === 0) context.moveTo(hx, hy); else context.lineTo(hx, hy);
          });
          context.stroke();
        }
        const glow = lit ? .95 : .55;
        context.fillStyle = `rgba(255,111,111,${glow})`;
        context.beginPath();
        context.arc(tx, ty, lit ? 3.4 : 2.4, 0, TAU);
        context.fill();
        context.strokeStyle = `rgba(255,150,150,${glow * .8})`;
        context.lineWidth = .9;
        context.strokeRect(tx - 6, ty - 6, 12, 12);
        context.fillStyle = 'rgba(255,200,200,.85)';
        context.font = '7px "DM Mono", monospace';
        context.fillText(track.id, tx + 9, ty - 7);
        context.restore();

        const d = Math.hypot(tx - px, ty - py);
        if (this.pointer.active && d < maxR * .18) {
          context.save();
          context.setLineDash([3, 3]);
          context.strokeStyle = 'rgba(216,244,247,.7)';
          context.lineWidth = 1;
          context.strokeRect(tx - 10, ty - 10, 20, 20);
          context.setLineDash([]);
          context.restore();
        }
      });

      if (this.detect.locked) {
        const track = this.detect.tracks.find((t) => t.id === this.detect.locked.id);
        const progress = clamp((time - this.detect.locked.born) / 1100, 0, 1);
        if (track) {
          const tx = cx + track.r * maxR * Math.cos(track.th);
          const ty = cy + track.r * maxR * Math.sin(track.th);
          context.save();
          context.strokeStyle = '#ff9d66';
          context.lineWidth = 1.2;
          const b = 11;
          [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
            context.beginPath();
            context.moveTo(tx + sx * b, ty + sy * b - sy * 5);
            context.lineTo(tx + sx * b, ty + sy * b);
            context.lineTo(tx + sx * b - sx * 5, ty + sy * b);
            context.stroke();
          });
          context.fillStyle = 'rgba(255,180,120,.92)';
          context.font = '8px "DM Mono", monospace';
          context.fillText('TRACK LOCKED', tx + 14, ty + 3);
          if (progress < 1) {
            context.globalAlpha = 1 - progress;
            context.beginPath();
            context.arc(tx, ty, 10 + progress * 34, 0, TAU);
            context.stroke();
          }
          context.restore();
        }
        if (progress >= 1 && (!track || false)) this.detect.locked = null;
      }

      if (this.pointer.active) {
        context.save();
        context.strokeStyle = 'rgba(216,244,247,.6)';
        context.lineWidth = .8;
        const cs = 9;
        context.beginPath();
        context.moveTo(px - cs, py); context.lineTo(px - 3, py);
        context.moveTo(px + 3, py); context.lineTo(px + cs, py);
        context.moveTo(px, py - cs); context.lineTo(px, py - 3);
        context.moveTo(px, py + 3); context.lineTo(px, py + cs);
        context.stroke();
        context.fillStyle = 'rgba(216,244,247,.9)';
        context.fillRect(px - 1, py - 1, 2, 2);
        context.restore();
      }
    }

    /* ---------- Probe overlay (features + constellation) ---------- */

    drawSemanticProbe(time) {
      if (this.mode !== 'features' && this.mode !== 'constellation') return;
      const context = this.context;
      const x = this.probe.x;
      const y = this.probe.y;
      const radius = this.probe.radius;
      const focusKind = this.probe.focus?.kind || 'q16';
      const color = this.semanticColors[focusKind] || '#9ce7ef';

      context.save();
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius * 1.12);
      gradient.addColorStop(0, `${color}14`);
      gradient.addColorStop(.62, `${color}08`);
      gradient.addColorStop(1, `${color}00`);
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, radius * 1.12, 0, TAU);
      context.fill();

      context.strokeStyle = `${color}88`;
      context.lineWidth = .85;
      const rotation = reducedMotion ? 0 : time * .00018;
      [[-.12, .18], [.42, .14], [.92, .16], [1.42, .13]].forEach(([start, length]) => {
        context.beginPath();
        context.arc(x, y, radius, rotation + start * Math.PI, rotation + (start + length) * Math.PI);
        context.stroke();
      });

      context.strokeStyle = `${color}c0`;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(x - 13, y); context.lineTo(x - 7, y);
      context.moveTo(x + 7, y); context.lineTo(x + 13, y);
      context.moveTo(x, y - 13); context.lineTo(x, y - 7);
      context.moveTo(x, y + 7); context.lineTo(x, y + 13);
      context.stroke();
      context.fillStyle = `${color}e6`;
      context.fillRect(x - 1, y - 1, 2, 2);

      this.probe.pulses.forEach((pulse) => {
        const progress = clamp((time - pulse.born) / 1150, 0, 1);
        context.globalAlpha = (1 - progress) * .58;
        context.strokeStyle = color;
        context.lineWidth = .8;
        context.beginPath();
        context.arc(pulse.x * this.width, pulse.y * this.height, mix(radius * .45, radius * 2.25, progress), 0, TAU);
        context.stroke();
      });

      context.globalAlpha = 1;
      if (!this.mobile && this.probe.focus) {
        const labels = this.semanticLabels[focusKind] || [focusKind.toUpperCase(), 'signal class'];
        const labelWidth = 152;
        const labelHeight = 38;
        const labelX = clamp(x + radius * .68, 12, this.width - labelWidth - 12);
        const labelY = clamp(y - radius * .62, 70, this.height - labelHeight - 42);
        context.strokeStyle = `${color}58`;
        context.beginPath();
        context.moveTo(x + radius * .48, y - radius * .34);
        context.lineTo(labelX - 6, labelY + labelHeight * .5);
        context.stroke();
        context.fillStyle = 'rgba(5,11,16,.8)';
        context.strokeStyle = `${color}52`;
        context.lineWidth = .7;
        context.beginPath();
        context.roundRect(labelX, labelY, labelWidth, labelHeight, 9);
        context.fill();
        context.stroke();
        context.fillStyle = color;
        context.font = '8px "DM Mono", monospace';
        context.fillText(labels[0], labelX + 12, labelY + 15);
        context.fillStyle = 'rgba(188,204,218,.68)';
        context.font = '7px "DM Mono", monospace';
        context.fillText(labels[1].toUpperCase(), labelX + 12, labelY + 28);
      }
      context.restore();
    }

    /* ---------- Frame loop ---------- */

    draw(time = 0, force = false) {
      this.frame = 0;
      if (!force && (!this.visible || !this.documentVisible)) return;
      if (!force && time - this.lastTime < 30) {
        this.frame = requestAnimationFrame((next) => this.draw(next));
        return;
      }
      this.lastTime = time;
      this.updateModeInteraction(time);
      this.updateProbe(time);
      this.drawBackground(time);
      if (this.mode === 'features') this.drawFeatures(time);
      else if (this.mode === 'constellation') this.drawConstellation(time);
      else if (this.mode === 'spectrum') this.drawSpectrum(time);
      else if (this.mode === 'detection') this.drawDetection(time);
      this.drawFog();
      this.drawSemanticProbe(time);
      if (!reducedMotion && this.visible && this.documentVisible) {
        this.frame = requestAnimationFrame((next) => this.draw(next));
      }
    }
  }

  window.SpatialWorld = SpatialWorld;
  document.querySelectorAll('[data-spatial-world]').forEach((canvas) => {
    const world = new SpatialWorld(canvas);
    canvas.spatialWorld = world;
  });
})();
