import React, { useState, useEffect, useContext, useCallback } from "react";
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2'; // Assuming Swal is installed and configured
import { GoPlus } from "react-icons/go";
// Ensure these paths are correct relative to your project structure
import Mpagination from "../../components library/Mpagination";
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import Preloader from "../../components/Shortarea/Preloader";

const TableReservation = () => {
  const axiosSecure = UseAxiosSecure();
  // Destructure 'branch' and 'user' from AuthContext.
  // 'user' is needed to set the 'bookedBy' field in reservations.
  const { branch, user } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]); // Stores fetched reservation data
  const [availableTables, setAvailableTables] = useState([]); // Stores tables for the dropdown in the form
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls the visibility of the add/edit modal
  const [formData, setFormData] = useState({
    table: "", // Stores the selected table's ID
    startTime: "", // Reservation start time (datetime-local format)
    endTime: "",   // Reservation end time (datetime-local format)
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    additionalInfo: "",
    branch: branch, // Automatically set to the current branch from AuthContext
    status: "Pending", // Default status for new reservations
  });
  const [editId, setEditId] = useState(null); // Stores the ID of the reservation being edited
  const [isLoading, setIsLoading] = useState(false); // Controls loading state for form submission
  const [loading, setLoading] = useState(true); // Controls loading state for initial data fetch
  // State for filtering reservations by date, initialized to today's date
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));

  // useCallback to memoize fetchReservations to prevent unnecessary re-renders
  const fetchReservations = useCallback(async () => {
    setLoading(true); // Set loading true when fetching starts
    try {
      // Fetch all reservations for the current branch
      const response = await axiosSecure.get(`/reservation/branch/${branch}`);
      // Filter the fetched reservations based on the selected filterDate
      const filtered = response.data.filter(res => {
        const resDate = new Date(res.startTime).toISOString().slice(0, 10);
        return resDate === filterDate;
      });
      setReservations(filtered); // Update the reservations state with filtered data
    } catch (error) {
      console.error("Error fetching reservations:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to fetch reservations.",
      });
    }
    setLoading(false); // Set loading false when fetching ends
  }, [axiosSecure, branch, filterDate]); // Dependencies: axiosSecure, branch, filterDate

  // useCallback to memoize fetchAvailableTables
  const fetchAvailableTables = useCallback(async () => {
    try {
      // Fetch all tables associated with the current branch
      const response = await axiosSecure.get(`/table/branch/${branch}`);
      setAvailableTables(response.data); // Update the availableTables state
    } catch (error) {
      console.error("Error fetching tables:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to fetch available tables.",
      });
    }
  }, [axiosSecure, branch]); // Dependencies: axiosSecure, branch

  // useEffect to call fetch functions when 'branch' or the fetch functions themselves change
  useEffect(() => {
    if (branch) { // Ensure branch is available before fetching
      fetchAvailableTables();
      fetchReservations();
    }
  }, [branch, fetchAvailableTables, fetchReservations]);

  // Handler for input changes in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handler for adding or editing a reservation
  const handleAddOrEditReservation = async () => {
    setIsLoading(true); // Set loading true for form submission
    try {
      // Prepare the reservation data, including the bookedBy user ID
      const reservationData = {
        ...formData,
        bookedBy: user?.uid, // Assuming user.uid holds the ID of the authenticated user
      };

      if (editId) {
        // If editId exists, it's an update operation
        await axiosSecure.put(`/reservation/update/${editId}`, reservationData);
        Swal.fire("Updated!", "Reservation has been updated.", "success");
      } else {
        // Otherwise, it's a new reservation creation
        await axiosSecure.post(`/reservation/post`, reservationData);
        Swal.fire("Added!", "New reservation has been added.", "success");
      }
      fetchReservations(); // Re-fetch reservations to update the list
      setIsModalOpen(false); // Close the modal
      resetFormData(); // Reset form fields
      setEditId(null); // Clear editId
    } catch (error) {
      console.error("Error saving reservation:", error);
      // Extract error message from backend response if available, otherwise use a generic message
      const errorMessage = error.response?.data?.message || "Failed to save reservation. Please try again.";
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: errorMessage,
      });
    } finally {
      setIsLoading(false); // Set loading false after submission attempt
    }
  };

  // Handler for initiating an edit operation
  const handleEdit = (id) => {
    const reservation = reservations.find((r) => r._id === id); // Find the reservation by ID
    if (reservation) {
      setEditId(id); // Set the editId
      // Format Date objects to 'datetime-local' string for input fields
      const startTimeLocal = reservation.startTime ? new Date(reservation.startTime).toISOString().slice(0, 16) : "";
      const endTimeLocal = reservation.endTime ? new Date(reservation.endTime).toISOString().slice(0, 16) : "";

      // Populate formData with existing reservation details
      setFormData({
        table: reservation.table?._id || "", // Use optional chaining for table in case it's not populated
        startTime: startTimeLocal,
        endTime: endTimeLocal,
        customerName: reservation.customerName,
        customerPhone: reservation.customerPhone,
        customerEmail: reservation.customerEmail,
        additionalInfo: reservation.additionalInfo,
        branch: reservation.branch,
        status: reservation.status,
      });
      setIsModalOpen(true); // Open the modal
    }
  };

  // Handler for removing a reservation
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
        axiosSecure.delete(`/reservation/delete/${id}`)
          .then(() => {
            fetchReservations(); // Re-fetch reservations after deletion
            Swal.fire("Deleted!", "The reservation has been deleted.", "success");
          })
          .catch((error) => {
            console.error("Error deleting reservation:", error);
            Swal.fire("Error!", "Failed to delete reservation.", "error");
          });
      }
    });
  };

  // Function to reset the form data to its initial empty state
  const resetFormData = () => {
    setFormData({
      table: "",
      startTime: "",
      endTime: "",
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      additionalInfo: "",
      branch: branch, // Ensure branch is reset to the current context branch
      status: "Pending",
    });
  };

  // Integrate Mpagination for data pagination
  const { paginatedData, paginationControls, rowsPerPageAndTotal } = Mpagination({ totalData: reservations });

  return (
    <div className="p-4 min-h-screen font-sans bg-gray-50">
      {/* Page Title and Add New Button */}
      <Mtitle title="Table Reservations" rightcontent={
        <div className="flex justify-end gap-4 items-center">
          {/* Date Filter Input */}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            title="Filter reservations by date"
          />
          {/* Add New Reservation Button */}
          <button
            onClick={() => { setIsModalOpen(true); resetFormData(); setEditId(null); }}
            className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-xl shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-105"
          >
            <GoPlus className="text-xl" /> Add New
          </button>
        </div>
      } />

      {/* Rows per page and total count display from Mpagination */}
      <div className="text-sm md:text-base text-gray-700 mb-4">
        {rowsPerPageAndTotal}
      </div>

      {/* Conditional rendering based on loading state */}
      {loading ? (
        <Preloader /> // Show preloader while data is being fetched
      ) : (
        <section className="overflow-x-auto border border-gray-200 shadow-lg rounded-xl p-4 mt-5 bg-white">
          <table className="table w-full min-w-[800px] border-collapse"> {/* Added min-width for better mobile view */}
            <thead className="bg-blue-600">
              <tr className="text-sm font-medium text-white text-left">
                <td className="p-3 rounded-tl-xl">Table Name</td>
                <td className="p-3">Customer Name</td>
                <td className="p-3">Contact</td>
                <td className="p-3">Time Slot</td>
                <td className="p-3">Status</td>
                <td className="p-3 text-right rounded-tr-xl">Action</td>
              </tr>
            </thead>
            <tbody>
              {/* Conditional rendering if no reservations are found */}
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500 text-lg">
                    No reservations found for <span className="font-semibold">{filterDate}</span>.
                  </td>
                </tr>
              ) : (
                // Map through paginated data to display each reservation
                paginatedData.map((reservation) => (
                  <tr key={reservation._id} className="hover:bg-blue-50 border-b border-gray-200 last:border-b-0">
                    <td className="p-3 text-gray-800 font-medium">{reservation.table?.tableName || "N/A"}</td>
                    <td className="p-3 text-gray-700">{reservation.customerName}</td>
                    <td className="p-3 text-gray-700">
                      <p>{reservation.customerPhone}</p>
                      {reservation.customerEmail && <p className="text-xs text-gray-500">{reservation.customerEmail}</p>}
                    </td>
                    <td className="p-3 text-gray-700">
                      {/* Format start and end times for display */}
                      {new Date(reservation.startTime).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })} - <br />
                      {new Date(reservation.endTime).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-3">
                      {/* Status badge with dynamic styling */}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        reservation.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                        reservation.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        reservation.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        reservation.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {reservation.status}
                      </span>
                    </td>
                    <td className="p-3 text-right flex justify-end gap-4 items-center">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEdit(reservation._id)}
                        className="text-blue-600 hover:text-blue-800 transition duration-150 p-2 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Edit Reservation"
                      >
                        <FiEdit className="text-lg" />
                      </button>
                      {/* Delete Button */}
                      <button
                        onClick={() => handleRemove(reservation._id)}
                        className="text-red-600 hover:text-red-800 transition duration-150 p-2 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                        title="Delete Reservation"
                      >
                        <FiTrash2 className="text-lg" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Pagination Controls */}
          {paginationControls}
        </section>
      )}

      {/* Reservation Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md mx-auto relative transform scale-95 animate-scale-up">
            <h2 className="text-3xl font-bold mb-7 text-gray-800 text-center">
              {editId !== null ? "Edit Reservation" : "Add New Reservation"}
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAddOrEditReservation(); }}>
              {/* Table Selection */}
              <div className="mb-5">
                <label htmlFor="table" className="block text-gray-700 text-sm font-semibold mb-2">Table</label>
                <select
                  id="table"
                  name="table"
                  value={formData.table}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-800"
                  required
                >
                  <option value="">Select a Table</option>
                  {availableTables.map((table) => (
                    <option key={table._id} value={table._id}>
                      {table.tableName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Time Input */}
              <div className="mb-5">
                <label htmlFor="startTime" className="block text-gray-700 text-sm font-semibold mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-800"
                  required
                />
              </div>

              {/* End Time Input */}
              <div className="mb-5">
                <label htmlFor="endTime" className="block text-gray-700 text-sm font-semibold mb-2">End Time</label>
                <input
                  type="datetime-local"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-800"
                  required
                />
              </div>

              {/* Customer Name Input */}
              <div className="mb-5">
                <label htmlFor="customerName" className="block text-gray-700 text-sm font-semibold mb-2">Customer Name</label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-800"
                  placeholder="Enter customer's full name"
                  required
                />
              </div>

              {/* Customer Phone Input */}
              <div className="mb-5">
                <label htmlFor="customerPhone" className="block text-gray-700 text-sm font-semibold mb-2">Customer Phone</label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-800"
                  placeholder="e.g., +1234567890"
                  required
                />
              </div>

              {/* Customer Email Input (Optional) */}
              <div className="mb-5">
                <label htmlFor="customerEmail" className="block text-gray-700 text-sm font-semibold mb-2">Customer Email (Optional)</label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-800"
                  placeholder="e.g., example@email.com"
                />
              </div>

              {/* Additional Info Textarea (Optional) */}
              <div className="mb-6">
                <label htmlFor="additionalInfo" className="block text-gray-700 text-sm font-semibold mb-2">Additional Info (Optional)</label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-800"
                  placeholder="e.g., Special requests, number of guests, dietary restrictions"
                  rows="3"
                ></textarea>
              </div>

              {/* Status Dropdown (only visible in edit mode) */}
              {editId && (
                <div className="mb-6">
                  <label htmlFor="status" className="block text-gray-700 text-sm font-semibold mb-2">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-800"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetFormData(); setEditId(null); }}
                  className="bg-gray-500 text-white py-2.5 px-6 rounded-xl hover:bg-gray-600 transition duration-300 transform hover:scale-105 shadow-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`bg-blue-600 text-white py-2.5 px-6 rounded-xl hover:bg-blue-700 transition duration-300 transform hover:scale-105 shadow-md ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : editId !== null ? "Save Changes" : "Add Reservation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableReservation;
