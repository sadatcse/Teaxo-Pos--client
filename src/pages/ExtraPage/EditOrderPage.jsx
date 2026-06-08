import React, { useState, useContext, useRef, useEffect, useMemo, useCallback } from "react";
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
import EditSummary from "../../components/Product/EditSummary.jsx";
import ReceiptTemplate from "../../components/Receipt/ReceiptTemplate ";
import KitchenReceiptTemplate from "../../components/Receipt/KitchenReceiptTemplate";
import BarReceiptTemplate from "../../components/Receipt/BarReceiptTemplate";
import NewCustomerModal from "../../components/Modal/NewCustomerModal";
import TableSelectionModal from "../../components/Modal/TableSelectionModal";
import DeliveryProviderSelectionModal from "../../components/Modal/DeliveryProviderSelectionModal";
import UpdateHistoryModal from "../../components/Product/UpdateHistoryModal.jsx";

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
    
    const [kotPrintProducts, setKotPrintProducts] = useState([]);
    
    // --- Track KOT Rounds in Edit Mode ---
    const [kotRound, setKotRound] = useState(1);

    // --- Custom Hooks for Data & UI ---
    const { customer, setCustomer, tables, searchCustomer, selectedTable, isCustomerModalOpen, setSelectedTable, setCustomerModalOpen } = useCustomerTableSearch();
    const { products, categories, selectedCategory, setSelectedCategory, loadingProducts } = useCategoriesWithProducts(branch);
    const { companies } = useCompanyHook();

    // --- Order Details State ---
    const [orderType, setOrderType] = useState(null);
    const [TableName, setTableName] = useState("");
    const [deliveryProvider, setDeliveryProvider] = useState("");
    const [mobile, setMobile] = useState("");
    const [invoiceSummary, setInvoiceSummary] = useState({ discount: 0, paid: 0 });
    
    const [discountType, setDiscountType] = useState("Fixed"); 
    const [orderDateTime, setOrderDateTime] = useState("");

    const [print, setPrint] = useState(null);
    const [currentInvoiceId, setCurrentInvoiceId] = useState(orderId);
    
    // --- Payment State ---
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");
    const [selectedSubMethod, setSelectedSubMethod] = useState('');
    const [selectedCardIcon, setSelectedCardIcon] = useState(null);

    // --- Modal State ---
    const [isTableSelectionModalOpen, setIsTableSelectionModalOpen] = useState(false);
    const [isDeliveryProviderModalOpen, setIsDeliveryProviderModalOpen] = useState(false);
    const [isKitchenModalOpen, setIsKitchenModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    // --- Refs for Printing ---
    const receiptRef = useRef();
    const kitchenReceiptRef = useRef();
    const barReceiptRef = useRef();

    // --- Track expected vs completed prints for auto-close ---
    const [printJobs, setPrintJobs] = useState({ expected: 0, completed: 0 });

    // --- Payment Handlers ---
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

    const handleDateTimeChange = (e) => setOrderDateTime(e.target.value);

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

                const currentKotRound = orderData.kotRound || 1;
                setKotRound(currentKotRound + 1);

                const initialOriginalItems = orderData.products.map(p => ({ 
                    ...p, 
                    // Safeguard to ensure productId is extracted properly
                    productId: p.productId?._id || p.productId || p._id,
                    price: p.rate, 
                    quantity: p.qty, 
                    originalQuantity: p.qty,
                    printedQty: p.printedQty ?? p.qty,
                    addedInRound: p.addedInRound || 1,
                    isOriginal: true, 
                    isComplimentary: p.isComplimentary || false,
                    drinkBar: p.drinkBar || false,
                    history: p.history || [] 
                }));
                
                setOriginalOrderItems(initialOriginalItems);
                setNewOrderItems([]);

                setOrderType(orderData.orderType);
                setTableName(orderData.tableName || "");
                setDeliveryProvider(orderData.deliveryProvider || "");
                setInvoiceSummary({ discount: orderData.discount || 0, paid: 0 });
                setDiscountType("Fixed"); 

                if (orderData.dateTime) {
                    const formattedDate = new Date(orderData.dateTime).toISOString().slice(0, 16);
                    setOrderDateTime(formattedDate);
                }

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

    // --- Core Logic Functions (Handlers) ---
    const addProduct = (product) => {
        const existingItem = allOrderItems.find(p => p.productId === product._id && !p.isComplimentary);
        if (existingItem) {
            const updateFn = p => p.productId === product._id ? { 
                ...p, 
                quantity: p.quantity + 1,
                addedInRound: kotRound 
            } : p;

            if (existingItem.isOriginal) setOriginalOrderItems(items => items.map(updateFn));
            else setNewOrderItems(items => items.map(updateFn));
            
            toast.info(`Quantity for ${product.productName} incremented.`);
        } else {
            const itemToAdd = { 
                ...product, 
                productId: product._id, 
                quantity: 1, 
                printedQty: 0, 
                addedInRound: kotRound,
                cookStatus: 'PENDING', 
                isOriginal: false, 
                isComplimentary: false,
                drinkBar: product.drinkBar || false,
                history: [] 
            };
            setNewOrderItems(current => [...current, itemToAdd]);
            toast.success(`${product.productName} added to order!`);
        }
    };
    
    const incrementQuantity = (productId) => {
        const updateFn = p => p.productId === productId ? { 
            ...p, 
            quantity: p.quantity + 1,
            addedInRound: kotRound
        } : p;
        setOriginalOrderItems(items => items.map(updateFn));
        setNewOrderItems(items => items.map(updateFn));
    };

    const decrementQuantity = (productId) => {
        const originalItem = originalOrderItems.find(p => p.productId === productId);
        if (originalItem) {
            if (originalItem.quantity > 1) {
                setOriginalOrderItems(items => items.map(p => p.productId === productId ? { ...p, quantity: p.quantity - 1 } : p));
                if (originalItem.quantity - 1 < originalItem.printedQty) {
                    toast.warn("Warning: Reducing quantity below already printed KOT items.");
                }
            }
            return;
        }
        setNewOrderItems(items => items.map(p => p.productId === productId ? { ...p, quantity: p.quantity - 1 } : p).filter(p => p.quantity > 0));
    };

    const removeProduct = (productId) => {
        if (newOrderItems.some(p => p.productId === productId)) {
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
        const updater = items => items.map(p => p.productId === productId ? { ...p, isComplimentary: !p.isComplimentary, quantity: !p.isComplimentary ? 1 : p.quantity } : p);
        if (originalOrderItems.some(p => p.productId === productId)) {
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

    const getDeltaKOTProducts = useCallback(() => {
        const itemsToPrint = [];
        allOrderItems.forEach(item => {
            const unprintedQty = item.quantity - (item.printedQty || 0);
            if (unprintedQty > 0) {
                itemsToPrint.push({
                    productId: item.productId,
                    productName: item.productName,
                    qty: unprintedQty, 
                    rate: item.price,
                    subtotal: Math.round(unprintedQty * item.price),
                    vat: item.vat || 0,
                    sd: item.sd || 0,
                    cookStatus: item.cookStatus || 'PENDING',
                    isComplimentary: item.isComplimentary || false,
                    drinkBar: item.drinkBar || false
                });
            }
        });
        return itemsToPrint;
    }, [allOrderItems]);

    // --- SMART HISTORY LOGIC & STATUS HANDLING ---
    const getInvoicePayload = (markAsPrinted = false, isFinalizing = false) => {
        const { subtotal, vat, sd, discount, payable } = calculateTotal();
        const now = new Date();
        const isPastDate = orderDateTime && new Date(orderDateTime) < now;

        const productsPayload = allOrderItems.map((p) => {
            let currentHistory = p.history ? [...p.history] : [];
            
            const lastHistoryQty = currentHistory.length > 0 ? currentHistory[currentHistory.length - 1].qty : 0;
            
            if (p.quantity !== lastHistoryQty) {
                currentHistory.push({
                    updateNumber: currentHistory.length,
                    updateTime: now.toISOString(),
                    cookStatus: p.cookStatus || 'PENDING',
                    qty: p.quantity 
                });
            }

            let finalCookStatus = p.cookStatus || 'PENDING';
            if (isFinalizing || (isFinalizing && isPastDate)) {
                finalCookStatus = 'SERVED';
                if (currentHistory.length > 0) {
                    currentHistory[currentHistory.length - 1].cookStatus = 'SERVED';
                }
            }

            return { 
                productId: p.productId, 
                productName: p.productName, 
                qty: p.quantity, 
                printedQty: markAsPrinted ? p.quantity : (p.printedQty || 0), 
                addedInRound: p.addedInRound || kotRound,
                rate: p.price, 
                subtotal: roundAmount(p.price * p.quantity), 
                vat: p.vat || 0, 
                sd: p.sd || 0, 
                cookStatus: finalCookStatus, 
                isComplimentary: p.isComplimentary || false,
                drinkBar: p.drinkBar || false,
                history: currentHistory 
            };
        });

        const invoiceDetails = {
            orderType,
            orderStatus: isFinalizing ? "completed" : "pending", 
            kotRound, 
            products: productsPayload,
            subtotal, discount, vat, sd,
            loginUserEmail, loginUserName,
            customerName: customer?.name || "Guest", customerMobile: customer?.mobile || "n/a",
            counter: "Counter 1", branch: branch, totalAmount: payable, paymentMethod: selectedPaymentMethod,
        };
        
        if (orderDateTime) invoiceDetails.dateTime = orderDateTime;
        if (orderType === "dine-in") invoiceDetails.tableName = TableName;
        if (orderType === "delivery") invoiceDetails.deliveryProvider = deliveryProvider;
        
        return invoiceDetails;
    }

    // --- REWRITTEN saveOrUpdateInvoice TO FIX HISTORY _ID COLLISION ---
    const saveOrUpdateInvoice = async (isPrintAction = false, markAsPrinted = false) => {
        if (!validateInputs()) return false;
        setIsProcessing(true);
        const invoiceDetails = getInvoicePayload(markAsPrinted, false);
        
        try {
            const response = await axiosSecure.put(`/invoice/update/${currentInvoiceId}`, invoiceDetails);
            if (!markAsPrinted) toast.success("Invoice updated successfully! ✅");
            
            const data = response.data.invoice || response.data; 
            const backendProducts = data.products || invoiceDetails.products;

            // Sync state with BACKEND response to grab proper Mongoose _ids for history arrays
            const updatedItems = allOrderItems.map(p => {
                const bItem = backendProducts.find(i => {
                    const bId = i.productId?._id || i.productId;
                    return bId?.toString() === p.productId?.toString();
                });
                return {
                    ...p,
                    history: bItem ? bItem.history : p.history,
                    isOriginal: true,
                    printedQty: markAsPrinted ? p.quantity : (p.printedQty || 0),
                    originalQuantity: markAsPrinted ? p.quantity : (p.originalQuantity || p.quantity)
                };
            });

            setOriginalOrderItems(updatedItems);
            setNewOrderItems([]);

            const dataForPrint = { 
                ...invoiceDetails, 
                ...data, 
                products: invoiceDetails.products, 
                dateTime: data.dateTime || new Date().toISOString(), 
                invoiceSerial: data.invoiceSerial || currentInvoiceId 
            };
            setPrint(dataForPrint);
            
            if (isPrintAction && companies[0] && data) {
                setTimeout(() => { receiptRef.current?.printReceipt(); }, 100);
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

    // --- REWRITTEN handleKitchenClick TO REPRINT LAST KOT BATCH CORRECTLY ---
    const handleKitchenClick = async () => {
        const newKotItems = getDeltaKOTProducts();
        
        if (newKotItems.length === 0) {
            let latestTime = 0;
            allOrderItems.forEach(item => {
                if (item.history && item.history.length > 0) {
                    const lastH = item.history[item.history.length - 1];
                    const hTime = new Date(lastH.updateTime).getTime();
                    if (hTime > latestTime) latestTime = hTime;
                }
            });

            if (latestTime === 0) {
                return toast.warn("No update history found to reprint.");
            }

            const reprintItems = [];
            const tolerance = 2000; 
            
            allOrderItems.forEach(item => {
                if (item.history && item.history.length > 0) {
                    const lastH = item.history[item.history.length - 1];
                    const hTime = new Date(lastH.updateTime).getTime();
                    
                    if (Math.abs(hTime - latestTime) <= tolerance) {
                        // Calculate delta difference for accurate reprint quantity
                        let deltaQty = lastH.qty;
                        if (item.history.length > 1) {
                            const prevH = item.history[item.history.length - 2];
                            deltaQty = lastH.qty - prevH.qty;
                        }
                        
                        // Only reprint items that had a positive increase in that specific round
                        if (deltaQty > 0) {
                            reprintItems.push({
                                productId: item.productId,
                                productName: item.productName,
                                qty: deltaQty, 
                                rate: item.price,
                                subtotal: Math.round(deltaQty * item.price),
                                vat: item.vat || 0,
                                sd: item.sd || 0,
                                cookStatus: lastH.cookStatus || 'PENDING',
                                isComplimentary: item.isComplimentary || false,
                                drinkBar: item.drinkBar || false
                            });
                        }
                    }
                }
            });

            if (reprintItems.length === 0) return toast.warn("No valid KOT history found for reprint.");

            toast.info("No new items. Reprinting the latest KOT/BOT updates...");
            setKotPrintProducts(reprintItems);

            let expectedPrints = 0;
            if (reprintItems.some(p => !p.drinkBar)) expectedPrints++;
            if (reprintItems.some(p => p.drinkBar)) expectedPrints++; 
            
            setPrintJobs({ expected: expectedPrints, completed: 0 });
            setIsKitchenModalOpen(true);
            return;
        }

        // Proceed with saving and printing new items
        const isUpdateSuccessful = await saveOrUpdateInvoice(false, true);
        
        if (isUpdateSuccessful) {
            setKotPrintProducts(newKotItems);

            let expectedPrints = 0;
            if (newKotItems.some(p => !p.drinkBar)) expectedPrints++;
            if (newKotItems.some(p => p.drinkBar)) expectedPrints++; 
            
            setPrintJobs({ expected: expectedPrints, completed: 0 });
            setIsKitchenModalOpen(true);
            toast.info("Order Updated! KOT/BOT are ready.");
            
            setKotRound(prev => prev + 1);
        } else {
            toast.error("Could not update order. KOT not printed.");
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
                const invoiceDetails = getInvoicePayload(true, true); 
                try {
                    const response = await axiosSecure.put(`/invoice/finalize/${currentInvoiceId}`, invoiceDetails);
                    const data = response.data.invoice;
                    
                    const dataForPrint = { 
                        ...invoiceDetails, 
                        ...data, 
                        products: invoiceDetails.products, 
                        dateTime: data.dateTime || new Date().toISOString(), 
                        invoiceSerial: data.invoiceSerial || currentInvoiceId 
                    };
                    setPrint(dataForPrint);

                    if (companies[0] && data) {
                        toast.success(response.data.message || "Order finalized successfully! 🎉");
                        setTimeout(() => { receiptRef.current?.printReceipt(); }, 100);
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
        
        let discountAmount = 0;
        const discountInput = parseFloat(invoiceSummary.discount || 0);
        
        if (discountType === 'Percent') {
            const totalBeforeDiscount = subtotal + vat + sd;
            discountAmount = (totalBeforeDiscount * discountInput) / 100;
        } else {
            discountAmount = discountInput;
        }

        const payable = subtotal + vat + sd - discountAmount;
        return { subtotal: roundAmount(subtotal), vat: roundAmount(vat), sd: roundAmount(sd), discount: roundAmount(discountAmount), payable: roundAmount(payable) };
    };
    
    const handlePrintComplete = () => {
        setPrintJobs((prev) => {
            const updatedCompleted = prev.completed + 1;
            if (updatedCompleted >= prev.expected) {
                setIsKitchenModalOpen(false);
            }
            return { ...prev, completed: updatedCompleted };
        });
    };

    const handleMainReceiptPrintComplete = () => {
        toast.info("Receipt printed successfully.");
    };

    if (isLoading) {
        return ( <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-950 text-gray-800 dark:text-zinc-100"><h1 className="text-2xl font-bold">Loading Order Details... ⏳</h1></div> );
    }

    const { subtotal, vat, sd, payable } = calculateTotal();
    const paid = roundAmount(parseFloat(invoiceSummary.paid || 0));
    const change = paid > 0 ? paid - payable : 0;

    return (
        <div className="font-sans antialiased bg-gray-100 dark:bg-zinc-950 text-gray-800 dark:text-zinc-100 min-h-screen">
            <TableSelectionModal isOpen={isTableSelectionModalOpen} tables={tables} selectedTable={selectedTable} handleTableSelect={handleTableSelect} onConfirm={handleTableSelectionConfirm} onClose={() => setIsTableSelectionModalOpen(false)} />
            <DeliveryProviderSelectionModal isOpen={isDeliveryProviderModalOpen} onSelect={handleDeliveryProviderSelect} onClose={() => setIsDeliveryProviderModalOpen(false)} />
            <NewCustomerModal isOpen={isCustomerModalOpen} onClose={() => setCustomerModalOpen(false)} mobile={mobile} onCustomerAdded={setCustomer} />
            
            {/* --- NEW UPDATE HISTORY MODAL COMPONENT --- */}
<UpdateHistoryModal 
    isOpen={isHistoryModalOpen} 
    onClose={() => setIsHistoryModalOpen(false)} 
    allOrderItems={allOrderItems} 
    // Pass Company info to the modal for receipt generation
    profileData={companies && companies.length > 0 ? companies[0] : null}
    // Pass existing print data OR mock up the basic info if it hasn't been saved yet this session
    invoiceData={print || {
        orderType,
        tableName: TableName,
        deliveryProvider,
        customerName: customer?.name || "Guest",
        customerMobile: customer?.mobile || "n/a",
        invoiceSerial: currentInvoiceId,
        dateTime: orderDateTime || new Date().toISOString(),
        loginUserName
    }}
/>
            <main className="flex flex-col lg:flex-row p-1 gap-1">
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
                <EditSummary
                    user={user}
                    title={`Editing Order: ${currentInvoiceId.slice(-6)}`}
                    orderDateTime={orderDateTime} handleDateTimeChange={handleDateTimeChange}
                    customer={customer} mobile={mobile} setMobile={setMobile} handleCustomerSearch={handleCustomerSearch}
                    isCustomerModalOpen={isCustomerModalOpen} setCustomerModalOpen={setCustomerModalOpen}
                    orderType={orderType} handleOrderTypeChange={handleOrderTypeChange}
                    TableName={TableName} deliveryProvider={deliveryProvider}
                    addedProducts={allOrderItems}
                    incrementQuantity={incrementQuantity} decrementQuantity={decrementQuantity} removeProduct={removeProduct}
                    invoiceSummary={invoiceSummary} setInvoiceSummary={setInvoiceSummary}
                    discountType={discountType} setDiscountType={setDiscountType}
                    subtotal={subtotal} vat={vat} sd={sd} payable={payable} paid={paid} change={change}
                    printInvoice={saveOrUpdateInvoice} 
                    handleFinalizeOrder={handleFinalizeOrder}
                    handleKitchenClick={handleKitchenClick}
                    resetOrder={resetOrder}
                    isProcessing={isProcessing}
                    updateCookStatus={updateCookStatus} toggleComplimentaryStatus={toggleComplimentaryStatus}
                    openHistoryModal={() => setIsHistoryModalOpen(true)}
                />
            </main>
            
            <div style={{ display: 'none' }}>
                {print && companies[0] && (
                    <ReceiptTemplate
                        ref={receiptRef}
                        onPrintComplete={handleMainReceiptPrintComplete}
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
                        className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-6 rounded-lg shadow-2xl relative w-full max-w-sm flex flex-col items-center" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            className="absolute top-3 right-3 text-gray-400 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1" 
                            onClick={() => setIsKitchenModalOpen(false)}
                            title="Close without printing"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-100 mb-4">Print Tickets Preview</h3>

                        <div className="w-full max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {(() => {
                                const kitchenProducts = kotPrintProducts.filter(p => !p.drinkBar);
                                const barProducts = kotPrintProducts.filter(p => p.drinkBar);

                                return (
                                    <>
                                        {kitchenProducts.length > 0 && (
                                            <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded p-2 mb-4 bg-gray-50 dark:bg-zinc-950">
                                                <div className="text-center font-bold text-gray-500 dark:text-zinc-400 text-xs mb-1 uppercase tracking-wider">Kitchen Ticket</div>
                                                <KitchenReceiptTemplate
                                                    ref={kitchenReceiptRef}
                                                    profileData={companies[0]}
                                                    invoiceData={{ ...print, products: kitchenProducts }}
                                                    onPrintComplete={handlePrintComplete}
                                                />
                                            </div>
                                        )}

                                        {barProducts.length > 0 && (
                                            <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded p-2 mb-4 bg-gray-50 dark:bg-zinc-950">
                                                <div className="text-center font-bold text-gray-500 dark:text-zinc-400 text-xs mb-1 uppercase tracking-wider">Bar Ticket</div>
                                                <BarReceiptTemplate
                                                    ref={barReceiptRef}
                                                    profileData={companies[0]}
                                                    invoiceData={{ ...print, products: barProducts }}
                                                    onPrintComplete={handlePrintComplete}
                                                />
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        <button 
                            onClick={() => {
                                if (kitchenReceiptRef.current) kitchenReceiptRef.current.printReceipt();
                                if (barReceiptRef.current) barReceiptRef.current.printReceipt();
                            }}
                            className="w-full mt-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Active Tickets & Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditOrderPage;