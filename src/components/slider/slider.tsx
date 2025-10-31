"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

interface SliderProps extends Omit<React.ComponentPropsWithoutRef<"input">, "type" | "onChange" | "value" | "defaultValue"> {
    value?: number[];
    defaultValue?: number[];
    min?: number;
    max?: number;
    step?: number;
    onValueChange?: (value: number[]) => void;
    disabled?: boolean;
}

function Slider({ 
    className, 
    value, 
    defaultValue, 
    min = 0, 
    max = 100, 
    step = 1, 
    onValueChange,
    disabled,
    ref,
    ...props 
}: SliderProps & { ref?: React.Ref<HTMLInputElement> }) {
    const currentValue = value?.[0] ?? defaultValue?.[0] ?? min;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(e.target.value);
        onValueChange?.([newValue]);
    };

    return (
        <div className="relative flex w-full touch-none select-none items-center">
            <input
                ref={ref}
                type="range"
                min={min}
                max={max}
                step={step}
                value={currentValue}
                onChange={handleChange}
                disabled={disabled}
                className={twMerge(
                    // Base styles
                    "relative h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary outline-none transition-all",
                    // Webkit styles (Chrome, Safari, Edge)
                    "[&::-webkit-slider-track]:h-2 [&::-webkit-slider-track]:w-full [&::-webkit-slider-track]:appearance-none [&::-webkit-slider-track]:rounded-full [&::-webkit-slider-track]:bg-secondary",
                    "[&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-105",
                    // Firefox styles
                    "[&::-moz-range-track]:h-2 [&::-moz-range-track]:w-full [&::-moz-range-track]:rounded-full [&::-moz-range-track]:border-none [&::-moz-range-track]:bg-secondary",
                    "[&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-105",
                    // Focus styles
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    // Disabled styles
                    "disabled:pointer-events-none disabled:opacity-50",
                    className
                )}
                {...props}
            />
            {/* Progress fill - shows the filled portion */}
            <div 
                className="pointer-events-none absolute h-2 rounded-full bg-primary transition-all"
                style={{ 
                    width: `${((currentValue - min) / (max - min)) * 100}%` 
                }}
            />
        </div>
    );
}

Slider.displayName = "Slider";

export { Slider };
