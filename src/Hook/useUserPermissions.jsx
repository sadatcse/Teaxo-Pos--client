// src/Hook/useUserPermissions.js
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../providers/AuthProvider";
import UseAxiosSecure from "./UseAxioSecure";

const useUserPermissions = () => {
  const { user } = useContext(AuthContext);
  const axiosSecure = UseAxiosSecure();

  const [allowedRoutes, setAllowedRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user || !user.role || !user.branch) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const response = await axiosSecure.get(`/permissions/${user.role}?branch=${user.branch}`);
        
        // Filter for allowed routes and extract their paths
        const allowedPaths = response.data.routesData
          .filter(permission => permission.isAllowed)
          .map(permission => permission.path);
        
        setAllowedRoutes(allowedPaths);
      } catch (err) {
        console.error("Failed to fetch user permissions:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user, axiosSecure]);

  return { allowedRoutes, loading, error };
};

export default useUserPermissions;