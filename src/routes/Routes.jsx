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
import DashboardHome from "../pages/Dashboard/DashboardHome";
import CollectOrder from "../pages/OtherPage/collect-order";
import PendingOrders from "../pages/OtherPage/pending-orders";
import OrderHistory from "../pages/OtherPage/orderhistory";
import SalesReportsDaily from "../pages/OtherPage/sales-reports-daily";
import ProductSalesReport from "../pages/OtherPage/product-sales-report";
import CounterReportDaily from "../pages/OtherPage/counter-report-daily";
import UserAccess from "../pages/OtherPage/user-access";
import Category from "../pages/OtherPage/category";
import Product from "../pages/OtherPage/product";
import AddOns from "../pages/OtherPage/add-ons";
import Counter from "../pages/OtherPage/counter";
import VatBin from "../pages/OtherPage/vat-bin";
import SystemSettings from "../pages/OtherPage/system-settings";
import Users from "../pages/OtherPage/users";
import TableManagement from "../pages/OtherPage/table";
import Customer from "../pages/OtherPage/Customer";
import Lobby from "../pages/OtherPage/Lobby";
import PrintPreview from "../pages/OtherPage/PrintPreview";
import AHome from './../pages/Admin/AHome';
import ACatagroie from './../pages/Admin/ACatagroie';
import ACompany from './../pages/Admin/ACompany';
import AUser from './../pages/Admin/AUser';
import AProduct from './../pages/Admin/AProduct';
import Worklog from './../pages/Admin/Worklog';
import ErrorLog from './../pages/Admin/ErrorLog';
import LoginLog from "../pages/Admin/LoginLog";
import ARoot from "./Root/Aroot";
import SuperAdminPrivateRoute from "./Root/SuperAdminPrivateRoute";
import UpdateOrdersHistory from './../pages/OtherPage/update-orders-history';
import TableReservation from "../pages/Table/TableReservation";
import Kitchendisplay from "../pages/ExtraPage/Kitchendisplay";
import EditOrderPage from "../pages/ExtraPage/EditOrderPage";
import Expenses from "../pages/Accounting & Inventory/Expenses";
import Ingredients from "../pages/Accounting & Inventory/Ingredients";
import IngredientsExpense from "../pages/Accounting & Inventory/IngredientsExpense";
import Purchases from "../pages/Accounting & Inventory/Purchases";
import Stocks from "../pages/Accounting & Inventory/Stocks";
import Vendor from "../pages/Accounting & Inventory/Vendor";
import IngredientsCatagorie from "../pages/Accounting & Inventory/IngredientsCatagorie";
import CustomOrder from "../pages/ExtraPage/CustomOrder";
import IngredientExpenses from "../pages/Ingredients/IngredientExpenses";
import MenuCosting from "../pages/Ingredients/MenuCosting";
import AverageIngredientCost from "../pages/Ingredients/AverageIngredientCost";
import RecipeIngredients from "../pages/Ingredients/RecipeIngredients";
import IngredientsMaster from "../pages/Ingredients/IngredientsMaster";
import ReviewCustomer from "../pages/Review/ReviewCustomer";
import ViewReview from "../pages/Review/ViewReview";
import AiBusinessChat from "../pages/AIInsights/AiBusinessChat";
import ReviewInsights from "../pages/AIInsights/ReviewInsights";
import MenuOptimizer from "../pages/AIInsights/MenuOptimizer";
import AiSalesAdvisor from "../pages/AIInsights/AiSalesAdvisor";
import DailySalesForecast from "../pages/AIInsights/DailySalesForecast";
import VendorLedger from "../pages/VendorLedger/VendorLedger";
import ExpenseSummary from "../pages/Accounting & Inventory/ExpenseSummary";
import ProfitAndLoss from "../pages/Reports/ProfitAndLoss";
import StockSalesCompare from "../pages/Reports/StockSalesCompare";
import AiPurchaseAdvisor from "../pages/AIInsights/aipurchaseadvisor";
import UserProfile from "../pages/OtherPage/UserProfile";
import NewBranchWizard from "../pages/Admin/NewBranchWizard";
import UserPermission from "../pages/OtherPage/UserPermission";
import UserRoleManagement from "../pages/OtherPage/userrolemanagement";
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