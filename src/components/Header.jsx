// src/components/Header.js

import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaClipboardList, FaShoppingCart, FaTable, FaUserCircle } from "react-icons/fa";
import { RiMenuFold4Fill } from "react-icons/ri";
import Preloader from "./Shortarea/Preloader";
import person from "../assets/Raw-Image/Person.jpg";
import {
  MdMenu,

  MdMail,
  MdNotifications,
  MdSearch,
} from "react-icons/md";
import { AuthContext } from "../providers/AuthProvider";
import UseAxiosSecure from "../Hook/UseAxioSecure";

const Header = ({ isSidebarOpen, toggleSidebar }) => {
  const [isProfileOpen, setProfileOpen] = useState(false);
     const [isLoading, setIsLoading] = useState(false);
  const { user, logoutUser,branch  } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
   const [products, setProducts] = useState([]);
    const axiosSecure = UseAxiosSecure();
  const navigate = useNavigate();
  const openModal = () => {
    setIsLoading(true);
    setIsModalOpen(true);

    axiosSecure
      .get(`/invoice/${branch}/item`) // Updated API endpoint
      .then((response) => {
        setProducts(response.data);
        setIsLoading(false); // Move inside the .then() block
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setIsLoading(false); // Ensure it is also set in case of an error
      });
};

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleSignOut = async () => {
    await logoutUser();
    navigate("/");
  };

  // Dummy dropdown state. Implement as needed.
  const [isMailOpen, setMailOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="bg-white shadow-md w-full p-2 flex items-center justify-between z-10">
      {/* Left side: Toggler, Search */}
      <div className="flex items-center gap-4">
        {/* ✨ UPDATED TOGGLE BUTTON ✨ */}
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:bg-gray-100 p-2 rounded-full focus:outline-none transition-colors duration-200"
        >
          {isSidebarOpen ? (
            <RiMenuFold4Fill className="text-2xl" />
          ) : (
            <MdMenu className="text-2xl" />
          )}
        </button>

        <div className="relative hidden md:block">
          <MdSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full bg-gray-100 border-none rounded-md pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <nav className="hidden md:flex gap-6 text-sm font-medium">
        <Link
          to="/dashboard/pos"
          className="hover:underline flex items-center gap-1"
        >
          <FaShoppingCart />
          <span>Collect Order</span>
        </Link>
        <button
          onClick={openModal}
          className="hover:underline flex items-center gap-1"
        >
          <FaCheckCircle />
          <span>Sell Product</span>
        </button>
        <Link
          to="/dashboard/pending-orders"
          className="hover:underline flex items-center gap-1"
        >
          <FaClipboardList />
          <span>Pending Order</span>
        </Link>
           <Link
          to="/dashboard/tables/view"
          className="hover:underline flex items-center gap-1"
        >
          <FaTable />
          <span>Table </span>
        </Link>
      </nav>
      {/* Right side: Icons and User Profile */}
      <div className="flex items-center gap-4">
        {/* Mail Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMailOpen(!isMailOpen)}
            className="text-gray-500 text-2xl relative"
          >
            <MdMail />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-white text-xs">
              0
            </span>
          </button>
          {isMailOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg p-2 z-20">
              <p className="text-sm text-gray-700 p-2">
                Coming Soon 
              </p>
            </div>
          )}
        </div>



        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!isNotificationsOpen)}
            className="text-gray-500 text-2xl relative"
          >
            <MdNotifications />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white text-xs">
              0
            </span>
          </button>
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg p-2 z-20">
              <p className="text-sm text-gray-700 p-2">
                comming soon .
              </p>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
   <button
  onClick={() => setProfileOpen(!isProfileOpen)}
  className="flex items-center gap-2 focus:outline-none"
>
  {user?.photo ? (
    <img
      src={user.photo}
      alt="User"
      className="w-8 h-8 rounded-full object-cover"
    />
  ) : (
    <FaUserCircle className="text-2xl text-gray-600" />
  )}
  <span className="hidden md:block font-medium text-sm text-gray-700">
    {user?.name || "Guest"}
  </span>
</button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-700 rounded-lg shadow-lg z-20">
              <div className="p-4 border-b">
                <h2 className="text-sm font-medium">
                  {user?.role || "User"}
                </h2>
                <p className="text-xs text-gray-500">
                  {user?.email || "No Email"}
                </p>
              </div>
              <div className="flex flex-col text-sm">
                <Link
                  to="/dashboard/profile"
                  className="py-2 px-4 hover:bg-blue-100 text-left"
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="py-2 px-4 hover:bg-blue-100 text-left text-red-600"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
     {isModalOpen && (

<div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fadeIn">
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl relative p-8 border border-gray-200">
      {/* Close Button */}
      <button
        onClick={closeModal}
        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl focus:outline-none transition duration-200"
        aria-label="Close modal"
      >
        ✖
      </button>

      {/* Modal Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-800">Today's Sell Product</h2>
        <p className="text-sm text-gray-500 mt-2">
          Review product sales and check quantities .
        </p>
      </div>

      {/* Product Table */}

      {isLoading ? (
    <Preloader />
  ) : (

      <div className="overflow-auto max-h-80">
        <table className="min-w-full text-left border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
              <th className="py-3 px-5 border-b border-gray-300">Product Name</th>
              <th className="py-3 px-5 border-b border-gray-300">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 transition duration-150"
              >
                <td className="py-3 px-5 border-b border-gray-300 text-gray-700">
                  {product.productName}
                </td>
                <td className="py-3 px-5 border-b border-gray-300 text-gray-700">
                  {product.qty}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


 )}




      {/* Footer */}
      <div className="mt-8 flex justify-end gap-4">
        <button
          onClick={closeModal}
          className="px-5 py-3 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
        >
          Close Now
        </button>
      </div>
    </div>
  </div>



)}
    </header>
  );
};

export default Header;