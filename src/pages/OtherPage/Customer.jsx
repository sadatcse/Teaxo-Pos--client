import React, { useState, useContext, useEffect, useCallback } from "react";
import { FiEdit, FiSend, FiTrash2, FiEye, FiGift } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { GoPlus } from "react-icons/go";
import moment from 'moment';

import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import Preloader from "../../components/Shortarea/Preloader";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

const CustomerManagement = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch, user } = useContext(AuthContext); // Get the user object
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [redeemPoints, setRedeemPoints] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        mobile: "",
        email: "",
        dateOfBirth: "",
        anniversary: "",
        dateOfFirstVisit: new Date().toISOString().split("T")[0],
        branch: branch,
    });
    const [smsMessage, setSmsMessage] = useState("");
    const [smsMobile, setSmsMobile] = useState("");
    const [editId, setEditId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Pagination-related states for main table
    const [customers, setCustomers] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Pagination states for the detail modal
    const [invoiceCurrentPage, setInvoiceCurrentPage] = useState(0);
    const [redeemCurrentPage, setRedeemCurrentPage] = useState(0);
    const [invoiceItemsPerPage] = useState(5);
    const [redeemItemsPerPage] = useState(5);

    const loginUserName = user?.name || "Leavesoft User";
    const loginUserEmail = user?.email || "info@leavesoft.com";


    // Function to fetch customers with pagination
    const fetchCustomers = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchUrl = `customer/branch/${branch}?itemsPerPage=${itemsPerPage}&pageNumber=${currentPage + 1}`;
            const response = await axiosSecure.get(fetchUrl);
            const data = response.data;
            setCustomers(data.data);
            setTotalItems(data.totalData);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Error fetching data:', error);
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "Failed to fetch customer data.",
            });
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, itemsPerPage, branch, axiosSecure]);

    // Fetch data whenever pagination or branch changes
    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    // Function to fetch full customer details for the modal
    const fetchCustomerDetails = async (id) => {
        setIsLoading(true);
        try {
            const res = await axiosSecure.get(`/customer/get-id/${id}`);
            setSelectedCustomer(res.data);
            setIsDetailModalOpen(true);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "Failed to fetch customer details.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddOrEditCustomer = async () => {
        setIsLoading(true);
        try {
            if (editId) {
                await axiosSecure.put(`/customer/update/${editId}`, formData);
            } else {
                await axiosSecure.post(`/customer/post`, formData);
            }
            setIsModalOpen(false);
            fetchCustomers();
            setFormData({
                name: "",
                address: "",
                mobile: "",
                email: "",
                dateOfBirth: "",
                anniversary: "",
                dateOfFirstVisit: new Date().toISOString().split("T")[0],
                branch: branch,
            });
            setEditId(null);
            Swal.fire({
                icon: "success",
                title: "Success!",
                text: `Customer ${editId ? "updated" : "added"} successfully.`,
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "Failed to save customer. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (id) => {
        const customer = customers.find((c) => c._id === id);
        if (!customer) {
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "Customer data not found.",
            });
            return;
        }
        setEditId(id);
        setFormData({ ...customer, branch: branch });
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
                axiosSecure.delete(`/customer/delete/${id}`)
                    .then(() => {
                        Swal.fire("Deleted!", "The customer has been deleted.", "success");
                        fetchCustomers();
                    })
                    .catch((error) => {
                        console.error("Error deleting customer:", error);
                        Swal.fire("Error!", "Failed to delete customer.", "error");
                    });
            }
        });
    };

    const handleSendSms = async () => {
        if (!smsMessage.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Empty message!",
                text: "Please enter a message to send.",
            });
            return;
        }

        try {
            await axiosSecure.post("/sms/send", {
                phone: smsMobile,
                message: smsMessage,
            });
            Swal.fire("Success!", "SMS has been sent.", "success");
            setSmsMessage("");
            setIsSmsModalOpen(false);
        } catch (error) {
            console.error("Error sending SMS:", error);
            Swal.fire("Error!", "Failed to send SMS. Please try again.", "error");
        }
    };

    const handleRedeemPoints = async (id) => {
        const points = parseInt(redeemPoints, 10);
        if (isNaN(points) || points <= 0) {
            Swal.fire("Invalid Input", "Please enter a valid number of points to redeem.", "warning");
            return;
        }

        if (points > selectedCustomer.currentPoints) {
            Swal.fire("Insufficient Points", "Customer does not have enough points to redeem.", "warning");
            return;
        }

        try {
            await axiosSecure.put(`/customer/redeem-points/${id}`, { 
                redeemedPoints: points, 
                userName: loginUserName, 
                userEmail: loginUserEmail 
            });
            Swal.fire("Success!", "Points redeemed successfully.", "success");
            setIsRedeemModalOpen(false);
            setRedeemPoints("");
            fetchCustomers();
            fetchCustomerDetails(id); // Refresh details modal
        } catch (error) {
            console.error("Error redeeming points:", error);
            Swal.fire("Error!", "Failed to redeem points.", "error");
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleItemsPerPage = (e) => {
        const val = parseInt(e.target.value, 10);
        setItemsPerPage(val);
        setCurrentPage(0);
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const ellipsis = (key) => <span key={key} className="px-3 py-2 text-gray-500">...</span>;
        switch (true) {
            case totalPages <= 5:
                for (let i = 0; i < totalPages; i++) {
                    pageNumbers.push(
                        <button
                            key={i}
                            className={`px-3 join-item text-sm py-2 focus:outline-none transition-colors duration-300 ease-in-out ${currentPage === i ? 'bg-blue-600 rounded-lg text-white' : 'bg-transparent hover:bg-gray-200'}`}
                            onClick={() => setCurrentPage(i)}
                        >
                            {i + 1}
                        </button>
                    );
                }
                break;
            case currentPage <= 2:
                for (let i = 0; i < 3; i++) {
                    pageNumbers.push(
                        <button
                            key={i}
                            className={`px-3 join-item text-sm py-2 focus:outline-none transition-colors duration-300 ease-in-out ${currentPage === i ? 'bg-blue-600 rounded-lg text-white' : 'bg-transparent hover:bg-gray-200'}`}
                            onClick={() => setCurrentPage(i)}
                        >
                            {i + 1}
                        </button>
                    );
                }
                pageNumbers.push(ellipsis('start-ellipsis'));
                pageNumbers.push(
                    <button
                        key={totalPages - 1}
                        className={`px-3 join-item text-sm py-2 focus:outline-none transition-colors duration-300 ease-in-out ${currentPage === totalPages - 1 ? 'bg-blue-600 rounded-lg text-white' : 'bg-transparent hover:bg-gray-200'}`}
                        onClick={() => setCurrentPage(totalPages - 1)}
                    >
                        {totalPages}
                    </button>
                );
                break;
            case currentPage >= totalPages - 3:
                pageNumbers.push(
                    <button
                        key={0}
                        className={`px-3 join-item text-sm py-2 focus:outline-none transition-colors duration-300 ease-in-out ${currentPage === 0 ? 'bg-blue-600 rounded-lg text-white' : 'bg-transparent hover:bg-gray-200'}`}
                        onClick={() => setCurrentPage(0)}
                    >
                        1
                    </button>
                );
                pageNumbers.push(ellipsis('end-ellipsis'));
                for (let i = totalPages - 3; i < totalPages; i++) {
                    pageNumbers.push(
                        <button
                            key={i}
                            className={`px-3 join-item text-sm py-2 focus:outline-none transition-colors duration-300 ease-in-out ${currentPage === i ? 'bg-blue-600 rounded-lg text-white' : 'bg-transparent hover:bg-gray-200'}`}
                            onClick={() => setCurrentPage(i)}
                        >
                            {i + 1}
                        </button>
                    );
                }
                break;
            default:
                pageNumbers.push(
                    <button
                        key={0}
                        className={`px-3 join-item text-sm py-2 focus:outline-none transition-colors duration-300 ease-in-out ${currentPage === 0 ? 'bg-blue-600 rounded-lg text-white' : 'bg-transparent hover:bg-gray-200'}`}
                        onClick={() => setCurrentPage(0)}
                    >
                        1
                    </button>
                );
                pageNumbers.push(ellipsis('middle-ellipsis'));
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pageNumbers.push(
                        <button
                            key={i}
                            className={`px-3 join-item text-sm py-2 focus:outline-none transition-colors duration-300 ease-in-out ${currentPage === i ? 'bg-blue-600 rounded-lg text-white' : 'bg-transparent hover:bg-gray-200'}`}
                            onClick={() => setCurrentPage(i)}
                        >
                            {i + 1}
                        </button>
                    );
                }
                pageNumbers.push(ellipsis('middle-ellipsis-2'));
                pageNumbers.push(
                    <button
                        key={totalPages - 1}
                        className={`px-3 join-item text-sm py-2 focus:outline-none transition-colors duration-300 ease-in-out ${currentPage === totalPages - 1 ? 'bg-blue-600 rounded-lg text-white' : 'bg-transparent hover:bg-gray-200'}`}
                        onClick={() => setCurrentPage(totalPages - 1)}
                    >
                        {totalPages}
                    </button>
                );
                break;
        }
        return pageNumbers;
    };

    const rowsPerPageAndTotal = (
        <div className="flex justify-between items-center text-gray-600">
          
            <label className="flex items-center text-sm">
                Rows per page:
                <select
                    value={itemsPerPage}
                    className="bg-transparent outline-none text-gray-600 text-sm ml-2 rounded-md border-gray-300"
                    onChange={handleItemsPerPage}
                >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                </select>
            </label>
        </div>
    );

    const paginationControls = (
        <div className='flex mt-4 items-center justify-between'>
            <div className="flex justify-start items-center">
                <span className="text-gray-600 text-sm">
                    Page {currentPage + 1} of {totalPages}
                </span>
            </div>
            <div className="flex items-center space-x-2">
                <button
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                >
                    <MdNavigateBefore className="text-xl" />
                </button>
                <div className="flex space-x-1">
                    {renderPageNumbers()}
                </div>
                <button
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                >
                    <MdNavigateNext className="text-xl" />
                </button>
            </div>
        </div>
    );

    const paginatedInvoices = selectedCustomer?.invoices?.slice(
        invoiceCurrentPage * invoiceItemsPerPage,
        (invoiceCurrentPage + 1) * invoiceItemsPerPage
    ) || [];

    const paginatedRedeemHistory = selectedCustomer?.redeemHistory?.slice(
        redeemCurrentPage * redeemItemsPerPage,
        (redeemCurrentPage + 1) * redeemItemsPerPage
    ) || [];

    const invoiceTotalPages = Math.ceil((selectedCustomer?.invoices?.length || 0) / invoiceItemsPerPage);
    const redeemTotalPages = Math.ceil((selectedCustomer?.redeemHistory?.length || 0) / redeemItemsPerPage);

    return (
        <div className="p-4 bg-gray-50 min-h-screen font-sans">
            <Mtitle title="Customer Management" rightcontent={
                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-full shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-105"
                    >
                        <GoPlus className="text-xl" /> Add New
                    </button>
                </div>
            } />

            <div className="bg-white p-6 rounded-xl shadow-lg mt-6">
                <div className="flex justify-between items-center mb-4">
       
                    {rowsPerPageAndTotal}
                </div>

                {isLoading ? (
                    <Preloader />
                ) : (
                    <section className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr className="bg-blue-600 text-white uppercase text-xs font-medium tracking-wider text-left rounded-t-lg">
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Mobile</th>
                                    <th className="p-4">Total Orders</th>
                                    <th className="p-4">Total Spent</th>
                                    <th className="p-4">Points</th>
                                    <th className="p-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {customers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-6 text-gray-500">No customers found</td>
                                    </tr>
                                ) : (
                                    customers.map((customer, index) => (
                                        <tr key={index} className="hover:bg-gray-100 transition duration-150">
                                            <td className="p-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                                            <td className="p-4 whitespace-nowrap text-sm text-gray-600">{customer.mobile}</td>
                                            <td className="p-4 whitespace-nowrap text-sm text-gray-600">{customer.numberOfOrders || 0}</td>
                                            <td className="p-4 whitespace-nowrap text-sm text-gray-600">৳ <span></span>{(customer.totalAmountSpent || 0).toFixed(2)}</td>
                                            <td className="p-4 whitespace-nowrap text-sm text-blue-600 font-bold">{customer.currentPoints || 0}</td>
                                            <td className="p-4 whitespace-nowrap text-center text-sm font-medium">
                                                <div className="flex justify-center items-center space-x-4">
                                                    <button
                                                        onClick={() => fetchCustomerDetails(customer._id)}
                                                        className="text-blue-500 hover:text-blue-700 transition duration-150 transform hover:scale-110"
                                                        title="View Details"
                                                    >
                                                        <FiEye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(customer._id)}
                                                        className="text-indigo-500 hover:text-indigo-700 transition duration-150 transform hover:scale-110"
                                                        title="Edit"
                                                    >
                                                        <FiEdit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemove(customer._id)}
                                                        className="text-red-500 hover:text-red-700 transition duration-150 transform hover:scale-110"
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSmsMobile(customer.mobile);
                                                            setIsSmsModalOpen(true);
                                                        }}
                                                        className="text-blue-500 hover:text-blue-700 transition duration-150 transform hover:scale-110"
                                                        title="Send SMS"
                                                    >
                                                        <FiSend className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCustomer(customer);
                                                            setIsRedeemModalOpen(true);
                                                        }}
                                                        className="text-purple-500 hover:text-purple-700 transition duration-150 transform hover:scale-110"
                                                        title="Redeem Points"
                                                    >
                                                        <FiGift className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        {paginationControls}
                    </section>
                )}
            </div>

            {/* Customer Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 animate-modal-in">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">{editId !== null ? "Edit Customer" : "Add New Customer"}</h2>
                        <form onSubmit={(e) => { e.preventDefault(); handleAddOrEditCustomer(); }}>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                    placeholder="Name"
                                />
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                    placeholder="Address"
                                />
                                <input
                                    type="text"
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                    placeholder="Mobile"
                                />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                    placeholder="Email"
                                />
                                <div className="flex gap-4">
                                    <input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        className="w-1/2 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        placeholder="Date of Birth"
                                    />
                                    <input
                                        type="date"
                                        value={formData.anniversary}
                                        onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
                                        className="w-1/2 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        placeholder="Anniversary"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-gray-300 text-gray-700 py-2 px-6 rounded-full hover:bg-gray-400 transition duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 transition duration-300 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Saving..." : editId !== null ? "Save" : "Add"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SMS Modal */}
            {isSmsModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 animate-modal-in">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Send SMS</h2>
                        <input
                            type="text"
                            value={smsMobile}
                            readOnly
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 bg-gray-100"
                        />
                        <textarea
                            value={smsMessage}
                            onChange={(e) => setSmsMessage(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Enter message"
                            rows="4"
                        />
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setIsSmsModalOpen(false)}
                                className="bg-gray-300 text-gray-700 py-2 px-6 rounded-full hover:bg-gray-400 transition duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendSms}
                                className="bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 transition duration-300"
                            >
                                Send SMS
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Redeem Points Modal */}
            {isRedeemModalOpen && selectedCustomer && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 animate-modal-in">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Redeem Points</h2>
                        <p className="text-gray-600 mb-6">Redeeming points for <span className="font-semibold text-indigo-600">{selectedCustomer.name}</span></p>
                        <p className="mb-4 text-gray-700">Current Points: <span className="font-bold text-blue-600 text-lg">{selectedCustomer.currentPoints}</span></p>
                        <input
                            type="number"
                            value={redeemPoints}
                            onChange={(e) => setRedeemPoints(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                            placeholder="Enter points to redeem"
                            min="1"
                            max={selectedCustomer.currentPoints}
                        />
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setIsRedeemModalOpen(false)}
                                className="bg-gray-300 text-gray-700 py-2 px-6 rounded-full hover:bg-gray-400 transition duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleRedeemPoints(selectedCustomer._id)}
                                className="bg-purple-600 text-white py-2 px-6 rounded-full hover:bg-purple-700 transition duration-300"
                            >
                                Redeem
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Details Modal */}
            {isDetailModalOpen && selectedCustomer && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 animate-modal-in">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Customer Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-8">
                            <div><p className="text-gray-600"><span className="font-semibold text-gray-800">Name:</span> {selectedCustomer.name}</p></div>
                            <div><p className="text-gray-600"><span className="font-semibold text-gray-800">Mobile:</span> {selectedCustomer.mobile}</p></div>
                            <div><p className="text-gray-600"><span className="font-semibold text-gray-800">Email:</span> {selectedCustomer.email || 'N/A'}</p></div>
                            <div><p className="text-gray-600"><span className="font-semibold text-gray-800">Orders:</span> {selectedCustomer.numberOfOrders || 0}</p></div>
                            <div><p className="text-gray-600"><span className="font-semibold text-gray-800">Points:</span> {selectedCustomer.currentPoints || 0}</p></div>
                            <div><p className="text-gray-600"><span className="font-semibold text-gray-800">Total Spent:</span> ${(selectedCustomer.totalAmountSpent || 0).toFixed(2)}</p></div>
                            <div><p className="text-gray-600"><span className="font-semibold text-gray-800">Date of Birth:</span> {selectedCustomer.dateOfBirth ? moment(selectedCustomer.dateOfBirth).format('L') : 'N/A'}</p></div>
                            <div><p className="text-gray-600"><span className="font-semibold text-gray-800">Anniversary:</span> {selectedCustomer.anniversary ? moment(selectedCustomer.anniversary).format('L') : 'N/A'}</p></div>
                        </div>

                        {/* Invoice History Section with Pagination */}
                        <h3 className="text-xl font-bold text-gray-800 mt-6 mb-4 border-b pb-2">Invoice History</h3>
                        {selectedCustomer.invoices?.length > 0 ? (
                            <div className="overflow-x-auto border rounded-xl shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-600">Invoice</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-600">Date</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-600">Amount</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-600">Earned Points</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedInvoices.map((invoice, invIndex) => (
                                            <tr key={invIndex} className="hover:bg-gray-50 transition duration-150">
                                                <td className="p-3 text-sm text-gray-800">{invoice.invoiceSerial}</td>
                                                <td className="p-3 text-sm text-gray-800">{moment(invoice.dateTime).format('MMM Do YYYY')}</td>
                                                <td className="p-3 text-sm text-gray-800">${(invoice.totalAmount || 0).toFixed(2)}</td>
                                                <td className="p-3 text-sm text-blue-600 font-medium">{invoice.earnedPoints}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {/* Invoice Pagination Controls */}
                                <div className="flex justify-end items-center p-3 space-x-2 bg-gray-50 rounded-b-xl">
                                    <button
                                        onClick={() => setInvoiceCurrentPage(prev => Math.max(0, prev - 1))}
                                        disabled={invoiceCurrentPage === 0}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 disabled:opacity-50"
                                    >
                                        Prev
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Page {invoiceCurrentPage + 1} of {invoiceTotalPages}
                                    </span>
                                    <button
                                        onClick={() => setInvoiceCurrentPage(prev => Math.min(invoiceTotalPages - 1, prev + 1))}
                                        disabled={invoiceCurrentPage === invoiceTotalPages - 1}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No invoice history found.</p>
                        )}

                        {/* Redeemed Points History Section with Pagination */}
                        <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4 border-b pb-2">Redeemed Points History</h3>
                        {selectedCustomer.redeemHistory?.length > 0 ? (
                            <div className="overflow-x-auto border rounded-xl shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-600">Redeemed Points</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-600">Date</th>
                                            <th className="p-3 text-left text-sm font-semibold text-gray-600">User</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedRedeemHistory.map((redeem, redeemIndex) => (
                                            <tr key={redeemIndex} className="hover:bg-gray-50 transition duration-150">
                                                <td className="p-3 text-sm text-purple-600 font-medium">{redeem.redeemedPoints}</td>
                                                <td className="p-3 text-sm text-gray-800">{moment(redeem.redeemedDate).format('MMM Do YYYY')}</td>
                                                <td className="p-3 text-sm text-gray-800">{redeem.user?.name || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {/* Redeem History Pagination Controls */}
                                <div className="flex justify-end items-center p-3 space-x-2 bg-gray-50 rounded-b-xl">
                                    <button
                                        onClick={() => setRedeemCurrentPage(prev => Math.max(0, prev - 1))}
                                        disabled={redeemCurrentPage === 0}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 disabled:opacity-50"
                                    >
                                        Prev
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Page {redeemCurrentPage + 1} of {redeemTotalPages}
                                    </span>
                                    <button
                                        onClick={() => setRedeemCurrentPage(prev => Math.min(redeemTotalPages - 1, prev + 1))}
                                        disabled={redeemCurrentPage === redeemTotalPages - 1}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No redemption history found.</p>
                        )}
                        <div className="flex justify-end mt-8">
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 transition duration-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerManagement;