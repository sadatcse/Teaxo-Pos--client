import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import { AuthContext } from "../../providers/AuthProvider";
import UseAxiosSecure from "../../Hook/UseAxioSecure";

const MonthlyRevenue = () => {
  const allMonths = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  const currentMonthIndex = moment().month();
  const months = allMonths.slice(0, currentMonthIndex + 1);
  const currentMonthName = allMonths[currentMonthIndex];
  
  const axiosSecure = UseAxiosSecure();
  const { branch } = useContext(AuthContext);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);

  // 1. Corrected initial state to match the API response structure
  const [weeklyData, setWeeklyData] = useState({
    weeklyPercentage: [],
    totalMonthSale: 0,
  });

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  useEffect(() => {
    if (!branch) return;

    const fetchWeeklyData = async () => {
      try {
        // 2. Convert month name ("July") to month number (7) for the API
        const monthNumber = allMonths.indexOf(selectedMonth) + 1;

        const res = await axiosSecure.get(`/invoice/${branch}/weekly-sales`, {
          params: {
            month: monthNumber, // Send the correct month number
          },
        });
        
        setWeeklyData(res.data || { weeklyPercentage: [], totalMonthSale: 0 });
      } catch (error) {
        console.error("Error fetching weekly sales data:", error);
        // Reset state on error to prevent crashes
        setWeeklyData({ weeklyPercentage: [], totalMonthSale: 0 });
      }
    };

    fetchWeeklyData();
  }, [branch, selectedMonth]); // Removed currentYear from dependency array as it's handled in the backend

  return (
    <div className="col-span-12 xl:col-span-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg border dark:border-zinc-800">
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
          <h6 className="text-lg font-bold text-gray-700 dark:text-zinc-100">Monthly Earning</h6>
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="text-sm border-gray-300 dark:border-zinc-700 dark:bg-zinc-850 dark:text-zinc-100 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div className="p-4 space-y-4">
          {/* 3. Corrected rendering logic to map over the weeklyPercentage array */}
          {weeklyData.weeklyPercentage.length > 0 ? (
            weeklyData.weeklyPercentage.map((weekInfo, i) => (
              <div key={i}>
                <span className="text-sm font-semibold text-gray-800 dark:text-zinc-305">{weekInfo.week}</span>
                <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2.5 mt-1">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${weekInfo.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-zinc-400">No sales data for this month.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyRevenue;