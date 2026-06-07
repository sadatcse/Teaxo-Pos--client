


import React, { useContext, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import Preloader from "../../components/Shortarea/Preloader";
import { AuthContext } from "../../providers/AuthProvider";

const CounterReportDaily = () => {
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [data, setData] = useState([]);
  const [counter, setCounter] = useState("Counter 1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
    const { branch } = useContext(AuthContext);
  const axiosSecure = UseAxiosSecure();
     const [isLoading, setIsLoading] = useState(false);


  const handleSearch = async () => {
    setIsLoading(true);
    setLoading(true);
    setError("");
    try {
      const startDate = moment(fromDate).format("YYYY-MM-DD");
      const endDate = moment(toDate).format("YYYY-MM-DD");

      const response = await axiosSecure.get(
     `/invoice/${branch}/${counter}/date-range`,
        {
          params: { startDate, endDate },
        }
      );

      const transformedData = response.data.map((item, index) => ({
        id: index + 1,
        date: item.date,
        order: item.orderCount,
        quantity: item.totalQty,
        grandAmount: item.totalSubtotal,
        vat: item.totalVat,
        discount: item.totalDiscount,
        totalAmount: item.totalAmount,
      }));

      setData(transformedData);
      
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 min-h-screen bg-base-200 dark:bg-zinc-950 text-gray-800 dark:text-gray-200">
      <div className="border dark:border-zinc-800 rounded-lg p-4 shadow-sm bg-white dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">Counter Report (Daily)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-red-500 font-semibold mb-1">From (Date)</label>
            <DatePicker
              selected={fromDate}
              onChange={(date) => setFromDate(date)}
              className="border dark:border-zinc-700 rounded px-3 py-2 w-full dark:bg-zinc-800 dark:text-zinc-100"
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-red-500 font-semibold mb-1">To (Date)</label>
            <DatePicker
              selected={toDate}
              onChange={(date) => setToDate(date)}
              className="border dark:border-zinc-700 rounded px-3 py-2 w-full dark:bg-zinc-800 dark:text-zinc-100"
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-red-500 font-semibold mb-1">Select Counter</label>
            <select
              value={counter}
              onChange={(e) => setCounter(e.target.value)}
              className="border dark:border-zinc-700 rounded px-3 py-2 w-full dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none"
            >
              <option value="Counter 1">Counter 1</option>
              <option value="Counter 2">Counter 2</option>
              <option value="Counter 3">Counter 3</option>
              <option value="Counter 4">Counter 4</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white py-2 px-4 rounded shadow hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Loading..." : "Search"}
            </button>
          </div>
        </div>
      </div>
      <div>
        {isLoading ? (
          <Preloader />
        ) : (
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2 dark:text-zinc-200">
              From: {moment(fromDate).format("DD/MM/YYYY")} To: {moment(toDate).format("DD/MM/YYYY")}
            </h3>
            {error && <p className="text-red-500">{error}</p>}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border dark:border-zinc-800 text-left">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="p-3 border dark:border-zinc-700">SL.No</th>
                    <th className="p-3 border dark:border-zinc-700">Date</th>
                    <th className="p-3 border dark:border-zinc-700">Order</th>
                    <th className="p-3 border dark:border-zinc-700">Quantity</th>
                    <th className="p-3 border dark:border-zinc-700">Grand Amount</th>
                    <th className="p-3 border dark:border-zinc-700">Vat</th>
                    <th className="p-3 border dark:border-zinc-700">Discount</th>
                    <th className="p-3 border dark:border-zinc-700">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 ? (
                    data.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-100 dark:hover:bg-zinc-800/40 text-sm text-gray-700 dark:text-zinc-300">
                        <td className="p-3 border dark:border-zinc-800">{item.id}</td>
                        <td className="p-3 border dark:border-zinc-800">{item.date}</td>
                        <td className="p-3 border dark:border-zinc-800 text-center">{item.order}</td>
                        <td className="p-3 border dark:border-zinc-800 text-center">{item.quantity}</td>
                        <td className="p-3 border dark:border-zinc-800 text-right">{item.grandAmount.toFixed(2)}</td>
                        <td className="p-3 border dark:border-zinc-800 text-right">{item.vat.toFixed(2)}</td>
                        <td className="p-3 border dark:border-zinc-800 text-right">{item.discount.toFixed(2)}</td>
                        <td className="p-3 border dark:border-zinc-800 text-right">{item.totalAmount.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-3 border dark:border-zinc-800 text-center dark:text-zinc-400" colSpan="8">
                        {loading ? "Loading data..." : "No data available"}
                      </td>
                    </tr>
                  )}
                  {data.length > 0 && (
                    <tr className="font-bold dark:bg-zinc-800 dark:text-zinc-200">
                      <td className="p-3 border dark:border-zinc-800" colSpan={3}>
                        Total
                      </td>
                      <td className="p-3 border dark:border-zinc-800 text-center">
                        {data.reduce((sum, item) => sum + item.quantity, 0)}
                      </td>
                      <td className="p-3 border dark:border-zinc-800 text-right">
                        {data.reduce((sum, item) => sum + item.grandAmount, 0).toFixed(2)}
                      </td>
                      <td className="p-3 border dark:border-zinc-800 text-right">
                        {data.reduce((sum, item) => sum + item.vat, 0).toFixed(2)}
                      </td>
                      <td className="p-3 border dark:border-zinc-800 text-right">
                        {data.reduce((sum, item) => sum + item.discount, 0).toFixed(2)}
                      </td>
                      <td className="p-3 border dark:border-zinc-800 text-right">
                        {data.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CounterReportDaily;
