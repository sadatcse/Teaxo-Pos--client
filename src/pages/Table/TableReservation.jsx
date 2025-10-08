import React, { useState, useEffect, useContext, useCallback } from "react";
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { GoPlus } from "react-icons/go";
import { motion, AnimatePresence } from 'framer-motion';
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import Mpagination from "../../components library/Mpagination";
import MtableLoading from "../../components library/MtableLoading";
import useActionPermissions from "../../Hook/useActionPermissions";

const TableReservation = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch, user } = useContext(AuthContext);
       const { canPerform, loading: permissionsLoading } = useActionPermissions();
    const [reservations, setReservations] = useState([]);
    const [availableTables, setAvailableTables] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        table: "",
        startTime: "",
        endTime: "",
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        additionalInfo: "",
        branch: branch,
        status: "Pending",
    });
    const [editId, setEditId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));

    const fetchReservations = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosSecure.get(`/reservation/branch/${branch}`);
            const filtered = response.data.filter(res => {
                const resDate = new Date(res.startTime).toISOString().slice(0, 10);
                return resDate === filterDate;
            });
            setReservations(filtered);
        } catch (error) {
            console.error("Error fetching reservations:", error);
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "Failed to fetch reservations.",
            });
        }
        setLoading(false);
    }, [axiosSecure, branch, filterDate]);

    const fetchAvailableTables = useCallback(async () => {
        try {
            const response = await axiosSecure.get(`/table/branch/${branch}`);
            setAvailableTables(response.data);
        } catch (error) {
            console.error("Error fetching tables:", error);
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "Failed to fetch available tables.",
            });
        }
    }, [axiosSecure, branch]);

    useEffect(() => {
        if (branch) {
            fetchAvailableTables();
            fetchReservations();
        }
    }, [branch, fetchAvailableTables, fetchReservations]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddOrEditReservation = async () => {
            const requiredPermission = editId ? "edit" : "add";
    if (!canPerform("Table Reservations", requiredPermission)) {
        Swal.fire("Access Denied", `You do not have permission to ${requiredPermission} reservations.`, "error");
        return;
    }
        setIsLoading(true);
        try {
            const reservationData = {
                ...formData,
                bookedBy: user?.uid,
            };

            if (editId) {
                await axiosSecure.put(`/reservation/update/${editId}`, reservationData);
                Swal.fire("Updated!", "Reservation has been updated.", "success");
            } else {
                await axiosSecure.post(`/reservation/post`, reservationData);
                Swal.fire("Added!", "New reservation has been added.", "success");
            }
            fetchReservations();
            setIsModalOpen(false);
            resetFormData();
            setEditId(null);
        } catch (error) {
            console.error("Error saving reservation:", error);
            const errorMessage = error.response?.data?.message || "Failed to save reservation. Please try again.";
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (id) => {
            if (!canPerform("Table Reservations", "edit")) {
        Swal.fire("Access Denied", "You do not have permission to edit reservations.", "error");
        return;
    }
        const reservation = reservations.find((r) => r._id === id);
        if (reservation) {
            setEditId(id);
            const startTimeLocal = reservation.startTime ? new Date(reservation.startTime).toISOString().slice(0, 16) : "";
            const endTimeLocal = reservation.endTime ? new Date(reservation.endTime).toISOString().slice(0, 16) : "";

            setFormData({
                table: reservation.table?._id || "",
                startTime: startTimeLocal,
                endTime: endTimeLocal,
                customerName: reservation.customerName,
                customerPhone: reservation.customerPhone,
                customerEmail: reservation.customerEmail,
                additionalInfo: reservation.additionalInfo,
                branch: reservation.branch,
                status: reservation.status,
            });
            setIsModalOpen(true);
        }
    };

    const handleRemove = (id) => {
           if (!canPerform("Table Reservations", "delete")) {
        Swal.fire("Access Denied", "You do not have permission to delete reservations.", "error");
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
        }).then((result) => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/reservation/delete/${id}`)
                    .then(() => {
                        fetchReservations();
                        Swal.fire("Deleted!", "The reservation has been deleted.", "success");
                    })
                    .catch((error) => {
                        console.error("Error deleting reservation:", error);
                        Swal.fire("Error!", "Failed to delete reservation.", "error");
                    });
            }
        });
    };

    const resetFormData = () => {
        setFormData({
            table: "",
            startTime: "",
            endTime: "",
            customerName: "",
            customerPhone: "",
            customerEmail: "",
            additionalInfo: "",
            branch: branch,
            status: "Pending",
        });
    };

    const { paginatedData, paginationControls, rowsPerPageAndTotal } = Mpagination({ totalData: reservations });

    const inputClass = "w-full border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150";

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200">
   <Mtitle 
  title="Table Reservations" 
  middlecontent={
    <input
      type="date"
      value={filterDate}
      onChange={(e) => setFilterDate(e.target.value)}
      className={inputClass}
      title="Filter reservations by date"
    />
  }
  rightcontent={
     canPerform("Table Reservations", "add") && (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => { setIsModalOpen(true); resetFormData(); setEditId(null); }}
      className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-xl shadow-md hover:bg-blue-700 transition duration-300"
    >
      <GoPlus className="text-xl" /> Add New
    </motion.button>)
  }
/>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="card bg-base-100 shadow-xl mt-6"
            >
                <div className="p-4">
                    <div className="text-sm text-slate-700 mb-4">
                        {rowsPerPageAndTotal}
                    </div>

                    {loading ? <MtableLoading /> : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className='bg-blue-600 text-white uppercase text-xs font-medium tracking-wider'>
                                    <tr>
                                        <th className="p-3 rounded-tl-lg">Table Name</th>
                                        <th className="p-3">Customer Name</th>
                                        <th className="p-3">Contact</th>
                                        <th className="p-3">Time Slot</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3 text-center rounded-tr-lg">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {paginatedData.length === 0 ? (
                                            <tr><td colSpan="6" className="text-center py-8 text-slate-700">No reservations found for <span className="font-semibold">{filterDate}</span>.</td></tr>
                                        ) : (
                                            paginatedData.map((reservation) => (
                                                <motion.tr key={reservation._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-blue-50 border-b border-slate-200 last:border-b-0 text-sm text-slate-700">
                                                    <td className="p-3 font-medium">{reservation.table?.tableName || "N/A"}</td>
                                                    <td className="p-3">{reservation.customerName}</td>
                                                    <td className="p-3"><p>{reservation.customerPhone}</p>{reservation.customerEmail && <p className="text-xs text-slate-500">{reservation.customerEmail}</p>}</td>
                                                    <td className="p-3">{new Date(reservation.startTime).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })} - <br />{new Date(reservation.endTime).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</td>
                                                    <td className="p-3"><span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${reservation.status === 'Confirmed' ? 'bg-green-100 text-green-800' : reservation.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : reservation.status === 'Cancelled' ? 'bg-red-100 text-red-800' : reservation.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{reservation.status}</span></td>
                                            <td className="p-3 text-center">
    <div className="flex justify-center items-center gap-2">
        {canPerform("Table Reservations", "edit") && (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(reservation._id)} className="btn btn-circle btn-sm bg-yellow-600 hover:bg-yellow-700 text-white" title="Edit Reservation"><FiEdit /></motion.button>
        )}
        {canPerform("Table Reservations", "delete") && (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleRemove(reservation._id)} className="btn btn-circle btn-sm bg-red-600 hover:bg-red-700 text-white" title="Delete Reservation"><FiTrash2 /></motion.button>
        )}
    </div>
</td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                            <div className="pt-4">{paginationControls}</div>
                        </div>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-lg mx-auto">
                            <h2 className="text-xl font-semibold text-blue-600 mb-6">{editId ? "Edit Reservation" : "Add New Reservation"}</h2>
                            <form onSubmit={(e) => { e.preventDefault(); handleAddOrEditReservation(); }}>
                                <div className="space-y-4">
                                    {Object.entries({ table: "Table", startTime: "Start Time", endTime: "End Time", customerName: "Customer Name", customerPhone: "Customer Phone", customerEmail: "Customer Email", additionalInfo: "Additional Info", status: "Status" }).map(([key, label]) => {
                                        if (key === 'status' && !editId) return null;
                                        return (
                                            <div key={key}>
                                                <label htmlFor={key} className="block text-slate-700 text-sm font-semibold mb-2">{label}</label>
                                                {key === 'table' || key === 'status' ? (
                                                    <select id={key} name={key} value={formData[key]} onChange={handleInputChange} className={inputClass} required={key === 'table'}>
                                                        {key === 'table' ? (<><option value="">Select a Table</option>{availableTables.map(t => <option key={t._id} value={t._id}>{t.tableName}</option>)}</>) : (<><option>Pending</option><option>Confirmed</option><option>Cancelled</option><option>Completed</option></>)}
                                                    </select>
                                                ) : key === 'additionalInfo' ? (
                                                    <textarea id={key} name={key} value={formData[key]} onChange={handleInputChange} className={inputClass} rows="3" placeholder="e.g., Special requests" />
                                                ) : (
                                                    <input type={key.includes('Time') ? 'datetime-local' : key.includes('Email') ? 'email' : key.includes('Phone') ? 'tel' : 'text'} id={key} name={key} value={formData[key]} onChange={handleInputChange} className={inputClass} required={['startTime', 'endTime', 'customerName', 'customerPhone'].includes(key)} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-end gap-4 mt-8">
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={() => { setIsModalOpen(false); resetFormData(); setEditId(null); }} className="btn rounded-xl">Cancel</motion.button>
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="btn bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md" disabled={isLoading}>{isLoading ? "Saving..." : editId ? "Save Changes" : "Add Reservation"}</motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TableReservation;