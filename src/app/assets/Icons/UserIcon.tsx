import React from 'react';

interface UserIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * @component @name UserIcon
 * @description Native SVG User icon component based on Lucide design
 *
 * @param {Object} props - SVG props and custom properties
 * @param {string} [props.className] - CSS classes to apply
 * @param {number|string} [props.size] - Icon size (width and height)
 * @returns {JSX.Element} JSX Element
 */
const UserIcon = React.forwardRef<SVGSVGElement, UserIconProps>(
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
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
);

UserIcon.displayName = 'UserIcon';

export default UserIcon;
