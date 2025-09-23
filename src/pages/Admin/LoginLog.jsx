import React, { useState, useEffect, useCallback } from 'react';
import { FiXCircle } from 'react-icons/fi';
import { useDebounce } from 'use-debounce';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';

import UseAxiosSecure from '../../Hook/UseAxioSecure';
import useTotalBranch from '../../Hook/UseTotalBrach'; 
import Mtitle from '../../components library/Mtitle';
import Preloader from '../../components/Shortarea/Preloader';

const LoginLog = () => {
    const axiosSecure = UseAxiosSecure();
    
    // ✅ 2. Use the hook to get branches. Aliased loading/error to avoid conflicts.
    const { branches, loading: branchesLoading, error: branchesError } = useTotalBranch();

    // Data states (branches state is now removed)
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);

    // Filter states
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        branch: '',
        search: '',
        startDate: null,
        endDate: null,
        status: ''
    });
    const [debouncedSearch] = useDebounce(filters.search, 500);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: 10,
                branch: filters.branch,
                search: debouncedSearch,
                startDate: filters.startDate ? filters.startDate.toISOString() : '',
                endDate: filters.endDate ? filters.endDate.toISOString() : '',
                status: filters.status
            });
            // The backend no longer needs to send the branch list with this request
            const response = await axiosSecure.get(`/userlog/superadmin/?${params.toString()}`);
            setLogs(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    }, [axiosSecure, currentPage, filters, debouncedSearch]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };
    
    const resetFilters = () => {
        setFilters({ branch: '', search: '', startDate: null, endDate: null, status: '' });
        setCurrentPage(1);
    };

    const getSessionDuration = (login, logout) => {
        if (!logout) return "Active";
        const duration = moment.duration(moment(logout).diff(moment(login)));
        const hours = Math.floor(duration.asHours());
        const minutes = duration.minutes();
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Mtitle title="User Login Logs" />

            <div className="p-4 bg-white rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                {/* ✅ 3. Updated Branch Filter Dropdown */}
                <div className="form-control">
                    <label className="label-text">Branch</label>
                    <select 
                        value={filters.branch} 
                        onChange={(e) => handleFilterChange('branch', e.target.value)} 
                        className="select select-bordered w-full"
                        disabled={branchesLoading}
                    >
                        <option value="">
                            {branchesLoading ? 'Loading...' : 'All Branches'}
                        </option>
                        {branchesError && <option disabled>Error loading branches</option>}
                        {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                </div>
                {/* ... other filters remain the same ... */}
                 <div className="form-control">
                    <label className="label-text">Search User</label>
                    <input type="text" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} placeholder="Name or Email" className="input input-bordered w-full" />
                </div>
                <div className="form-control">
                    <label className="label-text">Start Date</label>
                    <DatePicker selected={filters.startDate} onChange={(date) => handleFilterChange('startDate', date)} className="input input-bordered w-full" />
                </div>
                 <div className="form-control">
                    <label className="label-text">End Date</label>
                    <DatePicker selected={filters.endDate} onChange={(date) => handleFilterChange('endDate', date)} className="input input-bordered w-full" minDate={filters.startDate} />
                </div>
                <div className="form-control">
                    <label className="label-text">Status</label>
                    <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="select select-bordered w-full">
                        <option value="">All</option>
                        <option value="active">Active Session</option>
                        <option value="logged_out">Logged Out</option>
                    </select>
                </div>
                <button onClick={resetFilters} className="btn btn-ghost col-span-full lg:col-span-1">
                    <FiXCircle className="mr-2" /> Reset
                </button>
            </div>
            
            {/* ... Table and Pagination remain the same ... */}
            {loading ? <Preloader /> : (
                <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                    <table className="table w-full">
                        <thead className='bg-blue-600 text-white'>
                            <tr>
                                <th>User</th>
                                <th>Branch</th>
                                <th>Role</th>
                                <th>Login Time</th>
                                <th>Logout Time</th>
                                <th>Duration</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log._id} className="hover">
                                    <td>
                                        <div>{log.username}</div>
                                        <div className="text-xs text-gray-500">{log.userEmail}</div>
                                    </td>
                                    <td>{log.branch}</td>
                                    <td className="capitalize">{log.role}</td>
                                    <td>{moment(log.loginTime).format('lll')}</td>
                                    <td>{log.logoutTime ? moment(log.logoutTime).format('lll') : '-'}</td>
                                    <td>{getSessionDuration(log.loginTime, log.logoutTime)}</td>
                                    <td>
                                        <span className={`badge ${!log.logoutTime ? 'badge-success' : 'badge-ghost'}`}>
                                            {!log.logoutTime ? 'Active' : 'Logged Out'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="flex justify-between items-center mt-6">
                <p>Showing page {pagination.currentPage} of {pagination.totalPages}</p>
                <div className="join">
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={pagination.currentPage === 1} className="join-item btn">«</button>
                    <button className="join-item btn">Page {pagination.currentPage}</button>
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={pagination.currentPage === pagination.totalPages} className="join-item btn">»</button>
                </div>
            </div>
        </div>
    );
};

export default LoginLog;