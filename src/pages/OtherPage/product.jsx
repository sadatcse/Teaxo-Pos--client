import React, { useState, useEffect, useContext, useCallback } from "react";
import { FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { TfiSearch } from "react-icons/tfi";
import { GoPlus } from "react-icons/go";
import Mpagination from "../../components library/Mpagination";
import MtableLoading from "../../components library/MtableLoading";
import Mtitle from "../../components library/Mtitle";
import ImageUpload from "../../config/ImageUploadcpanel";
import CategroieHook from "../../Hook/Categroie";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import Preloader from "../../components/Shortarea/Preloader";
import { useDebounce } from 'use-debounce'; // Use this new hook

const Product = () => {
    const { categoryNames, loading: categoriesLoading, error: categoriesError } = CategroieHook();
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);

    const initialFormData = {
        category: "",
        productName: "",
        flavour: false,
        cFlavor: false,
        addOns: false,
        vat: 0,
        sd: 0,
        price: "",
        vatType: "amount",
        sdType: "amount",
        status: "available",
        productDetails: "",
        branch: branch,
        photo: "",
    };

    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [vatInput, setVatInput] = useState("");
    const [sdInput, setSdInput] = useState("");
    
    // Debounce the search term to improve performance
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

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

    useEffect(() => {
        // This useEffect handles filtering when products or debouncedSearchTerm change
        const filtered = products.filter((product) =>
            product.productName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
        setFilteredProducts(filtered);
    }, [products, debouncedSearchTerm]);

    // Simplified state and useEffect for filtered products
    const [filteredProducts, setFilteredProducts] = useState([]);
    
    // Debounce the vat and sd inputs to avoid rapid state updates
    const [debouncedVatInput] = useDebounce(vatInput, 500);
    const [debouncedSdInput] = useDebounce(sdInput, 500);

    // Effect for calculating VAT
    useEffect(() => {
        const numericValue = parseFloat(debouncedVatInput) || 0;
        const calculatedVAT = formData.vatType === "percentage"
            ? (numericValue / 100) * (parseFloat(formData.price) || 0)
            : numericValue;
        setFormData((prev) => ({ ...prev, vat: calculatedVAT }));
    }, [debouncedVatInput, formData.vatType, formData.price]);

    // Effect for calculating SD
    useEffect(() => {
        const numericValue = parseFloat(debouncedSdInput) || 0;
        const calculatedSD = formData.sdType === "percentage"
            ? (numericValue / 100) * (parseFloat(formData.price) || 0)
            : numericValue;
        setFormData((prev) => ({ ...prev, sd: calculatedSD }));
    }, [debouncedSdInput, formData.sdType, formData.price]);

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData(initialFormData);
        setVatInput("");
        setSdInput("");
        setEditId(null);
    };

    const handleAddOrEditProduct = async () => {
        setIsLoading(true);
        try {
            if (editId) {
                await axiosSecure.put(`/product/update/${editId}`, formData);
            } else {
                await axiosSecure.post("/product/post", formData);
            }
            fetchProducts();
            closeModal();
            Swal.fire({
                icon: "success",
                title: `Product ${editId ? 'Updated' : 'Created'}!`,
                text: `The product has been successfully ${editId ? 'updated' : 'created'}.`,
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error saving product:", error);
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "Failed to save product. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (id) => {
        const product = products.find((p) => p._id === id);
        setEditId(id);
        setFormData(product);
        setVatInput(product.vatType === 'percentage' ? (((product.vat || 0) / (product.price || 1)) * 100).toFixed(2) : product.vat);
        setSdInput(product.sdType === 'percentage' ? (((product.sd || 0) / (product.price || 1)) * 100).toFixed(2) : (product.sd || ""));
        setIsModalOpen(true);
    };

    const handleRemove = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/product/delete/${id}`)
                    .then(() => {
                        fetchProducts();
                        Swal.fire("Deleted!", "The product has been deleted.", "success");
                    })
                    .catch((error) => {
                        console.error("Error deleting product:", error);
                        Swal.fire("Error!", "Failed to delete product.", "error");
                    });
            }
        });
    };

    const handleImageUpload = (url) => {
        if (url) {
            setFormData((prev) => ({ ...prev, photo: url }));
        } else {
            console.error("Image URL is undefined!");
        }
    };

    const { paginatedData, paginationControls, rowsPerPageAndTotal } = Mpagination({ totalData: filteredProducts });

    return (
        <div className="p-4 min-h-screen bg-gray-50">
           <Mtitle title="Product Management" rightcontent={
               <div className="flex justify-end gap-4 items-center flex-wrap sm:flex-nowrap">
                   {/* Search Bar */}
                   <div className="flex items-center w-full sm:w-64 border shadow-sm py-2 px-3 bg-white rounded-xl">
                       <TfiSearch className="text-xl font-bold text-gray-500" />
                       <input
                           type="text"
                           className="outline-none w-full ml-2 text-sm"
                           placeholder="Search by name..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                       />
                   </div>

                   {/* Create Product Button */}
                   <button
                       onClick={() => setIsModalOpen(true)}
                       className="flex items-center justify-center w-full sm:w-auto gap-2 bg-blue-600 text-white py-2 px-4 rounded-xl shadow hover:bg-blue-700 transition duration-300 transform hover:scale-105"
                   >
                       <span className="font-semibold text-sm">Create Product</span>
                       <GoPlus className="text-xl text-white" />
                   </button>
               </div>
           } />

           <div className="mt-4 text-sm md:text-base text-gray-700">
               {rowsPerPageAndTotal}
           </div>

           {loading ? (
               <Preloader />
           ) : (
               <section className="overflow-x-auto border shadow-sm rounded-xl p-4 mt-5 bg-white">
                   <table className="min-w-full table-auto">
                       <thead className="bg-blue-600">
                           <tr className="text-sm font-medium text-white text-left">
                               <th className="p-3 rounded-l-xl">Product Name</th>
                               <th className="p-3">Category</th>
                               <th className="p-3">Price</th>
                               <th className="p-3">Status</th>
                               <th className="p-3 rounded-r-xl text-right px-8">Action</th>
                           </tr>
                       </thead>
                       <tbody>
                           {paginatedData.length === 0 ? (
                               <tr>
                                   <td colSpan="5" className="text-center py-8 text-gray-500">No products found</td>
                               </tr>
                           ) : (
                               paginatedData.map((product) => (
                                   <tr key={product._id} className="border-b last:border-0 hover:bg-slate-100 transition-colors duration-200">
                                       <td className="px-4 py-4 text-gray-800 font-medium">{product.productName}</td>
                                       <td className="px-4 py-4 text-gray-600">{product.category}</td>
                                       <td className="px-4 py-4 text-gray-600">৳{product.price}</td>
                                       <td className="px-4 py-4">
                                           <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${product.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                               {product.status}
                                           </span>
                                       </td>
                                       <td className="py-4 px-6 text-lg flex justify-end items-center space-x-4">
                                           <button onClick={() => handleEdit(product._id)} className="text-blue-500 hover:text-yellow-700 transition duration-150 transform hover:scale-110">
                                               <FiEdit />
                                           </button>
                                           <button onClick={() => handleRemove(product._id)} className="text-red-500 hover:text-red-700 transition duration-150 transform hover:scale-110">
                                               <FiTrash2 />
                                           </button>
                                       </td>
                                   </tr>
                               ))
                           )}
                       </tbody>
                   </table>
                   <MtableLoading data={products}></MtableLoading>
                   {paginationControls}
               </section>
           )}

           {isModalOpen && (
               <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                   <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col animate-fadeInUp">
                       {/* Modal Header */}
                       <div className="flex justify-between items-center p-4 border-b">
                           <h2 className="text-xl font-semibold text-gray-800">{editId ? "Edit Product" : "Add New Product"}</h2>
                           <button onClick={closeModal} className="text-gray-500 hover:text-gray-800 transition duration-300">
                               <FiX size={24} />
                           </button>
                       </div>

                       {/* Modal Body */}
                       <div className="p-6 overflow-y-auto custom-scrollbar">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                               {/* Product Name */}
                               <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                   <input
                                       type="text"
                                       value={formData.productName}
                                       onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                       className="focus:border-blue-500 appearance-none text-gray-700 border shadow-sm rounded-xl w-full py-2 px-3 leading-tight focus:outline-none"
                                       placeholder="Enter product name"
                                   />
                               </div>

                               {/* Category */}
                               <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                   <select
                                       value={formData.category}
                                       onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                       className="focus:border-blue-500 appearance-none text-gray-700 border shadow-sm rounded-xl w-full py-2 px-3 leading-tight focus:outline-none"
                                   >
                                       <option value="">Select Category</option>
                                       {categoriesLoading ? <option disabled>Loading...</option> :
                                           categoriesError ? <option disabled>Error</option> :
                                           categoryNames.map((cat) => (
                                               <option key={cat._id} value={cat.categoryName}>{cat.categoryName}</option>
                                           ))}
                                   </select>
                               </div>

                               {/* Price */}
                               <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                   <input
                                       type="number"
                                       value={formData.price}
                                       onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || "" })}
                                       className="focus:border-blue-500 appearance-none text-gray-700 border shadow-sm rounded-xl w-full py-2 px-3 leading-tight focus:outline-none"
                                       placeholder="Enter price"
                                   />
                               </div>

                               {/* Status */}
                               <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                   <select
                                       value={formData.status}
                                       onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                       className="focus:border-blue-500 appearance-none text-gray-700 border shadow-sm rounded-xl w-full py-2 px-3 leading-tight focus:outline-none"
                                   >
                                       <option value="available">Available</option>
                                       <option value="unavailable">Unavailable</option>
                                   </select>
                               </div>

                               {/* VAT Section */}
                               <div className="md:col-span-2">
                                   <label className="block text-sm font-medium text-gray-700 mb-1">VAT</label>
                                   <div className="flex gap-2">
                                       <input
                                           type="number"
                                           value={vatInput}
                                           onChange={(e) => setVatInput(e.target.value)}
                                           className="focus:border-blue-500 appearance-none text-gray-700 border shadow-sm rounded-xl w-full py-2 px-3 leading-tight focus:outline-none"
                                           placeholder={formData.vatType === "percentage" ? "e.g., 15" : "e.g., 25.50"}
                                       />
                                       <select
                                           value={formData.vatType}
                                           onChange={(e) => {
                                               setFormData({ ...formData, vatType: e.target.value, vat: 0 });
                                               setVatInput("");
                                           }}
                                           className="focus:border-blue-500 w-40 text-gray-700 border shadow-sm rounded-xl py-2 px-3 focus:outline-none"
                                       >
                                           <option value="amount">Amount (৳)</option>
                                           <option value="percentage">Percent (%)</option>
                                       </select>
                                   </div>
                                   {formData.vatType === "percentage" && (
                                       <p className="text-gray-500 text-xs mt-1">Calculated VAT: {formData.vat.toFixed(2)} Taka</p>
                                   )}
                               </div>

                               {/* SD Section */}
                               <div className="md:col-span-2">
                                   <label className="block text-sm font-medium text-gray-700 mb-1">SD (Supplementary Duty)</label>
                                   <div className="flex gap-2">
                                       <input
                                           type="number"
                                           value={sdInput}
                                           onChange={(e) => setSdInput(e.target.value)}
                                           className="focus:border-blue-500 appearance-none text-gray-700 border shadow-sm rounded-xl w-full py-2 px-3 leading-tight focus:outline-none"
                                           placeholder={formData.sdType === "percentage" ? "e.g., 10" : "e.g., 10.00"}
                                       />
                                       <select
                                           value={formData.sdType}
                                           onChange={(e) => {
                                               setFormData({ ...formData, sdType: e.target.value, sd: 0 });
                                               setSdInput("");
                                           }}
                                           className="focus:border-blue-500 w-40 text-gray-700 border shadow-sm rounded-xl py-2 px-3 focus:outline-none"
                                       >
                                           <option value="amount">Amount (৳)</option>
                                           <option value="percentage">Percent (%)</option>
                                       </select>
                                   </div>
                                   {formData.sdType === "percentage" && (
                                       <p className="text-gray-500 text-xs mt-1">Calculated SD: {formData.sd.toFixed(2)} Taka</p>
                                   )}
                               </div>

                               {/* Product Details */}
                               <div className="md:col-span-2">
                                   <label className="block text-sm font-medium text-gray-700 mb-1">Product Details</label>
                                   <textarea
                                       value={formData.productDetails}
                                       onChange={(e) => setFormData({ ...formData, productDetails: e.target.value })}
                                       className="focus:border-blue-500 appearance-none text-gray-700 border shadow-sm rounded-xl w-full py-2 px-3 leading-tight focus:outline-none"
                                       placeholder="Add a short description..."
                                       rows={3}
                                   ></textarea>
                               </div>
                               
                               {/* Image Upload */}
                               <div className="md:col-span-2">
                                   <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                                   <ImageUpload setImageUrl={handleImageUpload} />
                               </div>
                           </div>
                       </div>

                       {/* Modal Footer */}
                       <div className="flex justify-end space-x-4 p-4 border-t bg-gray-50 rounded-b-2xl">
                           <button
                               onClick={closeModal}
                               className="bg-gray-200 text-gray-800 py-2 px-5 font-semibold hover:bg-gray-300 rounded-xl transition duration-300"
                           >
                               Cancel
                           </button>
                           <button
                               onClick={handleAddOrEditProduct}
                               className={`bg-blue-600 text-white py-2 px-5 font-semibold hover:bg-blue-700 rounded-xl transition duration-300 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                               disabled={isLoading}
                           >
                               {isLoading ? "Saving..." : editId ? "Save Changes" : "Add Product"}
                           </button>
                       </div>
                   </div>
               </div>
           )}
       </div>
    );
};

export default Product;