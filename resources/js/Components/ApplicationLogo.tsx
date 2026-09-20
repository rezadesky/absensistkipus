import { ImgHTMLAttributes } from 'react';

interface ApplicationLogoProps extends ImgHTMLAttributes<HTMLImageElement> {
    className?: string;
}

export default function ApplicationLogo({ className = 'w-16 h-16', ...props }: ApplicationLogoProps) {
    return (
        <img
            src="/logo.webp"
            alt="Logo STKIP Usman Safri"
            className={`object-contain ${className}`}
            {...props}
        />
    );
}
