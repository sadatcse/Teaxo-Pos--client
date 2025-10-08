import React, { useState, useEffect, useContext, useCallback } from "react";
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { GoPlus } from "react-icons/go";
import { motion, AnimatePresence } from 'framer-motion';

import Mpagination from "../../components library/Mpagination";
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import MtableLoading from "../../components library/MtableLoading";
import useActionPermissions from "../../Hook/useActionPermissions";

const UserRoleManagement = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const [userRoles, setUserRoles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ userrole: "", branch: branch });
    const [editId, setEditId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(false);
   const { canPerform, loading: permissionsLoading } = useActionPermissions();
    const fetchUserRoles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosSecure.get(`/userrole/branch/${branch}`);
            setUserRoles(response.data);
        } catch (error) {
            console.error("Error fetching user roles:", error);
        }
        setLoading(false);
    }, [axiosSecure, branch]);

    useEffect(() => {
        fetchUserRoles();
    }, [fetchUserRoles]);

    const handleAddOrEditUserRole = async () => {
        setIsLoading(true);

        // Create a new object with the userrole converted to lowercase for submission
        const payload = {
            ...formData,
            userrole: formData.userrole.toLowerCase()
        };

        try {
            if (editId) {
                await axiosSecure.put(`/userrole/update/${editId}`, payload);
            } else {
                await axiosSecure.post(`/userrole/post`, payload);
            }
            fetchUserRoles();
            setIsModalOpen(false);
            setFormData({ userrole: "", branch: branch });
            setEditId(null);
        } catch (error) {
            console.error("Error saving user role:", error);
            Swal.fire({ icon: "error", title: "Error!", text: "Failed to save user role. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (id) => {
        const userRole = userRoles.find((ur) => ur._id === id);
        setEditId(id);
        setFormData({ ...userRole, branch });
        setIsModalOpen(true);
    };

    const handleRemove = (id) => {
        Swal.fire({
            title: "Are you sure?", text: "You won't be able to revert this!", icon: "warning",
            showCancelButton: true, confirmButtonColor: "#3085d6", cancelButtonColor: "#d33", confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/userrole/delete/${id}`)
                    .then(() => { fetchUserRoles(); Swal.fire("Deleted!", "The user role has been deleted.", "success"); })
                    .catch((error) => { console.error("Error deleting user role:", error); Swal.fire("Error!", "Failed to delete user role.", "error"); });
            }
        });
    };

    const { paginatedData, paginationControls, rowsPerPageAndTotal } = Mpagination({ totalData: userRoles });

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-base-200 min-h-screen">
            <Mtitle title="Resturant Role Management" rightcontent={
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-xl shadow-md hover:bg-blue-700 transition duration-300">
                    <GoPlus className="text-xl" /> Add New User Role
                </motion.button>
            } />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="card bg-base-100 shadow-xl mt-6">
                <div className="p-4">
                    <div className="text-sm text-slate-700 mb-4">{rowsPerPageAndTotal}</div>
                    {loading ? <MtableLoading /> : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className='bg-blue-600 text-white uppercase text-xs font-medium tracking-wider'>
                                    <tr>
                                        <th className="p-3 rounded-tl-lg">User Role</th>
                                        <th className="p-3 rounded-tr-lg text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {paginatedData.length === 0 ? (
                                            <tr><td colSpan="2" className="text-center py-8 text-slate-700">No user roles found.</td></tr>
                                        ) : (
                                            paginatedData.map((userRole) => (
                                                <motion.tr key={userRole._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-blue-50 border-b border-slate-200 text-sm text-slate-700">
                                                    <td className="p-3 font-medium">
                                                        {userRole.userrole && userRole.userrole.charAt(0).toUpperCase() + userRole.userrole.slice(1)}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex justify-center items-center gap-2">
                                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(userRole._id)} className="btn btn-circle btn-sm bg-yellow-600 hover:bg-yellow-700 text-white" title="Edit User Role"><FiEdit /></motion.button>
                                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleRemove(userRole._id)} className="btn btn-circle btn-sm bg-red-600 hover:bg-red-700 text-white" title="Delete User Role"><FiTrash2 /></motion.button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                            <div className="pt-4">{paginationControls}</div>
                        </div>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-md">
                            <h2 className="text-xl font-semibold text-blue-600 mb-6">{editId ? "Edit User Role" : "Add New User Role"}</h2>
                            <input type="text" value={formData.userrole} onChange={(e) => setFormData({ ...formData, userrole: e.target.value })} className="w-full border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150" placeholder="User Role" />
                            <div className="flex justify-end gap-4 mt-8">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setIsModalOpen(false); setFormData({ userrole: "", branch: branch }); setEditId(null); }} className="btn rounded-xl">Cancel</motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddOrEditUserRole} className="btn bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md" disabled={isLoading}>{isLoading ? "Saving..." : editId ? "Save Changes" : "Add User Role"}</motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserRoleManagement;