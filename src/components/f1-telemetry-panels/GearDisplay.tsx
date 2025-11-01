import React from 'react';

interface GearDisplayProps {
  gear: number;
  color?: string;
}

const GearDisplay = ({ gear, color = '#10B981' }: GearDisplayProps) => {
  const [prevGear, setPrevGear] = React.useState(gear);
  const [isShifting, setIsShifting] = React.useState(false);

  React.useEffect(() => {
    if (gear !== prevGear) {
      setIsShifting(true);
      const timer = setTimeout(() => {
        setIsShifting(false);
        setPrevGear(gear);
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [gear, prevGear]);

  const gears = [8, 7, 6, 5, 4, 3, 2, 1, 0, -1];

  return (
    <div className="relative">
      {/* Shift flash effect */}
      {isShifting && (
        <div
          className="absolute inset-0 z-50 animate-pulse rounded-lg"
          style={{
            backgroundColor: color,
            opacity: 0.3,
            animation: 'flash 0.12s ease-out',
          }}
        />
      )}

      {/* Main gearbox container */}
      <div className="relative flex h-[280px] w-24 flex-col overflow-hidden rounded-lg border-2 border-gray-900 bg-black shadow-2xl">
        {/* Top gradient */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/5 to-transparent" />

        {/* Gear ladder */}
        <div className="flex flex-1 flex-col items-center justify-center gap-0">
          {gears.map(g => {
            const isActive = gear === g;
            const distance = Math.abs(gear - g);
            const isVisible = distance <= 2;

            if (!isVisible) return null;

            const opacity = isActive ? 1 : distance === 1 ? 0.6 : 0.3;
            const scale = isActive ? 1 : distance === 1 ? 0.85 : 0.7;
            const fontSize = isActive ? 'text-6xl' : distance === 1 ? 'text-3xl' : 'text-2xl';

            return (
              <div
                key={g}
                className={`relative flex w-full items-center justify-center transition-all duration-150 ${
                  isActive ? 'h-20' : 'h-12'
                }`}
                style={{
                  opacity,
                  transform: `scale(${isShifting && isActive ? 1.15 : scale})`,
                }}
              >
                {/* Active gear highlight */}
                {isActive && (
                  <>
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: color,
                        opacity: 0.2,
                      }}
                    />
                    <div
                      className="absolute inset-0 border-y-2"
                      style={{
                        borderColor: color,
                        boxShadow: `0 0 20px ${color}`,
                      }}
                    />
                  </>
                )}

                {/* Gear number */}
                <span
                  className={`relative z-10 font-black ${fontSize} transition-all duration-150 ${
                    isActive ? 'text-white' : 'text-gray-600'
                  }`}
                  style={{
                    fontFamily: 'monospace',
                    letterSpacing: '-0.05em',
                    textShadow: isActive ? `0 0 20px ${color}` : 'none',
                  }}
                >
                  {g === -1 ? 'R' : g === 0 ? 'N' : g}
                </span>
              </div>
            );
          })}
        </div>

        {/* Side accent lines */}
        <div className="absolute inset-y-0 left-2 w-px bg-gradient-to-b from-transparent via-gray-800 to-transparent" />
        <div className="absolute inset-y-0 right-2 w-px bg-gradient-to-b from-transparent via-gray-800 to-transparent" />
      </div>

      {/* Bottom label */}
      <div className="mt-2 text-center">
        <div className="text-[10px] font-bold tracking-wider text-gray-500">
          GEAR
        </div>
      </div>

      <style>{`
        @keyframes flash {
          0% { opacity: 0.4; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default GearDisplay;