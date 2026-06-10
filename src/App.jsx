// src/App.jsx
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Layout
import MainLayout from "./layouts/MainLayout";

// Pages
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import CompanyPage from "./pages/master/CompanyPage";
import BranchPage from "./pages/master/BranchPage";
import UserRole from "./pages/master/UserRole";
import UserPage from "./pages/master/UserPage";
import ClientPage from "./pages/addNew/ClientPage";
import EmployeePages from "./pages/employee/EmployeePages";
import AddEmployee from "./components/employee/employeePage/AddEmployee";
import AttendanceByEmployee from "./pages/attendance/attendance-by-employee";
import PrintAttendance from "./pages/attendance/attendance-by-employee/PrintAttendance";
import TimeBasedAttendance from "./pages/attendance/time-based-attendance";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import RefundCancellationPolicy from "./pages/RefundCancellationPolicy";
import EmployeeTypePage from "./pages/employee/EmployeeTypePage";

// PRIVATE ROUTE
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* DEFAULT ROUTE */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* PUBLIC PAGES */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/refund" element={<RefundCancellationPolicy />} />

        {/* PRIVATE LAYOUT */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          {/* DASHBOARD */}
          <Route
            index
            element={<Dashboard />}
          />

          {/* MASTER */}
          <Route
            path="master/companies"
            element={<CompanyPage />}
          />

          <Route
            path="master/branches"
            element={<BranchPage />}
          />

          <Route
            path="master/role-master"
            element={<UserRole />}
          />

          <Route
            path="master/users"
            element={<UserPage />}
          />

          {/* CLIENT */}
          <Route
            path="add-new/client"
            element={<ClientPage />}
          />

          {/* EMPLOYEE */}
          <Route
            path="employee/employee-type"
            element={<EmployeeTypePage />}
          />

          <Route
            path="employee/employee"
            element={<EmployeePages />}
          />

          <Route
            path="employees/add"
            element={<AddEmployee />}
          />

          {/* ATTENDANCE */}
          <Route
            path="attendance/attendance-by-employee"
            element={<AttendanceByEmployee />}
          />

          <Route
            path="attendance/attendance-by-employee/PrintAttendance"
            element={<PrintAttendance />}
          />

          <Route
            path="attendance/time/rokada-based-attendance"
            element={<TimeBasedAttendance />}
          />
        </Route>

        {/* INVALID */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}