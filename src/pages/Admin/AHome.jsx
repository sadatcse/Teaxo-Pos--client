import React, { useState, useEffect, useCallback } from "react";
import { 
    FaStore, FaBoxOpen, FaUsers, FaUserTag, FaTruck, FaShoppingCart, FaBalanceScale, 
    FaMoneyBillWave, FaUserCheck, FaStar, FaCalendarCheck, FaClock, FaExclamationTriangle,
    FaClipboardList, FaBook, FaUtensils, FaSync
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import UseAxiosSecure from "../../Hook/UseAxioSecure";

// Helper to format numbers with commas
const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(num || 0);

const AHome = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const axiosSecure = UseAxiosSecure();

    const fetchDashboardData = useCallback(async (showIndicator = true) => {
        if (showIndicator) setLoading(true);
        setError(null);
        try {
            const response = await axiosSecure.get("/superadmin/dashboard");
            setDashboardData(response.data);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("Failed to fetch dashboard data. Please check your connection or try again.");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [axiosSecure]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchDashboardData(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 dark:border-indigo-400"></div>
                <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium animate-pulse">Loading dashboard overview...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-center transition-colors duration-300">
                <div className="bg-red-100 dark:bg-red-950/30 p-4 rounded-full text-red-600 dark:text-red-400 mb-4">
                    <FaExclamationTriangle className="text-4xl" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Error Loading Dashboard</h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">{error}</p>
                <button onClick={() => fetchDashboardData()} className="btn bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white border-none rounded-xl px-6 py-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all duration-300">
                    Try Again
                </button>
            </div>
        );
    }

    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    // Container animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
            {/* --- Beautiful Header Area --- */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-350 bg-clip-text text-transparent">
                        Super Admin Overview
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Real-time system stats and global administration control center.
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-4">
                    <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        🗓️ {today}
                    </div>
                    <button 
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-250 border border-slate-300 dark:border-slate-800 px-4 py-2 rounded-xl shadow-sm transition-all duration-200 font-semibold text-sm active:scale-95 disabled:opacity-50"
                    >
                        <FaSync className={`text-xs ${isRefreshing ? 'animate-spin' : ''} dark:text-slate-300`} />
                        Refresh
                    </button>
                </div>
            </div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-10"
            >
                {/* --- Global Overview Section --- */}
                <DashboardSection title="Global Infrastructure">
                    <DashboardCard icon={<FaStore />} title="Total Branches" value={dashboardData.totalBranches} gradient="from-blue-600 to-indigo-600 hover:shadow-indigo-500/20" />
                    <DashboardCard icon={<FaUsers />} title="Total Users" value={dashboardData.totalUsers} gradient="from-cyan-500 to-blue-500 hover:shadow-blue-500/20" />
                    <DashboardCard icon={<FaUserTag />} title="Total Customers" value={dashboardData.totalCustomers} gradient="from-violet-500 to-purple-600 hover:shadow-purple-500/20" />
                    <DashboardCard icon={<FaTruck />} title="Total Vendors" value={dashboardData.totalVendors} gradient="from-amber-500 to-orange-600 hover:shadow-orange-500/20" />
                </DashboardSection>

                {/* --- Today's Snapshot Section --- */}
                <DashboardSection title="Today's Performance Snapshot">
                    <DashboardCard icon={<FaMoneyBillWave />} title="Today's Sales" value={dashboardData.todaysSales} gradient="from-emerald-500 to-teal-600 hover:shadow-teal-500/20" currency="BDT" />
                    <DashboardCard icon={<FaShoppingCart />} title="Today's Purchases" value={dashboardData.todaysPurchases} gradient="from-rose-500 to-red-600 hover:shadow-red-500/20" currency="BDT" />
                    <DashboardCard icon={<FaClipboardList />} title="Today's Expenses" value={dashboardData.todaysExpenses} gradient="from-pink-500 to-rose-600 hover:shadow-pink-500/20" currency="BDT" />
                    <DashboardCard 
                        icon={<FaBalanceScale />} 
                        title="Today's Net Position" 
                        value={dashboardData.todaysNetPosition} 
                        gradient={dashboardData.todaysNetPosition >= 0 ? "from-green-600 to-emerald-700 hover:shadow-emerald-700/20" : "from-rose-600 to-red-700 hover:shadow-red-700/20"} 
                        currency="BDT" 
                    />
                    <DashboardCard icon={<FaUserCheck />} title="Today's Active Logins" value={dashboardData.todaysLogins} gradient="from-sky-400 to-blue-500 hover:shadow-sky-500/20" />
                    <DashboardCard icon={<FaStar />} title="New Customer Reviews" value={dashboardData.newReviewsToday} gradient="from-yellow-400 to-amber-500 hover:shadow-amber-500/20" />
                </DashboardSection>

                {/* --- System Health & Alerts Section --- */}
                <DashboardSection title="System Health & Live Monitoring">
                    <DashboardCard icon={<FaExclamationTriangle />} title="Failed Transactions (Today)" value={dashboardData.failedTransactionsToday} gradient="from-red-600 to-rose-700 hover:shadow-red-700/20" isAlert={dashboardData.failedTransactionsToday > 0} />
                    <DashboardCard icon={<FaClock />} title="Pending Orders" value={dashboardData.pendingOrders} gradient="from-indigo-500 to-purple-600 hover:shadow-indigo-500/20" isAlert={dashboardData.pendingOrders > 0} />
                    <DashboardCard icon={<FaBoxOpen />} title="Low Stock Alerts" value={dashboardData.lowStockAlerts} gradient="from-rose-500 to-red-600 hover:shadow-red-500/20" isAlert={dashboardData.lowStockAlerts > 0} />
                    <DashboardCard icon={<FaCalendarCheck />} title="Pending Reservations" value={dashboardData.pendingReservations} gradient="from-fuchsia-500 to-pink-600 hover:shadow-pink-500/20" />
                </DashboardSection>

                {/* --- Inventory & Menu Section --- */}
                <DashboardSection title="Global Menu & Catalog Data">
                    <DashboardCard icon={<FaUtensils />} title="Total Products Listed" value={dashboardData.totalProducts} gradient="from-lime-500 to-emerald-600 hover:shadow-lime-500/20" />
                    <DashboardCard icon={<FaBook />} title="Total Raw Ingredients" value={dashboardData.totalIngredients} gradient="from-teal-400 to-cyan-600 hover:shadow-teal-400/20" />
                    <DashboardCard icon={<FaClipboardList />} title="Total Kitchen Recipes" value={dashboardData.totalRecipes} gradient="from-slate-600 to-neutral-700 hover:shadow-slate-600/20" />
                </DashboardSection>
            </motion.div>
        </div>
    );
};

const DashboardSection = ({ title, children }) => (
    <section>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2">
            <span className="h-4 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
            {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {children}
        </div>
    </section>
);

const cardItemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

const DashboardCard = ({ icon, title, value, gradient, currency, isAlert }) => {
    const formattedValue = typeof value === 'number' 
        ? `${formatNumber(value)}${currency ? ` ${currency}` : ''}`
        : value;

    return (
        <motion.div 
            variants={cardItemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className={`bg-gradient-to-br ${gradient} rounded-2xl shadow-md p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[140px] hover:shadow-xl transition-shadow ${isAlert ? 'animate-pulse' : ''}`}
        >
            {/* Background design accents */}
            <div className="absolute -right-6 -bottom-6 text-9xl opacity-10 pointer-events-none">
                {icon}
            </div>

            <div className="flex justify-between items-start z-10">
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl text-2xl">
                    {icon}
                </div>
                {isAlert && (
                    <span className="bg-white text-red-600 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                        Alert
                    </span>
                )}
            </div>

            <div className="mt-4 z-10">
                <h3 className="text-2xl font-extrabold tracking-tight">
                    {formattedValue}
                </h3>
                <p className="text-xs font-medium text-white/80 mt-1 uppercase tracking-wider">
                    {title}
                </p>
            </div>
        </motion.div>
    );
};

export default AHome;