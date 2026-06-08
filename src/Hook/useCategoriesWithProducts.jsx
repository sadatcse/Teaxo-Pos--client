// src/Hook/useCategoriesWithProducts.js (or wherever you prefer to keep your hooks)
import { useState, useEffect, useCallback } from "react";
import UseAxiosSecure from "./UseAxioSecure"; // Assuming UseAxiosSecure is in the same 'Hook' directory
import { toast } from "react-toastify";
import { dbBulkPut, dbGetAll, dbClear } from "../utilities/db";

const useCategoriesWithProducts = (branch) => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]); // State to hold unique categories
  const [loadingProducts, setLoadingProducts] = useState(true); // Renamed from 'loading' to be more specific

  const axiosSecure = UseAxiosSecure();

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const response = await axiosSecure.get(`/product/branch/${branch}/get-all/`);
      const data = response.data;
      const availableProducts = data.filter((product) => product.status === "available");
      
      // Cache in IndexedDB (clear old ones first to prevent duplicates / stale items)
      await dbClear('products');
      await dbBulkPut('products', availableProducts);

      setProducts(availableProducts);

      // Extract unique categories from available products
      const uniqueCategories = [...new Set(availableProducts.map((p) => p.category))];
      setCategories(uniqueCategories);

      if (uniqueCategories.length > 0) {
        setSelectedCategory(uniqueCategories[0]); // Set first category as default
      }
      setLoadingProducts(false);
    } catch (error) {
      console.error("Error fetching products, checking IndexedDB cache:", error);
      
      try {
        const cachedProducts = await dbGetAll('products');
        if (cachedProducts && cachedProducts.length > 0) {
          setProducts(cachedProducts);
          const uniqueCategories = [...new Set(cachedProducts.map((p) => p.category))];
          setCategories(uniqueCategories);
          if (uniqueCategories.length > 0) {
            setSelectedCategory(uniqueCategories[0]);
          }
          toast.info("Loaded products from offline cache.");
        } else {
          toast.error("Failed to load products. You are offline and cache is empty.");
        }
      } catch (dbErr) {
        toast.error("Failed to load products from database cache.");
      }
      setLoadingProducts(false);
    }
  }, [axiosSecure, branch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products based on the selected category
  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  return {
    products: filteredProducts, // Return filtered products
    categories,
    selectedCategory,
    setSelectedCategory,
    loadingProducts,
    fetchProducts, // Expose fetchProducts if you need to re-fetch manually
  };
};

export default useCategoriesWithProducts;