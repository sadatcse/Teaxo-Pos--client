import React, { useState, useEffect, useContext } from "react";
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { TfiSearch } from "react-icons/tfi";
import { GoPlus } from "react-icons/go";
import Mpagination from "../../components library/Mpagination";
import MtableLoading from "../../components library/MtableLoading";
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from "../../providers/AuthProvider";
import Preloader from './../../components/Shortarea/Preloader';

const Vendors = () => {
  const axiosSecure = UseAxiosSecure();
  const { branch } = useContext(AuthContext);
  const [vendors, setVendors] = useState([]); // Holds the data from the API
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    vendorID: "",
    vendorName: "",
    address: "",
    primaryPhone: "",
    primaryEmail: "",
    status: "Active",
    contactPersonName: "",
    contactPersonPhone: "",
    notes: "",
    branch: branch || "",
  });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormLoading, setIsFormLoading] = useState(false); // For modal submission
  const [isTableLoading, setIsTableLoading] = useState(false); // For table data

  // Fetch vendors from the backend with filtering and debouncing
  useEffect(() => {
    if (!branch) return;

    const fetchVendors = async () => {
      setIsTableLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);

        // The controller doesn't currently support search, so we filter on the client-side.
        // For a full backend search, the API endpoint would need to handle the 'search' param.
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

    const debounceHandler = setTimeout(() => {
        fetchVendors();
    }, 500); // Debounce search

    return () => clearTimeout(debounceHandler);

  }, [branch, searchTerm, axiosSecure]);

  // Function to refresh data after an operation
  const refreshVendors = async () => {
    if (!branch) return;
    setIsTableLoading(true);
    try {
        const response = await axiosSecure.get(`/vendor/${branch}/get-all`);
        // We re-apply the client-side filter after refreshing
        const filteredData = response.data.filter(vendor => 
            vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.vendorID.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setVendors(filteredData);
    } catch (error) {
        console.error('Error fetching vendors:', error);
    } finally {
        setIsTableLoading(false);
    }
  };

  const handleAddOrEditVendor = async () => {
    setIsFormLoading(true);
    const payload = {
      ...formData,
      branch: formData.branch || branch,
    };

    try {
      if (editId) {
        await axiosSecure.put(`/vendor/update/${editId}`, payload);
      } else {
        await axiosSecure.post('/vendor/post', payload);
      }
      refreshVendors();
      closeModal();
      Swal.fire({ icon: 'success', title: 'Success!', text: `Vendor has been ${editId ? 'updated' : 'added'}.` });
    } catch (error) {
      console.error('Error saving vendor:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save vendor. Please try again.';
      Swal.fire({ icon: 'error', title: 'Error!', text: errorMessage });
    } finally {
      setIsFormLoading(false);
    }
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
        vendorID: "",
        vendorName: "",
        address: "",
        primaryPhone: "",
        primaryEmail: "",
        status: "Active",
        contactPersonName: "",
        contactPersonPhone: "",
        notes: "",
        branch: branch || "",
    });
  }

  const handleRemove = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure.delete(`/vendor/delete/${id}`)
          .then(() => {
            refreshVendors();
            Swal.fire('Deleted!', 'The vendor has been deleted.', 'success');
          })
          .catch(error => {
            console.error('Error deleting vendor:', error);
            Swal.fire('Error!', 'Failed to delete vendor.', 'error');
          });
      }
    });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const renderStatusBadge = (status) => {
    const styles = {
      Active: "bg-green-100 text-green-700",
      Inactive: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  const { paginatedData, paginationControls, rowsPerPageAndTotal } = Mpagination({ totalData: vendors });
  
  return (
     <div className="p-4 min-h-screen">
      <Mtitle title="Vendor Management" rightcontent={
        <div className='flex flex-col md:flex-row md:items-center gap-4'>
          <div className="flex items-center gap-4">
            <div className='md:w-64 border shadow-sm py-2 px-3 bg-white rounded-xl'>
              <div className='flex items-center gap-2'>
                <TfiSearch className='text-xl font-bold text-gray-500' />
                <input
                  type="text"
                  className='outline-none w-full'
                  placeholder='Search by Name or ID...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex gap-2 cursor-pointer items-center bg-blue-600 text-white py-2 px-4 rounded-xl shadow hover:bg-blue-700 transition duration-300"
            >
              <span className="font-semibold">Create new vendor</span>
              <GoPlus className="text-xl text-white" />
            </button>
          </div>
        </div>
      } />

      <div className="text-sm md:text-base">
        {rowsPerPageAndTotal}
      </div>

      {isTableLoading ? (
        <Preloader />
      ) : (
        <section className="overflow-x-auto border shadow-sm rounded-xl bg-white mt-5">
          <table className="table w-full">
            <thead className='bg-gray-50'>
              <tr className="text-sm font-semibold text-gray-600 text-left">
                <td className="p-4 rounded-l-xl">Vendor ID</td>
                <td className="p-4">Vendor Name</td>
                <td className="p-4">Primary Phone</td>
                <td className="p-4">Email</td>
                <td className="p-4">Status</td>
                <td className="p-4 rounded-r-xl text-center">Actions</td>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">No vendors found.</td>
                </tr>
              ) : (
                paginatedData.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-slate-50 border-b border-gray-100 last:border-b-0">
                    <td className="p-4 font-medium text-gray-800">{vendor.vendorID}</td>
                    <td className="p-4 text-gray-600">{vendor.vendorName}</td>
                    <td className="p-4 text-gray-600">{vendor.primaryPhone}</td>
                    <td className="p-4 text-gray-600">{vendor.primaryEmail || 'N/A'}</td>
                    <td className="p-4">{renderStatusBadge(vendor.status)}</td>
                    <td className="p-4 text-lg flex justify-center items-center space-x-4">
                        <button className="text-gray-400 hover:text-blue-500 transition duration-150"><FiEye /></button>
                      <button
                        onClick={() => handleEdit(vendor)}
                        className="text-gray-400 hover:text-yellow-600 transition duration-150"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleRemove(vendor._id)}
                        className="text-gray-400 hover:text-red-600 transition duration-150"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="p-4">
             <MtableLoading data={vendors}></MtableLoading>
             {paginationControls}
          </div>
        </section>
      )}

      {/* MODAL for Add/Edit Vendor */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-2xl mb-5 font-semibold text-gray-800">{editId ? 'Edit Vendor' : 'Create a New Vendor'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-600">Vendor ID *</label>
                  <input type="text" name="vendorID" value={formData.vendorID} onChange={handleInputChange} className="input-style" placeholder="e.g., V-001" required disabled={!!editId} />
              </div>
              <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-600">Vendor Name *</label>
                  <input type="text" name="vendorName" value={formData.vendorName} onChange={handleInputChange} className="input-style" placeholder="Enter vendor name" required/>
              </div>
              <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-600">Primary Phone *</label>
                  <input type="text" name="primaryPhone" value={formData.primaryPhone} onChange={handleInputChange} className="input-style" placeholder="Enter phone number" required/>
              </div>
               <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-600">Primary Email</label>
                  <input type="email" name="primaryEmail" value={formData.primaryEmail} onChange={handleInputChange} className="input-style" placeholder="Enter email address"/>
              </div>
              <div className="flex flex-col md:col-span-2">
                  <label className="mb-1 text-sm font-medium text-gray-600">Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="input-style" placeholder="Enter vendor address"/>
              </div>
               <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-600">Contact Person Name</label>
                  <input type="text" name="contactPersonName" value={formData.contactPersonName} onChange={handleInputChange} className="input-style" placeholder="Optional"/>
              </div>
               <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-600">Contact Person Phone</label>
                  <input type="text" name="contactPersonPhone" value={formData.contactPersonPhone} onChange={handleInputChange} className="input-style" placeholder="Optional"/>
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-600">Status *</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="input-style">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col mt-4">
                <label className="mb-1 text-sm font-medium text-gray-600">Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} className="input-style w-full" placeholder="Add any relevant notes here..."></textarea>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={closeModal}
                className="bg-gray-200 text-gray-800 py-2 px-5 font-semibold hover:bg-gray-300 rounded-lg transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrEditVendor}
                className={`bg-blue-600 text-white py-2 px-5 font-semibold hover:bg-blue-700 rounded-lg transition duration-300 ${isFormLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isFormLoading}
              >
                {isFormLoading ? 'Saving...' : editId ? 'Save Changes' : 'Create Vendor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;