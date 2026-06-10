import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";

import {
  FaTachometerAlt,
  FaThLarge,
  FaLayerGroup,
  FaUser,
  FaCalendarCheck,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaTicketAlt,
  FaChartBar,
  FaPlus,
  FaClipboard,
  FaStore,
  FaEnvelopeOpenText,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

import logo from "../assets/images/ods_logo.jpeg";
import "./Sidebar.css";

const API_URL = import.meta.env.VITE_API_URL;

const Sidebar = ({
  isCollapsed,
  isMobileOpen,
  closeSidebar,
}) => {
  // =========================================
  // MODULE ICONS
  // =========================================

  const moduleIcons = {
    Home: <FaThLarge />,
    Master: <FaLayerGroup />,
    "Add New": <FaPlus />,
    Employee: <FaUser />,
    Attendance: <FaCalendarCheck />,
    Billing: <FaFileInvoiceDollar />,
    Salary: <FaMoneyBillWave />,
    Vouchers: <FaTicketAlt />,
    "Work Order": <FaClipboard />,
    Vendor: <FaStore />,
    "Raise Ticket": <FaEnvelopeOpenText />,
    Reports: <FaChartBar />,
  };

  // =========================================
  // STATES
  // =========================================

  const [menuItems, setMenuItems] = useState([]);
  const [expandedModules, setExpandedModules] =
    useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================
  // FETCH MENU
  // =========================================

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);

      try {
        const token =
          localStorage.getItem("token");

        console.log("Sidebar Token:", token);

        const { data } = await axios.get(
          `${API_URL}/api/permissions/mymenu`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(
          "Menu API Response:",
          data
        );

        setMenuItems(data?.menu || data || []);
        setError("");
      } catch (err) {
        console.log(
          "Sidebar Error:",
          err.response?.data
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load menu"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // =========================================
  // TOGGLE MODULE
  // =========================================

  const toggleModule = (moduleName) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleName]:
        !prev[moduleName],
    }));
  };

  return (
    <nav
      className={`sidebar ${
        isCollapsed ? "collapsed" : ""
      } ${
        isMobileOpen
          ? "mobile-open"
          : ""
      }`}
    >
      {/* ========================================= */}
      {/* LOGO */}
      {/* ========================================= */}

      <div className="sidebar-logo-container">
        <NavLink
          to="/"
          onClick={() =>
            isMobileOpen &&
            closeSidebar()
          }
        >
          <img
            src={logo}
            alt="Logo"
            className="sidebar-logo"
          />
        </NavLink>
      </div>

      {/* ========================================= */}
      {/* MENU */}
      {/* ========================================= */}

      <ul className="menu-list">
        {/* LOADING */}

        {loading && (
          <li className="loading-text">
            Loading Menu...
          </li>
        )}

        {/* ERROR */}

        {error && (
          <li className="error-text">
            {error}
          </li>
        )}

        {/* DASHBOARD */}

        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "menu-link active"
                : "menu-link"
            }
            onClick={() =>
              isMobileOpen &&
              closeSidebar()
            }
            end
          >
            <FaTachometerAlt className="menu-icon" />

            {!isCollapsed && (
              <span className="menu-text">
                Dashboard
              </span>
            )}
          </NavLink>
        </li>

        {/* ========================================= */}
        {/* DYNAMIC MODULES */}
        {/* ========================================= */}

        {menuItems
          .filter((module) => {
            // HOME ALWAYS SHOW
            if (
              module.moduleName === "Home"
            ) {
              return true;
            }

            // OTHER MODULES MUST HAVE VALID SUBMODULES
            return (
              Array.isArray(
                module.submodules
              ) &&
              module.submodules.some(
                (sub) =>
                  sub.moduleName &&
                  sub.moduleName.trim() !==
                    ""
              )
            );
          })
          .map((module) => {
            // VALID SUBMODULES
            const validSubmodules =
              module.submodules?.filter(
                (sub) =>
                  sub.moduleName &&
                  sub.moduleName.trim() !==
                    ""
              ) || [];

            // HAS VALID SUBMODULES
            const hasValidSubmodules =
              validSubmodules.length > 0;

            return (
              <li key={module.moduleName}>
                {/* MAIN MENU */}

                <div
                  className="menu-link clickable"
                  onClick={() =>
                    hasValidSubmodules &&
                    toggleModule(
                      module.moduleName
                    )
                  }
                >
                  {/* ICON */}

                  <span className="menu-icon">
                    {moduleIcons[
                      module.moduleName
                    ] || <FaThLarge />}
                  </span>

                  {/* TEXT */}

                  {!isCollapsed && (
                    <>
                      <span className="menu-text">
                        {
                          module.moduleName
                        }
                      </span>

                      {/* DROPDOWN ONLY IF SUBMODULE EXISTS */}

                      {hasValidSubmodules && (
                        <span className="dropdown-icon">
                          {expandedModules[
                            module
                              .moduleName
                          ] ? (
                            <FaChevronUp />
                          ) : (
                            <FaChevronDown />
                          )}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* SUBMODULES */}

                {hasValidSubmodules &&
                  expandedModules[
                    module.moduleName
                  ] &&
                  !isCollapsed && (
                    <ul className="submenu-list">
                      {validSubmodules.map(
                        (sub) => (
                          <li
                            key={
                              sub.moduleId
                            }
                          >
                            <NavLink
                              to={`/${module.moduleName
                                .toLowerCase()
                                .replace(
                                  /\s+/g,
                                  "-"
                                )}/${sub.moduleName
                                .toLowerCase()
                                .replace(
                                  /\s+/g,
                                  "-"
                                )}`}
                              className={({
                                isActive,
                              }) =>
                                isActive
                                  ? "submenu-link active"
                                  : "submenu-link"
                              }
                              onClick={() =>
                                isMobileOpen &&
                                closeSidebar()
                              }
                              style={{
                                textDecoration:
                                  "none",
                              }}
                            >
                              {
                                sub.moduleName
                              }
                            </NavLink>
                          </li>
                        )
                      )}
                    </ul>
                  )}
              </li>
            );
          })}
      </ul>
    </nav>
  );
};

export default Sidebar;