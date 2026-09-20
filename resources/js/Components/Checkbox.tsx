import { ChangeEvent, InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    name?: string;
    value?: any;
    handleChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

export default function Checkbox({ name, value, handleChange, className = '' }: CheckboxProps) {
    return (
        <input
            type="checkbox"
            name={name}
            value={value}
            className={`rounded dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:focus:ring-offset-gray-800 ${className}`}
            onChange={(e) => handleChange && handleChange(e)}
        />
    );
}
