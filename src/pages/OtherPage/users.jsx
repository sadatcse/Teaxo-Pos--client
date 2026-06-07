import React, { useState, useEffect, useContext, useMemo } from "react";
import { FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { TfiSearch } from "react-icons/tfi";
import { GoPlus } from "react-icons/go";
import { useDebounce } from "use-debounce";

import Mpagination from "../../components library/Mpagination";
import Mtitle from "../../components library/Mtitle";
import ImageUpload from "../../config/ImageUploadcpanel";
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from "../../providers/AuthProvider";
import Preloader from "../../components/Shortarea/Preloader";
import useActionPermissions from "../../Hook/useActionPermissions";

// Updated initial form data with a neutral default role
const INITIAL_FORM_DATA = {
    email: "",
    name: "",
    role: "", // Default role is now empty, will be set dynamically
    status: "active",
    photo: "",
    password: "",
    counter: "1"
};

const Users = () => {
    const axiosSecure = UseAxiosSecure();
    const { user: currentUser, branch } = useContext(AuthContext);

    const [users, setUsers] = useState([]);
    const [userRoles, setUserRoles] = useState([]); // State for dynamic roles
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ ...INITIAL_FORM_DATA, branch: branch || "" });
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPageLoading, setPageLoading] = useState(true);
   const { canPerform, loading: permissionsLoading } = useActionPermissions();
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

    // useEffect now fetches both users and roles concurrently for efficiency
    useEffect(() => {
        const loadData = async () => {
            if (!branch) return;
            setPageLoading(true);
            try {
                const [usersResponse, rolesResponse] = await Promise.all([
                    axiosSecure.get(`/user/${branch}/get-all/`),
                    axiosSecure.get(`/userrole/branch/${branch}`)
                ]);
                setUsers(usersResponse.data);
                setUserRoles(rolesResponse.data);
            } catch (error) {
                console.error('Error fetching initial data:', error);
                Swal.fire('Error!', 'Could not fetch required page data.', 'error');
            } finally {
                setPageLoading(false);
            }
        };
        loadData();
    }, [axiosSecure, branch]);

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    }, [users, debouncedSearchTerm]);

    // assignableRoles is now fully dynamic, based on fetched roles and current user's permissions
    const assignableRoles = useMemo(() => {
        const allRoles = userRoles.map(role => role.userrole);

        if (currentUser?.role === 'admin') {
            return allRoles; // Admin can assign any available role
        }
        if (currentUser?.role === 'manager') {
            return allRoles.filter(role => role !== 'admin'); // Manager can assign any role except admin
        }
        return [];
    }, [currentUser?.role, userRoles]);

    const openModal = (userToEdit = null) => {
        if (userToEdit) {
            setEditId(userToEdit._id);
            setFormData(userToEdit);
        } else {
            setEditId(null);
            // Set a sensible default role for new users from the dynamic list
            setFormData({
                ...INITIAL_FORM_DATA,
                branch: branch || "",
                role: assignableRoles.length > 0 ? assignableRoles[0] : ""
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditId(null);
    };
    
    // Re-fetch users after a successful operation
    const refetchUsers = async () => {
        try {
            const response = await axiosSecure.get(`/user/${branch}/get-all/`);
            setUsers(response.data);
        } catch (error) {
            console.error('Error re-fetching users:', error);
        }
    };

    const handleAddOrEditUser = async () => {
        setIsSubmitting(true);
        try {
            if (editId) {
                await axiosSecure.put(`/user/update/${editId}`, formData);
            } else {
                await axiosSecure.post('/user/post', formData);
            }
            await refetchUsers(); // Use a targeted refetch instead of reloading all data
            closeModal();
            Swal.fire('Success!', `User has been successfully ${editId ? 'updated' : 'created'}.`, 'success');
        } catch (error) {
            console.error('Error saving user:', error);
            Swal.fire('Error!', error.response?.data?.message || 'Failed to save user.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemove = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosSecure.delete(`/user/delete/${id}`);
                    await refetchUsers();
                    Swal.fire('Deleted!', 'The user has been deleted.', 'success');
                } catch (error) {
                    Swal.fire('Error!', 'Failed to delete user.', 'error');
                }
            }
        });
    };

    const handleImageUpload = (url) => {
        setFormData((prev) => ({ ...prev, photo: url }));
    };

    const { paginatedData, paginationControls, rowsPerPageAndTotal } = Mpagination({ totalData: filteredUsers });

    return (
        <div className="p-4 min-h-screen bg-gray-50 dark:bg-zinc-950">
            <Mtitle title="Staff Management" rightcontent={
                <div className='flex md:mt-0 mt-3 justify-end items-center gap-4'>
                    <div className='md:w-64 border border-slate-200 dark:border-zinc-800 shadow-sm py-2 px-3 bg-white dark:bg-zinc-900 rounded-xl'>
                        <div className='flex items-center gap-2'>
                            <TfiSearch className='text-xl text-gray-500 dark:text-zinc-400' />
                            <input
                                type="text"
                                className='outline-none w-full bg-transparent text-gray-700 dark:text-zinc-150'
                                placeholder='Search here...'
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    {assignableRoles.length > 0 && (
                        <button onClick={() => openModal()} className="flex gap-2 items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl shadow transition duration-300 border-none">
                            <span className="font-semibold">New</span>
                            <GoPlus className="text-xl text-white" />
                        </button>
                    )}
                </div>
            } />

            <div className="text-sm md:text-base mt-4 text-gray-700 dark:text-zinc-350">{rowsPerPageAndTotal}</div>

            {isPageLoading ? (
                <Preloader />
            ) : (
                <section className="overflow-x-auto border border-slate-200 dark:border-zinc-800 shadow-sm rounded-xl p-4 mt-5 bg-white dark:bg-zinc-900">
                    <table className="table w-full">
                        <thead className='bg-blue-600 dark:bg-zinc-800 text-white dark:text-zinc-200'>
                            <tr className="text-sm font-medium text-white dark:text-zinc-200 text-left">
                                <th className="p-3 rounded-l-xl">Name</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Role</th>
                                <th className="p-3">Counter</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 rounded-r-xl text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((user) => {
                                let canPerformAction = false;
                                if (currentUser._id !== user._id) {
                                    if (currentUser.role === 'admin') {
                                        canPerformAction = true;
                                    } else if (currentUser.role === 'manager' && user.role !== 'admin') {
                                        canPerformAction = true;
                                    }
                                }

                                return (
                                    <tr key={user._id} className="hover:bg-slate-100 dark:hover:bg-zinc-800/40 border-b border-slate-100 dark:border-zinc-800/80 last:border-0">
                                        <td className="p-4 text-gray-800 dark:text-zinc-300">{user.name}</td>
                                        <td className="p-4 text-gray-850 dark:text-zinc-400">{user.email}</td>
                                        <td className="p-4 capitalize text-gray-800 dark:text-zinc-300">{user.role}</td>
                                        <td className="p-4 text-gray-800 dark:text-zinc-300">{user.counter}</td>
                                        <td className="p-4"><span className={`px-2 py-1 text-xs rounded-full capitalize ${user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'}`}>{user.status}</span></td>
                                        <td className="p-4">
                                            <div className="flex justify-center space-x-4">
                                                {canPerformAction ? (
                                                    <>
                                                        <button onClick={() => openModal(user)} className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"><FiEdit /></button>
                                                        <button onClick={() => handleRemove(user._id)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"><FiTrash2 /></button>
                                                    </>
                                                ) : <span className="text-gray-400 dark:text-zinc-650">-</span>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {paginationControls}
                </section>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-lg shadow-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4 border-b dark:border-zinc-800 pb-2">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-zinc-150">{editId ? 'Edit User' : 'Add New User'}</h2>
                            <button onClick={closeModal} className="text-gray-400 dark:text-zinc-400 hover:text-gray-650 dark:hover:text-zinc-250"><FiX size={24} /></button>
                        </div>
                        <div className="space-y-4">
                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input input-bordered w-full bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-150 border-slate-200 dark:border-zinc-700 focus:outline-none" placeholder="Name" />
                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input input-bordered w-full bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-150 border-slate-200 dark:border-zinc-700 focus:outline-none" placeholder="Email" />
                            {!editId && <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input input-bordered w-full bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-150 border-slate-200 dark:border-zinc-700 focus:outline-none" placeholder="Password" />}
                            
                            <ImageUpload setImageUrl={handleImageUpload} />

                            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="select select-bordered w-full bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-150 border-slate-200 dark:border-zinc-700 focus:outline-none">
                                <option value="" disabled>Select a role</option>
                                {assignableRoles.map(role => (
                                    <option key={role} value={role} className="capitalize">{role}</option>
                                ))}
                            </select>

                            <select value={formData.counter} onChange={(e) => setFormData({ ...formData, counter: e.target.value })} className="select select-bordered w-full bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-150 border-slate-200 dark:border-zinc-700 focus:outline-none">
                                {[1, 2, 3, 4].map(num => <option key={num} value={num}>Counter {num}</option>)}
                            </select>

                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="select select-bordered w-full bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-150 border-slate-200 dark:border-zinc-700 focus:outline-none">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="flex justify-end space-x-4 mt-6 border-t dark:border-zinc-800 pt-4">
                            <button onClick={closeModal} className="btn bg-gray-200 dark:bg-zinc-800 text-gray-750 dark:text-zinc-300 border-none hover:bg-gray-300 dark:hover:bg-zinc-700">Cancel</button>
                            <button onClick={handleAddOrEditUser} className="btn bg-blue-600 hover:bg-blue-700 text-white border-none shadow-md" disabled={isSubmitting}>
                                {isSubmitting ? <span className="loading loading-spinner"></span> : (editId ? 'Save Changes' : 'Add User')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;