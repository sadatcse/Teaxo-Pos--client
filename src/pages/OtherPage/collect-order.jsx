import { useState, useContext, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import ProductSelection from "../../components/Product/ProductSelection.jsx";
import OrderSummary from "../../components/Product/OrderSummary.jsx";
import useCategoriesWithProducts from './../../Hook/useCategoriesWithProducts';

const CollectOrder = () => {
    const { state: routeState } = useLocation();
    const { user, branch } = useContext(AuthContext);
    const loginUserEmail = user?.email || "info@leavesoft.com";
    const loginUserName = user?.name || "leavesoft";
    const [mobile, setMobile] = useState("");
    const { customer, tables, searchCustomer, selectedTable, isCustomerModalOpen, setSelectedTable, setCustomerModalOpen } = useCustomerTableSearch();
    const axiosSecure = UseAxiosSecure();
    const { products, categories, selectedCategory, setSelectedCategory, loadingProducts } = useCategoriesWithProducts(branch);
    const [addedProducts, setAddedProducts] = useState([]);
    const [orderType, setOrderType] = useState(null);
    const [TableName, setTableName] = useState("");
    const [deliveryProvider, setDeliveryProvider] = useState("");
    const [invoiceSummary, setInvoiceSummary] = useState({ discount: 0, paid: 0 });
    
    // --- NEW STATE: Discount Type (Percent or Fixed) ---
    const [discountType, setDiscountType] = useState("Percent"); 

    const [print, setPrint] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentInvoiceId, setCurrentInvoiceId] = useState(null);
    const [isOrderTypeModalOpen, setIsOrderTypeModalOpen] = useState(true);
    const [isTableSelectionModalOpen, setIsTableSelectionModalOpen] = useState(false);
    const [isDeliveryProviderModalOpen, setIsDeliveryProviderModalOpen] = useState(false);
    const [isKitchenModalOpen, setIsKitchenModalOpen] = useState(false);
    const [customDateTime, setCustomDateTime] = useState("");
    const receiptRef = useRef();
    const kitchenReceiptRef = useRef();
    const { companies } = useCompanyHook();

    // --- PAYMENT STATE & HANDLERS ---
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");
    const [selectedSubMethod, setSelectedSubMethod] = useState('');
    const [selectedCardIcon, setSelectedCardIcon] = useState(null);

    const handleMainPaymentButtonClick = (method) => {
        if (selectedPaymentMethod === method) {
            setSelectedPaymentMethod('');
            setSelectedSubMethod('');
            setSelectedCardIcon(null);
        } else {
            setSelectedPaymentMethod(method);
            setSelectedSubMethod('');
            if (method !== 'Card') {
                setSelectedCardIcon(null);
            }
        }
    };

    const handleSubPaymentButtonClick = (subMethod, iconComponent = null) => {
        setSelectedSubMethod(subMethod);
        setSelectedPaymentMethod(subMethod);
        if (subMethod.includes("Card")) {
            setSelectedCardIcon(iconComponent);
        } else {
            setSelectedCardIcon(null);
        }
    };

    useEffect(() => {
        const tableFromLobby = routeState?.selectedTable;
        if (tableFromLobby) {
            setOrderType('dine-in');
            setSelectedTable(tableFromLobby._id);
            setTableName(tableFromLobby.tableName);
            setIsOrderTypeModalOpen(false);
            setIsTableSelectionModalOpen(false);
        }
    }, [routeState, setSelectedTable]);

    const handleCustomerSearch = () => {
        if (!mobile) return Swal.fire("Error", "Please enter a mobile number.", "error");
        if (!/^\d{11}$/.test(mobile)) return Swal.fire("Invalid Number", "Mobile number must be exactly 11 digits.", "warning");
        searchCustomer(mobile);
    };

    const handleOrderTypeSelect = (type) => {
        setOrderType(type);
        setIsOrderTypeModalOpen(false);
        if (type === "dine-in") setIsTableSelectionModalOpen(true);
        else if (type === "delivery") setIsDeliveryProviderModalOpen(true);
        else {
            setTableName("");
            setSelectedTable("");
            setDeliveryProvider("");
        }
    };
    
    const handleOrderTypeChange = (type) => {
        setOrderType(type);
        setSelectedTable("");
        setTableName("");
        setDeliveryProvider("");
        if (type === "dine-in") setIsTableSelectionModalOpen(true);
        else if (type === 'delivery') setIsDeliveryProviderModalOpen(true);
        else {
            setIsTableSelectionModalOpen(false);
            setIsDeliveryProviderModalOpen(false);
        }
    };

    const handleDeliveryProviderSelect = (provider) => {
        setDeliveryProvider(provider);
        setIsDeliveryProviderModalOpen(false);
        if (provider === "Foodpanda") {
            setSelectedPaymentMethod("Bank");
        } else {
            setSelectedPaymentMethod("Cash");
        }
    };

    const roundAmount = (amount) => Math.round(amount);

    const addProduct = (product) => {
        const existingProduct = addedProducts.find((p) => p._id === product._id && !p.isComplimentary);
        if (existingProduct) {
            setAddedProducts(addedProducts.map((p) => (p._id === product._id ? { ...p, quantity: p.quantity + 1 } : p)));
        } else {
            setAddedProducts([...addedProducts, { ...product, quantity: 1, cookStatus: 'PENDING', isComplimentary: false }]);
        }
    };

    const incrementQuantity = (id) => setAddedProducts(addedProducts.map((p) => (p._id === id ? { ...p, quantity: p.quantity + 1 } : p)));
    const decrementQuantity = (id) => setAddedProducts(addedProducts.map((p) => (p._id === id && p.quantity > 1 ? { ...p, quantity: p.quantity - 1 } : p)));
    const removeProduct = (id) => setAddedProducts(addedProducts.filter((p) => p._id !== id));

    const toggleComplimentaryStatus = (id) => {
        setAddedProducts(
            addedProducts.map((p) =>
                p._id === id ? { ...p, isComplimentary: !p.isComplimentary, quantity: p.isComplimentary ? p.quantity : 1 } : p
            )
        );
        toast.info("Product complimentary status updated.");
    };

    const handleTableSelect = (tableId) => {
        setSelectedTable(tableId);
        const selectedTableObj = tables.find((table) => table._id === tableId);
        setTableName(selectedTableObj ? selectedTableObj.tableName : "");
    };

    const handleTableSelectionConfirm = () => {
        if (selectedTable) setIsTableSelectionModalOpen(false);
        else Swal.fire("Error", "Please select a table to continue.", "error");
    };

    const handleKitchenClick = async () => {
        if (addedProducts.length === 0) return toast.warn("Please add products before sending to kitchen.");
        const isSaveSuccessful = await printInvoice(false);
        if (isSaveSuccessful) {
            setIsKitchenModalOpen(true);
            toast.info("Order Saved! KOT is ready for the kitchen.");
        } else {
            toast.error("Could not save order. Please check for errors.");
        }
    };

    const resetOrder = () => {
        setAddedProducts([]);
        setInvoiceSummary({ discount: 0, paid: 0 });
        setDiscountType("Percent"); // Reset discount type
        setMobile("");
        setSelectedTable("");
        setTableName("");
        setOrderType(null);
        setDeliveryProvider("");
        setCurrentInvoiceId(null);
        setCustomDateTime("");
        setIsOrderTypeModalOpen(true);
        toast.error("Order Reset!");
    };

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

    // --- UPDATED CALCULATE TOTAL ---
    const calculateTotal = () => {
        const nonComplimentaryProducts = addedProducts.filter(p => !p.isComplimentary);
        const subtotal = nonComplimentaryProducts.reduce((total, p) => total + p.price * p.quantity, 0);
        const vat = nonComplimentaryProducts.reduce((total, p) => total + ((p.vat || 0) * p.quantity), 0);
        const sd = nonComplimentaryProducts.reduce((total, p) => total + ((p.sd || 0) * p.quantity), 0);
        
        // Calculate Discount Amount based on Type
        let discountAmount = 0;
        const discountInput = parseFloat(invoiceSummary.discount || 0);
        
        if (discountType === 'Percent') {
            // Calculate % on (Subtotal + VAT + SD)
            const totalBeforeDiscount = subtotal + vat + sd;
            discountAmount = (totalBeforeDiscount * discountInput) / 100;
        } else {
            // Fixed Amount
            discountAmount = discountInput;
        }

        const payable = subtotal + vat + sd - discountAmount;
        
        // Return derived values. Note: 'discount' here is the final money amount.
        return { subtotal, vat, sd, discount: discountAmount, payable: roundAmount(payable) };
    };

    const printInvoice = async (isPrintAction) => {
        if (!validateInputs()) return false;
        setIsProcessing(true);
        
        // Destructure values including the calculated discount money amount
        const { subtotal, vat, sd, discount, payable } = calculateTotal();
        
        const invoiceDetails = {
            orderType,
            products: addedProducts.map((p) => ({ productId: p._id, productName: p.productName, qty: p.quantity, rate: p.price, subtotal: roundAmount(p.price * p.quantity), vat: p.vat || 0, sd: p.sd || 0, cookStatus: p.cookStatus || 'PENDING', isComplimentary: p.isComplimentary, })),
            subtotal: roundAmount(subtotal),
            discount: roundAmount(discount), // Send the actual Money Amount to backend
            vat: roundAmount(vat),
            sd: roundAmount(sd),
            loginUserEmail,
            loginUserName,
            customerName: customer?.name || "Guest",
            customerMobile: customer?.mobile || "n/a",
            counter: "Counter 1",
            branch: branch,
            totalAmount: payable,
            paymentMethod: selectedPaymentMethod,
        };
        
        if (user?.role === 'admin' && customDateTime) {
            invoiceDetails.dateTime = customDateTime;
            const customDate = new Date(customDateTime);
            const now = new Date();
            if (customDate < now) {
                invoiceDetails.orderStatus = "completed";
                invoiceDetails.products.forEach(p => p.cookStatus = 'SERVED');
            }
        }
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
            const dataForPrint = { ...invoiceDetails, ...data, dateTime: data.dateTime || new Date().toISOString(), invoiceSerial: data.invoiceSerial || data._id };
            setPrint(dataForPrint);
            setCurrentInvoiceId(data.invoiceId || data._id);
            
            if (isPrintAction && companies[0] && data) {
                setTimeout(() => {
                    if (receiptRef.current) {
                        receiptRef.current.printReceipt();
                    } else {
                        console.error("Receipt component reference not found.");
                    }
                }, 100);
            }
            return true;
        } catch (error) {
            console.error("Error saving/updating invoice:", error);
            const errorMessage = error.response?.data?.error || "Failed to process the invoice.";
            Swal.fire("Error", errorMessage, "error");
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    const { subtotal, vat, sd, payable } = calculateTotal();
    const paid = roundAmount(parseFloat(invoiceSummary.paid || 0));
    const change = paid > 0 ? paid - payable : 0;

    return (
        <div className="font-sans antialiased bg-gray-100 min-h-screen">
            <OrderTypeSelectionModal isOpen={isOrderTypeModalOpen} onSelect={handleOrderTypeSelect} onClose={() => !orderType && setIsOrderTypeModalOpen(true)} />
            <TableSelectionModal isOpen={isTableSelectionModalOpen} tables={tables} selectedTable={selectedTable} handleTableSelect={handleTableSelect} onConfirm={handleTableSelectionConfirm} onClose={() => setIsTableSelectionModalOpen(false)} />
            <DeliveryProviderSelectionModal isOpen={isDeliveryProviderModalOpen} onSelect={handleDeliveryProviderSelect} onClose={() => setIsDeliveryProviderModalOpen(false)} />

            {!isOrderTypeModalOpen && !isTableSelectionModalOpen && !isDeliveryProviderModalOpen && (
                <div className="flex flex-col lg:flex-row p-1 gap-1">
                    <NewCustomerModal isOpen={isCustomerModalOpen} onClose={() => setCustomerModalOpen(false)} mobile={mobile} />
                    
                    <ProductSelection
                        products={products}
                        categories={categories}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        addProduct={addProduct}
                        loading={loadingProducts}
                        isProcessing={isProcessing}
                        selectedPaymentMethod={selectedPaymentMethod}
                        selectedSubMethod={selectedSubMethod}
                        selectedCardIcon={selectedCardIcon}
                        handleMainPaymentButtonClick={handleMainPaymentButtonClick}
                        handleSubPaymentButtonClick={handleSubPaymentButtonClick}
                    />

                    <OrderSummary
                        user={user}
                        customDateTime={customDateTime}
                        setCustomDateTime={setCustomDateTime}
                        customer={customer}
                        mobile={mobile}
                        setMobile={setMobile}
                        handleCustomerSearch={handleCustomerSearch}
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
                        
                        // Pass discount props
                        discountType={discountType}
                        setDiscountType={setDiscountType}
                        
                        subtotal={subtotal}
                        vat={vat}
                        sd={sd}
                        payable={payable}
                        paid={paid}
                        change={change}
                        printInvoice={printInvoice}
                        handleKitchenClick={handleKitchenClick}
                        resetOrder={resetOrder}
                        isProcessing={isProcessing}
                        toggleComplimentaryStatus={toggleComplimentaryStatus}
                        selectedPaymentMethod={selectedPaymentMethod}
                        selectedSubMethod={selectedSubMethod}
                    />
                </div>
            )}

            <div style={{ display: 'none' }}>
                {print && companies[0] && (
                    <ReceiptTemplate
                        ref={receiptRef}
                        onPrintComplete={resetOrder}
                        profileData={companies[0]}
                        invoiceData={print}
                    />
                )}
            </div>

{isKitchenModalOpen && (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" 
        onClick={() => setIsKitchenModalOpen(false)}
    >
        <div 
            className="bg-white p-6 rounded-lg shadow-2xl relative w-full max-w-sm flex flex-col items-center" 
            onClick={(e) => e.stopPropagation()}
        >
            {/* 1. Header with Close (X) Button */}
            <button 
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors p-1" 
                onClick={() => setIsKitchenModalOpen(false)}
                title="Close without printing"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <h3 className="text-lg font-bold text-gray-800 mb-4">Kitchen Order Ticket</h3>

            {/* 2. The Receipt Preview Area */}
            {/* We add a border and scroll to make it look like a preview */}
            <div className="border-2 border-dashed border-gray-300 rounded p-2 mb-5 bg-gray-50 max-h-[60vh] overflow-y-auto">
                <KitchenReceiptTemplate
                    ref={kitchenReceiptRef}
                    profileData={companies[0]}
                    invoiceData={print}
                    // This ensures the modal closes automatically after a successful print
                    onPrintComplete={() => setIsKitchenModalOpen(false)}
                />
            </div>

            {/* 3. The Manual "Print & Close" Button (Fallback) */}
            <button 
                onClick={() => {
                    // Manually trigger the print function exposed by the child component
                    if (kitchenReceiptRef.current) {
                        kitchenReceiptRef.current.printReceipt();
                    }
                }}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print & Close
            </button>
            
        
        </div>
    </div>
)}
        </div>
    );
};

export default CollectOrder;