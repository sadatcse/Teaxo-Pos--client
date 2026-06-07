// OrderTimingChart.jsx

import React, { useState, useEffect, useContext } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { AuthContext } from "../../providers/AuthProvider"; // Adjust path as needed
import UseAxiosSecure from "../../Hook/UseAxioSecure"; // Adjust path as needed

const OrderTimingChart = () => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { branch } = useContext(AuthContext);
  const axiosSecure = UseAxiosSecure();

  useEffect(() => {
    if (!branch) {
      setIsLoading(false);
      return;
    }

    const fetchOrderTimings = async () => {
      try {
        setIsLoading(true);
        const res = await axiosSecure.get(`/invoice/${branch}/order-timings`);
        setChartData(res.data);
      } catch (error) {
        console.error("Failed to fetch order timing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderTimings();
  }, [branch, axiosSecure]);

  return (
    <div className="col-span-12 xl:col-span-7 bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-lg border dark:border-zinc-800 h-full">
      <h2 className="text-lg md:text-xl font-bold text-gray-700 dark:text-zinc-100 mb-4">Order Timing Chart (Current Month)</h2>
      {isLoading ? (
        <p className="text-gray-500 dark:text-zinc-400">Loading chart data...</p>
      ) : chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:opacity-20" />
            <XAxis dataKey="hour" tick={{ fill: "#6b7280" }} />
            <YAxis tick={{ fill: "#6b7280" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.8)", borderRadius: "0.5rem" }}
            />
            <Legend />
            <Bar dataKey="orders" fill="#82ca9d" name="Orders per Hour" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-gray-500 dark:text-zinc-400 pt-16">No order data available for this month.</p>
      )}
    </div>
  );
};

export default OrderTimingChart;