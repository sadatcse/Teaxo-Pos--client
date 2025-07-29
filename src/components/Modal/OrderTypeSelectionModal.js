import React from "react";
import { IoRestaurantOutline } from "react-icons/io5";
import { BsBag } from "react-icons/bs";
import { TbTruckDelivery } from "react-icons/tb";
import { TfiClose } from "react-icons/tfi";

const OrderTypeSelectionModal = ({ isOpen, onSelect, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200 shadow-2xl p-8 rounded-3xl text-center relative w-full max-w-xl transition-all duration-300">
        
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-600 rounded-full hover:bg-gray-100 hover:text-gray-900 transition"
            aria-label="Close modal"
          >
            <TfiClose size={20} />
          </button>
        )}

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Select Order Type
        </h2>

        {/* Order Type Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Dine-in */}
          <button
            onClick={() => onSelect("dine-in")}
            className="group flex flex-col items-center justify-center gap-2 px-5 py-6 bg-blue-100 text-blue-700 font-semibold rounded-xl hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-md hover:scale-[1.03]"
          >
            <IoRestaurantOutline size={28} className="group-hover:scale-110 transition" />
            <span className="text-sm md:text-base">Dine-in</span>
          </button>

          {/* Takeaway */}
          <button
            onClick={() => onSelect("takeaway")}
            className="group flex flex-col items-center justify-center gap-2 px-5 py-6 bg-green-100 text-green-700 font-semibold rounded-xl hover:bg-green-500 hover:text-white transition-all duration-300 shadow-md hover:scale-[1.03]"
          >
            <BsBag size={26} className="group-hover:scale-110 transition" />
            <span className="text-sm md:text-base">Takeaway</span>
          </button>

          {/* Delivery */}
          <button
            onClick={() => onSelect("delivery")}
            className="group flex flex-col items-center justify-center gap-2 px-5 py-6 bg-purple-100 text-purple-700 font-semibold rounded-xl hover:bg-purple-500 hover:text-white transition-all duration-300 shadow-md hover:scale-[1.03]"
          >
            <TbTruckDelivery size={28} className="group-hover:scale-110 transition" />
            <span className="text-sm md:text-base">Delivery</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTypeSelectionModal;
