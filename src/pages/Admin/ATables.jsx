import React, { useState, useEffect, useCallback } from "react";
import { FiEdit, FiTrash2, FiPlus, FiGrid } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

import UseAxiosSecure from '../../Hook/UseAxioSecure';
import useTotalBranch from '../../Hook/UseTotalBrach';
import Mtitle from '../../components library/Mtitle';
import Preloader from '../../components/Shortarea/Preloader';

const ATables = () => {
    const axiosSecure = UseAxiosSecure();
    const { branches, loading: branchesLoading } = useTotalBranch();

    const [selectedBranch, setSelectedBranch] = useState("");
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tableName, setTableName] = useState("");
    const [editingTable, setEditingTable] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch tables when a branch is selected
    const fetchTables = useCallback(async () => {
        if (!selectedBranch) {
            setTables([]);
            return;
        }
        setLoading(true);
        try {
            const response = await axiosSecure.get(`/table/branch/${selectedBranch}`);
            setTables(response.data);
        } catch (error) {
            console.error("Error fetching tables:", error);
            Swal.fire('Error!', 'Failed to fetch tables for this branch.', 'error');
        } finally {
            setLoading(false);
        }
    }, [axiosSecure, selectedBranch]);

    useEffect(() => {
        fetchTables();
    }, [fetchTables]);

    // Automatically select the first branch if available
    useEffect(() => {
        if (branches && branches.length > 0 && !selectedBranch) {
            setSelectedBranch(branches[0].name);
        }
    }, [branches, selectedBranch]);

    const handleOpenModal = (table = null) => {
        if (table) {
            setEditingTable(table);
            setTableName(table.tableName);
        } else {
            setEditingTable(null);
            setTableName("");
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!tableName.trim()) {
            Swal.fire('Warning!', 'Table name is required.', 'warning');
            return;
        }

        setIsSubmitting(true);
        const isEditing = !!editingTable;
        const endpoint = isEditing ? `/table/update/${editingTable._id}` : '/table/post';
        const method = isEditing ? 'put' : 'post';
        const payload = {
            tableName: tableName.trim(),
            branch: selectedBranch
        };

        try {
            await axiosSecure[method](endpoint, payload);
            Swal.fire('Success!', `Table ${isEditing ? 'updated' : 'created'} successfully.`, 'success');
            fetchTables();
            setIsModalOpen(false);
        } catch (error) {
            Swal.fire('Error!', error.response?.data?.message || 'Failed to save table.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This table will be permanently deleted.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        }).then(result => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/table/delete/${id}`).then(() => {
                    Swal.fire('Deleted!', 'The table has been deleted.', 'success');
                    fetchTables();
                }).catch(() => Swal.fire('Error!', 'Failed to delete table.', 'error'));
            }
        });
    };

    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-955 min-h-screen transition-colors duration-300">
            <Mtitle
                title="Superadmin Table Management"
                rightcontent={
                    selectedBranch && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none flex items-center gap-2 rounded-xl"
                        >
                            <FiPlus /> Add Table
                        </button>
                    )
                }
            />

            {/* Branch Selection Panel */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 my-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                <div>
                    <h3 className="text-md font-bold text-slate-850 dark:text-slate-200">Select Branch</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage seating tables for specific branches</p>
                </div>
                <div className="w-full sm:w-72">
                    {branchesLoading ? (
                        <div className="text-sm text-slate-500">Loading branches...</div>
                    ) : (
                        <select
                            value={selectedBranch}
                            onChange={e => setSelectedBranch(e.target.value)}
                            className="select select-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Choose a Branch</option>
                            {branches.map(b => (
                                <option key={b._id || b.id} value={b.name}>{b.name}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Main Seating Table Grid/Table List */}
            {!selectedBranch ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm text-slate-400 dark:text-slate-550 transition-colors">
                    <FiGrid className="mx-auto text-4xl mb-3 opacity-60" />
                    <p className="font-medium">Please select a branch to view and manage tables.</p>
                </div>
            ) : loading ? (
                <Preloader />
            ) : (
                <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 transition-colors">
                    <table className="table w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-655 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="p-4 text-left font-bold text-sm">Table Name</th>
                                <th className="p-4 text-left font-bold text-sm">Branch</th>
                                <th className="p-4 text-right font-bold text-sm rounded-tr-2xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tables.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium">
                                        No tables found for this branch. Add some to get started!
                                    </td>
                                </tr>
                            ) : (
                                tables.map(table => (
                                    <tr key={table._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 transition-colors text-slate-700 dark:text-slate-350">
                                        <td className="p-4 font-semibold text-slate-850 dark:text-slate-200">{table.tableName}</td>
                                        <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">{table.branch}</td>
                                        <td className="p-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleOpenModal(table)}
                                                className="btn btn-ghost btn-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg p-1.5"
                                                title="Edit Table"
                                            >
                                                <FiEdit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(table._id)}
                                                className="btn btn-ghost btn-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg p-1.5"
                                                title="Delete Table"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit/Create Table Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 dark:border-slate-800"
                        >
                            <h2 className="text-lg font-bold text-slate-850 dark:text-slate-200 mb-4">
                                {editingTable ? "Edit Table" : "Add New Table"}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-5">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Table Name / Number</label>
                                    <input
                                        type="text"
                                        value={tableName}
                                        onChange={e => setTableName(e.target.value)}
                                        placeholder="e.g. Table 05, Lounge Table 2"
                                        className="input input-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">This name will be visible to branch managers and waiters.</p>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="btn bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 border-none rounded-xl"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-xl"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Saving..." : editingTable ? "Save Changes" : "Create Table"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ATables;
