import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "react-bootstrap/Modal";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import "./index.css";
import { Collapse, Dropdown } from "react-bootstrap";
import {
  FaPlus,
  FaUpload,
  FaSearch,
  FaSyncAlt,
  FaFileExport,
  FaTrash,
  FaEdit,
  FaEye,
} from "react-icons/fa";
import axios from "axios"; // Added for handling API requests

const Index = () => {
  // 1. Keep a master array of all months static reference
  const MASTER_MONTHS = [
    { value: "1", name: "January" },
    { value: "2", name: "February" },
    { value: "3", name: "March" },
    { value: "4", name: "April" },
    { value: "5", name: "May" },
    { value: "6", name: "June" },
    { value: "7", name: "July" },
    { value: "8", name: "August" },
    { value: "9", name: "September" },
    { value: "10", name: "October" },
    { value: "11", name: "November" },
    { value: "12", name: "December" },
  ];

  const currentYearNum = new Date().getFullYear();
  const currentMonthNum = new Date().getMonth() + 1;

  // Generate years list (e.g., 5 years back and up to current year)
  const DYNAMIC_YEARS = Array.from({ length: 6 }, (_, i) =>
    (currentYearNum - 5 + i).toString(),
  );

  const navigate = useNavigate();

  // 1. Create a state to track visibility
  const [showUpload, setShowUpload] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // API Data States
  const [attendanceData, setAttendanceData] = useState([]);
  const [metrics, setMetrics] = useState({ generated: 0, notGenerated: 0 });
  const [page, setPage] = useState(0);
  const [totalRows, setTotalRows] = useState(0);

  // Form Filter Fields State
  const [searchField, setSearchField] = useState("client_name");
  const [keyword, setKeyword] = useState("");
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString()); // Defaults cleanly to current month (e.g. "6" for June)
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [wildcardWord, setWildcardWord] = useState("");

  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedEmployee, setSelectedEmployee] = useState({
    value: "all",
    label: "All Employee",
  });
  const [attendanceStatus, setAttendanceStatus] = useState("P");
  const [checkInTime, setCheckInTime] = useState("09:00");
  const [checkOutTime, setCheckOutTime] = useState("18:00");

  // 🟢 Dedicated Employees List State for the Add Modal
  const [employeeList, setEmployeeList] = useState([]);

  // Fetch unique active employees list from your backend
  const fetchEmployeesForModal = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/employees", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        // Fallback to response.data.employees or whatever key your backend sends
        setEmployeeList(response.data.employees || response.data.data || []);
      }
    } catch (error) {
      console.error(
        "Failed to load employee directory for attendance popup:",
        error,
      );
    }
  };

  // Run the fetch whenever the Add Attendance Modal opens up
  useEffect(() => {
    if (showModal) {
      fetchEmployeesForModal();
    }
  }, [showModal]);

  // Dropdown Options for Attendance Status
  const statusOptions = [
    { value: "P", label: "Present (P)" },
    { value: "A", label: "Absent (A)" },
    { value: "W", label: "Weekly Off (W)" },
    { value: "OT", label: "Overtime (OT)" },
    { value: "HF", label: "Half Day (HF)" },
    { value: "D", label: "Day (D)" },
  ];

  // Map your existing employee state data to react-select options format

  const employeeOptions = [
    { value: "all", label: "All Employee" },
    ...(employeeList || []).map((emp) => {
      // Fallback concatenation sequence if emp_full_name is blank in the row data
      const fullName =
        emp.emp_full_name ||
        [emp.first_name, emp.middle_name, emp.last_name]
          .filter(Boolean)
          .join(" ") ||
        "Unknown Employee";

      return {
        value: emp.employee_code || emp.id,
        label: `${fullName} (${emp.employee_code || "No Code"})`,
      };
    }),
  ];

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        date: attendanceDate,
        employeeId: selectedEmployee.value, // Will send "all" or the specific code
        status: attendanceStatus,
        checkIn: checkInTime,
        checkOut: checkOutTime,
      };

      const response = await axios.post(
        "http://localhost:5001/api/attendance/add",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (response.data.success) {
        alert("Attendance recorded successfully!");
        setShowModal(false);
        fetchAttendance(); // Refresh your master table list logs grid
      }
    } catch (error) {
      console.error("Failed to save new attendance record:", error);
      alert("Error saving attendance record.");
    }
  };

  // Fetch records from Node.js backend
  const fetchAttendance = async (isReset = false) => {
    try {
      let url = `http://localhost:5001/api/attendance?page=${page}&wo=${wildcardWord}`;

      if (isReset) {
        url += "&reset=true";
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        setAttendanceData(response.data.attendance);
        setTotalRows(response.data.totalRows);

        setMetrics({
          generated: response.data.total_generated,
          notGenerated: response.data.total_not_generated,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Submit active multi-field search selections to POST route
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        search_fields: [searchField],
        search_keyword: [keyword],
        search_date_field: "",
        search_from_date: "",
        search_to_date: "",
        search_from_month: month,
        search_from_year: year,
      };

      const response = await axios.post(
        "http://localhost:5001/api/attendance",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (response.data.success) {
        // Force state reload with new filters applied
        // setPage(0);
        fetchAttendance();
      }
    } catch (error) {
      console.error("Failed to apply database search metrics:", error);
    }
  };

  // ✨ DYNAMIC LOGIC: Calculate available months depending on selected year state
  const filteredMonthsList = MASTER_MONTHS.filter((m) => {
    if (year === currentYearNum.toString()) {
      return Number(m.value) <= currentMonthNum;
    }
    return true; // Return all 12 months for any prior years
  });

  const searchFieldOptions = [
    { value: "client_name", label: "Client Name" },
    { value: "site_name", label: "Site Name" },
  ];

  // ✨ FIXED: Changed ALL_MONTHS to MASTER_MONTHS to match the new definition
  const monthOptions = filteredMonthsList.map((m) => ({
    value: m.value,
    label: m.name,
  }));

  const yearOptions = DYNAMIC_YEARS.map((y) => ({
    value: y,
    label: y,
  }));

  // Watch for month validity when the year changes
  useEffect(() => {
    if (year === currentYearNum.toString() && Number(month) > currentMonthNum) {
      setMonth(currentMonthNum.toString()); // Force reset to current month if previous selection becomes invalid
    }
  }, [year]);

  // Clear back to current month defaults
  const handleReset = () => {
    setSearchField("client_name");
    setKeyword("");
    setMonth((new Date().getMonth() + 1).toString());
    setYear(new Date().getFullYear().toString());
    setWildcardWord("");
    setPage(0);
    fetchAttendance(true);
  };

  // Run on components mount & page transitions
  useEffect(() => {
    fetchAttendance();
  }, [page, wildcardWord]);

  return (
    <div className="container-fluid p-0">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-dark">Attendance Management</h4>

        <div className="d-flex gap-2">
          <button
            className="btn btn-info btn-sm"
            onClick={() => setShowUpload(!showUpload)}
          >
            <FaUpload className="me-1" />
            Bulk Upload
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowSearch(!showSearch)}
          >
            <FaSearch className="me-1" />
            Search
          </button>

          <button
            className="btn btn-success btn-sm"
            onClick={() => setShowModal(true)}
          >
            <FaPlus className="me-1" />
            Add Attendance
          </button>
        </div>
      </div>

      <Collapse in={showUpload}>
        <div>
          <div className="card border-0 shadow-sm mb-4 p-0">
            <div className="card-body">
              <div>
                <p className="text-success fw-semibold">
                  P-Present | A-Absent | W-Weekly Off | P1-Overtime | HF-Half
                  Day...
                </p>

                <p className="text-danger small italic">
                  Do not use any special character in your file name
                </p>

                <div className="row g-3 mt-2">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Upload template:
                    </label>
                    <input type="file" className="form-control" />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Attendance Type
                    </label>
                    <select className="form-select">
                      <option>Both</option>
                      <option>For Invoice</option>
                      <option>For Salary</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <button className="btn btn-primary btn-sm me-2">
                    Start Upload
                  </button>

                  <button className="btn btn-danger btn-sm me-2">
                    Verify Data
                  </button>

                  <button className="btn btn-warning btn-sm">
                    Download Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Collapse>

      {/*Search Filter Panel*/}
      <Collapse in={showSearch}>
        <div>
          <div className="card border-0 shadow-sm mb-4 rounded-3">
            <div className="card-body p-4">
              <form onSubmit={handleSearchSubmit}>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label text-muted small fw-bold">
                      Search Field
                    </label>

                    <Select
                      options={searchFieldOptions}
                      value={searchFieldOptions.find(
                        (option) => option.value === searchField,
                      )}
                      onChange={(selected) => setSearchField(selected.value)}
                      isSearchable
                      placeholder="Select Search Field"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-muted small fw-bold">
                      Keyword
                    </label>
                    <input
                      type="text"
                      className="form-control border-light"
                      placeholder="Type here..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                  </div>
                  {/* Optimized Month Dropdown */}
                  <div className="col-md-2">
                    <label className="form-label text-muted small fw-bold">
                      Month
                    </label>
                    <Select
                      options={monthOptions}
                      value={monthOptions.find(
                        (option) => option.value === month,
                      )}
                      onChange={(selected) => setMonth(selected.value)}
                      isSearchable
                      placeholder="Select Month"
                    />
                  </div>
                  {/* Optimized Dynamic Year Dropdown */}
                  <div className="col-md-2">
                    <label className="form-label text-muted small fw-bold">
                      Year
                    </label>
                    <Select
                      options={yearOptions}
                      value={yearOptions.find(
                        (option) => option.value === year,
                      )}
                      onChange={(selected) => {
                        setYear(selected.value);
                      }}
                      isSearchable
                      placeholder="Select Year"
                    />
                  </div>
                  <div className="col-md-2 d-flex align-items-end gap-2">
                    <button type="submit" className="btn btn-dark flex-grow-1">
                      <FaSearch />
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary flex-grow-1"
                      onClick={handleReset}
                    >
                      <FaSyncAlt />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Collapse>

      {/* Table Section */}
      <div className="card border-0 shadow-sm rounded-3 p-2">
        <div className="card-header bg-white border-0 pt-4 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold text-dark">Monthly Records</h5>
          <div className="text-end">
            <span className="badge bg-success-subtle text-success me-2 px-3 py-2">
              Invoice Generated: {metrics.generated}
            </span>
            <span className="badge bg-danger-subtle text-danger px-3 py-2">
              Not Generated: {metrics.notGenerated}
            </span>
          </div>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th className="text-muted small py-3">Sr No.</th>
                  <th className="text-muted small">Site Name</th>
                  <th className="text-muted small">Month-Year</th>
                  <th className="text-muted small">Total N.D.</th>
                  <th className="text-muted small">Total O.T.</th>
                  <th className="text-muted small">Total Off</th>
                  <th className="text-muted small">Total</th>
                  <th className="text-muted small text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  attendanceData.map((row, idx) => {
                    const nd = parseFloat(row.total_nd) || 0;
                    const ot = parseFloat(row.total_ot) || 0;
                    const off = parseFloat(row.total_off) || 0;
                    const grandTotal = nd + ot + off;

                    const monthNames = [
                      "",
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ];
                    const cleanMonthStr =
                      monthNames[parseInt(row.at_month, 10)] || row.at_month;

                    return (
                      <tr key={row.site_id + "-" + idx}>
                        {/* Serial Counter Row */}
                        <td className="fw-bold text-dark">
                          {idx + 1 + page * 10}
                        </td>

                        {/* Core Meta Details Matching Your Image Layout */}
                        <td>
                          <div className="text-dark">{row.company_name}</div>
                          <div className="text-muted small">
                            Site: {row.site_name}
                          </div>
                          <div className="text-muted small">
                            Client Code: {row.client_code}
                          </div>
                          <div className="text-muted small">
                            Type: {row.att_type}
                          </div>
                        </td>

                        {/* Formatted Period */}
                        <td>
                          {cleanMonthStr}-{row.at_year}
                        </td>

                        {/* Numbers */}
                        <td>{nd}</td>
                        <td>{ot}</td>
                        <td>{off}</td>
                        <td className="fw-bold text-dark">{grandTotal}</td>

                        {/* Context Actions */}
                        <td className="text-end">
                          <Dropdown>
                            <Dropdown.Toggle
                              variant="info"
                              size="sm"
                              className="text-white"
                              id={`dropdown-${row.site_id}`}
                            >
                              Action
                            </Dropdown.Toggle>
                            <Dropdown.Menu popperConfig={{ strategy: "fixed" }}>
                              <Dropdown.Item
                                onClick={() =>
                                  navigate(
                                    `/attendance/attendance-by-employee/PrintAttendance`,
                                    {
                                      state: {
                                        attendance: row,
                                      },
                                    },
                                  )
                                }
                              >
                                Print
                              </Dropdown.Item>
                              <Dropdown.Item href="#/approve">
                                Approve
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item
                                href="#/delete"
                                className="text-danger"
                              >
                                Delete
                              </Dropdown.Item>
                              <Dropdown.Item href="#/salary">
                                Generate Salary
                              </Dropdown.Item>
                              <Dropdown.Item href="#/download">
                                Download
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-dark">
            Add Attendance
          </Modal.Title>
        </Modal.Header>

        <form onSubmit={handleSaveAttendance}>
          <Modal.Body className="p-4">
            <div className="row g-3">
              {/* 1. Date Selector */}
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">
                  Select Date
                </label>
                <input
                  type="date"
                  className="form-control border-light shadow-sm"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  required
                />
              </div>

              {/* 2. Searchable Employee Selection Dropdown */}
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">
                  Select Employee
                </label>
                <Select
                  options={employeeOptions}
                  value={selectedEmployee}
                  onChange={(selected) => setSelectedEmployee(selected)}
                  isSearchable
                  placeholder="Search Employee..."
                  className="shadow-sm"
                />
              </div>

              {/* 3. Attendance Status Choice Grid */}
              <div className="col-md-4">
                <label className="form-label text-muted small fw-bold">
                  Attendance Status
                </label>
                <select
                  className="form-select border-light shadow-sm"
                  value={attendanceStatus}
                  onChange={(e) => setAttendanceStatus(e.target.value)}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Time Management Selectors Block */}
              <div className="col-md-4">
                <label className="form-label text-muted small fw-bold">
                  Check-In Time
                </label>
                <input
                  type="time"
                  className="form-control border-light shadow-sm"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  disabled={
                    attendanceStatus === "A" || attendanceStatus === "W"
                  } // Auto disable when away
                />
              </div>

              <div className="col-md-4">
                <label className="form-label text-muted small fw-bold">
                  Check-Out Time
                </label>
                <input
                  type="time"
                  className="form-control border-light shadow-sm"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  disabled={
                    attendanceStatus === "A" || attendanceStatus === "W"
                  } // Auto disable when away
                />
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer className="bg-light">
            <button
              type="button"
              className="btn btn-secondary btn-sm px-3"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
            <button type="submit" className="btn btn-success btn-sm px-3">
              Save Attendance
            </button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default Index;
