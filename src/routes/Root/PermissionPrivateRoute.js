// src/layouts/Root/PermissionPrivateRoute.js
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../providers/AuthProvider';
import useUserPermissions from '../../Hook/useUserPermissions';

// A simple preloader component for a better user experience
const FullPageLoader = () => (
    <div className="flex items-center justify-center h-screen bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
);

const PermissionPrivateRoute = ({ children }) => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const { allowedRoutes, loading: permissionsLoading } = useUserPermissions();
    const location = useLocation();

    // 1. Show a loader while checking authentication and fetching permissions
    if (authLoading || permissionsLoading) {
        return <FullPageLoader />;
    }

    // 2. If the user is not logged in, redirect them to the login page
    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // 3. If the user is logged in but doesn't have permission for this specific route, redirect them
    // We also explicitly allow the dashboard home page as a default fallback.
    if (!allowedRoutes.includes(location.pathname) && location.pathname !== '/dashboard/home') {
        // Redirect to a safe default page, like the dashboard home
        return <Navigate to="/dashboard/home" replace />;
    }

    // 4. If all checks pass, render the requested component
    return children;
};

export default PermissionPrivateRoute;