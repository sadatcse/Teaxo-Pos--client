import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../providers/AuthProvider";

// import logo from "../../assets/Logo/logo.png";
import { CiLogout } from "react-icons/ci";
import menuItems from "./DMenuitems";
import "./Sidebar.css";
import MenuLink from "./../MenuLink/MenuLink";
import { handleLogOut } from "../../../utilities/logoutHelper"; 
import useCompanyHook from "../../../Hook/useCompanyHook";
import logo from "./../../../assets/Logo/login.png"
const Sidebar = ({ isCollapsed }) => {
  const { logoutUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const UserRole = "admin"; 
  const { companies } = useCompanyHook();
  console.log(companies);


  const handleNavigation = (path) => {
    if (path) navigate(path);
  };

  return (
    <div className="relative mt-8">
      <div
        className={`sidebar border-r border-gray-400 border-dashed h-dvh overflow-auto pl-4 pr-4 pb-4 poppins text-[#737373] ${
          isCollapsed ? "w-[80px]" : "w-[270px]"
        } bg-white shadow-lg transition-all duration-300`}
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-6">
          {!isCollapsed && <img src={logo} alt="Logo" className="w-24 h-24 mb-4" />}
        </div>

        {/* Menu Section */}
        <nav className="text-base font-normal">
          <ul>
            {menuItems(UserRole).map((cat) => (
              <li key={cat.title} className="mb-2">
                {cat.list ? (
                  <div className="collapse bg-gray-50 p-1 pt-3 hover:shadow rounded-xl">
                    <input
                      type="checkbox"
                      id={`collapse-${cat.title}`}
                      className="hidden"
                    />
                    <label
                      htmlFor={`collapse-${cat.title}`}
                      className="font-medium flex items-center gap-2 cursor-pointer pl-4"
                    >
                      {!isCollapsed && cat.icon}
                      {!isCollapsed && cat.title}
                    </label>
                    <div className="collapse-content px-1 pt-2">
                      {cat.list.map((item) => (
                        <MenuLink
                          item={item}
                          key={item.title}
                          location={location}
                          isCollapsed={isCollapsed}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => handleNavigation(cat.path)}
                    className="bg-gray-50 p-3 hover:shadow rounded-xl cursor-pointer flex items-center gap-2 pl-4"
                  >
                    {cat.icon}
                    {!isCollapsed && cat.title}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Section */}
        <div className="mt-auto">
          <button
            onClick={() => handleLogOut(logoutUser, navigate)}
            className="w-full p-3 flex items-center justify-center gap-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            <CiLogout size={24} />
            {!isCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;