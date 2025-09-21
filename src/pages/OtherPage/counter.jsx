import React, { useState, useEffect, useContext, useCallback } from "react";
import { FaPlus, FaPencilAlt, FaTrash } from "react-icons/fa";
import { FiX, FiEdit, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from "framer-motion";
import Swal from 'sweetalert2';
import { ColorRing } from "react-loader-spinner";


import Mpagination from "../../components library/Mpagination";
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from "../../providers/AuthProvider";

const MtableLoading = () => (
    <div className="flex justify-center items-center w-full h-full py-28">
        <ColorRing
            visible={true}
            height="80"
            width="80"
            ariaLabel="color-ring-loading"
            wrapperClass="color-ring-wrapper"
            colors={["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"]}
        />
    </div>
);

const Counter = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const [counters, setCounters] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        counterName: "",
        counterSerial: "",
        branch: branch || "",
    });
    const [editId, setEditId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchCounters = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosSecure.get(`/counter/${branch}/get-all`);
            setCounters(response.data);
        } catch (error) {
            console.error("Error fetching counters:", error);
        } finally {
            setLoading(false);
        }
    }, [axiosSecure, branch]);
    
    useEffect(() => {
        if (branch) {
            fetchCounters();
        }
    }, [fetchCounters, branch]);

    const handleAddOrEditCounter = async () => {
        setIsLoading(true);
        try {
            if (editId) {
                await axiosSecure.put(`/counter/update/${editId}`, formData);
            } else {
                await axiosSecure.post(`/counter/post`, formData);
            }
            fetchCounters();
            closeModal();
        } catch (error) {
            console.error("Error saving counter:", error);
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "Failed to save counter. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setEditId(null);
        setFormData({
            counterName: "",
            counterSerial: "",
            branch: branch || "",
        });
    };

    const handleEdit = (id) => {
        const counter = counters.find((c) => c._id === id);
        setEditId(id);
        setFormData({ ...counter, branch });
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
                axiosSecure.delete(`/counter/delete/${id}`)
                    .then(() => {
                        fetchCounters();
                        Swal.fire("Deleted!", "The counter has been deleted.", "success");
                    })
                    .catch((error) => {
                        console.error("Error deleting counter:", error);
                        Swal.fire("Error!", "Failed to delete counter.", "error");
                    });
            }
        });
    };

    const { paginatedData, paginationControls, rowsPerPageAndTotal } = Mpagination({ totalData: counters });
    const inputClass = "w-full border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150";

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200">
            <Mtitle title="Counter Management" rightcontent={
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setIsModalOpen(true); closeModal(); }}
                    className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-xl shadow-md hover:bg-blue-700 transition duration-300"
                >
                    <FaPlus  className="text-xl" /> Add New Counter
                </motion.button>
            } />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="card bg-base-100 shadow-xl mt-6"
            >
                <div className="card-body p-4 sm:p-6">
                    <div className="text-sm text-slate-700 mb-4">{rowsPerPageAndTotal}</div>
                    {loading ? <MtableLoading /> : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className="bg-blue-600 text-white uppercase text-xs">
                                    <tr>
                                        <th className="p-3 rounded-tl-lg">Counter Name</th>
                                        <th className="p-3">Counter Serial</th>
                                        <th className="p-3 text-center rounded-tr-lg">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {paginatedData.length === 0 ? (
                                            <tr><td colSpan="3" className="text-center py-12 text-slate-700">No counters found.</td></tr>
                                        ) : (
                                            paginatedData.map((counter) => (
                                                <motion.tr key={counter._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-blue-50 border-b border-slate-200 text-sm text-slate-700">
                                                    <td className="p-3 font-medium">{counter.counterName}</td>
                                                    <td className="p-3">{counter.counterSerial}</td>
                                                    <td className="p-3">
                                                        <div className="flex justify-center items-center gap-2">
                                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(counter._id)} className="btn btn-circle btn-sm bg-yellow-600 hover:bg-yellow-700 text-white"><FiEdit /></motion.button>
                                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleRemove(counter._id)} className="btn btn-circle btn-sm bg-red-600 hover:bg-red-700 text-white"><FiTrash2 /></motion.button>
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
                            <h3 className="text-xl font-semibold text-blue-600 mb-6">{editId ? 'Edit Counter' : 'Add New Counter'}</h3>
                            <div className="space-y-4">
                                <div><label className="label-text text-slate-700">Counter Name</label><input type="text" value={formData.counterName} onChange={(e) => setFormData({ ...formData, counterName: e.target.value })} className={`${inputClass} mt-1`} placeholder="e.g., Main Counter" /></div>
                                <div><label className="label-text text-slate-700">Counter Serial</label><input type="number" value={formData.counterSerial} onChange={(e) => setFormData({ ...formData, counterSerial: parseInt(e.target.value) || "" })} className={`${inputClass} mt-1`} placeholder="e.g., 1" /></div>
                            </div>
                            <div className="flex justify-end gap-4 mt-8">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={closeModal} className="btn rounded-xl">Cancel</motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddOrEditCounter} className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md" disabled={isLoading}>{isLoading ? <span className="loading loading-spinner"></span> : editId ? 'Save Changes' : 'Add Counter'}</motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Counter;