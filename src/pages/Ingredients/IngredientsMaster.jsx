import React, { useState, useEffect, useContext } from "react";
import { FiEdit, FiTrash2, FiPlusCircle } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { TfiSearch } from "react-icons/tfi";
import { GoPlus } from "react-icons/go";
import Mpagination from "../../components library/Mpagination";
import MtableLoading from "../../components library/MtableLoading";
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from "../../providers/AuthProvider";
import Preloader from './../../components/Shortarea/Preloader';

const Ingredients = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);

    // General UI State
    const [activeTab, setActiveTab] = useState('ingredients'); // 'ingredients' or 'categories'
    const [searchTerm, setSearchTerm] = useState('');

    // Ingredients State
    const [ingredients, setIngredients] = useState([]);
    const [filteredIngredients, setFilteredIngredients] = useState([]);
    const [isIngredientModalOpen, setIngredientModalOpen] = useState(false);
    const [ingredientFormData, setIngredientFormData] = useState({
        name: "",
        category: "",
        unit: "",
        sku: "",
        isActive: true,
        branch: branch || "",
    });
    const [editIngredientId, setEditIngredientId] = useState(null);
    const [isIngredientTableLoading, setIngredientTableLoading] = useState(false);
    const [isIngredientFormLoading, setIngredientFormLoading] = useState(false);

    // Categories State
    const [categories, setCategories] = useState([]);
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [categoryFormData, setCategoryFormData] = useState({
        categoryName: "",
        isActive: true,
        branch: branch || "",
    });
    const [editCategoryId, setEditCategoryId] = useState(null);
    const [isCategoryFormLoading, setCategoryFormLoading] = useState(false);


    // --- DATA FETCHING ---

    // Fetch Ingredient Categories
    const fetchCategories = async () => {
        if (!branch) return;
        try {
            const response = await axiosSecure.get(`/ingredient-category/${branch}/get-all`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to fetch ingredient categories.' });
        }
    };

    // Fetch Ingredients
    const fetchIngredients = async () => {
        if (!branch) return;
        setIngredientTableLoading(true);
        try {
            const response = await axiosSecure.get(`/ingredient/${branch}/get-all`);
            setIngredients(response.data);
            setFilteredIngredients(response.data); // Initialize filtered list
        } catch (error) {
            console.error('Error fetching ingredients:', error);
            Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to fetch ingredients.' });
        } finally {
            setIngredientTableLoading(false);
        }
    };

    useEffect(() => {
        if (branch) {
            fetchCategories();
            fetchIngredients();
        }
    }, [branch, axiosSecure]);

    // Client-side search for ingredients
    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filteredData = ingredients.filter(item =>
            item.name.toLowerCase().includes(lowercasedFilter) ||
            item.sku.toLowerCase().includes(lowercasedFilter) ||
            item.category?.categoryName.toLowerCase().includes(lowercasedFilter)
        );
        setFilteredIngredients(filteredData);
    }, [searchTerm, ingredients]);


    // --- MODAL AND FORM HANDLING ---

    const closeIngredientModal = () => {
        setIngredientModalOpen(false);
        setEditIngredientId(null);
        setIngredientFormData({
            name: "", category: "", unit: "", sku: "", isActive: true, branch: branch || "",
        });
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


    // --- CRUD OPERATIONS for INGREDIENTS ---

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
            fetchIngredients();
            closeIngredientModal();
            Swal.fire({ icon: 'success', title: 'Success!', text: `Ingredient has been ${editIngredientId ? 'updated' : 'added'}.` });
        } catch (error) {
            console.error('Error saving ingredient:', error);
            Swal.fire({ icon: 'error', title: 'Error!', text: error.response?.data?.error || 'Failed to save ingredient.' });
        } finally {
            setIngredientFormLoading(false);
        }
    };

    const handleEditIngredient = (ingredient) => {
        setEditIngredientId(ingredient._id);
        setIngredientFormData({
            name: ingredient.name,
            category: ingredient.category?._id || "", // Important: use category ID
            unit: ingredient.unit,
            sku: ingredient.sku,
            isActive: ingredient.isActive,
            branch: ingredient.branch,
        });
        setIngredientModalOpen(true);
    };

    const handleRemoveIngredient = (id) => {
        Swal.fire({
            title: 'Are you sure?', text: "This action cannot be undone!", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/ingredient/delete/${id}`)
                    .then(() => {
                        fetchIngredients();
                        Swal.fire('Deleted!', 'The ingredient has been deleted.', 'success');
                    })
                    .catch(err => Swal.fire('Error!', 'Failed to delete ingredient.', 'error'));
            }
        });
    };

    // --- CRUD OPERATIONS for CATEGORIES ---

    const handleAddOrEditCategory = async () => {
        setCategoryFormLoading(true);
        const payload = { ...categoryFormData, branch: categoryFormData.branch || branch };

        try {
            if (editCategoryId) {
                await axiosSecure.put(`/ingredient-category/update/${editCategoryId}`, payload);
            } else {
                await axiosSecure.post('/ingredient-category/post', payload);
            }
            fetchCategories(); // Refresh category list for all forms
            closeCategoryModal();
            Swal.fire({ icon: 'success', title: 'Success!', text: `Category has been ${editCategoryId ? 'updated' : 'added'}.` });
        } catch (error) {
            console.error('Error saving category:', error);
            Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to save category.' });
        } finally {
            setCategoryFormLoading(false);
        }
    };

    const handleEditCategory = (category) => {
        setEditCategoryId(category._id);
        setCategoryFormData({
            categoryName: category.categoryName,
            isActive: category.isActive,
            branch: category.branch,
        });
        setCategoryModalOpen(true);
    };

    const handleRemoveCategory = (id) => {
        Swal.fire({
            title: 'Are you sure?', text: "Deleting a category will also affect ingredients using it.", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/ingredient-category/delete/${id}`)
                    .then(() => {
                        fetchCategories(); // Refresh categories
                        fetchIngredients(); // Refresh ingredients as some might be affected
                        Swal.fire('Deleted!', 'The category has been deleted.', 'success');
                    })
                    .catch(err => Swal.fire('Error!', 'Failed to delete category. It might be in use.', 'error'));
            }
        });
    };

    const { paginatedData, paginationControls, rowsPerPageAndTotal } = Mpagination({ totalData: filteredIngredients });

    return (
        <div className="p-4 min-h-screen">
            <Mtitle title="Ingredients Management" rightcontent={
                <div className='flex items-center gap-4'>
                    <button
                        onClick={() => setIngredientModalOpen(true)}
                        className="flex gap-2 cursor-pointer items-center bg-blue-600 text-white py-2 px-4 rounded-xl shadow hover:bg-blue-700 transition duration-300"
                    >
                        <span className="font-semibold">Add Ingredient</span>
                        <GoPlus className="text-xl" />
                    </button>
                    <button
                        onClick={() => setCategoryModalOpen(true)}
                        className="flex gap-2 cursor-pointer items-center bg-green-600 text-white py-2 px-4 rounded-xl shadow hover:bg-green-700 transition duration-300"
                    >
                        <span className="font-semibold">Add Category</span>
                        <FiPlusCircle className="text-lg" />
                    </button>
                </div>
            } />

            {/* Tab Navigation */}
            <div className="mt-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6">
                    <button
                        onClick={() => setActiveTab('ingredients')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'ingredients' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Ingredients
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'categories' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Categories
                    </button>
                </nav>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'ingredients' ? (
                // Ingredients View
                <div>
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-sm md:text-base">{rowsPerPageAndTotal}</div>
                        <div className='md:w-72 border shadow-sm py-2 px-3 bg-white rounded-xl'>
                            <div className='flex items-center gap-2'>
                                <TfiSearch className='text-xl font-bold text-gray-500' />
                                <input
                                    type="text"
                                    className='outline-none w-full'
                                    placeholder='Search by Name, SKU, Category...'
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    {isIngredientTableLoading ? <Preloader /> : (
                        <section className="overflow-x-auto border shadow-sm rounded-xl bg-white mt-5">
                            <table className="table w-full">
                                <thead className='bg-gray-50'>
                                    <tr className="text-sm font-semibold text-gray-600 text-left">
                                        <td className="p-4 rounded-l-xl">Name</td>
                                        <td className="p-4">Category</td>
                                        <td className="p-4">Unit</td>
                                        <td className="p-4">SKU</td>
                                        <td className="p-4">Status</td>
                                        <td className="p-4 rounded-r-xl text-center">Actions</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-8 text-gray-500">No ingredients found.</td></tr>
                                    ) : (
                                        paginatedData.map((item) => (
                                            <tr key={item._id} className="hover:bg-slate-50 border-b border-gray-100 last:border-b-0">
                                                <td className="p-4 font-medium text-gray-800">{item.name}</td>
                                                <td className="p-4 text-gray-600">{item.category?.categoryName || <span className="text-red-500">N/A</span>}</td>
                                                <td className="p-4 text-gray-600">{item.unit}</td>
                                                <td className="p-4 text-gray-600">{item.sku}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {item.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-lg flex justify-center items-center space-x-4">
                                                    <button onClick={() => handleEditIngredient(item)} className="text-gray-400 hover:text-yellow-600"><FiEdit /></button>
                                                    <button onClick={() => handleRemoveIngredient(item._id)} className="text-gray-400 hover:text-red-600"><FiTrash2 /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            <div className="p-4">
                                <MtableLoading data={filteredIngredients}></MtableLoading>
                                {paginationControls}
                            </div>
                        </section>
                    )}
                </div>
            ) : (
                // Categories View
                <div>
                    {isIngredientTableLoading ? <Preloader /> : (
                         <section className="overflow-x-auto border shadow-sm rounded-xl bg-white mt-5">
                            <table className="table w-full">
                                <thead className='bg-gray-50'>
                                    <tr className="text-sm font-semibold text-gray-600 text-left">
                                        <td className="p-4 rounded-l-xl">Category Name</td>
                                        <td className="p-4">Status</td>
                                        <td className="p-4 rounded-r-xl text-center">Actions</td>
                                    </tr>
                                </thead>
                                <tbody>
                                     {categories.length === 0 ? (
                                        <tr><td colSpan="3" className="text-center py-8 text-gray-500">No categories found.</td></tr>
                                    ) : (
                                        categories.map((cat) => (
                                            <tr key={cat._id} className="hover:bg-slate-50 border-b border-gray-100 last:border-b-0">
                                                <td className="p-4 font-medium text-gray-800">{cat.categoryName}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {cat.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-lg flex justify-center items-center space-x-4">
                                                    <button onClick={() => handleEditCategory(cat)} className="text-gray-400 hover:text-yellow-600"><FiEdit /></button>
                                                    <button onClick={() => handleRemoveCategory(cat._id)} className="text-gray-400 hover:text-red-600"><FiTrash2 /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                         </section>
                    )}
                </div>
            )}


            {/* MODAL for Add/Edit Ingredient */}
            {isIngredientModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-screen overflow-y-auto">
                        <h2 className="text-2xl mb-5 font-semibold text-gray-800">{editIngredientId ? 'Edit Ingredient' : 'Create a New Ingredient'}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col md:col-span-2">
                                <label className="mb-1 text-sm font-medium text-gray-600">Ingredient Name *</label>
                                <input type="text" name="name" value={ingredientFormData.name} onChange={handleIngredientInputChange} className="input-style" placeholder="e.g., Flour" required />
                            </div>
                            <div className="flex flex-col">
                                <label className="mb-1 text-sm font-medium text-gray-600">Category *</label>
                                <select name="category" value={ingredientFormData.category} onChange={handleIngredientInputChange} className="input-style" required>
                                    <option value="" disabled>Select a category</option>
                                    {categories.filter(c => c.isActive).map(cat => <option key={cat._id} value={cat._id}>{cat.categoryName}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <label className="mb-1 text-sm font-medium text-gray-600">SKU (Stock Code) *</label>
                                <input type="text" name="sku" value={ingredientFormData.sku} onChange={handleIngredientInputChange} className="input-style" placeholder="e.g., ING-001" required />
                            </div>
                            <div className="flex flex-col">
                                <label className="mb-1 text-sm font-medium text-gray-600">Purchase Unit *</label>
                                <select name="unit" value={ingredientFormData.unit} onChange={handleIngredientInputChange} className="input-style" required>
                                    <option value="" disabled>Select a unit</option>
                                    {['Kg', 'Ltr', 'Lbs', 'Ml', 'Pcs', 'Bottle', 'Can', 'Jar', 'Box', 'Tray', 'Roll', 'Sheet', 'Bag', 'Slice'].map(unit => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-3 mt-4">
                                <label className="text-sm font-medium text-gray-600">Status:</label>
                                <input type="checkbox" name="isActive" checked={ingredientFormData.isActive} onChange={handleIngredientInputChange} className="h-4 w-4 rounded" />
                                <span className="text-sm text-gray-700">Active</span>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button onClick={closeIngredientModal} className="btn-cancel">Cancel</button>
                            <button onClick={handleAddOrEditIngredient} className="btn-confirm" disabled={isIngredientFormLoading}>
                                {isIngredientFormLoading ? 'Saving...' : editIngredientId ? 'Save Changes' : 'Create Ingredient'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL for Add/Edit Category */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-2xl mb-5 font-semibold text-gray-800">{editCategoryId ? 'Edit Category' : 'Create New Category'}</h2>
                        <div className="flex flex-col">
                            <label className="mb-1 text-sm font-medium text-gray-600">Category Name *</label>
                            <input type="text" name="categoryName" value={categoryFormData.categoryName} onChange={handleCategoryInputChange} className="input-style" placeholder="e.g., Dairy, Vegetables" required />
                        </div>
                        <div className="flex items-center gap-3 mt-4">
                            <label className="text-sm font-medium text-gray-600">Status:</label>
                            <input type="checkbox" name="isActive" checked={categoryFormData.isActive} onChange={handleCategoryInputChange} className="h-4 w-4 rounded" />
                            <span className="text-sm text-gray-700">Active</span>
                        </div>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button onClick={closeCategoryModal} className="btn-cancel">Cancel</button>
                            <button onClick={handleAddOrEditCategory} className="btn-confirm" disabled={isCategoryFormLoading}>
                                {isCategoryFormLoading ? 'Saving...' : editCategoryId ? 'Save Changes' : 'Create Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ingredients;
