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
        } catch (error) { console.error("Error fetching users:", error); } 
        finally { setLoading(false); }
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
        <div className="p-6 bg-gray-50 min-h-screen">
            <Mtitle title="User Management" rightcontent={
                assignableRoles.length > 0 && 
                <button onClick={() => handleOpenModal()} className="btn bg-blue-600 hover:bg-blue-700 text-white">
                    <FiPlus className="mr-2"/>Add User
                </button>
            } />

            <div className="p-4 bg-white rounded-lg shadow-md my-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input type="text" value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} placeholder="Search by name or email..." className="input input-bordered w-full" />
                <select value={filters.branch} onChange={e => handleFilterChange('branch', e.target.value)} className="select select-bordered w-full" disabled={branchesLoading}>
                    <option value="">All Branches</option>
                    {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
                <select value={filters.role} onChange={e => handleFilterChange('role', e.target.value)} className="select select-bordered w-full">
                    <option value="">All Roles</option>
                    <option value="superadmin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="user">User</option>
                </select>
                <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} className="select select-bordered w-full">
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {loading ? <Preloader /> : (
                <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                    <table className="table w-full">
                        <thead className="bg-blue-600 text-white">
                            <tr><th>User</th><th>Role</th><th>Branch</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {users.map(user => {
                                // ✅ Updated security logic for superadmin
                                let canPerformAction = false;
                                if (currentUser._id !== user._id) { // Cannot edit yourself
                                    if (currentUser.role === 'superadmin') {
                                        canPerformAction = true;
                                    } else if (currentUser.role === 'admin' && user.role !== 'superadmin') {
                                        canPerformAction = true;
                                    } else if (currentUser.role === 'manager' && !['superadmin', 'admin'].includes(user.role)) {
                                        canPerformAction = true;
                                    }
                                }
                                return (
                                    <tr key={user._id} className="hover">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar"><div className="mask mask-squircle w-12 h-12"><img src={user.photo || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} /></div></div>
                                                <div><div className="font-bold">{user.name}</div><div className="text-sm opacity-50">{user.email}</div></div>
                                            </div>
                                        </td>
                                        <td className="capitalize">{user.role}</td>
                                        <td>{user.branch}</td>
                                        <td><span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-error'}`}>{user.status}</span></td>
                                        <td className="space-x-2">
                                            {canPerformAction ? (<>
                                                <button onClick={() => handleOpenModal(user)} className="btn btn-ghost btn-sm"><FiEdit/></button>
                                                <button onClick={() => handleDelete(user._id)} className="btn btn-ghost btn-sm text-red-500"><FiTrash2/></button>
                                            </>) : <span>-</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            
            <div className="flex justify-between items-center mt-6">
                <p>Total Users: {pagination.totalDocuments}</p>
                <div className="join">
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={pagination.currentPage === 1} className="join-item btn">«</button>
                    <button className="join-item btn">Page {pagination.currentPage}</button>
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={pagination.currentPage === pagination.totalPages} className="join-item btn">»</button>
                </div>
            </div>

            <UserModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isEditing={!!editingUser}
                initialData={editingUser || { role: 'user', status: 'active', branch: currentUser.branch }}
                branches={branches}
                assignableRoles={assignableRoles}
            />
        </div>
    );
};

export default AUser;