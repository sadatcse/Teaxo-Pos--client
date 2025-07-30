import { useState, useContext, useRef } from "react";
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

  // Product and Category States using the custom hook
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    loadingProducts,
  } = useCategoriesWithProducts(branch);

  // Order Details States
  const [addedProducts, setAddedProducts] = useState([]); // Products added to the current order
  const [orderType, setOrderType] = useState(null); // 'dine-in', 'takeaway', 'delivery'
  const [TableName, setTableName] = useState(""); // Name of the selected table for dine-in
  const [deliveryProvider, setDeliveryProvider] = useState(""); // Selected delivery provider
  
  // CORRECTED: State for user inputs like discount and paid amount. VAT is calculated, not stored here.
  const [invoiceSummary, setInvoiceSummary] = useState({ discount: 0, paid: 0 });
  
  const [print, setPrint] = useState(null); // Data for receipt components
  const [isProcessing, setIsProcessing] = useState(false); // Prevent multiple submissions
  const [currentInvoiceId, setCurrentInvoiceId] = useState(null); // Hold current invoice ID for updates

  // State for managing modals
  const [isOrderTypeModalOpen, setIsOrderTypeModalOpen] = useState(true);
  const [isTableSelectionModalOpen, setIsTableSelectionModalOpen] = useState(false);
  const [isDeliveryProviderModalOpen, setIsDeliveryProviderModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isKitchenModalOpen, setIsKitchenModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");

  // Refs for printing components
  const receiptRef = useRef();
  const kitchenReceiptRef = useRef();

  // Company data hook
  const { companies } = useCompanyHook();

  /**
   * Handles customer search by mobile number.
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
   * Handles the initial selection of order type.
   * @param {string} type - The selected order type.
   */
  const handleOrderTypeSelect = (type) => {
    setOrderType(type);
    setIsOrderTypeModalOpen(false);

    if (type === "dine-in") {
      setIsTableSelectionModalOpen(true);
    } else if (type === "delivery") {
      setIsDeliveryProviderModalOpen(true);
    } else {
      setTableName("");
      setSelectedTable("");
      setDeliveryProvider("");
    }
  };

  /**
   * Handles payment method selection.
   * @param {string} method - The selected payment method.
   */
  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
    toast.success(`Payment method set to ${method}.`, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
  };

  /**
   * Handles changing the order type from the main UI.
   * @param {string} type - The new order type.
   */
  const handleOrderTypeChange = (type) => {
    setOrderType(type);
    setSelectedTable("");
    setTableName("");
    setDeliveryProvider("");

    if (type === "dine-in") {
      setIsTableSelectionModalOpen(true);
    } else if (type === 'delivery') {
      setIsDeliveryProviderModalOpen(true);
    } else {
      setIsTableSelectionModalOpen(false);
      setIsDeliveryProviderModalOpen(false);
    }
  };

  /**
   * Handles the selection of a delivery provider.
   * @param {string} provider - The selected delivery provider.
   */
  const handleDeliveryProviderSelect = (provider) => {
    setDeliveryProvider(provider);
    setIsDeliveryProviderModalOpen(false);
  };

  /**
   * Rounds a number to the nearest whole number.
   * @param {number} amount - The amount to round.
   * @returns {number} The rounded amount.
   */
  const roundAmount = (amount) => Math.round(amount);

  /**
   * Adds a product to the order with a default 'PENDING' cookStatus.
   * @param {object} product - The product to add.
   */
  const addProduct = (product) => {
    const existingProduct = addedProducts.find((p) => p._id === product._id);
    if (existingProduct) {
      setAddedProducts(addedProducts.map((p) => (p._id === product._id ? { ...p, quantity: p.quantity + 1 } : p)));
    } else {
      setAddedProducts([...addedProducts, { ...product, quantity: 1, cookStatus: 'PENDING' }]);
    }
  };

  /**
   * Updates the cooking status of a product in the order.
   * @param {string} productId - The ID of the product to update.
   * @param {string} status - The new cooking status ('PENDING', 'COOKING', 'SERVED').
   */
  const updateCookStatus = (productId, status) => {
    setAddedProducts(currentProducts =>
      currentProducts.map(p =>
        p._id === productId ? { ...p, cookStatus: status } : p
      )
    );
    toast.info(`Product status updated to ${status}`);
  };

  const incrementQuantity = (id) => {
    setAddedProducts(addedProducts.map((p) => (p._id === id ? { ...p, quantity: p.quantity + 1 } : p)));
  };

  const decrementQuantity = (id) => {
    setAddedProducts(addedProducts.map((p) => (p._id === id && p.quantity > 1 ? { ...p, quantity: p.quantity - 1 } : p)));
  };

  const removeProduct = (id) => {
    setAddedProducts(addedProducts.filter((p) => p._id !== id));
  };

  /**
   * Handles table selection from the modal.
   * @param {string} tableId - The ID of the selected table.
   */
  const handleTableSelect = (tableId) => {
    setSelectedTable(tableId);
    const selectedTableObj = tables.find((table) => table._id === tableId);
    setTableName(selectedTableObj ? selectedTableObj.tableName : "");
  };

  /**
   * Confirms table selection and closes the modal.
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
   */
  const handleKitchenClick = () => {
    if (addedProducts.length === 0) {
      toast.warn("Please add products before sending to kitchen.");
      return;
    }
    const kitchenInvoiceDetails = {
      orderType,
      tableName: TableName,
      deliveryProvider: deliveryProvider,
      products: addedProducts.map((p) => ({
        productName: p.productName,
        qty: p.quantity,
        cookStatus: p.cookStatus || 'PENDING',
      })),
      loginUserName,
      invoiceSerial: print?.invoiceSerial || "N/A",
    };
    setPrint(kitchenInvoiceDetails);
    setIsKitchenModalOpen(true);
    toast.info("KOT Ready for Kitchen!");
  };

  /**
   * Resets the order state for a new transaction.
   */
  const resetOrder = () => {
    setAddedProducts([]);
    // CORRECTED: Reset only the user-input fields.
    setInvoiceSummary({ discount: 0, paid: 0 });
    setMobile("");
    setSelectedTable("");
    setTableName("");
    setOrderType(null);
    setDeliveryProvider("");
    setCurrentInvoiceId(null);
    setIsOrderTypeModalOpen(true);
    toast.error("Order Reset!");
  };

  /**
   * Validates inputs before saving or printing.
   * @returns {boolean} True if valid, false otherwise.
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
   * Calculates totals for the current order. This is the single source of truth for calculations.
   * @returns {object} An object with subtotal, vat, discount, and payable amounts.
   */
  const calculateTotal = () => {
    const subtotal = addedProducts.reduce((total, p) => total + p.price * p.quantity, 0);
    // VAT is calculated based on the VAT percentage of each product.
  const vat = addedProducts.reduce((total, p) => total + ((p.vat || 0) * p.quantity), 0);

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
   * Saves or updates the invoice and optionally prints a receipt.
   * @param {boolean} isPrintAction - True to trigger printing the customer receipt.
   */
  const printInvoice = async (isPrintAction) => {
    if (!validateInputs()) return;
    setIsProcessing(true);

    const { subtotal, vat, discount, payable } = calculateTotal();
    const invoiceDetails = {
      orderType,
      products: addedProducts.map((p) => ({
        productName: p.productName,
        qty: p.quantity,
        rate: p.price,
        subtotal: roundAmount(p.price * p.quantity),
        vat: p.vat || 0, // Sending the VAT percentage for each item
        cookStatus: p.cookStatus || 'PENDING',
      })),
      subtotal: roundAmount(subtotal),
      discount: roundAmount(discount),
      vat: roundAmount(vat), // Sending the total calculated VAT amount
      loginUserEmail,
      loginUserName,
      customerName: customer?.name || "Guest",
      customerMobile: customer?.mobile || "n/a",
      counter: "Counter 1",
      branch: branch,
      totalAmount: payable,
      paymentMethod: selectedPaymentMethod,
    };

    if (orderType === "dine-in") invoiceDetails.tableName = TableName;
    if (orderType === "delivery") invoiceDetails.deliveryProvider = deliveryProvider;

    try {
      let response;
      if (currentInvoiceId) {
        response = await axiosSecure.put(`/invoice/update/${currentInvoiceId}`, invoiceDetails);
        toast.success("Invoice updated successfully!");
      } else {
        response = await axiosSecure.post("/invoice/post", invoiceDetails);
        toast.success("Invoice saved successfully!");
      }

      const data = response.data;
      const dataForPrint = {
        ...data,
        ...invoiceDetails, // Pass all calculated details to the receipt
        dateTime: data.dateTime || new Date().toISOString(),
        invoiceSerial: data.invoiceSerial || data._id,
      };

      setPrint(dataForPrint);
      setCurrentInvoiceId(data.invoiceId || data._id);

      if (isPrintAction && companies[0] && data) {
        setIsReceiptModalOpen(true);
      }
    } catch (error) {
      console.error("Error saving/updating invoice:", error);
      const errorMessage = error.response?.data?.error || "Failed to process the invoice.";
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate totals for rendering
  const { subtotal, vat, payable } = calculateTotal();
  const paid = roundAmount(parseFloat(invoiceSummary.paid || 0));
  const change = paid > 0 ? paid - payable : 0;

  return (
    <div className="font-sans antialiased bg-gray-100 min-h-screen">
      <OrderTypeSelectionModal
        isOpen={isOrderTypeModalOpen}
        onSelect={handleOrderTypeSelect}
        onClose={() => !orderType && setIsOrderTypeModalOpen(true)}
      />
      <TableSelectionModal
        isOpen={isTableSelectionModalOpen}
        tables={tables}
        selectedTable={selectedTable}
        handleTableSelect={handleTableSelect}
        onConfirm={handleTableSelectionConfirm}
        onClose={() => setIsTableSelectionModalOpen(false)}
      />
      <DeliveryProviderSelectionModal
        isOpen={isDeliveryProviderModalOpen}
        onSelect={handleDeliveryProviderSelect}
        onClose={() => setIsDeliveryProviderModalOpen(false)}
      />

      {!isOrderTypeModalOpen && !isTableSelectionModalOpen && !isDeliveryProviderModalOpen && (
        <div className="flex flex-col lg:flex-row p-1 gap-1">
          <NewCustomerModal
            isOpen={isCustomerModalOpen}
            onClose={() => setCustomerModalOpen(false)}
            mobile={mobile}
          />

          <ProductSelection
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            addProduct={addProduct}
            loading={loadingProducts}
          />

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
            updateCookStatus={updateCookStatus}
          />
        </div>
      )}

      {isReceiptModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setIsReceiptModalOpen(false);
            resetOrder();
          }}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-2xl relative w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 bg-red-600 text-white rounded-full px-3 py-1 text-sm hover:bg-red-700"
              onClick={() => {
                setIsReceiptModalOpen(false);
                resetOrder();
              }}
            >
              Close
            </button>
            <ReceiptTemplate
              ref={receiptRef}
              onPrintComplete={() => {
                setIsReceiptModalOpen(false);
                resetOrder();
              }}
              profileData={companies[0]}
              invoiceData={print}
            />
          </div>
        </div>
      )}

      {isKitchenModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsKitchenModalOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-2xl relative w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 bg-red-600 text-white rounded-full px-3 py-1 text-sm hover:bg-red-700"
              onClick={() => setIsKitchenModalOpen(false)}
            >
              Close
            </button>
            <KitchenReceiptTemplate
              ref={kitchenReceiptRef}
              profileData={companies[0]}
              invoiceData={print}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectOrder;