import { useState, createContext, useContext, Fragment, ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

interface DropDownContextType {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    toggleOpen: () => void;
}

const DropDownContext = createContext<DropDownContextType>({
    open: false,
    setOpen: () => {},
    toggleOpen: () => {},
});

const Dropdown = ({ children }: { children: ReactNode }) => {
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative">{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }: { children: ReactNode }) => {
    const { open, setOpen, toggleOpen } = useContext(DropDownContext);

    return (
        <>
            <div onClick={toggleOpen}>{children}</div>

            {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>}
        </>
    );
};

interface ContentProps {
    align?: 'left' | 'right';
    width?: string;
    contentClasses?: string;
    children: ReactNode;
}

const Content = ({ align = 'right', width = '48', contentClasses = 'py-1 bg-white', children }: ContentProps) => {
    const { open, setOpen } = useContext(DropDownContext);

    let alignmentClasses = 'origin-top';

    if (align === 'left') {
        alignmentClasses = 'origin-top-left left-0';
    } else if (align === 'right') {
        alignmentClasses = 'origin-top-right right-0';
    }

    let widthClasses = '';

    if (width === '48') {
        widthClasses = 'w-48';
    }

    return (
        <>
            <Transition
                as={Fragment}
                show={open}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <div
                    className={`absolute z-50 mt-2 rounded-xl shadow-xl ${alignmentClasses} ${widthClasses}`}
                    onClick={() => setOpen(false)}
                >
                    <div className={`rounded-xl ring-1 ring-black/5 ` + contentClasses}>{children}</div>
                </div>
            </Transition>
        </>
    );
};

interface DropdownLinkProps {
    href: string;
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    as?: string;
    className?: string;
    children: ReactNode;
}

const DropdownLink = ({ href, method, as, className = '', children }: DropdownLinkProps) => {
    return (
        <Link
            href={href}
            method={method}
            as={as}
            className={`block w-full px-4 py-2 text-left text-sm leading-5 text-slate-700 hover:bg-slate-50 focus:outline-none transition duration-150 ease-in-out ${className}`}
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
