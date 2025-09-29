import React, { useState, useEffect, useContext, useCallback } from 'react';
import Mtitle from '../../components library/Mtitle';
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from '../../providers/AuthProvider';
import MtableLoading from '../../components library/MtableLoading';
import Mpagination from '../../components library/Mpagination';

const AttendanceReport = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const [records, setRecords] = useState([]);
    const [pagination, setPagination] = useState({});
    const [isPageLoading, setPageLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        page: 1,
    });

    const fetchAttendance = useCallback(async () => {
        setPageLoading(true);
        try {
            const response = await axiosSecure.get('/attendance', {
                params: { ...filters, branch, limit: 10 }
            });
            setRecords(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error("Error fetching attendance records:", error);
        } finally {
            setPageLoading(false);
        }
    }, [axiosSecure, branch, filters]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({...prev, page: newPage}));
    }

    const { paginatedData, paginationControls } = Mpagination({ 
        totalData: records, 
        manualPagination: { ...pagination, onPageChange: handlePageChange } 
    });


    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-base-200 min-h-screen">
            <Mtitle title="Employee Attendance Report" />

            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                    <div className="flex flex-wrap items-end gap-4 mb-6">
                        <div className="form-control">
                            <label className="label"><span className="label-text">Start Date</span></label>
                            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="input input-bordered" />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">End Date</span></label>
                            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="input input-bordered" />
                        </div>
                    </div>

                    {isPageLoading ? <MtableLoading /> : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className="bg-blue-600 text-white">
                                    <tr>
                                        <th>Employee</th>
                                        <th>Check-in Time</th>
                                        <th>Check-out Time</th>
                                        <th>Duration</th>
                                        <th>Device SN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map(rec => (
                                        <tr key={rec._id} className="hover">
                                            <td>
                                                <div className="flex items-center space-x-3">
                                                    <div className="avatar">
                                                        <div className="mask mask-squircle w-12 h-12">
                                                            <img src={rec.userId.photo || `https://ui-avatars.com/api/?name=${rec.userId.name}`} alt="Avatar" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">{rec.userId.name}</div>
                                                        <div className="text-sm opacity-50">{rec.userId.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{new Date(rec.checkInTime).toLocaleString()}</td>
                                            <td>{rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleString() : <span className="badge badge-warning">Checked In</span>}</td>
                                            <td>{rec.duration || '-'}</td>
                                            <td><span className="badge badge-ghost badge-sm">{rec.deviceSn}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                             <div className="pt-4">{paginationControls}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceReport;