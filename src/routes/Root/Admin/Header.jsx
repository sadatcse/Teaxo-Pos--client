import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaBars, FaSun, FaMoon } from 'react-icons/fa';
import logo from '../../../assets/Logo/login.png'; // Replace with your logo path
import { AuthContext } from '../../../providers/AuthProvider';
import { ThemeContext } from '../../../providers/ThemeProvider';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { user, logoutUser } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleSignOut = async () => {
    try {
      await logoutUser(); 
      navigate("/"); 
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  return (
    <header className="bg-blue-600 dark:bg-slate-900 border-b border-blue-500 dark:border-slate-800 text-white p-4 shadow-lg transition-colors duration-300">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <img src={logo} alt="Company Logo" className="w-10 h-10" />
          <h1 className="text-xl font-bold uppercase tracking-wide">LEAVE RESTAURANT MANAGEMENT SYSTEM</h1>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-blue-700 dark:bg-slate-800 hover:bg-blue-800 dark:hover:bg-slate-700 transition-all duration-200 border border-white/10 flex items-center justify-center shadow-md active:scale-95"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? <FaSun className="text-yellow-400 text-lg" /> : <FaMoon className="text-slate-100 text-lg" />}
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 focus:outline-none bg-blue-700/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl hover:bg-blue-700/80 dark:hover:bg-slate-800/80 transition-colors"
            >
              <FaUserCircle className="text-xl" />
              <span className="hidden md:block font-semibold text-sm">{user?.name}</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden">
                <div className="flex flex-col text-sm">
                  <Link
                    to="/profile"
                    className="py-2.5 px-4 hover:bg-slate-100 dark:hover:bg-slate-700 text-left font-medium"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="py-2.5 px-4 hover:bg-slate-100 dark:hover:bg-slate-700 text-left font-medium text-red-600 dark:text-red-400 border-t border-slate-100 dark:border-slate-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
