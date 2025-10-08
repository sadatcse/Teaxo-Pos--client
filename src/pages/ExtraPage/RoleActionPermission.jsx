// src/pages/Settings/RoleActionPermission.js

import React, { useState, useEffect, useCallback, useContext } from "react";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import toast from "react-hot-toast";
import useGetRoles from "../../Hook/useGetRoles";
import MtableLoading from "../../components library/MtableLoading";

// UPDATED: The list of features/modules is now based on your request.
// Remember: The names you use here (e.g., 'Product Management') must be used consistently
// in your other components when you check for these permissions.
const APP_FEATURES = [
    'Pending Orders',
    'Order History',
    'Customer Management',
    'Expense Management',
    'Purchase Management',
    'Stock Management',
    'Vendor Management',
    'Table Management',
    'Table Reservations',
    'Ingredient Management', //s
    'Recipe Management',
    'User Access Logs',
    'Category Management',
    'Product Management',
    'Addon Management',
    'Counter Management',
    'Company Profile',
    'Role Management',
    'Staff Management',
    'Customer Reviews',

];


const RoleActionPermission = () => {
    const [selectedRole, setSelectedRole] = useState("admin");
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);
    const axiosSecure = UseAxiosSecure();
    const availableRoles = useGetRoles();

    // Generates a default permission structure for a new role
    const generateDefaultPermissions = () => {
        const defaultPermissions = {};
        APP_FEATURES.forEach(feature => {
            defaultPermissions[feature] = {
                view: false, add: false, edit: false, delete: false
            };
        });
        return defaultPermissions;
    };

    const fetchPermissions = useCallback(async () => {
        if (!selectedRole || !user?.branch) return;
        setLoading(true);
        try {
            const response = await axiosSecure.get(`/role-permissions?role=${selectedRole}&branch=${user.branch}`);
            // If data exists, set it. The backend stores permissions in a Map, which axios converts to an object.
            setPermissions(response.data.data.permissions || generateDefaultPermissions());
        } catch (error) {
            // If a 404 is returned (no permissions set for this role yet), initialize with default values.
            if (error.response && error.response.status === 404) {
                setPermissions(generateDefaultPermissions());
            } else {
                console.error("Error fetching permissions:", error);
                toast.error("Could not fetch permissions.");
                setPermissions({}); // Clear on error
            }
        } finally {
            setLoading(false);
        }
    }, [selectedRole, user?.branch, axiosSecure]);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    // Handles checkbox changes in the local state
    const handlePermissionChange = (feature, action) => {
        setPermissions(prev => ({
            ...prev,
            [feature]: {
                ...prev[feature],
                [action]: !prev[feature]?.[action]
            }
        }));
    };
    
    // Saves all current permission settings to the backend
    const handleSaveChanges = async () => {
        if (!selectedRole || !user?.branch) {
            toast.error("Role and branch must be selected.");
            return;
        }

        const toastId = toast.loading("Saving permissions...");
        try {
            await axiosSecure.post('/role-permissions', {
                branch: user.branch,
                role: selectedRole,
                permissions: permissions
            });
            toast.success("Permissions saved successfully!", { id: toastId });
        } catch (error) {
            console.error("Error saving permissions:", error);
            toast.error("Failed to save permissions.", { id: toastId });
        }
    };
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-base-200 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="card bg-base-100 shadow-xl border-t-4 border-blue-700">
                    <div className="card-body">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="card-title text-2xl text-blue-700">Manage Action Permissions</h2>
                                <p className="text-sm text-gray-500">Control what actions each role can perform (View, Add, Edit, Delete).</p>
                            </div>
                            <button onClick={handleSaveChanges} className="btn btn-primary bg-blue-700 hover:bg-blue-800 text-white">
                                Save Changes
                            </button>
                        </div>

                        <div className="form-control w-full max-w-xs mb-6">
                            <label className="label">
                                <span className="label-text font-semibold">Select a Role to Configure</span>
                            </label>
                            <select
                                className="select select-bordered focus:border-blue-700 focus:outline-none"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                {availableRoles.map((r, i) => (
                                    <option key={i} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        
                        {loading ? (
                            <MtableLoading />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="font-semibold text-gray-700">Feature</th>
                                            <th className="text-center font-semibold text-gray-700">View</th>
                                            <th className="text-center font-semibold text-gray-700">Add</th>
                                            <th className="text-center font-semibold text-gray-700">Edit</th>
                                            <th className="text-center font-semibold text-gray-700">Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {APP_FEATURES.map((feature) => (
                                            <tr key={feature} className="hover">
                                                <td className="font-medium">{feature}</td>
                                                {['view', 'add', 'edit', 'delete'].map((action) => (
                                                    <td key={action} className="text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox checkbox-primary border-gray-400 [--chkbg:theme(colors.blue.700)] [--chkfg:white]"
                                                            checked={permissions[feature]?.[action] || false}
                                                            onChange={() => handlePermissionChange(feature, action)}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleActionPermission;