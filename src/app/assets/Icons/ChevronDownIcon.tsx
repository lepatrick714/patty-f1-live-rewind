import React from 'react';

interface ChevronDownIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * @component @name ChevronDownIcon
 * @description Native SVG ChevronDown icon component based on Lucide design
 *
 * @param {Object} props - SVG props and custom properties
 * @param {string} [props.className] - CSS classes to apply
 * @param {number|string} [props.size] - Icon size (width and height)
 * @returns {JSX.Element} JSX Element
 */
const ChevronDownIcon = React.forwardRef<SVGSVGElement, ChevronDownIconProps>(
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
        <path d="m6 9 6 6 6-6" />
      </svg>
    );
  }
);

ChevronDownIcon.displayName = 'ChevronDownIcon';

export default ChevronDownIcon;
