import React, { useState, useEffect, useCallback } from "react";
import { 
    FaStore, FaBoxOpen, FaUsers, FaUserTag, FaTruck, FaShoppingCart, FaBalanceScale, 
    FaMoneyBillWave, FaUserCheck, FaStar, FaCalendarCheck, FaClock, FaExclamationTriangle,
    FaClipboardList, FaBook, FaUtensils
} from "react-icons/fa";
import UseAxiosSecure from "../../Hook/UseAxioSecure";

// Helper to format numbers with commas
const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(num);

const AHome = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const axiosSecure = UseAxiosSecure();

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosSecure.get("/superadmin/dashboard");
            setDashboardData(response.data);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("Failed to fetch data. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [axiosSecure]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Loading Dashboard...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-500">{error}</div>;
    }

    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="bg-gray-100 min-h-screen p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Super Admin Dashboard</h1>

            {/* --- Global Overview Section --- */}
            <DashboardSection title="Global Overview">
                <DashboardCard icon={<FaStore />} title="Total Branches" value={dashboardData.totalBranches} color="bg-blue-500" />
                <DashboardCard icon={<FaUsers />} title="Total Users" value={dashboardData.totalUsers} color="bg-cyan-500" />
                <DashboardCard icon={<FaUserTag />} title="Total Customers" value={dashboardData.totalCustomers} color="bg-violet-500" />
                <DashboardCard icon={<FaTruck />} title="Total Vendors" value={dashboardData.totalVendors} color="bg-orange-500" />
            </DashboardSection>

            {/* --- Today's Snapshot Section --- */}
            <DashboardSection title={`Today's Snapshot (${today})`}>
                <DashboardCard icon={<FaMoneyBillWave />} title="Today's Sales" value={dashboardData.todaysSales} color="bg-green-600" currency="BDT" />
                <DashboardCard icon={<FaShoppingCart />} title="Today's Purchases" value={dashboardData.todaysPurchases} color="bg-red-500" currency="BDT" />
                <DashboardCard icon={<FaClipboardList />} title="Today's Expenses" value={dashboardData.todaysExpenses} color="bg-amber-500" currency="BDT" />
                <DashboardCard icon={<FaBalanceScale />} title="Today's Net Position" value={dashboardData.todaysNetPosition} color={dashboardData.todaysNetPosition >= 0 ? "bg-green-700" : "bg-red-700"} currency="BDT" />
                <DashboardCard icon={<FaUserCheck />} title="Today's Logins" value={dashboardData.todaysLogins} color="bg-sky-500" />
                <DashboardCard icon={<FaStar />} title="New Reviews Today" value={dashboardData.newReviewsToday} color="bg-yellow-500" />
            </DashboardSection>

            {/* --- System Health & Alerts Section --- */}
            <DashboardSection title="System Health & Alerts">
                <DashboardCard icon={<FaExclamationTriangle />} title="Failed Transactions (Today)" value={dashboardData.failedTransactionsToday} color="bg-red-600" isAlert={dashboardData.failedTransactionsToday > 0} />
                <DashboardCard icon={<FaClock />} title="Pending Orders" value={dashboardData.pendingOrders} color="bg-indigo-500" isAlert={dashboardData.pendingOrders > 0} />
                <DashboardCard icon={<FaBoxOpen />} title="Low Stock Alerts" value={dashboardData.lowStockAlerts} color="bg-rose-500" isAlert={dashboardData.lowStockAlerts > 0} />
                <DashboardCard icon={<FaCalendarCheck />} title="Pending Reservations" value={dashboardData.pendingReservations} color="bg-fuchsia-500" />
            </DashboardSection>

             {/* --- Inventory & Menu Section --- */}
            <DashboardSection title="Inventory & Menu">
                <DashboardCard icon={<FaUtensils />} title="Total Products" value={dashboardData.totalProducts} color="bg-lime-600" />
                <DashboardCard icon={<FaBook />} title="Total Ingredients" value={dashboardData.totalIngredients} color="bg-teal-500" />
                <DashboardCard icon={<FaClipboardList />} title="Total Recipes" value={dashboardData.totalRecipes} color="bg-gray-600" />
            </DashboardSection>
        </div>
    );
};

const DashboardSection = ({ title, children }) => (
    <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b-2">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {children}
        </div>
    </section>
);

const DashboardCard = ({ icon, title, value, color, currency, isAlert }) => {
    const formattedValue = typeof value === 'number' 
        ? `${formatNumber(value)}${currency ? ` ${currency}` : ''}`
        : value;

    return (
        <div className={`${color} rounded-xl shadow-lg p-6 text-white transform hover:-translate-y-1 transition-transform duration-300 ${isAlert ? 'animate-pulse' : ''}`}>
            <div className="flex justify-between items-start">
                <div className="text-4xl opacity-80">{icon}</div>
                <div className="text-right">
                    <h3 className="text-3xl font-bold">{formattedValue}</h3>
                    <p className="text-md font-light mt-1">{title}</p>
                </div>
            </div>
        </div>
    );
};

export default AHome;