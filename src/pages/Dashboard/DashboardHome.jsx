import React, { useState, useEffect, useCallback, useContext } from "react";

import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import DailySales from "./../../components/Dashboard/DailySales";
import MonthlyRevenue from "./../../components/Dashboard/MonthlyRevenue";
import OrderTimingChart from "./../../components/Dashboard/OrderTimingChart";
import FavouriteCharts from "./../../components/Dashboard/FavouriteCharts";
import TrendingOrders from "./../../components/Dashboard/TrendingOrders";
import CookingAnimation from "../../components/CookingAnimation";
import SummaryCards from "./../../components/Dashboard/SummaryCards";
import RecentlyPlacedOrders from "./../../components/Dashboard/RecentlyPlacedOrders";
import Mtitle from '../../components library/Mtitle';
import moment from 'moment';
import { motion } from 'framer-motion';
import { FaCode } from 'react-icons/fa';
const DashboardHome = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, branch } = useContext(AuthContext);
  const axiosSecure = UseAxiosSecure();

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await axiosSecure.get(`/invoice/${branch}/dashboard`);
      setDashboardData(response.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [axiosSecure, branch]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) return <CookingAnimation />;
  if (error)
    return <div className="text-center text-red-500 p-8">{error}</div>;

  const {
    todaysTotalSale,
    yesterdaysTotalSale,
    dailySales,
    thisMonthName,
    todaysPendingOrders,
  } = dashboardData;

  return (
    <div className="p-4 md:p-6 bg-gray-50">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
        <Mtitle title={`Welcome, ${user?.name || "Admin"}!`} />
        </div>

        <div className="col-span-12">
          <SummaryCards
            todaysPendingOrders={todaysPendingOrders}
            todaysTotalSale={todaysTotalSale}
            yesterdaysTotalSale={yesterdaysTotalSale}
            dailySales={dailySales}
            thisMonthName={thisMonthName}
          />
        </div>

        {/* --- CHANGED: Daily Sales Chart (50% width on large screens) --- */}
        <div className="col-span-12 lg:col-span-9">
          <DailySales dailySales={dailySales} />
        </div>

        {/* --- CHANGED: Monthly Revenue Chart (50% width on large screens) --- */}
        <div className="col-span-12 lg:col-span-3">
          <MonthlyRevenue />
        </div>
        
        {/* --- Other Components (2x2 Grid) --- */}
        <div className="col-span-12 lg:col-span-12">
            <TrendingOrders />
        </div>
        
        <div className="col-span-12 lg:col-span-8">
            <OrderTimingChart />
        </div>
        
        <div className="col-span-12 lg:col-span-4">
            <FavouriteCharts />
        </div>
        
        <div className="col-span-12 lg:col-span-12">
            <RecentlyPlacedOrders />
        </div>


<div className="col-span-12">
  <motion.footer
    className="footer footer-center p-8 bg-blue-800 text-blue-100 rounded-lg mt-6 shadow-xl"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.3 }}
  >
    <aside>
      <p className="font-bold text-base text-white">
        RESTAURANT MANAGEMENT SYSTEM 1.00
      </p>
      <p className="text-sm opacity-70">
        &copy; {moment().format("YYYY")} - All Rights Reserved
      </p>
      <div className="flex items-center gap-1.5 mt-2 text-sm">
        <span className="opacity-70">Designed & Developed by</span>
        <motion.a
          href="https://www.sadatkhan.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white font-semibold flex items-center gap-1 hover:underline decoration-blue-300 underline-offset-4 transition-all"
          whileHover={{ scale: 1.05, letterSpacing: '0.25px' }}
          whileTap={{ scale: 0.95 }}
        >
          Sadat Khan <FaCode />
        </motion.a>
      </div>
    </aside>
  </motion.footer>
</div>
      </div>
    </div>
  );
};

export default DashboardHome;