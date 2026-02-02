import React, { useState, useEffect, useContext, useCallback } from "react";
import { FaPlus, FaPencilAlt, FaTrash, FaLayerGroup } from "react-icons/fa"; 
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
    
    // Modals State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false); 

    // Form Data
    const [formData, setFormData] = useState({
        categoryName: "",
        serial: "",
        branch: branch || "",
        isActive: true,
    });
    
    // Bulk Data State
    const [bulkText, setBulkText] = useState(""); 
    
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

    // Single Add/Edit Handler
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
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: editId ? 'Category updated!' : 'Category added!',
                timer: 1500,
                showConfirmButton: false
            });
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

    // Bulk Add Handler
    const handleBulkAdd = async () => {
        if (!bulkText.trim()) {
            Swal.fire('Warning', 'Please enter at least one category name.', 'warning');
            return;
        }

        const categoriesList = bulkText.split('\n').map(c => c.trim()).filter(c => c !== "");

        if(categoriesList.length === 0) return;

        setIsSubmitting(true);
        try {
            await axiosSecure.post('/category/bulk-post', {
                branch: branch,
                categories: categoriesList
            });

            fetchCategories();
            closeBulkModal();
            Swal.fire({
                icon: 'success',
                title: 'Bulk Upload Successful',
                text: `${categoriesList.length} categories have been added.`,
            });
        } catch (error) {
            console.error('Error bulk saving:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to upload categories.',
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

    const closeBulkModal = () => {
        setIsBulkModalOpen(false);
        setBulkText("");
    };

    const { paginatedData, paginationControls } = Mpagination({ totalData: filteredCategories });
    const inputClass = "w-full border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150";

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200">
            <Mtitle title="Manage Categories" rightcontent={
                <div className="flex items-center gap-4">
                    <div className="form-control hidden sm:block">
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
                    
                    {/* Bulk Add Button - OUTLINE STYLE (Blue) */}
                    <motion.button 
                        onClick={() => setIsBulkModalOpen(true)} 
                        className="btn btn-outline text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white rounded-lg gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaLayerGroup /> Bulk Add
                    </motion.button>

                    {/* Single Add Button - SOLID STYLE (Blue) */}
                    <motion.button 
                        onClick={() => setIsModalOpen(true)} 
                        className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-lg gap-2 border-none"
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

            {/* Single Add/Edit Modal */}
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
                                    <input type="number" value={formData.serial} onChange={(e) => setFormData({ ...formData, serial: e.target.value })} className={`${inputClass} mt-1`} placeholder="Auto-generated if empty" />
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

            {/* Bulk Add Modal */}
            <AnimatePresence>
                {isBulkModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.9, opacity: 0 }} 
                            className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-lg"
                        >
                            <div className="flex justify-between items-center mb-6">
                                {/* Changed text color to blue-600 */}
                                <h3 className="text-xl font-semibold text-blue-600 flex items-center gap-2">
                                    <FaLayerGroup /> Bulk Add Categories
                                </h3>
                                <button onClick={closeBulkModal} className="btn btn-sm btn-circle btn-ghost"><FiX size={20}/></button>
                            </div>
                            
                            <div className="alert alert-info shadow-sm mb-4 text-xs">
                                <div>
                                    <span className="font-bold">Info:</span> Serial numbers will be generated automatically based on the last existing serial.
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Paste Category Names (One per line)</span>
                                </label>
                                <textarea 
                                    className="textarea textarea-bordered h-64 w-full text-base leading-relaxed" 
                                    placeholder={`Appetizers\nMain Course\nDesserts\nBeverages\n...`}
                                    value={bulkText}
                                    onChange={(e) => setBulkText(e.target.value)}
                                ></textarea>
                                <label className="label">
                                    <span className="label-text-alt text-slate-500">
                                        Lines: {bulkText.split('\n').filter(x => x.trim()).length}
                                    </span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-4 mt-6">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={closeBulkModal} className="btn rounded-xl">Cancel</motion.button>
                                {/* Changed background color to blue-600 */}
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleBulkAdd} className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md" disabled={isSubmitting}>
                                    {isSubmitting ? <span className="loading loading-spinner"></span> : 'Upload All'}
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