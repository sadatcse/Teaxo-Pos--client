import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import moment from "moment";
const DailySales = ({ dailySales }) => {
  const [salesData, setSalesData] = useState(dailySales);

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-lg mb-6 border dark:border-zinc-800">
      <h2 className="text-lg md:text-xl font-bold text-gray-700 dark:text-zinc-100 mb-4">
        Daily Sales (Last 30 Days)
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={dailySales.map((day) => ({
            date: moment(day.date).format("MMM DD"),
            sales: day.totalSale,
          }))}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#8884d8"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailySales;
