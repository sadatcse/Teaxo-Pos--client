import React, { useState, useEffect, useContext, useCallback } from 'react';
import Swal from 'sweetalert2';
import {  FiRefreshCw } from 'react-icons/fi';
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from '../../providers/AuthProvider';
import Mtitle from '../../components library/Mtitle';
import MtableLoading from '../../components library/MtableLoading';

const UserSync = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);

    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [users, setUsers] = useState([]);
    const [devicePersonnel, setDevicePersonnel] = useState([]);
    const [isPageLoading, setPageLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    // Fetch registered devices for the current branch
    const fetchDevices = useCallback(async () => {
        try {
            const response = await axiosSecure.get(`/devices?branch=${branch}`);
            setDevices(response.data);
            if (response.data.length > 0) {
                setSelectedDeviceId(response.data[0]._id);
            }
        } catch (error) {
            console.error("Error fetching devices:", error);
        }
    }, [axiosSecure, branch]);

    // Fetch all necessary data
    const fetchData = useCallback(async () => {
        if (!selectedDeviceId) {
            setPageLoading(false);
            return;
        }
        setPageLoading(true);
        try {
            const device = devices.find(d => d._id === selectedDeviceId);
            if (!device) return;

            const [usersRes, personnelRes] = await Promise.all([
                axiosSecure.get(`/user/${branch}/get-all`),
                axiosSecure.get(`/device-info/personnel?deptId=${device.deptId}`)
            ]);
            setUsers(usersRes.data);
            setDevicePersonnel(personnelRes.data.map(p => p.id)); 
        } catch (error) {
            console.error("Error fetching sync data:", error);
            Swal.fire('Error', 'Could not load user or device data.', 'error');
        } finally {
            setPageLoading(false);
        }
    }, [axiosSecure, branch, selectedDeviceId, devices]);

    useEffect(() => {
        fetchDevices();
    }, [fetchDevices]);

    useEffect(() => {
        if (devices.length > 0 && selectedDeviceId) {
            fetchData();
        } else {
            setPageLoading(false);
        }
    }, [devices, selectedDeviceId, fetchData]);


    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const response = await axiosSecure.post('/device-info/sync-users', { deviceId: selectedDeviceId });
            Swal.fire({
                title: 'Sync Complete!',
                html: `Successfully synced: ${response.data.successful}<br/>Failed: ${response.data.failed}`,
                icon: 'success'
            });
            fetchData(); // Refresh the list
        } catch (error) {
            console.error("Error during sync:", error);
            Swal.fire('Sync Error', error.response?.data?.message || 'An error occurred during synchronization.', 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-base-200 dark:bg-zinc-950 dark:text-zinc-100 min-h-screen">
            <Mtitle title="Sync Users to Device" />
            <div className="card bg-base-100 dark:bg-zinc-900 border dark:border-zinc-800 shadow-xl mt-6">
                <div className="card-body">
                    <div className="flex flex-wrap items-end gap-4 mb-6">
                        <div className="form-control w-full max-w-xs">
                            <label className="label"><span className="label-text dark:text-zinc-300">Select Device to Sync</span></label>
                            <select value={selectedDeviceId} onChange={(e) => setSelectedDeviceId(e.target.value)} className="select select-bordered dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100" disabled={devices.length === 0}>
                                {devices.length === 0 ? <option className="dark:bg-zinc-805 dark:text-zinc-100">No devices registered for this branch</option> :
                                    devices.map(d => <option key={d._id} value={d._id} className="dark:bg-zinc-800 dark:text-zinc-100">{d.deviceName} (SN: {d.sn})</option>)
                                }
                            </select>
                        </div>
                        <button onClick={handleSync} className="btn bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md border-none dark:bg-blue-600 dark:hover:bg-blue-700" disabled={isSyncing || !selectedDeviceId}>
                            {isSyncing ? <span className="loading loading-spinner"></span> : <FiRefreshCw />}
                            Sync All Unsynced Users
                        </button>
                    </div>

                    {isPageLoading ? <MtableLoading /> : (
                         <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className='bg-blue-600 text-white'>
                                    <tr><th>Employee Name</th><th>Email</th><th>Sync Status</th></tr>
                                </thead>
                                <tbody>
                                    {users.map(user => {
                                        const isSynced = devicePersonnel.includes(user.deviceUserId); // This logic might need adjustment based on your DeviceInfo model
                                        return (
                                            <tr key={user._id} className="hover dark:hover:bg-zinc-800/40 border-b border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                                                <td className="font-semibold text-slate-800 dark:text-zinc-200">{user.name}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <span className={`badge ${isSynced ? 'badge-success dark:bg-green-950/40 dark:text-green-400 dark:border-green-900/50' : 'badge-ghost dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'}`}>
                                                        {isSynced ? 'Synced' : 'Not Synced'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserSync;