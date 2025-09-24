import { useState, useEffect, useContext } from 'react';
import UseAxiosSecure from './UseAxioSecure';
import { AuthContext } from '../providers/AuthProvider';

// A simple hook to fetch available roles for the dropdown
const useGetRoles = () => {
    const [roles, setRoles] = useState([]);
    const { user } = useContext(AuthContext);
    const axiosSecure = UseAxiosSecure();

    useEffect(() => {
        const fetchRoles = async () => {
            if (user?.branch) {
                try {
                    // This endpoint now exists and will be called
                    const response = await axiosSecure.get(`/user/roles/${user.branch}`);
                    setRoles(response.data); 
                } catch (error) {
                    console.error("Failed to fetch roles", error);
                    // Add default roles as a fallback
                    setRoles(['admin', 'manager', 'user']);
                }
            }
        };
        fetchRoles();
    }, [user, axiosSecure]);

    return roles;
};

export default useGetRoles;
