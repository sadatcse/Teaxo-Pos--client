// TrendingOrders.jsx

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from "../../providers/AuthProvider"; // Adjust the path as needed
import UseAxiosSecure from "../../Hook/UseAxioSecure"; // Adjust the path as needed

const TrendingOrders = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { branch } = useContext(AuthContext);
  const axiosSecure = UseAxiosSecure();

  useEffect(() => {
    if (!branch) {
      setIsLoading(false);
      return;
    };

    const fetchTrendingOrders = async () => {
      try {
        setIsLoading(true);
        const res = await axiosSecure.get(`/invoice/${branch}/trending-orders`);
        setTrendingProducts(res.data);
      } catch (error) {
        console.error("Failed to fetch trending orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingOrders();
  }, [branch, axiosSecure]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md border dark:border-zinc-800 w-full">
        <h3 className="text-sm font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-4">
          Trending Orders
        </h3>
        <p className="text-gray-500 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-lg shadow-md border dark:border-zinc-800 w-full">
      <h3 className="text-sm font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-4">
        Trending Orders
      </h3>
      {trendingProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {trendingProducts.map((product, index) => (
            <div key={index} className="bg-white dark:bg-zinc-950 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
              <img
                src={product.imgSrc}
                alt={product.name}
                className="w-full h-32 sm:h-40 object-cover"
              />
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-bold text-gray-800 dark:text-zinc-100">{product.name}</p>
                  <p className="font-semibold text-green-600 dark:text-emerald-400">
                    {product.price.toLocaleString('en-US', { style: 'currency', currency: 'BDT' })}
                  </p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <p className="text-gray-500 dark:text-zinc-400">
                    Orders <span className="font-medium text-gray-700 dark:text-zinc-300">{product.orders}</span>
                  </p>
                  <p className="text-gray-500 dark:text-zinc-400">
                    Income <span className="font-medium text-gray-700 dark:text-zinc-300">
                      {product.income.toLocaleString('en-US', { style: 'currency', currency: 'BDT' })}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-zinc-400">No trending orders found for this branch.</p>
      )}
    </div>
  );
};

export default TrendingOrders;