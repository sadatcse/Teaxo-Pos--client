import React, { useState, useEffect, useContext, useCallback } from "react";
import { FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Swal from "sweetalert2";
import { motion, AnimatePresence } from 'framer-motion';
import { ColorRing } from "react-loader-spinner";
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";

const MtableLoading = () => (
    <div className="flex justify-center items-center w-full h-full py-28">
        <ColorRing
            visible={true}
            height="80"
            width="80"
            ariaLabel="color-ring-loading"
            wrapperClass="color-ring-wrapper"
            colors={["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"]}
        />
    </div>
);

const UserAccess = () => {
    const [userLogs, setUserLogs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const axiosSecure = UseAxiosSecure();
    const { user, branch } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserLogs = useCallback(async (page) => {
        setIsLoading(true);
        try {
            const response = await axiosSecure.get(`/userlog/paginated?branch=${branch}&page=${page}&limit=10`);
            const { logs, totalPages } = response.data;
            setUserLogs(logs);
            setTotalPages(totalPages);
            setCurrentPage(page);
        } catch (error) {
            console.error("Error fetching user logs:", error);
        } finally {
            setIsLoading(false);
        }
    }, [axiosSecure, branch]);

    useEffect(() => {
        fetchUserLogs(currentPage);
    }, [fetchUserLogs, currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleDelete = async (id) => {
        if (user.role !== "admin") {
            Swal.fire({
                title: "Access Denied!",
                text: "You do not have permission to delete user logs.",
                icon: "error",
                confirmButtonColor: "#d33",
                confirmButtonText: "OK",
            });
            return;
        }

        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosSecure.delete(`/userlog/delete/${id}`);
                    Swal.fire("Deleted!", "The user log has been deleted.", "success");
                    fetchUserLogs(currentPage);
                } catch (error) {
                    console.error("Error deleting user log:", error);
                    Swal.fire("Error!", "Failed to delete the user log.", "error");
                }
            }
        });
    };
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200">
            <Mtitle title="User Access Logs" />
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5 }}
                className="card bg-base-100 shadow-xl mt-6"
            >
                <div className="card-body p-4 sm:p-6">
                    {isLoading ? <MtableLoading /> : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className="bg-blue-600 text-white uppercase text-xs">
                                    <tr>
                                        {["#", "User Email", "Username", "Role", "Login Time", "Logout Time", "Actions"].map((h, i) => (
                                            <th key={h} className={`p-3 ${i === 0 && 'rounded-tl-lg'} ${i === 6 && 'rounded-tr-lg text-center'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {userLogs.length === 0 ? (
                                            <tr><td colSpan="7" className="text-center py-12 text-slate-700">No logs found.</td></tr>
                                        ) : (
                                            userLogs.map((log, index) => (
                                                <motion.tr key={log._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-blue-50 border-b border-slate-200 text-sm text-slate-700">
                                                    <td className="p-3">{(currentPage - 1) * 10 + index + 1}</td>
                                                    <td className="p-3">{log.userEmail}</td>
                                                    <td className="p-3">{log.username}</td>
                                                    <td className="p-3 capitalize">{log.role}</td>
                                                    <td className="p-3">{log.loginTime ? new Date(log.loginTime).toLocaleString() : "N/A"}</td>
                                                    <td className="p-3">{log.logoutTime ? new Date(log.logoutTime).toLocaleString() : "N/A"}</td>
                                                    <td className="p-3 text-center">
                                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(log._id)} className="btn btn-circle btn-sm bg-red-600 hover:bg-red-700 text-white" title="Delete Log">
                                                            <FiTrash2 />
                                                        </motion.button>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                            <div className="flex justify-center mt-6">
                                <div className="join">
                                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="join-item btn btn-sm"><FiChevronLeft /></button>
                                    <button className="join-item btn btn-sm btn-active bg-blue-600 text-white hover:bg-blue-700">Page {currentPage} of {totalPages}</button>
                                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="join-item btn btn-sm"><FiChevronRight /></button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default UserAccess;