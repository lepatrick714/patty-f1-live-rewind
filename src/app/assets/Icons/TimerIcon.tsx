import React from 'react';

interface TimerIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * @component @name TimerIcon
 * @description Native SVG Timer icon component based on Lucide design
 *
 * @param {Object} props - SVG props and custom properties
 * @param {string} [props.className] - CSS classes to apply
 * @param {number|string} [props.size] - Icon size (width and height)
 * @returns {JSX.Element} JSX Element
 */
const TimerIcon = React.forwardRef<SVGSVGElement, TimerIconProps>(
  ({ className = '', size = 24, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        <line x1="10" x2="14" y1="2" y2="2" />
        <line x1="12" x2="15" y1="14" y2="11" />
        <circle cx="12" cy="14" r="8" />
      </svg>
    );
  }
);

TimerIcon.displayName = 'TimerIcon';

export default TimerIcon;
