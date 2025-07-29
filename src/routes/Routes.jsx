import { createBrowserRouter, Navigate } from "react-router-dom";

// Page and Root component imports (assuming these are correct)
import Error404 from "../pages/Error404/Error";
import Login from "../pages/Login/Login";
import Root from "./Root/Root";
import DRoot from "./Root/Admin/DRoot";
import DashboardHome from "../pages/Dashboard/DashboardHome";
import CollectOrder from "../pages/OtherPage/collect-order"; // Corresponds to /pos
import PendingOrders from "../pages/OtherPage/pending-orders";
import OrderHistory from "../pages/OtherPage/orderhistory";
import SalesReportsDaily from "../pages/OtherPage/sales-reports-daily";
import ProductSalesReport from "../pages/OtherPage/product-sales-report";
import CounterReportDaily from "../pages/OtherPage/counter-report-daily";
import UserAccess from "../pages/OtherPage/user-access"; // Corresponds to reports/user-activity
import Category from "../pages/OtherPage/category";
import Product from "../pages/OtherPage/product";
import AddOns from "../pages/OtherPage/add-ons";
import Counter from "../pages/OtherPage/counter";
import VatBin from "../pages/OtherPage/vat-bin"; // Corresponds to settings/tax
import SystemSettings from "../pages/OtherPage/system-settings";
import Users from "../pages/OtherPage/users";
import TableManagement from "../pages/OtherPage/table";
import Customer from "../pages/OtherPage/Customer";
import Lobby from "../pages/OtherPage/Lobby"; // Corresponds to tables/view
import PrivateRoot from "./Root/PrivateRoot";

// Other imports (assuming they are correct)
import PrintPreview from "../pages/OtherPage/PrintPreview";
// import DeliveryTimeReport from "../pages/OtherPage/delivery-time-report";
// import MaterialsUsedReport from "../pages/OtherPage/materials-used-report";
// import FundReportDaily from "../pages/OtherPage/fund-report-daily";
// import SalesReportsWithAddons from "../pages/OtherPage/sales-reports-with-addons";
// import SalesReportDetails from "../pages/OtherPage/sales-report-details";
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
    ],
  },
  {
    path: "dashboard",
    element: <ARoot />, // Using ARoot for the main dashboard layout
    errorElement: <Error404 />,
    children: [
      {
        path: "",
        element: (
          <PrivateRoot>
            <Navigate to="home" replace />
          </PrivateRoot>
        ),
      },
      // --- Core Routes ---
      {
        path: "home",
        element: <PrivateRoot><DashboardHome /></PrivateRoot>,
      },
            {
        path: "UpdateOrdersHistory",
        element: <PrivateRoot><UpdateOrdersHistory /></PrivateRoot>,
      },
      {
        // Changed from "collect-order" to match menu
        path: "pos",
        element: <PrivateRoot><CollectOrder /></PrivateRoot>,
      },
      {
        path: "pending-orders",
        element: <PrivateRoot><PendingOrders /></PrivateRoot>,
      },
      {
        // Changed from "order-orders" to match menu
        path: "order-history",
        element: <PrivateRoot><OrderHistory /></PrivateRoot>,
      },
      {
        // Changed from "customer" to match menu
        path: "customers",
        element: <PrivateRoot><Customer /></PrivateRoot>,
      },

      // --- Table Management Routes ---
      {
        // Changed from "lobby" to match menu
        path: "tables/view",
        element: <PrivateRoot><Lobby /></PrivateRoot>,
      },
      {
        // Changed from "table" to match menu
        path: "tables/manage",
        element: <PrivateRoot><TableManagement /></PrivateRoot>,
      },
            {
        // Changed from "table" to match menu
        path: "tables/reservation",
        element: <PrivateRoot><TableReservation /></PrivateRoot>,
      },

      // --- Report Routes ---
      {
        // Path updated for consistency
        path: "reports/daily-sales",
        element: <PrivateRoot><SalesReportsDaily /></PrivateRoot>,
      },
      {
        // Path updated for consistency
        path: "reports/product-sales",
        element: <PrivateRoot><ProductSalesReport /></PrivateRoot>,
      },
      {
        // Path updated for consistency
        path: "reports/counter-daily",
        element: <PrivateRoot><CounterReportDaily /></PrivateRoot>,
      },
      {
        // Path updated for consistency
        path: "reports/user-activity",
        element: <PrivateRoot><UserAccess /></PrivateRoot>,
      },

      // --- Settings Routes ---
      {
        // Path updated for consistency
        path: "settings/categories",
        element: <PrivateRoot><Category /></PrivateRoot>,
      },
      {
        // Path updated for consistency
        path: "settings/products",
        element: <PrivateRoot><Product /></PrivateRoot>,
      },
      {
        // Path updated for consistency
        path: "settings/add-ons",
        element: <PrivateRoot><AddOns /></PrivateRoot>,
      },
      {
        // Path updated for consistency
        path: "settings/counters",
        element: <PrivateRoot><Counter /></PrivateRoot>,
      },
      {
        // Path updated for consistency
        path: "settings/tax",
        element: <PrivateRoot><VatBin /></PrivateRoot>,
      },
      {
        // Path updated for consistency
        path: "settings/system",
        element: <PrivateRoot><SystemSettings /></PrivateRoot>,
      },
      
      // --- User Management Route ---
      {
        path: "users",
        element: <PrivateRoot><Users /></PrivateRoot>,
      },

      // --- Non-Menu Routes (kept for functionality) ---
      {
        path: "print-preview",
        element: <PrivateRoot><PrintPreview /></PrivateRoot>,
      },
      // Note: Other non-menu report routes like "delivery-time-report"
      // could also be nested under "/reports/*" for full consistency.
    ],
  },
  {
    // Admin section remains unchanged as requested
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
        path: "login-log",
        element: (
          <SuperAdminPrivateRoute>  <LoginLog/></SuperAdminPrivateRoute> 
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
