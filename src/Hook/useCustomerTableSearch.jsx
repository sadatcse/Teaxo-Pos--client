import { useState, useEffect, useContext, useCallback } from "react";
import UseAxiosSecure from "./UseAxioSecure";
import { AuthContext } from "../providers/AuthProvider";

const useCustomerTableSearch = () => {
  const [customer, setCustomer] = useState(null);
  const [tables, setTables] = useState([]);
  const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const axiosSecure = UseAxiosSecure();
  const [error, setError] = useState(null);
  const { branch } = useContext(AuthContext);

  // ✅ Wrap in useCallback to avoid useEffect dependency warning
  const fetchTables = useCallback(async () => {
    try {
      const response = await axiosSecure.get(`/tablecombine/tables/status/${branch}`);
      setTables(response.data);
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  }, [axiosSecure, branch]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const searchCustomer = async (mobile) => {
    try {
      const response = await axiosSecure.get(`/customer/branch/${branch}/search?mobile=${mobile}`);
      setCustomerModalOpen(false);

      if (Array.isArray(response.data) && response.data.length > 0) {
        setCustomer(response.data[0]);
      } else {
        setCustomer(null);
        setCustomerModalOpen(true);
      }
    } catch (error) {
      console.error("Error searching customer:", error);
    }
  };

  const addNewCustomer = async (customerData) => {
    try {
      const response = await axiosSecure.post("/customer/post", customerData);
      setCustomer(response.data);
      setCustomerModalOpen(false);
    } catch (error) {
      console.error("Error adding customer:", error);

      if (error.response) {
        const { status, data } = error.response;
        if (status === 401 || status === 402) {
          setError(data.error);
        } else {
          setError("Failed to add customer. Please try again.");
        }
      } else {
        setError("Network error. Please try again.");
      }
    }
  };

  return {
    customer,
    tables,
    isCustomerModalOpen,
    selectedTable,
    searchCustomer,
    addNewCustomer,
    setSelectedTable,
    error,
    setCustomerModalOpen,
  };
};

export default useCustomerTableSearch;
