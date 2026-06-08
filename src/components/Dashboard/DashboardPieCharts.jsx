import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DashboardPieCharts = ({ paymentMethodStats, orderTypeStats }) => {
  // Vibrant, tailored color palettes for beautiful look
  const PAYMENT_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];
  const ORDER_COLORS = ["#f43f5e", "#6366f1", "#06b6d4"];

  const hasPaymentData = paymentMethodStats && paymentMethodStats.length > 0;
  const hasOrderData = orderTypeStats && orderTypeStats.length > 0;

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[10px] font-bold"
      >
        {percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-zinc-900/95 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xl backdrop-blur-sm text-xs">
          <p className="font-bold text-gray-800 dark:text-zinc-150">{data.name}</p>
          <p className="text-blue-600 dark:text-blue-450 mt-1">
            Sales: <span className="font-bold">৳{data.value.toLocaleString()}</span>
          </p>
          <p className="text-gray-500 dark:text-zinc-400">
            Volume: <span className="font-bold">{data.count} transactions</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-6">
      {/* Chart 1: Payment Methods */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-lg border border-slate-100 dark:border-zinc-800/80 transition-all duration-300 hover:shadow-xl">
        <div className="mb-4">
          <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-zinc-100 tracking-tight">
            Payments Distribution
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Share of revenue by billing method (this month)
          </p>
        </div>
        
        {hasPaymentData ? (
          <div className="h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {paymentMethodStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconSize={10} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11 }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-gray-400 dark:text-zinc-500 text-sm">
            No payments recorded this month.
          </div>
        )}
      </div>

      {/* Chart 2: Order Types */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-lg border border-slate-100 dark:border-zinc-800/80 transition-all duration-300 hover:shadow-xl">
        <div className="mb-4">
          <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-zinc-100 tracking-tight">
            Dining Channels
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Share of revenue by dine-in, takeaway, or delivery
          </p>
        </div>

        {hasOrderData ? (
          <div className="h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderTypeStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  innerRadius={0}
                  outerRadius={90}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {orderTypeStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ORDER_COLORS[index % ORDER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconSize={10} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11 }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-gray-400 dark:text-zinc-500 text-sm">
            No order types recorded this month.
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPieCharts;
