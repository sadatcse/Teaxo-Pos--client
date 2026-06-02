import React, { useState, useEffect, useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./../../components/Header";
import { AuthContext } from "../../providers/AuthProvider";

const ARoot = () => {
  const { user } = useContext(AuthContext);
  // State to manage sidebar visibility
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // EFFECT: Handle window resizing to show/hide sidebar automatically
  useEffect(() => {
    const handleResize = () => {
      // Open on desktop, close on mobile
      setSidebarOpen(window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);
    // Initial check
    handleResize();

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (user && user.role === "superadmin") {
    return <Navigate to="/admin/home" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-zinc-950 text-gray-800 dark:text-zinc-100 transition-colors duration-300">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
  
        <Header 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-zinc-900 transition-colors duration-300 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ARoot;