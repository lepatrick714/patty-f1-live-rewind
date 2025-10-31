import React from 'react';

interface CheckIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * @component @name CheckIcon
 * @description Native SVG Check icon component based on Lucide design
 *
 * @param {Object} props - SVG props and custom properties
 * @param {string} [props.className] - CSS classes to apply
 * @param {number|string} [props.size] - Icon size (width and height)
 * @returns {JSX.Element} JSX Element
 */
const CheckIcon = React.forwardRef<SVGSVGElement, CheckIconProps>(
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
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }
);

CheckIcon.displayName = 'CheckIcon';

export default CheckIcon;
