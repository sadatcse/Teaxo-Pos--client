import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import useAuth from "../../Hook/useAuth";

// Images
import slideImage1 from "../../assets/Background/Login.jpg";
import slideImage2 from "../../assets/Background/Login.jpg";
import slideImage3 from "../../assets/Background/Login.jpg";
import Logo from "../../assets/Logo/login.png";

const slideImages = [slideImage1, slideImage2, slideImage3];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
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

  // Load saved credentials
  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      Swal.fire("Password Too Short!", "Password must be at least 6 characters.", "warning");
      return;
    }
    setLoading(true);
    try {
      await loginUser(email, password);
      if (rememberMe) {
        localStorage.setItem("email", email);
        localStorage.setItem("password", password);
      } else {
        localStorage.removeItem("email");
        localStorage.removeItem("password");
      }
      toast.success("Login Successful! Welcome back!");
      navigate("/dashboard/home");
    } catch {
      Swal.fire("Login Failed!", "Invalid email or password.", "error");
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Login | Restaurant Management System</title>
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
          className="relative z-10 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 w-full max-w-md"
        >
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
            <img src={Logo} alt="Logo" className="mx-auto w-32 mb-6" />
          </motion.div>

          <h2 className="text-3xl font-bold text-center text-white mb-2">Welcome Back</h2>
          <p className="text-center text-gray-300 mb-6">Sign in to continue</p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm text-gray-200">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-300"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-200">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-300"
                  required
                />
              </div>
            </div>

            {/* Options */}
            <div className="flex justify-between items-center text-sm text-gray-200">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-blue-500"
                />
                Remember Me
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-blue-400 hover:underline"
              >
                Forgot?
              </button>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 rounded-lg transition"
            >
              {loading ? "Logging in..." : "Sign In"}
            </motion.button>

            <p className="text-center text-gray-300 text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-400 hover:underline">
                Create Account
              </Link>
            </p>
          </form>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative"
          >
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-2 right-3 text-2xl text-gray-500 hover:text-gray-800"
            >
              &times;
            </button>
            <h3 className="text-lg font-bold mb-2">Forgot Password?</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Enter your email to receive a reset link.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowForgotModal(false);
                Swal.fire("Request Sent", "If account exists, you'll get a reset link.", "success");
              }}
            >
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-4"
                required
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 rounded-lg"
              >
                Send Reset Link
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Login;
