import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import swalHelper from "../../utilities/swalHelper";
import { toast } from "react-toastify";
import useAuth from "../../Hook/useAuth";
import { loginSchema } from "../../utilities/formSchemas";

// Images
import slideImage1 from "../../assets/Background/Login.jpg";
import slideImage2 from "../../assets/Background/Login.jpg";
import slideImage3 from "../../assets/Background/Login.jpg";
import Logo from "../../assets/Logo/login.png";

const slideImages = [slideImage1, slideImage2, slideImage3];

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

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
      setValue("email", savedEmail);
      setValue("password", savedPassword);
      setValue("rememberMe", true);
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await loginUser(data.email, data.password);
      if (data.rememberMe) {
        localStorage.setItem("email", data.email);
        localStorage.setItem("password", data.password);
      } else {
        localStorage.removeItem("email");
        localStorage.removeItem("password");
      }
      toast.success("Login Successful! Welcome back!");
      navigate("/dashboard/home");
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          swalHelper.error("User Not Found", "The email you entered is not registered.");
        } else if (error.response.status === 500) {
          swalHelper.error("Server Error", "Something went wrong on our end. Please try again later.");
        } else {
          swalHelper.error("Login Failed", "Invalid email or password.");
        }
      } else {
        swalHelper.error("Network Error", "Please check your internet connection and try again.");
      }
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

          <h2 className="text-3xl font-bold text-center text-white mb-2 text-shadow-sm">Welcome Back</h2>
          <p className="text-center text-gray-300 mb-6">Sign in to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-gray-200 block mb-1">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">
                  <FaEnvelope aria-hidden="true" />
                </span>
                <input
                  type="email"
                  id="login-email"
                  {...register("email")}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white border outline-none placeholder-gray-300 focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                  }`}
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1" id="email-error">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-gray-200 block mb-1">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">
                  <FaLock aria-hidden="true" />
                </span>
                <input
                  type="password"
                  id="login-password"
                  {...register("password")}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white border outline-none placeholder-gray-300 focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                  }`}
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1" id="password-error">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Options */}
            <div className="flex justify-between items-center text-sm text-gray-200">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="login-rememberMe"
                  {...register("rememberMe")}
                  className="accent-blue-500 cursor-pointer h-4 w-4 rounded"
                />
                Remember Me
              </label>
              <button
                type="button"
                id="forgot-password-btn"
                onClick={() => setShowForgotModal(true)}
                className="text-blue-400 hover:underline hover:text-blue-300 focus:outline-none focus:underline"
              >
                Forgot?
              </button>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2.5 rounded-lg transition shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Sign In"}
            </motion.button>
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
            className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg shadow-lg p-6 w-full max-w-sm relative text-gray-800 dark:text-zinc-100"
          >
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-2 right-3 text-2xl text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              aria-label="Close modal"
            >
              &times;
            </button>
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-zinc-100">Forgot Password?</h3>
            <p className="text-gray-600 dark:text-zinc-400 mb-4 text-sm">
              Enter your email to receive a reset link.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowForgotModal(false);
                swalHelper.success("Request Sent", "If the account exists, you'll receive a reset link.");
              }}
            >
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-4 dark:text-zinc-100"
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

