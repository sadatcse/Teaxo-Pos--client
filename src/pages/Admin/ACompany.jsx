import React, { useState, useEffect, useCallback } from "react";
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { useDebounce } from "use-debounce";
import Swal from 'sweetalert2';

import UseAxiosSecure from '../../Hook/UseAxioSecure';
import Mtitle from '../../components library/Mtitle';
import Preloader from '../../components/Shortarea/Preloader';
import CompanyModal from './CompanyModal'; // Adjust path if needed

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
        } catch (error) { console.error("Error fetching companies:", error); } 
        finally { setLoading(false); }
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
            title: 'Are you sure?', text: "This will delete the branch and all its associated data!",
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
        <div className="p-6 bg-gray-50 min-h-screen">
            <Mtitle title="Branch Management" rightcontent={
                <div className="flex items-center gap-4">
                     <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search branch, name, email..." className="input input-bordered w-full md:w-auto" />
                    <button onClick={() => handleOpenModal()} className="btn bg-blue-600 hover:bg-blue-700 text-white"><FiPlus className="mr-2"/>Add Branch</button>
                </div>
            } />

            {loading ? <Preloader /> : (
                <div className="overflow-x-auto bg-white rounded-lg shadow-md mt-6">
                    <table className="table w-full">
                        <thead className="bg-blue-600 text-white">
                            <tr><th>Logo</th><th>Company Name</th><th>Branch</th><th>Contact</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {companies.map(company => (
                                <tr key={company._id} className="hover">
                                    <td>
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-12 h-12">
                                                <img src={company.logo || 'https://via.placeholder.com/150'} alt={`${company.name} logo`} />
                                            </div>
                                        </div>
                                    </td>
                                    <td>{company.name}</td>
                                    <td><span className="badge badge-neutral">{company.branch}</span></td>
                                    <td>{company.email}<br/><span className="text-sm opacity-70">{company.phone}</span></td>
                                    <td className="space-x-2">
                                        <button onClick={() => handleOpenModal(company)} className="btn btn-ghost btn-sm"><FiEdit/></button>
                                        <button onClick={() => handleDelete(company._id)} className="btn btn-ghost btn-sm text-red-500"><FiTrash2/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <div className="flex justify-between items-center mt-6">
                <p>Total Branches: {pagination.totalDocuments}</p>
                <div className="join">
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={pagination.currentPage === 1} className="join-item btn">«</button>
                    <button className="join-item btn">Page {pagination.currentPage}</button>
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={pagination.currentPage === pagination.totalPages} className="join-item btn">»</button>
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