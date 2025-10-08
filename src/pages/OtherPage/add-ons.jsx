import React, { useState, useEffect, useContext, useCallback } from "react";
import { FaPlus, FaPencilAlt, FaTrash, FaGooglePlus, FaDAndD } from "react-icons/fa";
import { FiX, FiSearch, FiEdit, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from "framer-motion";
import Swal from 'sweetalert2';
import Mpagination from "../../components library/Mpagination";
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from "../../providers/AuthProvider";
import MtableLoading from "../../components library/MtableLoading"; 
import useActionPermissions from "../../Hook/useActionPermissions";

const Addons = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const [addons, setAddons] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        status: "available",
        branch: branch || "",
    });
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredAddons, setFilteredAddons] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(false);
   const { canPerform, loading: permissionsLoading } = useActionPermissions();
    const fetchAddons = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosSecure.get(`/addons/${branch}/get-all`);
            setAddons(response.data);
            setFilteredAddons(response.data);
        } catch (error) {
            console.error("Error fetching addons:", error);
        } finally {
            setLoading(false);
        }
    }, [axiosSecure, branch]);

    useEffect(() => {
        fetchAddons();
    }, [fetchAddons]);

    useEffect(() => {
        const filtered = addons.filter(addon =>
            addon.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredAddons(filtered);
    }, [searchTerm, addons]);

    const handleAddOrEditAddon = async () => {
        setIsLoading(true);
        try {
            if (editId) {
                await axiosSecure.put(`/addons/update/${editId}`, formData);
            } else {
                await axiosSecure.post(`/addons/post`, formData);
            }
            fetchAddons();
            closeModal();
        } catch (error) {
            console.error("Error saving addon:", error);
            Swal.fire({ icon: "error", title: "Error!", text: "Failed to save addon. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (id) => {
        const addon = addons.find((a) => a._id === id);
        setEditId(id);
        setFormData({ ...addon, branch });
        setIsModalOpen(true);
    };

    const handleRemove = (id) => {
        Swal.fire({
            title: "Are you sure?", text: "You won't be able to revert this!", icon: "warning",
            showCancelButton: true, confirmButtonColor: "#3085d6", cancelButtonColor: "#d33", confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/addons/delete/${id}`)
                    .then(() => {
                        fetchAddons();
                        Swal.fire("Deleted!", "The addon has been deleted.", "success");
                    })
                    .catch((error) => {
                        console.error("Error deleting addon:", error);
                        Swal.fire("Error!", "Failed to delete addon.", "error");
                    });
            }
        });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditId(null);
        setFormData({ name: "", price: "", status: "available", branch: branch || "" });
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const { paginatedData, paginationControls, rowsPerPageAndTotal } = Mpagination({ totalData: filteredAddons });
    const inputClass = "w-full border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150";

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200">
            <Mtitle title="Addon Management" rightcontent={
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-xl shadow-md hover:bg-blue-700 transition duration-300">
                    <FaDAndD className="text-xl" /> Add New Addon
                </motion.button>
            } />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-sm text-slate-700">{rowsPerPageAndTotal}</div>
                        <div className="form-control w-full max-w-xs">
                            <div className="relative">
                                <input type="text" placeholder="Search by name..." className={`${inputClass} pl-10`} value={searchTerm} onChange={handleSearchChange} />
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            </div>
                        </div>
                    </div>
                    {loading ? <MtableLoading /> : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className="bg-blue-600 text-white uppercase text-xs">
                                    <tr>
                                        <th className="p-3 rounded-tl-lg">Name</th><th className="p-3">Price</th><th className="p-3">Status</th><th className="p-3 text-center rounded-tr-lg">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {paginatedData.length === 0 ? (<tr><td colSpan="4" className="text-center py-12 text-slate-700">No addons found.</td></tr>) : (
                                            paginatedData.map((addon) => (
                                                <motion.tr key={addon._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-blue-50 border-b border-slate-200 text-sm text-slate-700">
                                                    <td className="p-3 font-medium">{addon.name}</td>
                                                    <td className="p-3">৳{addon.price}</td>
                                                    <td className="p-3"><div className={`badge ${addon.status === 'available' ? 'badge-success' : 'badge-error'} text-white capitalize`}>{addon.status}</div></td>
                                                    <td className="p-3">
                                                        <div className="flex justify-center items-center gap-2">
                                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(addon._id)} className="btn btn-circle btn-sm bg-yellow-600 hover:bg-yellow-700 text-white"><FiEdit /></motion.button>
                                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleRemove(addon._id)} className="btn btn-circle btn-sm bg-red-600 hover:bg-red-700 text-white"><FiTrash2 /></motion.button>
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
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-md">
                            <h3 className="text-xl font-semibold text-blue-600 mb-6">{editId ? 'Edit Addon' : 'Add New Addon'}</h3>
                            <div className="space-y-4">
                                <div><label className="label-text text-slate-700">Addon Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`${inputClass} mt-1`} placeholder="e.g., Extra Cheese" /></div>
                                <div><label className="label-text text-slate-700">Price</label><input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || "" })} className={`${inputClass} mt-1`} placeholder="e.g., 50" /></div>
                                <div><label className="label-text text-slate-700">Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={`${inputClass} mt-1`}><option value="available">Available</option><option value="unavailable">Unavailable</option></select></div>
                            </div>
                            <div className="flex justify-end gap-4 mt-8">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={closeModal} className="btn rounded-xl">Cancel</motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddOrEditAddon} className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md" disabled={isLoading}>{isLoading ? <span className="loading loading-spinner"></span> : editId ? 'Save Changes' : 'Add Addon'}</motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Addons;