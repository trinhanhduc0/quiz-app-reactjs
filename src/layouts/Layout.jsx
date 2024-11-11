// src/components/Layout.jsx
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "~/components/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import "./Layout.scss";
import Topbar from "~/components/Topbar/Topbar";

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Handle clicks outside of the sidebar
  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`layout ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <Sidebar ref={sidebarRef} isOpen={isSidebarOpen} toggle={toggleSidebar} />
      <Topbar isOpen={isSidebarOpen} onClick={toggleSidebar} />
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
