// src/layouts/Sidebar.js

import React, { useState, useEffect, useMemo, memo } from 'react';
import { Link, useLocation } from "react-router-dom";
import { MdChevronRight } from "react-icons/md";
import menuItems from "./MenuItems";
import useCompanyHook from "../../Hook/useCompanyHook";

// --- Optimization 1: Memoize the AccordionItem Component ---
// We wrap AccordionItem in React.memo to prevent it from re-rendering if its props (item, isSidebarOpen) have not changed.
// This is highly effective because when the sidebar toggles, only the isSidebarOpen prop changes, but without memo,
// every single AccordionItem in the list would re-render.
const AccordionItem = memo(({ item, isSidebarOpen }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // --- Optimization 2: Add Effect for Better UX ---
    // This `useEffect` hook automatically closes an open accordion when the entire sidebar is collapsed.
    // It improves the user experience by resetting the accordion's state for a cleaner look when the sidebar re-opens.
    useEffect(() => {
        if (!isSidebarOpen) {
            setIsOpen(false);
        }
    }, [isSidebarOpen]);

    // Memoize class names to avoid recalculating them on every render.
    const linkClasses = useMemo(() => `flex p-2 my-1 text-sm rounded-md gap-3 items-center transition-colors ${
        location.pathname === item.path
            ? "bg-blue-500 text-white"
            : "text-gray-500 hover:bg-gray-200"
    }`, [location.pathname, item.path]);

    // Render for a dropdown menu item
    if (item.list) {
        return (
            <li className="my-1">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex justify-between items-center p-3 rounded-md text-gray-600 hover:bg-gray-200"
                >
                    <div className="flex items-center gap-3">
                        {item.icon}
                        {isSidebarOpen && <span className="font-medium text-sm">{item.title}</span>}
                    </div>
                    {isSidebarOpen && <MdChevronRight className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />}
                </button>
                {isOpen && isSidebarOpen && (
                    <ul className="pl-6 pt-1">
                        {item.list.map((child) => (
                            <li key={child.title}>
                                <Link
                                    to={child.path}
                                    className={`flex p-2 my-1 text-sm rounded-md gap-3 items-center transition-colors ${
                                        location.pathname === child.path
                                            ? "bg-blue-500 text-white"
                                            : "text-gray-500 hover:bg-gray-200"
                                    }`}
                                >
                                    {child.icon}
                                    <span>{child.title}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </li>
        );
    }

    // Render for a single link item
    return (
        <li>
            <Link to={item.path} className={linkClasses}>
                {item.icon}
                {isSidebarOpen && <span className="font-medium text-sm">{item.title}</span>}
            </Link>
        </li>
    );
});


const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
    const { companies } = useCompanyHook();

    // --- Optimization 3: Memoize the Menu Items Array ---
    // `useMemo` ensures that the `menuItems()` function is only called once, and the resulting array is reused
    // on subsequent renders. This prevents recalculating the list of menu items every time the sidebar toggles.
    const memoizedMenuItems = useMemo(() => menuItems(), []);

    // Memoize the dynamic class string for the sidebar container
    const sidebarClasses = useMemo(() => `fixed top-0 left-0 h-full bg-white shadow-lg z-30 transition-all duration-300 flex flex-col ${
        isSidebarOpen
            ? 'w-64 translate-x-0'
            : 'w-64 -translate-x-full md:w-20 md:translate-x-0'
    }`, [isSidebarOpen]);

    const overlayClasses = useMemo(() => `fixed inset-0 bg-black/50 z-20 transition-opacity md:hidden ${
        isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`, [isSidebarOpen]);

    return (
        <>
            <div onClick={toggleSidebar} className={overlayClasses}></div>

            <div className={sidebarClasses}>
                <div className="flex items-center justify-center p-8 border-b h-[65px] flex-shrink-0 my-5">
                    <img src={companies[0]?.logo} alt="Logo" className={`transition-all duration-300 pb-5 ${isSidebarOpen ? 'w-24' : 'w-10'}`} />
                </div>

                <nav className="flex-1 overflow-y-auto p-2">
                    <ul>
                        {memoizedMenuItems.map((item) => (
                            <AccordionItem key={item.title} item={item} isSidebarOpen={isSidebarOpen} />
                        ))}
                    </ul>
                </nav>
            </div>
        </>
    );
};

export default Sidebar;