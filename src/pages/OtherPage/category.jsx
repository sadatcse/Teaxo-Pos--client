import React, { useState, useEffect, useContext, useCallback } from "react";
import { FaPlus, FaPencilAlt, FaTrash } from "react-icons/fa";
import { FiX, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from "framer-motion";
import Swal from 'sweetalert2';
import Mpagination from "../../components library/Mpagination";
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from "../../providers/AuthProvider";

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
  const [isLoading, setIsLoading] = useState(false);
  const [Loading, setLoading] = useState(false);
  const LOCAL_STORAGE_KEY = `categories_${branch}`;

  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, [LOCAL_STORAGE_KEY]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      clearLocalStorage();
      const response = await axiosSecure.get(`/category/${branch}/get-all`);
      const filteredData = response.data.filter(
        (category) => category.branch === branch && category.isActive === true
      );
      setCategories(response.data);
      setFilteredCategories(response.data);
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ data: filteredData, timestamp: Date.now() })
      );
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  }, [axiosSecure, branch, LOCAL_STORAGE_KEY, clearLocalStorage]);
  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddOrEditCategory = async () => {
    setIsLoading(true);
    try {
      if (editId) {
        await axiosSecure.put(`/category/update/${editId}`, formData);
      } else {
        await axiosSecure.post('/category/post', formData);
      }
      
      fetchCategories();
      setIsModalOpen(false);
      setFormData({
        categoryName: "",
        serial: "",
        branch: branch || "",
        isActive: true,
      });
      setEditId(null);
    } catch (error) {
      console.error('Error saving category:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to save category. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id) => {
    const category = categories.find(c => c._id === id);
    setEditId(id);
    setFormData(category);
    setIsModalOpen(true);
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

  const { paginatedData, paginationControls } = Mpagination({ totalData: filteredCategories });

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200">

        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <motion.h1 
                className="text-3xl font-bold text-slate-800"
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.5 }}
            >
                Manage Categories
            </motion.h1>
            <motion.button 
                onClick={() => setIsModalOpen(true)} 
                className="btn bg-[#1A77F2] text-white border-[#005fd8] hover:bg-[#005fd8] rounded-full gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <FaPlus /> Add New Category
            </motion.button>
        </div>

        <motion.div 
            className="card bg-base-100 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <div className="card-body">
                <div className="flex justify-end mb-4">
                    <div className="form-control w-full max-w-xs">
                        <div className="relative">
                            <input type="text" placeholder="Search by name..." className="input input-bordered w-full pl-10" value={searchTerm} onChange={handleSearchChange} />
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        </div>
                    </div>
                </div>

                {Loading ? (
                    <div className="flex justify-center items-center h-96"><span className="loading loading-spinner loading-lg text-primary"></span></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full border border-slate-300">
                            <thead className="bg-blue-600">
                                <tr className="rounded-t-lg">
                                    <th className="text-white border border-slate-300">Category Name</th>
                                    <th className="text-white border border-slate-300">Serial</th>
                                    <th className="text-white border border-slate-300">Status</th>
                                    <th className="text-white text-center border border-slate-300">Actions</th>
                                </tr>
                            </thead>
                            <AnimatePresence>
                                <tbody>
                                    {paginatedData.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-12 text-slate-500 border border-slate-300">
                                                <div className="flex flex-col items-center gap-4">
                                                    <FiX size={48} className="text-slate-400" />
                                                    <span className="font-semibold">No categories found.</span>
                                                    <span className="text-sm">Add one to get started!</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map((category) => (
                                            <motion.tr 
                                                key={category._id}
                                                layout
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <td className="font-semibold text-slate-700 border border-slate-300">{category.categoryName}</td>
                                                <td className="text-slate-600 border border-slate-300">{category.serial}</td>
                                                <td className="border border-slate-300">
                                                    <div className={`badge ${category.isActive ? 'badge-success' : 'badge-error'} badge-outline`}>
                                                        {category.isActive ? 'Active' : 'Inactive'}
                                                    </div>
                                                </td>
                                                <td className="flex justify-center items-center space-x-2 border border-slate-300">
                                                    <div className="tooltip" data-tip="Edit Item">
                                                        <motion.button 
                                                            onClick={() => handleEdit(category._id)} 
                                                            className="btn btn-success btn-circle text-white"
                                                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                        >
                                                            <FaPencilAlt />
                                                        </motion.button>
                                                    </div>
                                                    <div className="tooltip" data-tip="Delete Item">
                                                        <motion.button 
                                                            onClick={() => handleRemove(category._id)} 
                                                            className="btn btn-error btn-circle text-white"
                                                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                        >
                                                            <FaTrash />
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </AnimatePresence>
                        </table>
                    </div>
                )}
                {paginationControls}
            </div>
        </motion.div>

        <AnimatePresence>
        {isModalOpen && (
             <motion.dialog 
                className="modal modal-open"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div 
                    className="modal-box"
                    initial={{ scale: 0.9, y: -50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: -50 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <button onClick={() => { setIsModalOpen(false); setEditId(null); setFormData({ categoryName: "", serial: "", branch: branch || "", isActive: true }); }} className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"><FiX/></button>
                    <h3 className="text-xl font-semibold text-slate-700">{editId ? 'Edit Category' : 'Add New Category'}</h3>
                    <div className="divider mt-2 mb-4"></div>
                    <div className="space-y-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text">Category Name</span></label>
                            <input type="text" value={formData.categoryName} onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })} className="input input-bordered w-full" placeholder="e.g., Appetizers" />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Serial Number</span></label>
                            <input type="number" value={formData.serial} onChange={(e) => setFormData({ ...formData, serial: e.target.value })} className="input input-bordered w-full" placeholder="e.g., 1" />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Status</span></label>
                            <select value={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })} className="select select-bordered w-full">
                                <option value={true}>Active</option>
                                <option value={false}>Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-action">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setIsModalOpen(false); setEditId(null); setFormData({ categoryName: "", serial: "", branch: branch || "", isActive: true }); }} className="btn btn-outline border-[#1A77F2] text-[#1A77F2] hover:bg-[#1A77F2] hover:text-white rounded-full">Cancel</motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddOrEditCategory} className="btn bg-[#1A77F2] text-white border-[#005fd8] hover:bg-[#005fd8] rounded-full w-28" disabled={isLoading}>
                            {isLoading ? <span className="loading loading-spinner"></span> : editId ? 'Save' : 'Add'}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.dialog>
        )}
        </AnimatePresence>
    </div>
  );
};

export default Category;