// src/Hook/useCategoriesWithProducts.js (or wherever you prefer to keep your hooks)
import { useState, useEffect, useCallback } from "react";
import UseAxiosSecure from "./UseAxioSecure"; // Assuming UseAxiosSecure is in the same 'Hook' directory
import { toast } from "react-toastify";

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
      setProducts(availableProducts);

      // Extract unique categories from available products
      const uniqueCategories = [...new Set(availableProducts.map((p) => p.category))];
      setCategories(uniqueCategories);

      if (uniqueCategories.length > 0) {
        setSelectedCategory(uniqueCategories[0]); // Set first category as default
      }
      setLoadingProducts(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products.");
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