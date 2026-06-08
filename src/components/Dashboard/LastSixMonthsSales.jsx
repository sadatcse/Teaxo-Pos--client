import React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const LastSixMonthsSales = ({ last6MonthsSales }) => {
  if (!last6MonthsSales || last6MonthsSales.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-lg border dark:border-zinc-800 flex items-center justify-center min-h-[300px]">
        <p className="text-gray-500 dark:text-zinc-400 text-sm">No historical sales data available.</p>
      </div>
    );
  }

  // Format data for Recharts
  const data = last6MonthsSales.map((item) => ({
    name: item.month,
    sales: item.totalSale,
    orders: item.orderCount,
  }));

  // Custom tooltips for nice visuals
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-zinc-900/95 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xl backdrop-blur-sm text-sm">
          <p className="font-bold text-gray-800 dark:text-zinc-100 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-blue-600 dark:text-blue-400 flex justify-between gap-6">
              <span>Total Revenue:</span>
              <span className="font-bold">৳{payload[0].value.toLocaleString()}</span>
            </p>
            <p className="text-emerald-600 dark:text-emerald-400 flex justify-between gap-6">
              <span>Orders Placed:</span>
              <span className="font-bold">{payload[1].value} orders</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-lg border border-slate-100 dark:border-zinc-800/80 transition-all duration-300 hover:shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-zinc-100 tracking-tight">
            Sales Performance
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Revenue & order trends for the last 6 months
          </p>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: -5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-zinc-800 dark:opacity-40" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: "#6b7280", fontSize: 11, fontWeight: 500 }} 
              axisLine={{ stroke: "#e2e8f0" }}
              className="dark:axis-zinc-800"
            />
            <YAxis 
              yAxisId="left"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={{ stroke: "#e2e8f0" }}
              className="dark:axis-zinc-800"
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fill: "#10b981", fontSize: 11 }}
              axisLine={{ stroke: "#e2e8f0" }}
              className="dark:axis-zinc-800"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
            />
            <Bar 
              yAxisId="left" 
              dataKey="sales" 
              fill="url(#colorSales)" 
              radius={[4, 4, 0, 0]} 
              name="Revenue (৳)" 
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="orders" 
              stroke="#10b981" 
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }} 
              name="Orders" 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LastSixMonthsSales;
