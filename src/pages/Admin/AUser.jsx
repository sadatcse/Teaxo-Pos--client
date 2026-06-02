import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { useDebounce } from "use-debounce";
import Swal from 'sweetalert2';

import UseAxiosSecure from '../../Hook/UseAxioSecure';
import useTotalBranch from '../../Hook/UseTotalBrach';
import { AuthContext } from "../../providers/AuthProvider";
import Mtitle from '../../components library/Mtitle';
import Preloader from '../../components/Shortarea/Preloader';
import UserModal from './UserModal'; // Adjust path if needed

const AUser = () => {
    const axiosSecure = UseAxiosSecure();
    const { user: currentUser } = useContext(AuthContext);
    const { branches, loading: branchesLoading } = useTotalBranch();

    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({ branch: '', role: '', status: '', search: '' });
    const [debouncedSearch] = useDebounce(filters.search, 500);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: currentPage, limit: 10, ...filters, search: debouncedSearch });
            const response = await axiosSecure.get(`/user/superadmin/all?${params.toString()}`);
            setUsers(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) { 
            console.error("Error fetching users:", error); 
        } finally { 
            setLoading(false); 
        }
    }, [axiosSecure, currentPage, filters, debouncedSearch]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // Determines which roles the current user can assign
    const assignableRoles = useMemo(() => {
        if (currentUser?.role === 'superadmin') return ['superadmin', 'admin', 'manager', 'user'];
        if (currentUser?.role === 'admin') return ['admin', 'manager', 'user'];
        if (currentUser?.role === 'manager') return ['manager', 'user'];
        return [];
    }, [currentUser?.role]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const handleOpenModal = (user = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        const isEditing = !!editingUser;
        const endpoint = isEditing ? `/user/updatea/${editingUser._id}` : '/user/post';
        const method = isEditing ? 'put' : 'post';
        
        try {
            await axiosSecure[method](endpoint, formData);
            Swal.fire('Success!', `User ${isEditing ? 'updated' : 'created'} successfully.`, 'success');
            fetchUsers();
            setIsModalOpen(false);
        } catch (error) {
            Swal.fire('Error!', error.response?.data?.message || 'Failed to save user.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?', text: "This action cannot be undone.",
            icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, delete it!'
        }).then(result => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/user/delete/${id}`).then(() => {
                    Swal.fire('Deleted!', 'The user has been deleted.', 'success');
                    fetchUsers();
                }).catch(() => Swal.fire('Error!', 'Failed to delete user.', 'error'));
            }
        });
    };

    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
            <Mtitle title="User Management" rightcontent={
                assignableRoles.length > 0 && 
                <button 
                    onClick={() => handleOpenModal()} 
                    className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-xl flex items-center gap-2"
                >
                    <FiPlus /> Add User
                </button>
            } />

            {/* Filter Panel */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 my-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-colors">
                <input 
                    type="text" 
                    value={filters.search} 
                    onChange={e => handleFilterChange('search', e.target.value)} 
                    placeholder="Search by name or email..." 
                    className="input input-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200" 
                />
                <select 
                    value={filters.branch} 
                    onChange={e => handleFilterChange('branch', e.target.value)} 
                    className="select select-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200" 
                    disabled={branchesLoading}
                >
                    <option value="">All Branches</option>
                    {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
                <select 
                    value={filters.role} 
                    onChange={e => handleFilterChange('role', e.target.value)} 
                    className="select select-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                >
                    <option value="">All Roles</option>
                    <option value="superadmin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="user">User</option>
                </select>
                <select 
                    value={filters.status} 
                    onChange={e => handleFilterChange('status', e.target.value)} 
                    className="select select-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {loading ? <Preloader /> : (
                <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 transition-colors">
                    <table className="table w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-650 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="p-4 text-sm font-bold">User</th>
                                <th className="p-4 text-sm font-bold">Role</th>
                                <th className="p-4 text-sm font-bold">Branch</th>
                                <th className="p-4 text-sm font-bold">Status</th>
                                <th className="p-4 text-sm font-bold text-right rounded-tr-2xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => {
                                // Updated security logic for superadmin
                                let canPerformAction = false;
                                if (currentUser?._id !== user._id) { // Cannot edit yourself
                                    if (currentUser?.role === 'superadmin') {
                                        canPerformAction = true;
                                    } else if (currentUser?.role === 'admin' && user.role !== 'superadmin') {
                                        canPerformAction = true;
                                    } else if (currentUser?.role === 'manager' && !['superadmin', 'admin'].includes(user.role)) {
                                        canPerformAction = true;
                                    }
                                }
                                return (
                                    <tr key={user._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-350">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="avatar">
                                                    <div className="mask mask-squircle w-12 h-12 bg-slate-100 dark:bg-slate-850">
                                                        <img src={user.photo || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-850 dark:text-slate-200">{user.name}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 capitalize font-medium">{user.role}</td>
                                        <td className="p-4">
                                            <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none font-medium">
                                                {user.branch}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`badge ${user.status === 'active' ? 'badge-success text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'} border-none font-medium`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            {canPerformAction ? (
                                                <>
                                                    <button onClick={() => handleOpenModal(user)} className="btn btn-ghost btn-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg p-1.5" title="Edit"><FiEdit size={16}/></button>
                                                    <button onClick={() => handleDelete(user._id)} className="btn btn-ghost btn-xs text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg p-1.5" title="Delete"><FiTrash2 size={16}/></button>
                                                </>
                                            ) : <span className="text-slate-400 dark:text-slate-600 text-sm">-</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            
            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 text-slate-600 dark:text-slate-400">
                <p className="text-sm font-medium">Total Users: {pagination.totalDocuments || 0}</p>
                <div className="join">
                    <button 
                        onClick={() => setCurrentPage(p => p - 1)} 
                        disabled={pagination.currentPage === 1} 
                        className="join-item btn bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300 disabled:opacity-50"
                    >
                        «
                    </button>
                    <button className="join-item btn bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:text-slate-300 cursor-default">
                        Page {pagination.currentPage || 1}
                    </button>
                    <button 
                        onClick={() => setCurrentPage(p => p + 1)} 
                        disabled={pagination.currentPage === pagination.totalPages} 
                        className="join-item btn bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300 disabled:opacity-50"
                    >
                        »
                    </button>
                </div>
            </div>

            <UserModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isEditing={!!editingUser}
                initialData={editingUser || { role: 'user', status: 'active', branch: currentUser?.branch }}
                branches={branches}
                assignableRoles={assignableRoles}
            />
        </div>
    );
};

export default AUser;