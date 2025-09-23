import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import useAxiosPublic from "../Hook/useAxiosPublic";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const axiosSecure = useAxiosPublic();
  const [branch, setBranch] = useState(() => {
    const storedBranch = localStorage.getItem("authBranch");
    return storedBranch || user?.branch || "teaxo";
  });
  const [clientIP, setClientIP] = useState(localStorage.getItem("clientIP") || "");

  useEffect(() => {
    const fetchClientIP = async () => {
      try {
        const response = await fetch("https://api64.ipify.org?format=json");
        const data = await response.json();
        setClientIP(data.ip);
        localStorage.setItem("clientIP", data.ip);
      } catch (error) {
        console.error("Error fetching IP address:", error);
      }
    };

    if (!clientIP) {
      fetchClientIP();
    }
  }, [clientIP]);

  const registerUser = async (email, password, name, branch) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.post("/user/post", {
        email,
        password,
        name,
        branch,
        clientIP,
      });
      return data;
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const response = await axiosSecure.post("/user/login", { email, password, clientIP });
      const data = response.data;

      setUser(data.user);
      setBranch(data.user.branch);
      localStorage.setItem("authUser", JSON.stringify(data.user));
      localStorage.setItem("authBranch", data.user.branch);
      localStorage.setItem("authToken", data.token);
    
      return data.user;
    } catch (error) {
    
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    setLoading(true);
    try {
      await axiosSecure.post("/user/logout", { email: user.email, clientIP });
      setUser(null);
      setBranch(user.branch);
      localStorage.removeItem("authUser");
      localStorage.removeItem("authBranch");
      localStorage.removeItem("authToken");
      localStorage.removeItem("clientIP");
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const authInfo = {
    user,
    loading,
    branch,
    clientIP,
    registerUser,
    loginUser,
    logoutUser,
    setUser,
  };

  return <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
