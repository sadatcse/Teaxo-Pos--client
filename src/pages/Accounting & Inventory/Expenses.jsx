import React, { useState, useEffect, useContext } from "react";
import { FiEdit, FiTrash2, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { TfiSearch } from "react-icons/tfi";
import { GoPlus } from "react-icons/go";
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from "../../providers/AuthProvider";
import Preloader from './../../components/Shortarea/Preloader';

const Expenses = () => {
  const axiosSecure = UseAxiosSecure();
  const { branch, user } = useContext(AuthContext);

  // State Management
  const [expenses, setExpenses] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 1,
    totalDocuments: 0,
    limit: 10
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editId, setEditId] = useState(null);
  
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [formData, setFormData] = useState({
    title: "",
    category: "Utility",
    vendorName: "",
    totalAmount: "",
    paidAmount: "",
    paymentStatus: "Unpaid",
    paymentMethod: "Cash",
    date: new Date().toISOString().split('T')[0],
    note: "",
    branch: branch || "",
  });

  // Fetch active vendors for the dropdown
  useEffect(() => {
    if (!branch) return;
    const fetchVendors = async () => {
      try {
        const response = await axiosSecure.get(`/vendor/${branch}/active`);
        if (Array.isArray(response.data)) {
          setVendors(response.data);
        }
      } catch (error) { console.error('Error fetching vendors:', error); }
    };
    fetchVendors();
  }, [branch, axiosSecure]);

  // Fetch expenses based on filters and pagination
  useEffect(() => {
    if (!branch) return;
    const fetchExpenses = async () => {
      setIsTableLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (fromDate) params.append('fromDate', fromDate);
        if (toDate) params.append('toDate', toDate);
        params.append('page', currentPage);

        const response = await axiosSecure.get(`/expense/${branch}/get-all`, { params });
        
        if (response.data && Array.isArray(response.data.data)) {
          setExpenses(response.data.data);
          setPaginationInfo(response.data.pagination);
        } else {
          setExpenses([]);
          setPaginationInfo({ totalPages: 1, totalDocuments: 0, limit: 10 });
        }
      } catch (error) {
        console.error('Error fetching expenses:', error);
        setExpenses([]);
      } finally {
        setIsTableLoading(false);
      }
    };

    const debounceHandler = setTimeout(() => {
      fetchExpenses();
    }, 500);

    return () => clearTimeout(debounceHandler);
  }, [branch, searchTerm, fromDate, toDate, currentPage, axiosSecure]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, fromDate, toDate]);

  // Automatically update payment status based on amounts
  useEffect(() => {
    const total = Number(formData.totalAmount);
    const paid = Number(formData.paidAmount);
    if (!total || total <= 0) {
      setFormData(prev => ({ ...prev, paymentStatus: 'Unpaid' }));
    } else if (paid >= total) {
      setFormData(prev => ({ ...prev, paymentStatus: 'Paid' }));
    } else if (paid > 0 && paid < total) {
      setFormData(prev => ({ ...prev, paymentStatus: 'Partial' }));
    } else {
      setFormData(prev => ({ ...prev, paymentStatus: 'Unpaid' }));
    }
  }, [formData.totalAmount, formData.paidAmount]);

  // Function to refresh data, handling pagination correctly after a deletion
  const refreshExpenses = () => {
    if (expenses.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Modal and Form Handlers
  const openCreateModal = () => {
    setEditId(null);
    setFormData({
      title: "",
      category: "Utility",
      vendorName: "",
      totalAmount: "",
      paidAmount: "",
      paymentStatus: "Unpaid",
      paymentMethod: "Cash",
      date: new Date().toISOString().split('T')[0],
      note: "",
      branch: branch || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    if (name === 'category' && value !== 'Vendor') {
      newFormData.vendorName = '';
    }
    setFormData(newFormData);
  };

  // CRUD Operations
  const handleAddOrEditExpense = async () => {
    setIsFormLoading(true);
    const payload = {
      ...formData,
      branch: formData.branch || branch,
      totalAmount: Number(formData.totalAmount),
      paidAmount: Number(formData.paidAmount),
    };
    try {
      if (editId) {
        await axiosSecure.put(`/expense/update/${editId}`, payload);
      } else {
        await axiosSecure.post('/expense/post', payload);
      }
      refreshExpenses();
      closeModal();
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Expense has been ${editId ? 'updated' : 'added'}.`
      });
    } catch (error) {
      console.error('Error saving expense:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to save expense. Please check the form and try again.'
      });
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setEditId(expense._id);
    const formattedDate = expense.date ? new Date(expense.date).toISOString().split('T')[0] : '';
    setFormData({ ...expense, date: formattedDate });
    setIsModalOpen(true);
  };

  const handleRemove = (expense) => {
    if (expense.purchaseId && user?.role !== 'admin') {
      Swal.fire({
        icon: 'warning',
        title: 'Action Restricted',
        text: 'This expense is linked to a purchase and can only be deleted by an administrator.',
      });
      return;
    }
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure.delete(`/expense/delete/${expense._id}`)
          .then(() => {
            refreshExpenses();
            Swal.fire('Deleted!', 'The expense record has been deleted.', 'success');
          })
          .catch(error => {
            console.error('Error deleting expense:', error);
            Swal.fire('Error!', 'Failed to delete the expense.', 'error');
          });
      }
    });
  };

  const handleView = (expense) => {
    setSelectedExpense(expense);
    setIsViewModalOpen(true);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= paginationInfo.totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Render Helpers
  const renderRowsInfo = () => {
    if (!paginationInfo || paginationInfo.totalDocuments === 0) {
      return "No records found.";
    }
    const start = (currentPage - 1) * paginationInfo.limit + 1;
    const end = start - 1 + expenses.length;
    return `Showing ${start}-${end} of ${paginationInfo.totalDocuments} records`;
  };

  const renderStatusBadge = (status) => {
    const styles = {
      Paid: "bg-green-100 text-green-800",
      Unpaid: "bg-red-100 text-red-800",
      Partial: "bg-yellow-100 text-yellow-800",
    };
    return (<span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>);
  };

  const inputStyle = "w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150";

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50">
      <Mtitle title="Expense Management" rightcontent={
        <div className='flex flex-col md:flex-row md:items-center gap-3'>
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-1.5 shadow-sm">
              <label htmlFor="fromDate" className="text-sm text-gray-500">From:</label>
              <input 
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="outline-none bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-1.5 shadow-sm">
              <label htmlFor="toDate" className="text-sm text-gray-500">To:</label>
              <input 
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="outline-none bg-transparent"
              />
            </div>
          <div className="flex items-center gap-3">
            <div className='relative md:w-64'>
                <TfiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-lg text-gray-400' />
                <input
                    type="text"
                    className='outline-none w-full border border-gray-300 shadow-sm py-2 pl-10 pr-4 bg-white rounded-lg'
                    placeholder='Search...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button
                onClick={openCreateModal}
                className="flex gap-2 cursor-pointer items-center bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
            >
                <GoPlus className="text-xl text-white" />
                <span className="font-semibold hidden sm:inline">New Expense</span>
            </button>
          </div>
        </div>
      } />

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg mt-6">
        <div className="text-sm text-gray-600 mb-4">{renderRowsInfo()}</div>
        {isTableLoading ? (
          <div className="flex justify-center items-center h-64"><Preloader /></div>
        ) : (
          <section className="overflow-x-auto">
            <table className="table w-full">
              <thead className='bg-blue-600 text-white text-xs uppercase tracking-wider'>
                <tr>
                  <td className="p-4 font-semibold rounded-l-xl">Title</td>
                  <td className="p-4 font-semibold">Category</td>
                  <td className="p-4 font-semibold">Total</td>
                  <td className="p-4 font-semibold">Paid</td>
                  <td className="p-4 font-semibold">Status</td>
                  <td className="p-4 font-semibold">Date</td>
                  <td className="p-4 font-semibold rounded-r-xl text-center">Actions</td>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-12 text-gray-500"><p className="text-lg">No expenses found.</p><p className="text-sm">Try adjusting your search or date filters.</p></td></tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense._id} className="hover:bg-slate-50 border-b border-gray-100 last:border-b-0 text-sm text-gray-700">
                      <td className="p-4 font-medium text-gray-800">{expense.title}</td>
                      <td className="p-4">{expense.category}</td>
                      <td className="p-4">{expense.totalAmount?.toLocaleString()} BDT</td>
                      <td className="p-4">{expense.paidAmount?.toLocaleString()} BDT</td>
                      <td className="p-4">{renderStatusBadge(expense.paymentStatus)}</td>
                      <td className="p-4">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="flex justify-center items-center space-x-2">
                          <button onClick={() => handleView(expense)} className="p-2 rounded-full text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200"><FiEye /></button>
                          <button onClick={() => handleEdit(expense)} className="p-2 rounded-full text-gray-400 hover:bg-yellow-100 hover:text-yellow-600 transition-colors duration-200"><FiEdit /></button>
                          <button onClick={() => handleRemove(expense)} className="p-2 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors duration-200"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {paginationInfo && paginationInfo.totalDocuments > 0 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-600">Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{paginationInfo.totalPages}</span></span>
                <div className="flex items-center gap-2">
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><FiChevronLeft /></button>
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === paginationInfo.totalPages} className="p-2 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><FiChevronRight /></button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto">
            <h2 className="text-2xl mb-6 font-bold text-gray-800">{editId ? 'Edit Expense' : 'Create New Expense'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-600">Category *</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className={inputStyle}>
                  {["Utility", "Maintenance", "Rent", "Salary", "Groceries", "Marketing", "Cleaning", "Vendor", "Other"].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-600">{formData.category === 'Vendor' ? 'Vendor Name *' : 'Vendor Name'}</label>
                {formData.category === 'Vendor' ? (
                  <select name="vendorName" value={formData.vendorName} onChange={handleInputChange} className={inputStyle} required>
                    <option value="">-- Select a Vendor --</option>
                    {vendors.map(vendor => (<option key={vendor._id} value={vendor.vendorName}>{vendor.vendorName}</option>))}
                  </select>
                ) : (
                  <input type="text" name="vendorName" value={formData.vendorName} onChange={handleInputChange} className={inputStyle} placeholder="Optional" />
                )}
              </div>
              <div className="md:col-span-2 flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-600">Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} className={inputStyle} placeholder="e.g., Office Electricity Bill" required />
              </div>
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-600">Total Amount *</label>
                <input type="number" name="totalAmount" value={formData.totalAmount} onChange={handleInputChange} className={inputStyle} placeholder="0.00" required />
              </div>
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-600">Paid Amount *</label>
                <input type="number" name="paidAmount" value={formData.paidAmount} onChange={handleInputChange} className={inputStyle} placeholder="0.00" required />
              </div>
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-600">Payment Method *</label>
                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className={inputStyle}>
                  {["Cash", "Card", "Mobile", "Other"].map(method => <option key={method} value={method}>{method}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-medium text-gray-600">Payment Status</label>
                <div className={`${inputStyle} bg-gray-100 flex items-center`}>{renderStatusBadge(formData.paymentStatus)}</div>
              </div>
              <div className="flex flex-col md:col-span-2">
                <label className="mb-1.5 text-sm font-medium text-gray-600">Date *</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} className={inputStyle} required />
              </div>
            </div>
            <div className="flex flex-col mt-5">
              <label className="mb-1.5 text-sm font-medium text-gray-600">Note</label>
              <textarea name="note" value={formData.note} onChange={handleInputChange} rows="3" className={inputStyle} placeholder="Add any relevant details..."></textarea>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button onClick={closeModal} className="bg-slate-200 text-slate-800 py-2 px-6 font-semibold hover:bg-slate-300 rounded-lg transition duration-300">Cancel</button>
              <button onClick={handleAddOrEditExpense} className={`py-2 px-6 font-semibold text-white rounded-lg transition duration-300 ${isFormLoading ? 'opacity-50 cursor-not-allowed' : 'bg-blue-600 hover:shadow-lg transform hover:-translate-y-0.5'}`} disabled={isFormLoading}>
                {isFormLoading ? 'Saving...' : editId ? 'Save Changes' : 'Create Expense'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isViewModalOpen && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto">
            <h2 className="text-2xl mb-6 font-bold text-gray-800">Expense Details</h2>
            <div className="space-y-4">
              {Object.entries({
                "Title": selectedExpense.title,
                "Category": selectedExpense.category,
                "Vendor Name": selectedExpense.vendorName || "N/A",
                "Total Amount": `${selectedExpense.totalAmount?.toLocaleString()} BDT`,
                "Paid Amount": `${selectedExpense.paidAmount?.toLocaleString()} BDT`,
                "Due Amount": `${(selectedExpense.totalAmount - selectedExpense.paidAmount).toLocaleString()} BDT`,
                "Payment Status": <div className="inline-block">{renderStatusBadge(selectedExpense.paymentStatus)}</div>,
                "Payment Method": selectedExpense.paymentMethod,
                "Date": new Date(selectedExpense.date).toLocaleDateString(),
                "Note": selectedExpense.note || "No note provided."
              }).map(([label, value]) => (
                <div key={label} className="flex flex-col sm:flex-row border-b border-gray-200 pb-2">
                  <p className="font-semibold text-gray-600 w-full sm:w-1/3">{label}:</p>
                  <div className="text-gray-800 w-full sm:w-2/3">{value}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-8">
              <button onClick={() => setIsViewModalOpen(false)} className="bg-slate-600 text-white py-2 px-6 font-semibold hover:bg-slate-700 rounded-lg transition duration-300">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;