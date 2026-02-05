import React, { useState, useEffect, useMemo, memo, useContext } from 'react'; // Added useContext
import { Link, useLocation } from "react-router-dom";
import { MdChevronRight } from "react-icons/md";
// Rename import to represent it is a hook
import useMenuItems from "./MenuItems"; 
import useCompanyHook from "../../Hook/useCompanyHook";
import useUserPermissions from '../../Hook/useUserPermissions';
import { AuthContext } from '../../providers/AuthProvider'; // Import AuthContext

// Helper for skeleton loading UI
const SidebarSkeleton = ({ isSidebarOpen }) => (
    <div className="p-2">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 my-4 h-8">
                <div className="bg-gray-200 rounded-md w-8 h-full animate-pulse"></div>
                {isSidebarOpen && <div className="bg-gray-200 rounded-md h-5 w-3/4 animate-pulse"></div>}
            </div>
        ))}
    </div>
);

const AccordionItem = memo(({ item, isSidebarOpen }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (!isSidebarOpen) {
            setIsOpen(false);
        }
    }, [isSidebarOpen]);

    // Automatically open the accordion if a child link is active
    useEffect(() => {
        if (item.list && item.list.some(child => child.path === location.pathname)) {
            setIsOpen(true);
        }
    }, [location.pathname, item.list]);
    
    const linkClasses = useMemo(() => `flex p-3 my-1 rounded-md gap-3 items-center transition-colors ${
        location.pathname === item.path
            ? "bg-blue-600 text-white shadow-md"
            : "text-gray-600 hover:bg-gray-200"
    }`, [location.pathname, item.path]);

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
                                            ? "bg-blue-600 text-white"
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
    const { user } = useContext(AuthContext); // Get User to check Role
    
    // FETCH the user's allowed routes and loading status
    const { allowedRoutes, loading: permissionsLoading } = useUserPermissions();
    
    // Call the menu items hook at the top level
    const allItems = useMenuItems();

    // FILTER the menu based on permissions
    const filteredMenuItems = useMemo(() => {
        if (permissionsLoading) return []; 

        // === ADMIN FAILSAFE LOGIC ===
        // If user is Admin AND (allowedRoutes is undefined or empty)
        // We show ALL items to prevent locking the admin out.
        const isAdmin = user?.role === 'admin';
        const hasPermissions = allowedRoutes && allowedRoutes.length > 0;

        if (isAdmin && !hasPermissions) {
            return allItems;
        }
        // ============================

        return allItems.reduce((acc, item) => {
            if (item.path) { // Direct link
                if (allowedRoutes.includes(item.path)) {
                    acc.push(item);
                }
            } else if (item.list) { // Group with sub-menu
                const allowedSubItems = item.list.filter(subItem =>
                    allowedRoutes.includes(subItem.path)
                );
                if (allowedSubItems.length > 0) {
                    acc.push({ ...item, list: allowedSubItems });
                }
            }
            return acc;
        }, []);
    }, [allowedRoutes, permissionsLoading, allItems, user]); // Added user and allItems to dependency

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
                    {permissionsLoading ? (
                        <SidebarSkeleton isSidebarOpen={isSidebarOpen} />
                    ) : (
                        <ul>
                            {filteredMenuItems.map((item) => (
                                <AccordionItem key={item.title} item={item} isSidebarOpen={isSidebarOpen} />
                            ))}
                        </ul>
                    )}
                </nav>
            </div>
        </>
    );
};

export default Sidebar;