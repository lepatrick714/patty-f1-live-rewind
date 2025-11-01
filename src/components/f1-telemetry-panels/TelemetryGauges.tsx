interface SpeedGaugeProps {
  speed: number;
  maxSpeed?: number;
  color?: string;
}

export const SpeedGauge = ({
  speed,
  maxSpeed = 350,
  color = '#3B82F6',
}: SpeedGaugeProps) => {
  const percentage = Math.min(speed / maxSpeed, 1);
  const angle = percentage * 270 - 135; // -135 to +135 degrees (270 degree arc)

  // Color gradient from green to red based on speed with more vibrant colors
  const getSpeedColor = (percentage: number) => {
    if (percentage < 0.1) return '#00FF88'; // Bright green - very slow
    if (percentage < 0.2) return '#10B981'; // Green - slow
    if (percentage < 0.35) return '#22C55E'; // Light green - moderate slow
    if (percentage < 0.5) return '#84CC16'; // Lime - moderate
    if (percentage < 0.65) return '#EAB308'; // Yellow - getting fast
    if (percentage < 0.8) return '#F59E0B'; // Orange - fast
    if (percentage < 0.9) return '#F97316'; // Deep orange - very fast
    if (percentage < 0.95) return '#EF4444'; // Red - extremely fast
    return '#DC143C'; // Crimson - maximum speed
  };

  const speedColor = getSpeedColor(percentage);

  // Generate tick marks
  const ticks = Array.from({ length: 8 }, (_, i) => {
    const tickAngle = (i / 7) * 270 - 135;
    const tickSpeed = Math.round((i / 7) * maxSpeed);
    return { angle: tickAngle, speed: tickSpeed };
  });

  return (
    <div className="relative h-36 w-36">
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full opacity-20 blur-xl transition-all duration-300"
        style={{ backgroundColor: speedColor }}
      />

      {/* Main gauge container */}
      <svg className="h-full w-full" viewBox="0 0 160 160">
        <defs>
          {/* Gradient for gauge background */}
          <linearGradient
            id="gaugeGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#1F2937" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#111827" stopOpacity="0.95" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          cx="80"
          cy="80"
          r="70"
          fill="url(#gaugeGradient)"
          stroke="#374151"
          strokeWidth="1"
        />

        {/* Tick marks */}
        {ticks.map((tick, i) => {
          const isMainTick = i % 2 === 0;
          const tickLength = isMainTick ? 12 : 6;
          const tickWidth = isMainTick ? 2 : 1;
          const startRadius = 70 - tickLength;
          const endRadius = 70;

          const startX =
            80 + startRadius * Math.cos(((tick.angle - 90) * Math.PI) / 180);
          const startY =
            80 + startRadius * Math.sin(((tick.angle - 90) * Math.PI) / 180);
          const endX =
            80 + endRadius * Math.cos(((tick.angle - 90) * Math.PI) / 180);
          const endY =
            80 + endRadius * Math.sin(((tick.angle - 90) * Math.PI) / 180);

          return (
            <g key={i}>
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="#4B5563"
                strokeWidth={tickWidth}
                strokeLinecap="round"
              />
              {isMainTick && (
                <text
                  x={
                    80 +
                    (startRadius - 8) *
                      Math.cos(((tick.angle - 90) * Math.PI) / 180)
                  }
                  y={
                    80 +
                    (startRadius - 8) *
                      Math.sin(((tick.angle - 90) * Math.PI) / 180)
                  }
                  fill="#6B7280"
                  fontSize="8"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-mono font-bold"
                >
                  {tick.speed}
                </text>
              )}
            </g>
          );
        })}

        {/* Progress arc background */}
        <path
          d="M 80 80 L 22.5 56.5 A 60 60 0 1 1 137.5 56.5 Z"
          fill="none"
          stroke="#1F2937"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Animated progress arc */}
        <path
          d={`M 80 80 L ${80 + 60 * Math.cos((-135 * Math.PI) / 180)} ${80 + 60 * Math.sin((-135 * Math.PI) / 180)} A 60 60 0 ${percentage > 0.75 ? 1 : 0} 1 ${80 + 60 * Math.cos(((angle - 90) * Math.PI) / 180)} ${80 + 60 * Math.sin(((angle - 90) * Math.PI) / 180)} Z`}
          fill={speedColor}
          opacity="0.3"
          className="transition-all duration-300 ease-out"
        />

        {/* Active arc line */}
        <path
          d={`M ${80 + 60 * Math.cos((-135 * Math.PI) / 180)} ${80 + 60 * Math.sin((-135 * Math.PI) / 180)} A 60 60 0 ${percentage > 0.75 ? 1 : 0} 1 ${80 + 60 * Math.cos(((angle - 90) * Math.PI) / 180)} ${80 + 60 * Math.sin(((angle - 90) * Math.PI) / 180)}`}
          fill="none"
          stroke={speedColor}
          strokeWidth="6"
          strokeLinecap="round"
          filter="url(#glow)"
          className="transition-all duration-300 ease-out"
        />

        {/* Center circle */}
        <circle
          cx="80"
          cy="80"
          r="42"
          fill="#111827"
          stroke="#374151"
          strokeWidth="2"
        />
      </svg>

      {/* Needle - positioned on top of SVG */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="absolute transition-transform duration-300 ease-out"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          {/* Needle base circle */}
          <div className="absolute left-1/2 top-1/2 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gray-600 bg-gray-800" />

          {/* Needle line */}
          <div
            className="absolute left-1/2 top-1/2 origin-bottom -translate-x-1/2"
            style={{
              width: '3px',
              height: '50px',
              marginTop: '-50px',
              background: `linear-gradient(to bottom, ${speedColor}, transparent)`,
              boxShadow: `0 0 8px ${speedColor}`,
              borderRadius: '2px',
            }}
          />

          {/* Needle tip */}
          <div
            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
            style={{
              marginTop: '-51px',
              backgroundColor: speedColor,
              boxShadow: `0 0 6px ${speedColor}`,
            }}
          />
        </div>
      </div>

      {/* Center Display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="mt-2 text-center">
          <div
            className="font-mono text-3xl font-black tracking-tighter transition-all duration-300"
            style={{
              color: speedColor,
              textShadow: `0 0 20px ${speedColor}40`,
            }}
          >
            {speed}
          </div>
          <div className="mt-0.5 text-[10px] font-semibold tracking-wider text-gray-500">
            KM/H
          </div>
        </div>
      </div>
    </div>
  );
};

interface RPMGaugeProps {
  rpm: number;
  maxRPM?: number;
  color?: string;
}

export const RPMGauge = ({
  rpm,
  maxRPM = 15000,
  color = '#EF4444',
}: RPMGaugeProps) => {
  const percentage = Math.min(rpm / maxRPM, 1);
  const angle = percentage * 270 - 135;

  const getRPMColor = (percentage: number) => {
    if (percentage < 0.4) return '#10B981';
    if (percentage < 0.6) return '#F59E0B';
    if (percentage < 0.8) return '#F97316';
    return '#DC2626';
  };

  const redZoneStart = 0.8;
  const isInRedZone = percentage > redZoneStart;
  const rpmColor = getRPMColor(percentage);

  const ticks = Array.from({ length: 8 }, (_, i) => {
    const tickAngle = (i / 7) * 270 - 135;
    const tickRPM = Math.round(((i / 7) * maxRPM) / 1000);
    const inRedZone = i / 7 >= redZoneStart;
    return { angle: tickAngle, rpm: tickRPM, inRedZone };
  });

  return (
    <div className="relative h-36 w-36">
      {/* Outer glow */}
      <div
        className={`absolute inset-0 rounded-full opacity-20 blur-xl transition-all duration-300 ${
          isInRedZone ? 'animate-pulse' : ''
        }`}
        style={{ backgroundColor: rpmColor }}
      />

      <svg className="h-full w-full" viewBox="0 0 160 160">
        <defs>
          <linearGradient
            id="rpmGaugeGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#1F2937" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#111827" stopOpacity="0.95" />
          </linearGradient>

          <filter id="rpmGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx="80"
          cy="80"
          r="70"
          fill="url(#rpmGaugeGradient)"
          stroke="#374151"
          strokeWidth="1"
        />

        {/* Tick marks with red zone */}
        {ticks.map((tick, i) => {
          const isMainTick = i % 2 === 0;
          const tickLength = isMainTick ? 12 : 6;
          const tickWidth = isMainTick ? 2 : 1;
          const startRadius = 70 - tickLength;
          const endRadius = 70;

          const startX =
            80 + startRadius * Math.cos(((tick.angle - 90) * Math.PI) / 180);
          const startY =
            80 + startRadius * Math.sin(((tick.angle - 90) * Math.PI) / 180);
          const endX =
            80 + endRadius * Math.cos(((tick.angle - 90) * Math.PI) / 180);
          const endY =
            80 + endRadius * Math.sin(((tick.angle - 90) * Math.PI) / 180);

          return (
            <g key={i}>
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={tick.inRedZone ? '#DC2626' : '#4B5563'}
                strokeWidth={tickWidth}
                strokeLinecap="round"
              />
              {isMainTick && (
                <text
                  x={
                    80 +
                    (startRadius - 8) *
                      Math.cos(((tick.angle - 90) * Math.PI) / 180)
                  }
                  y={
                    80 +
                    (startRadius - 8) *
                      Math.sin(((tick.angle - 90) * Math.PI) / 180)
                  }
                  fill={tick.inRedZone ? '#DC2626' : '#6B7280'}
                  fontSize="8"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-mono font-bold"
                >
                  {tick.rpm}
                </text>
              )}
            </g>
          );
        })}

        {/* Red zone arc indicator */}
        <path
          d={`M ${80 + 68 * Math.cos(((redZoneStart * 270 - 135 - 90) * Math.PI) / 180)} ${80 + 68 * Math.sin(((redZoneStart * 270 - 135 - 90) * Math.PI) / 180)} A 68 68 0 0 1 ${80 + 68 * Math.cos(((135 - 90) * Math.PI) / 180)} ${80 + 68 * Math.sin(((135 - 90) * Math.PI) / 180)}`}
          fill="none"
          stroke="#DC2626"
          strokeWidth="3"
          opacity="0.3"
          strokeLinecap="round"
        />

        <path
          d="M 80 80 L 22.5 56.5 A 60 60 0 1 1 137.5 56.5 Z"
          fill="none"
          stroke="#1F2937"
          strokeWidth="8"
          strokeLinecap="round"
        />

        <path
          d={`M 80 80 L ${80 + 60 * Math.cos((-135 * Math.PI) / 180)} ${80 + 60 * Math.sin((-135 * Math.PI) / 180)} A 60 60 0 ${percentage > 0.75 ? 1 : 0} 1 ${80 + 60 * Math.cos(((angle - 90) * Math.PI) / 180)} ${80 + 60 * Math.sin(((angle - 90) * Math.PI) / 180)} Z`}
          fill={rpmColor}
          opacity="0.3"
          className="transition-all duration-300 ease-out"
        />

        <path
          d={`M ${80 + 60 * Math.cos((-135 * Math.PI) / 180)} ${80 + 60 * Math.sin((-135 * Math.PI) / 180)} A 60 60 0 ${percentage > 0.75 ? 1 : 0} 1 ${80 + 60 * Math.cos(((angle - 90) * Math.PI) / 180)} ${80 + 60 * Math.sin(((angle - 90) * Math.PI) / 180)}`}
          fill="none"
          stroke={rpmColor}
          strokeWidth="6"
          strokeLinecap="round"
          filter="url(#rpmGlow)"
          className="transition-all duration-300 ease-out"
        />

        <circle
          cx="80"
          cy="80"
          r="42"
          fill="#111827"
          stroke="#374151"
          strokeWidth="2"
        />
      </svg>

      {/* Needle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="absolute transition-transform duration-300 ease-out"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div className="absolute left-1/2 top-1/2 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gray-600 bg-gray-800" />

          <div
            className={`absolute left-1/2 top-1/2 origin-bottom -translate-x-1/2 ${
              isInRedZone ? 'animate-pulse' : ''
            }`}
            style={{
              width: '3px',
              height: '50px',
              marginTop: '-50px',
              background: `linear-gradient(to bottom, ${rpmColor}, transparent)`,
              boxShadow: `0 0 8px ${rpmColor}`,
              borderRadius: '2px',
            }}
          />

          <div
            className={`absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${
              isInRedZone ? 'animate-pulse' : ''
            }`}
            style={{
              marginTop: '-51px',
              backgroundColor: rpmColor,
              boxShadow: `0 0 6px ${rpmColor}`,
            }}
          />
        </div>
      </div>

      {/* Center Display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="mt-2 text-center">
          <div
            className={`font-mono text-3xl font-black tracking-tighter transition-all duration-300 ${
              isInRedZone ? 'animate-pulse' : ''
            }`}
            style={{
              color: rpmColor,
              textShadow: `0 0 20px ${rpmColor}40`,
            }}
          >
            {rpm}
          </div>
          <div className="mt-0.5 text-[10px] font-semibold tracking-wider text-gray-500">
            RPM
          </div>
        </div>
      </div>
    </div>
  );
};

interface ThrottleBrakeBarProps {
  throttle: number;
  brake: number;
}

export const ThrottleBrakeBar = ({
  throttle,
  brake,
}: ThrottleBrakeBarProps) => {
  return (
    <div className="space-y-3">
      {/* Throttle */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider text-gray-400">
            THROTTLE
          </span>
          <span className="font-mono text-sm font-black text-green-400">
            {throttle}%
          </span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full border border-gray-800 bg-gray-900">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-950 to-green-900 opacity-20" />

          {/* Progress bar */}
          <div
            className="relative h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-200 ease-out"
            style={{ width: `${throttle}%` }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-green-400 opacity-50 blur-sm" />

            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
          </div>
        </div>
      </div>

      {/* Brake */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider text-gray-400">
            BRAKE
          </span>
          <span className="font-mono text-sm font-black text-red-400">
            {brake}%
          </span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full border border-gray-800 bg-gray-900">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-950 to-red-900 opacity-20" />

          {/* Progress bar */}
          <div
            className="relative h-full rounded-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-200 ease-out"
            style={{ width: `${brake}%` }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-red-400 opacity-50 blur-sm" />

            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface DRSToggleProps {
  isOpen: boolean;
  color?: string;
}

export const DRSToggle = ({ isOpen, color = '#10B981' }: DRSToggleProps) => {
  return (
    <div className="flex flex-col items-center">
      {/* Label */}
      <div className="mb-2 text-xs font-bold tracking-wider text-gray-400">
        DRS
      </div>

      {/* DRS Wing Container */}
      <div className="relative">
        {/* Outer glow when open */}
        {isOpen && (
          <div
            className="absolute inset-0 animate-pulse rounded-xl opacity-40 blur-xl"
            style={{ backgroundColor: color }}
          />
        )}

        <div
          className={`relative h-16 w-20 rounded-xl border-2 bg-gradient-to-b from-gray-900 to-gray-950 transition-all duration-300 ${
            isOpen ? 'shadow-lg' : 'shadow-md'
          }`}
          style={{
            borderColor: isOpen ? color : '#374151',
            boxShadow: isOpen ? `0 0 20px ${color}40` : undefined,
          }}
        >
          {/* Wing visualization */}
          <div className="absolute inset-0 flex items-center justify-center p-3">
            <div className="relative h-8 w-full">
              {/* Upper flap */}
              <div
                className={`absolute h-1.5 w-full rounded-sm transition-all duration-300 ${
                  isOpen ? 'bg-gradient-to-r' : 'bg-gray-700'
                }`}
                style={{
                  top: isOpen ? '0px' : '8px',
                  transform: isOpen ? 'rotate(-15deg)' : 'rotate(0deg)',
                  transformOrigin: 'center',
                  background: isOpen
                    ? `linear-gradient(90deg, ${color}, ${color}dd)`
                    : undefined,
                  boxShadow: isOpen ? `0 0 8px ${color}80` : undefined,
                }}
              >
                {/* Shine effect */}
                {isOpen && (
                  <div className="absolute inset-0 rounded-sm bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                )}
              </div>

              {/* Lower flap */}
              <div
                className={`absolute h-1.5 w-full rounded-sm transition-all duration-300 ${
                  isOpen ? 'bg-gradient-to-r' : 'bg-gray-700'
                }`}
                style={{
                  bottom: isOpen ? '0px' : '8px',
                  transform: isOpen ? 'rotate(15deg)' : 'rotate(0deg)',
                  transformOrigin: 'center',
                  background: isOpen
                    ? `linear-gradient(90deg, ${color}, ${color}dd)`
                    : undefined,
                  boxShadow: isOpen ? `0 0 8px ${color}80` : undefined,
                }}
              >
                {/* Shine effect */}
                {isOpen && (
                  <div className="absolute inset-0 rounded-sm bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                )}
              </div>

              {/* Center support line */}
              <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 transform bg-gray-600" />

              {/* Connection points */}
              <div className="absolute left-2 top-1/2 h-1 w-1 -translate-y-1/2 transform rounded-full bg-gray-500" />
              <div className="absolute right-2 top-1/2 h-1 w-1 -translate-y-1/2 transform rounded-full bg-gray-500" />
            </div>
          </div>

          {/* Status LED */}
          <div
            className={`absolute right-1 top-1 h-2 w-2 rounded-full transition-all duration-300 ${
              isOpen ? 'animate-pulse' : ''
            }`}
            style={{
              backgroundColor: isOpen ? color : '#4B5563',
              boxShadow: isOpen ? `0 0 8px ${color}` : 'none',
            }}
          />
        </div>
      </div>

      {/* Status text */}
      <div
        className={`mt-2 text-xs font-black tracking-wider transition-all duration-300 ${
          isOpen ? 'animate-pulse' : ''
        }`}
        style={{
          color: isOpen ? color : '#6B7280',
          textShadow: isOpen ? `0 0 10px ${color}60` : 'none',
        }}
      >
        {isOpen ? 'OPEN' : 'CLOSED'}
      </div>
    </div>
  );
};
