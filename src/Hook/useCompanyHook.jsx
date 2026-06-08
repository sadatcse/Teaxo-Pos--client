import { useState, useEffect, useContext } from "react";
import UseAxiosSecure from "./UseAxioSecure";
import { AuthContext } from "../providers/AuthProvider"; // Assuming branch is provided in AuthContext
import { dbPut, dbGet } from "../utilities/db";

const useCompanyHook = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosSecure = UseAxiosSecure();
  const { branch } = useContext(AuthContext); // Assuming AuthContext provides the branch

  useEffect(() => {
    const fetchCompaniesByBranch = async () => {
      try {
        const response = await axiosSecure.get(`/company/branch/${branch}`);
        
        // Save to IndexedDB (key is branch name)
        await dbPut('systemSettings', { branch: branch, data: response.data });
        
        setCompanies(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching company details, falling back to IndexedDB:", err);
        try {
          const cached = await dbGet('systemSettings', branch);
          if (cached && cached.data) {
            setCompanies(cached.data);
          } else {
            setError(err.message);
          }
        } catch (dbErr) {
          setError(err.message);
        }
        setLoading(false);
      }
    };

    if (branch) {
      fetchCompaniesByBranch();
    }
  }, [branch, axiosSecure]);

  return { companies, loading, error };
};

export default useCompanyHook;
