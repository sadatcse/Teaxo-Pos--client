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
    const { branches, loading: branchesLoading, error: branchesError } = useTotalBranch();

    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);

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
        <div className="p-6 bg-slate-50 dark:bg-slate-955 min-h-screen transition-colors duration-300">
            <Mtitle title="User Login Logs" />

            {/* Filters */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end transition-colors">
                <div className="form-control w-full">
                    <label className="label py-1"><span className="label-text font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase">Branch</span></label>
                    <select 
                        value={filters.branch} 
                        onChange={(e) => handleFilterChange('branch', e.target.value)} 
                        className="select select-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                        disabled={branchesLoading}
                    >
                        <option value="">
                            {branchesLoading ? 'Loading...' : 'All Branches'}
                        </option>
                        {branchesError && <option disabled>Error loading branches</option>}
                        {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                </div>
                <div className="form-control w-full">
                    <label className="label py-1"><span className="label-text font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase">Search User</span></label>
                    <input type="text" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} placeholder="Name or Email" className="input input-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200" />
                </div>
                <div className="form-control w-full">
                    <label className="label py-1"><span className="label-text font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase">Start Date</span></label>
                    <DatePicker selected={filters.startDate} onChange={(date) => handleFilterChange('startDate', date)} className="input input-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200" />
                </div>
                 <div className="form-control w-full">
                    <label className="label py-1"><span className="label-text font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase">End Date</span></label>
                    <DatePicker selected={filters.endDate} onChange={(date) => handleFilterChange('endDate', date)} className="input input-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200" minDate={filters.startDate} />
                </div>
                <div className="form-control w-full">
                    <label className="label py-1"><span className="label-text font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase">Status</span></label>
                    <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="select select-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                        <option value="">All</option>
                        <option value="active">Active Session</option>
                        <option value="logged_out">Logged Out</option>
                    </select>
                </div>
                <button onClick={resetFilters} className="btn bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-none rounded-xl text-slate-750 dark:text-slate-200 col-span-full lg:col-span-1 mt-2">
                    <FiXCircle className="mr-2" /> Reset
                </button>
            </div>
            
            {loading ? <Preloader /> : (
                <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 transition-colors">
                    <table className="table w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-655 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="p-4 text-sm font-bold">User</th>
                                <th className="p-4 text-sm font-bold">Branch</th>
                                <th className="p-4 text-sm font-bold">Role</th>
                                <th className="p-4 text-sm font-bold">Login Time</th>
                                <th className="p-4 text-sm font-bold">Logout Time</th>
                                <th className="p-4 text-sm font-bold">Duration</th>
                                <th className="p-4 text-sm font-bold text-right rounded-tr-2xl">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-350 transition-colors text-sm">
                                    <td className="p-4">
                                        <div className="font-semibold text-slate-850 dark:text-slate-200">{log.username}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{log.userEmail}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none font-medium">
                                            {log.branch}
                                        </span>
                                    </td>
                                    <td className="p-4 capitalize font-medium">{log.role}</td>
                                    <td className="p-4 text-slate-500 dark:text-slate-400">{moment(log.loginTime).format('lll')}</td>
                                    <td className="p-4 text-slate-500 dark:text-slate-400">{log.logoutTime ? moment(log.logoutTime).format('lll') : '-'}</td>
                                    <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{getSessionDuration(log.loginTime, log.logoutTime)}</td>
                                    <td className="p-4 text-right">
                                        <span className={`badge ${!log.logoutTime ? 'badge-success text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'} border-none font-medium`}>
                                            {!log.logoutTime ? 'Active' : 'Logged Out'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 text-slate-600 dark:text-slate-400">
                <p className="text-sm font-medium">Showing page {pagination.currentPage || 1} of {pagination.totalPages || 1}</p>
                <div className="join">
                    <button 
                        onClick={() => setCurrentPage(p => p - 1)} 
                        disabled={pagination.currentPage === 1} 
                        className="join-item btn bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300 disabled:opacity-50"
                    >
                        «
                    </button>
                    <button className="join-item btn bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:text-slate-300 cursor-default">
                        Page {pagination.currentPage || 1}
                    </button>
                    <button 
                        onClick={() => setCurrentPage(p => p + 1)} 
                        disabled={pagination.currentPage === pagination.totalPages} 
                        className="join-item btn bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300 disabled:opacity-50"
                    >
                        »
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginLog;