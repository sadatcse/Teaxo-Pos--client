import React, { useContext } from 'react';
import {
  FiHome, FiShoppingCart, FiClock, FiCheckSquare, FiMonitor,
  FiUsers, FiBriefcase, FiDollarSign, FiShoppingBag, FiArchive,
  FiTruck, FiGrid, FiSettings, FiBookmark, FiPackage, FiList,
  FiTrendingUp, FiBookOpen, FiTag, FiCreditCard, FiBarChart2,
  FiCalendar, FiFileText, FiActivity, FiPieChart, FiServer,
  FiUserCheck, FiLayers, FiBox, FiPlusSquare, FiTerminal,
  FiSliders, FiMessageSquare, FiCpu, FiZap, FiStar, FiShield,
  FiKey, FiUserPlus, FiRepeat, FiCompass, FiMessageCircle, FiBarChart,
  FiEdit3
} from "react-icons/fi";
import { SiExpensify } from "react-icons/si";
import { AuthContext } from '../../providers/AuthProvider';

const useMenuItems = () => {
    const { user } = useContext(AuthContext);

    const allItems = [
    {
      title: "Dashboard",
      path: "/dashboard/home",
      icon: <FiHome className="text-lg" />,
    },
    {
      title: "POS / New Order",
      path: "/dashboard/pos",
      icon: <FiShoppingCart className="text-lg" />,
    },
    {
      title: "Pending Orders",
      path: "/dashboard/pending-orders",
      icon: <FiClock className="text-lg" />,
    },
    {
      title: "Finished Order",
      path: "/dashboard/UpdateOrdersHistory",
      icon: <FiCheckSquare className="text-lg" />,
    },
    {
      title: "Kitchen Display",
      path: "/dashboard/kitchendisplay",
      icon: <FiMonitor className="text-lg" />,
    },
    {
      title: "Customers",
      path: "/dashboard/customers",
      icon: <FiUsers className="text-lg" />,
    },
    {
      title: "Accounting & Expense",
      icon: <FiBriefcase className="text-lg" />,
      list: [
        {   
          title: "Expenses",
          path: "/dashboard/expenses",
          icon: <FiDollarSign className="text-lg" />,
        },
        {   
          title: "Expense-Summary",
          path: "/dashboard/expense-summary",
          icon: <SiExpensify  className="text-lg" />,
        },
        {
          title: "Purchases",
          path: "/dashboard/purchases",
          icon: <FiShoppingBag className="text-lg" />,
        },
        {
          title: "Stocks",
          path: "/dashboard/stocks",
          icon: <FiArchive className="text-lg" />,
        },
        {
          title: "Vendor",
          path: "/dashboard/vendor",
          icon: <FiTruck className="text-lg" />,
        },
      ],
    },
    {
      title: "Tables",
      icon: <FiGrid className="text-lg" />,
      list: [
        {
          title: "Table View",
          path: "/dashboard/tables/view",
          icon: <FiGrid className="text-lg" />,
        },
        {
          title: "Table Management",
          path: "/dashboard/tables/manage",
          icon: <FiEdit3 className="text-lg" />, // Changed from FiSettings
        },
        {
          title: "Table Reservation",
          path: "/dashboard/tables/reservation",
          icon: <FiBookmark className="text-lg" />,
        },
      ],
    },
    {
      title: "Ingredients",
      icon: <FiPackage className="text-lg" />,
      list: [
        {
          title: "Ingredients Master",
          path: "/dashboard/ingredients/ingredientsmaster",
          icon: <FiList className="text-lg" />,
        },
        {
          title: "Avg Ingredient Costs",
          path: "/dashboard/ingredients/averageingredientcost",
          icon: <FiTrendingUp className="text-lg" />,
        },
        {
          title: "Recipe Ingredients",
          path: "/dashboard/ingredients/recipeingredients",
          icon: <FiBookOpen className="text-lg" />,
        },
        {
          title: "Menu Costing",
          path: "/dashboard/ingredients/menucosting",
          icon: <FiTag className="text-lg" />,
        },
        {
          title: "Ingredient Expenses",
          path: "/dashboard/ingredients/ingredientexpenses",
          icon: <FiCreditCard className="text-lg" />,
        },
        {
          title: "Stock Sales Compare",
          path: "/dashboard/stock-sales-compare",
          icon: <FiRepeat className="text-lg" />, // Changed from FiCreditCard
        },
      ],
    },
    {
      title: "Reports",
      icon: <FiBarChart2 className="text-lg" />,
      list: [
       {
          title: "Daily Order Report",
          path: "/dashboard/order-history",
          icon: <FiCalendar className="text-lg" />,
        },
        {
          title: "Profit Loss Report",
          path: "/dashboard/profit-loss-report",
          icon: <FiBarChart className="text-lg" />, // Changed from FiCalendar
        },
        {
          title: "Custom Order Report",
          path: "/dashboard/customorder",
          icon: <FiFileText className="text-lg" />,
        },
        {
          title: "Daily Sales Report",
          path: "/dashboard/reports/daily-sales",
          icon: <FiActivity className="text-lg" />,
        },
        {
          title: "Custom Product Sales",
          path: "/dashboard/reports/product-sales",
          icon: <FiPieChart className="text-lg" />,
        },
        {
          title: "Daily Counter Report",
          path: "/dashboard/reports/counter-daily",
          icon: <FiServer className="text-lg" />, // Changed from FiHardDrive       
        },
        {
          title: "User Activity Report ",
          path: "/dashboard/reports/user-activity",
          icon: <FiUserCheck className="text-lg" />,
        },
      ],
    },
    {
      title: "Settings",
      icon: <FiSettings className="text-lg" />,
      list: [
        {
          title: "Categories",
          path: "/dashboard/settings/categories",
          icon: <FiLayers className="text-lg" />,
        },
        {
          title: "Products",
          path: "/dashboard/settings/products",
          icon: <FiBox className="text-lg" />,
        },
        {
          title: "Add-ons",
          path: "/dashboard/settings/add-ons",
          icon: <FiPlusSquare className="text-lg" />,
        },
        {
          title: "Counters",
          path: "/dashboard/settings/counters",
          icon: <FiTerminal className="text-lg" />,
        },
        {
          title: "System Settings",
          path: "/dashboard/settings/system",
          icon: <FiSliders className="text-lg" />,
        },
        {
          title: "User Role",
          path: "/dashboard/userrolemanagement",
          icon: <FiUserPlus className="text-lg" />, // Changed from FiSliders
        },
        ...(user?.role === 'admin' ? [
          {
            title: "User Permission",
            path: "/dashboard/permission",
            icon: <FiKey className="text-lg" />, // Changed from FiSliders
          },
          {
            title: "Action Permission",
            path: "/dashboard/action-permission",
            icon: <FiShield className="text-lg" />,
          }
        ] : [])
      ],
    },
    {
      title: "Reviews",
      path: "/dashboard/view-review",
      icon: <FiMessageSquare className="text-lg" />,
    },
    {
      title: "Staff",
      path: "/dashboard/users",
      icon: <FiUsers className="text-lg" />,
    },
    {
      title: "AI Insights",
      icon: <FiCpu className="text-lg" />,
      list: [
        {
          title: "Daily Sales Forecast",
          path: "/dashboard/dailysalesforecast",
          icon: <FiTrendingUp className="text-lg" />,
        },
        {
          title: "AI Sales Advisor",
          path: "/dashboard/aisalesadvisor",
          icon: <FiBriefcase className="text-lg" />,
        },
        {
          title: "Menu Optimizer",
          path: "/dashboard/menuoptimizer",
          icon: <FiZap className="text-lg" />,
        },
        {
          title: "Review Insights",
          path: "/dashboard/reviewinsights",
          icon: <FiStar className="text-lg" />,
        },
        {
          title: "AI Business Chat",
          path: "/dashboard/aibusinesschat",
          icon: <FiMessageCircle className="text-lg" />, // Changed from FiMessageSquare
        },
        {
          title: "Ai Purchase Advisor",
          path: "/dashboard/aipurchaseadvisor",
          icon: <FiCompass className="text-lg" />, // Changed from FiMessageSquare
        },
      ],
    },
  ];

  return allItems;
};

export default useMenuItems;