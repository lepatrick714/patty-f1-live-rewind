'use client';

import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CheckIcon } from '@/app/assets/Icons';

type CheckboxSize = 'default' | 'sm' | 'lg';

const useCheckboxVariants = (
  size: CheckboxSize = 'default',
  className?: string
) => {
  const baseClasses =
    'peer inline-flex items-center justify-center shrink-0 rounded-sm border border-primary ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer';

  const sizeClasses = {
    default: 'h-4 w-4',
    sm: 'h-3 w-3',
    lg: 'h-5 w-5',
  };

  const checkedClasses =
    'data-[checked=true]:bg-primary data-[checked=true]:text-primary-foreground data-[checked=true]:border-primary';
  const uncheckedClasses =
    'data-[checked=false]:bg-background data-[checked=false]:border-border hover:data-[checked=false]:border-primary/50';

  return clsx(
    baseClasses,
    sizeClasses[size],
    checkedClasses,
    uncheckedClasses,
    className
  );
};

interface CheckboxProps
  extends Omit<React.ComponentProps<'input'>, 'size' | 'type'> {
  size?: CheckboxSize;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      size = 'default',
      checked,
      onCheckedChange,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(false);
    const isControlled = checked !== undefined;
    const checkedValue = isControlled ? checked : internalChecked;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = event.target.checked;

      if (!isControlled) {
        setInternalChecked(newChecked);
      }

      onCheckedChange?.(newChecked);
      onChange?.(event);
    };

    const iconSize = size === 'sm' ? 10 : size === 'lg' ? 16 : 12;

    return (
      <div className="relative">
        <input
          ref={ref}
          type="checkbox"
          className="absolute inset-0 cursor-pointer opacity-0"
          checked={checkedValue}
          onChange={handleChange}
          {...props}
        />
        <div
          data-slot="checkbox"
          data-checked={checkedValue}
          className={twMerge(useCheckboxVariants(size, className))}
        >
          {checkedValue && (
            <CheckIcon className="text-current" size={iconSize} />
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
