import React, { useState, useEffect, useContext, useCallback } from "react";
import { FiEdit, FiPlus } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from "framer-motion";

import Mtitle from "../../components library/Mtitle";
import ImageUpload from "../../config/ImageUploadcpanel";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import MtableLoading from "../../components library/MtableLoading";
import useActionPermissions from "../../Hook/useActionPermissions";

const CompanySettings = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const [companies, setCompanies] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "", phone: "", email: "", ownerEmail: "", address: "", logo: "",
        otherInformation: "", branch: branch || "", website: "", binNumber: "", tinNumber: "",
    });
    const [editId, setEditId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
   const { canPerform, loading: permissionsLoading } = useActionPermissions();
    const fetchCompanies = useCallback(async () => {
        if (!branch) return;
        setLoading(true);
        try {
            const response = await axiosSecure.get(`/company/branch/${branch}/`);
            setCompanies(response.data);
        } catch (error) {
            console.error("Error fetching companies:", error);
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    }, [axiosSecure, branch]);
    
    useEffect(() => {
        if (branch) {
            fetchCompanies();
        }
    }, [branch, fetchCompanies]);

    const closeModal = () => {
        setIsModalOpen(false);
        setEditId(null);
        setFormData({
            name: "", phone: "", email: "", ownerEmail: "", address: "", logo: "",
            otherInformation: "", branch: branch || "", website: "", binNumber: "", tinNumber: "",
        });
    };

    const handleAddOrEditCompany = async () => {
        setIsLoading(true);
        try {
            const payload = { ...formData, branch: formData.branch || branch };
            if (editId) {
                await axiosSecure.put(`/company/update/${editId}`, payload);
            } else {
                await axiosSecure.post(`/company/post`, payload);
            }
            fetchCompanies();
            closeModal();
            Swal.fire({ icon: 'success', title: 'Success!', text: `Company profile has been ${editId ? 'updated' : 'created'}.`, timer: 2000, showConfirmButton: false });
        } catch (error) {
            console.error("Error saving company:", error);
            Swal.fire({ icon: "error", title: "Error!", text: "Failed to save company profile. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (id) => {
        const company = companies.find((c) => c._id === id);
        setEditId(id);
        setFormData(company);
        setIsModalOpen(true);
    };

    const ProfileDetail = ({ label, value }) => (
        <div>
            <p className="text-sm text-slate-700 dark:text-zinc-450">{label}</p>
            <p className="font-semibold text-blue-600 dark:text-blue-400 break-words">{value || 'N/A'}</p>
        </div>
    );

    const inputClass = "w-full bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700 dark:text-zinc-150 transition duration-150";
    const companyProfile = companies[0];

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200 dark:bg-zinc-950">
            <Mtitle title="Company Profile" rightcontent={
                !loading && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {companyProfile ? (
                            <button onClick={() => handleEdit(companyProfile._id)} className="btn bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md gap-2 border-none">
                                <FiEdit /> Edit Profile
                            </button>
                        ) : (
                            <button onClick={() => { setEditId(null); setIsModalOpen(true); }} className="btn bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md gap-2 border-none">
                                <FiPlus /> Create Profile
                            </button>
                        )}
                    </motion.div>
                )
            } />

            {loading ? <MtableLoading /> : (
                <AnimatePresence>
                    {companyProfile ? (
                        <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="card bg-base-100 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 shadow-xl mt-6">
                            <div className="card-body p-4 sm:p-6 lg:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                                    <div className="md:col-span-1 flex flex-col items-center text-center">
                                        <div className="avatar mb-4">
                                            <div className="w-32 rounded-full ring ring-blue-600 ring-offset-base-100 dark:ring-offset-zinc-900 ring-offset-2">
                                                <img src={companyProfile.logo || 'https://placehold.co/128x128/EBF4FF/3B82F6?text=Logo'} alt={`${companyProfile.name} logo`} />
                                            </div>
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-150">{companyProfile.name}</h2>
                                        <p className="text-slate-700 dark:text-zinc-400">{companyProfile.branch}</p>
                                    </div>
                                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 border-t md:border-t-0 md:border-l border-slate-200 dark:border-zinc-800 pt-6 md:pt-0 md:pl-6">
                                        <ProfileDetail label="Phone" value={companyProfile.phone} />
                                        <ProfileDetail label="Email" value={companyProfile.email} />
                                        <ProfileDetail label="Owner Email" value={companyProfile.ownerEmail} />
                                        <ProfileDetail label="Website" value={companyProfile.website} />
                                        <ProfileDetail label="Address" value={companyProfile.address} />
                                        <ProfileDetail label="BIN Number" value={companyProfile.binNumber} />
                                        <ProfileDetail label="TIN Number" value={companyProfile.tinNumber} />
                                        <div className="sm:col-span-2"><ProfileDetail label="Other Information" value={companyProfile.otherInformation} /></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-6 flex items-center justify-center">
                            <div className="text-center p-12 border-2 border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl w-full max-w-lg">
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-zinc-150">No Company Profile Found</h3>
                                <p className="text-slate-700 dark:text-zinc-400 mt-2 mb-6">Create a profile to manage your company's information and branding on receipts.</p>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setEditId(null); setIsModalOpen(true); }} className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md gap-2 border-none"><FiPlus /> Create Profile</motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-base-100 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                            <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-6">{editId ? "Edit Company Profile" : "Create Company Profile"}</h3>
                            <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div><label className="label-text text-slate-700 dark:text-zinc-350">Company Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`${inputClass} mt-1`} placeholder="Your Company LLC" /></div>
                                <div><label className="label-text text-slate-700 dark:text-zinc-350">Branch Name *</label><input type="text" value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })} className={`${inputClass} mt-1`} placeholder="e.g., Main Branch" /></div>
                                <div><label className="label-text text-slate-700 dark:text-zinc-350">Phone *</label><input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={`${inputClass} mt-1`} placeholder="Contact number" /></div>
                                <div><label className="label-text text-slate-700 dark:text-zinc-350">Company Email *</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`${inputClass} mt-1`} placeholder="contact@example.com" /></div>
                                <div><label className="label-text text-slate-700 dark:text-zinc-350">Owner's Email *</label><input type="email" value={formData.ownerEmail} onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })} className={`${inputClass} mt-1`} placeholder="owner@example.com" /></div>
                                <div><label className="label-text text-slate-700 dark:text-zinc-350">Address</label><input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={`${inputClass} mt-1`} placeholder="Full company address" /></div>
                                <div><label className="label-text text-slate-700 dark:text-zinc-350">Website</label><input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className={`${inputClass} mt-1`} placeholder="https://example.com" /></div>
                                <div><label className="label-text text-slate-700 dark:text-zinc-350">BIN Number</label><input type="text" value={formData.binNumber} onChange={(e) => setFormData({ ...formData, binNumber: e.target.value })} className={`${inputClass} mt-1`} placeholder="Business Identification Number" /></div>
                                <div className="md:col-span-2"><label className="label-text text-slate-700 dark:text-zinc-350">TIN Number</label><input type="text" value={formData.tinNumber} onChange={(e) => setFormData({ ...formData, tinNumber: e.target.value })} className={`${inputClass} mt-1`} placeholder="Taxpayer Identification Number" /></div>
                                <div className="md:col-span-2"><label className="label-text text-slate-700 dark:text-zinc-350">Other Information</label><textarea value={formData.otherInformation} onChange={(e) => setFormData({ ...formData, otherInformation: e.target.value })} className={`${inputClass} mt-1 h-24`} placeholder="e.g., Slogan, moto, etc."></textarea></div>
                                <div className="md:col-span-2"><label className="label-text text-slate-700 dark:text-zinc-350">Company Logo</label><div className="mt-1"><ImageUpload setImageUrl={(url) => setFormData({ ...formData, logo: url })} /></div></div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={closeModal} className="btn rounded-xl bg-gray-250 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-none hover:bg-gray-300 dark:hover:bg-zinc-700">Cancel</motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddOrEditCompany} className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md border-none" disabled={isLoading}>{isLoading ? <span className="loading loading-spinner"></span> : editId ? "Save Changes" : "Create Profile"}</motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CompanySettings;