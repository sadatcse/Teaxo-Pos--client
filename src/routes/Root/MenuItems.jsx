import React from 'react';
import {
  // --- Icons from the new structure ---
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
      icon: <MdPendingActions className="text-lg" />,
    },
        {
      title: "Kitchen Display",
      path: "/dashboard/kitchendisplay",
      icon: <MdPendingActions className="text-lg" />,
    },


    
    {
      title: "Order History",
      path: "/dashboard/order-history",
      icon: <MdHistory className="text-lg" />,
    },
    {

      title: "Customers",
      icon: <MdContacts className="text-lg" />,
      list: [
        {
          title: "Customers List",
          path: "/dashboard/customers/list",
          icon: <MdList className="text-lg" />,
        },
        {
          title: "Customers Review",
          path: "/dashboard/customers/reviews",
          icon: <MdReviews className="text-lg" />,
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

          title: "Restaurant List",
          path: "/dashboard/settings/restaurants",
          icon: <MdStore className="text-lg" />,
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