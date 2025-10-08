import React, { useState, useEffect, useContext, useCallback } from "react";
import { FiEdit, FiTrash2, FiPlusCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { TfiSearch } from "react-icons/tfi";
import { GoPlus } from "react-icons/go";
import { motion, AnimatePresence } from 'framer-motion';
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from "../../providers/AuthProvider";
import MtableLoading from "../../components library/MtableLoading"; 
import useActionPermissions from "../../Hook/useActionPermissions";

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        // Always show the first page
        pages.push(1);

        // Show pages around the current page
        if (currentPage > 3) {
            pages.push('...');
        }
        if (currentPage > 2) {
            pages.push(currentPage - 1);
        }
        if (currentPage !== 1 && currentPage !== totalPages) {
            pages.push(currentPage);
        }
        if (currentPage < totalPages - 1) {
            pages.push(currentPage + 1);
        }
        if (currentPage < totalPages - 2) {
            pages.push('...');
        }
        
        // Always show the last page, avoiding duplicates
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return [...new Set(pages)]; // Remove duplicates
    };

    return (
        <div className="flex items-center justify-between pt-4">
            <span className="text-sm text-slate-700">
                Page <span className="font-bold text-blue-600">{currentPage}</span> of <span className="font-bold text-blue-600">{totalPages}</span>
            </span>
            <div className="flex items-center gap-1">
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn btn-ghost btn-sm btn-circle text-blue-600 hover:bg-blue-100 disabled:bg-transparent disabled:text-slate-400"
                >
                    <FiChevronLeft className="h-5 w-5" />
                </motion.button>
                {getPageNumbers().map((page, index) =>
                    page === '...' ? (
                        <span key={index} className="px-2 text-slate-500">...</span>
                    ) : (
                        <motion.button
                            key={index}
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => onPageChange(page)}
                            className={`btn btn-sm btn-circle ${currentPage === page ? 'bg-blue-600 text-white hover:bg-blue-700' : 'btn-ghost text-slate-700 hover:bg-blue-100'}`}
                        >
                            {page}
                        </motion.button>
                    )
                )}
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn btn-ghost btn-sm btn-circle text-blue-600 hover:bg-blue-100 disabled:bg-transparent disabled:text-slate-400"
                >
                    <FiChevronRight className="h-5 w-5" />
                </motion.button>
            </div>
        </div>
    );
};

const Ingredients = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);

    const [activeTab, setActiveTab] = useState('ingredients');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const [ingredients, setIngredients] = useState([]);
    const [isIngredientModalOpen, setIngredientModalOpen] = useState(false);
    const [ingredientFormData, setIngredientFormData] = useState({ name: "", category: "", unit: "", sku: "", isActive: true, branch: branch || "" });
    const [editIngredientId, setEditIngredientId] = useState(null);
    const [isIngredientTableLoading, setIngredientTableLoading] = useState(false);
    const [isIngredientFormLoading, setIngredientFormLoading] = useState(false);
    const [ingredientPage, setIngredientPage] = useState(1);
    const [ingredientPagination, setIngredientPagination] = useState({});
   const { canPerform, loading: permissionsLoading } = useActionPermissions();
    const [categories, setCategories] = useState([]);
    const [activeCategories, setActiveCategories] = useState([]);
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [categoryFormData, setCategoryFormData] = useState({ categoryName: "", isActive: true, branch: branch || "" });
    const [editCategoryId, setEditCategoryId] = useState(null);
    const [isCategoryTableLoading, setCategoryTableLoading] = useState(false);
    const [isCategoryFormLoading, setCategoryFormLoading] = useState(false);
    const [categoryPage, setCategoryPage] = useState(1);
    const [categoryPagination, setCategoryPagination] = useState({});

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const fetchActiveCategoriesForDropdown = useCallback(async () => {
        if (!branch) return;
        try {
            const response = await axiosSecure.get(`/ingredient-category/${branch}/active`);
            setActiveCategories(response.data);
        } catch (error) {
            console.error('Error fetching active categories:', error);
        }
    }, [axiosSecure, branch]);
    
    const fetchPaginatedData = useCallback(async () => {
        if (!branch) return;

        if (activeTab === 'ingredients') {
            setIngredientTableLoading(true);
            try {
                const params = new URLSearchParams({ page: ingredientPage, limit: 10, search: debouncedSearchTerm });
                const { data } = await axiosSecure.get(`/ingredient/${branch}/pagination?${params.toString()}`);
                setIngredients(data.data);
                setIngredientPagination(data.pagination);
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to fetch ingredients.' });
            } finally {
                setIngredientTableLoading(false);
            }
        } else {
             setCategoryTableLoading(true);
             try {
                const params = new URLSearchParams({ page: categoryPage, limit: 10, search: debouncedSearchTerm });
                const { data } = await axiosSecure.get(`/ingredient-category/${branch}/pagination?${params.toString()}`);
                setCategories(data.data);
                setCategoryPagination(data.pagination);
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to fetch categories.' });
            } finally {
                setCategoryTableLoading(false);
            }
        }
    }, [axiosSecure, branch, activeTab, ingredientPage, categoryPage, debouncedSearchTerm]);

    useEffect(() => {
        fetchPaginatedData();
    }, [fetchPaginatedData]);
    
    useEffect(() => {
        if (isIngredientModalOpen) {
            fetchActiveCategoriesForDropdown();
        }
    }, [isIngredientModalOpen, fetchActiveCategoriesForDropdown]);

    useEffect(() => {
        const pageToReset = activeTab === 'ingredients' ? setIngredientPage : setCategoryPage;
        if (debouncedSearchTerm) {
            pageToReset(1);
        }
    }, [debouncedSearchTerm, activeTab]);
    
    useEffect(() => {
        setSearchTerm('');
        setDebouncedSearchTerm('');
    }, [activeTab]);

    const closeIngredientModal = () => {
        setIngredientModalOpen(false);
        setEditIngredientId(null);
        setIngredientFormData({ name: "", category: "", unit: "", sku: "", isActive: true, branch: branch || "" });
    };

    const closeCategoryModal = () => {
        setCategoryModalOpen(false);
        setEditCategoryId(null);
        setCategoryFormData({ categoryName: "", isActive: true, branch: branch || "" });
    };

    const handleIngredientInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setIngredientFormData({ ...ingredientFormData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleCategoryInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCategoryFormData({ ...categoryFormData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleAddOrEditIngredient = async () => {
        if (!ingredientFormData.category || !ingredientFormData.unit) {
            Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Please fill all required fields.' });
            return;
        }
        setIngredientFormLoading(true);
        const payload = { ...ingredientFormData, branch: ingredientFormData.branch || branch };
        try {
            if (editIngredientId) {
                await axiosSecure.put(`/ingredient/update/${editIngredientId}`, payload);
            } else {
                await axiosSecure.post('/ingredient/post', payload);
            }
            fetchPaginatedData();
            closeIngredientModal();
            Swal.fire({ icon: 'success', title: 'Success!', text: `Ingredient has been ${editIngredientId ? 'updated' : 'added'}.` });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error!', text: error.response?.data?.error || 'Failed to save ingredient.' });
        } finally {
            setIngredientFormLoading(false);
        }
    };

    const handleEditIngredient = (ingredient) => {
        setEditIngredientId(ingredient._id);
        setIngredientFormData({
            name: ingredient.name, category: ingredient.category?._id || "", unit: ingredient.unit,
            sku: ingredient.sku, isActive: ingredient.isActive, branch: ingredient.branch,
        });
        setIngredientModalOpen(true);
    };

    const handleRemoveIngredient = (id) => {
           if (!canPerform("Ingredient Management", "delete")) {
        Swal.fire("Access Denied", "You do not have permission to delete ingredients.", "error");
        return;
    }
        Swal.fire({
            title: 'Are you sure?', text: "This action cannot be undone!", icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/ingredient/delete/${id}`)
                    .then(() => { fetchPaginatedData(); Swal.fire('Deleted!', 'The ingredient has been deleted.', 'success'); })
                    .catch(err => Swal.fire('Error!', 'Failed to delete ingredient.', 'error'));
            }
        });
    };

    const handleAddOrEditCategory = async () => {
            const requiredPermission = editCategoryId ? "edit" : "add";
    if (!canPerform("Ingredient Management", requiredPermission)) {
        Swal.fire("Access Denied", `You do not have permission to ${requiredPermission} categories.`, "error");
        return;
    }
        setCategoryFormLoading(true);
        const payload = { ...categoryFormData, branch: categoryFormData.branch || branch };
        try {
            if (editCategoryId) {
                await axiosSecure.put(`/ingredient-category/update/${editCategoryId}`, payload);
            } else {
                await axiosSecure.post('/ingredient-category/post', payload);
            }
            fetchPaginatedData();
            closeCategoryModal();
            Swal.fire({ icon: 'success', title: 'Success!', text: `Category has been ${editCategoryId ? 'updated' : 'added'}.` });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to save category.' });
        } finally {
            setCategoryFormLoading(false);
        }
    };

    const handleEditCategory = (category) => {
          if (!canPerform("Ingredient Management", "edit")) {
        Swal.fire("Access Denied", "You do not have permission to edit categories.", "error");
        return;
    }
        setEditCategoryId(category._id);
        setCategoryFormData({ categoryName: category.categoryName, isActive: category.isActive, branch: category.branch });
        setCategoryModalOpen(true);
    };

    const handleRemoveCategory = (id) => {
            if (!canPerform("Ingredient Management", "delete")) {
        Swal.fire("Access Denied", "You do not have permission to delete categories.", "error");
        return;
    }
        Swal.fire({
            title: 'Are you sure?', text: "Deleting a category will also affect ingredients using it.", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/ingredient-category/delete/${id}`)
                    .then(() => { fetchPaginatedData(); fetchActiveCategoriesForDropdown(); Swal.fire('Deleted!', 'The category has been deleted.', 'success'); })
                    .catch(err => Swal.fire('Error!', 'Failed to delete category. It might be in use.', 'error'));
            }
        });
    };
    
    const inputClass = "w-full border border-slate-200 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150";

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-base-200 min-h-screen">
            <Mtitle title="Ingredients & Categories" 
     
                rightcontent={
                    <div className='flex items-center gap-4'>
                                  <div className='relative w-full md:w-80'>
                        <TfiSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400' />
                        <input type="text" className={`${inputClass} pl-10`} placeholder='Search...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    {canPerform("Ingredient Management", "add") && (
                        <>      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCategoryModalOpen(true)} className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-xl shadow-md hover:bg-green-700 transition duration-300">
                            <FiPlusCircle className="text-lg" /> Add Category
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIngredientModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-xl shadow-md hover:bg-blue-700 transition duration-300">
                            <GoPlus className="text-xl" /> Add Ingredient
                        </motion.button>           </>
            )}
        </div>
    } 
/>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body p-4 sm:p-6 lg:p-8">
                    <div role="tablist" className="tabs tabs-boxed mb-6"><a role="tab" className={`tab ${activeTab === 'ingredients' ? 'bg-blue-600 text-white' : ''}`} onClick={() => setActiveTab('ingredients')}>Ingredients</a><a role="tab" className={`tab ${activeTab === 'categories' ? 'bg-blue-600 text-white' : ''}`} onClick={() => setActiveTab('categories')}>Categories</a></div>
                    
                    {activeTab === 'ingredients' ? (
                        <div>
                            {isIngredientTableLoading ? <MtableLoading /> : (
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead className="bg-blue-600 text-white uppercase text-xs font-medium tracking-wider"><tr><th className="p-3 rounded-tl-lg">Name</th><th className="p-3">Category</th><th className="p-3">Unit</th><th className="p-3">SKU</th><th className="p-3">Status</th><th className="p-3 rounded-tr-lg text-center">Actions</th></tr></thead>
                                        <tbody><AnimatePresence>{ingredients.length === 0 ? (<tr><td colSpan="6" className="text-center py-8 text-slate-700">No ingredients found.</td></tr>) : (ingredients.map((item) => (<motion.tr key={item._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-blue-50 border-b border-slate-200 text-sm text-slate-700"><td className="p-3 font-medium">{item.name}</td><td className="p-3">{item.category?.categoryName || <span className="text-red-500">N/A</span>}</td><td className="p-3">{item.unit}</td><td className="p-3">{item.sku}</td><td className="p-3"><span className={`px-3 py-1 text-xs font-medium rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{item.isActive ? 'Active' : 'Inactive'}</span></td>
                                       <td className="p-3 text-center">
    <div className="flex justify-center items-center gap-2">
        {canPerform("Ingredient Management", "edit") && (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEditIngredient(item)} className="btn btn-circle btn-sm bg-yellow-600 hover:bg-yellow-700 text-white" title="Edit Ingredient"><FiEdit /></motion.button>
        )}
        {canPerform("Ingredient Management", "delete") && (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleRemoveIngredient(item._id)} className="btn btn-circle btn-sm bg-red-600 hover:bg-red-700 text-white" title="Delete Ingredient"><FiTrash2 /></motion.button>
        )}
    </div>
</td></motion.tr>)))}</AnimatePresence></tbody>
                                    </table>
                                    <PaginationControls currentPage={ingredientPage} totalPages={ingredientPagination.totalPages} onPageChange={setIngredientPage} />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            {isCategoryTableLoading ? <MtableLoading /> : (
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead className="bg-blue-600 text-white uppercase text-xs font-medium tracking-wider"><tr><th className="p-3 rounded-tl-lg">Category Name</th><th className="p-3">Status</th><th className="p-3 rounded-tr-lg text-center">Actions</th></tr></thead>
                                        <tbody><AnimatePresence>{categories.length === 0 ? (<tr><td colSpan="3" className="text-center py-8 text-slate-700">No categories found.</td></tr>) : (categories.map((cat) => (<motion.tr key={cat._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-blue-50 border-b border-slate-200 text-sm text-slate-700"><td className="p-3 font-medium">{cat.categoryName}</td><td className="p-3"><span className={`px-3 py-1 text-xs font-medium rounded-full ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{cat.isActive ? 'Active' : 'Inactive'}</span></td><td className="p-3 text-center">
    <div className="flex justify-center items-center gap-2">
        {canPerform("Ingredient Management", "edit") && (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEditCategory(cat)} className="btn btn-circle btn-sm bg-yellow-600 hover:bg-yellow-700 text-white" title="Edit Category"><FiEdit /></motion.button>
        )}
        {canPerform("Ingredient Management", "delete") && (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleRemoveCategory(cat._id)} className="btn btn-circle btn-sm bg-red-600 hover:bg-red-700 text-white" title="Delete Category"><FiTrash2 /></motion.button>
        )}
    </div>
</td></motion.tr>)))}</AnimatePresence></tbody>
                                    </table>
                                    <PaginationControls currentPage={categoryPage} totalPages={categoryPagination.totalPages} onPageChange={setCategoryPage} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {isIngredientModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-lg">
                            <h2 className="text-xl font-semibold text-blue-600 mb-6">{editIngredientId ? 'Edit Ingredient' : 'Create New Ingredient'}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="md:col-span-2"><label className="label-text text-slate-700">Ingredient Name *</label><input type="text" name="name" value={ingredientFormData.name} onChange={handleIngredientInputChange} className={`${inputClass} mt-1`} placeholder="e.g., Flour" required /></div>
                                <div><label className="label-text text-slate-700">Category *</label><select name="category" value={ingredientFormData.category} onChange={handleIngredientInputChange} className={`${inputClass} mt-1`} required><option value="" disabled>Select a category</option>{activeCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.categoryName}</option>)}</select></div>
                                <div><label className="label-text text-slate-700">SKU (Stock Code) *</label><input type="text" name="sku" value={ingredientFormData.sku} onChange={handleIngredientInputChange} className={`${inputClass} mt-1`} placeholder="e.g., ING-001" required /></div>
                                <div><label className="label-text text-slate-700">Purchase Unit *</label><select name="unit" value={ingredientFormData.unit} onChange={handleIngredientInputChange} className={`${inputClass} mt-1`} required><option value="" disabled>Select a unit</option>{['Kg', 'Ltr', 'Lbs', 'Ml', 'Pcs', 'Bottle', 'Can', 'Jar', 'Box', 'Tray', 'Roll', 'Sheet', 'Bag', 'Slice'].map(unit => (<option key={unit} value={unit}>{unit}</option>))}</select></div>
                                <div className="flex items-center gap-3 mt-4"><label className="label-text text-slate-700">Status:</label><input type="checkbox" name="isActive" checked={ingredientFormData.isActive} onChange={handleIngredientInputChange} className="checkbox checkbox-primary" /></div>
                            </div>
                            <div className="flex justify-end space-x-4 mt-8">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={closeIngredientModal} className="btn rounded-xl">Cancel</motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddOrEditIngredient} className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md" disabled={isIngredientFormLoading}>{isIngredientFormLoading ? 'Saving...' : editIngredientId ? 'Save Changes' : 'Create Ingredient'}</motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
                {isCategoryModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-md">
                            <h2 className="text-xl font-semibold text-blue-600 mb-6">{editCategoryId ? 'Edit Category' : 'Create New Category'}</h2>
                            <div><label className="label-text text-slate-700">Category Name *</label><input type="text" name="categoryName" value={categoryFormData.categoryName} onChange={handleCategoryInputChange} className={`${inputClass} mt-1`} placeholder="e.g., Dairy, Vegetables" required /></div>
                            <div className="flex items-center gap-3 mt-4"><label className="label-text text-slate-700">Status:</label><input type="checkbox" name="isActive" checked={categoryFormData.isActive} onChange={handleCategoryInputChange} className="checkbox checkbox-primary" /></div>
                            <div className="flex justify-end space-x-4 mt-8">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={closeCategoryModal} className="btn rounded-xl">Cancel</motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddOrEditCategory} className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md" disabled={isCategoryFormLoading}>{isCategoryFormLoading ? 'Saving...' : editCategoryId ? 'Save Changes' : 'Create Category'}</motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Ingredients;