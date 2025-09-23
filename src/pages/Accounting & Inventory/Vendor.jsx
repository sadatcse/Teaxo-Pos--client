import React, { useState, useEffect, useContext } from "react";
import { FiEdit, FiTrash2,FiBookOpen , FiEye, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { TfiSearch } from "react-icons/tfi";
import { GoPlus } from "react-icons/go";
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from "react-router-dom"; // 1. <-- Import Link


import Mpagination from "../../components library/Mpagination";
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from "../../providers/AuthProvider";
import MtableLoading from "../../components library/MtableLoading"; 

const Vendors = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const [vendors, setVendors] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        vendorID: "", vendorName: "", address: "", primaryPhone: "",
        primaryEmail: "", status: "Active", contactPersonName: "",
        contactPersonPhone: "", notes: "", branch: branch || "",
    });
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [isTableLoading, setIsTableLoading] = useState(false);

    useEffect(() => {
        if (!branch) return;
        const fetchVendors = async () => {
            setIsTableLoading(true);
            try {
                const response = await axiosSecure.get(`/vendor/${branch}/get-all`);
                const filteredData = response.data.filter(vendor =>
                    vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    vendor.vendorID.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setVendors(filteredData);
            } catch (error) {
                console.error('Error fetching vendors:', error);
                Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to fetch vendors.' });
            } finally {
                setIsTableLoading(false);
            }
        };
        const debounceHandler = setTimeout(() => { fetchVendors(); }, 500);
        return () => clearTimeout(debounceHandler);
    }, [branch, searchTerm, axiosSecure]);

    const refreshVendors = async () => {
        if (!branch) return;
        setIsTableLoading(true);
        try {
            const response = await axiosSecure.get(`/vendor/${branch}/get-all`);
            const filteredData = response.data.filter(vendor =>
                vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vendor.vendorID.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setVendors(filteredData);
        } catch (error) { console.error('Error fetching vendors:', error); } finally { setIsTableLoading(false); }
    };

    const handleAddOrEditVendor = async () => {
        setIsFormLoading(true);
        const payload = { ...formData, branch: formData.branch || branch, };
        try {
            if (editId) { await axiosSecure.put(`/vendor/update/${editId}`, payload); }
            else { await axiosSecure.post('/vendor/post', payload); }
            refreshVendors();
            closeModal();
            Swal.fire({ icon: 'success', title: 'Success!', text: `Vendor has been ${editId ? 'updated' : 'added'}.` });
        } catch (error) {
            console.error('Error saving vendor:', error);
            const errorMessage = error.response?.data?.error || 'Failed to save vendor. Please try again.';
            Swal.fire({ icon: 'error', title: 'Error!', text: errorMessage });
        } finally { setIsFormLoading(false); }
    };

    const handleEdit = (vendorToEdit) => {
        setEditId(vendorToEdit._id);
        setFormData(vendorToEdit);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditId(null);
        setFormData({
            vendorID: "", vendorName: "", address: "", primaryPhone: "", primaryEmail: "",
            status: "Active", contactPersonName: "", contactPersonPhone: "", notes: "", branch: branch || "",
        });
    }

const handleRemove = (id) => {
    Swal.fire({
        title: 'Are you sure?',
        text: "This vendor might have associated transactions.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            axiosSecure.delete(`/vendor/delete/${id}`)
                .then(() => {
                    refreshVendors();
                    Swal.fire('Deleted!', 'The vendor has been deleted.', 'success');
                })
                .catch(error => {
                    console.error('Error deleting vendor:', error.response);
                    
                    // Get the specific message from the server's response,
                    // or show a generic message if one isn't available.
                    const errorMessage = error.response?.data?.message || 'Failed to delete the vendor.';
                    
                    Swal.fire({
                        icon: 'error',
                        title: 'Deletion Failed',
                        text: errorMessage // Use the dynamic error message here
                    });
                });
        }
    });
};

    const handleInputChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
    const renderStatusBadge = (status) => { const styles = { Active: "bg-green-100 text-green-700", Inactive: "bg-red-100 text-red-700", }; return (<span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>); };
    const { paginatedData, paginationControls, rowsPerPageAndTotal } = Mpagination({ totalData: vendors });

    const inputClass = "w-full border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150";

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-base-200 min-h-screen">
            <Mtitle title="Vendor Management" rightcontent={
                <div className='flex items-center gap-4'>
                    <div className='relative md:w-80'>
                        <TfiSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400' />
                        <input type="text" className={`${inputClass} pl-10`} placeholder='Search by Name or ID...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-xl shadow-md hover:bg-blue-700 transition duration-300">
                        <GoPlus className="text-xl" /> Create Vendor
                    </motion.button>
                </div>
            } />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="card bg-base-100 shadow-xl mt-6">
                <div className="p-4">
                    <div className="text-sm text-slate-700 mb-4">{rowsPerPageAndTotal}</div>
                    {isTableLoading ? <MtableLoading /> : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className='bg-blue-600 text-white uppercase text-xs font-medium tracking-wider'><tr><th className="p-3 rounded-tl-lg">Vendor ID</th><th className="p-3">Vendor Name</th><th className="p-3">Phone</th><th className="p-3">Email</th><th className="p-3">Status</th><th className="p-3 rounded-tr-lg text-center">Actions</th></tr></thead>
                                <tbody>
                                    <AnimatePresence>
                                        {paginatedData.length === 0 ? (<tr><td colSpan="6" className="text-center py-8 text-slate-700">No vendors found.</td></tr>) : (
                                            paginatedData.map((vendor) => (
                                                <motion.tr key={vendor._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-blue-50 border-b border-slate-200 text-sm text-slate-700">
                                                    <td className="p-3 font-medium">{vendor.vendorID}</td><td className="p-3">{vendor.vendorName}</td><td className="p-3">{vendor.primaryPhone}</td><td className="p-3">{vendor.primaryEmail || 'N/A'}</td><td className="p-3">{renderStatusBadge(vendor.status)}</td>
                                           <td className="p-3 text-center">
  <div className="flex justify-center items-center gap-2">
    {/* 3. Add this Link and Button */}
    <Link to={`/dashboard/vendor-ledger/${vendor._id}`}>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn btn-circle btn-sm bg-blue-600 hover:bg-blue-700 text-white" title="View Ledger">
            <FiBookOpen />
        </motion.button>
    </Link>
    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(vendor)} className="btn btn-circle btn-sm bg-yellow-600 hover:bg-yellow-700 text-white" title="Edit">
        <FiEdit />
    </motion.button>
    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleRemove(vendor._id)} className="btn btn-circle btn-sm bg-red-600 hover:bg-red-700 text-white" title="Delete">
        <FiTrash2 />
    </motion.button>
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
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
                            <h2 className="text-xl font-semibold text-blue-600 mb-6">{editId ? 'Edit Vendor' : 'Create New Vendor'}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div><label className="label-text text-slate-700">Vendor ID *</label><input type="text" name="vendorID" value={formData.vendorID} onChange={handleInputChange} className={`${inputClass} mt-1`} placeholder="e.g., V-001" required disabled={!!editId} /></div>
                                <div><label className="label-text text-slate-700">Vendor Name *</label><input type="text" name="vendorName" value={formData.vendorName} onChange={handleInputChange} className={`${inputClass} mt-1`} placeholder="Enter vendor name" required /></div>
                                <div><label className="label-text text-slate-700">Primary Phone *</label><input type="text" name="primaryPhone" value={formData.primaryPhone} onChange={handleInputChange} className={`${inputClass} mt-1`} placeholder="Enter phone number" required /></div>
                                <div><label className="label-text text-slate-700">Primary Email</label><input type="email" name="primaryEmail" value={formData.primaryEmail} onChange={handleInputChange} className={`${inputClass} mt-1`} placeholder="Enter email address" /></div>
                                <div className="md:col-span-2"><label className="label-text text-slate-700">Address</label><input type="text" name="address" value={formData.address} onChange={handleInputChange} className={`${inputClass} mt-1`} placeholder="Enter vendor address" /></div>
                                <div><label className="label-text text-slate-700">Contact Person Name</label><input type="text" name="contactPersonName" value={formData.contactPersonName} onChange={handleInputChange} className={`${inputClass} mt-1`} placeholder="Optional" /></div>
                                <div><label className="label-text text-slate-700">Contact Person Phone</label><input type="text" name="contactPersonPhone" value={formData.contactPersonPhone} onChange={handleInputChange} className={`${inputClass} mt-1`} placeholder="Optional" /></div>
                                <div><label className="label-text text-slate-700">Status *</label><select name="status" value={formData.status} onChange={handleInputChange} className={`${inputClass} mt-1`}><option>Active</option><option>Inactive</option></select></div>
                            </div>
                            <div className="mt-4"><label className="label-text text-slate-700">Notes</label><textarea name="notes" value={formData.notes} onChange={handleInputChange} className={`${inputClass} w-full mt-1`} placeholder="Add any relevant notes here..."></textarea></div>
                            <div className="flex justify-end space-x-4 mt-8">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={closeModal} className="btn rounded-xl">Cancel</motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddOrEditVendor} className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md" disabled={isFormLoading}>{isFormLoading ? 'Saving...' : editId ? 'Save Changes' : 'Create Vendor'}</motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Vendors;