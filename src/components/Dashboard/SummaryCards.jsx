import React from "react";
import { motion } from "framer-motion"; // Import motion
import { FaShoppingBag, FaChartBar, FaBoxes, FaDollarSign } from "react-icons/fa";

// Define animation variants for the container and the individual cards
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // This will make each card animate one after the other
    },
  },
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

const SummaryCards = ({ todaysPendingOrders, todaysTotalSale, yesterdaysTotalSale, dailySales, thisMonthName }) => (
  <motion.div
    className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    variants={containerVariants}
    initial="hidden"
    animate="show"
  >
    {/* Card 1: Pending Orders */}
    <motion.div
      className="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-800 rounded-xl shadow-lg p-5 text-white flex flex-col justify-between"
      variants={cardVariants}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
    >
      <div className="flex justify-between items-center">
        <FaShoppingBag className="text-3xl opacity-80" />
        <h2 className="text-3xl font-bold tracking-tight">{todaysPendingOrders}</h2>
      </div>
      <h3 className="text-sm font-medium tracking-wide uppercase opacity-90 mt-4">Pending Orders</h3>
    </motion.div>

    {/* Card 2: Total Sale (Today) */}
    <motion.div
      className="bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-800 rounded-xl shadow-lg p-5 text-white flex flex-col justify-between"
      variants={cardVariants}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
    >
      <div className="flex justify-between items-center">
        <FaChartBar className="text-3xl opacity-80" />
        <h2 className="text-3xl font-bold tracking-tight"><span>৳</span>{todaysTotalSale.toLocaleString()}</h2>
      </div>
      <h3 className="text-sm font-medium tracking-wide uppercase opacity-90 mt-4">Total Sale (Today)</h3>
    </motion.div>

    {/* Card 3: Yesterday's Sale */}
    <motion.div
      className="bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-850 rounded-xl shadow-lg p-5 text-white flex flex-col justify-between"
      variants={cardVariants}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
    >
      <div className="flex justify-between items-center">
        <FaDollarSign className="text-3xl opacity-80" />
        <h2 className="text-3xl font-bold tracking-tight"><span>৳</span>{yesterdaysTotalSale.toLocaleString()}</h2>
      </div>
      <h3 className="text-sm font-medium tracking-wide uppercase opacity-90 mt-4">Yesterday's Sale</h3>
    </motion.div>

    {/* Card 4: Total Sale (This Month) */}
    <motion.div
      className="bg-gradient-to-br from-rose-500 to-red-600 dark:from-rose-600 dark:to-red-800 rounded-xl shadow-lg p-5 text-white flex flex-col justify-between"
      variants={cardVariants}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
    >
      <div className="flex justify-between items-center">
        <FaBoxes className="text-3xl opacity-80" />
        <h2 className="text-3xl font-bold tracking-tight"><span>৳</span>{dailySales.reduce((total, day) => total + day.totalSale, 0).toLocaleString()}</h2>
      </div>
      <h3 className="text-sm font-medium tracking-wide uppercase opacity-90 mt-4">Total Sale ({thisMonthName})</h3>
    </motion.div>
  </motion.div>
);

export default SummaryCards;