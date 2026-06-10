import React, { useState, useEffect } from "react";
import EmployeeTable from "../../components/employee/employeePage/EmployeeTable";
import FilterPanel from "../../utils/FilterPanel";
import AddEmployee from "../../components/employee/employeePage/AddEmployee";
import { FaMinus, FaPlus, FaSearch } from "react-icons/fa";
import { Alert, Button, Card, Col, Form, Modal, Row } from "react-bootstrap";

const API_URL = import.meta.env.VITE_API_URL;

const EmployeePages = () => {
  const [disabledEmployees, setDisabledEmployees] = useState([]);
const [showDisabledList, setShowDisabledList] = useState(false);
  const [searchText, setSearchText] = useState("");
const [suggestions, setSuggestions] = useState([]);
const [showDropdown, setShowDropdown] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [workingCount, setWorkingCount] = useState(0);
  const [leftCount, setLeftCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
  const [changeEmployeeStatus, setChangeEmployeeStatus] = useState(null);
  // Search and filter states
  const [searchFields, setSearchFields] = useState([
    { field: "employeeCode", keyword: "" },
  ]);
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [verificationData, setVerificationData] = useState({
    status: "Pending",
    remark: "",
  });
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);

  // const onVerificationClick = (emp, type) => {
  //   setSelectedEmployee(emp);

  //   if (type === "verified") {
  //     setShowVerifiedModal(true);
  //   } else {
  //     setShowVerificationModal(true);
  //   }
  // };
  // Bulk upload states
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showBulkUploadErr, setShowBulkUploadErr] = useState(false);
  const [showBulkUpdateErr, setShowBulkUpdateErr] = useState(false);
  const [showPanUpdate, setShowPanUpdate] = useState(false);
  const [selectedBulkUploadFile, setSelectedBulkUploadFile] = useState(null);
  const [selectedUpdateFile, setSelectedUpdateFile] = useState(null);
  const [bulkUploadErrMsg, setBulkUploadErrMsg] = useState("");
  const [bulkUploadSucMsg, setBulkUploadSucMsg] = useState("");
  const [bulkUpdateErrMsg, setBulkUpdateErrMsg] = useState("");
  const [bulkUpdateSucMsg, setBulkUpdateSucMsg] = useState("");
  const [activeTab, setActiveTab] = useState("Pending");
  const [pendingCount, setPendingCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [offerCount, setOfferCount] = useState(0);
  // Search options
  const [companies, setCompanies] = useState([]);
  const [site, setSite] = useState([]);
  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [reportingManagers, setReportingManagers] = useState([]);
  const searchOptions = [
    { value: "employeeCode", label: "Employee Code" },
    { value: "firstName", label: "First Name" },
    { value: "lastName", label: "Last Name" },
    { value: "emailId", label: "Email ID" },
    { value: "designation", label: "Designation" },
    { value: "department", label: "Department" },
    { value: "panCardNo", label: "PAN Card No" },
    { value: "uanNo", label: "UAN No" },
    { value: "esisNo", label: "ESIC No" },
  ];
const filteredEmployees = employees.filter((emp) => {
  const isVerified = !!emp.verify_on;
  const isApproved =
    emp.emp_stages?.trim().toLowerCase() === "approved";

  if (activeTab === "Pending") {
    return !isVerified;
  }

  if (activeTab === "Verified") {
    return isVerified && !isApproved;
  }

  if (activeTab === "Offer") {
    return isApproved;
  }

  return true;
});

const fetchDisabledEmployees = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/api/employees/disabled`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (response.ok) {
      setDisabledEmployees(result.data || []);
    }
  } catch (err) {
    console.error("Disabled employees fetch error:", err);
  }
};


const handleRestoreEmployee = async (id) => {
  if (!window.confirm("Restore this employee?")) return;

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/api/employees/restore/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (response.ok) {
      alert("Employee restored successfully");

      fetchEmployees();
      fetchDisabledEmployees();
    } else {
      alert(result.message || "Restore failed");
    }
  } catch (err) {
    console.error(err);
    alert("Restore failed");
  }
};
  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      const validSearch = searchFields.filter((f) => f.field && f.keyword);

      if (validSearch.length > 0) params.searchFields = validSearch;
      if (dateFilter.from && dateFilter.to) {
        params.fromDate = dateFilter.from;
        params.toDate = dateFilter.to;
      }

      // Build URL query string
      const queryParams = new URLSearchParams();

      if (params.searchFields) {
        queryParams.append("searchFields", JSON.stringify(params.searchFields));
      }
      if (params.fromDate) queryParams.append("fromDate", params.fromDate);
      if (params.toDate) queryParams.append("toDate", params.toDate);

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/employees?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      // setEmployees(result.data || result);
      const data = Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result)
          ? result
          : [];

      setEmployees(data);
setSuggestions({
  firstName: [...new Set(data.map(emp => emp.first_name).filter(Boolean))],
  middleName: [...new Set(data.map(emp => emp.middle_name).filter(Boolean))],
  lastName: [...new Set(data.map(emp => emp.last_name).filter(Boolean))],
  department: [...new Set(data.map(emp => emp.department).filter(Boolean))],
  designation: [...new Set(data.map(emp => emp.rank).filter(Boolean))],
  company: [...new Set(data.map(emp => emp.company_name).filter(Boolean))],
  site: [...new Set(data.map(emp => emp.site_name).filter(Boolean))],
});
      const working = data.filter(
        (emp) => emp.em_status?.trim() === "Working",
      ).length;

      const left = data.filter(
        (emp) =>
          emp.em_status?.trim() === "Left" ||
          emp.em_status?.trim() === "Terminated",
      ).length;

      setWorkingCount(working);
      setLeftCount(left);
 const pending = data.filter((emp) => !emp.verify_on).length;

const verified = data.filter(
  (emp) =>
    emp.verify_on &&
    emp.emp_stages?.trim().toLowerCase() !== "approved"
).length;

const offer = data.filter(
  (emp) =>
    emp.emp_stages?.trim().toLowerCase() === "offerOffer Letter Issued"
).length;

setPendingCount(pending);
setVerifiedCount(verified);
setOfferCount(offer);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else setError(`Failed to fetch employees: ${err.message}`);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };
 const fetchDropdownData = async () => {
  try {
    const token = localStorage.getItem("token");

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    console.log("Company ID =>", company);

    const [companiesRes, siteRes, employeeTypeRes, reportingManagerRes] =
      await Promise.all([
        fetch(`${API_URL}/api/companies`, { headers }),
        fetch(`${API_URL}/api/branches/by-company/${company}`, { headers }),
        fetch(`${API_URL}/api/employee-types`, { headers }),
        fetch(`${API_URL}/api/employees/reporting-managers`, { headers }),
      ]);

    const companiesData = await companiesRes.json();
    const siteData = await siteRes.json();
    const employeeTypeData = await employeeTypeRes.json();
    const reportingManagerData = await reportingManagerRes.json();

    console.log("Companies Data =>", companiesData);
    console.log("Site Data =>", siteData);
    console.log("Employee Type Data =>", employeeTypeData);
    console.log("Reporting Manager Data =>", reportingManagerData);

    setCompanies(companiesData.data || []);
    setSite(siteData.data || []);
    setEmployeeTypes(employeeTypeData.data || []);
    setReportingManagers(reportingManagerData.data || []);
  } catch (err) {
    console.error("Dropdown fetch error:", err);
  }
};
  useEffect(() => {
    fetchEmployees();
    fetchDropdownData();
      fetchDisabledEmployees();
  }, []);

  const handleSearch = () => {
    fetchEmployees();
  };

  const handleReset = () => {
    setSearchFields([{ field: "employeeCode", keyword: "" }]);
    setDateFilter({ from: "", to: "" });
    fetchEmployees();
  };

  useEffect(() => {
    fetchEmployees();
  }, [searchFields, dateFilter]);

  const handleDownloadExcel = async () => {
    try {
      const params = {};

      const validSearch = searchFields.filter((f) => f.field && f.keyword);

      if (validSearch.length > 0) params.searchFields = validSearch;
      if (dateFilter.from && dateFilter.to) {
        params.fromDate = dateFilter.from;
        params.toDate = dateFilter.to;
      }

      // Build URL query string
      const queryParams = new URLSearchParams();

      if (params.searchFields) {
        queryParams.append("searchFields", JSON.stringify(params.searchFields));
      }
      if (params.fromDate) queryParams.append("fromDate", params.fromDate);
      if (params.toDate) queryParams.append("toDate", params.toDate);
      const token = localStorage.getItem("token");

      const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000);

      const response = await fetch(
        `${API_URL}/api/employees/export?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      if (!response.ok) {
        throw new Error(
          `Failed to download update template: ${response.status}`,
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Employees_${randomNumber}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Axios sends 401 here
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      console.error("Excel download error:", error);
      alert("Failed to download Excel. Please try again.");
    }
  };

  const handleDownloadUploadTemplate = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/employees/uploadtemplate/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to download template: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "EmployeeTemplate.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download Excel template.");
    }
  };

  const handleDownloadUploadErrorExcel = async () => {
    try {
      const token = localStorage.getItem("token");
      // Corrected URL:
      const response = await fetch(
        `${API_URL}/api/employees/uploaderrortemplate/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      if (!response.ok) {
        throw new Error(`Failed to download template: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ViewUploadedData.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download Excel template.");
    }
  };

  const handleDownloadUpdateTemplate = async () => {
    try {
      const params = {};

      const validSearch = searchFields.filter((f) => f.field && f.keyword);

      if (validSearch.length > 0) params.searchFields = validSearch;
      if (dateFilter.from && dateFilter.to) {
        params.fromDate = dateFilter.from;
        params.toDate = dateFilter.to;
      }

      // Build URL query string
      const queryParams = new URLSearchParams();

      if (params.searchFields) {
        queryParams.append("searchFields", JSON.stringify(params.searchFields));
      }
      if (params.fromDate) queryParams.append("fromDate", params.fromDate);
      if (params.toDate) queryParams.append("toDate", params.toDate);

      const token = localStorage.getItem("token");
      const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000);

      const response = await fetch(
        `${API_URL}/api/employees/updatetemplate/download?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      if (!response.ok) {
        throw new Error(
          `Failed to download update template: ${response.status}`,
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Employee_Specific_${randomNumber}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download update template error:", err);
      alert("Failed to download update Excel template.");
    }
  };

  const handleDownloadUpdateErrorExcel = async () => {
    try {
      const token = localStorage.getItem("token");
      // Corrected URL:
      const response = await fetch(
        `${API_URL}/api/employees/updateerrortemplate/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      if (!response.ok) {
        throw new Error(`Failed to download template: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ViewUploadedData.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download Excel template.");
    }
  };

  const handleBulkUploadFileChange = (e) => {
    setBulkUploadSucMsg("");
    setBulkUploadErrMsg("");
    setShowBulkUploadErr(false);
    setSelectedBulkUploadFile(e.target.files[0]);
  };

  const handleBulkUpload = async () => {
    if (!selectedBulkUploadFile) {
      setBulkUploadSucMsg("");
      setBulkUploadErrMsg("Please select a file to upload.");
      return;
    }

    setBulkUploadErrMsg("Uploading...");
    const formData = new FormData();
    formData.append("file", selectedBulkUploadFile);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/api/employees/bulk-upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      if (response.ok) {
        setBulkUploadSucMsg(
          result.insertedCount +
            (result.insertedCount < 2 ? " row" : " rows") +
            " uploaded successfully! Click on Verify Data",
        );
        fetchEmployees();
        setBulkUploadErrMsg("");
      } else {
        setBulkUploadSucMsg("");
        setBulkUploadErrMsg("File upload failed!");
      }
    } catch (err) {
      setBulkUploadErrMsg(`Upload failed!`);
      setBulkUploadSucMsg("");
    } finally {
      setSelectedBulkUploadFile(null);
      if (document.getElementById("bulkUploadFileInput")) {
        document.getElementById("bulkUploadFileInput").value = "";
      }
    }
  };

  const handleVerifyBulkUpload = async () => {
    setBulkUploadSucMsg("");
    setBulkUploadErrMsg("Verifying...");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/api/employees/verify-bulk-upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      // console.log(result);
      if (response.ok) {
        setBulkUploadErrMsg("");
        setBulkUploadSucMsg(
          result.results
            ? "Click on view uploaded data to see any error"
            : result.message,
        );
        if (result.results) {
          setShowBulkUploadErr(true);
        } else {
          setShowBulkUploadErr(false);
        }
        fetchEmployees();
      } else {
        setBulkUploadSucMsg("");
        setBulkUploadErrMsg(result.message || "Verification failed.");
      }
    } catch (err) {
      setBulkUploadErrMsg(`Verification failed: ${err.message}`);
      setBulkUploadSucMsg("");
    }
  };

  const handleBulkUpdateFileChange = (e) => {
    setBulkUpdateErrMsg("");
    setBulkUpdateSucMsg("");
    setShowBulkUpdateErr(false);
    setSelectedUpdateFile(e.target.files[0]);
  };

  const handleBulkUpdate = async () => {
    if (!selectedUpdateFile) {
      setBulkUpdateSucMsg("");
      setBulkUpdateErrMsg("Please select a file to upload.");
      return;
    }

    setBulkUpdateErrMsg("Uploading...");
    const formData = new FormData();
    formData.append("file", selectedUpdateFile);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/api/employees/bulk-update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      if (response.ok) {
        setBulkUpdateSucMsg(
          result.updatedCount +
            (result.updatedCount < 2 ? " row" : " rows") +
            " uploaded successfully! Click on Verify Data",
        );
        fetchEmployees();
        setBulkUpdateErrMsg("");
      } else {
        setBulkUpdateSucMsg("");
        setBulkUpdateErrMsg("File upload failed!");
      }
    } catch (err) {
      setBulkUpdateErrMsg(`Upload failed!`);
      setBulkUpdateSucMsg("");
    } finally {
      setSelectedUpdateFile(null);
      if (document.getElementById("bulkUpdateFileInput")) {
        document.getElementById("bulkUpdateFileInput").value = "";
      }
    }
  };

  const handleVerifyBulkUpdate = async () => {
    setBulkUpdateSucMsg("");
    setBulkUpdateErrMsg("Verifying...");

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/api/employees/verify-bulk-update`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      if (response.ok) {
        setBulkUpdateErrMsg("");
        setBulkUpdateSucMsg(
          result.results
            ? "Click on view uploaded data to see any error"
            : result.message,
        );
        if (result.results) {
          setShowBulkUpdateErr(true);
        } else {
          setShowBulkUpdateErr(false);
        }
        fetchEmployees();
      } else {
        setBulkUpdateSucMsg("");
        setBulkUpdateErrMsg(result.message || "Verification failed.");
      }
    } catch (err) {
      setBulkUpdateErrMsg(`Verification failed: ${err.message}`);
      setBulkUpdateSucMsg("");
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/employees/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.status}`);
      }

      alert("Employee deleted successfully!");
      fetchEmployees();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        alert(`Failed to delete employee: ${err.message}`);
      }
      console.error("Delete error:", err);
    }
  };

  const handleChangeEmployeeStatus = (emp) => {
    setChangeEmployeeStatus(emp);
    setShowChangeStatusModal(true);
  };

  const handleUpdateEmployeeStatus = async () => {
    if (!changeEmployeeStatus) return;

    const id = changeEmployeeStatus._id;
    const currentStatus = changeEmployeeStatus.status;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/employees/${id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: currentStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`);
      }

      alert("Employee status updated successfully!");
      setChangeEmployeeStatus(false);
      fetchEmployees();
    } catch (err) {
      console.error("Status update error:", err);
      alert(`Failed to update employee status: ${err.message}`);
    }
  };
  const handleVerificationClick = (emp, type) => {
    setSelectedEmployee(emp);

    setVerificationData({
      status: emp.verification_status || "Pending",
    remark: emp.verification_remark || "",
    });

    if (type === "verified") {
      setShowVerifiedModal(true);
    } else if (type === "approved") {
      return;
    } else {
      setShowVerificationModal(true);
    }
  };
  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowAddEmployee(true);
  };

  const handleUpdateSalary = (employee) => {
    // setEditingEmployee(employee);
    // setShowAddEmployee(true);
  };

  const handleAddEmployeeSuccess = () => {
    setShowAddEmployee(false);
    setEditingEmployee(null);
    fetchEmployees();
  };

  const handleCancelAddEmployee = () => {
    setShowAddEmployee(false);
    setEditingEmployee(null);
  };

  // if (showAddEmployee) {
  //   return (
  //     <AddEmployee
  //       employee={editingEmployee}
  //       onSuccess={handleAddEmployeeSuccess}
  //       onCancel={handleCancelAddEmployee}
  //     />
  //   );
  // }

  return (
      <div
    className="page-container"
    style={{
      fontSize: "12px",
    }}>
      <div className="page-header">
        <h1 className="page-title">
          Employee Management{" "}
          <span className="text-success">({employees.length})</span>
        </h1>

        <div className="page-actions">
          <div className="employee-counts">
            <span className="working">Working : {workingCount}</span>
            <span className="left">Left : {leftCount}</span>
            {/* <span className="total">Total : {employees.length}</span> */}
          </div>
          <button
            className="search-btn"
            onClick={() => setShowSearchPanel(!showSearchPanel)}
          >
            <FaSearch /> {showSearchPanel ? "Hide Search" : "Search"}
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              setShowAddEmployee(true);
              setEditingEmployee(null);
              setShowSearchPanel(false);
            }}
          >
            <FaPlus />
            Add New Employee
          </button>
        </div>
      </div>
{showSearchPanel && (
  <div
    id="employee-search-panel"
    style={{
      width: "100%",
      padding: "0",
      margin: "0 0 5px 0",
      fontSize: "11px",
      lineHeight: "1.2",
    }}
  >
    <style>
      {`
        #employee-search-panel button,
        #employee-search-panel .btn {
          height: 28px !important;
          min-height: 28px !important;
          font-size: 11px !important;
          padding: 2px 10px !important;
          line-height: 1 !important;
          border-radius: 4px !important;
        }

        #employee-search-panel input,
        #employee-search-panel select,
        #employee-search-panel .form-control,
        #employee-search-panel .form-select {
          height: 28px !important;
          min-height: 28px !important;
          font-size: 11px !important;
          padding: 2px 6px !important;
        }

        #employee-search-panel label,
        #employee-search-panel .form-label {
          font-size: 11px !important;
          margin-bottom: 2px !important;
        }
      `}
    </style>

    <div
      style={{
        transform: "scale(0.95)",
        transformOrigin: "top left",
        width: "105%",
      }}
    >
      <FilterPanel
        searchFields={searchFields}
        setSearchFields={setSearchFields}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        onSearch={handleSearch}
        onReset={handleReset}
        onDownloadExcel={handleDownloadExcel}
        searchOptions={searchOptions}
      />
    </div>
  </div>
)}

      {showAddEmployee ? (
        <AddEmployee
          key={editingEmployee ? editingEmployee.id : "new"}
          editingEmployee={editingEmployee}
          onSuccess={handleAddEmployeeSuccess}
          onCancel={handleCancelAddEmployee}
        />
      ) : (
        <div>
          {/* Employee Bulk Upload */}
          <Card className="mb-2">
  <Card.Title
    onClick={() => setShowBulkUpload(!showBulkUpload)}
    style={{
      cursor: "pointer",
      padding: "8px 12px",
      fontSize: "14px",
      marginBottom: 0,
    }}
    className="d-flex align-items-center"
  >
    <span className="me-2">
      {showBulkUpload ? (
        <FaMinus size={12} />
      ) : (
        <FaPlus size={12} />
      )}
    </span>
    <span>Employee Bulk Upload</span>
  </Card.Title>

  {showBulkUpload && (
    <Card.Body style={{ padding: "10px 12px", fontSize: "12px" }}>
      <p
        style={{
          color: "var(--red-color)",
          fontWeight: "600",
          fontStyle: "italic",
          marginBottom: "8px",
          fontSize: "11px",
        }}
      >
        Do not use any special character in your file name
      </p>

      <Form.Group as={Row} className="align-items-center mb-2">
        <Col xs="auto">
          <Form.Label
            htmlFor="bulkUploadFileInput"
            className="btn btn-secondary btn-sm mb-0"
          >
            Choose File
          </Form.Label>

          <Form.Control
            id="bulkUploadFileInput"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleBulkUploadFileChange}
            style={{ display: "none" }}
          />
        </Col>

        <Col>
          <small>
            {selectedBulkUploadFile
              ? selectedBulkUploadFile.name
              : "No file chosen"}
          </small>
        </Col>
      </Form.Group>

      <p
        className="text-muted mb-2"
        style={{ fontSize: "11px" }}
      >
        Please Upload Excel Sheet Only.
      </p>

      <div className="d-flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="primary"
          onClick={handleBulkUpload}
        >
          Start Upload
        </Button>

        <Button
          size="sm"
          variant="warning"
          onClick={handleVerifyBulkUpload}
        >
          Verify Data
        </Button>

        <Button
          size="sm"
          variant="danger"
          onClick={handleDownloadUploadTemplate}
        >
          Download Template
        </Button>

        {showBulkUploadErr && (
          <Button
            size="sm"
            variant="success"
            onClick={handleDownloadUploadErrorExcel}
          >
            View Uploaded Data
          </Button>
        )}
      </div>

      {bulkUploadErrMsg && (
        <Alert
          variant="danger"
          className="mt-2 mb-0 py-1"
          style={{ fontSize: "11px" }}
        >
          {bulkUploadErrMsg}
        </Alert>
      )}

      {bulkUploadSucMsg && (
        <Alert
          variant="success"
          className="mt-2 mb-0 py-1"
          style={{ fontSize: "11px" }}
        >
          {bulkUploadSucMsg}
        </Alert>
      )}
    </Card.Body>
  )}
</Card>

          {/* Employee PAN/ESIC/UAN/BASIC SALARY Update */}
         <Card className="mb-2">
  <Card.Title
    onClick={() => setShowPanUpdate(!showPanUpdate)}
    style={{
      cursor: "pointer",
      padding: "8px 12px",
      fontSize: "13px",
      fontWeight: "600",
      marginBottom: 0,
    }}
    className="d-flex align-items-center"
  >
    <span className="me-2">
      {showPanUpdate ? (
        <FaMinus size={12} />
      ) : (
        <FaPlus size={12} />
      )}
    </span>
    <span>Employee PANCARD / ESIS / UAN / BASIC SALARY Update</span>
  </Card.Title>

  {showPanUpdate && (
    <Card.Body
      style={{
        padding: "10px 12px",
        fontSize: "12px",
      }}
    >
      <p
        style={{
          color: "var(--red-color)",
          fontWeight: "600",
          fontStyle: "italic",
          fontSize: "11px",
          marginBottom: "8px",
        }}
      >
        Do not use any special character in your file name
      </p>

      <Form.Group as={Row} className="align-items-center mb-2">
        <Col xs="auto">
          <Form.Label
            htmlFor="bulkUpdateFileInput"
            className="btn btn-secondary btn-sm mb-0"
          >
            Choose File
          </Form.Label>

          <Form.Control
            id="bulkUpdateFileInput"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleBulkUpdateFileChange}
            style={{ display: "none" }}
          />
        </Col>

        <Col>
          <small className="text-muted">
            {selectedUpdateFile
              ? selectedUpdateFile.name
              : "No file chosen"}
          </small>
        </Col>
      </Form.Group>

      <p
        className="text-muted mb-2"
        style={{ fontSize: "11px" }}
      >
        Please Upload Excel Sheet Only.
      </p>

      <div className="d-flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="primary"
          onClick={handleBulkUpdate}
        >
          Start Upload
        </Button>

        <Button
          size="sm"
          variant="warning"
          onClick={handleVerifyBulkUpdate}
        >
          Verify Data
        </Button>

        <Button
          size="sm"
          variant="danger"
          onClick={handleDownloadUpdateTemplate}
        >
          Download Template
        </Button>

        {showBulkUpdateErr && (
          <Button
            size="sm"
            variant="success"
            onClick={handleDownloadUpdateErrorExcel}
          >
            View Uploaded Data
          </Button>
        )}
      </div>

      {bulkUpdateErrMsg && (
        <Alert
          variant="danger"
          className="mt-2 mb-0 py-1"
          style={{ fontSize: "11px" }}
        >
          {bulkUpdateErrMsg}
        </Alert>
      )}

      {bulkUpdateSucMsg && (
        <Alert
          variant="success"
          className="mt-2 mb-0 py-1"
          style={{ fontSize: "11px" }}
        >
          {bulkUpdateSucMsg}
        </Alert>
      )}
    </Card.Body>
  )}
</Card>

          {/* Manage Employee Section */}
          {/* ========================================= */}
{/* DISABLED EMPLOYEE LIST */}
{/* ========================================= */}

{/* {showDisabledList && (
  <Card className="mt-3 border-danger">
    <Card.Header className="bg-danger text-white d-flex justify-content-between align-items-center">
      <strong>
        Disabled Employees ({disabledEmployees.length})
      </strong>

      <Button
        size="sm"
        variant="light"
        onClick={() => setShowDisabledList(false)}
      >
        Close
      </Button>
    </Card.Header>

    <Card.Body className="p-0">
      <Table bordered hover responsive className="mb-0">
        <thead className="table-dark">
          <tr>
            <th>Sr No.</th>
            <th>Employee Code</th>
            <th>Employee Name</th>
            <th>Designation</th>
            <th>Company</th>
            <th>Status</th>
            <th>Disabled Date</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {disabledEmployees.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center">
                No Disabled Employees Found
              </td>
            </tr>
          ) : (
            disabledEmployees.map((emp, index) => (
              <tr key={emp.id || emp._id}>
                <td>{index + 1}</td>

                <td>{emp.employee_code}</td>

                <td>
                  {emp.initial} {emp.first_name} {emp.last_name}
                </td>

                <td>{emp.rank || "N/A"}</td>

                <td>{emp.company_name || "N/A"}</td>

                <td>
                  <span className="badge bg-danger">
                    Disabled
                  </span>
                </td>

                <td>
                  {emp.modified_on
                    ? new Date(emp.modified_on).toLocaleDateString(
                        "en-GB"
                      )
                    : "N/A"}
                </td>

                <td>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() =>
                      handleRestoreEmployee(emp.id || emp._id)
                    }
                  >
                    Restore
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Card.Body>
  </Card>
)} */}
          <Card>
            <div className="d-flex gap-2 mb-2">
          <Button
  size="sm"
  className="me-2"
  variant={
    activeTab === "Pending"
      ? "primary"
      : "outline-primary"
  }
  onClick={() => setActiveTab("Pending")}
>
  Pending ({pendingCount})
</Button>

<Button
  size="sm"
  className="me-2"
  variant={
    activeTab === "Verified"
      ? "success"
      : "outline-success"
  }
  onClick={() => setActiveTab("Verified")}
>
  Verified ({verifiedCount})
</Button>

<Button
  size="sm"
  variant={
    activeTab === "Offer"
      ? "warning"
      : "outline-warning"
  }
  onClick={() => setActiveTab("Offer")}
>
  Offer Letter Issued ({offerCount})
</Button> 
              {/* <button
  className="btn btn-danger"
  onClick={() => setShowDisabledList(!showDisabledList)}
>
  Disabled Employees ({disabledEmployees.length})
</button> */}
            </div>
            {/* Employee Table */}
            <EmployeeTable
              loading={loading}
              error={error}
              employees={filteredEmployees}
              activeTab={activeTab}
              onEdit={handleEditEmployee}
              onUpdateSalary={handleUpdateSalary}
              onChangeStatus={handleChangeEmployeeStatus}
              onDelete={handleDeleteEmployee}
              onVerificationClick={handleVerificationClick}
              showVerificationModal={showVerificationModal}
              setShowVerificationModal={setShowVerificationModal}
              showVerifiedModal={showVerifiedModal}
              setShowVerifiedModal={setShowVerifiedModal}
              selectedEmployee={selectedEmployee}
              verificationData={verificationData}
              setVerificationData={setVerificationData}
              fetchEmployees={fetchEmployees}
              companies={companies}
              site={site}
              employeeTypes={employeeTypes}
              reportingManagers={reportingManagers}
              setSelectedEmployee={setSelectedEmployee}
                showDisabledList={showDisabledList}
  disabledEmployees={disabledEmployees}
  handleRestoreEmployee={handleRestoreEmployee}
            />
          </Card>
        </div>
      )}

      {changeEmployeeStatus ? (
        <Modal
          centered
          show={showChangeStatusModal}
          onHide={() => setShowChangeStatusModal(false)}
          size="md"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Change Status -{" "}
              {changeEmployeeStatus.firstName +
                " " +
                changeEmployeeStatus.lastName}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col className="mb-3" md={12}>
                <Form.Group controlId="initial">
                  <Form.Label>Employee Status</Form.Label>
                  <Form.Select
                    name="initial"
                    value={changeEmployeeStatus.status}
                    onChange={(e) =>
                      setChangeEmployeeStatus({
                        ...changeEmployeeStatus,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="Working">Working</option>
                    <option value="Left">Left</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowChangeStatusModal(false)}
            >
              Close
            </Button>
            <Button variant="primary" onClick={handleUpdateEmployeeStatus}>
              Update
            </Button>
          </Modal.Footer>
        </Modal>
      ) : (
        ""
      )}
    </div>
  );
};

export default EmployeePages;
