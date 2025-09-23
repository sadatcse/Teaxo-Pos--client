import React, { useState, useContext, useEffect } from 'react';
import { FiUser, FiLock, FiSave } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

import { AuthContext } from '../../providers/AuthProvider';
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import Mtitle from '../../components library/Mtitle';
import ImageUpload from '../../config/ImageUploadcpanel';

const UserProfile = () => {
    const { user, setUser } = useContext(AuthContext);
    const axiosSecure = UseAxiosSecure();

    // --- State Management ---
    const [activeTab, setActiveTab] = useState('profile');
    const [isProfileSaving, setIsProfileSaving] = useState(false);
    const [isPasswordSaving, setIsPasswordSaving] = useState(false);

    const [profileData, setProfileData] = useState({
        name: '',
        email: ''
    });
    const [photoUrl, setPhotoUrl] = useState('');
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || ''
            });
            setPhotoUrl(user.photo || '');
        }
    }, [user]);

    // --- Event Handlers ---

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleImageUploadComplete = (url) => {
        if (url) {
            setPhotoUrl(url);
        } else {
            console.error("Image URL from upload component is undefined!");
        }
    };

 const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsProfileSaving(true);
    
    const payload = { ...profileData };
    if (photoUrl !== user.photo) {
        payload.photo = photoUrl;
    }

    // --- Start Frontend Debugging Logs ---
    console.log("Submitting the following data to the server:", payload);

    try {
 
        const response = await axiosSecure.put(`/user/updateuser/${user._id}`, payload);
        const data = response.data;
        setUser(prevUser => {
            console.log("Current user state (before update):", prevUser);
            const newUserState = { ...prevUser, ...data };
            console.log("New user state (after update):", newUserState);
            return newUserState;
        });

        Swal.fire({ icon: 'success', title: 'Success!', text: 'Your profile has been updated.' });

    } catch (error) {
        // If any of the steps above fail, this will run.
        console.error("❌ FRONTEND ERROR: An error occurred after the server request.", error);
        Swal.fire({ 
            icon: 'error', 
            title: 'Error!', 
            text: 'Failed to update profile. Please check the browser console for more details.' 
        });
    } finally {
        setIsProfileSaving(false);
    }
};

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Swal.fire({ icon: 'error', title: 'Oops...', text: 'New passwords do not match!' });
            return;
        }
        setIsPasswordSaving(true);
        try {
            const { data } = await axiosSecure.put('/user/change-password', passwordData);
            Swal.fire({ icon: 'success', title: 'Success!', text: data.message });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error!', text: error.response?.data?.message || 'Failed to change password.' });
        } finally {
            setIsPasswordSaving(false);
        }
    };

    if (!user) {
        return <div>Loading profile...</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-base-200 min-h-screen">
            <Mtitle title="My Profile" />

            <div className="mt-6 max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
                {/* Profile Card */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card bg-base-100 shadow-xl w-full md:w-1/3 text-center p-6 self-start">
                    <div className="avatar mx-auto mb-4">
                        <div className="w-32 rounded-full ring ring-blue-700 ring-offset-base-100 ring-offset-2">
                            <img src={photoUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="User Profile" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-slate-500">{user.email}</p>
                    <div className="divider"></div>
                    <div className="text-left space-y-2 text-sm">
                        <p><strong>Role:</strong> <span className="badge bg-transparent border-blue-700 text-blue-700">{user.role}</span></p>
                        <p><strong>Branch:</strong> <span className="badge badge-secondary badge-outline">{user.branch}</span></p>
                        <p><strong>Status:</strong> <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-error'}`}>{user.status}</span></p>
                    </div>
                </motion.div>

                {/* Settings Card */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card bg-base-100 shadow-xl w-full md:w-2/3">
                    <div className="card-body p-4 sm:p-6">
                        <div role="tablist" className="tabs tabs-boxed">
                            <a role="tab" className={`tab ${activeTab === 'profile' && 'tab-active'}`} onClick={() => setActiveTab('profile')}><FiUser className="mr-2" /> Details</a>
                            <a role="tab" className={`tab ${activeTab === 'password' && 'tab-active'}`} onClick={() => setActiveTab('password')}><FiLock className="mr-2" /> Password</a>
                        </div>

                        <div className="pt-6">
                            {activeTab === 'profile' && (
                                <form onSubmit={handleProfileSubmit} className="space-y-4">
                                    <div className="form-control">
                                        <label className="label"><span className="label-text">Full Name</span></label>
                                        <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} className="input input-bordered" />
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text">Email Address</span></label>
                                        <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} className="input input-bordered" />
                                    </div>
                                    <div className="form-control">
                                        <ImageUpload setImageUrl={handleImageUploadComplete} label="Upload New Photo" />
                                        <p className="text-xs text-slate-500 mt-1">After uploading, click "Save Changes" to apply.</p>
                                    </div>
                                    <div className="form-control mt-6">
                                        <button type="submit" className="btn bg-blue-700 hover:bg-blue-800 text-white" disabled={isProfileSaving}>
                                            {isProfileSaving ? <span className="loading loading-spinner"></span> : <><FiSave className="mr-2" /> Save Changes</>}
                                        </button>
                                    </div>
                                </form>
                            )}
                            {activeTab === 'password' && (
                                 <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                    <div className="form-control">
                                        <label className="label"><span className="label-text">Current Password</span></label>
                                        <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="input input-bordered" required />
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text">New Password</span></label>
                                        <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="input input-bordered" required />
                                    </div>
                                    <div className="form-control">
                                        <label className="label"><span className="label-text">Confirm New Password</span></label>
                                        <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="input input-bordered" required />
                                    </div>
                                    <div className="form-control mt-6">
                                        <button type="submit" className="btn bg-blue-700 hover:bg-blue-800 text-white" disabled={isPasswordSaving}>
                                            {isPasswordSaving ? <span className="loading loading-spinner"></span> : <><FiLock className="mr-2" /> Change Password</>}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UserProfile;