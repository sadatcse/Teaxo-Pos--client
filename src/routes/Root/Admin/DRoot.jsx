import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";


const DRoot = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Monitor screen width to determine if it's mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Example breakpoint for mobile
    };

    handleResize(); // Initialize on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-850 dark:text-slate-100 transition-colors duration-300">
      {/* Conditionally render the sidebar */}
      {!isMobile && (
        <div className="fixed w-[200px] h-full z-30">
          <Sidebar />
        </div>
      )}

      {/* Main content area */}
      <div className={`${!isMobile ? "ml-[270px]" : "ml-0"} flex-1 flex flex-col min-h-screen`}>
        <Header />
        <div className="flex-1 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DRoot;
