import { forwardRef, useEffect, useRef, InputHTMLAttributes, ChangeEvent } from 'react';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    isFocused?: boolean;
    handleChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
    { type = 'text', name, id, value, className = '', autoComplete, required, isFocused, handleChange, placeholder, ...props },
    ref
) {
    const localRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || localRef;

    useEffect(() => {
        if (isFocused && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isFocused]);

    return (
        <div className="flex flex-col items-start w-full">
            <input
                {...props}
                type={type}
                name={name}
                id={id}
                value={value}
                placeholder={placeholder}
                className={
                    `border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm ` +
                    className
                }
                ref={inputRef}
                autoComplete={autoComplete}
                required={required}
                onChange={(e) => handleChange && handleChange(e)}
            />
        </div>
    );
});
