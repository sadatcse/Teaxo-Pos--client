import React, { useState, useEffect, useCallback } from "react";
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { useDebounce } from "use-debounce";
import Swal from 'sweetalert2';

import UseAxiosSecure from '../../Hook/UseAxioSecure';
import Mtitle from '../../components library/Mtitle';
import Preloader from '../../components/Shortarea/Preloader';
import CompanyModal from './CompanyModal'; 

const ACompany = () => {
    const axiosSecure = UseAxiosSecure();

    const [companies, setCompanies] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 500);

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: currentPage, limit: 10, search: debouncedSearch });
            const response = await axiosSecure.get(`/company/superadmin/all?${params.toString()}`);
            setCompanies(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) { 
            console.error("Error fetching companies:", error); 
        } finally { 
            setLoading(false); 
        }
    }, [axiosSecure, currentPage, debouncedSearch]);

    useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

    const handleOpenModal = (company = null) => {
        setEditingCompany(company);
        setIsModalOpen(true);
    };

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        const isEditing = !!editingCompany;
        const endpoint = isEditing ? `/company/update/${editingCompany._id}` : '/company/post';
        const method = isEditing ? 'put' : 'post';
        
        try {
            await axiosSecure[method](endpoint, formData);
            Swal.fire('Success!', `Branch ${isEditing ? 'updated' : 'created'} successfully.`, 'success');
            fetchCompanies();
            setIsModalOpen(false);
        } catch (error) {
            Swal.fire('Error!', error.response?.data?.message || 'Failed to save branch.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?', text: "This will delete the branch and all associated data!",
            icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, delete it!'
        }).then(result => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/company/delete/${id}`).then(() => {
                    Swal.fire('Deleted!', 'The branch has been deleted.', 'success');
                    fetchCompanies();
                }).catch(() => Swal.fire('Error!', 'Failed to delete branch.', 'error'));
            }
        });
    };

    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
            <Mtitle title="Branch Management" rightcontent={
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <input 
                        type="text" 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        placeholder="Search branch, name, email..." 
                        className="input input-bordered w-full sm:w-auto rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200" 
                    />
                    <button 
                        onClick={() => handleOpenModal()} 
                        className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-xl flex items-center gap-2"
                    >
                        <FiPlus /> Add Branch
                    </button>
                </div>
            } />

            {loading ? <Preloader /> : (
                <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 mt-6 transition-colors">
                    <table className="table w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-650 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="p-4 text-sm font-bold">Logo</th>
                                <th className="p-4 text-sm font-bold">Company Name & IDs</th>
                                <th className="p-4 text-sm font-bold">Branch</th>
                                <th className="p-4 text-sm font-bold">Contact Info</th>
                                <th className="p-4 text-sm font-bold text-right rounded-tr-2xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map(company => (
                                <tr key={company._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-350">
                                    {/* Logo */}
                                    <td className="p-4">
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-12 h-12 bg-slate-100 dark:bg-slate-800">
                                                <img src={company.logo || 'https://via.placeholder.com/150'} alt={`${company.name} logo`} />
                                            </div>
                                        </div>
                                    </td>

                                    {/* Name & BIN/TIN */}
                                    <td className="p-4">
                                        <div className="font-semibold text-slate-850 dark:text-slate-200 text-md">{company.name}</div>
                                        <div className="text-[11px] mt-1 flex flex-wrap gap-1">
                                            {company.binNumber && <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-medium">BIN: {company.binNumber}</span>}
                                            {company.tinNumber && <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-medium">TIN: {company.tinNumber}</span>}
                                        </div>
                                    </td>

                                    {/* Branch */}
                                    <td className="p-4">
                                        <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none font-medium">
                                            {company.branch}
                                        </span>
                                    </td>

                                    {/* Contact & Owner */}
                                    <td className="p-4">
                                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Co: {company.email}</div>
                                        {company.ownerEmail && (
                                            <div className="text-xs text-indigo-655 dark:text-indigo-400 font-medium mt-0.5">Owner: {company.ownerEmail}</div>
                                        )}
                                        <div className="text-[11px] opacity-70 mt-1">{company.phone}</div>
                                    </td>

                                    {/* Actions */}
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => handleOpenModal(company)} className="btn btn-ghost btn-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg p-1.5" title="Edit">
                                            <FiEdit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(company._id)} className="btn btn-ghost btn-xs text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg p-1.5" title="Delete">
                                            <FiTrash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 text-slate-600 dark:text-slate-400">
                <p className="text-sm font-medium">Total Branches: {pagination.totalDocuments || 0}</p>
                <div className="join">
                    <button 
                        onClick={() => setCurrentPage(p => p - 1)} 
                        disabled={pagination.currentPage === 1} 
                        className="join-item btn bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300 disabled:opacity-50"
                    >
                        «
                    </button>
                    <button className="join-item btn bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:text-slate-300 cursor-default">
                        Page {pagination.currentPage || 1}
                    </button>
                    <button 
                        onClick={() => setCurrentPage(p => p + 1)} 
                        disabled={pagination.currentPage === pagination.totalPages} 
                        className="join-item btn bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300 disabled:opacity-50"
                    >
                        »
                    </button>
                </div>
            </div>

            <CompanyModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isEditing={!!editingCompany}
                initialData={editingCompany || {}}
            />
        </div>
    );
};

export default ACompany;