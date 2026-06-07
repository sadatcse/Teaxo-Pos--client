import React from "react";
import { Link } from "react-router-dom";

const MenuLink = ({ item, location, isCollapsed }) => {
  const isActive = location.pathname === item.path;

  return (
    <Link
      to={item.path}
      className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
        isActive
          ? "bg-[#eba21c] text-white shadow"
          : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
      }`}
    >
      {item.icon}
      {!isCollapsed && <span>{item.title}</span>}
    </Link>
  );
};

export default MenuLink;