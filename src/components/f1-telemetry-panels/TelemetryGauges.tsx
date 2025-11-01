interface SpeedGaugeProps {
  speed: number;
  maxSpeed?: number;
  color?: string;
}

export const SpeedGauge = ({ speed, maxSpeed = 350, color = "#3B82F6" }: SpeedGaugeProps) => {
  const percentage = Math.min(speed / maxSpeed, 1);
  const angle = percentage * 270 - 135; // -135 to +135 degrees (270 degree arc)
  
  // Color gradient from green to red based on speed with more vibrant colors
  const getSpeedColor = (percentage: number) => {
    if (percentage < 0.1) return "#00FF88"; // Bright green - very slow
    if (percentage < 0.2) return "#10B981"; // Green - slow
    if (percentage < 0.35) return "#22C55E"; // Light green - moderate slow
    if (percentage < 0.5) return "#84CC16"; // Lime - moderate
    if (percentage < 0.65) return "#EAB308"; // Yellow - getting fast
    if (percentage < 0.8) return "#F59E0B"; // Orange - fast
    if (percentage < 0.9) return "#F97316"; // Deep orange - very fast
    if (percentage < 0.95) return "#EF4444"; // Red - extremely fast
    return "#DC143C"; // Crimson - maximum speed
  };
  
  const speedColor = getSpeedColor(percentage);
  
  // Generate tick marks
  const ticks = Array.from({ length: 8 }, (_, i) => {
    const tickAngle = (i / 7) * 270 - 135;
    const tickSpeed = Math.round((i / 7) * maxSpeed);
    return { angle: tickAngle, speed: tickSpeed };
  });
  
  return (
    <div className="relative w-36 h-36">
      {/* Outer glow ring */}
      <div 
        className="absolute inset-0 rounded-full opacity-20 blur-xl transition-all duration-300"
        style={{ backgroundColor: speedColor }}
      />
      
      {/* Main gauge container */}
      <svg className="w-full h-full" viewBox="0 0 160 160">
        <defs>
          {/* Gradient for gauge background */}
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1F2937" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#111827" stopOpacity="0.95" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
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
          
          const startX = 80 + startRadius * Math.cos((tick.angle - 90) * Math.PI / 180);
          const startY = 80 + startRadius * Math.sin((tick.angle - 90) * Math.PI / 180);
          const endX = 80 + endRadius * Math.cos((tick.angle - 90) * Math.PI / 180);
          const endY = 80 + endRadius * Math.sin((tick.angle - 90) * Math.PI / 180);
          
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
                  x={80 + (startRadius - 8) * Math.cos((tick.angle - 90) * Math.PI / 180)}
                  y={80 + (startRadius - 8) * Math.sin((tick.angle - 90) * Math.PI / 180)}
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
          d={`M 80 80 L ${80 + 60 * Math.cos(-135 * Math.PI / 180)} ${80 + 60 * Math.sin(-135 * Math.PI / 180)} A 60 60 0 ${percentage > 0.75 ? 1 : 0} 1 ${80 + 60 * Math.cos((angle - 90) * Math.PI / 180)} ${80 + 60 * Math.sin((angle - 90) * Math.PI / 180)} Z`}
          fill={speedColor}
          opacity="0.3"
          className="transition-all duration-300 ease-out"
        />
        
        {/* Active arc line */}
        <path
          d={`M ${80 + 60 * Math.cos(-135 * Math.PI / 180)} ${80 + 60 * Math.sin(-135 * Math.PI / 180)} A 60 60 0 ${percentage > 0.75 ? 1 : 0} 1 ${80 + 60 * Math.cos((angle - 90) * Math.PI / 180)} ${80 + 60 * Math.sin((angle - 90) * Math.PI / 180)}`}
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-800 border-2 border-gray-600 z-10" />
          
          {/* Needle line */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 origin-bottom"
            style={{ 
              width: '3px',
              height: '50px',
              marginTop: '-50px',
              background: `linear-gradient(to bottom, ${speedColor}, transparent)`,
              boxShadow: `0 0 8px ${speedColor}`,
              borderRadius: '2px'
            }}
          />
          
          {/* Needle tip */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
            style={{ 
              marginTop: '-51px',
              backgroundColor: speedColor,
              boxShadow: `0 0 6px ${speedColor}`
            }}
          />
        </div>
      </div>
      
      {/* Center Display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center mt-2">
          <div 
            className="text-3xl font-black font-mono tracking-tighter transition-all duration-300"
            style={{ 
              color: speedColor,
              textShadow: `0 0 20px ${speedColor}40`
            }}
          >
            {speed}
          </div>
          <div className="text-[10px] font-semibold text-gray-500 tracking-wider mt-0.5">
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

export const RPMGauge = ({ rpm, maxRPM = 15000, color = "#EF4444" }: RPMGaugeProps) => {
  const percentage = Math.min(rpm / maxRPM, 1);
  const angle = percentage * 270 - 135;
  
  const getRPMColor = (percentage: number) => {
    if (percentage < 0.4) return "#10B981";
    if (percentage < 0.6) return "#F59E0B";
    if (percentage < 0.8) return "#F97316";
    return "#DC2626";
  };
  
  const redZoneStart = 0.8;
  const isInRedZone = percentage > redZoneStart;
  const rpmColor = getRPMColor(percentage);
  
  const ticks = Array.from({ length: 8 }, (_, i) => {
    const tickAngle = (i / 7) * 270 - 135;
    const tickRPM = Math.round((i / 7) * maxRPM / 1000);
    const inRedZone = (i / 7) >= redZoneStart;
    return { angle: tickAngle, rpm: tickRPM, inRedZone };
  });
  
  return (
    <div className="relative w-36 h-36">
      {/* Outer glow */}
      <div 
        className={`absolute inset-0 rounded-full opacity-20 blur-xl transition-all duration-300 ${
          isInRedZone ? 'animate-pulse' : ''
        }`}
        style={{ backgroundColor: rpmColor }}
      />
      
      <svg className="w-full h-full" viewBox="0 0 160 160">
        <defs>
          <linearGradient id="rpmGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1F2937" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#111827" stopOpacity="0.95" />
          </linearGradient>
          
          <filter id="rpmGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
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
          
          const startX = 80 + startRadius * Math.cos((tick.angle - 90) * Math.PI / 180);
          const startY = 80 + startRadius * Math.sin((tick.angle - 90) * Math.PI / 180);
          const endX = 80 + endRadius * Math.cos((tick.angle - 90) * Math.PI / 180);
          const endY = 80 + endRadius * Math.sin((tick.angle - 90) * Math.PI / 180);
          
          return (
            <g key={i}>
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={tick.inRedZone ? "#DC2626" : "#4B5563"}
                strokeWidth={tickWidth}
                strokeLinecap="round"
              />
              {isMainTick && (
                <text
                  x={80 + (startRadius - 8) * Math.cos((tick.angle - 90) * Math.PI / 180)}
                  y={80 + (startRadius - 8) * Math.sin((tick.angle - 90) * Math.PI / 180)}
                  fill={tick.inRedZone ? "#DC2626" : "#6B7280"}
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
          d={`M ${80 + 68 * Math.cos((redZoneStart * 270 - 135 - 90) * Math.PI / 180)} ${80 + 68 * Math.sin((redZoneStart * 270 - 135 - 90) * Math.PI / 180)} A 68 68 0 0 1 ${80 + 68 * Math.cos((135 - 90) * Math.PI / 180)} ${80 + 68 * Math.sin((135 - 90) * Math.PI / 180)}`}
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
          d={`M 80 80 L ${80 + 60 * Math.cos(-135 * Math.PI / 180)} ${80 + 60 * Math.sin(-135 * Math.PI / 180)} A 60 60 0 ${percentage > 0.75 ? 1 : 0} 1 ${80 + 60 * Math.cos((angle - 90) * Math.PI / 180)} ${80 + 60 * Math.sin((angle - 90) * Math.PI / 180)} Z`}
          fill={rpmColor}
          opacity="0.3"
          className="transition-all duration-300 ease-out"
        />
        
        <path
          d={`M ${80 + 60 * Math.cos(-135 * Math.PI / 180)} ${80 + 60 * Math.sin(-135 * Math.PI / 180)} A 60 60 0 ${percentage > 0.75 ? 1 : 0} 1 ${80 + 60 * Math.cos((angle - 90) * Math.PI / 180)} ${80 + 60 * Math.sin((angle - 90) * Math.PI / 180)}`}
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-800 border-2 border-gray-600 z-10" />
          
          <div 
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 origin-bottom ${
              isInRedZone ? 'animate-pulse' : ''
            }`}
            style={{ 
              width: '3px',
              height: '50px',
              marginTop: '-50px',
              background: `linear-gradient(to bottom, ${rpmColor}, transparent)`,
              boxShadow: `0 0 8px ${rpmColor}`,
              borderRadius: '2px'
            }}
          />
          
          <div 
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
              isInRedZone ? 'animate-pulse' : ''
            }`}
            style={{ 
              marginTop: '-51px',
              backgroundColor: rpmColor,
              boxShadow: `0 0 6px ${rpmColor}`
            }}
          />
        </div>
      </div>
      
      {/* Center Display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center mt-2">
          <div 
            className={`text-3xl font-black font-mono tracking-tighter transition-all duration-300 ${
              isInRedZone ? 'animate-pulse' : ''
            }`}
            style={{ 
              color: rpmColor,
              textShadow: `0 0 20px ${rpmColor}40`
            }}
          >
            {rpm}
          </div>
          <div className="text-[10px] font-semibold text-gray-500 tracking-wider mt-0.5">
            RPM
          </div>
        </div>
      </div>
    </div>
  );
};

interface GearDisplayProps {
  gear: number;
  color?: string;
}

export const GearDisplay = ({ gear, color = "#10B981" }: GearDisplayProps) => {
  const gears = [8, 7, 6, 5, 4, 3, 2, 1, 0, -1];
  
  return (
    <div className="relative">
      {/* Outer glow */}
      <div 
        className="absolute inset-0 rounded-xl opacity-20 blur-2xl transition-all duration-300"
        style={{ backgroundColor: color }}
      />
      
      <div className="relative w-24 h-40 bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl border-2 border-gray-800 overflow-hidden shadow-2xl">
        {/* Top shine effect */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        
        {/* Gear indicators */}
        <div className="absolute inset-0 flex flex-col items-center justify-center py-3 gap-1">
          {gears.map((g) => {
            const isActive = gear === g;
            return (
              <div
                key={g}
                className={`relative w-16 h-6 rounded-md flex items-center justify-center text-sm font-black transition-all duration-200 ${
                  isActive 
                    ? 'scale-110' 
                    : 'scale-90 opacity-40'
                }`}
              >
                {/* Background glow for active gear */}
                {isActive && (
                  <div 
                    className="absolute inset-0 rounded-md blur-sm"
                    style={{ 
                      backgroundColor: color,
                      opacity: 0.6
                    }}
                  />
                )}
                
                {/* Gear label */}
                <span
                  className={`relative z-10 transition-all duration-200 ${
                    isActive ? 'text-white' : 'text-gray-600'
                  }`}
                  style={{
                    textShadow: isActive ? `0 0 10px ${color}` : 'none'
                  }}
                >
                  {g === -1 ? 'R' : g === 0 ? 'N' : g}
                </span>
                
                {/* Active indicator border */}
                {isActive && (
                  <div 
                    className="absolute inset-0 rounded-md border-2 transition-all duration-200"
                    style={{ 
                      borderColor: color,
                      boxShadow: `0 0 12px ${color}, inset 0 0 8px ${color}40`
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Side accent lines */}
        <div className="absolute left-1 top-3 bottom-3 w-0.5 bg-gradient-to-b from-transparent via-gray-700 to-transparent rounded-full" />
        <div className="absolute right-1 top-3 bottom-3 w-0.5 bg-gradient-to-b from-transparent via-gray-700 to-transparent rounded-full" />
      </div>
      
      {/* Current gear display below */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center min-w-[80px]">
        <div 
          className="text-4xl font-black tracking-tight transition-all duration-200"
          style={{ 
            color: color,
            textShadow: `0 0 20px ${color}60`
          }}
        >
          {gear === -1 ? 'R' : gear === 0 ? 'N' : gear}
        </div>
        <div className="text-[10px] font-semibold text-gray-500 tracking-wider mt-1">
          GEAR
        </div>
      </div>
    </div>
  );
};

interface ThrottleBrakeBarProps {
  throttle: number;
  brake: number;
}

export const ThrottleBrakeBar = ({ throttle, brake }: ThrottleBrakeBarProps) => {
  return (
    <div className="space-y-3">
      {/* Throttle */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-gray-400 tracking-wider">THROTTLE</span>
          <span className="text-sm font-black font-mono text-green-400">{throttle}%</span>
        </div>
        <div className="relative h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-950 to-green-900 opacity-20" />
          
          {/* Progress bar */}
          <div 
            className="relative h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-200 ease-out rounded-full"
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
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-gray-400 tracking-wider">BRAKE</span>
          <span className="text-sm font-black font-mono text-red-400">{brake}%</span>
        </div>
        <div className="relative h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-950 to-red-900 opacity-20" />
          
          {/* Progress bar */}
          <div 
            className="relative h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-200 ease-out rounded-full"
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

export const DRSToggle = ({ isOpen, color = "#10B981" }: DRSToggleProps) => {
  return (
    <div className="flex flex-col items-center">
      {/* Label */}
      <div className="text-xs font-bold text-gray-400 tracking-wider mb-2">DRS</div>
      
      {/* DRS Wing Container */}
      <div className="relative">
        {/* Outer glow when open */}
        {isOpen && (
          <div 
            className="absolute inset-0 rounded-xl blur-xl opacity-40 animate-pulse"
            style={{ backgroundColor: color }}
          />
        )}
        
        <div className={`relative w-20 h-16 bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl border-2 transition-all duration-300 ${
          isOpen ? 'shadow-lg' : 'shadow-md'
        }`}
        style={{ 
          borderColor: isOpen ? color : '#374151',
          boxShadow: isOpen ? `0 0 20px ${color}40` : undefined
        }}>
          {/* Wing visualization */}
          <div className="absolute inset-0 flex items-center justify-center p-3">
            <div className="relative w-full h-8">
              {/* Upper flap */}
              <div 
                className={`absolute w-full h-1.5 rounded-sm transition-all duration-300 ${
                  isOpen ? 'bg-gradient-to-r' : 'bg-gray-700'
                }`}
                style={{
                  top: isOpen ? '0px' : '8px',
                  transform: isOpen ? 'rotate(-15deg)' : 'rotate(0deg)',
                  transformOrigin: 'center',
                  background: isOpen ? `linear-gradient(90deg, ${color}, ${color}dd)` : undefined,
                  boxShadow: isOpen ? `0 0 8px ${color}80` : undefined
                }}
              >
                {/* Shine effect */}
                {isOpen && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-sm" />
                )}
              </div>
              
              {/* Lower flap */}
              <div 
                className={`absolute w-full h-1.5 rounded-sm transition-all duration-300 ${
                  isOpen ? 'bg-gradient-to-r' : 'bg-gray-700'
                }`}
                style={{
                  bottom: isOpen ? '0px' : '8px',
                  transform: isOpen ? 'rotate(15deg)' : 'rotate(0deg)',
                  transformOrigin: 'center',
                  background: isOpen ? `linear-gradient(90deg, ${color}, ${color}dd)` : undefined,
                  boxShadow: isOpen ? `0 0 8px ${color}80` : undefined
                }}
              >
                {/* Shine effect */}
                {isOpen && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-sm" />
                )}
              </div>
              
              {/* Center support line */}
              <div className="absolute top-1/2 left-0 w-full h-px bg-gray-600 transform -translate-y-1/2" />
              
              {/* Connection points */}
              <div className="absolute top-1/2 left-2 w-1 h-1 bg-gray-500 rounded-full transform -translate-y-1/2" />
              <div className="absolute top-1/2 right-2 w-1 h-1 bg-gray-500 rounded-full transform -translate-y-1/2" />
            </div>
          </div>
          
          {/* Status LED */}
          <div 
            className={`absolute top-1 right-1 w-2 h-2 rounded-full transition-all duration-300 ${
              isOpen ? 'animate-pulse' : ''
            }`}
            style={{
              backgroundColor: isOpen ? color : '#4B5563',
              boxShadow: isOpen ? `0 0 8px ${color}` : 'none'
            }}
          />
        </div>
      </div>
      
      {/* Status text */}
      <div 
        className={`text-xs font-black tracking-wider mt-2 transition-all duration-300 ${
          isOpen ? 'animate-pulse' : ''
        }`}
        style={{ 
          color: isOpen ? color : '#6B7280',
          textShadow: isOpen ? `0 0 10px ${color}60` : 'none'
        }}
      >
        {isOpen ? 'OPEN' : 'CLOSED'}
      </div>
    </div>
  );
};