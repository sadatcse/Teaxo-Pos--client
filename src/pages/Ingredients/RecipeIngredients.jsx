import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { FiX, FiSearch } from 'react-icons/fi';
import { FaPlus, FaPencilAlt, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Swal from 'sweetalert2';
import { useDebounce } from 'use-debounce';
import { motion, AnimatePresence } from 'framer-motion';
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import MtableLoading from "../../components library/MtableLoading"; 

const RecipeIngredients = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const dropdownRef = useRef(null);

    const initialRecipeFormData = { productId: "", productName: "", branch: branch, ingredients: [] };
    
    const [products, setProducts] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [recipeFormData, setRecipeFormData] = useState(initialRecipeFormData);
    const [editRecipeProductId, setEditRecipeProductId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);
    const [productCategories, setProductCategories] = useState([]);
    const [productCategoryFilter, setProductCategoryFilter] = useState('all');
    const [recipeStatusFilter, setRecipeStatusFilter] = useState('all');
    const [ingredientCategories, setIngredientCategories] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [isIngredientLoading, setIsIngredientLoading] = useState(false);
    const [isAddIngredientModalOpen, setIsAddIngredientModalOpen] = useState(false);
    const [newIngredientData, setNewIngredientData] = useState({ name: '', unit: '', category: '' });
    const [ingredientModalCategoryFilter, setIngredientModalCategoryFilter] = useState('all');
    const [activeIngredientIndex, setActiveIngredientIndex] = useState(null);

    const fetchProducts = useCallback(async (page, limit, category, status, search) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit, category, recipeStatus: status });
            if (search) { params.append('search', search); }
            const response = await axiosSecure.get(`/recipes/branch/${branch}/products-with-status?${params.toString()}`);
            setProducts(response.data);
        } catch (error) { console.error("Error fetching products:", error); setProducts({ data: [], meta: { totalPages: 1, totalProducts: 0 } }); } finally { setLoading(false); }
    }, [axiosSecure, branch]);

    const fetchProductCategories = useCallback(async () => {
        if (!branch) return;
        try {
            const response = await axiosSecure.get(`/category/${branch}/get-all`);
            setProductCategories(response.data || []);
        } catch (error) { console.error('Error fetching product categories:', error); }
    }, [axiosSecure, branch]);

    const fetchIngredientCategories = useCallback(async () => {
        if (!branch) return;
        try {
            const response = await axiosSecure.get(`/ingredient-category/${branch}/get-all`);
            setIngredientCategories(response.data || []);
        } catch (error) { console.error('Error fetching ingredient categories:', error); }
    }, [axiosSecure, branch]);

    const fetchAllIngredients = useCallback(async () => {
        if (!branch) return;
        setIsIngredientLoading(true);
        try {
            const response = await axiosSecure.get(`/ingredient/${branch}/get-all`);
            const ingredientsData = response.data.data || response.data || [];
            setIngredients(ingredientsData);
        } catch (error) { console.error('Error fetching all ingredients:', error); setIngredients([]); } finally { setIsIngredientLoading(false); }
    }, [axiosSecure, branch]);

    const fetchIngredientsByCategory = useCallback(async (categoryId) => {
        if (!branch || !categoryId) return;
        setIsIngredientLoading(true);
        try {
            const response = await axiosSecure.get(`/ingredient/${branch}/${categoryId}/filter`);
            const ingredientsData = response.data.data || response.data || [];
            setIngredients(ingredientsData);
        } catch (error) { console.error(`Error fetching ingredients for category ${categoryId}:`, error); setIngredients([]); } finally { setIsIngredientLoading(false); }
    }, [axiosSecure, branch]);

    useEffect(() => {
        if (branch) { fetchProducts(currentPage, limit, productCategoryFilter, recipeStatusFilter, debouncedSearchTerm); }
    }, [branch, currentPage, limit, productCategoryFilter, recipeStatusFilter, debouncedSearchTerm, fetchProducts]);

    useEffect(() => {
        if (branch) { fetchProductCategories(); fetchIngredientCategories(); }
    }, [branch, fetchProductCategories, fetchIngredientCategories]);

    useEffect(() => {
        if (isModalOpen) {
            if (ingredientModalCategoryFilter === 'all') { fetchAllIngredients(); } else { fetchIngredientsByCategory(ingredientModalCategoryFilter); }
        } else { setIngredients([]); }
    }, [isModalOpen, ingredientModalCategoryFilter, fetchAllIngredients, fetchIngredientsByCategory]);

    useEffect(() => {
        const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) { setActiveIngredientIndex(null); } };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCategoryFilterChange = (e) => { setProductCategoryFilter(e.target.value); setCurrentPage(1); };
    const handleStatusFilterChange = (e) => { setRecipeStatusFilter(e.target.value); setCurrentPage(1); };
    const closeModal = () => { setIsModalOpen(false); setRecipeFormData(initialRecipeFormData); setEditRecipeProductId(null); setIngredientModalCategoryFilter('all'); };

    const handleAddOrEditRecipeClick = ({ productDetails, hasRecipe, recipe }) => {
        setEditRecipeProductId(hasRecipe ? productDetails._id : null);
        setRecipeFormData({
            productId: productDetails._id, productName: productDetails.productName, branch: productDetails.branch,
            ingredients: hasRecipe ? recipe.ingredients.map(ing => ({
                ingredientId: ing.ingredientId._id, ingredientName: ing.ingredientId.name,
                quantity: ing.quantity, unit: ing.ingredientId.unit,
            })) : [{ ingredientId: "", ingredientName: "", quantity: 0, unit: "" }],
        });
        setIsModalOpen(true);
    };

    const handleRecipeIngredientChange = (index, field, value) => {
        const newIngredients = [...recipeFormData.ingredients];
        newIngredients[index][field] = value;
        if (field === 'ingredientName') { newIngredients[index]['ingredientId'] = ''; newIngredients[index]['unit'] = ''; }
        setRecipeFormData({ ...recipeFormData, ingredients: newIngredients });
    };

    const handleSelectIngredient = (index, selectedIngredient) => {
        const newIngredients = [...recipeFormData.ingredients];
        newIngredients[index] = { ...newIngredients[index], ingredientId: selectedIngredient._id, ingredientName: selectedIngredient.name, unit: selectedIngredient.unit, };
        setRecipeFormData({ ...recipeFormData, ingredients: newIngredients });
        setActiveIngredientIndex(null);
    };

    const handleAddIngredientLine = () => { setRecipeFormData(prev => ({ ...prev, ingredients: [...prev.ingredients, { ingredientId: "", ingredientName: "", quantity: 0, unit: "" }] })); };
    const handleRemoveIngredientLine = (index) => { setRecipeFormData(prev => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index) })); };

    const openAddNewIngredientModal = (index, currentName) => {
        const categoryExists = ingredientCategories.length > 0;
        setNewIngredientData({ name: currentName, unit: '', category: categoryExists ? ingredientCategories[0]._id : '' });
        setIsAddIngredientModalOpen(true);
    };

    const handleAddNewIngredient = async () => {
        if (!newIngredientData.name || !newIngredientData.unit || !newIngredientData.category) { Swal.fire({ icon: 'warning', title: 'Missing Fields', text: 'Please fill out all fields for the new ingredient.' }); return; }
        try {
            const response = await axiosSecure.post(`/ingredient/${branch}/post`, newIngredientData);
            const newlyCreatedIngredient = response.data;
            if (ingredientModalCategoryFilter === 'all') { await fetchAllIngredients(); } else { await fetchIngredientsByCategory(ingredientModalCategoryFilter); }
            handleSelectIngredient(activeIngredientIndex, newlyCreatedIngredient.data);
            Swal.fire({ icon: 'success', title: 'Ingredient Added!', timer: 1500, showConfirmButton: false });
            setIsAddIngredientModalOpen(false);
            setNewIngredientData({ name: '', unit: '', category: '' });
        } catch (error) { Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to add new ingredient.' }); }
    };

    const handleAddOrEditRecipe = async () => {
        setIsLoading(true);
        const invalidIngredient = recipeFormData.ingredients.find(ing => !ing.ingredientId || ing.quantity <= 0);
        if (invalidIngredient || recipeFormData.ingredients.length === 0) { Swal.fire({ icon: 'error', title: 'Invalid Ingredients', text: 'Please ensure all ingredients are selected and have a quantity greater than 0.' }); setIsLoading(false); return; }
        try {
            if (editRecipeProductId) { await axiosSecure.put(`/recipes/branch/${branch}/update/${editRecipeProductId}`, recipeFormData); } else { await axiosSecure.post(`/recipes/branch/${branch}/post`, recipeFormData); }
            fetchProducts(currentPage, limit, productCategoryFilter, recipeStatusFilter, debouncedSearchTerm);
            closeModal();
            Swal.fire({ icon: "success", title: `Recipe ${editRecipeProductId ? 'Updated' : 'Added'}!`, timer: 2000, showConfirmButton: false });
        } catch (error) { Swal.fire({ icon: "error", title: "Error!", text: "Failed to save recipe." }); } finally { setIsLoading(false); }
    };

    const handleDeleteRecipe = (productId, productName) => {
        Swal.fire({ title: `Delete recipe for ${productName}?`, text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Yes, delete it!' })
            .then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await axiosSecure.delete(`/recipes/branch/${branch}/delete/${productId}`);
                        Swal.fire({ icon: 'success', timer: 2000, showConfirmButton: false, title: 'Deleted!', text: `The recipe for ${productName} has been deleted.` });
                        fetchProducts(currentPage, limit, productCategoryFilter, recipeStatusFilter, debouncedSearchTerm);
                    } catch (error) { Swal.fire({ icon: "error", title: "Deletion Failed!", text: "Failed to delete the recipe." }); }
                }
            });
    };

    const handlePageChange = (pageNumber) => { if (pageNumber > 0 && pageNumber <= totalPages) { setCurrentPage(pageNumber); } };
    const filteredProducts = products?.data || [];
    const totalPages = products?.meta?.totalPages || 0;
    const totalProducts = products?.meta?.totalProducts || 0;
    const inputClass = "w-full border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150";

    const renderPaginationControls = () => {
        // ... (existing pagination logic) ...
        const getPaginationItems = () => {
            const pageNeighbours = 1; const totalNumbers = (pageNeighbours * 2) + 3; const totalBlocks = totalNumbers + 2;
            if (totalPages > totalBlocks) {
                const startPage = Math.max(2, currentPage - pageNeighbours); const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours); let pages = Array.from({ length: (endPage - startPage) + 1 }, (_, i) => startPage + i);
                const hasLeftSpill = startPage > 2; const hasRightSpill = (totalPages - endPage) > 1; const spillOffset = totalNumbers - (pages.length + 1);
                switch (true) {
                    case (hasLeftSpill && !hasRightSpill): { const extraPages = Array.from({ length: spillOffset + 1 }, (_, i) => startPage - i - 1).reverse(); pages = [...extraPages, ...pages]; break; }
                    case (!hasLeftSpill && hasRightSpill): { const extraPages = Array.from({ length: spillOffset + 1 }, (_, i) => endPage + i + 1); pages = [...pages, ...extraPages]; break; }
                    default: { pages = ['...', ...pages, '...']; break; }
                }
                return [1, ...pages, totalPages];
            }
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        };
        const pages = getPaginationItems();
        return (
            <div className="flex justify-center mt-6">
                <div className="join">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="join-item btn btn-sm"><FaChevronLeft /></button>
                    {pages.map((page, index) => typeof page === 'string' ? (<button key={`${page}-${index}`} className="join-item btn btn-sm btn-disabled">...</button>) : (<button key={page} onClick={() => handlePageChange(page)} className={`join-item btn btn-sm ${currentPage === page ? 'btn-active bg-blue-600 hover:bg-blue-700 text-white' : ''}`}>{page}</button>))}
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="join-item btn btn-sm"><FaChevronRight /></button>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200">
            <Mtitle title="Recipe Management" />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="card bg-base-100 shadow-xl mb-6">
                <div className="card-body p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                    <div className="form-control"><label className="label-text text-slate-700">Search Product</label><div className="relative mt-1"><input type="text" className={`${inputClass} pl-10`} placeholder="Search by product name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /></div></div>
                    <div className="form-control"><label className="label-text text-slate-700">Filter by Category</label><select value={productCategoryFilter} onChange={handleCategoryFilterChange} className={`${inputClass} mt-1`}><option value="all">All Categories</option>{productCategories.map(cat => (<option key={cat._id} value={cat.categoryName}>{cat.categoryName}</option>))}</select></div>
                    <div className="form-control"><label className="label-text text-slate-700">Filter by Status</label><select value={recipeStatusFilter} onChange={handleStatusFilterChange} className={`${inputClass} mt-1`}><option value="all">All Statuses</option><option value="exists">Has Recipe</option><option value="no_recipe">No Recipe</option></select></div>
                </div>
            </motion.div>

            {loading ? <MtableLoading /> : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="card bg-base-100 shadow-xl">
                    <div className="card-body p-4 sm:p-6">
                        <div className="text-sm text-slate-700 mb-4">Showing {filteredProducts.length} of {totalProducts} total products.</div>
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className="bg-blue-600 text-white uppercase text-xs font-medium tracking-wider"><tr><th className="p-3 rounded-tl-lg">Product</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Recipe Status</th><th className="p-3 text-center rounded-tr-lg">Actions</th></tr></thead>
                                <tbody>
                                    <AnimatePresence>
                                        {filteredProducts.length === 0 ? (<tr><td colSpan="5" className="text-center py-12 text-slate-700">No products found.</td></tr>) : (
                                            filteredProducts.map(({ productDetails, hasRecipe, recipe }) => (
                                                <motion.tr key={productDetails._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-blue-50 border-b border-slate-200 text-sm">
                                                    <td className="p-3 font-medium text-slate-700">{productDetails.productName}</td><td className="p-3 text-slate-700">{productDetails.category}</td><td className="p-3 text-slate-700">৳{productDetails.price}</td>
                                                    <td className="p-3"><div className={`badge ${hasRecipe ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} badge-outline`}>{hasRecipe ? 'Recipe Exists' : 'No Recipe'}</div></td>
                                                    <td className="p-3"><div className="flex justify-center items-center gap-2">
                                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleAddOrEditRecipeClick({ productDetails, hasRecipe, recipe })} className={`btn btn-circle btn-sm text-white ${hasRecipe ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{hasRecipe ? <FaPencilAlt /> : <FaPlus />}</motion.button>
                                                        {hasRecipe && (<motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteRecipe(productDetails._id, productDetails.productName)} className="btn btn-circle btn-sm btn-error text-white"><FaTrash /></motion.button>)}
                                                    </div></td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                            {!loading && totalProducts > limit && renderPaginationControls()}
                        </div>
                    </div>
                </motion.div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                            <h3 className="text-xl font-semibold text-blue-600 mb-2">{editRecipeProductId ? "Edit Recipe" : "Add New Recipe"} for <span className="font-bold">{recipeFormData.productName}</span></h3>
                            <div className="divider mt-0"></div>
                            <div className="flex-grow overflow-y-auto pr-2">
                                <div className="bg-base-200 p-4 rounded-lg">
                                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                                        <select value={ingredientModalCategoryFilter} onChange={(e) => setIngredientModalCategoryFilter(e.target.value)} className={`${inputClass} w-full md:w-1/2`}><option value="all">All Categories</option>{ingredientCategories.map(cat => (<option key={cat._id} value={cat._id}>{cat.categoryName}</option>))}</select>
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddIngredientLine} className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md"><FaPlus /> Add Row</motion.button>
                                    </div>
                                    <div className="space-y-3">
                                        {recipeFormData.ingredients.map((ingredient, index) => {
                                            const filteredIngredientList = ingredients.filter(ing => ing.name.toLowerCase().includes(ingredient.ingredientName.toLowerCase()));
                                            return (
                                                <div key={index} className="card card-compact bg-base-100 shadow-sm"><div className="card-body grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                                    <div className="form-control md:col-span-6 relative" ref={dropdownRef}>
                                                        <label className="label-text text-slate-700">Ingredient</label>
                                                        <input type="text" value={ingredient.ingredientName} onFocus={() => setActiveIngredientIndex(index)} onChange={(e) => handleRecipeIngredientChange(index, "ingredientName", e.target.value)} className={`${inputClass} mt-1`} placeholder="Type to search..." />
                                                        {activeIngredientIndex === index && (<ul className="absolute z-50 w-full mt-1 menu p-2 shadow bg-base-100 rounded-box max-h-60 overflow-y-auto">{isIngredientLoading ? (<li><span className="loading loading-spinner"></span></li>) : (<>{filteredIngredientList.length > 0 ? (filteredIngredientList.map(ing => (<li key={ing._id}><a onClick={() => handleSelectIngredient(index, ing)}>{ing.name}</a></li>))) : (<li><span className="p-2 text-center text-slate-500">No ingredients found.</span></li>)}{!isIngredientLoading && ingredient.ingredientName && filteredIngredientList.length === 0 && (<><div className="divider my-1"></div><li><a onClick={() => openAddNewIngredientModal(index, ingredient.ingredientName)} className="text-blue-600 font-semibold gap-2"><FaPlus /> Create "{ingredient.ingredientName}"</a></li></>)}</>)}</ul>)}
                                                    </div>
                                                    <div className="form-control md:col-span-4"><label className="label-text text-slate-700">Quantity {ingredient.unit && `(${ingredient.unit})`}</label><input type="number" value={ingredient.quantity} onChange={(e) => handleRecipeIngredientChange(index, "quantity", parseFloat(e.target.value) || 0)} className={`${inputClass} mt-1`} placeholder="e.g., 0.5" /></div>
                                                    <div className="md:col-span-2 flex justify-end"><motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleRemoveIngredientLine(index)} className="btn btn-error btn-circle text-white"><FaTrash /></motion.button></div>
                                                </div></div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-action mt-6 pt-4 border-t border-slate-200">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={closeModal} className="btn rounded-xl">Cancel</motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddOrEditRecipe} className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md w-40" disabled={isLoading}>{isLoading ? <span className="loading loading-spinner"></span> : (editRecipeProductId ? "Save Changes" : "Add Recipe")}</motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
                {isAddIngredientModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-md">
                            <h3 className="text-xl font-semibold text-blue-600">Add New Ingredient</h3>
                            <div className="divider mt-2 mb-4"></div>
                            <div className="space-y-4">
                                <div><label className="label-text text-slate-700">Ingredient Name</label><input type="text" value={newIngredientData.name} onChange={(e) => setNewIngredientData({ ...newIngredientData, name: e.target.value })} className={`${inputClass} mt-1`} /></div>
                                <div><label className="label-text text-slate-700">Unit (e.g., kg, L, pcs)</label><input type="text" value={newIngredientData.unit} onChange={(e) => setNewIngredientData({ ...newIngredientData, unit: e.target.value })} className={`${inputClass} mt-1`} /></div>
                                <div><label className="label-text text-slate-700">Category</label><select value={newIngredientData.category} onChange={(e) => setNewIngredientData({ ...newIngredientData, category: e.target.value })} className={`${inputClass} mt-1`}><option value="">Select a Category</option>{ingredientCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.categoryName}</option>)}</select></div>
                            </div>
                            <div className="flex justify-end gap-4 mt-8">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsAddIngredientModalOpen(false)} className="btn rounded-xl">Cancel</motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddNewIngredient} className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md"><FaPlus className="mr-2" />Save Ingredient</motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RecipeIngredients;