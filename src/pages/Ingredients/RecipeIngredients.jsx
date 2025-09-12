import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { FiX, FiSearch } from 'react-icons/fi';
import { FaPlus, FaPencilAlt, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Swal from 'sweetalert2';
import { useDebounce } from 'use-debounce';
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";

const RecipeIngredients = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);

    const initialRecipeFormData = {
        productId: "",
        productName: "",
        branch: branch,
        ingredients: [],
    };
    
    const dropdownRef = useRef(null);

    // Main component state
    const [products, setProducts] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [recipeFormData, setRecipeFormData] = useState(initialRecipeFormData);
    const [editRecipeProductId, setEditRecipeProductId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // --- NEW: State for main page filters ---
    const [productCategories, setProductCategories] = useState([]);
    const [productCategoryFilter, setProductCategoryFilter] = useState('all');
    const [recipeStatusFilter, setRecipeStatusFilter] = useState('all');

    // State for Recipe Modal Features
    const [ingredientCategories, setIngredientCategories] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [isIngredientLoading, setIsIngredientLoading] = useState(false);
    const [isAddIngredientModalOpen, setIsAddIngredientModalOpen] = useState(false);
    const [newIngredientData, setNewIngredientData] = useState({ name: '', unit: '', category: '' });
    const [ingredientModalCategoryFilter, setIngredientModalCategoryFilter] = useState('all');
    const [activeIngredientIndex, setActiveIngredientIndex] = useState(null);

    // --- Data Fetching Functions ---
    const fetchProducts = useCallback(async (page, limit, category, status, search) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit, category, recipeStatus: status });
            if (search) {
                params.append('search', search);
            }
            const response = await axiosSecure.get(`/recipes/branch/${branch}/products-with-status?${params.toString()}`);
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts({ data: [], meta: { totalPages: 1, totalProducts: 0 } });
        } finally {
            setLoading(false);
        }
    }, [axiosSecure, branch]);

    const fetchProductCategories = useCallback(async () => {
        if (!branch) return;
        try {
            const response = await axiosSecure.get(`/category/${branch}/get-all`);
            setProductCategories(response.data || []);
        } catch (error) {
            console.error('Error fetching product categories:', error);
        }
    }, [axiosSecure, branch]);
    
    const fetchIngredientCategories = useCallback(async () => {
        if (!branch) return;
        try {
            const response = await axiosSecure.get(`/ingredient-category/${branch}/get-all`);
            setIngredientCategories(response.data || []);
        } catch (error) {
            console.error('Error fetching ingredient categories:', error);
        }
    }, [axiosSecure, branch]);
    
    const fetchAllIngredients = useCallback(async () => {
        if (!branch) return;
        setIsIngredientLoading(true);
        try {
            const response = await axiosSecure.get(`/ingredient/${branch}/get-all`);
            const ingredientsData = response.data.data || response.data || [];
            setIngredients(ingredientsData);
        } catch (error) {
            console.error('Error fetching all ingredients:', error);
            setIngredients([]);
        } finally {
            setIsIngredientLoading(false);
        }
    }, [axiosSecure, branch]);

    const fetchIngredientsByCategory = useCallback(async (categoryId) => {
        if (!branch || !categoryId) return;
        setIsIngredientLoading(true);
        try {
            const response = await axiosSecure.get(`/ingredient/${branch}/${categoryId}/filter`);
            const ingredientsData = response.data.data || response.data || [];
            setIngredients(ingredientsData);
        } catch (error) {
            console.error(`Error fetching ingredients for category ${categoryId}:`, error);
            setIngredients([]);
        } finally {
            setIsIngredientLoading(false);
        }
    }, [axiosSecure, branch]);

    // --- useEffect Hooks ---
    useEffect(() => {
        if (branch) {
            fetchProducts(currentPage, limit, productCategoryFilter, recipeStatusFilter, debouncedSearchTerm);
        }
    }, [branch, currentPage, limit, productCategoryFilter, recipeStatusFilter, debouncedSearchTerm, fetchProducts]);

    useEffect(() => {
        if (branch) {
            fetchProductCategories();
            fetchIngredientCategories();
        }
    }, [branch, fetchProductCategories, fetchIngredientCategories]);

    useEffect(() => {
        if (isModalOpen) {
            if (ingredientModalCategoryFilter === 'all') {
                fetchAllIngredients();
            } else {
                fetchIngredientsByCategory(ingredientModalCategoryFilter);
            }
        } else {
            setIngredients([]);
        }
    }, [isModalOpen, ingredientModalCategoryFilter, fetchAllIngredients, fetchIngredientsByCategory]);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveIngredientIndex(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- Handlers for main page filters ---
    const handleCategoryFilterChange = (e) => {
        setProductCategoryFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (e) => {
        setRecipeStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setRecipeFormData(initialRecipeFormData);
        setEditRecipeProductId(null);
        setIngredientModalCategoryFilter('all');
    };

    const handleAddOrEditRecipeClick = ({ productDetails, hasRecipe, recipe }) => {
        setEditRecipeProductId(hasRecipe ? productDetails._id : null);
        setRecipeFormData({
            productId: productDetails._id,
            productName: productDetails.productName,
            branch: productDetails.branch,
            ingredients: hasRecipe ? recipe.ingredients.map(ing => ({
                ingredientId: ing.ingredientId._id,
                ingredientName: ing.ingredientId.name,
                quantity: ing.quantity,
                unit: ing.ingredientId.unit,
            })) : [{ ingredientId: "", ingredientName: "", quantity: 0, unit: "" }],
        });
        setIsModalOpen(true);
    };
    
    const handleRecipeIngredientChange = (index, field, value) => {
        const newIngredients = [...recipeFormData.ingredients];
        newIngredients[index][field] = value;
        if (field === 'ingredientName') {
            newIngredients[index]['ingredientId'] = '';
            newIngredients[index]['unit'] = '';
        }
        setRecipeFormData({ ...recipeFormData, ingredients: newIngredients });
    };

    const handleSelectIngredient = (index, selectedIngredient) => {
        const newIngredients = [...recipeFormData.ingredients];
        newIngredients[index] = {
            ...newIngredients[index],
            ingredientId: selectedIngredient._id,
            ingredientName: selectedIngredient.name,
            unit: selectedIngredient.unit,
        };
        setRecipeFormData({ ...recipeFormData, ingredients: newIngredients });
        setActiveIngredientIndex(null);
    };

    const handleAddIngredientLine = () => {
        setRecipeFormData(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, { ingredientId: "", ingredientName: "", quantity: 0, unit: "" }],
        }));
    };

    const handleRemoveIngredientLine = (index) => {
        setRecipeFormData(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== index),
        }));
    };

    const openAddNewIngredientModal = (index, currentName) => {
        const categoryExists = ingredientCategories.length > 0;
        setNewIngredientData({
            name: currentName,
            unit: '',
            category: categoryExists ? ingredientCategories[0]._id : ''
        });
        setIsAddIngredientModalOpen(true);
    };

    const handleAddNewIngredient = async () => {
        if (!newIngredientData.name || !newIngredientData.unit || !newIngredientData.category) {
            Swal.fire({ icon: 'warning', title: 'Missing Fields', text: 'Please fill out all fields for the new ingredient.' });
            return;
        }
        try {
            const response = await axiosSecure.post(`/ingredient/${branch}/post`, newIngredientData);
            const newlyCreatedIngredient = response.data;
            if(ingredientModalCategoryFilter === 'all') {
                await fetchAllIngredients();
            } else {
                await fetchIngredientsByCategory(ingredientModalCategoryFilter);
            }
            handleSelectIngredient(activeIngredientIndex, newlyCreatedIngredient.data);
            Swal.fire({ icon: 'success', title: 'Ingredient Added!', timer: 1500, showConfirmButton: false });
            setIsAddIngredientModalOpen(false);
            setNewIngredientData({ name: '', unit: '', category: '' });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to add new ingredient.' });
        }
    };

    const handleAddOrEditRecipe = async () => {
        setIsLoading(true);
        const invalidIngredient = recipeFormData.ingredients.find(ing => !ing.ingredientId || ing.quantity <= 0);
        if (invalidIngredient || recipeFormData.ingredients.length === 0) {
            Swal.fire({ icon: 'error', title: 'Invalid Ingredients', text: 'Please ensure all ingredients are selected and have a quantity greater than 0.'});
            setIsLoading(false);
            return;
        }
        try {
            if (editRecipeProductId) {
                await axiosSecure.put(`/recipes/branch/${branch}/update/${editRecipeProductId}`, recipeFormData);
            } else {
                await axiosSecure.post(`/recipes/branch/${branch}/post`, recipeFormData);
            }
            fetchProducts(currentPage, limit, productCategoryFilter, recipeStatusFilter, debouncedSearchTerm);
            closeModal();
            Swal.fire({ icon: "success", title: `Recipe ${editRecipeProductId ? 'Updated' : 'Added'}!`, timer: 2000, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: "error", title: "Error!", text: "Failed to save recipe." });
        } finally {
            setIsLoading(false);
        }
    };
    
      const handleDeleteRecipe = (productId, productName) => {
        Swal.fire({
            title: `Delete recipe for ${productName}?`,
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosSecure.delete(`/recipes/branch/${branch}/delete/${productId}`);
                    Swal.fire({ icon: 'success', timer: 2000, showConfirmButton: false, title: 'Deleted!', text: `The recipe for ${productName} has been deleted.` });
                    fetchProducts(currentPage, limit, productCategoryFilter, recipeStatusFilter, debouncedSearchTerm);
                } catch (error) {
                    Swal.fire({ icon: "error", title: "Deletion Failed!", text: "Failed to delete the recipe." });
                }
            }
        });
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const filteredProducts = products?.data || [];
    const totalPages = products?.meta?.totalPages || 0;
    const totalProducts = products?.meta?.totalProducts || 0;

    const renderPaginationControls = () => {
        const getPaginationItems = () => {
            const pageNeighbours = 1;
            const totalNumbers = (pageNeighbours * 2) + 3;
            const totalBlocks = totalNumbers + 2;

            if (totalPages > totalBlocks) {
                const startPage = Math.max(2, currentPage - pageNeighbours);
                const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours);
                let pages = Array.from({ length: (endPage - startPage) + 1 }, (_, i) => startPage + i);
                const hasLeftSpill = startPage > 2;
                const hasRightSpill = (totalPages - endPage) > 1;
                const spillOffset = totalNumbers - (pages.length + 1);

                switch (true) {
                    case (hasLeftSpill && !hasRightSpill): {
                        const extraPages = Array.from({ length: spillOffset + 1 }, (_, i) => startPage - i - 1).reverse();
                        pages = [...extraPages, ...pages];
                        break;
                    }
                    case (!hasLeftSpill && hasRightSpill): {
                        const extraPages = Array.from({ length: spillOffset + 1 }, (_, i) => endPage + i + 1);
                        pages = [...pages, ...extraPages];
                        break;
                    }
                    case (hasLeftSpill && hasRightSpill):
                    default: {
                        pages = ['...', ...pages, '...'];
                        break;
                    }
                }
                return [1, ...pages, totalPages];
            }
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        };

        const pages = getPaginationItems();

        return (
            <div className="flex justify-center mt-6">
                <div className="join">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="join-item btn"><FaChevronLeft/></button>
                    {pages.map((page, index) =>
                        typeof page === 'string' ? (
                            <button key={`${page}-${index}`} className="join-item btn btn-disabled">...</button>
                        ) : (
                            <button key={page} onClick={() => handlePageChange(page)} className={`join-item btn ${currentPage === page ? 'btn-active bg-[#1A77F2] text-white border-[#005fd8] hover:bg-[#005fd8]' : ''}`}>{page}</button>
                        )
                    )}
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="join-item btn"><FaChevronRight/></button>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200">
            <Mtitle title="Recipe Management" />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Recipe Management</h1>
            </div>

            <div className="card bg-base-100 shadow-xl mb-6">
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                        <div className="form-control">
                            <label className="label"><span className="label-text">Search Product</span></label>
                            <div className="relative">
                                <input id="search-product" type="text" className="input input-bordered w-full pl-10" placeholder="Search by product name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                            </div>
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Filter by Category</span></label>
                            <select id="product-category-filter" value={productCategoryFilter} onChange={handleCategoryFilterChange} className="select select-bordered w-full">
                                <option value="all">All Categories</option>
                                {productCategories.map(cat => (
                                    <option key={cat._id} value={cat.categoryName}>{cat.categoryName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Filter by Status</span></label>
                            <select id="recipe-status-filter" value={recipeStatusFilter} onChange={handleStatusFilterChange} className="select select-bordered w-full">
                                <option value="all">All Statuses</option>
                                <option value="exists">Has Recipe</option>
                                <option value="no_recipe">No Recipe</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? <div className="flex justify-center items-center h-96"><span className="loading loading-spinner loading-lg text-primary"></span></div> : (
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                         <div className="text-sm text-slate-500 mb-4">
                            Showing {filteredProducts.length} of {totalProducts} total products.
                        </div>
                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full border border-slate-300">
                                <thead className="bg-blue-600">
                                    <tr className="rounded-t-lg">
                                        <th className="text-white border border-slate-300">Product Name</th>
                                        <th className="text-white border border-slate-300">Category</th>
                                        <th className="text-white border border-slate-300">Price</th>
                                        <th className="text-white border border-slate-300">Recipe Status</th>
                                        <th className="text-white text-center border border-slate-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-12 text-slate-500 border border-slate-300">No products found.</td>
                                        </tr>
                                    ) : (
                                        filteredProducts.map(({ productDetails, hasRecipe, recipe }) => (
                                            <tr key={productDetails._id}>
                                                <td className="font-semibold text-slate-700 border border-slate-300">{productDetails.productName}</td>
                                                <td className="text-slate-600 border border-slate-300">{productDetails.category}</td>
                                                <td className="text-slate-600 border border-slate-300">৳{productDetails.price}</td>
                                                <td className="border border-slate-300">
                                                    <div className={`badge ${hasRecipe ? 'badge-success' : 'badge-warning'} badge-outline`}>
                                                        {hasRecipe ? 'Recipe Exists' : 'No Recipe'}
                                                    </div>
                                                </td>
                                                <td className="flex justify-center items-center space-x-2 border border-slate-300">
                                                    <button onClick={() => handleAddOrEditRecipeClick({ productDetails, hasRecipe, recipe })} className="btn btn-sm bg-[#1A77F2] text-white border-[#005fd8] hover:bg-[#005fd8] rounded-full gap-2">
                                                        {hasRecipe ? <FaPencilAlt/> : <FaPlus/>}
                                                        {hasRecipe ? 'Edit' : 'Add'}
                                                    </button>
                                                    {hasRecipe && (
                                                        <button onClick={() => handleDeleteRecipe(productDetails._id, productDetails.productName)} className="btn btn-sm btn-error btn-circle" title="Delete Recipe">
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                         {!loading && totalProducts > limit && renderPaginationControls()}
                    </div>
                </div>
            )}
           
            <dialog id="recipe_modal" className={`modal ${isModalOpen ? 'modal-open' : ''}`}>
                <div className="modal-box w-11/12 max-w-4xl">
                     <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 z-10"><FiX size={20}/></button>
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">{editRecipeProductId ? "Edit Recipe" : "Add New Recipe"} for <span className="text-primary font-bold">{recipeFormData.productName}</span></h3>
                    <div className="divider mt-0"></div>
                    
                     <div className="bg-base-200 p-4 rounded-box">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                            <div className="form-control w-full md:w-1/2">
                                <label className="label"><span className="label-text font-semibold">Filter Ingredients</span></label>
                                <select id="categoryFilter" value={ingredientModalCategoryFilter} onChange={(e) => setIngredientModalCategoryFilter(e.target.value)} className="select select-bordered w-full">
                                    <option value="all">All Categories</option>
                                    {ingredientCategories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                                    ))}
                                </select>
                            </div>
                            <button onClick={handleAddIngredientLine} className="btn bg-[#1A77F2] text-white border-[#005fd8] hover:bg-[#005fd8] rounded-full self-end gap-2">
                                <FaPlus /> Add Row
                            </button>
                        </div>
                        
                        <div className="space-y-3 max-h-[45vh] overflow-y-auto p-2 -mr-2">
                            {recipeFormData.ingredients.map((ingredient, index) => {
                                const filteredIngredientList = ingredients.filter(ing =>
                                    ing.name.toLowerCase().includes(ingredient.ingredientName.toLowerCase())
                                );
                                return (
                                <div key={index} className="card card-compact bg-base-100 shadow-sm">
                                    <div className="card-body grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                        <div className="form-control md:col-span-6 relative" ref={dropdownRef}>
                                            <label className="label pb-1"><span className="label-text font-medium">Ingredient</span></label>
                                            <input type="text" value={ingredient.ingredientName} onFocus={() => setActiveIngredientIndex(index)} onChange={(e) => handleRecipeIngredientChange(index, "ingredientName", e.target.value)} className="input input-bordered w-full" placeholder="Type to search..." />
                                            
                                            {activeIngredientIndex === index && (
                                                <ul className="absolute z-50 w-full mt-1 menu p-2 shadow bg-base-100 rounded-box max-h-60 overflow-y-auto">
                                                    {isIngredientLoading ? (
                                                        <li className="p-2 text-center text-slate-500"><span className="loading loading-spinner"></span></li>
                                                    ) : (
                                                        <>
                                                            {filteredIngredientList.length > 0 ? (
                                                                filteredIngredientList.map(ing => (
                                                                    <li key={ing._id}><a onClick={() => handleSelectIngredient(index, ing)}>{ing.name}</a></li>
                                                                ))
                                                            ) : (
                                                                <li className="p-2 text-center text-slate-500">No ingredients found.</li>
                                                            )}
                                                            {!isIngredientLoading && ingredient.ingredientName && filteredIngredientList.length === 0 && (
                                                                <>
                                                                <div className="divider my-1"></div>
                                                                <li><a onClick={() => openAddNewIngredientModal(index, ingredient.ingredientName)} className="text-primary font-semibold gap-2">
                                                                    <FaPlus/> Create "{ingredient.ingredientName}"
                                                                </a></li>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </ul>
                                            )}
                                        </div>
                                        
                                        <div className="form-control md:col-span-4">
                                            <label className="label pb-1"><span className="label-text font-medium">Quantity {ingredient.unit && `(${ingredient.unit})`}</span></label>
                                            <input type="number" value={ingredient.quantity} onChange={(e) => handleRecipeIngredientChange(index, "quantity", parseFloat(e.target.value) || 0)} className="input input-bordered w-full" placeholder="e.g., 0.5"/>
                                        </div>

                                        <div className="md:col-span-2 flex justify-end">
                                            <button onClick={() => handleRemoveIngredientLine(index)} className="btn btn-error btn-circle">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                )})}
                        </div>
                    </div>
                     <div className="modal-action mt-6">
                        <button onClick={closeModal} className="btn btn-outline border-[#1A77F2] text-[#1A77F2] hover:bg-[#1A77F2] hover:text-white rounded-full">Cancel</button>
                        <button onClick={handleAddOrEditRecipe} className="btn bg-[#1A77F2] text-white border-[#005fd8] hover:bg-[#005fd8] rounded-full w-40" disabled={isLoading}>
                             {isLoading && <span className="loading loading-spinner"></span>}
                            {isLoading ? "Saving" : (editRecipeProductId ? "Save Changes" : "Add Recipe")}
                        </button>
                    </div>
                </div>
            </dialog>

            <dialog id="add_ingredient_modal" className={`modal ${isAddIngredientModalOpen ? 'modal-open' : ''}`}>
                 <div className="modal-box">
                     <button onClick={() => setIsAddIngredientModalOpen(false)} className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"><FiX/></button>
                     <h3 className="text-xl font-semibold text-slate-700">Add New Ingredient</h3>
                     <div className="divider mt-2 mb-4"></div>
                     <div className="space-y-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text">Ingredient Name</span></label>
                            <input type="text" value={newIngredientData.name} onChange={(e) => setNewIngredientData({...newIngredientData, name: e.target.value})} className="input input-bordered w-full" />
                        </div>
                        <div className="form-control">
                             <label className="label"><span className="label-text">Unit (e.g., kg, L, pcs)</span></label>
                            <input type="text" value={newIngredientData.unit} onChange={(e) => setNewIngredientData({...newIngredientData, unit: e.target.value})} className="input input-bordered w-full" />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Category</span></label>
                            <select value={newIngredientData.category} onChange={(e) => setNewIngredientData({...newIngredientData, category: e.target.value})} className="select select-bordered w-full">
                                <option value="">Select a Category</option>
                                {ingredientCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.categoryName}</option>)}
                            </select>
                        </div>
                     </div>
                     <div className="modal-action">
                        <button onClick={() => setIsAddIngredientModalOpen(false)} className="btn btn-outline border-[#1A77F2] text-[#1A77F2] hover:bg-[#1A77F2] hover:text-white rounded-full">Cancel</button>
                        <button onClick={handleAddNewIngredient} className="btn bg-[#1A77F2] text-white border-[#005fd8] hover:bg-[#005fd8] rounded-full gap-2"><FaPlus/>Save Ingredient</button>
                     </div>
                 </div>
            </dialog>
        </div>
    );
};

export default RecipeIngredients;