import { ReactNode } from 'react';

interface InputLabelProps {
    forInput?: string;
    value?: string;
    className?: string;
    children?: ReactNode;
}

export default function InputLabel({ forInput, value, className = '', children }: InputLabelProps) {
    return (
        <label htmlFor={forInput} className={`block font-medium text-sm text-gray-700 dark:text-gray-300 ` + className}>
            {value ? value : children}
        </label>
    );
}
