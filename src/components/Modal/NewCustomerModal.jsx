import React, { useContext, useState, useEffect } from "react";
import { FaUser, FaMobileAlt, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import useCustomerTableSearch from "../../Hook/useCustomerTableSearch";
import { AuthContext } from "../../providers/AuthProvider";
import { toast } from "react-toastify"; // Import the toast function
import "react-toastify/dist/ReactToastify.css"; // Import the toast CSS

const NewCustomerModal = ({ isOpen, onClose, mobile, onCustomerAdded }) => {
  const { addNewCustomer, error } = useCustomerTableSearch();
  const { branch } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    dateOfBirth: "",
    anniversary: "",
    dateOfFirstVisit: new Date().toISOString().split("T")[0], // Default to today
    branch: branch || "Other",
  });

  // Update mobile field if mobile prop is passed
  useEffect(() => {
    if (mobile) {
      setFormData((prevData) => ({
        ...prevData,
        mobile,
      }));
    }
  }, [mobile]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.name || !formData.mobile || !formData.branch) {
      toast.error("Name, Mobile, and Branch are required!"); // Show error toast
      return;
    }

    setIsSubmitting(true); // Set submitting state to true before making the API call
    const newCust = await addNewCustomer(formData); // Call the function to add the customer
    if (!error) {
      toast.success("Customer added successfully!"); // Show success toast
      if (onCustomerAdded && newCust) {
        onCustomerAdded(newCust);
      }
      onClose(); // Close modal only if no error
    } else {
      toast.error("Failed to add customer. Please try again."); // Show error toast
    }
    setIsSubmitting(false); // Reset submitting state
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4 text-center">Add New Customer</h2>

        {/* Form Fields */}
        <div className="grid grid-cols-1 gap-3">
          {/* Name */}
          <label className="text-gray-700 font-medium">Customer Name *</label>
          <div className="flex items-center border p-2 rounded">
            <FaUser className="text-gray-500 mr-2" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter Name"
              className="w-full outline-none"
              required
            />
          </div>

          {/* Mobile */}
          <label className="text-gray-700 font-medium">Mobile *</label>
          <div className="flex items-center border p-2 rounded">
            <FaMobileAlt className="text-gray-500 mr-2" />
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Enter Mobile"
              className="w-full outline-none"
              required
            />
          </div>

          {/* Email */}
          <label className="text-gray-700 font-medium">Email</label>
          <div className="flex items-center border p-2 rounded">
            <FaEnvelope className="text-gray-500 mr-2" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email"
              className="w-full outline-none"
            />
          </div>

          {/* Address */}
          <label className="text-gray-700 font-medium">Address</label>
          <div className="flex items-center border p-2 rounded">
            <FaMapMarkerAlt className="text-gray-500 mr-2" />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter Address"
              className="w-full outline-none"
            />
          </div>

          {/* Birthday & Anniversary on the same row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Date of Birth */}
            <div>
              <label className="text-gray-700 font-medium">Date of Birth</label>
              <div className="flex items-center border p-2 rounded">
                <FaCalendarAlt className="text-gray-500 mr-2" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full outline-none"
                />
              </div>
            </div>

            {/* Anniversary */}
            <div>
              <label className="text-gray-700 font-medium">Anniversary</label>
              <div className="flex items-center border p-2 rounded">
                <FaCalendarAlt className="text-gray-500 mr-2" />
                <input
                  type="date"
                  name="anniversary"
                  value={formData.anniversary}
                  onChange={handleChange}
                  className="w-full outline-none"
                />
              </div>
            </div>
          </div>

          {/* Date of First Visit */} 
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}

        {/* Action Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting} // Disable the button if submitting
            className="bg-green-600 text-white p-2 rounded w-full mr-2"
          >
            {isSubmitting ? "Saving..." : "Save Customer"}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting} // Disable the cancel button during submission
            className="bg-red-500 text-white p-2 rounded w-full"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewCustomerModal;
