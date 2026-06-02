import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

// 1. IMPORT the new PermissionPrivateRoute
import PermissionPrivateRoute from "./Root/PermissionPrivateRoute"; 
import AdminPrivateRoute from "./Root/AdminPrivateRoute"; 
import PrivateRoot from "./Root/PrivateRoot"; 
// Page and Root component imports
import Error404 from "../pages/Error404/Error";
import Login from "../pages/Login/Login";
import Root from "./Root/Root";
import DRoot from "./Root/Admin/DRoot";
import ARoot from "./Root/Aroot";
import SuperAdminPrivateRoute from "./Root/SuperAdminPrivateRoute";
import DemoLogin from "../pages/Login/DemoLogin";

// Loading component
const LazyFallback = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 transition-colors duration-300">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="text-sm font-medium opacity-75">Loading component...</p>
    </div>
  </div>
);

// HOC to wrap lazy loaded page
const lazyLoad = (importFunc) => {
  const LazyComponent = lazy(importFunc);
  const WrappedComponent = (props) => (
    <Suspense fallback={<LazyFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
  WrappedComponent.displayName = `LazyLoadedComponent`;
  return WrappedComponent;
};

// Lazy components
const DashboardHome = lazyLoad(() => import("../pages/Dashboard/DashboardHome"));
const CollectOrder = lazyLoad(() => import("../pages/OtherPage/collect-order"));
const PendingOrders = lazyLoad(() => import("../pages/OtherPage/pending-orders"));
const OrderHistory = lazyLoad(() => import("../pages/OtherPage/orderhistory"));
const SalesReportsDaily = lazyLoad(() => import("../pages/OtherPage/sales-reports-daily"));
const ProductSalesReport = lazyLoad(() => import("../pages/OtherPage/product-sales-report"));
const CounterReportDaily = lazyLoad(() => import("../pages/OtherPage/counter-report-daily"));
const UserAccess = lazyLoad(() => import("../pages/OtherPage/user-access"));
const Category = lazyLoad(() => import("../pages/OtherPage/category"));
const Product = lazyLoad(() => import("../pages/OtherPage/product"));
const AddOns = lazyLoad(() => import("../pages/OtherPage/add-ons"));
const Counter = lazyLoad(() => import("../pages/OtherPage/counter"));
const VatBin = lazyLoad(() => import("../pages/OtherPage/vat-bin"));
const SystemSettings = lazyLoad(() => import("../pages/OtherPage/system-settings"));
const Users = lazyLoad(() => import("../pages/OtherPage/users"));
const TableManagement = lazyLoad(() => import("../pages/OtherPage/table"));
const Customer = lazyLoad(() => import("../pages/OtherPage/Customer"));
const Lobby = lazyLoad(() => import("../pages/OtherPage/Lobby"));
const PrintPreview = lazyLoad(() => import("../pages/OtherPage/PrintPreview"));
const AHome = lazyLoad(() => import('./../pages/Admin/AHome'));
const ATables = lazyLoad(() => import("../pages/Admin/ATables"));
const AUserRoles = lazyLoad(() => import("../pages/Admin/AUserRoles"));
const ACatagroie = lazyLoad(() => import('./../pages/Admin/ACatagroie'));
const ACompany = lazyLoad(() => import('./../pages/Admin/ACompany'));
const AUser = lazyLoad(() => import('./../pages/Admin/AUser'));
const AProduct = lazyLoad(() => import('./../pages/Admin/AProduct'));
const Worklog = lazyLoad(() => import('./../pages/Admin/Worklog'));
const ErrorLog = lazyLoad(() => import('./../pages/Admin/ErrorLog'));
const LoginLog = lazyLoad(() => import("../pages/Admin/LoginLog"));
const UpdateOrdersHistory = lazyLoad(() => import('./../pages/OtherPage/update-orders-history'));
const TableReservation = lazyLoad(() => import("../pages/Table/TableReservation"));
const Kitchendisplay = lazyLoad(() => import("../pages/ExtraPage/Kitchendisplay"));
const EditOrderPage = lazyLoad(() => import("../pages/ExtraPage/EditOrderPage"));
const Expenses = lazyLoad(() => import("../pages/Accounting & Inventory/Expenses"));
const Ingredients = lazyLoad(() => import("../pages/Accounting & Inventory/Ingredients"));
const IngredientsExpense = lazyLoad(() => import("../pages/Accounting & Inventory/IngredientsExpense"));
const Purchases = lazyLoad(() => import("../pages/Accounting & Inventory/Purchases"));
const Stocks = lazyLoad(() => import("../pages/Accounting & Inventory/Stocks"));
const Vendor = lazyLoad(() => import("../pages/Accounting & Inventory/Vendor"));
const IngredientsCatagorie = lazyLoad(() => import("../pages/Accounting & Inventory/IngredientsCatagorie"));
const CustomOrder = lazyLoad(() => import("../pages/ExtraPage/CustomOrder"));
const IngredientExpenses = lazyLoad(() => import("../pages/Ingredients/IngredientExpenses"));
const MenuCosting = lazyLoad(() => import("../pages/Ingredients/MenuCosting"));
const AverageIngredientCost = lazyLoad(() => import("../pages/Ingredients/AverageIngredientCost"));
const RecipeIngredients = lazyLoad(() => import("../pages/Ingredients/RecipeIngredients"));
const IngredientsMaster = lazyLoad(() => import("../pages/Ingredients/IngredientsMaster"));
const ReviewCustomer = lazyLoad(() => import("../pages/Review/ReviewCustomer"));
const ViewReview = lazyLoad(() => import("../pages/Review/ViewReview"));
const AiBusinessChat = lazyLoad(() => import("../pages/AIInsights/AiBusinessChat"));
const ReviewInsights = lazyLoad(() => import("../pages/AIInsights/ReviewInsights"));
const MenuOptimizer = lazyLoad(() => import("../pages/AIInsights/MenuOptimizer"));
const AiSalesAdvisor = lazyLoad(() => import("../pages/AIInsights/AiSalesAdvisor"));
const DailySalesForecast = lazyLoad(() => import("../pages/AIInsights/DailySalesForecast"));
const VendorLedger = lazyLoad(() => import("../pages/VendorLedger/VendorLedger"));
const ExpenseSummary = lazyLoad(() => import("../pages/Accounting & Inventory/ExpenseSummary"));
const ProfitAndLoss = lazyLoad(() => import("../pages/Reports/ProfitAndLoss"));
const StockSalesCompare = lazyLoad(() => import("../pages/Reports/StockSalesCompare"));
const AiPurchaseAdvisor = lazyLoad(() => import("../pages/AIInsights/aipurchaseadvisor"));
const UserProfile = lazyLoad(() => import("../pages/OtherPage/UserProfile"));
const NewBranchWizard = lazyLoad(() => import("../pages/Admin/NewBranchWizard"));
const UserPermission = lazyLoad(() => import("../pages/OtherPage/UserPermission"));
const UserRoleManagement = lazyLoad(() => import("../pages/OtherPage/userrolemanagement"));
const RoleActionPermission = lazyLoad(() => import("../pages/ExtraPage/RoleActionPermission"));


// import DeviceManagement from "../pages/Door/device-management";
// import UserSync from "../pages/Door/user-sync";
// import AttendanceReport from "../pages/Door/attendance-report";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <Error404 />,
        children: [
            {
                path: "/",
                element: <Login />,
            },
            {
                path: 'review/:route/:tableId',
                element: <ReviewCustomer />,
            },
            {
                path: "demo", 
                element: <DemoLogin />, 
            },
            {
                path: "profile",
                element: <Navigate to="/dashboard/profile" replace />,
            },
        ],
    },
    {
        path: "dashboard",
        element: <ARoot />, 
        errorElement: <Error404 />,
        children: [
            {
                path: "",
                element: (
                    // 2. REPLACE PrivateRoot with PermissionPrivateRoute
                    <PermissionPrivateRoute>
                        <Navigate to="home" replace />
                    </PermissionPrivateRoute>
                ),
            },
            // --- Core Routes ---
            {
                path: "home",
                element: <PermissionPrivateRoute><DashboardHome /></PermissionPrivateRoute>,
            },
            {
                path: "ingredients/ingredientsmaster",
                element: <PermissionPrivateRoute><IngredientsMaster /></PermissionPrivateRoute>,
            },
            {
                path: "ingredients/recipeingredients",
                element: <PermissionPrivateRoute><RecipeIngredients /></PermissionPrivateRoute>,
            },
            {
                path: "ingredients/averageingredientcost",
                element: <PermissionPrivateRoute><AverageIngredientCost /></PermissionPrivateRoute>,
            },
            {
                path: "ingredients/menucosting",
                element: <PermissionPrivateRoute><MenuCosting /></PermissionPrivateRoute>,
            },
            {
                path: "ingredients/ingredientexpenses",
                element: <PermissionPrivateRoute><IngredientExpenses /></PermissionPrivateRoute>,
            },

            {
                path: "UpdateOrdersHistory",
                element: <PermissionPrivateRoute><UpdateOrdersHistory /></PermissionPrivateRoute>,
            },
            {
                path: "pos",
                element: <PermissionPrivateRoute><CollectOrder /></PermissionPrivateRoute>,
            },
            {
                path: "pending-orders",
                element: <PermissionPrivateRoute><PendingOrders /></PermissionPrivateRoute>,
            },
            {
                path: "order-history",
                element: <PermissionPrivateRoute><OrderHistory /></PermissionPrivateRoute>,
            },

            {
                path: "customorder",
                element: <PermissionPrivateRoute><CustomOrder /></PermissionPrivateRoute>,
            },
            {
                path: "customers",
                element: <PermissionPrivateRoute><Customer /></PermissionPrivateRoute>,
            },
            {
                path: "ingredientscatagorie",
                element: <PermissionPrivateRoute><IngredientsCatagorie /></PermissionPrivateRoute>,
            },
            {
                path: "kitchendisplay",
                element: <PermissionPrivateRoute><Kitchendisplay /></PermissionPrivateRoute>,
            },
            {
                path: "edit-order/:id",
                element: <PrivateRoot><EditOrderPage /></PrivateRoot>,
            },

            //Accounting And Expense 
            {
                path: "expenses",
                element: <PermissionPrivateRoute><Expenses /></PermissionPrivateRoute>,
            },
            {
                path: "ingredients",
                element: <PermissionPrivateRoute><Ingredients /></PermissionPrivateRoute>,
            },
            {
                path: "ingredientsexpense",
                element: <PermissionPrivateRoute><IngredientsExpense /></PermissionPrivateRoute>,
            },
            {
                path: "purchases",
                element: <PermissionPrivateRoute><Purchases /></PermissionPrivateRoute>,
            },
            {
                path: "stocks",
                element: <PermissionPrivateRoute><Stocks /></PermissionPrivateRoute>,
            },
            {
                path: "vendor",
                element: <PermissionPrivateRoute><Vendor /></PermissionPrivateRoute>,
            },
            
            // --- Table Management Routes ---
            {
                path: "tables/view",
                element: <PermissionPrivateRoute><Lobby /></PermissionPrivateRoute>,
            },
            {
                path: "tables/manage",
                element: <PermissionPrivateRoute><TableManagement /></PermissionPrivateRoute>,
            },
            {
                path: "tables/reservation",
                element: <PermissionPrivateRoute><TableReservation /></PermissionPrivateRoute>,
            },

            // --- Report Routes ---
            {
                path: "reports/daily-sales",
                element: <PermissionPrivateRoute><SalesReportsDaily /></PermissionPrivateRoute>,
            },
            {
                path: "reports/product-sales",
                element: <PermissionPrivateRoute><ProductSalesReport /></PermissionPrivateRoute>,
            },
            {
                path: "reports/counter-daily",
                element: <PermissionPrivateRoute><CounterReportDaily /></PermissionPrivateRoute>,
            },
            {
                path: "reports/user-activity",
                element: <PermissionPrivateRoute><UserAccess /></PermissionPrivateRoute>,
            },

            // --- Settings Routes ---
            {
                path: "settings/categories",
                element: <PermissionPrivateRoute><Category /></PermissionPrivateRoute>,
            },
            {
                path: "settings/products",
                element: <PermissionPrivateRoute><Product /></PermissionPrivateRoute>,
            },
            {
                path: "settings/add-ons",
                element: <PermissionPrivateRoute><AddOns /></PermissionPrivateRoute>,
            },
            {
                path: "settings/counters",
                element: <PermissionPrivateRoute><Counter /></PermissionPrivateRoute>,
            },
            {
                path: "settings/tax",
                element: <PermissionPrivateRoute><VatBin /></PermissionPrivateRoute>,
            },
            {
                path: "settings/system",
                element: <PermissionPrivateRoute><SystemSettings /></PermissionPrivateRoute>,
            },
            
            {
                path: "users",
                element: <PermissionPrivateRoute><Users /></PermissionPrivateRoute>,
            },
            {
                path: "print-preview",
                element: <PermissionPrivateRoute><PrintPreview /></PermissionPrivateRoute>,
            },
            {
                path: "expense-summary",
                element: <PermissionPrivateRoute><ExpenseSummary /></PermissionPrivateRoute>,
            },
            {
                path: "profit-loss-report",
                element: <PermissionPrivateRoute><ProfitAndLoss /></PermissionPrivateRoute>,
            },
            {
                path: 'stock-sales-compare',
                element: <PermissionPrivateRoute><StockSalesCompare /></PermissionPrivateRoute>,
            },
            {
                path: 'aipurchaseadvisor',
                element: <PermissionPrivateRoute><AiPurchaseAdvisor /></PermissionPrivateRoute>,
            },
            { // ADDED USER PROFILE ROUTE
                path: 'profile',
                element: <PermissionPrivateRoute><UserProfile /></PermissionPrivateRoute>,
            },
            {
                path: 'view-review',
                element: <PermissionPrivateRoute><ViewReview /></PermissionPrivateRoute>,
            },
            {
                path: 'dailysalesforecast',
                element: <PermissionPrivateRoute><DailySalesForecast /></PermissionPrivateRoute>,
            },
            {
                path: 'aisalesadvisor',
                element: <PermissionPrivateRoute><AiSalesAdvisor /></PermissionPrivateRoute>,
            },
            {
                path: 'menuoptimizer',
                element: <PermissionPrivateRoute><MenuOptimizer /></PermissionPrivateRoute>,
            },
            {
                path: 'reviewinsights',
                element: <PermissionPrivateRoute><ReviewInsights /></PermissionPrivateRoute>,
            },
            {
                path: 'aibusinesschat',
                element: <PermissionPrivateRoute><AiBusinessChat /></PermissionPrivateRoute>,
            },
              {
                path: 'permission',
                element:<AdminPrivateRoute><UserPermission />,</AdminPrivateRoute> 
            },
            {
                path: 'vendor-ledger/:vendorId',
                element:<PrivateRoot><VendorLedger /></PrivateRoot> ,
            },
            {
                path: 'userrolemanagement',
                element: <PermissionPrivateRoute><UserRoleManagement /></PermissionPrivateRoute>,
            },
                                    {
                path: "action-permission",
                element: (
                    <PrivateRoot> <RoleActionPermission /></PrivateRoot>
                ),
            },
            //    {
            //     path: 'device-management',
            //     element: <DeviceManagement />,
            // },
            //    {
            //     path: 'user-sync',
            //     element: <UserSync />,
            // },
            //    {
            //     path: 'attendance-report',
            //     element: <AttendanceReport />,
            // },
        ],
    },
    {
        // Admin section remains unchanged with SuperAdminPrivateRoute 
        path: "admin",
        element: <DRoot />,
        errorElement: <Error404 />,
        children: [
            {
                path: "",
                element: (
                    <SuperAdminPrivateRoute>
                        <Navigate to="home" replace />
                    </SuperAdminPrivateRoute>
                ),
            },
            {
                path: "home",
                element: (
                    <SuperAdminPrivateRoute> <AHome /></SuperAdminPrivateRoute>
                ),
            },
            {
                path: "tables",
                element: (
                    <SuperAdminPrivateRoute><ATables /></SuperAdminPrivateRoute>
                ),
            },
            {
                path: "user-roles",
                element: (
                    <SuperAdminPrivateRoute><AUserRoles /></SuperAdminPrivateRoute>
                ),
            },
            {
                path: "category",
                element: (
                    <SuperAdminPrivateRoute>  <ACatagroie /></SuperAdminPrivateRoute>
                ),
            },
            {
                path: "company",
                element: (
                    <SuperAdminPrivateRoute>  <ACompany /></SuperAdminPrivateRoute>
                ),
            },
            {
                path: "user",
                element: (
                    <SuperAdminPrivateRoute><AUser /></SuperAdminPrivateRoute>
                ),
            },
            {
                path: "product",
                element: (
                    <SuperAdminPrivateRoute> <AProduct /></SuperAdminPrivateRoute>
                ),
            },
            {
                path: "newbranchwizard",
                element: (
                    <SuperAdminPrivateRoute> <NewBranchWizard /></SuperAdminPrivateRoute>
                ),
            },
            {
                path: "login-log",
                element: (
                    <SuperAdminPrivateRoute>  <LoginLog /></SuperAdminPrivateRoute>
                ),
            },
            {
                path: "error-log",
                element: (
                    <SuperAdminPrivateRoute><ErrorLog /></SuperAdminPrivateRoute>
                ),
            },
            {
                path: "work-log",
                element: (
                    <SuperAdminPrivateRoute> <Worklog /></SuperAdminPrivateRoute>
                ),
            },

        ],
    },
]);