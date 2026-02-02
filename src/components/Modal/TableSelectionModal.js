import React from "react";

// --- SVG Icons ---

const CloseIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const CheckCircleIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const ArmchairIcon = ({ size = 40, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
    <path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z" />
    <path d="M5 18v2" />
    <path d="M19 18v2" />
  </svg>
);


// --- The Updated Table Selection Modal Component ---

const TableSelectionModal = ({
  isOpen,
  tables,
  selectedTable,
  handleTableSelect,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      
      {/* Modal Panel */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Select a Table</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Table Selection Grid (Scrollable) */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {tables.map((table) => {
              const isSelected = selectedTable === table._id;
              
              // Status Flags
              const isPending = table.status === 'pending';
              const isCooking = table.status === 'cooking';
              const isServed = table.status === 'served';
              const isReserved = table.status === 'reserved';
              
              // Disable if any status is active (occupied)
              const isDisabled = isPending || isReserved || isCooking || isServed;

              // Helper to determine button classes based on status and selection
              const getButtonClasses = () => {
                if (isPending) return 'border-red-400 bg-red-50 text-red-700 cursor-not-allowed shadow-inner';
                if (isCooking) return 'border-orange-400 bg-orange-50 text-orange-700 cursor-not-allowed shadow-inner';
                if (isServed) return 'border-purple-400 bg-purple-50 text-purple-700 cursor-not-allowed shadow-inner';
                if (isReserved) return 'border-yellow-400 bg-yellow-50 text-yellow-800 cursor-not-allowed shadow-inner';
                
                if (isSelected) return 'border-blue-600 bg-blue-50 shadow-md';
                return 'border-gray-200 hover:border-blue-400 hover:shadow-sm';
              };
              
              // Helper to determine icon and text colors
              const getDynamicColor = (type) => {
                if (isPending) return type === 'icon' ? 'text-red-400' : 'text-red-700';
                if (isCooking) return type === 'icon' ? 'text-orange-400' : 'text-orange-700';
                if (isServed) return type === 'icon' ? 'text-purple-400' : 'text-purple-700';
                if (isReserved) return type === 'icon' ? 'text-yellow-500' : 'text-yellow-800';
                
                if (isSelected) return type === 'icon' ? 'text-blue-600' : 'text-blue-800';
                return type === 'icon' ? 'text-gray-400' : 'text-gray-700';
              };

              return (
                <button
                  key={table._id}
                  onClick={() => handleTableSelect(table._id)}
                  disabled={isDisabled}
                  className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-lg aspect-square
                              transition-all duration-200 focus:outline-none focus:ring-2 
                              focus:ring-offset-2 focus:ring-blue-500
                              ${getButtonClasses()}`}
                >
                  {/* Selected Checkmark for 'free' tables */}
                  {isSelected && !isDisabled && (
                    <CheckCircleIcon className="absolute top-2 right-2 text-blue-600" size={24} />
                  )}
                  
                  {/* Status Indicator Badges */}
                  {isPending && <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">Occupied</div>}
                  {isCooking && <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full">Cooking</div>}
                  {isServed && <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded-full">Served</div>}
                  {isReserved && <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-yellow-500 text-white text-[10px] font-bold rounded-full">Reserved</div>}
                  
                  <ArmchairIcon
                    size={40}
                    className={`mb-2 transition-colors ${getDynamicColor('icon')}`}
                  />
                  <span className={`font-semibold text-center text-sm ${getDynamicColor('text')}`}>
                    {table.tableName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer & Action Button */}
        <div className="p-5 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <button
            onClick={onConfirm}
            disabled={!selectedTable}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg
                       hover:bg-blue-700 transition-colors duration-300
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                       disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Confirm and Start Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableSelectionModal;