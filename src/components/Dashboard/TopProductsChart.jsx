import React from "react";
import { FaUtensils } from "react-icons/fa";

const TopProductsChart = ({ topProducts }) => {
  const hasData = topProducts && topProducts.length > 0;
  
  // Find maximum quantity to determine progress bar widths
  const maxQty = hasData ? Math.max(...topProducts.map((p) => p.qty)) : 0;

  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-lg border border-slate-100 dark:border-zinc-800/80 transition-all duration-300 hover:shadow-xl h-full flex flex-col justify-between">
      <div>
        <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-zinc-100 tracking-tight">
          Top Selling Items
        </h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 mb-6">
          Most popular dishes by quantity sold this month
        </p>

        {hasData ? (
          <div className="space-y-4">
            {topProducts.map((product, idx) => {
              const percentage = maxQty > 0 ? (product.qty / maxQty) * 100 : 0;
              
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-sm font-semibold text-gray-750 dark:text-zinc-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 dark:text-zinc-500">#{idx + 1}</span>
                      <span className="truncate max-w-[150px] md:max-w-[180px]">{product.name}</span>
                    </div>
                    <div className="text-xs text-right">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{product.qty} sold</span>
                      <span className="text-gray-400 dark:text-zinc-550 mx-1">|</span>
                      <span className="text-gray-500 dark:text-zinc-400 font-medium">৳{product.sale.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800/60 rounded-full h-2">
                    <div
                      className="bg-blue-500 dark:bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-zinc-500 text-sm">
            <FaUtensils size={36} className="mb-2 opacity-20" />
            <p>No product sales recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopProductsChart;
