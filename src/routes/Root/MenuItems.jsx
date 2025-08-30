import React from 'react';
import {
  // --- Icons from the previous structure ---
  MdHome,
  MdPendingActions,
  MdHistory,
  MdReport,
  MdAnalytics,
  MdSettings,
  MdPerson,
  MdAddShoppingCart,
  MdCountertops,
  MdAccountBalance,
  MdTableView,
  MdContacts,
  MdCategory,
  MdInventory,
  MdSell,
  MdGroup,
  MdTableRestaurant,
  MdDashboard,
  MdExtension,
  MdStore,
  MdReviews,
  MdList,
  MdFoodBank,
  MdOutlineKitchen,
  MdFactCheck,
  // --- New Icons Added ---
  MdShoppingBag,      // For Purchases
  MdInventory2,       // For Stocks
  MdStorefront,       // For Vendor
} from "react-icons/md";

const menuItems = () => {
  return [
    {
      title: "Dashboard",
      path: "/dashboard/home",
      icon: <MdHome className="text-lg" />,
    },
    {
      title: "POS / New Order",
      path: "/dashboard/pos",
      icon: <MdAddShoppingCart className="text-lg" />,
    },
    {
      title: "Pending Orders",
      path: "/dashboard/pending-orders",
      icon: <MdPendingActions className="text-lg" />,
    },
    {
      title: "Finished Order",
      path: "/dashboard/UpdateOrdersHistory",
      icon: <MdFactCheck className="text-lg" />,
    },
    {
      title: "Kitchen Display",
      path: "/dashboard/kitchendisplay",
      icon: <MdOutlineKitchen className="text-lg" />,
    },
    {
      title: "Daily Order Report",
      path: "/dashboard/order-history",
      icon: <MdHistory className="text-lg" />,
    },


    {
      title: "Custom Order Report",
      path: "/dashboard/customorder",
      icon: <MdHistory className="text-lg" />,
    },

    {
      title: "Customers",
      path: "/dashboard/customers",
      icon: <MdContacts className="text-lg" />,
    },
    {
      title: "Accounting & Expense",
      icon: <MdAccountBalance className="text-lg" />,
      list: [
        {
          title: "Expenses",
          path: "/dashboard/expenses",
          icon: <MdSell className="text-lg" />,
        },
        {
          title: "Ingredients",
          path: "/dashboard/ingredients",
          icon: <MdFoodBank className="text-lg" />,
        },
        {
          title: "Ingredients Expense",
          path: "/dashboard/ingredientsexpense",
          icon: <MdAnalytics className="text-lg" />,
        },

        {
          title: "Purchases",
          path: "/dashboard/purchases",
          icon: <MdShoppingBag className="text-lg" />,
        },
        {
          title: "Stocks",
          path: "/dashboard/stocks",
          icon: <MdInventory2 className="text-lg" />,
        },
        {
          title: "Vendor",
          path: "/dashboard/vendor",
          icon: <MdStorefront className="text-lg" />,
        },
        
      ],
    },
    {
      title: "Tables",
      icon: <MdTableRestaurant className="text-lg" />,
      list: [
        {
          title: "Table View",
          path: "/dashboard/tables/view",
          icon: <MdDashboard className="text-lg" />,
        },
        {
          title: "Table Management",
          path: "/dashboard/tables/manage",
          icon: <MdTableView className="text-lg" />,
        },
        {
          title: "Table Reservation",
          path: "/dashboard/tables/reservation",
          icon: <MdTableView className="text-lg" />,
        },
      ],
    },
    {
      title: "Reports",
      icon: <MdReport className="text-lg" />,
      list: [
        {
          title: "Daily Sales",
          path: "/dashboard/reports/daily-sales",
          icon: <MdAnalytics className="text-lg" />,
        },
        {
          title: "Product Sales",
          path: "/dashboard/reports/product-sales",
          icon: <MdSell className="text-lg" />,
        },
        {
          title: "Daily Counter Report",
          path: "/dashboard/reports/counter-daily",
          icon: <MdCountertops className="text-lg" />,
        },
        {
          title: "User Activity",
          path: "/dashboard/reports/user-activity",
          icon: <MdPerson className="text-lg" />,
        },
      ],
    },
    {
      title: "Settings",
      icon: <MdSettings className="text-lg" />,
      list: [
        {
          title: "Categories",
          path: "/dashboard/settings/categories",
          icon: <MdCategory className="text-lg" />,
        },
        {
          title: "Products",
          path: "/dashboard/settings/products",
          icon: <MdInventory className="text-lg" />,
        },
        {
          title: "Add-ons",
          path: "/dashboard/settings/add-ons",
          icon: <MdExtension className="text-lg" />,
        },
        {
          title: "Counters",
          path: "/dashboard/settings/counters",
          icon: <MdCountertops className="text-lg" />,
        },
        {
          title: "Tax / VAT",
          path: "/dashboard/settings/tax",
          icon: <MdAccountBalance className="text-lg" />,
        },
        {
          title: "System Settings",
          path: "/dashboard/settings/system",
          icon: <MdSettings className="text-lg" />,
        },
      ],
    },
    {
      title: "Staff",
      path: "/dashboard/users",
      icon: <MdGroup className="text-lg" />,
    },
  ];
};

export default menuItems;