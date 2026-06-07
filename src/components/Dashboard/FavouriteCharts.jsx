import React, { useState, useEffect, useContext } from "react";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";

const FavouriteCharts = () => {
  const [activeTab, setActiveTab] = useState("monday");
  const [performanceData, setPerformanceData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const axiosSecure = UseAxiosSecure();
  const { branch } = useContext(AuthContext);

  // Short day names
  const dayShortMap = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
  };

  // Sorted order for days
  const dayOrder = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  useEffect(() => {
    const fetchPerformanceData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosSecure.get(`invoice/${branch}/monthly-item-sales`);
        const fetchedData = response.data?.data || [];

        const transformed = {};
        fetchedData.forEach((day) => {
          const key = day.dayName.toLowerCase();
          transformed[key] = day.topProducts.map((product) => ({
            name: product.productName,
            qty: product.currentMonth.totalQty,
            orders: parseFloat(product.percentageChange.qtyChange),
            profit: parseFloat(product.percentageChange.salesChange),
          }));
        });

        setPerformanceData(transformed);

        // Default to first day found
        const firstDay = fetchedData[0]?.dayName?.toLowerCase();
        if (firstDay) setActiveTab(firstDay);
      } catch (e) {
        console.error("Failed to fetch performance data:", e);
        setError("Could not load performance data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (branch) {
      fetchPerformanceData();
    }
  }, [branch, axiosSecure]);

  const renderTable = (data) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-600 dark:text-zinc-400">
        <thead className="text-xs text-gray-700 dark:text-zinc-300 uppercase bg-gray-100 dark:bg-zinc-800">
          <tr>
            <th className="px-4 py-2">Product</th>
            <th className="px-4 py-2">Qty</th>
            <th className="px-4 py-2">Changes</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item) => (
            <tr key={item.name} className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/40">
              <td className="px-4 py-3 font-medium text-gray-800 dark:text-zinc-205">{item.name}</td>
              <td className="px-4 py-3 text-gray-800 dark:text-zinc-300">{item.qty}</td>
              <td
                className={`px-4 py-3 ${
                  item.orders > 0
                    ? "text-green-500 dark:text-emerald-400"
                    : item.orders < 0
                    ? "text-red-500 dark:text-red-400"
                    : "text-gray-500 dark:text-zinc-400"
                }`}
              >
                {item.orders > 0 ? "+" : ""}
                {item.orders.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="col-span-12 xl:col-span-5 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border dark:border-zinc-800">
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
        <h6 className="text-lg font-bold text-gray-700 dark:text-zinc-100">Favourite Food</h6>
      </div>
      <div>
        <div className="border-b border-gray-200 dark:border-zinc-800">
          <nav className="-mb-px flex space-x-4 px-4" aria-label="Tabs">
            {dayOrder
              .filter((day) => performanceData[day])
              .map((day) => (
                <button
                  key={day}
                  onClick={() => setActiveTab(day)}
                  className={`${
                    activeTab === day
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-450 dark:hover:text-zinc-200 hover:border-gray-300 dark:hover:border-zinc-700"
                  } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                >
                  {dayShortMap[day]}
                </button>
              ))}
          </nav>
        </div>
        <div className="p-4">
          {isLoading ? (
            <p className="text-gray-500 dark:text-zinc-400">Loading...</p>
          ) : error ? (
            <p className="text-red-500 dark:text-red-400">{error}</p>
          ) : performanceData[activeTab] ? (
            renderTable(performanceData[activeTab])
          ) : (
            <p className="text-gray-500 dark:text-zinc-400">No data available for this day.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavouriteCharts;
