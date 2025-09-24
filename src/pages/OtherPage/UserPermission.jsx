import React, { useState, useEffect, useCallback, useContext } from "react";
import menuItems from "../../routes/Root/MenuItems";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import toast from "react-hot-toast";
import useGetRoles from "../../Hook/useGetRoles";
import MtableLoading from "../../components library/MtableLoading"; 

// Child component (no changes needed here)
const PermissionItem = ({ item, groupName, role, branch, initialChecked, onPermissionChange }) => {
    const [isChecked, setIsChecked] = useState(initialChecked);
    const axiosSecure = UseAxiosSecure();

    useEffect(() => {
        setIsChecked(initialChecked);
    }, [initialChecked]);

    const handleCheckboxChange = async (e) => {
        const checked = e.target.checked;
        setIsChecked(checked); 

        const permissionPayload = {
            title: item.title, isAllowed: checked, role,
            group_name: groupName, path: item.path, branch,
        };
        
        try {
            await axiosSecure.put(`/permissions`, permissionPayload);
            toast.success(`Permission for '${item.title}' updated.`);
        } catch (error) {
            console.error("Error updating permission:", error);
            toast.error("Update failed. Please try again.");
            setIsChecked(!checked);
        }
    };

    return (
        <div className="form-control bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition-colors duration-200">
            <label className="cursor-pointer label justify-between">
                <span className="label-text">{item.title}</span>
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                    className="checkbox border-gray-400 [--chkbg:theme(colors.blue.700)] [--chkfg:white]"
                />
            </label>
        </div>
    );
};


// Main Parent Component
const UserPermission = () => {
    const [role, setRole] = useState("admin");
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);
    const axiosSecure = UseAxiosSecure();
    const availableRoles = useGetRoles();

    const fetchPermissions = useCallback(async () => {
        if (!role || !user?.branch) return;
        setLoading(true);
        try {
            const response = await axiosSecure.get(`/permissions/${role}?branch=${user.branch}`);
            setPermissions(response.data.routesData || []);
        } catch (error) {
            console.error("Error fetching permissions:", error);
            setPermissions([]);
            toast.error("Could not fetch permissions.");
        } finally {
            setLoading(false);
        }
    }, [role, user?.branch, axiosSecure]);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    const isRouteAllowed = (path) => {
        const permission = permissions.find(p => p.path === path);
        return permission ? permission.isAllowed : false;
    };

    const allMenuItems = menuItems();

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-base-200 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="card bg-base-100 shadow-xl border-t-4 border-blue-700">
                    <div className="card-body">
                        <h2 className="card-title text-2xl mb-4 text-blue-700">Manage Role Permissions</h2>
                        
                        <div className="form-control w-full max-w-xs mb-6">
                            <label className="label">
                                <span className="label-text font-semibold">Select a Role to Configure</span>
                            </label>
                            <select
                                className="select select-bordered focus:border-blue-700 focus:outline-none"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                {availableRoles.map((r, i) => (
                                    <option key={i} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* MODIFIED: Replaced DaisyUI spinner with MtableLoading component */}
                        {loading ? (
                            <MtableLoading data={null} />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {allMenuItems.map((menuGroup) => (
                                    <div key={menuGroup.title} className="p-4 border rounded-lg bg-white shadow-sm">
                                        <h3 className="text-lg font-bold mb-3 flex items-center gap-3 border-b border-gray-200 pb-2 text-gray-700">
                                            {menuGroup.icon} {menuGroup.title}
                                        </h3>
                                        <div className="space-y-2">
                                            {menuGroup.list ? (
                                                menuGroup.list.map(item => (
                                                    <PermissionItem
                                                        key={item.path} item={item} groupName={menuGroup.title}
                                                        role={role} branch={user?.branch}
                                                        initialChecked={isRouteAllowed(item.path)}
                                                        onPermissionChange={fetchPermissions}
                                                    />
                                                ))
                                            ) : (
                                                <PermissionItem
                                                    key={menuGroup.path} item={menuGroup} groupName="General"
                                                    role={role} branch={user?.branch}
                                                    initialChecked={isRouteAllowed(menuGroup.path)}
                                                    onPermissionChange={fetchPermissions}
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPermission;