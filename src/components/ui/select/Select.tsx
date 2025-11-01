'use client';

import * as React from 'react';
import { twMerge } from 'tailwind-merge';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@/app/assets/Icons';

// Native Select using HTML select element
interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: 'sm' | 'default';
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, size = 'default', children, ...props }, ref) => {
    return (
      <div className="relative w-full min-w-[8rem] max-w-full">
        <select
          ref={ref}
          data-slot="select"
          data-size={size}
          className={twMerge(
            'border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 shadow-xs w-full cursor-pointer appearance-none truncate rounded-md border bg-transparent px-3 py-2 pr-8 text-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
            size === 'default' && 'h-9',
            size === 'sm' && 'h-8',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
          <ChevronDownIcon className="size-4 opacity-50" />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

// Option component (for HTML select)
interface SelectOptionProps
  extends React.OptionHTMLAttributes<HTMLOptionElement> {
  children: React.ReactNode;
}

const SelectOption = React.forwardRef<HTMLOptionElement, SelectOptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <option
        ref={ref}
        data-slot="select-option"
        className={twMerge('text-sm', className)}
        {...props}
      >
        {children}
      </option>
    );
  }
);

SelectOption.displayName = 'SelectOption';

// OptGroup component (for HTML select)
interface SelectGroupProps
  extends React.OptgroupHTMLAttributes<HTMLOptGroupElement> {
  children: React.ReactNode;
}

const SelectGroup = React.forwardRef<HTMLOptGroupElement, SelectGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <optgroup
        ref={ref}
        data-slot="select-group"
        className={twMerge('text-muted-foreground font-medium', className)}
        {...props}
      >
        {children}
      </optgroup>
    );
  }
);

SelectGroup.displayName = 'SelectGroup';

// Custom Dropdown Select (for more advanced UI)
interface CustomSelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'default';
  className?: string;
  children: React.ReactNode;
}

function CustomSelect({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  placeholder = 'Select an option...',
  disabled = false,
  size = 'default',
  className,
  children,
}: CustomSelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState('');

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle value change
  const handleValueChange = React.useCallback(
    (newValue: string, label: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      setSelectedLabel(label);
      onValueChange?.(newValue);
      setIsOpen(false);
    },
    [isControlled, onValueChange]
  );

  // Extract options from children
  const options = React.useMemo(() => {
    const opts: Array<{ value: string; label: string; disabled?: boolean }> =
      [];

    React.Children.forEach(children, child => {
      if (
        React.isValidElement<CustomSelectItemProps>(child) &&
        child.type === CustomSelectItem
      ) {
        opts.push({
          value: child.props.value,
          label: child.props.children as string,
          disabled: child.props.disabled,
        });
      }
    });

    return opts;
  }, [children]);

  // Update selected label when value changes
  React.useEffect(() => {
    const option = options.find(opt => opt.value === value);
    if (option) {
      setSelectedLabel(option.label);
    } else {
      setSelectedLabel('');
    }
  }, [value, options]);

  return (
    <div ref={dropdownRef} className="relative w-full min-w-[8rem] max-w-full">
      <button
        ref={triggerRef}
        type="button"
        data-slot="select-trigger"
        data-size={size}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={twMerge(
          'border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 shadow-xs flex w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
          size === 'default' && 'h-9',
          size === 'sm' && 'h-8',
          className
        )}
      >
        <span
          className={twMerge(
            'min-w-0 flex-1 truncate text-left',
            !selectedLabel && 'text-muted-foreground'
          )}
        >
          {selectedLabel || placeholder}
        </span>
        <ChevronDownIcon
          className={twMerge(
            'ml-2 size-4 flex-shrink-0 opacity-50 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div
          data-slot="select-content"
          className="bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 absolute left-0 right-0 top-full z-50 mt-1 max-h-60 min-w-full overflow-y-auto rounded-md border shadow-md"
        >
          <div className="p-1">
            {options.map(option => (
              <button
                key={option.value}
                type="button"
                data-slot="select-item"
                disabled={option.disabled}
                onClick={() =>
                  !option.disabled &&
                  handleValueChange(option.value, option.label)
                }
                className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none disabled:pointer-events-none disabled:opacity-50"
              >
                <span className="flex-1 truncate text-left">
                  {option.label}
                </span>
                {value === option.value && (
                  <span className="absolute right-2 flex size-3.5 flex-shrink-0 items-center justify-center">
                    <CheckIcon className="size-4" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Custom Select Item (for CustomSelect)
interface CustomSelectItemProps {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
}

function CustomSelectItem({
  value,
  disabled,
  children,
}: CustomSelectItemProps) {
  // This is just a data component, rendering is handled by CustomSelect
  return null;
}

// Legacy aliases for backwards compatibility
interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  position?: 'item-aligned' | 'popper';
}

const SelectContent = ({ children, className }: SelectContentProps) => (
  <div className={className}>{children}</div>
);

interface SelectValueProps {
  placeholder?: string;
  children?: React.ReactNode;
}

const SelectValue = ({ placeholder, children }: SelectValueProps) => (
  <span data-placeholder={!children}>{children || placeholder}</span>
);

// Enhanced Select component with onValueChange support
interface EnhancedSelectProps extends SelectProps {
  onValueChange?: (value: string) => void;
}

const SelectRoot = React.forwardRef<HTMLSelectElement, EnhancedSelectProps>(
  ({ onValueChange, onChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(event);
      onValueChange?.(event.target.value);
    };

    return <Select ref={ref} onChange={handleChange} {...props} />;
  }
);

SelectRoot.displayName = 'SelectRoot';

const SelectTrigger = SelectRoot;
const SelectItem = SelectOption;
const SelectLabel = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
const SelectSeparator = ({ className }: { className?: string }) => (
  <hr
    className={twMerge(
      'bg-border pointer-events-none -mx-1 my-1 h-px border-0',
      className
    )}
  />
);
const SelectScrollUpButton = () => null;
const SelectScrollDownButton = () => null;

export {
  SelectRoot as Select,
  SelectOption,
  SelectGroup,
  CustomSelect,
  CustomSelectItem,
  // Legacy exports for backwards compatibility
  SelectContent,
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
