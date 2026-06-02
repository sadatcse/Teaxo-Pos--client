import React, { useState, useEffect, useCallback } from "react";
import { FiEdit, FiTrash2, FiPlus, FiShield } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

import UseAxiosSecure from '../../Hook/UseAxioSecure';
import useTotalBranch from '../../Hook/UseTotalBrach';
import Mtitle from '../../components library/Mtitle';
import Preloader from '../../components/Shortarea/Preloader';

const AUserRoles = () => {
    const axiosSecure = UseAxiosSecure();
    const { branches, loading: branchesLoading } = useTotalBranch();

    const [selectedBranch, setSelectedBranch] = useState("");
    const [userRoles, setUserRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roleName, setRoleName] = useState("");
    const [editingRole, setEditingRole] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch roles when a branch is selected
    const fetchUserRoles = useCallback(async () => {
        if (!selectedBranch) {
            setUserRoles([]);
            return;
        }
        setLoading(true);
        try {
            const response = await axiosSecure.get(`/userrole/branch/${selectedBranch}`);
            setUserRoles(response.data);
        } catch (error) {
            console.error("Error fetching user roles:", error);
            Swal.fire('Error!', 'Failed to fetch user roles for this branch.', 'error');
        } finally {
            setLoading(false);
        }
    }, [axiosSecure, selectedBranch]);

    useEffect(() => {
        fetchUserRoles();
    }, [fetchUserRoles]);

    // Automatically select the first branch if available
    useEffect(() => {
        if (branches && branches.length > 0 && !selectedBranch) {
            setSelectedBranch(branches[0].name);
        }
    }, [branches, selectedBranch]);

    const handleOpenModal = (role = null) => {
        if (role) {
            setEditingRole(role);
            setRoleName(role.userrole);
        } else {
            setEditingRole(null);
            setRoleName("");
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!roleName.trim()) {
            Swal.fire('Warning!', 'Role name is required.', 'warning');
            return;
        }

        setIsSubmitting(true);
        const isEditing = !!editingRole;
        const endpoint = isEditing ? `/userrole/update/${editingRole._id}` : '/userrole/post';
        const method = isEditing ? 'put' : 'post';
        
        // Match the backend's preference of storing role strings in lowercase
        const payload = {
            userrole: roleName.trim().toLowerCase(),
            branch: selectedBranch
        };

        try {
            await axiosSecure[method](endpoint, payload);
            Swal.fire('Success!', `User role ${isEditing ? 'updated' : 'created'} successfully.`, 'success');
            fetchUserRoles();
            setIsModalOpen(false);
        } catch (error) {
            Swal.fire('Error!', error.response?.data?.message || 'Failed to save user role.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This user role will be permanently deleted.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        }).then(result => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/userrole/delete/${id}`).then(() => {
                    Swal.fire('Deleted!', 'The user role has been deleted.', 'success');
                    fetchUserRoles();
                }).catch(() => Swal.fire('Error!', 'Failed to delete user role.', 'error'));
            }
        });
    };

    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-955 min-h-screen transition-colors duration-300">
            <Mtitle 
                title="Superadmin User Role Management" 
                rightcontent={
                    selectedBranch && (
                        <button 
                            onClick={() => handleOpenModal()} 
                            className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none flex items-center gap-2 rounded-xl"
                        >
                            <FiPlus /> Add User Role
                        </button>
                    )
                } 
            />

            {/* Branch Selection Panel */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 my-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                <div>
                    <h3 className="text-md font-bold text-slate-850 dark:text-slate-200">Select Branch</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage custom staff roles for specific branches</p>
                </div>
                <div className="w-full sm:w-72">
                    {branchesLoading ? (
                        <div className="text-sm text-slate-500">Loading branches...</div>
                    ) : (
                        <select 
                            value={selectedBranch} 
                            onChange={e => setSelectedBranch(e.target.value)} 
                            className="select select-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Choose a Branch</option>
                            {branches.map(b => (
                                <option key={b._id || b.id} value={b.name}>{b.name}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* User Roles List */}
            {!selectedBranch ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm text-slate-400 dark:text-slate-550 transition-colors">
                    <FiShield className="mx-auto text-4xl mb-3 opacity-60" />
                    <p className="font-medium">Please select a branch to view and manage user roles.</p>
                </div>
            ) : loading ? (
                <Preloader />
            ) : (
                <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 transition-colors">
                    <table className="table w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-655 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="p-4 text-left font-bold text-sm">Role Name</th>
                                <th className="p-4 text-left font-bold text-sm">Branch</th>
                                <th className="p-4 text-right font-bold text-sm rounded-tr-2xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userRoles.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium">
                                        No custom user roles found for this branch. Add some to configure custom access control!
                                    </td>
                                </tr>
                            ) : (
                                userRoles.map(role => (
                                    <tr key={role._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 transition-colors text-slate-700 dark:text-slate-350">
                                        <td className="p-4 font-semibold text-slate-850 dark:text-slate-200 capitalize">
                                            {role.userrole}
                                        </td>
                                        <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">{role.branch}</td>
                                        <td className="p-4 text-right space-x-2">
                                            <button 
                                                onClick={() => handleOpenModal(role)} 
                                                className="btn btn-ghost btn-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg p-1.5"
                                                title="Edit Role"
                                            >
                                                <FiEdit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(role._id)} 
                                                className="btn btn-ghost btn-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg p-1.5"
                                                title="Delete Role"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit/Create Role Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 dark:border-slate-800"
                        >
                            <h2 className="text-lg font-bold text-slate-855 dark:text-slate-200 mb-4">
                                {editingRole ? "Edit User Role" : "Add New User Role"}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-5">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Role Name</label>
                                    <input 
                                        type="text" 
                                        value={roleName} 
                                        onChange={e => setRoleName(e.target.value)} 
                                        placeholder="e.g. Waiter, Kitchen Manager, Cashier"
                                        className="input input-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500" 
                                        required
                                    />
                                    <p className="text-[11px] text-slate-400 dark:text-slate-550 mt-1.5">Role name will be saved in lowercase representation.</p>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)} 
                                        className="btn bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 border-none rounded-xl"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-xl"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Saving..." : editingRole ? "Save Changes" : "Create Role"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AUserRoles;
