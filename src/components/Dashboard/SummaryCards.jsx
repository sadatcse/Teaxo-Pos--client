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
      className="bg-blue-500 rounded-lg shadow-lg p-4 text-white flex flex-col justify-between"
      variants={cardVariants}
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
    >
      <div className="flex justify-between items-center">
        <FaShoppingBag className="text-3xl opacity-75" />
        <h2 className="text-3xl font-bold">{todaysPendingOrders}</h2>
      </div>
      <h3 className="text-lg mt-3">Pending Orders</h3>
    </motion.div>

    {/* Card 2: Total Sale (Today) */}
    <motion.div
      className="bg-green-500 rounded-lg shadow-lg p-4 text-white flex flex-col justify-between"
      variants={cardVariants}
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
    >
      <div className="flex justify-between items-center">
        <FaChartBar className="text-3xl opacity-75" />
        <h2 className="text-3xl font-bold"><span>৳</span>{todaysTotalSale.toLocaleString()}</h2>
      </div>
      <h3 className="text-lg mt-3">Total Sale (Today)</h3>
    </motion.div>

    {/* Card 3: Yesterday's Sale */}
    <motion.div
      className="bg-yellow-500 rounded-lg shadow-lg p-4 text-white flex flex-col justify-between"
      variants={cardVariants}
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
    >
      <div className="flex justify-between items-center">
        <FaDollarSign className="text-3xl opacity-75" />
        <h2 className="text-3xl font-bold"><span>৳</span>{yesterdaysTotalSale.toLocaleString()}</h2>
      </div>
      <h3 className="text-lg mt-3">Yesterday's Sale</h3>
    </motion.div>

    {/* Card 4: Total Sale (This Month) */}
    <motion.div
      className="bg-red-500 rounded-lg shadow-lg p-4 text-white flex flex-col justify-between"
      variants={cardVariants}
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
    >
      <div className="flex justify-between items-center">
        <FaBoxes className="text-3xl opacity-75" />
        <h2 className="text-3xl font-bold"><span>৳</span>{dailySales.reduce((total, day) => total + day.totalSale, 0).toLocaleString()}</h2>
      </div>
      <h3 className="text-lg mt-3">Total Sale ({thisMonthName})</h3>
    </motion.div>
  </motion.div>
);

export default SummaryCards;