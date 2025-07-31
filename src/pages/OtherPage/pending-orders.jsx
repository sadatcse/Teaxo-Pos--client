import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import useCompanyHook from "../../Hook/useCompanyHook";
import ReceiptTemplate from "../../components/Receipt/ReceiptTemplate ";
import CookingAnimation from "../../components/CookingAnimation";
import { useNavigate } from "react-router-dom";

const PendingOrders = () => {
  const axiosSecure = UseAxiosSecure();
  const { companies, loading: companiesLoading } = useCompanyHook();
  const receiptRef = useRef();
  const { user, branch } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [discountDisplay, setDiscountDisplay] = useState(0);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState(null);

  // Function to fetch pending orders from the backend
  const fetchPendingOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosSecure.get(`/invoice/${branch}/status/pending`);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      Swal.fire("Error!", "Failed to fetch pending orders. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [axiosSecure, branch]);

  // Fetch orders on component mount
  useEffect(() => {
    fetchPendingOrders();
  }, [fetchPendingOrders]);

  // Handle updating order status
  const handleOrderUpdate = async (id, status) => {
    try {
      setIsLoading(true);
      await axiosSecure.put(`/invoice/update/${id}`, { orderStatus: status });
      fetchPendingOrders();
      Swal.fire("Success!", `Order has been updated to ${status}.`, "success");
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire("Error!", "Failed to update order status. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // *** NEW: Function to show confirmation before completing order ***
  const handleCompleteClick = (id) => {
    Swal.fire({
      title: 'Confirm Payment',
      text: "Is the payment for this order cleared?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745', // Green color for confirm
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, payment is clear!',
      cancelButtonText: 'No, not yet'
    }).then((result) => {
      if (result.isConfirmed) {
        // If user confirms, proceed to update the order status
        handleOrderUpdate(id, "completed");
      }
    });
  };


  // Handle opening the view modal
  const handleViewOrder = (order) => {
    setViewOrder(order);
    setDiscountDisplay(order.discount || 0);
    setIsModalOpen(true);
  };

  // Handle deleting an order
  const handleRemove = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          await axiosSecure.delete(`/invoice/delete/${id}`);
          fetchPendingOrders();
          Swal.fire("Deleted!", "The order has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting order:", error);
          Swal.fire("Error!", "Failed to delete order.", "error");
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // Function to handle the "Edit" button click and navigate
  const handleEditClick = (orderId) => {
    navigate(`/dashboard/edit-order/${orderId}`);
  };

  // Handle opening the print modal
  const handlePrintOrder = (id) => {
    const orderToPrint = orders.find((order) => order._id === id);
    if (orderToPrint) {
      setPrintData(orderToPrint);
      setIsPrintModalOpen(true);
    }
  };

  // Effect to trigger print
  useEffect(() => {
    if (isPrintModalOpen && printData && receiptRef.current) {
      const timer = setTimeout(() => {
        receiptRef.current.printReceipt();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPrintModalOpen, printData]);

  // Handle print completion
  const handlePrintComplete = () => {
    setIsPrintModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-inter">
      {companiesLoading || isLoading ? (
        <CookingAnimation />
      ) : (
        <>
          <Mtitle title="Pending Orders" />
          <section className="overflow-x-auto border border-gray-200 shadow-sm rounded-lg p-4 mt-6 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-600">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tl-lg">Order ID</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">User</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Total</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Order Type</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Delivery To</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-white uppercase tracking-wider rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      No pending orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{order.invoiceSerial}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{new Date(order.dateTime).toLocaleString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.loginUserName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.totalAmount?.toFixed(2)} Taka</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.orderType}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.tableName || order.deliveryProvider || 'N/A'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handlePrintOrder(order._id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-300 ease-in-out"
                            disabled={isLoading}
                          >
                            Print
                          </button>
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                            disabled={isLoading}
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditClick(order._id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-300 ease-in-out"
                            disabled={isLoading}
                          >
                            Edit
                          </button>
                          {/* *** UPDATED: OnClick handler for the Complete button *** */}
                          <button
                            onClick={() => handleCompleteClick(order._id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out"
                            disabled={isLoading}
                          >
                            Complete
                          </button>
                          {user?.role === "admin" && (
                            <button
                              onClick={() => handleRemove(order._id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300 ease-in-out"
                              disabled={isLoading}
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          {/* View Order Modal (no changes) */}
          {isModalOpen && viewOrder && companies[0] && (
               <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm md:max-w-3xl lg:max-w-4xl p-6 relative transform transition-all duration-300 scale-95 md:scale-100">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl font-bold transition-colors duration-200">&times;</button>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-900 mb-1">{companies[0].name}</h2>
                                <p className="text-sm text-gray-600">{companies[0].address}</p>
                                <p className="text-sm text-gray-600">Cell: {companies[0].phone}</p>
                            </div>
                            <div className="mt-4 md:mt-0 text-right">
                                <p className="text-lg font-semibold text-gray-800">Order ID: {viewOrder.invoiceSerial}</p>
                                <p className="text-sm text-gray-600">Date: {new Date(viewOrder.dateTime).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-gray-700">
                            <p><strong>Order Type:</strong> <span className="font-medium">{viewOrder.orderType}</span></p>
                            <p><strong>Counter:</strong> <span className="font-medium">{viewOrder.counter}</span></p>
                            <p><strong>Served By:</strong> <span className="font-medium">{viewOrder.loginUserName}</span></p>
                            {viewOrder.orderType === "dine-in" && (<p><strong>Table Name:</strong> <span className="font-medium">{viewOrder.tableName}</span></p>)}
                            {viewOrder.orderType === "delivery" && (<>
                                     <p><strong>Delivery Provider:</strong> <span className="font-medium">{viewOrder.deliveryProvider}</span></p>
                                     <p><strong>Customer Name:</strong> <span className="font-medium">{viewOrder.customerName || 'N/A'}</span></p>
                                     <p><strong>Customer Mobile:</strong> <span className="font-medium">{viewOrder.customerMobile || 'N/A'}</span></p>
                                 </>)}
                        </div>
                        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm mb-6">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">SL. NO</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Product</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Qty</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Rate</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {viewOrder.products.map((product, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{index + 1}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{product.productName}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800"><span className="p-1 text-center font-semibold">{product.qty}</span></td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{product.rate?.toFixed(2)} Taka</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{product.subtotal?.toFixed(2)} Taka</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex flex-col items-end space-y-2 mb-6 text-gray-800">
                            <p className="text-lg font-semibold">Total Qty: <span className="font-bold">{viewOrder.totalQty}</span></p>
                            <p className="text-lg font-semibold">Total Amount: <span className="font-bold">{viewOrder.totalSale?.toFixed(2)} Taka</span></p>
                            <div className="flex items-center gap-2">
                                <label htmlFor="discount" className="text-lg font-semibold">Discount:</label>
                                <span className="w-28 p-2 text-right font-bold">{discountDisplay?.toFixed(2)}</span>
                                <span className="text-lg font-semibold">Taka</span>
                            </div>
                            {viewOrder.vat > 0 && (<p className="text-lg font-semibold">VAT: <span className="font-bold">{viewOrder.vat?.toFixed(2)} Taka</span></p>)}
                            <p className="text-xl font-extrabold text-blue-700">Grand Total: <span className="font-bold">{viewOrder.totalAmount?.toFixed(2)} Taka</span></p>
                        </div>
                        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                            <button onClick={() => setIsModalOpen(false)} className="bg-gray-500 text-white py-2.5 px-6 rounded-md hover:bg-gray-600 transition duration-300 ease-in-out shadow-md font-semibold text-base">Close</button>
                        </div>
                    </div>
               </div>
          )}

          {/* Print Modal (no changes) */}
          {isPrintModalOpen && printData && companies[0] && (
               <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                   <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm md:max-w-md p-6 relative">
                       <button onClick={() => setIsPrintModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl font-bold transition-colors duration-200">&times;</button>
                       <h2 className="text-2xl font-bold text-gray-900 mb-4">Print Receipt</h2>
                       <p className="text-gray-700 mb-6">Click "Print Now" to generate and print the receipt for Order ID: <span className="font-semibold">{printData.invoiceSerial}</span>.</p>
                       <div className="hidden">
                           <ReceiptTemplate ref={receiptRef} onPrintComplete={handlePrintComplete} profileData={companies[0]} invoiceData={printData}/>
                       </div>
                       <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200">
                           <button onClick={() => { if (receiptRef.current) { receiptRef.current.printReceipt(); } }} className="bg-blue-600 text-white py-2.5 px-6 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out shadow-md font-semibold text-base">Print Now</button>
                           <button onClick={() => setIsPrintModalOpen(false)} className="bg-gray-500 text-white py-2.5 px-6 rounded-md hover:bg-gray-600 transition duration-300 ease-in-out shadow-md font-semibold text-base">Close</button>
                       </div>
                   </div>
               </div>
          )}
        </>
      )}
    </div>
  );
};

export default PendingOrders;