import React, { useState, useContext, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import { toast } from "react-toastify";

// --- Custom Hooks & Context ---
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import useCompanyHook from "../../Hook/useCompanyHook";
import useCustomerTableSearch from "../../Hook/useCustomerTableSearch";
import useCategoriesWithProducts from "../../Hook/useCategoriesWithProducts";

// --- Components ---
import ProductSelection from "../../components/Product/ProductSelection.jsx";
import OrderSummary from "../../components/Product/EditSummary.jsx";
import ReceiptTemplate from "../../components/Receipt/ReceiptTemplate ";
import KitchenReceiptTemplate from "../../components/Receipt/KitchenReceiptTemplate";
import NewCustomerModal from "../../components/Modal/NewCustomerModal";
import TableSelectionModal from "../../components/Modal/TableSelectionModal";
import DeliveryProviderSelectionModal from "../../components/Modal/DeliveryProviderSelectionModal";

const EditOrderPage = () => {
    // --- Hooks for Routing and Data Fetching ---
    const { id: orderId } = useParams();
    const navigate = useNavigate();
    const axiosSecure = UseAxiosSecure();

    // --- Context for User and Branch Info ---
    const { user, branch } = useContext(AuthContext);
    const loginUserEmail = user?.email || "info@leavesoft.com";
    const loginUserName = user?.name || "leavesoft";

    // --- State Management ---
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [originalOrderItems, setOriginalOrderItems] = useState([]);
    const [newOrderItems, setNewOrderItems] = useState([]);

    // --- Custom Hooks for Data & UI ---
    const {
        customer, setCustomer, tables, searchCustomer, selectedTable,
        isCustomerModalOpen, setSelectedTable, setCustomerModalOpen,
    } = useCustomerTableSearch();

    const {
        products, categories, selectedCategory, setSelectedCategory, loadingProducts,
    } = useCategoriesWithProducts(branch);

    const { companies } = useCompanyHook();

    // --- Order Details State ---
    const [orderType, setOrderType] = useState(null);
    const [TableName, setTableName] = useState("");
    const [deliveryProvider, setDeliveryProvider] = useState("");
    const [mobile, setMobile] = useState("");
    const [invoiceSummary, setInvoiceSummary] = useState({ discount: 0, paid: 0 });
    const [print, setPrint] = useState(null);
    const [currentInvoiceId, setCurrentInvoiceId] = useState(orderId);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");

    // --- Modal State ---
    const [isTableSelectionModalOpen, setIsTableSelectionModalOpen] = useState(false);
    const [isDeliveryProviderModalOpen, setIsDeliveryProviderModalOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [isKitchenModalOpen, setIsKitchenModalOpen] = useState(false);

    // --- Refs for Printing ---
    const receiptRef = useRef();
    const kitchenReceiptRef = useRef();

    // --- Data Fetching Effect ---
    useEffect(() => {
        if (!orderId) {
            Swal.fire("Error", "No Order ID provided.", "error");
            navigate(-1);
            return;
        }

        const fetchOrderDetails = async () => {
            try {
                setIsLoading(true);
                const response = await axiosSecure.get(`/invoice/get-id/${orderId}`);
                const orderData = response.data;

                // --- UPDATED MAPPING: Now captures productId for each original item ---
                const initialOriginalItems = orderData.products.map(p => ({
                    ...p, // Spreads all properties from the fetched product
                    price: p.rate,
                    quantity: p.qty,
                    originalQuantity: p.qty,
                    isOriginal: true,
                    isComplimentary: p.isComplimentary || false,
                }));
                setOriginalOrderItems(initialOriginalItems);
                setNewOrderItems([]);

                setOrderType(orderData.orderType);
                setTableName(orderData.tableName || "");
                setDeliveryProvider(orderData.deliveryProvider || "");
                setInvoiceSummary({ discount: orderData.discount || 0, paid: 0 });
                setSelectedPaymentMethod(orderData.paymentMethod || "Cash");
                setCurrentInvoiceId(orderData._id);

                if (orderData.customerMobile && orderData.customerMobile !== "n/a") {
                    setMobile(orderData.customerMobile);
                    setCustomer({ name: orderData.customerName, mobile: orderData.customerMobile });
                }
            } catch (error) {
                console.error("Failed to fetch order details:", error);
                Swal.fire("Error", "Failed to load order details. Please try again.", "error");
                navigate(-1);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId, axiosSecure, navigate, setCustomer]);

    const allOrderItems = useMemo(() => [...originalOrderItems, ...newOrderItems], [originalOrderItems, newOrderItems]);

    // --- Core Logic Functions (UPDATED to use productId) ---

    const addProduct = (product) => {
        // --- UPDATED: Uses product._id (as productId) to find existing items ---
        const existingItem = allOrderItems.find(p => p.productId === product._id && !p.isComplimentary);

        if (existingItem) {
            if (existingItem.isOriginal) {
                setOriginalOrderItems(items =>
                    items.map(p =>
                        p.productId === product._id
                            ? { ...p, quantity: p.quantity + 1 }
                            : p
                    )
                );
            } else {
                setNewOrderItems(items =>
                    items.map(p =>
                        p.productId === product._id
                            ? { ...p, quantity: p.quantity + 1 }
                            : p
                    )
                );
            }
            toast.info(`Quantity for ${product.productName} incremented.`);
        } else {
            const itemToAdd = {
                ...product,
                productId: product._id, // --- ADDED: Ensure productId is stored ---
                quantity: 1,
                cookStatus: 'PENDING',
                isOriginal: false,
                isComplimentary: false,
            };
            setNewOrderItems(current => [...current, itemToAdd]);
            toast.success(`${product.productName} added to order!`);
        }
    };
    
    // --- UPDATED: All handler functions now accept productId ---
    const incrementQuantity = (productId) => {
        setOriginalOrderItems(items =>
            items.map(p => p.productId === productId ? { ...p, quantity: p.quantity + 1 } : p)
        );
        setNewOrderItems(items =>
            items.map(p => p.productId === productId ? { ...p, quantity: p.quantity + 1 } : p)
        );
    };

    const decrementQuantity = (productId) => {
        const originalItem = originalOrderItems.find(p => p.productId === productId);
        if (originalItem) {
            if (originalItem.quantity > originalItem.originalQuantity) {
                setOriginalOrderItems(items =>
                    items.map(p => p.productId === productId ? { ...p, quantity: p.quantity - 1 } : p)
                );
            } else {
                toast.warn("Cannot reduce quantity below the original amount.");
            }
            return;
        }

        setNewOrderItems(items =>
            items.map(p =>
                p.productId === productId ? { ...p, quantity: p.quantity - 1 } : p
            ).filter(p => p.quantity > 0)
        );
    };

    const removeProduct = (productId) => {
        const isNewItem = newOrderItems.some(p => p.productId === productId);
        if (isNewItem) {
            setNewOrderItems(items => items.filter(p => p.productId !== productId));
            toast.info("Item removed.");
        } else {
            toast.error("Original order items cannot be removed.");
        }
    };

    const updateCookStatus = (productId, status) => {
        const updater = items => items.map(p => p.productId === productId ? { ...p, cookStatus: status } : p);
        if (originalOrderItems.some(p => p.productId === productId)) {
            setOriginalOrderItems(updater);
        } else {
            setNewOrderItems(updater);
        }
        toast.info(`Product status updated to ${status}`);
    };

    const toggleComplimentaryStatus = (productId) => {
        const isOriginal = originalOrderItems.some(p => p.productId === productId);
        const updater = items =>
            items.map(p =>
                p.productId === productId
                    ? { ...p, isComplimentary: !p.isComplimentary, quantity: !p.isComplimentary ? 1 : p.quantity }
                    : p
            );

        if (isOriginal) {
            setOriginalOrderItems(updater);
        } else {
            setNewOrderItems(updater);
        }
        toast.info("Product complimentary status updated.");
    };

    const handleCustomerSearch = () => {
        if (!mobile) return Swal.fire("Error", "Please enter a mobile number.", "error");
        if (!/^\d{11}$/.test(mobile)) return Swal.fire("Invalid Number", "Mobile number must be exactly 11 digits.", "warning");
        searchCustomer(mobile);
    };

    const handlePaymentMethodSelect = (method) => setSelectedPaymentMethod(method);

    const handleOrderTypeChange = (type) => {
        setOrderType(type);
        setSelectedTable("");
        setTableName("");
        setDeliveryProvider("");
        if (type === "dine-in") setIsTableSelectionModalOpen(true);
        else if (type === 'delivery') setIsDeliveryProviderModalOpen(true);
    };

    const handleDeliveryProviderSelect = (provider) => {
        setDeliveryProvider(provider);
        setIsDeliveryProviderModalOpen(false);
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
        if (allOrderItems.length === 0) return toast.warn("The order is empty.");
        const isUpdateSuccessful = await saveOrUpdateInvoice(false);
        if (isUpdateSuccessful) {
            setIsKitchenModalOpen(true);
            toast.info("Order Updated! KOT is ready for the kitchen.");
        } else {
            toast.error("Could not update order. KOT not printed.");
        }
    };

    const resetOrder = () => {
        navigate(-1);
        toast.info("Exited Edit Mode.");
    };

    const validateInputs = () => {
        if (allOrderItems.length === 0) {
            Swal.fire("Validation Error", "An order cannot be empty.", "error");
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
        return true;
    };

    const roundAmount = (amount) => Math.round(amount);

    const calculateTotal = () => {
        const nonComplimentaryProducts = allOrderItems.filter(p => !p.isComplimentary);
        const subtotal = nonComplimentaryProducts.reduce((total, p) => total + p.price * p.quantity, 0);
        const vat = nonComplimentaryProducts.reduce((total, p) => total + ((p.vat || 0) * p.quantity), 0);
        const sd = nonComplimentaryProducts.reduce((total, p) => total + ((p.sd || 0) * p.quantity), 0);
        const discount = parseFloat(invoiceSummary.discount || 0);
        const payable = subtotal + vat + sd - discount;
        
        return {
            subtotal: roundAmount(subtotal),
            vat: roundAmount(vat),
            sd: roundAmount(sd),
            discount: roundAmount(discount),
            payable: roundAmount(payable),
        };
    };

    const getInvoicePayload = () => {
        const { subtotal, vat, sd, discount, payable } = calculateTotal();
        const invoiceDetails = {
            orderType,
            // --- UPDATED: Payload now includes productId for each product ---
            products: allOrderItems.map((p) => ({
                productId: p.productId, // Essential for the updated backend model
                productName: p.productName,
                qty: p.quantity,
                rate: p.price,
                subtotal: roundAmount(p.price * p.quantity),
                vat: p.vat || 0,
                sd: p.sd || 0,
                cookStatus: p.cookStatus || 'PENDING',
                isComplimentary: p.isComplimentary || false,
            })),
            subtotal,
            discount,
            vat,
            sd,
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
        return invoiceDetails;
    }

    const saveOrUpdateInvoice = async (isPrintAction = false) => {
        if (!validateInputs()) return false;
        setIsProcessing(true);

        const invoiceDetails = getInvoicePayload();

        try {
            const response = await axiosSecure.put(`/invoice/update/${currentInvoiceId}`, invoiceDetails);
            toast.success("Invoice updated successfully! ✅");

            const data = response.data;
            const dataForPrint = {
                ...data,
                ...invoiceDetails,
                dateTime: data.dateTime || new Date().toISOString(),
                invoiceSerial: data.invoiceSerial || currentInvoiceId,
            };

            setPrint(dataForPrint);

            if (isPrintAction && companies[0] && data) {
                setIsReceiptModalOpen(true);
            }
            return true;
        } catch (error) {
            console.error("Error updating invoice:", error);
            const errorMessage = error.response?.data?.error || "Failed to update the invoice.";
            Swal.fire("Error", errorMessage, "error");
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFinalizeOrder = async () => {
        if (!validateInputs()) return;

        Swal.fire({
            title: 'Are you sure?',
            text: "This will finalize the order and mark it as completed. This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, finalize it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                setIsProcessing(true);
                const invoiceDetails = getInvoicePayload();

                try {
                    const response = await axiosSecure.put(`/invoice/finalize/${currentInvoiceId}`, invoiceDetails);
                    toast.success(response.data.message || "Order finalized successfully! 🎉");
                    
                    const data = response.data.invoice;
                    const dataForPrint = {
                        ...data,
                        ...invoiceDetails,
                        dateTime: data.dateTime || new Date().toISOString(),
                        invoiceSerial: data.invoiceSerial || currentInvoiceId,
                    };
                    setPrint(dataForPrint);

                    if (companies[0] && data) {
                        setIsReceiptModalOpen(true);
                    }
                } catch (error) {
                    console.error("Error finalizing invoice:", error);
                    const errorMessage = error.response?.data?.message || "Failed to finalize the invoice.";
                    Swal.fire("Error", errorMessage, "error");
                } finally {
                    setIsProcessing(false);
                }
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold">Loading Order Details... ⏳</h1>
            </div>
        );
    }

    const { subtotal, vat, sd, payable } = calculateTotal();
    const paid = roundAmount(parseFloat(invoiceSummary.paid || 0));
    const change = paid > 0 ? paid - payable : 0;

    return (
        <div className="font-sans antialiased bg-gray-100 min-h-screen">
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
            <NewCustomerModal
                isOpen={isCustomerModalOpen}
                onClose={() => setCustomerModalOpen(false)}
                mobile={mobile}
            />

            <main className="flex flex-col lg:flex-row p-1 gap-1">
                <ProductSelection
                    products={products}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    addProduct={addProduct}
                    loading={loadingProducts}
                />
                <OrderSummary
                    title={`Editing Order: ${currentInvoiceId.slice(-6)}`}
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
                    addedProducts={allOrderItems}
                    incrementQuantity={incrementQuantity}
                    decrementQuantity={decrementQuantity}
                    removeProduct={removeProduct}
                    invoiceSummary={invoiceSummary}
                    setInvoiceSummary={setInvoiceSummary}
                    subtotal={subtotal}
                    vat={vat}
                    sd={sd}
                    payable={payable}
                    paid={paid}
                    change={change}
                    printInvoice={saveOrUpdateInvoice} 
                    handleFinalizeOrder={handleFinalizeOrder}
                    handleKitchenClick={handleKitchenClick}
                    resetOrder={resetOrder}
                    isProcessing={isProcessing}
                    selectedPaymentMethod={selectedPaymentMethod}
                    handlePaymentMethodSelect={handlePaymentMethodSelect}
                    updateCookStatus={updateCookStatus}
                    toggleComplimentaryStatus={toggleComplimentaryStatus}
                />
            </main>

            {isReceiptModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => navigate('/dashboard/order-list')}>
                    <div className="bg-white p-6 rounded-lg shadow-2xl relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                        <button className="absolute top-3 right-3 bg-red-600 text-white rounded-full px-3 py-1 text-sm hover:bg-red-700" onClick={() => navigate('/dashboard/order-list')}>
                            Close
                        </button>
                        <ReceiptTemplate
                            ref={receiptRef}
                            onPrintComplete={() => navigate('/dashboard/order-list')}
                            profileData={companies[0]}
                            invoiceData={print}
                        />
                    </div>
                </div>
            )}

            {isKitchenModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setIsKitchenModalOpen(false)}>
                    <div className="bg-white p-6 rounded-lg shadow-2xl relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                        <button className="absolute top-3 right-3 bg-red-600 text-white rounded-full px-3 py-1 text-sm hover:bg-red-700" onClick={() => setIsKitchenModalOpen(false)}>
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

export default EditOrderPage;