// src/Hook/useActionPermissions.js
import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../providers/AuthProvider';
import UseAxiosSecure from './UseAxioSecure';

const useActionPermissions = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = UseAxiosSecure();
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPermissions = async () => {
            if (!user || !user.role || !user.branch) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await axiosSecure.get(`/role-permissions?role=${user.role}&branch=${user.branch}`);
                if (response.data && response.data.data && response.data.data.permissions) {
                    setPermissions(response.data.data.permissions);
                } else {
                    setPermissions({});
                }
            } catch (error) {
                // It's normal for a role to not have permissions set yet (404), so we just treat it as empty.
                console.log("No action permissions found for this role, or an error occurred.");
                setPermissions({});
            } finally {
                setLoading(false);
            }
        };

        fetchPermissions();
    }, [user, axiosSecure]);

    /**
     * Checks if the current user can perform a specific action on a feature.
     * @param {string} feature - The name of the feature (e.g., 'Pending Orders'). Must match the name in RoleActionPermission.js.
     * @param {string} action - The action to check (e.g., 'view', 'edit', 'delete').
     * @returns {boolean} - True if the action is allowed, false otherwise.
     */
    const canPerform = useCallback((feature, action) => {
        // Admins have super-powers and bypass the check.
        if (user?.role?.toLowerCase() === 'admin') {
            return true;
        }
        return !!permissions[feature]?.[action];
    }, [permissions, user?.role]);

    return { canPerform, loading };
};

export default useActionPermissions;