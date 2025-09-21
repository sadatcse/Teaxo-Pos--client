import { useState, useEffect, useContext } from "react";
import UseAxiosSecure from "./UseAxioSecure";  
import { AuthContext } from "../providers/AuthProvider";

const useIngredientCategories = () => {

  const [ingredientCategories, setIngredientCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const axiosSecure = UseAxiosSecure();
  const { branch } = useContext(AuthContext);

  useEffect(() => {
    // Define the async function to fetch data
    const fetchIngredientCategories = async () => {
      try {
        // Make the GET request using the dynamic branch value
        const response = await axiosSecure.get(`/ingredient-category/${branch}/get-all`);
        setIngredientCategories(response.data);
      } catch (err) {
        // Set the error message if the request fails
        setError(err.message);
      } finally {
        // Set loading to false in both success and error cases
        setLoading(false);
      }
    };

    // Only run the fetch function if a branch value exists
    if (branch) {
      fetchIngredientCategories();
    }
  }, [branch, axiosSecure]); // Re-run the effect if branch or axiosSecure changes

  // Return the data, loading state, and error state
  return { ingredientCategories, loading, error };
};

export default useIngredientCategories;