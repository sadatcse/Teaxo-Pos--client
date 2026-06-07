import React, { useEffect, useState, useContext } from "react";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import moment from "moment";

// Tailwind status styling
const statusStyles = {
  delivered: "bg-green-500 text-white dark:bg-green-600",
  pending: "bg-pink-200 text-pink-800 dark:bg-pink-950/40 dark:text-pink-450",
  cancelled: "bg-gray-700 text-white dark:bg-zinc-800 dark:text-zinc-300",
};

const RecentlyPlacedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const axiosSecure = UseAxiosSecure();
  const { branch } = useContext(AuthContext);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!branch) return;
        const res = await axiosSecure.get(`/invoice/${branch}/top5`);
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching recent orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [branch, axiosSecure]);

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-lg shadow-md border dark:border-zinc-800 w-full">

      {loading ? (
        <p className="text-gray-500 dark:text-zinc-400">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-zinc-400">No recent orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm text-left text-gray-600 dark:text-zinc-400">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800 font-semibold text-gray-600 dark:text-zinc-300">
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">Item(s)</th>
                <th className="px-2 py-2">Customer</th>
                <th className="px-2 py-2">Counter</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Time</th>
                <th className="px-2 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={order._id} className="border-b border-gray-200 dark:border-zinc-800 last:border-none">
                  <td className="py-4 px-2 font-bold text-gray-700 dark:text-zinc-300">{idx + 1}</td>
                  <td className="py-4 px-2 text-gray-800 dark:text-zinc-100">
                    {order.products.map((p, i) => (
                      <div key={i}>
                        {p.productName} x{p.qty}
                      </div>
                    ))}
                  </td>
                  <td className="py-4 px-2 text-gray-600 dark:text-zinc-400">{order.customerName}</td>
                  <td className="py-4 px-2 text-gray-600 dark:text-zinc-400">{order.counter}</td>
                  <td className="py-4 px-2">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        statusStyles[order.orderStatus.toLowerCase()] || "bg-gray-300 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-gray-600 dark:text-zinc-400">
                    {moment(order.dateTime).format("hh:mm A")}
                  </td>
                  <td className="py-4 px-2 font-semibold text-gray-800 dark:text-zinc-100">
                    {order.totalAmount.toLocaleString("en-BD", {
                      style: "currency",
                      currency: "BDT",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentlyPlacedOrders;
