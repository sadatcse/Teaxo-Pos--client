import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types"; // Import PropTypes for type-checking
import useAxiosSecure from "../Hook/UseAxioSecure"; // Import your axios instance

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Retrieve user from localStorage on initialization
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(false); // Set initial loading to false
  const axiosSecure = useAxiosSecure(); // Use the configured axios instance
  const [branch, setBranch] = useState(() => {
    // Retrieve branch from localStorage on initialization
    const storedBranch = localStorage.getItem("authBranch");
    return storedBranch || "teaxo";
  });

  // Register a new user
  const registerUser = async (email, password, name, branch) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.post("/user/post", {
        email,
        password,
        name,
        branch,
      });
      return data;
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Log in a user
  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await axiosSecure.post("/user/login", {
        email,
        password,
      });
      setUser(data.user);
      setBranch(data.user.branch);
      // Save user and branch in localStorage
      localStorage.setItem("authUser", JSON.stringify(data.user));
      localStorage.setItem("authBranch", data.user.branch);
      return data.user;
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Log out the user
  const logoutUser = () => {
    setUser(null); // Reset user state
    setBranch("teaxo"); // Reset branch state
    localStorage.removeItem("authUser"); // Clear user from localStorage
    localStorage.removeItem("authBranch"); // Clear branch from localStorage
  };

  // Use effect to keep user and branch state in sync with localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    const storedBranch = localStorage.getItem("authBranch");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedBranch) {
      setBranch(storedBranch);
    }
  }, []);

  const authInfo = {
    user,
    loading,
    branch,
    registerUser,
    loginUser,
    logoutUser,
  };

  console.log("Auth Context in AuthProvider:", authInfo);

  return <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired, // Marked as required for clarity
};

export default AuthProvider;
