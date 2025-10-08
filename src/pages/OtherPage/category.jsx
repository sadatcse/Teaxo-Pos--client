import React, { useState, useEffect, useContext, useCallback } from "react";
import { FaPlus, FaPencilAlt, FaTrash } from "react-icons/fa";
import { FiX, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from "framer-motion";
import Swal from 'sweetalert2';

import Mpagination from "../../components library/Mpagination";
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from "../../providers/AuthProvider";
import MtableLoading from "../../components library/MtableLoading"; 
import useActionPermissions from "../../Hook/useActionPermissions";

const Category = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        categoryName: "",
        serial: "",
        branch: branch || "",
        isActive: true,
    });
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const LOCAL_STORAGE_KEY = `categories_${branch}`;
   const { canPerform, loading: permissionsLoading } = useActionPermissions();
    const clearLocalStorage = useCallback(() => {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }, [LOCAL_STORAGE_KEY]);

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            clearLocalStorage();
            const response = await axiosSecure.get(`/category/${branch}/get-all`);
            const activeCategories = response.data.filter(c => c.isActive);
            
            setCategories(response.data);
            setFilteredCategories(response.data);
            
            localStorage.setItem(
                LOCAL_STORAGE_KEY,
                JSON.stringify({ data: activeCategories, timestamp: Date.now() })
            );
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setIsLoading(false);
        }
    }, [axiosSecure, branch, LOCAL_STORAGE_KEY, clearLocalStorage]);
    
    useEffect(() => {
        if (branch) {
            fetchCategories();
        }
    }, [fetchCategories, branch]);

    const handleAddOrEditCategory = async () => {
        setIsSubmitting(true);
        try {
            if (editId) {
                await axiosSecure.put(`/category/update/${editId}`, formData);
            } else {
                await axiosSecure.post('/category/post', formData);
            }
            fetchCategories();
            closeModal();
        } catch (error) {
            console.error('Error saving category:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to save category. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (id) => {
        const category = categories.find(c => c._id === id);
        if (category) {
            setEditId(id);
            setFormData(category);
            setIsModalOpen(true);
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
        }).then((result) => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/category/delete/${id}`)
                    .then(() => {
                        fetchCategories();
                        Swal.fire('Deleted!', 'The category has been deleted.', 'success');
                    })
                    .catch(error => {
                        console.error('Error deleting category:', error);
                        Swal.fire('Error!', 'Failed to delete category.', 'error');
                    });
            }
        });
    };

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        const filtered = categories.filter(category =>
            category.categoryName.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredCategories(filtered);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditId(null);
        setFormData({
            categoryName: "",
            serial: "",
            branch: branch || "",
            isActive: true,
        });
    };

    const { paginatedData, paginationControls, rowsPerPageAndTotal } = Mpagination({ totalData: filteredCategories });
    const inputClass = "w-full border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150";

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200">
            <Mtitle title="Manage Categories" rightcontent={
                <div className="flex items-center gap-4">
                    <div className="form-control">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search by name..." 
                                className="input input-bordered w-full sm:w-64 pl-10" 
                                value={searchTerm} 
                                onChange={handleSearchChange} 
                            />
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        </div>
                    </div>
                    <motion.button 
                        onClick={() => setIsModalOpen(true)} 
                        className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-lg gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaPlus /> Add New
                    </motion.button>
                </div>
            } />

            <motion.div 
                className="card bg-base-100 shadow-xl mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <div className="card-body p-4 sm:p-6">
   

                    {isLoading ? <MtableLoading /> : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className="bg-blue-600 text-white uppercase text-xs">
                                    <tr>
                                        <th className="p-3 rounded-tl-lg">Category Name</th>
                                        <th className="p-3">Serial</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3 text-center rounded-tr-lg">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {paginatedData.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center py-12 text-slate-700">
                                                    No categories found.
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedData.map((category) => (
                                                <motion.tr 
                                                    key={category._id} 
                                                    layout 
                                                    initial={{ opacity: 0 }} 
                                                    animate={{ opacity: 1 }} 
                                                    exit={{ opacity: 0 }} 
                                                    className="hover:bg-blue-50 border-b border-slate-200 text-sm text-slate-700"
                                                >
                                                    <td className="p-3 font-medium">{category.categoryName}</td>
                                                    <td className="p-3">{category.serial}</td>
                                                    <td className="p-3">
                                                        <div className={`badge ${category.isActive ? 'badge-success' : 'badge-error'} text-white`}>
                                                            {category.isActive ? 'Active' : 'Inactive'}
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex justify-center items-center gap-2">
                                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(category._id)} className="btn btn-circle btn-sm bg-yellow-600 hover:bg-yellow-700 text-white" title="Edit Category"><FaPencilAlt /></motion.button>
                                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleRemove(category._id)} className="btn btn-circle btn-sm bg-red-600 hover:bg-red-700 text-white" title="Delete Category"><FaTrash /></motion.button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                            {paginationControls}
                        </div>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.9, opacity: 0 }} 
                            className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-md"
                        >
                            <h3 className="text-xl font-semibold text-blue-600 mb-6">{editId ? 'Edit Category' : 'Add New Category'}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="label-text text-slate-700">Category Name</label>
                                    <input type="text" value={formData.categoryName} onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })} className={`${inputClass} mt-1`} placeholder="e.g., Appetizers" />
                                </div>
                                <div>
                                    <label className="label-text text-slate-700">Serial Number</label>
                                    <input type="number" value={formData.serial} onChange={(e) => setFormData({ ...formData, serial: e.target.value })} className={`${inputClass} mt-1`} placeholder="e.g., 1" />
                                </div>
                                <div>
                                    <label className="label-text text-slate-700">Status</label>
                                    <select value={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })} className={`${inputClass} mt-1 select`}>
                                        <option value={true}>Active</option>
                                        <option value={false}>Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-8">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={closeModal} className="btn rounded-xl">Cancel</motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddOrEditCategory} className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md w-28" disabled={isSubmitting}>
                                    {isSubmitting ? <span className="loading loading-spinner"></span> : editId ? 'Save' : 'Add'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Category;