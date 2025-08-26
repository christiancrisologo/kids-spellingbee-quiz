import React, { forwardRef } from 'react';

interface MobileInputProps {
    type?: 'text' | 'number' | 'email';
    placeholder?: string;
    value?: string | number;
    onChange: (value: string) => void;
    label?: string;
    error?: string;
    disabled?: boolean;
    fullWidth?: boolean;
    inputMode?: 'numeric' | 'decimal' | 'text';
    className?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    readOnly?: boolean;
}

export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(({
    type = 'text',
    placeholder,
    value,
    onChange,
    label,
    error,
    disabled = false,
    fullWidth = true,
    inputMode,
    className = '',
    onKeyDown,
    onBlur,
    readOnly = false
}, ref) => {
    return (
        <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                onBlur={onBlur}
                disabled={disabled}
                inputMode={inputMode}
                readOnly={readOnly}
                className={`
          min-h-[56px] px-4 py-3 text-lg border-2 rounded-xl transition-all duration-200
          ${fullWidth ? 'w-full' : ''}
          ${error
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
                        : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400'
                    }
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-slate-700' : ''}
          focus:outline-none focus:ring-2 focus:ring-opacity-50
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          text-gray-900 dark:text-gray-100
        `}
            />
            {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
});

MobileInput.displayName = 'MobileInput';
