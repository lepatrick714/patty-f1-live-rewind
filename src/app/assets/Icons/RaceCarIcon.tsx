import React from 'react';

interface RaceCarIconProps {
  className?: string;
  size?: number;
}

export const RaceCarIcon: React.FC<RaceCarIconProps> = ({ className = "", size = 16 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Fire Effects Behind Car */}
      <defs>
        <radialGradient id="fireGradient" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#F7931E" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0.3" />
        </radialGradient>
      </defs>
      
      {/* Fire Trail */}
      <ellipse
        cx="1"
        cy="15"
        rx="2"
        ry="1.5"
        fill="url(#fireGradient)"
        className="animate-pulse"
      />
      <ellipse
        cx="0.5"
        cy="16"
        rx="1.5"
        ry="1"
        fill="#FF6B35"
        opacity="0.4"
        className="animate-pulse"
        style={{ animationDelay: '0.2s' }}
      />
      
      {/* Car Body */}
      <path
        d="M4 14h2.5L8 10h8l1.5 4H20c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2h-1c0 1.1-.9 2-2 2s-2-.9-2-2H9c0 1.1-.9 2-2 2s-2-.9-2-2H4c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2z"
        fill="currentColor"
      />
      {/* Front Wing */}
      <path
        d="M2 14h2v2H2v-2z"
        fill="currentColor"
      />
      {/* Rear Wing */}
      <path
        d="M20 12h2v2h-2v-2z"
        fill="currentColor"
      />
      {/* Driver Helmet */}
      <circle
        cx="12"
        cy="11"
        r="1.5"
        fill="currentColor"
        opacity="0.8"
      />
      {/* Front Wheel */}
      <circle
        cx="7"
        cy="18"
        r="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Rear Wheel */}
      <circle
        cx="17"
        cy="18"
        r="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Speed Lines */}
      <path
        d="M1 8h2M1 10h1.5M1 12h1"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.6"
      />
    </svg>
  );
};