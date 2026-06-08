// src/Hook/useActionPermissions.js
import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../providers/AuthProvider';
import UseAxiosSecure from './UseAxioSecure';
import { dbPut, dbGet } from '../utilities/db';

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
                    const permissionsData = response.data.data.permissions;
                    // Cache in IndexedDB
                    await dbPut('actionPermissions', { role: user.role, permissions: permissionsData });
                    setPermissions(permissionsData);
                } else {
                    setPermissions({});
                }
            } catch (error) {
                console.log("Error fetching action permissions, checking IndexedDB cache:", error);
                try {
                    const cached = await dbGet('actionPermissions', user.role);
                    if (cached && cached.permissions) {
                        setPermissions(cached.permissions);
                    } else {
                        setPermissions({});
                    }
                } catch (dbErr) {
                    setPermissions({});
                }
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