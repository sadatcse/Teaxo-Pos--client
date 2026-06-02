import React, { useState, useContext, useEffect } from 'react';
import { FiUser, FiLock, FiSave, FiMail, FiMapPin, FiBriefcase, FiCheckCircle, FiUploadCloud } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

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
            Swal.fire({
                icon: 'success',
                title: 'Photo Uploaded!',
                text: 'Click "Save Changes" to apply this profile photo.',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } else {
            console.error("Image URL from upload component is undefined!");
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        if (!profileData.name.trim() || !profileData.email.trim()) {
            Swal.fire({ icon: 'warning', title: 'Validation Alert', text: 'Name and Email fields are required!' });
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profileData.email.trim())) {
            Swal.fire({ icon: 'error', title: 'Invalid Email', text: 'Please enter a valid email address!' });
            return;
        }
        setIsProfileSaving(true);
        
        const payload = { ...profileData };
        if (photoUrl !== user.photo) {
            payload.photo = photoUrl;
        }

        try {
            const response = await axiosSecure.put(`/user/updateuser/${user._id}`, payload);
            const data = response.data;
            setUser(prevUser => ({ ...prevUser, ...data }));
            Swal.fire({ 
                icon: 'success', 
                title: 'Profile Updated!', 
                text: 'Your details have been successfully updated.',
                customClass: {
                    popup: 'rounded-2xl dark:bg-slate-900 dark:text-white'
                }
            });
        } catch (error) {
            console.error("❌ Profile update error:", error);
            Swal.fire({ 
                icon: 'error', 
                title: 'Update Failed', 
                text: error.response?.data?.message || 'Failed to update profile. Please try again.' 
            });
        } finally {
            setIsProfileSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Swal.fire({ icon: 'error', title: 'Passwords Mismatch', text: 'New password and confirmation password do not match!' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            Swal.fire({ icon: 'warning', title: 'Weak Password', text: 'New password must be at least 6 characters long!' });
            return;
        }
        setIsPasswordSaving(true);
        try {
            const { data } = await axiosSecure.put('/user/change-password', passwordData);
            Swal.fire({ 
                icon: 'success', 
                title: 'Password Changed!', 
                text: data.message || 'Your password was changed successfully.',
                customClass: {
                    popup: 'rounded-2xl dark:bg-slate-900 dark:text-white'
                }
            });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            Swal.fire({ 
                icon: 'error', 
                title: 'Change Failed', 
                text: error.response?.data?.message || 'Failed to change password. Make sure current password is correct.' 
            });
        } finally {
            setIsPasswordSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 dark:border-indigo-400"></div>
                <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium animate-pulse">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
            <Mtitle title="My Profile" />

            {/* --- Title Area --- */}
            <div className="max-w-5xl mx-auto mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
                    Account Settings
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Manage your public profile settings and update credentials.
                </p>
            </div>

            <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
                
                {/* --- Left Profile Card --- */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className="w-full lg:w-1/3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-100 dark:shadow-none flex flex-col items-center relative overflow-hidden"
                >
                    {/* Background visual accents */}
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-900 dark:to-indigo-950 opacity-90 z-0"></div>

                    {/* Avatar Container */}
                    <div className="relative z-10 mt-6 mb-4">
                        <div className="w-28 h-28 rounded-full ring-4 ring-white dark:ring-slate-900 overflow-hidden shadow-lg bg-white flex items-center justify-center">
                            <img 
                                src={photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=128`} 
                                alt="User Profile" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute bottom-0 right-1 bg-green-500 text-white rounded-full p-1 border-2 border-white dark:border-slate-900 shadow-md">
                            <FiCheckCircle className="text-xs" />
                        </div>
                    </div>

                    <div className="text-center z-10 w-full">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{user.name}</h2>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mt-2">
                            <FiBriefcase className="text-xs" /> {user.role || 'Member'}
                        </span>
                        
                        <div className="w-full border-t border-slate-150 dark:border-slate-800 my-5"></div>

                        <div className="text-left space-y-4 text-sm w-full">
                            <div className="flex items-center gap-3 text-slate-650 dark:text-slate-350">
                                <FiMail className="text-indigo-550 dark:text-indigo-400 flex-shrink-0 text-base" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-650 dark:text-slate-350">
                                <FiMapPin className="text-indigo-550 dark:text-indigo-400 flex-shrink-0 text-base" />
                                <span>Branch: <span className="font-semibold text-slate-800 dark:text-slate-200">{user.branch || 'Main'}</span></span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Account Status: </span>
                                <span className="capitalize badge badge-success text-white badge-sm font-bold shadow-sm">{user.status || 'Active'}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* --- Right Settings Card --- */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
                    className="w-full lg:w-2/3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl shadow-slate-100 dark:shadow-none"
                >
                    {/* Tabs Navigation */}
                    <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl mb-8 w-full sm:max-w-md">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center justify-center gap-2 flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-350 ${
                                activeTab === 'profile' 
                                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm' 
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                            <FiUser className="text-base" /> Profile Details
                        </button>
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`flex items-center justify-center gap-2 flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-350 ${
                                activeTab === 'password' 
                                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm' 
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                            <FiLock className="text-base" /> Security & Password
                        </button>
                    </div>

                    {/* Tab Panels */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'profile' && (
                            <motion.form 
                                key="profile-tab"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                onSubmit={handleProfileSubmit} 
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="form-control w-full">
                                        <label className="label font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Full Name</label>
                                        <input 
                                            type="text" 
                                            name="name" 
                                            value={profileData.name} 
                                            onChange={handleProfileChange} 
                                            className="input input-bordered bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl" 
                                            required
                                        />
                                    </div>
                                    <div className="form-control w-full">
                                        <label className="label font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Address</label>
                                        <input 
                                            type="email" 
                                            name="email" 
                                            value={profileData.email} 
                                            onChange={handleProfileChange} 
                                            className="input input-bordered bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl" 
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
                                            <FiUploadCloud className="text-indigo-550 dark:text-indigo-400" /> Profile Picture Upload
                                        </span>
                                        <p className="text-xs text-slate-550 dark:text-slate-405 mt-1 leading-relaxed">
                                            Recommended size: 1:1 square. Supports JPG, JPEG, and PNG formats.
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <ImageUpload setImageUrl={handleImageUploadComplete} label="Select Avatar File" />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/80">
                                    <button 
                                        type="submit" 
                                        className="btn bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500 hover:from-blue-700 hover:to-indigo-700 text-white border-none rounded-xl px-6 py-2.5 flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none font-semibold text-sm transition-all duration-300 disabled:opacity-50 active:scale-95" 
                                        disabled={isProfileSaving}
                                    >
                                        {isProfileSaving ? (
                                            <span className="loading loading-spinner loading-sm"></span>
                                        ) : (
                                            <><FiSave className="text-base" /> Save Details</>
                                        )}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                        
                        {activeTab === 'password' && (
                            <motion.form 
                                key="password-tab"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                onSubmit={handlePasswordSubmit} 
                                className="space-y-6"
                            >
                                <div className="form-control w-full">
                                    <label className="label font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Current Password</label>
                                    <input 
                                        type="password" 
                                        name="currentPassword" 
                                        value={passwordData.currentPassword} 
                                        onChange={handlePasswordChange} 
                                        className="input input-bordered bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl" 
                                        required 
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="form-control w-full">
                                        <label className="label font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">New Password</label>
                                        <input 
                                            type="password" 
                                            name="newPassword" 
                                            value={passwordData.newPassword} 
                                            onChange={handlePasswordChange} 
                                            className="input input-bordered bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl" 
                                            required 
                                        />
                                    </div>
                                    <div className="form-control w-full">
                                        <label className="label font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Confirm New Password</label>
                                        <input 
                                            type="password" 
                                            name="confirmPassword" 
                                            value={passwordData.confirmPassword} 
                                            onChange={handlePasswordChange} 
                                            className="input input-bordered bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl" 
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/80">
                                    <button 
                                        type="submit" 
                                        className="btn bg-gradient-to-r from-rose-500 to-red-650 hover:from-rose-650 hover:to-red-700 text-white border-none rounded-xl px-6 py-2.5 flex items-center gap-2 shadow-lg shadow-rose-100 dark:shadow-none font-semibold text-sm transition-all duration-300 disabled:opacity-50 active:scale-95" 
                                        disabled={isPasswordSaving}
                                    >
                                        {isPasswordSaving ? (
                                            <span className="loading loading-spinner loading-sm"></span>
                                        ) : (
                                            <><FiLock className="text-base" /> Change Password</>
                                        )}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>

            </div>
        </div>
    );
};

export default UserProfile;