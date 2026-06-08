import { useState, useEffect, useContext, useCallback } from "react";
import UseAxiosSecure from "./UseAxioSecure";
import { AuthContext } from "../providers/AuthProvider";
import { dbBulkPut, dbPut, dbGetAll, dbClear } from "../utilities/db";

const useCustomerTableSearch = () => {
  const [customer, setCustomer] = useState(null);
  const [tables, setTables] = useState([]);
  const [users, setUsers] = useState([]); // State for the user list
  const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const axiosSecure = UseAxiosSecure();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { branch } = useContext(AuthContext);

  // Fetch tables based on branch
  const fetchTables = useCallback(async () => {
    if (!branch) return;
    try {
      const response = await axiosSecure.get(`/tablecombine/tables/status/${branch}`);
      setTables(response.data);
      // Cache tables in IndexedDB
      await dbClear('tables');
      await dbBulkPut('tables', response.data);
    } catch (error) {
      console.error("Error fetching tables, checking IndexedDB cache:", error);
      
      const generateDefaultTables = () => {
        return Array.from({ length: 16 }, (_, i) => ({
          _id: `offline_table_${i + 1}`,
          tableName: `Table ${i + 1}`,
          branch: branch,
          status: 'free'
        }));
      };

      try {
        const cachedTables = await dbGetAll('tables');
        if (cachedTables && cachedTables.length > 0) {
          const branchTables = cachedTables.filter(t => t.branch === branch);
          if (branchTables.length > 0) {
            setTables(branchTables);
          } else {
            setTables(cachedTables);
          }
        } else {
          console.log("No tables in offline cache. Generating default tables...");
          setTables(generateDefaultTables());
        }
      } catch (dbErr) {
        console.error("Failed to load tables from database cache:", dbErr);
        setTables(generateDefaultTables());
      }
    }
  }, [axiosSecure, branch]);

  // Fetch users based on branch
  const fetchUsers = useCallback(async () => {
    if (!branch) return;
    try {
      const response = await axiosSecure.get(`/user/${branch}/get-all`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [axiosSecure, branch]);


  useEffect(() => {
    const initFetch = async () => {
      setLoading(true);
      await Promise.allSettled([fetchTables(), fetchUsers()]);
      setLoading(false);
    };
    initFetch();
  }, [fetchTables, fetchUsers]);

  const searchCustomer = async (mobile) => {
    try {
      const response = await axiosSecure.get(`/customer/branch/${branch}/search?mobile=${mobile}`);
      setCustomerModalOpen(false);

      if (Array.isArray(response.data) && response.data.length > 0) {
        const foundCustomer = response.data[0];
        setCustomer(foundCustomer);
        // Cache customer in IndexedDB
        await dbPut('customers', foundCustomer);
      } else {
        setCustomer(null);
        setCustomerModalOpen(true);
      }
    } catch (error) {
      console.error("Error searching customer, checking IndexedDB cache:", error);
      try {
        const cachedCustomers = await dbGetAll('customers');
        const matchedCustomer = cachedCustomers.find(
          (c) => c.branch === branch && c.mobile === mobile
        );
        if (matchedCustomer) {
          setCustomer(matchedCustomer);
          setCustomerModalOpen(false);
        } else {
          setCustomer(null);
          setCustomerModalOpen(true);
        }
      } catch (dbErr) {
        console.error("Failed to lookup customer from IndexedDB:", dbErr);
        setCustomer(null);
        setCustomerModalOpen(true);
      }
    }
  };

  const addNewCustomer = async (customerData) => {
    try {
      const response = await axiosSecure.post("/customer/post", customerData);
      const newCust = response.data;
      setCustomer(newCust);
      // Cache customer in IndexedDB
      await dbPut('customers', newCust);
      setCustomerModalOpen(false);
      return newCust;
    } catch (error) {
      console.error("Error adding customer, checking offline fallback:", error);

      if (error.response) {
        const { status, data } = error.response;
        if (status === 401 || status === 402) {
          setError(data.error);
          return null;
        }
      }

      // Offline creation logic fallback
      try {
        const localId = 'local_cust_' + Date.now();
        const localCustomer = {
          ...customerData,
          _id: localId,
          isSyncPending: true
        };
        await dbPut('customers', localCustomer);
        setCustomer(localCustomer);
        setError(null);
        setCustomerModalOpen(false);
        return localCustomer;
      } catch (dbErr) {
        console.error("Failed to save customer offline:", dbErr);
        setError("Network error and local DB save failed. Please try again.");
        return null;
      }
    }
  };

  return {
    customer,
    setCustomer,
    tables,
    users, // Expose the users list
    isCustomerModalOpen,
    selectedTable,
    searchCustomer,
    addNewCustomer,
    setSelectedTable,
    error,
    loading,
    setCustomerModalOpen,
    fetchUsers, // You can also expose the fetch function if needed
  };
};

export default useCustomerTableSearch;