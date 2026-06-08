import { useState, useEffect, useContext } from "react";
import UseAxiosSecure from "./UseAxioSecure";
import { AuthContext } from "../providers/AuthProvider";
import { dbBulkPut, dbGetAll } from "../utilities/db";

const CategroieHook = () => {
  const [categories, setCategories] = useState([]);
  const [categoryNames, setCategoryNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosSecure = UseAxiosSecure();
  const { branch } = useContext(AuthContext);

  useEffect(() => {
    if (!branch) return;

    const fetchActiveCategories = async () => {
      try {
        const response = await axiosSecure.get(`/category/${branch}/active`);
        const sortedCategories = response.data.sort((a, b) => a.serial - b.serial);
        const categoryData = sortedCategories.map((category) => category.categoryName);

        // Store to IndexedDB
        await dbBulkPut('categories', sortedCategories);

        setCategoryNames(sortedCategories);
        setCategories(categoryData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching categories, falling back to IndexedDB:", err);
        // Fallback to IndexedDB
        try {
          const cached = await dbGetAll('categories');
          if (cached && cached.length > 0) {
            const sortedCategories = cached.sort((a, b) => a.serial - b.serial);
            const categoryData = sortedCategories.map((category) => category.categoryName);
            setCategoryNames(sortedCategories);
            setCategories(categoryData);
          } else {
            setError(err.message);
          }
        } catch (dbErr) {
          setError(err.message);
        }
        setLoading(false);
      }
    };

    fetchActiveCategories();
  }, [branch, axiosSecure]); 

  return { categoryNames, categories, loading, error };
};

export default CategroieHook;
