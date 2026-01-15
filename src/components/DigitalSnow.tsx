import { useEffect, useRef } from 'react';

interface Snowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
  char: string;
}

interface DigitalSnowProps {
  active?: boolean;
  highDensity?: boolean;
}

export const DigitalSnow = ({ active = true, highDensity = false }: DigitalSnowProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snowflakesRef = useRef<Snowflake[]>([]);
  const animationRef = useRef<number>();
  const activeRef = useRef(active);
  const highDensityRef = useRef(highDensity);

  // Update refs when props change
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    highDensityRef.current = highDensity;
  }, [highDensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize snowflakes
    const snowChars = ['.', ',', '*', '+', '·', '•'];

    const initSnowflakes = (density: boolean) => {
      const snowflakeCount = density ? 150 : 50;
      const baseSize = density ? 3 : 1;
      const sizeRange = density ? 4 : 2;
      const baseSpeed = density ? 2 : 0.5;
      const speedRange = density ? 2 : 1.5;

      snowflakesRef.current = Array.from({ length: snowflakeCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * sizeRange + baseSize,
        speed: Math.random() * speedRange + baseSpeed,
        char: snowChars[Math.floor(Math.random() * snowChars.length)],
      }));
    };
    initSnowflakes(false);

    // Animation loop
    const animate = () => {
      if (!activeRef.current) {
        // Clear all snowflakes when not active
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isHighDensity = highDensityRef.current;
      const fontSize = isHighDensity ? 16 : 12;
      const opacity = isHighDensity ? 0.6 : 0.4;

      // Draw snowflakes
      ctx.fillStyle = `rgba(0, 255, 0, ${opacity})`;
      ctx.font = `${fontSize}px "VT323", monospace`;

      snowflakesRef.current.forEach((flake) => {
        // Update position
        flake.y += flake.speed;
        flake.x += Math.sin(flake.y * 0.01) * 0.5;

        // Reset if out of screen
        if (flake.y > canvas.height) {
          flake.y = -10;
          flake.x = Math.random() * canvas.width;
        }

        // Draw snowflake
        ctx.font = `${fontSize * flake.size}px "VT323", monospace`;
        ctx.fillText(flake.char, flake.x, flake.y);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Reinitialize snowflakes when highDensity changes
  useEffect(() => {
    if (highDensity && active) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const snowChars = ['.', ',', '*', '+', '·', '•'];
      const snowflakeCount = 150;

      snowflakesRef.current = Array.from({ length: snowflakeCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 3,
        speed: Math.random() * 2 + 2,
        char: snowChars[Math.floor(Math.random() * snowChars.length)],
      }));
    } else if (!highDensity && active) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const snowChars = ['.', ',', '*', '+', '·', '•'];
      const snowflakeCount = 50;

      snowflakesRef.current = Array.from({ length: snowflakeCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 1.5 + 0.5,
        char: snowChars[Math.floor(Math.random() * snowChars.length)],
      }));
    }
  }, [highDensity, active]);

  return (
    <canvas
      ref={canvasRef}
      className="digital-snow"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    />
  );
};
