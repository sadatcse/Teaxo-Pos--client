import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import useAuth from "../../Hook/useAuth";

// Images (Ensure these paths are correct relative to where you save this file)
import slideImage1 from "../../assets/Background/Login.jpg";
import slideImage2 from "../../assets/Background/Login.jpg";
import slideImage3 from "../../assets/Background/Login.jpg";
import Logo from "../../assets/Logo/login.png";

const slideImages = [slideImage1, slideImage2, slideImage3];

const DemoLogin = () => {
    // 1. Hardcoded Demo Credentials
    const [email] = useState("demo@sadatkhan.com");
    const [password] = useState("123456789");
    const [loading, setLoading] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const navigate = useNavigate();
    const { loginUser } = useAuth();

    // Background slideshow
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % slideImages.length);
        }, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await loginUser(email, password);
            
            // Note: We usually don't save demo creds to localstorage for 'remember me', 
            // but we might want to clear previous ones to avoid conflicts.
            localStorage.removeItem("email");
            localStorage.removeItem("password");

            toast.success("Demo Access Granted! Welcome.");
            navigate("/dashboard/home");
        } catch (error) {
            console.error(error);
            if (error.response) {
                if (error.response.status === 404) {
                    Swal.fire("Demo User Not Found!", "Please contact the administrator.", "error");
                } else if (error.response.status === 500) {
                    Swal.fire("Server Error!", "Something went wrong. Please try again later.", "error");
                } else {
                    Swal.fire("Login Failed!", "Invalid credentials.", "error");
                }
            } else {
                Swal.fire("Network Error!", "Please check your internet connection.", "error");
            }
        }
        setLoading(false);
    };

    return (
        <>
            <Helmet>
                <title>Demo Access | Restaurant Management System</title>
            </Helmet>

            {/* Background Slideshow */}
            <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {slideImages.map((img, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: currentImageIndex === index ? 1 : 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${img})` }}
                    />
                ))}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/30" />

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 w-full max-w-md border border-white/20"
                >
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
                        <img src={Logo} alt="Logo" className="mx-auto w-32 mb-6" />
                    </motion.div>

                    <h2 className="text-3xl font-bold text-center text-white mb-2">Demo Access</h2>
                    <p className="text-center text-gray-300 mb-6">Click Sign In to access the demo</p>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="text-sm text-gray-200">Demo Email</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    readOnly // Prevents editing
                                    className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none cursor-not-allowed opacity-80"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-sm text-gray-200">Demo Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    readOnly // Prevents editing
                                    className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none cursor-not-allowed opacity-80"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 rounded-lg transition shadow-lg mt-4"
                        >
                            {loading ? "Accessing Demo..." : "Sign In to Demo"}
                        </motion.button>
                        
                        <div className="text-center mt-4">
                            <a href="/" className="text-gray-300 text-sm hover:text-white hover:underline">
                                ← Back to standard login
                            </a>
                        </div>
                    </form>
                </motion.div>
            </div>
        </>
    );
};

export default DemoLogin;