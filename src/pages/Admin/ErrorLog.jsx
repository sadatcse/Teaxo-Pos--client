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
            case 'success': return 'badge-success';
            case 'failed': return 'badge-error';
            case 'pending': return 'badge-warning';
            default: return 'badge-ghost';
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Mtitle title="System Transaction Logs" />

            {/* --- Filter Bar --- */}
            <div className="p-4 bg-white rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                {/* Filters */}
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
                <div>
                    <label className="label-text">Start Date</label>
                    <DatePicker selected={filters.startDate} onChange={(date) => handleFilterChange('startDate', date)} className="input input-bordered w-full" />
                </div>
                <div>
                    <label className="label-text">End Date</label>
                    <DatePicker selected={filters.endDate} onChange={(date) => handleFilterChange('endDate', date)} className="input input-bordered w-full" minDate={filters.startDate} />
                </div>
                <button onClick={resetFilters} className="btn btn-ghost mt-4"><FiXCircle className="mr-2"/>Reset Filters</button>
            </div>

            {/* --- Data Table --- */}
            {loading ? <Preloader /> : (
                <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                    <table className="table w-full">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th>User</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Message</th>
                                <th>Branch</th>
                                <th>Time</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log._id} className="hover">
                                    <td>{log.userName}<br/><span className="text-xs text-gray-500">{log.userEmail}</span></td>
                                    <td>{log.transactionType}</td>
                                    <td><span className={`badge ${statusBadge(log.status)}`}>{log.status} ({log.transactionCode})</span></td>
                                    <td className="max-w-xs truncate">{log.Message}</td>
                                    <td>{log.branch}</td>
                                    <td>{moment(log.transactionTime).format('lll')}</td>
                                    <td><button onClick={() => setSelectedLog(log)} className="btn btn-ghost btn-sm"><FiEye /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {/* --- Pagination Controls --- */}
            <div className="flex justify-between items-center mt-6">
                <p>Total Logs: {pagination.totalDocuments}</p>
                <div className="join">
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={pagination.currentPage === 1} className="join-item btn">«</button>
                    <button className="join-item btn">Page {pagination.currentPage}</button>
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={pagination.currentPage === pagination.totalPages} className="join-item btn">»</button>
                </div>
            </div>

            {/* --- Details Modal --- */}
            {selectedLog && <LogDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
        </div>
    );
};

// Helper components for filters and modal
const FilterInput = ({ label, ...props }) => (
    <div className="form-control">
        <label className="label-text">{label}</label>
        <input type="text" {...props} className="input input-bordered w-full" />
    </div>
);

const FilterSelect = ({ label, children, ...props }) => (
    <div className="form-control">
        <label className="label-text">{label}</label>
        <select {...props} className="select select-bordered w-full">{children}</select>
    </div>
);

const LogDetailsModal = ({ log, onClose }) => (
    <div className="modal modal-open">
        <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Log Details</h3>
            <div className="space-y-2 text-sm">
                <p><strong>User:</strong> {log.userName} ({log.userEmail})</p>
                <p><strong>Time:</strong> {moment(log.transactionTime).format('llll')}</p>
                <p><strong>Branch:</strong> {log.branch}</p>
                <p><strong>IP Address:</strong> {log.ipAddress}</p>
                <p><strong>Type:</strong> {log.transactionType}</p>
                <p><strong>Status:</strong> {log.status} ({log.transactionCode})</p>
                <p><strong>Message:</strong> {log.Message}</p>
                <p><strong>Details:</strong> {log.details}</p>
                {log.stackTrace && (
                    <div>
                        <p><strong>Stack Trace:</strong></p>
                        <pre className="bg-gray-100 p-2 rounded text-xs whitespace-pre-wrap">{log.stackTrace}</pre>
                    </div>
                )}
            </div>
            <div className="modal-action">
                <button onClick={onClose} className="btn">Close</button>
            </div>
        </div>
    </div>
);

export default ErrorLog;