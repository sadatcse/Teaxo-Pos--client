import { useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import swalHelper from "../utilities/swalHelper";

const axiosSecure = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}`,
});

const UseAxiosSecure = () => {
  const { user, branch, clientIP, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const useremail = user?.email || "Unknown User";
  const username = user?.name || "Unknown User";
  const userBranch = branch || "Unknown Branch";
  const userIP = clientIP || "Unknown IP";

  useEffect(() => {
    const requestInterceptor = axiosSecure.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Attach user data in headers for every request
        config.headers["X-User-Email"] = useremail;
        config.headers["X-User-Name"] = username;
        config.headers["X-User-Branch"] = userBranch;
        config.headers["X-User-IP"] = userIP;

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axiosSecure.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          console.error("Unauthorized or Token expired");
          swalHelper.warning("Session Expired", "Please login again to continue.");
          if (logoutUser) {
            await logoutUser();
          }
          navigate("/");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosSecure.interceptors.request.eject(requestInterceptor);
      axiosSecure.interceptors.response.eject(responseInterceptor);
    };
  }, [useremail, username, userBranch, userIP, logoutUser, navigate]);

  return axiosSecure;
};

export default UseAxiosSecure;

