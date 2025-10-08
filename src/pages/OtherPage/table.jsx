import React, { useState, useEffect, useContext, useCallback } from "react";
import { FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { GoPlus } from "react-icons/go";
import { motion, AnimatePresence } from 'framer-motion';

import { BsQrCode } from "react-icons/bs";

import Mpagination from "../../components library/Mpagination";
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import QRCodeGenerator from "../../components/QRCodeGenerator";
import MtableLoading from "../../components library/MtableLoading"; 
import useActionPermissions from "../../Hook/useActionPermissions";


const TableManagement = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const [tables, setTables] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ tableName: "", branch: branch });
    const [editId, setEditId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
   const { canPerform, loading: permissionsLoading } = useActionPermissions();
    const fetchTables = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosSecure.get(`/table/branch/${branch}`);
            setTables(response.data);
        } catch (error) {
            console.error("Error fetching tables:", error);
        }
        setLoading(false);
    }, [axiosSecure, branch]);

    useEffect(() => {
        fetchTables();
    }, [fetchTables]);

    const handleAddOrEditTable = async () => {
          const requiredPermission = editId ? "edit" : "add";
    if (!canPerform("Table Management", requiredPermission)) {
        Swal.fire("Access Denied", `You do not have permission to ${requiredPermission} tables.`, "error");
        return;
    }
        setIsLoading(true);
        try {
            if (editId) {
                await axiosSecure.put(`/table/update/${editId}`, formData);
            } else {
                await axiosSecure.post(`/table/post`, formData);
            }
            fetchTables();
            setIsModalOpen(false);
            setFormData({ tableName: "", branch: branch });
            setEditId(null);
        } catch (error) {
            console.error("Error saving table:", error);
            Swal.fire({ icon: "error", title: "Error!", text: "Failed to save table. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (id) => {
            if (!canPerform("Table Management", "edit")) {
        Swal.fire("Access Denied", "You do not have permission to edit tables.", "error");
        return;
    }
        const table = tables.find((t) => t._id === id);
        setEditId(id);
        setFormData({ ...table, branch });
        setIsModalOpen(true);
    };

    const handleRemove = (id) => {
          if (!canPerform("Table Management", "delete")) {
        Swal.fire("Access Denied", "You do not have permission to delete tables.", "error");
        return;
    }
        Swal.fire({
            title: "Are you sure?", text: "You won't be able to revert this!", icon: "warning",
            showCancelButton: true, confirmButtonColor: "#3085d6", cancelButtonColor: "#d33", confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/table/delete/${id}`)
                    .then(() => { fetchTables(); Swal.fire("Deleted!", "The table has been deleted.", "success"); })
                    .catch((error) => { console.error("Error deleting table:", error); Swal.fire("Error!", "Failed to delete table.", "error"); });
            }
        });
    };

    const handleOpenQrModal = (table) => {
        setSelectedTable(table);
        setIsQrModalOpen(true);
    };

    const handleCloseQrModal = () => {
        setSelectedTable(null);
        setIsQrModalOpen(false);
    };

    const { paginatedData, paginationControls, rowsPerPageAndTotal } = Mpagination({ totalData: tables });

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-base-200 min-h-screen">
            <Mtitle title="Table Management" rightcontent={
                                canPerform("Table Management", "add") && (

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-xl shadow-md hover:bg-blue-700 transition duration-300">
                    <GoPlus className="text-xl" /> Add New Table
                 </motion.button>
                )
            } />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="card bg-base-100 shadow-xl mt-6">
                <div className="p-4">
                    <div className="text-sm text-slate-700 mb-4">{rowsPerPageAndTotal}</div>
                    {loading ? <MtableLoading /> : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className='bg-blue-600 text-white uppercase text-xs font-medium tracking-wider'>
                                    <tr>
                                        <th className="p-3 rounded-tl-lg">Table Name</th>
                                        <th className="p-3 rounded-tr-lg text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {paginatedData.length === 0 ? (
                                            <tr><td colSpan="2" className="text-center py-8 text-slate-700">No tables found.</td></tr>
                                        ) : (
                                            paginatedData.map((table) => (
                                                <motion.tr key={table._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-blue-50 border-b border-slate-200 text-sm text-slate-700">
                                                    <td className="p-3 font-medium">{table.tableName}</td>
                                <td className="p-3">
    <div className="flex justify-center items-center gap-2">
        {canPerform("Table Management", "view") && (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleOpenQrModal(table)} className="btn btn-circle btn-sm bg-slate-600 hover:bg-slate-700 text-white" title="Generate QR Code"><BsQrCode /></motion.button>
        )}
        {canPerform("Table Management", "edit") && (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(table._id)} className="btn btn-circle btn-sm bg-yellow-600 hover:bg-yellow-700 text-white" title="Edit Table"><FiEdit /></motion.button>
        )}
        {canPerform("Table Management", "delete") && (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleRemove(table._id)} className="btn btn-circle btn-sm bg-red-600 hover:bg-red-700 text-white" title="Delete Table"><FiTrash2 /></motion.button>
        )}
    </div>
</td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                            <div className="pt-4">{paginationControls}</div>
                        </div>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-md">
                            <h2 className="text-xl font-semibold text-blue-600 mb-6">{editId ? "Edit Table" : "Add New Table"}</h2>
                            <input type="text" value={formData.tableName} onChange={(e) => setFormData({ ...formData, tableName: e.target.value })} className="w-full border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150" placeholder="Table Name" />
                            <div className="flex justify-end gap-4 mt-8">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setIsModalOpen(false); setFormData({ tableName: "", branch: branch }); setEditId(null); }} className="btn rounded-xl">Cancel</motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddOrEditTable} className="btn bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md" disabled={isLoading}>{isLoading ? "Saving..." : editId ? "Save Changes" : "Add Table"}</motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
                {isQrModalOpen && selectedTable && (
                     <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-base-100 p-4 rounded-2xl shadow-xl w-full max-w-xs relative">
                            <h3 className="text-center font-bold text-lg text-slate-700 mb-2">{selectedTable.tableName}</h3>
                             <QRCodeGenerator type="table" id={selectedTable._id} />
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleCloseQrModal} className="btn btn-circle btn-sm absolute -top-3 -right-3 bg-red-600 text-white hover:bg-red-700 shadow-lg"><FiX /></motion.button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TableManagement;