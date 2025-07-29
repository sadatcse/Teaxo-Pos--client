import { useState, useContext, useRef } from "react"; // Added useEffect, useCallback if not already there
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import useCompanyHook from "../../Hook/useCompanyHook";
import ReceiptTemplate from "../../components/Receipt/ReceiptTemplate ";
import KitchenReceiptTemplate from "../../components/Receipt/KitchenReceiptTemplate";
import useCustomerTableSearch from "../../Hook/useCustomerTableSearch";
import NewCustomerModal from "../../components/Modal/NewCustomerModal";
import Swal from "sweetalert2";
import TableSelectionModal from "../../components/Modal/TableSelectionModal";
import OrderTypeSelectionModal from "../../components/Modal/OrderTypeSelectionModal.js";
import DeliveryProviderSelectionModal from "../../components/Modal/DeliveryProviderSelectionModal";
import { toast } from "react-toastify";
import ProductSelection from "../../components/Product/ProductSelection.jsx"
import OrderSummary from "../../components/Product/OrderSummary.jsx"
import useCategoriesWithProducts from "../../Hook/useCategoriesWithProducts";

const CollectOrder = () => {
  // Authentication and Branch Context
  const { user, branch } = useContext(AuthContext);
  const loginUserEmail = user?.email || "info@leavesoft.com";
  const loginUserName = user?.name || "leavesoft";

  // State for customer search and selection
  const [mobile, setMobile] = useState("");
  const {
    customer,
    tables,
    searchCustomer,
    selectedTable,
    isCustomerModalOpen,
    setSelectedTable,
    setCustomerModalOpen,
  } = useCustomerTableSearch();

  // Axios instance for secure API calls
  const axiosSecure = UseAxiosSecure();

  // Product and Category States - REPLACED WITH NEW HOOK
  const {
    products, // These are now the filtered products
    categories,
    selectedCategory,
    setSelectedCategory,
    loadingProducts, // Renamed for clarity
  } = useCategoriesWithProducts(branch); // Pass the branch to the hook

  // Order Details States
  const [addedProducts, setAddedProducts] = useState([]); // Products added to the current order
  const [orderType, setOrderType] = useState(null); // 'dine-in', 'takeaway', 'delivery'
  const [TableName, setTableName] = useState(""); // Name of the selected table for dine-in
  const [deliveryProvider, setDeliveryProvider] = useState(""); // Selected delivery provider for delivery orders
  const [invoiceSummary, setInvoiceSummary] = useState({ // Financial summary of the invoice
    vat: 0,
    discount: 0,
    paid: 0,
  });
  const [print, setPrint] = useState(null); // Data to be passed to receipt components for printing
  const [isProcessing, setIsProcessing] = useState(false); // State to prevent multiple submissions

  // State for managing modals
  const [isOrderTypeModalOpen, setIsOrderTypeModalOpen] = useState(true);
  const [isTableSelectionModalOpen, setIsTableSelectionModalOpen] = useState(false);
  const [isDeliveryProviderModalOpen, setIsDeliveryProviderModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false); // State for customer receipt modal
  const [isKitchenModalOpen, setIsKitchenModalOpen] = useState(false); // State for kitchen receipt modal
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");
  // State to hold the ID of the current invoice (for updates)
  const [currentInvoiceId, setCurrentInvoiceId] = useState(null);

  // Refs for printing components
  const receiptRef = useRef();
  const kitchenReceiptRef = useRef();

  // Company data hook (for receipt header)
  const { companies } = useCompanyHook();

  /**
   * Handles customer search by mobile number.
   * Displays validation errors if mobile number is invalid.
   */
  const handleCustomerSearch = () => {
    if (!mobile) {
      Swal.fire("Error", "Please enter a mobile number.", "error");
      return;
    }
    if (!/^\d{11}$/.test(mobile)) {
      Swal.fire("Invalid Number", "Mobile number must be exactly 11 digits.", "warning");
      return;
    }
    searchCustomer(mobile);
  };

  /**
   * Handles the initial selection of order type from the modal.
   * Opens subsequent modals based on the selected type.
   * @param {string} type - The selected order type ('dine-in', 'takeaway', 'delivery').
   */
  const handleOrderTypeSelect = (type) => {
    setOrderType(type);
    setIsOrderTypeModalOpen(false); // Close order type modal

    if (type === "dine-in") {
      setIsTableSelectionModalOpen(true); // Open table selection for dine-in
    } else if (type === "delivery") {
      setIsDeliveryProviderModalOpen(true); // Open delivery provider selection for delivery
    } else {
      // For 'takeaway', ensure no table/delivery provider is selected
      setTableName("");
      setSelectedTable("");
      setDeliveryProvider("");
    }
  };
  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
        Swal.fire({
      icon: 'success',
      title: 'Payment Method Selected!',
      text: `You have selected ${method} as the payment method.`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  };
  /**
   * Handles changing the order type from the dropdown in the main UI.
   * Resets related states and opens relevant modals.
   * @param {string} type - The new order type.
   */
  const handleOrderTypeChange = (type) => {
    setOrderType(type);
    // Reset table/delivery info when changing type
    setSelectedTable("");
    setTableName("");
    setDeliveryProvider("");

    // Open the relevant modal based on the new type
    if (type === "dine-in") {
      setIsTableSelectionModalOpen(true);
    } else if (type === 'delivery') {
      setIsDeliveryProviderModalOpen(true);
    } else {
      // For "takeaway", close any other modals that might be open
      setIsTableSelectionModalOpen(false);
      setIsDeliveryProviderModalOpen(false);
    }
  };

  /**
   * Handles the selection of a delivery provider from the modal.
   * @param {string} provider - The selected delivery provider.
   */
  const handleDeliveryProviderSelect = (provider) => {
    setDeliveryProvider(provider);
    setIsDeliveryProviderModalOpen(false); // Close delivery provider modal
  };

  /**
   * Rounds a given amount to the nearest whole number.
   * @param {number} amount - The amount to round.
   * @returns {number} The rounded amount.
   */
  const roundAmount = (amount) => Math.round(amount);

  /**
   * Adds a product to the current order.
   * If the product already exists, increments its quantity.
   * @param {object} product - The product object to add.
   */
  const addProduct = (product) => {
    const existingProduct = addedProducts.find((p) => p._id === product._id);
    if (existingProduct) {
      setAddedProducts(addedProducts.map((p) => (p._id === product._id ? { ...p, quantity: p.quantity + 1 } : p)));
    } else {
      setAddedProducts([...addedProducts, { ...product, quantity: 1 }]);
    }
  };

  /**
   * Increments the quantity of a product in the order.
   * @param {string} id - The ID of the product to increment.
   */
  const incrementQuantity = (id) => {
    setAddedProducts(addedProducts.map((p) => (p._id === id ? { ...p, quantity: p.quantity + 1 } : p)));
  };

  /**
   * Decrements the quantity of a product in the order.
   * Removes the product if quantity becomes 0.
   * @param {string} id - The ID of the product to decrement.
   */
  const decrementQuantity = (id) => {
    setAddedProducts(addedProducts.map((p) => (p._id === id && p.quantity > 1 ? { ...p, quantity: p.quantity - 1 } : p)));
  };

  /**
   * Removes a product entirely from the order.
   * @param {string} id - The ID of the product to remove.
   */
  const removeProduct = (id) => {
    setAddedProducts(addedProducts.filter((p) => p._id !== id));
  };

  /**
   * Handles the selection of a table from the table selection modal.
   * Updates the selected table ID and its name.
   * @param {string} tableId - The ID of the selected table.
   */
  const handleTableSelect = (tableId) => {
    setSelectedTable(tableId);
    const selectedTableObj = tables.find((table) => table._id === tableId);
    setTableName(selectedTableObj ? selectedTableObj.tableName : "");
  };

  /**
   * Confirms the table selection and closes the modal.
   * Displays an error if no table is selected.
   */
  const handleTableSelectionConfirm = () => {
    if (selectedTable) {
      setIsTableSelectionModalOpen(false);
    } else {
      Swal.fire("Error", "Please select a table to continue.", "error");
    }
  };

  /**
   * Prepares and displays the Kitchen Order Ticket (KOT) modal.
   * Shows a warning if no products are added.
   */
  const handleKitchenClick = () => {
    if (addedProducts.length === 0) {
      toast.warn("Please add products before sending to kitchen.");
      return;
    }
    // Prepare data for the kitchen receipt
    const kitchenInvoiceDetails = {
      orderType,
      tableName: TableName,
      deliveryProvider: deliveryProvider,
      products: addedProducts.map((p) => ({
        productName: p.productName,
        qty: p.quantity,
      })),
      loginUserName, // Include login user for "Prepared by"
      invoiceSerial: print?.invoiceSerial || "N/A", // Use the invoice serial if available from a prior save/print
    };
    setPrint(kitchenInvoiceDetails); // Set 'print' state with kitchen-specific data
    setIsKitchenModalOpen(true); // Open the kitchen modal
    toast.info("KOT Ready for Kitchen!");
  };

  /**
   * Resets all states related to the current order, preparing for a new one.
   * Re-opens the order type selection modal.
   */
  const resetOrder = () => {
    setAddedProducts([]);
    setInvoiceSummary({ vat: 0, discount: 0, paid: 0 });
    setMobile("");
    setSelectedTable("");
    setTableName("");
    setOrderType(null);
    setDeliveryProvider("");
    setCurrentInvoiceId(null); // Clear the current invoice ID
    setIsOrderTypeModalOpen(true); // Re-open order type modal for next order
    toast.error("Order Reset!");
  };

  /**
   * Validates inputs before attempting to save or print an invoice.
   * @returns {boolean} True if all inputs are valid, false otherwise.
   */
  const validateInputs = () => {
    if (addedProducts.length === 0) {
      Swal.fire("Validation Error", "Please add at least one product.", "error");
      return false;
    }
    if (orderType === "dine-in" && !TableName) {
      Swal.fire("Validation Error", "Please select a table for the dine-in order.", "error");
      return false;
    }
    if (orderType === "delivery" && !deliveryProvider) {
      Swal.fire("Validation Error", "Please select a delivery provider.", "error");
      return false;
    }
    if (invoiceSummary.discount < 0 || invoiceSummary.paid < 0) {
      Swal.fire("Validation Error", "Discount and paid amounts cannot be negative.", "error");
      return false;
    }
    return true;
  };

  /**
   * Calculates the subtotal, VAT, discount, and payable amount for the current order.
   * @returns {object} An object containing subtotal, vat, discount, and payable.
   */
  const calculateTotal = () => {
    const subtotal = addedProducts.reduce((total, p) => total + p.price * p.quantity, 0);
    // Calculate total VAT based on product-level VAT percentages
    const vat = addedProducts.reduce((total, p) => total + (p.vat * p.price * p.quantity) / 100, 0);
    const discount = parseFloat(invoiceSummary.discount || 0);
    const payable = subtotal + vat - discount;
    return {
      subtotal: roundAmount(subtotal),
      vat: roundAmount(vat),
      discount: roundAmount(discount),
      payable: roundAmount(payable),
    };
  };

  /**
   * Handles saving and/or printing the invoice.
   * Makes a POST request for a new invoice or a PUT request for an existing one.
   * @param {boolean} isPrintAction - True if the action also involves printing the customer receipt.
   */
  const printInvoice = async (isPrintAction) => {
    if (!validateInputs()) return;
    setIsProcessing(true); // Disable buttons during processing

    const { vat, discount, payable } = calculateTotal(); // Destructure payable here
    const invoiceDetails = {
      orderType,
      products: addedProducts.map((p) => ({
        productName: p.productName,
        qty: p.quantity,
        rate: p.price,
        subtotal: roundAmount(p.price * p.quantity),
        vat: p.vat, // Include product-level VAT for calculation accuracy
      })),
      discount: roundAmount(discount),
      vat: roundAmount(vat),
      loginUserEmail,
      loginUserName,
      customerName: customer?.name || "Guest", // Use customer name from state
      customerMobile: customer?.mobile || "n/a", // Use customer mobile from state
      counter: "Counter 1", // Hardcoded counter, consider making dynamic if needed
      branch: branch,
      totalAmount: payable, // <--- ENSURE THIS IS THE CALCULATED PAYABLE
      paymentMethod: selectedPaymentMethod, // Include the selected payment method
    };

    // Add order type specific details
    if (orderType === "dine-in") {
      invoiceDetails.tableName = TableName;
    }
    if (orderType === "delivery") {
      invoiceDetails.deliveryProvider = deliveryProvider;
    }

    try {
      let response;
      if (currentInvoiceId) {
        // If an invoice ID exists, update the existing invoice
        response = await axiosSecure.put(`/invoice/update/${currentInvoiceId}`, invoiceDetails);
        toast.success("Invoice updated successfully!");
      } else {
        // Otherwise, create a new invoice
        response = await axiosSecure.post("/invoice/post", invoiceDetails);
        toast.success("Invoice saved successfully!");
      }

      const data = response.data;

      // Create a comprehensive print data object
      // This ensures `print` state always contains the correct calculated total and other details needed for the receipt,
      // regardless of what the backend's `response.data` might contain for `totalAmount` if it differs.
      const dataForPrint = {
        ...data, // Start with data from backend response
        products: invoiceDetails.products, // Use the client-side calculated products for precise subtotals
        vat: invoiceDetails.vat, // Use client-side calculated VAT
        discount: invoiceDetails.discount, // Use client-side calculated discount
        totalAmount: invoiceDetails.totalAmount, // IMPORTANT: Use the client-side calculated payable
        orderType: invoiceDetails.orderType,
        tableName: invoiceDetails.tableName,
        deliveryProvider: invoiceDetails.deliveryProvider,
        customerName: invoiceDetails.customerName,
        customerMobile: invoiceDetails.customerMobile,
        loginUserName: invoiceDetails.loginUserName,
        paymentMethod: invoiceDetails.paymentMethod, // Include payment method in print data
        // dateTime will come from backend, or can be set here if backend doesn't return it
        dateTime: data.dateTime || new Date().toISOString(), // Use backend dateTime or current time
        invoiceSerial: data.invoiceSerial || data._id, // Ensure invoiceSerial is present
      };

      setPrint(dataForPrint); // Set the explicitly constructed invoice data for receipt generation

      // If the backend returns an invoiceId, store it for subsequent updates
      if (data.invoiceId) {
        setCurrentInvoiceId(data.invoiceId);
      } else if (data._id) { // Fallback if backend uses _id for the invoice
        setCurrentInvoiceId(data._id);
      }


      if (isPrintAction && companies[0] && data) {
        setIsReceiptModalOpen(true); // Open the customer receipt modal
      } else {
        // If not printing, or if print action is complete, reset the order
        // This ensures the UI is cleared for a new transaction after a save or print
        // resetOrder(); // Removed immediate reset to allow user to view saved invoice before new order
      }
    } catch (error) {
      console.error("Error saving/updating invoice:", error);
      const errorMessage = error.response?.data?.error || "Failed to process the invoice.";
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setIsProcessing(false); // Re-enable buttons
    }
  };

  // Calculate final amounts for display
  const { subtotal, vat, payable } = calculateTotal();
  const paid = roundAmount(parseFloat(invoiceSummary.paid || 0));
  const change = paid - payable;

  return (
    <div className="font-sans antialiased bg-gray-100 min-h-screen">
      {/* Order Type Selection Modal */}
      <OrderTypeSelectionModal
        isOpen={isOrderTypeModalOpen}
        onSelect={handleOrderTypeSelect}
        onClose={() => !orderType && setIsOrderTypeModalOpen(true)} // Prevent closing if no type selected initially
      />

      {/* Table Selection Modal (for Dine-in) */}
      <TableSelectionModal
        isOpen={isTableSelectionModalOpen}
        tables={tables}
        selectedTable={selectedTable}
        handleTableSelect={handleTableSelect}
        onConfirm={handleTableSelectionConfirm}
        onClose={() => setIsTableSelectionModalOpen(false)}
      />

      {/* Delivery Provider Selection Modal (for Delivery) */}
      <DeliveryProviderSelectionModal
        isOpen={isDeliveryProviderModalOpen}
        onSelect={handleDeliveryProviderSelect}
        onClose={() => setIsDeliveryProviderModalOpen(false)}
      />

      {/* Main Order Screen will only render when all preliminary modals are closed */}
      {!isOrderTypeModalOpen && !isTableSelectionModalOpen && !isDeliveryProviderModalOpen && (
        <div className="flex flex-col lg:flex-row p-1 gap-1">
          {/* New Customer Modal */}
          <NewCustomerModal
            isOpen={isCustomerModalOpen}
            onClose={() => setCustomerModalOpen(false)}
            mobile={mobile}
          />

          {/* Left Section: Categories and Products (ProductSelection Component) */}
          <ProductSelection
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            addProduct={addProduct}
            loading={loadingProducts} // Pass the renamed loading state
          />

          {/* Right Section: Customer Info, Invoice Summary, Actions (OrderSummary Component) */}
          <OrderSummary
            customer={customer}
            mobile={mobile}
            setMobile={setMobile}
            handleCustomerSearch={handleCustomerSearch}
            isCustomerModalOpen={isCustomerModalOpen}
            setCustomerModalOpen={setCustomerModalOpen}
            orderType={orderType}
            handleOrderTypeChange={handleOrderTypeChange}
            TableName={TableName}
            deliveryProvider={deliveryProvider}
            addedProducts={addedProducts}
            incrementQuantity={incrementQuantity}
            decrementQuantity={decrementQuantity}
            removeProduct={removeProduct}
            invoiceSummary={invoiceSummary}
            setInvoiceSummary={setInvoiceSummary}
            subtotal={subtotal}
            vat={vat}
            payable={payable}
            paid={paid}
            change={change}
            printInvoice={printInvoice}
            handleKitchenClick={handleKitchenClick}
            resetOrder={resetOrder}
            isProcessing={isProcessing}
            selectedPaymentMethod={selectedPaymentMethod}
            handlePaymentMethodSelect={handlePaymentMethodSelect}
          />


        </div>
      )}

      {/* Customer Receipt Modal */}
      {isReceiptModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setIsReceiptModalOpen(false);
            resetOrder(); // Reset order after closing customer receipt modal
          }}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-2xl relative w-full max-w-sm transform transition-all duration-300 scale-95 hover:scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 bg-red-600 text-white rounded-full px-3 py-1 text-sm hover:bg-red-700 transition-colors duration-200"
              onClick={() => {
                setIsReceiptModalOpen(false);
                resetOrder(); // Reset order after closing customer receipt modal
              }}
            >
              Close
            </button>
            <ReceiptTemplate
              ref={receiptRef}
              onPrintComplete={() => {
                setIsReceiptModalOpen(false);
                resetOrder(); // Reset order after print completes
              }}
              profileData={companies[0]}
              invoiceData={print}
            />
          </div>
        </div>
      )}

      {/* NEW: Kitchen Receipt Modal */}
      {isKitchenModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsKitchenModalOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-2xl relative w-full max-w-sm transform transition-all duration-300 scale-95 hover:scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 bg-red-600 text-white rounded-full px-3 py-1 text-sm hover:bg-red-700 transition-colors duration-200"
              onClick={() => setIsKitchenModalOpen(false)}
            >
              Close
            </button>
            <KitchenReceiptTemplate
              ref={kitchenReceiptRef} // Use the new ref for kitchen receipt
              profileData={companies[0]}
              invoiceData={print} // 'print' state now holds kitchen-specific data when this modal is open
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectOrder;