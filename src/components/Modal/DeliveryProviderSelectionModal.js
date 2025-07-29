import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

// --- STEP 1: Ensure all your images are correctly imported ---
import home from "../../assets/Delivery/home.png";
import Pathao from "../../assets/Delivery/Pathao.png";
import Foodi from "../../assets/Delivery/Foodi.png";
import Foodpanda from "../../assets/Delivery/Foodpanda.png";

// --- STEP 2 (IMPROVED): Define providers as an array of objects for more flexibility ---
const providers = [
  {
    id: "DeliveryBoy",
    name: "In-House Delivery",
    image: home,
  },
  {
    id: "Pathao",
    name: "Pathao",
    image: Pathao,
  },
  {
    id: "Foodi",
    name: "Foodi",
    image: Foodi,
  },
  {
    id: "Foodpanda",
    name: "Foodpanda",
    image: Foodpanda,
  },
];

const DeliveryProviderSelectionModal = ({ isOpen, onSelect, onClose }) => {
  const [selectedProvider, setSelectedProvider] = useState("");
  
  // Reset selection when modal is reopened
  useEffect(() => {
    if (isOpen) {
      setSelectedProvider("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    // The button is disabled, but this is a fallback.
    if (!selectedProvider) {
      Swal.fire("Error", "Please select a delivery provider to continue.", "error");
      return;
    }
    onSelect(selectedProvider);
  };

  if (!isOpen) return null;

  return (
    // Backdrop
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      
      {/* Modal Panel */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Select Provider</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Provider Selection Grid */}
        <div className="p-6">
          <p className="text-center text-gray-600 mb-6">Choose your preferred delivery partner.</p>
          <div className="grid grid-cols-2 gap-4">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(provider.id)}
                className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                  ${selectedProvider === provider.id
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-indigo-400 hover:shadow-sm'
                  }`
                }
              >
                <img src={provider.image} alt={provider.name} className="h-16 object-contain mb-3" />
                <span className={`font-semibold text-sm ${selectedProvider === provider.id ? 'text-indigo-800' : 'text-gray-700'}`}>
                  {provider.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer & Actions */}
        <div className="flex justify-end gap-4 p-5 bg-gray-50 rounded-b-2xl">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={!selectedProvider}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryProviderSelectionModal;