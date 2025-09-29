import React, { useState, useEffect, useContext, useCallback } from "react";
import { FiEdit, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

import Mtitle from "../../components library/Mtitle";
import Mpagination from "../../components library/Mpagination";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import MtableLoading from "../../components library/MtableLoading";

const DeviceManagement = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const [devices, setDevices] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ deviceName: "", sn: "", branch: branch, deptId: "" });
    const [editId, setEditId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setPageLoading] = useState(true);

    const fetchDevices = useCallback(async () => {
        setPageLoading(true);
        try {
            const response = await axiosSecure.get(`/devices?branch=${branch}`);
            setDevices(response.data);
        } catch (error) {
            console.error("Error fetching devices:", error);
            Swal.fire({ icon: "error", title: "Fetch Error", text: "Could not load device data." });
        }
        setPageLoading(false);
    }, [axiosSecure, branch]);

    useEffect(() => {
        fetchDevices();
    }, [fetchDevices]);

    const openModal = (device = null) => {
        if (device) {
            setEditId(device._id);
            setFormData(device);
        } else {
            setEditId(null);
            setFormData({ deviceName: "", sn: "", branch: branch, deptId: "" });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditId(null);
    };

    const handleFormSubmit = async () => {
        setIsLoading(true);
        try {
            if (editId) {
                await axiosSecure.put(`/devices/${editId}`, formData);
            } else {
                await axiosSecure.post('/devices', formData);
            }
            fetchDevices();
            closeModal();
            Swal.fire("Success!", `Device has been successfully ${editId ? 'updated' : 'registered'}.`, 'success');
        } catch (error) {
            console.error("Error saving device:", error);
            Swal.fire({ icon: "error", title: "Save Error!", text: error.response?.data?.message || "Failed to save device." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = (id) => {
        Swal.fire({
            title: "Are you sure?", text: "This will delete the device from your system.", icon: "warning",
            showCancelButton: true, confirmButtonColor: "#d33", cancelButtonColor: "#3085d6", confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/devices/${id}`)
                    .then(() => {
                        fetchDevices();
                        Swal.fire("Deleted!", "The device has been removed.", "success");
                    })
                    .catch((error) => Swal.fire("Error!", "Failed to delete device.", "error"));
            }
        });
    };

    const { paginatedData, paginationControls, rowsPerPageAndTotal } = Mpagination({ totalData: devices });

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-base-200 min-h-screen">
            <Mtitle title="Device Management" rightcontent={
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-xl shadow-md hover:bg-blue-700 transition duration-300">
                    <FiPlus className="text-xl" /> Add New Device
                </motion.button>
            } />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card bg-base-100 shadow-xl mt-6">
                <div className="p-4">
                    <div className="text-sm text-slate-700 mb-4">{rowsPerPageAndTotal}</div>
                    {isPageLoading ? <MtableLoading /> : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className='bg-blue-600 text-white'>
                                    <tr>
                                        <th>Device Name</th>
                                        <th>Serial Number (SN)</th>
                                        <th>Status</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((device) => (
                                        <tr key={device._id} className="hover">
                                            <td>{device.deviceName}</td>
                                            <td>{device.sn}</td>
                                            <td><span className={`badge ${device.status === 'active' ? 'badge-success' : 'badge-ghost'}`}>{device.status}</span></td>
                                            <td className="text-center">
                                                <button onClick={() => openModal(device)} className="btn btn-ghost btn-sm text-yellow-600"><FiEdit /></button>
                                                <button onClick={() => handleRemove(device._id)} className="btn btn-ghost btn-sm text-red-600"><FiTrash2 /></button>
                                            </td>
                                        </tr>
                                    ))}
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
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-lg">
                            <h2 className="text-xl font-semibold mb-6">{editId ? "Edit Device" : "Add New Device"}</h2>
                            <div className="space-y-4">
                                <input type="text" value={formData.deviceName} onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })} className="input input-bordered w-full" placeholder="Device Name (e.g. Main Entrance)" />
                                <input type="text" value={formData.sn} onChange={(e) => setFormData({ ...formData, sn: e.target.value })} className="input input-bordered w-full" placeholder="Device Serial Number (SN)" disabled={!!editId} />
                                <input type="text" value={formData.deptId} onChange={(e) => setFormData({ ...formData, deptId: e.target.value })} className="input input-bordered w-full" placeholder="Device Department ID" />
                            </div>
                            <div className="flex justify-end gap-4 mt-8">
                                <button onClick={closeModal} className="btn">Cancel</button>
                                <button onClick={handleFormSubmit} className="btn btn-primary" disabled={isLoading}>{isLoading ? "Saving..." : "Save"}</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DeviceManagement;