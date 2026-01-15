import { useState, useEffect, useRef } from 'react';

interface PixelRobotProps {
  isActive: boolean;
  onComplete: () => void;
  hasContent: boolean;
  onProgress?: (progress: number) => void;
}

// Pixel art for the robot (8x8 grid)
const ROBOT_FRAMES = [
  // Frame 1: Normal
  [
    '  ███  ',
    ' █████ ',
    '█ ■ ■ █',
    '███████',
    '  █ █  ',
    ' █   █ ',
    '█     █',
    ' █████ ',
  ],
  // Frame 2: Walking/Moving
  [
    '  ███  ',
    ' █████ ',
    '█ ■ ■ █',
    '███████',
    '  █ █  ',
    '█     █',
    '  ███  ',
    ' █████ ',
  ],
  // Frame 3: Eating mouth open
  [
    '  ███  ',
    ' █████ ',
    '█ ■ ■ █',
    '███████',
    '  ███  ',
    ' █   █ ',
    '█     █',
    ' █████ ',
  ],
];

const PIXEL_PORTRAIT = [
  '  ████████  ',
  ' ████████  ',
  '███■██■███',
  '██████████',
  '  ██████  ',
  '   ████   ',
  '  ██████  ',
  ' ███  ███ ',
  '███    ███',
];

interface Particle {
  id: number;
  left: string;
  top: string;
  char: string;
}

export const PixelRobot = ({ isActive, onComplete, hasContent, onProgress }: PixelRobotProps) => {
  const [frame, setFrame] = useState(0);
  const [position, setPosition] = useState(0);
  const [phase, setPhase] = useState<'entering' | 'eating' | 'showing'>('entering');
  const [eatenCount, setEatenCount] = useState(0);
  const [showPortrait, setShowPortrait] = useState(false);
  const [nameOpacity, setNameOpacity] = useState(0);
  const [cleanupPath, setCleanupPath] = useState<number[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Use refs to track timeouts for proper cleanup
  const nameFadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const maxPosition = 100;
  const eatsNeeded = hasContent ? 20 : 5;

  useEffect(() => {
    if (!isActive) {
      // Reset when inactive - clear all timeouts
      if (nameFadeTimeoutRef.current) {
        clearTimeout(nameFadeTimeoutRef.current);
        nameFadeTimeoutRef.current = null;
      }
      if (completeTimeoutRef.current) {
        clearTimeout(completeTimeoutRef.current);
        completeTimeoutRef.current = null;
      }
      setFrame(0);
      setPosition(0);
      setPhase('entering');
      setEatenCount(0);
      setShowPortrait(false);
      setNameOpacity(0);
      setCleanupPath([]);
      setParticles([]);
      return;
    }

    const interval = setInterval(() => {
      if (phase === 'entering') {
        // Animate frames
        setFrame((f) => (f + 1) % 2);

        // Move robot and record cleanup path
        setPosition((p) => {
          const newPos = p + 2;
          if (newPos >= maxPosition) {
            setPhase('eating');
            // Generate particles once when entering eating phase
            setParticles(
              Array.from({ length: 5 }, (_, i) => ({
                id: i,
                left: `${Math.random() * 40 - 20}px`,
                top: `${Math.random() * 20 + 20}px`,
                char: ['█', '▓', '▒', '░', '●'][Math.floor(Math.random() * 5)],
              }))
            );
            onProgress?.(maxPosition);
            return maxPosition;
          }
          // Add position to cleanup path
          setCleanupPath((path) => [...path, newPos]);
          // Report progress for hiding outputs
          onProgress?.(newPos);
          return newPos;
        });
      } else if (phase === 'eating') {
        // Eating animation
        setFrame((f) => (f === 2 ? 0 : 2));

        setEatenCount((e) => {
          if (e >= eatsNeeded) {
            setPhase('showing');
            setShowPortrait(true);
            setParticles([]); // Clear particles after eating
            // Start name fade in - clear previous if exists
            if (nameFadeTimeoutRef.current) {
              clearTimeout(nameFadeTimeoutRef.current);
            }
            nameFadeTimeoutRef.current = setTimeout(() => {
              setNameOpacity(1);
            }, 500);
            // Trigger complete after animation - clear previous if exists
            if (completeTimeoutRef.current) {
              clearTimeout(completeTimeoutRef.current);
            }
            completeTimeoutRef.current = setTimeout(() => {
              onComplete();
            }, 3000);
            return e;
          }
          return e + 1;
        });
      }
    }, 120);

    return () => {
      clearInterval(interval);
      // Clean up timeouts on unmount
      if (nameFadeTimeoutRef.current) {
        clearTimeout(nameFadeTimeoutRef.current);
      }
      if (completeTimeoutRef.current) {
        clearTimeout(completeTimeoutRef.current);
      }
    };
  }, [isActive, phase, eatsNeeded, onComplete, onProgress]);

  if (!isActive) return null;

  const renderPixelArt = (art: string[], scale = 1) => {
    return (
      <div
        className="pixel-art"
        style={{
          display: 'inline-block',
          lineHeight: '1',
          fontSize: `${8 * scale}px`,
          fontFamily: 'monospace',
          whiteSpace: 'pre',
          color: '#00ff00',
          textShadow: '0 0 4px #00ff00',
        }}
      >
        {art.join('\n')}
      </div>
    );
  };

  return (
    <div className="pixel-robot-overlay">
      {/* Cleanup trail - pixels that disappear */}
      {phase === 'entering' && cleanupPath.map((pos, i) => (
        <div
          key={i}
          className="cleanup-trail"
          style={{
            position: 'absolute',
            left: `${pos}%`,
            top: '20%',
            transform: 'translate(-50%, -50%)',
            width: '60px',
            height: '80px',
            background: 'radial-gradient(circle, rgba(0, 255, 0, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
            animation: 'fade-out-trail 0.5s ease-out forwards',
          }}
        />
      ))}

      {/* Robot */}
      <div
        className="pixel-robot"
        style={{
          position: 'absolute',
          left: `${position}%`,
          top: phase === 'showing' ? '50%' : '20%',
          transform: 'translate(-50%, -50%)',
          transition: phase === 'showing' ? 'all 1s ease-out' : 'none',
          opacity: phase === 'showing' ? 0 : 1,
        }}
      >
        {renderPixelArt(ROBOT_FRAMES[frame], 3)}

        {/* Eating particles */}
        {phase === 'eating' && (
          <div className="eating-particles">
            {particles.map((particle, i) => (
              <span
                key={particle.id}
                className="particle"
                style={{
                  position: 'absolute',
                  left: particle.left,
                  top: particle.top,
                  fontSize: '12px',
                  color: '#00ff00',
                  animation: 'float-up 0.4s ease-out forwards',
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                {particle.char}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Screen getting darker as robot eats */}
      {phase !== 'entering' && (
        <div
          className="screen-darken"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: `rgba(0, 0, 0, ${eatenCount / eatsNeeded * 0.85})`,
            pointerEvents: 'none',
            zIndex: 50,
            transition: 'background-color 0.1s',
          }}
        />
      )}

      {/* Final portrait and name */}
      {showPortrait && (
        <div
          className="home-destination"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            animation: 'fade-in-scale 1s ease-out',
          }}
        >
          {renderPixelArt(PIXEL_PORTRAIT, 4)}

          <div
            className="home-name"
            style={{
              fontFamily: '"Perfect DOS VGA 437", "VT323", monospace',
              fontSize: '24px',
              color: '#00ff00',
              textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00',
              textAlign: 'center',
              opacity: nameOpacity,
              transition: 'opacity 1s ease-in',
            }}
          >
            ╔═════════════════════════╗
            ║                         ║
            ║      JINHAO WANG         ║
            ║                         ║
            ╚═════════════════════════╝
          </div>

          <div
            className="home-subtitle"
            style={{
              fontFamily: '"Perfect DOS VGA 437", "VT323", monospace',
              fontSize: '14px',
              color: '#00cc00',
              opacity: nameOpacity,
              transition: 'opacity 1s ease-in 0.3s',
            }}
          >
            &lt; Welcome Home &gt;
          </div>
        </div>
      )}

      <style>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-30px) rotate(180deg);
          }
        }

        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes fade-out-trail {
          0% {
            opacity: 0.6;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(2);
          }
        }

        .pixel-robot-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 200;
        }

        .particle {
          animation: float-up 0.4s ease-out forwards;
        }

        /* Hide outputs being cleaned up */
        .outputs-cleaned {
          opacity: 0.3;
          filter: blur(2px);
          transition: 'all 0.3s ease-out';
        }
      `}</style>
    </div>
  );
};
