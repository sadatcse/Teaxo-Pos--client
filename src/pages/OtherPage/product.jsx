import React, { useState, useEffect, useContext, useCallback } from "react";
import { FiEdit, FiTrash2, FiX, FiPlus } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { TfiSearch } from "react-icons/tfi";
import { GoPlus } from "react-icons/go";
import { FaLayerGroup, FaMagic } from "react-icons/fa"; 
import { useDebounce } from 'use-debounce'; 

// Components
import Mpagination from "../../components library/Mpagination";
import MtableLoading from "../../components library/MtableLoading";
import Mtitle from "../../components library/Mtitle";
import Preloader from "../../components/Shortarea/Preloader";

// Hooks & Config
import ImageUpload from "../../config/ImageUploadcpanel";
import CategroieHook from "../../Hook/Categroie";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import useActionPermissions from "../../Hook/useActionPermissions"; 
import { AuthContext } from "../../providers/AuthProvider";

const Product = () => {
    // --- HOOKS & CONTEXT ---
    const { categoryNames, loading: categoriesLoading, error: categoriesError } = CategroieHook();
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const { canPerform } = useActionPermissions(); 

    // --- STATE MANAGEMENT ---
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    
    // UI States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false); 
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Search State
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

    // Single Add/Edit Form Data
    const initialFormData = {
        category: "", 
        productName: "", 
        price: "", 
        vat: 0, 
        sd: 0, 
        vatType: "amount", 
        sdType: "amount", 
        status: "available", 
        productDetails: "", 
        branch: branch, 
        photo: "",
        flavour: false, 
        cFlavor: false, 
        addOns: false
    };
    const [formData, setFormData] = useState(initialFormData);
    const [editId, setEditId] = useState(null);

    // Temporary Inputs for Single Edit Calc
    const [vatInput, setVatInput] = useState("");
    const [sdInput, setSdInput] = useState("");
    const [debouncedVatInput] = useDebounce(vatInput, 500);
    const [debouncedSdInput] = useDebounce(sdInput, 500);

    // --- BULK STATE ---
    const [bulkCategory, setBulkCategory] = useState(""); 
    
    // Global Auto-fill States
    const [globalVat, setGlobalVat] = useState(0);
    const [globalVatType, setGlobalVatType] = useState("percentage");
    const [globalSd, setGlobalSd] = useState(0);
    const [globalSdType, setGlobalSdType] = useState("percentage");

    const [bulkItems, setBulkItems] = useState([
        { productName: "", price: "", vat: 0, vatType: "percentage", sd: 0, sdType: "percentage" }
    ]);

    // --- FETCH DATA ---
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosSecure.get(`/product/branch/${branch}/get-all`);
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    }, [axiosSecure, branch]);

    useEffect(() => { 
        fetchProducts(); 
    }, [fetchProducts]);

    // --- SEARCH FILTER ---
    useEffect(() => {
        const filtered = products.filter((product) =>
            product.productName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
        setFilteredProducts(filtered);
    }, [products, debouncedSearchTerm]);

    // --- SINGLE FORM CALCULATION ---
    useEffect(() => {
        const numericValue = parseFloat(debouncedVatInput);
        if (!isNaN(numericValue)) {
            const calculatedVAT = formData.vatType === "percentage"
                ? (numericValue / 100) * (parseFloat(formData.price) || 0)
                : numericValue;
            
            if (formData.vat !== calculatedVAT) {
                setFormData((prev) => ({ ...prev, vat: calculatedVAT }));
            }
        }
    }, [debouncedVatInput, formData.vatType, formData.price]);

    useEffect(() => {
        const numericValue = parseFloat(debouncedSdInput);
        if (!isNaN(numericValue)) {
            const calculatedSD = formData.sdType === "percentage"
                ? (numericValue / 100) * (parseFloat(formData.price) || 0)
                : numericValue;

            if (formData.sd !== calculatedSD) {
                setFormData((prev) => ({ ...prev, sd: calculatedSD }));
            }
        }
    }, [debouncedSdInput, formData.sdType, formData.price]);

    // --- HANDLERS: SINGLE ADD/EDIT ---
    const closeModal = () => {
        setIsModalOpen(false);
        setFormData(initialFormData);
        setVatInput("");
        setSdInput("");
        setEditId(null);
    };

    const handleEdit = (id) => {
        const product = products.find((p) => p._id === id);
        setEditId(id);
        
        // Note: Backend stores result as Amount, so we default types to 'amount' for edit
        setFormData({ 
            ...initialFormData, 
            ...product, 
            vatType: "amount", 
            sdType: "amount" 
        });

        setVatInput(product.vat);
        setSdInput(product.sd);
        
        setIsModalOpen(true);
    };

    const handleAddOrEditProduct = async () => {
        setIsLoading(true);
        try {
            if (editId && !canPerform('Product List', 'edit')) {
                Swal.fire("Error", "You do not have permission to edit.", "error");
                return;
            }
            if (!editId && !canPerform('Product List', 'add')) {
                Swal.fire("Error", "You do not have permission to add.", "error");
                return;
            }

            if (editId) {
                await axiosSecure.put(`/product/update/${editId}`, formData);
            } else {
                await axiosSecure.post("/product/post", formData);
            }
            fetchProducts();
            closeModal();
            Swal.fire({ 
                icon: "success", 
                title: "Success", 
                text: `Product ${editId ? "updated" : "created"}!`, 
                timer: 1500, 
                showConfirmButton: false 
            });
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: "error", title: "Error", text: "Failed to save product." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = (id) => {
        if (!canPerform('Product List', 'delete')) {
            Swal.fire("Error", "You do not have permission to delete.", "error");
            return;
        }

        Swal.fire({
            title: "Are you sure?", 
            text: "You won't be able to revert this!", 
            icon: "warning", 
            showCancelButton: true, 
            confirmButtonColor: "#d33", 
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/product/delete/${id}`).then(() => {
                    fetchProducts();
                    Swal.fire("Deleted!", "Product has been deleted.", "success");
                }).catch(() => Swal.fire("Error!", "Failed to delete product.", "error"));
            }
        });
    };

    // --- HANDLERS: BULK ADD ---
    const handleBulkChange = (index, field, value) => {
        const newItems = [...bulkItems];
        newItems[index][field] = value;
        setBulkItems(newItems);
    };

    const addBulkRow = () => {
        setBulkItems([
            ...bulkItems, 
            { 
                productName: "", price: "", 
                vat: globalVat, vatType: globalVatType, 
                sd: globalSd, sdType: globalSdType 
            }
        ]);
    };

    const removeBulkRow = (index) => {
        if(bulkItems.length > 1) {
            const newItems = bulkItems.filter((_, i) => i !== index);
            setBulkItems(newItems);
        }
    };

    const handleGlobalUpdate = (field, value) => {
        if (field === 'vat') setGlobalVat(value);
        if (field === 'vatType') setGlobalVatType(value);
        if (field === 'sd') setGlobalSd(value);
        if (field === 'sdType') setGlobalSdType(value);

        const newItems = bulkItems.map(item => ({
            ...item,
            [field]: value
        }));
        setBulkItems(newItems);
    };

    const handleBulkSubmit = async () => {
        if (!canPerform('Product List', 'add')) {
            Swal.fire("Error", "You do not have permission to add products.", "error");
            return;
        }

        if (!bulkCategory) {
            Swal.fire('Warning', 'Please select a Category.', 'warning');
            return;
        }
        const invalidItems = bulkItems.filter(item => !item.productName || !item.price);
        if (invalidItems.length > 0) {
            Swal.fire('Warning', 'Please fill in Name and Price for all items.', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            const productsList = bulkItems.map(item => ({
                name: item.productName,
                category: bulkCategory,
                price: item.price,
                vat: item.vat, 
                vatType: item.vatType,
                sd: item.sd, 
                sdType: item.sdType
            }));

            await axiosSecure.post('/product/bulk-post', { branch, products: productsList });

            fetchProducts();
            setIsBulkModalOpen(false);
            setBulkCategory("");
            setGlobalVat(0); setGlobalSd(0); 
            setBulkItems([{ productName: "", price: "", vat: 0, vatType: "percentage", sd: 0, sdType: "percentage" }]);
            Swal.fire({ icon: 'success', title: 'Success', text: 'Products uploaded successfully!' });
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to upload items.' });
        } finally {
            setIsLoading(false);
        }
    };

    const calculateRowTotal = (item) => {
        const price = parseFloat(item.price) || 0;
        const vat = item.vatType === 'percentage' ? (price * (parseFloat(item.vat)||0) / 100) : (parseFloat(item.vat)||0);
        const sd = item.sdType === 'percentage' ? (price * (parseFloat(item.sd)||0) / 100) : (parseFloat(item.sd)||0);
        return (price + vat + sd).toFixed(2);
    }

    const { paginatedData, paginationControls, rowsPerPageAndTotal } = Mpagination({ totalData: filteredProducts });

    return (
        <div className="p-4 min-h-screen bg-gray-50">
            {/* Title Bar */}
            <Mtitle title="Product Management" rightcontent={
                <div className="flex justify-end gap-4 items-center flex-wrap sm:flex-nowrap">
                    <div className="flex items-center w-full sm:w-64 border shadow-sm py-2 px-3 bg-white rounded-xl">
                        <TfiSearch className="text-xl font-bold text-gray-500" />
                        <input type="text" className="outline-none w-full ml-2 text-sm" placeholder="Search product..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    
                    {/* Bulk Add Button */}
                    {canPerform('Product List', 'add') && (
                        <button onClick={() => setIsBulkModalOpen(true)} className="flex items-center justify-center gap-2 btn btn-outline text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white rounded-xl shadow transition duration-300">
                            <span className="font-semibold text-sm">Bulk Add</span><FaLayerGroup />
                        </button>
                    )}
                    
                    {/* Add Product Button */}
                    {canPerform('Product List', 'add') && (
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-xl shadow hover:bg-blue-700 transition duration-300">
                            <span className="font-semibold text-sm">Add Product</span><GoPlus className="text-xl" />
                        </button>
                    )}
                </div>
            } />
            
            <div className="mt-4 text-sm md:text-base text-gray-700">{rowsPerPageAndTotal}</div>

            {/* Table */}
            {loading ? <Preloader /> : (
                <section className="overflow-x-auto border shadow-sm rounded-xl p-4 mt-5 bg-white">
                    <table className="min-w-full table-auto">
                        <thead className="bg-blue-600 text-white">
                            <tr className="text-sm text-left">
                                <th className="p-3 rounded-l-xl">Product Name</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Price</th>
                                {/* --- NEW COLUMNS ADDED HERE --- */}
                                <th className="p-3">VAT</th>
                                <th className="p-3">SD</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 rounded-r-xl text-right px-8">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((product) => (
                                <tr key={product._id} className="border-b hover:bg-slate-100 last:border-0">
                                    <td className="px-4 py-4 font-medium text-gray-800">{product.productName}</td>
                                    <td className="px-4 py-4 text-gray-600">{product.category}</td>
                                    <td className="px-4 py-4 text-gray-600">৳{product.price}</td>
                                    {/* --- NEW DATA ROWS ADDED HERE --- */}
                                    <td className="px-4 py-4 text-gray-600">৳{product.vat || 0}</td>
                                    <td className="px-4 py-4 text-gray-600">৳{product.sd || 0}</td>
                                    <td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${product.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.status}</span></td>
                                    <td className="py-4 px-6 flex justify-end gap-3 text-lg">
                                        {canPerform('Product List', 'edit') && (
                                            <button onClick={() => handleEdit(product._id)} className="text-blue-500 hover:scale-110"><FiEdit /></button>
                                        )}
                                        {canPerform('Product List', 'delete') && (
                                            <button onClick={() => handleRemove(product._id)} className="text-red-500 hover:scale-110"><FiTrash2 /></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <MtableLoading data={products} />
                    {paginationControls}
                </section>
            )}

            {/* BULK ADD MODAL */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-6xl max-h-[90vh] flex flex-col animate-fadeInUp">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-xl font-semibold text-blue-600 flex items-center gap-2"><FaLayerGroup /> Bulk Add Products</h2>
                            <button onClick={() => setIsBulkModalOpen(false)} className="text-gray-500 hover:text-red-500 transition"><FiX size={24} /></button>
                        </div>

                        {/* --- TOP CONTROLS --- */}
                        <div className="px-6 pt-6 pb-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div className="form-control">
                                <label className="label pt-0"><span className="label-text font-bold text-gray-700">Category (All Items)</span></label>
                                <select className="select select-bordered w-full" value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)}>
                                    <option value="">-- Choose Category --</option>
                                    {categoryNames.map(cat => (<option key={cat._id} value={cat.categoryName}>{cat.categoryName}</option>))}
                                </select>
                             </div>

                             <div className="form-control">
                                <label className="label pt-0"><span className="label-text font-bold text-gray-700 flex items-center gap-1"><FaMagic className="text-blue-500 text-xs"/> Auto-Fill VAT</span></label>
                                <div className="flex gap-2">
                                    <input type="number" className="input input-bordered w-full" placeholder="0" value={globalVat} onChange={(e) => handleGlobalUpdate('vat', e.target.value)} />
                                    <select className="select select-bordered w-24 px-2" value={globalVatType} onChange={(e) => handleGlobalUpdate('vatType', e.target.value)}>
                                        <option value="percentage">%</option>
                                        <option value="amount">৳</option>
                                    </select>
                                </div>
                             </div>

                             <div className="form-control">
                                <label className="label pt-0"><span className="label-text font-bold text-gray-700 flex items-center gap-1"><FaMagic className="text-blue-500 text-xs"/> Auto-Fill SD</span></label>
                                <div className="flex gap-2">
                                    <input type="number" className="input input-bordered w-full" placeholder="0" value={globalSd} onChange={(e) => handleGlobalUpdate('sd', e.target.value)} />
                                    <select className="select select-bordered w-24 px-2" value={globalSdType} onChange={(e) => handleGlobalUpdate('sdType', e.target.value)}>
                                        <option value="percentage">%</option>
                                        <option value="amount">৳</option>
                                    </select>
                                </div>
                             </div>
                        </div>

                        {/* --- TABLE BODY --- */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-blue-50 text-blue-700 font-semibold uppercase">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Product Name</th>
                                        <th className="px-4 py-3 w-32">Price</th>
                                        <th className="px-4 py-3 w-40">VAT</th>
                                        <th className="px-4 py-3 w-40">SD</th>
                                        <th className="px-4 py-3 w-32 text-right">Total Est.</th>
                                        <th className="px-4 py-3 rounded-r-lg text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {bulkItems.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition">
                                            <td className="px-2 py-2">
                                                <input type="text" className="input input-bordered input-sm w-full rounded-lg" placeholder="Item Name" value={item.productName} onChange={(e) => handleBulkChange(index, 'productName', e.target.value)} />
                                            </td>
                                            <td className="px-2 py-2">
                                                <input type="number" className="input input-bordered input-sm w-full rounded-lg" placeholder="0" value={item.price} onChange={(e) => handleBulkChange(index, 'price', e.target.value)} />
                                            </td>
                                            <td className="px-2 py-2">
                                                <div className="flex gap-1">
                                                    <input type="number" className="input input-bordered input-sm w-2/3 rounded-lg" placeholder="0" value={item.vat} onChange={(e) => handleBulkChange(index, 'vat', e.target.value)} />
                                                    <select className="select select-bordered select-sm w-1/3 px-1 rounded-lg" value={item.vatType} onChange={(e) => handleBulkChange(index, 'vatType', e.target.value)}>
                                                        <option value="percentage">%</option>
                                                        <option value="amount">৳</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-2 py-2">
                                                <div className="flex gap-1">
                                                    <input type="number" className="input input-bordered input-sm w-2/3 rounded-lg" placeholder="0" value={item.sd} onChange={(e) => handleBulkChange(index, 'sd', e.target.value)} />
                                                    <select className="select select-bordered select-sm w-1/3 px-1 rounded-lg" value={item.sdType} onChange={(e) => handleBulkChange(index, 'sdType', e.target.value)}>
                                                        <option value="percentage">%</option>
                                                        <option value="amount">৳</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-right font-medium text-gray-600">{calculateRowTotal(item)}</td>
                                            <td className="px-2 py-2 text-center">
                                                <button onClick={() => removeBulkRow(index)} disabled={bulkItems.length === 1} className={`btn btn-sm btn-square btn-ghost ${bulkItems.length === 1 ? 'text-gray-300' : 'text-red-500 hover:bg-red-50'}`}>
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-4">
                                <button onClick={addBulkRow} className="btn btn-outline btn-sm gap-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-blue-200 hover:border-blue-400">
                                    <FiPlus /> Add Item
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-4 p-4 border-t bg-gray-50 rounded-b-2xl">
                            <button onClick={() => setIsBulkModalOpen(false)} className="px-6 py-2 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition">Cancel</button>
                            <button onClick={handleBulkSubmit} disabled={isLoading} className="px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-md transition disabled:opacity-50">
                                {isLoading ? "Uploading..." : "Save All Items"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* SINGLE ADD/EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                   <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col animate-fadeInUp">
                       <div className="flex justify-between items-center p-4 border-b">
                           <h2 className="text-xl font-semibold text-gray-800">{editId ? "Edit Product" : "Add New Product"}</h2>
                           <button onClick={closeModal} className="text-gray-500 hover:text-gray-800 transition"><FiX size={24} /></button>
                       </div>
                       <div className="p-6 overflow-y-auto custom-scrollbar">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                               <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                   <input type="text" value={formData.productName} onChange={(e) => setFormData({ ...formData, productName: e.target.value })} className="focus:border-blue-500 appearance-none text-gray-700 border shadow-sm rounded-xl w-full py-2 px-3 leading-tight focus:outline-none" placeholder="Enter product name" />
                               </div>
                               <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                   <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="focus:border-blue-500 appearance-none text-gray-700 border shadow-sm rounded-xl w-full py-2 px-3 leading-tight focus:outline-none">
                                           <option value="">Select Category</option>
                                           {categoriesLoading ? <option disabled>Loading...</option> : categoriesError ? <option disabled>Error</option> : categoryNames.map((cat) => (<option key={cat._id} value={cat.categoryName}>{cat.categoryName}</option>))}
                                   </select>
                               </div>
                               <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                   <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || "" })} className="focus:border-blue-500 appearance-none text-gray-700 border shadow-sm rounded-xl w-full py-2 px-3 leading-tight focus:outline-none" placeholder="Enter price" />
                               </div>
                               <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                   <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="focus:border-blue-500 appearance-none text-gray-700 border shadow-sm rounded-xl w-full py-2 px-3 leading-tight focus:outline-none">
                                           <option value="available">Available</option>
                                           <option value="unavailable">Unavailable</option>
                                   </select>
                               </div>
                               <div className="md:col-span-2">
                                   <label className="block text-sm font-medium text-gray-700 mb-1">VAT</label>
                                   <div className="flex gap-2">
                                           <input type="number" value={vatInput} onChange={(e) => setVatInput(e.target.value)} className="focus:border-blue-500 appearance-none text-gray-700 border shadow-sm rounded-xl w-full py-2 px-3 leading-tight focus:outline-none" placeholder={formData.vatType === "percentage" ? "e.g., 15" : "e.g., 25.50"} />
                                           <select value={formData.vatType} onChange={(e) => { setFormData({ ...formData, vatType: e.target.value }); setVatInput(formData.vat); }} className="focus:border-blue-500 w-40 text-gray-700 border shadow-sm rounded-xl py-2 px-3 focus:outline-none">
                                                   <option value="amount">Amount (৳)</option>
                                                   <option value="percentage">Percent (%)</option>
                                           </select>
                                   </div>
                               </div>
                               <div className="md:col-span-2">
                                   <label className="block text-sm font-medium text-gray-700 mb-1">SD</label>
                                   <div className="flex gap-2">
                                           <input type="number" value={sdInput} onChange={(e) => setSdInput(e.target.value)} className="focus:border-blue-500 appearance-none text-gray-700 border shadow-sm rounded-xl w-full py-2 px-3 leading-tight focus:outline-none" placeholder={formData.sdType === "percentage" ? "e.g., 10" : "e.g., 10.00"} />
                                           <select value={formData.sdType} onChange={(e) => { setFormData({ ...formData, sdType: e.target.value }); setSdInput(formData.sd); }} className="focus:border-blue-500 w-40 text-gray-700 border shadow-sm rounded-xl py-2 px-3 focus:outline-none">
                                                   <option value="amount">Amount (৳)</option>
                                                   <option value="percentage">Percent (%)</option>
                                           </select>
                                   </div>
                               </div>

                               <div className="md:col-span-2">
                                   <label className="block text-sm font-medium text-gray-700 mb-1">Product Details</label>
                                   <textarea
                                       value={formData.productDetails}
                                       onChange={(e) => setFormData({ ...formData, productDetails: e.target.value })}
                                       className="focus:border-blue-500 appearance-none text-gray-700 border shadow-sm rounded-xl w-full py-2 px-3 leading-tight focus:outline-none h-24 resize-none"
                                       placeholder="Enter product details..."
                                   />
                               </div>

                               <div className="md:col-span-2">
                                   <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                                   <ImageUpload setImageUrl={(url) => setFormData({ ...formData, photo: url })} />
                               </div>
                           </div>
                       </div>
                       <div className="flex justify-end space-x-4 p-4 border-t bg-gray-50 rounded-b-2xl">
                           <button onClick={closeModal} className="bg-gray-200 text-gray-800 py-2 px-5 font-semibold hover:bg-gray-300 rounded-xl transition">Cancel</button>
                           <button onClick={handleAddOrEditProduct} disabled={isLoading} className="bg-blue-600 text-white py-2 px-5 font-semibold hover:bg-blue-700 rounded-xl transition disabled:opacity-50">{isLoading ? "Saving..." : "Save"}</button>
                       </div>
                   </div>
               </div>
            )}
        </div>
    );
};

export default Product;