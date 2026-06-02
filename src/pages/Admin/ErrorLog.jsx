import React, { useState, useEffect, useCallback } from 'react';
import { FiEye, FiXCircle } from 'react-icons/fi';
import { useDebounce } from 'use-debounce';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';

import UseAxiosSecure from '../../Hook/UseAxioSecure';
import useTotalBranch from '../../Hook/UseTotalBrach';
import Mtitle from '../../components library/Mtitle';
import Preloader from '../../components/Shortarea/Preloader';

const ErrorLog = () => {
    const axiosSecure = UseAxiosSecure();
    const { branches, loading: branchesLoading } = useTotalBranch();

    // Data states
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState(null); // For the details modal

    // Filter states
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        branch: '', search: '', startDate: null, endDate: null,
        status: 'failed', transactionCode: '', transactionType: ''
    });
    const [debouncedSearch] = useDebounce(filters.search, 500);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage, limit: 15, ...filters,
                search: debouncedSearch,
                startDate: filters.startDate ? filters.startDate.toISOString() : '',
                endDate: filters.endDate ? filters.endDate.toISOString() : '',
            });
            const response = await axiosSecure.get(`/transaction-logs/superadmin/all?${params.toString()}`);
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
        setFilters({ branch: '', search: '', startDate: null, endDate: null, status: 'failed', transactionCode: '', transactionType: '' });
        setCurrentPage(1);
    };

    const statusBadge = (status) => {
        switch (status) {
            case 'success': return 'badge-success text-white';
            case 'failed': return 'badge-error text-white';
            case 'pending': return 'badge-warning text-white';
            default: return 'badge-ghost';
        }
    };

    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-955 min-h-screen transition-colors duration-300">
            <Mtitle title="System Transaction Logs" />

            {/* --- Filter Bar --- */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end transition-colors">
                <FilterInput label="Search" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} placeholder="User, Email, Details..." />
                <FilterSelect label="Branch" value={filters.branch} onChange={(e) => handleFilterChange('branch', e.target.value)} disabled={branchesLoading}>
                    <option value="">All Branches</option>
                    {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </FilterSelect>
                <FilterSelect label="Status" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="failed">Failed</option>
                    <option value="success">Success</option>
                    <option value="pending">Pending</option>
                </FilterSelect>
                <FilterInput label="Transaction Type" value={filters.transactionType} onChange={(e) => handleFilterChange('transactionType', e.target.value)} placeholder="e.g., login" />
                <FilterInput label="Status Code" value={filters.transactionCode} onChange={(e) => handleFilterChange('transactionCode', e.target.value)} placeholder="e.g., 500" />
                
                <div className="form-control w-full">
                    <label className="label-text text-slate-700 dark:text-slate-350 text-xs font-semibold mb-1">Start Date</label>
                    <DatePicker selected={filters.startDate} onChange={(date) => handleFilterChange('startDate', date)} className="input input-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-250" />
                </div>
                <div className="form-control w-full">
                    <label className="label-text text-slate-700 dark:text-slate-350 text-xs font-semibold mb-1">End Date</label>
                    <DatePicker selected={filters.endDate} onChange={(date) => handleFilterChange('endDate', date)} className="input input-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-255" minDate={filters.startDate} />
                </div>
                
                <button onClick={resetFilters} className="btn bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-none rounded-xl text-slate-750 dark:text-slate-200"><FiXCircle className="mr-2"/>Reset Filters</button>
            </div>

            {/* --- Data Table --- */}
            {loading ? <Preloader /> : (
                <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 transition-colors">
                    <table className="table w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-655 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="p-4 text-sm font-bold">User</th>
                                <th className="p-4 text-sm font-bold">Type</th>
                                <th className="p-4 text-sm font-bold">Status</th>
                                <th className="p-4 text-sm font-bold">Message</th>
                                <th className="p-4 text-sm font-bold">Branch</th>
                                <th className="p-4 text-sm font-bold">Time</th>
                                <th className="p-4 text-sm font-bold text-right rounded-tr-2xl">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-350 transition-colors text-sm">
                                    <td className="p-4">
                                        <div className="font-semibold text-slate-850 dark:text-slate-200">{log.userName}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{log.userEmail}</div>
                                    </td>
                                    <td className="p-4 capitalize font-semibold">{log.transactionType}</td>
                                    <td className="p-4">
                                        <span className={`badge ${statusBadge(log.status)} border-none font-medium`}>
                                            {log.status} ({log.transactionCode})
                                        </span>
                                    </td>
                                    <td className="p-4 max-w-xs truncate text-slate-600 dark:text-slate-300">{log.Message}</td>
                                    <td className="p-4">
                                        <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none font-medium">
                                            {log.branch}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-500 dark:text-slate-400">{moment(log.transactionTime).format('lll')}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => setSelectedLog(log)} className="btn btn-ghost btn-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-955 rounded-lg p-1.5"><FiEye size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {/* --- Pagination Controls --- */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 text-slate-600 dark:text-slate-400">
                <p className="text-sm font-medium">Total Logs: {pagination.totalDocuments || 0}</p>
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

            {/* --- Details Modal --- */}
            {selectedLog && <LogDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
        </div>
    );
};

// Helper components for filters and modal
const FilterInput = ({ label, ...props }) => (
    <div className="form-control w-full">
        <label className="label-text text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1">{label}</label>
        <input type="text" {...props} className="input input-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200" />
    </div>
);

const FilterSelect = ({ label, children, ...props }) => (
    <div className="form-control w-full">
        <label className="label-text text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1">{label}</label>
        <select {...props} className="select select-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">{children}</select>
    </div>
);

const LogDetailsModal = ({ log, onClose }) => (
    <div className="modal modal-open">
        <div className="modal-box w-11/12 max-w-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl">
            <h3 className="font-bold text-lg mb-4 text-slate-850 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2">Log Transaction Details</h3>
            <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <p><strong>User:</strong> {log.userName} ({log.userEmail})</p>
                <p><strong>Time:</strong> {moment(log.transactionTime).format('llll')}</p>
                <p><strong>Branch:</strong> {log.branch}</p>
                <p><strong>IP Address:</strong> {log.ipAddress}</p>
                <p><strong>Type:</strong> <span className="capitalize font-semibold text-slate-800 dark:text-slate-100">{log.transactionType}</span></p>
                <p><strong>Status:</strong> <span className="capitalize font-semibold text-red-600 dark:text-red-400">{log.status} ({log.transactionCode})</span></p>
                <p><strong>Message:</strong> {log.Message}</p>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-850 dark:text-slate-200 mb-1">Details Context:</p>
                    <p className="font-mono text-xs break-all">{log.details}</p>
                </div>
                {log.stackTrace && (
                    <div>
                        <p className="font-semibold text-slate-850 dark:text-slate-200 mb-1">Stack Trace:</p>
                        <pre className="bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-400 p-3 rounded-xl text-xs whitespace-pre-wrap font-mono max-h-60 overflow-y-auto border border-red-100 dark:border-red-900/30">{log.stackTrace}</pre>
                    </div>
                )}
            </div>
            <div className="modal-action mt-6">
                <button onClick={onClose} className="btn bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-none rounded-xl text-slate-750 dark:text-slate-200">Close</button>
            </div>
        </div>
    </div>
);

export default ErrorLog;