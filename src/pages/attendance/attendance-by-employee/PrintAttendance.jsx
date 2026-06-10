import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
// import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import * as XLSX from "xlsx";

const PrintAttendance = () => {
  const printRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Use a fallback to prevent "undefined" errors
  const sharedRowData = location.state?.attendance;

  // const handlePrint = useReactToPrint({
  //   contentRef: printRef,
  //   documentTitle: `Attendance_${sharedRowData?.site_name || "Report"}`,
  // });

  // Local state managers - Ensure employees initializes as an empty array []
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);

  // Array tracking days 1 to 31 for rendering matrix columns dynamically
  const totalDaysInMonth = 31;
  const daysArray = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

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

  useEffect(() => {
    // Guard clause in case a user refreshes/bookmarks page directly
    if (!sharedRowData) {
      setError(
        "No active record metadata detected. Please navigate from the main panel selection.",
      );
      setLoading(false);
      return;
    }

    const fetchDetailedLogs = async () => {
      try {
        // Hits your granular logs route passing down variables unpacked out of location state storage
        const response = await axios.get(
          "http://localhost:5001/api/attendance/print-sheet",
          {
            params: {
              site: sharedRowData.site_id,
              m: sharedRowData.at_month,
              y: sharedRowData.at_year,
              type: sharedRowData.att_type || "Both",
            },
            withCredentials: true, // Ensures cross-port session states remain intact
          },
        );

        if (response.data.success) {
          console.log("Attendance Data:", response.data.at_data);
          // ✨ FIXED: Maps to "at_data" instead of "employees" to match backend payload key
          setEmployees(response.data.at_data || []);
        } else {
          setError(
            "Backend failed to map matching employee logs for this profile row.",
          );
        }
      } catch (err) {
        console.error("Print View Network Error:", err);
        setError("Unable to communicate with API service server.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetailedLogs();
  }, [sharedRowData]);

  // 🧮 Compute Daily Column Footers on the fly based on current active response payload values
  const getColumnTotal = (dayNum) => {
    return (
      employees?.reduce((acc, emp) => {
        const status = emp.days?.[dayNum] || "";
        if (["P", "P1", "W"].includes(status)) return acc + 1;
        if (status === "HF") return acc + 0.5;
        return acc;
      }, 0) || 0
    );
  };

  const totalND = employees.reduce(
    (sum, row) => sum + Number(row.nd ?? row.total_nd ?? row.present_days ?? 0),
    0,
  );

  const totalOT = employees.reduce(
    (sum, row) => sum + Number(row.ot ?? row.total_ot ?? 0),
    0,
  );

  const totalOff = employees.reduce(
    (sum, row) => sum + Number(row.off ?? row.total_off ?? 0),
    0,
  );

  const totalOTHrs = employees.reduce(
    (sum, row) => sum + Number(row.otHrs ?? row.ot_hrs ?? row.ot_hours ?? 0),
    0,
  );

  const totalHoliday = employees.reduce(
    (sum, row) => sum + Number(row.holiday ?? row.holidays ?? 0),
    0,
  );

  const grandTotalOverall = totalND + totalOT + totalOff;

  useEffect(() => {
    console.log("PRINT ELEMENT:", printRef.current);
  }, [employees]);

  if (loading)
    return (
      <div className="text-center p-5 fw-bold text-muted">
        Fetching Grid Transaction Logs...
      </div>
    );

  if (error)
    return (
      <div className="alert alert-danger m-4">
        {error}
        <button
          className="btn btn-sm btn-dark ms-2"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );

  const handleDownloadExcelFrontend = () => {
    if (!employees || employees.length === 0) {
      alert("No employee attendance logs detected to export.");
      return;
    }

    // 1. Dynamic Brand Header Block
    const companyNameClean = sharedRowData?.company_name
      ? sharedRowData.company_name.toUpperCase()
      : "";

    const officeAddress = sharedRowData?.company_name
      ? "Office No-1102, 11th Floor Technocity IT Premises X-5/3, TTC Industrial Area, Mahape, Ghansoli Navi Mumbai-400710"
      : "";
    const contactDetails = sharedRowData?.company_name
      ? "Tel.: 7977271174 | Email: operations@ekodex.in"
      : "";

    const exportDataRows = [
      [companyNameClean],
      [officeAddress],
      [contactDetails],
      [], // Blank separator row
      [
        `Site Name: ${sharedRowData?.site_name || ""}`,
        `Month: ${monthNames[parseInt(sharedRowData?.at_month, 10)] || sharedRowData?.at_month || ""}`,
        `Year: ${sharedRowData?.at_year || ""}`,
      ],
      [], // Blank separator row
    ];

    // 2. Map Column Labels
    const tableHeaders = [
      "Sr No.",
      "Employee Name",
      "Emp code",
      "Rank",
      "P.F.",
      "ESIC",
      ...daysArray,
      "N.D.",
      "O.T.",
      "O.T/HRS",
      "Off",
      "Holiday",
      "Total",
    ];
    exportDataRows.push(tableHeaders);

    // 3. Process Individual Employee Rows dynamically
    employees.forEach((emp, index) => {
      const rowSum =
        Number(emp.nd || 0) +
        Number(emp.ot || 0) +
        Number(emp.off || 0) +
        Number(emp.holiday || 0);

      const individualRow = [
        index + 1,
        emp.empName || "",
        emp.empCode || "",
        emp.rank || "",
        emp.pf || "",
        emp.esic || "",
      ];

      daysArray.forEach((day) => {
        individualRow.push(emp.days?.[day] || "");
      });

      individualRow.push(emp.nd || 0);
      individualRow.push(emp.ot || 0);
      individualRow.push(emp.otHrs || 0);
      individualRow.push(emp.off || 0);
      individualRow.push(emp.holiday || 0);
      individualRow.push(rowSum || 0);

      exportDataRows.push(individualRow);
    });

    // 4. Append Aggregate Summary Footer Total Counters
    const bottomFooterRow = ["Deployment Total:", "", "", "", "", ""];

    daysArray.forEach((day) => {
      bottomFooterRow.push(getColumnTotal(day) || 0);
    });

    bottomFooterRow.push(totalND || 0);
    bottomFooterRow.push(totalOT || 0);
    bottomFooterRow.push(totalOTHrs || 0);
    bottomFooterRow.push(totalOff || 0);
    bottomFooterRow.push(totalHoliday || 0);
    bottomFooterRow.push(grandTotalOverall || 0);

    exportDataRows.push(bottomFooterRow);

    // 5. Generate workbook processing mechanics using clean SheetJS syntax
    const worksheet = XLSX.utils.aoa_to_sheet(exportDataRows);
    const workbook = XLSX.utils.book_new();

    // ✨ DESIGN OVERRIDES: Column Width Configuration (Pre-calculating widths for crisp layout)
    const columnWidths = [
      { wch: 8 }, // Sr No.
      { wch: 26 }, // Employee Name
      { wch: 12 }, // Emp code
      { wch: 15 }, // Rank
      { wch: 15 }, // P.F.
      { wch: 15 }, // ESIC
    ];

    // Assign tight uniform widths for all 31 matrix day columns (Columns G through AK)
    daysArray.forEach(() => {
      columnWidths.push({ wch: 4 });
    });

    // Metric summaries tails sizing properties
    columnWidths.push(
      { wch: 7 }, // N.D.
      { wch: 7 }, // O.T.
      { wch: 10 }, // O.T/HRS
      { wch: 7 }, // Off
      { wch: 9 }, // Holiday
      { wch: 9 }, // Total
    );

    // Apply the column widths array to the worksheet
    worksheet["!cols"] = columnWidths;

    // 6. Append to workbook & trigger native system download prompt
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

    const fileName = `Attendance_Sheet_${sharedRowData?.site_name || "Export"}_${sharedRowData?.at_month || "M"}_${sharedRowData?.at_year || "Y"}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // const handlePrintClick = () => {
  //   console.log("printRef.current =", printRef.current);

  //   if (!printRef.current) {
  //     alert("Print content not loaded");
  //     return;
  //   }

  //   handlePrint();
  // };
  const handlePrintClick = () => {
    const printContents = printRef.current.innerHTML;

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
    <html>
      <head>
        <title>Attendance Sheet</title>
        <style>
          body{
            font-family: Arial, sans-serif;
            padding:20px;
          }

          table{
            width:100%;
            border-collapse:collapse;
          }

          th,td{
            border:1px solid #000;
            padding:4px;
            text-align:center;
          }

          .table{
            width:100%;
          }
        </style>
      </head>
      <body>
        ${printContents}
      </body>
    </html>
  `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="pcoded-inner-content bg-white p-3">
      {/* 🖨️ CSS Print Media Queries Stylesheet Block Injection to hide controls & scale table elegantly */}
      <style>{`
                /* Global Table Sizing Overrides */
                .attendance-matrix-table {
                    font-size: 14px !important; /* Enhanced readable text size for grid data */
                }
                .attendance-matrix-table th {
                    font-size: 13px !important;
                    font-weight: 600 !important;
                    padding: 8px 4px !important;
                    vertical-align: middle !important;
                }
                .attendance-matrix-table td {
                    padding: 8px 6px !important;
                    vertical-align: middle !important;
                }
                .day-col {
                    min-width: 28px !important; /* Slightly wider to accommodate larger text numbers cleanly */
                    text-align: center;
                }
                .meta-table td {
                    border: none !important;
                    padding: 6px 0;
                    font-size: 15px;
                }
@media print {

  .no-print {
    display: none !important;
  }

  body {
    margin: 0;
    padding: 0;
  }

  .print-container {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  table {
    width: 100% !important;
    border-collapse: collapse !important;
  }

  th,
  td {
    border: 1px solid #000 !important;
  }
}
            `}</style>

      <div className="main-body">
        <div className="page-wrapper">
          <div className="page-body">
            <div className="row">
              <div className="col-md-12">
                <div className="card border-0 p-0">
                  {/* Control Panel */}
                  <div className="card-header-noprint bg-light mb-4 p-3 rounded  no-print">
                    <div className="row align-items-center">
                      <div className="col-md-8 fw-bold text-secondary">
                        Print Attendance Sheet - {sharedRowData.company_name} (
                        {sharedRowData.site_name})
                      </div>
                      <div className="col-md-4 text-end d-flex gap-2 justify-content-end">
                        <button
                          onClick={handlePrintClick}
                          className="btn btn-primary btn-sm px-3"
                        >
                          Print
                        </button>
                        <button
                          onClick={() => navigate(-1)}
                          className="btn btn-success btn-sm px-3"
                        >
                          Go Back
                        </button>
                        <button
                          onClick={handleDownloadExcelFrontend}
                          className="btn btn-success btn-sm px-3"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Document Brand Header Layout */}
                  <div ref={printRef} className="print-container">
                    <div className="card-body text-center p-0">
                      <div className="row mb-2">
                        <div className="col-md-12">
                          <h3
                            className="fw-bold m-0"
                            style={{
                              fontSize: "28px",
                              color: "#000",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {sharedRowData.company_name
                              ? sharedRowData.company_name.toUpperCase()
                              : ""}
                          </h3>
                          <p className="small text-muted m-0 mt-1">
                            Office No-1102, 11th Floor Technocity IT Premises
                            X-5/3, TTC Industrial Area, Near Hotel Sarovar
                            Portico & ICICI Bank, Mahape, Ghansoli Navi
                            Mumbai-400710
                          </p>
                          <p className="small text-muted m-0">
                            Tel.: 7977271174 | Email: operations@ekodex.in
                          </p>
                        </div>
                      </div>
                      <hr className="my-2" />

                      {/* Deployment Dynamic Row Info */}
                      <div className="row mb-2">
                        <div className="col-12">
                          <table className="table meta-table w-100 text-start m-0">
                            <tbody>
                              <tr className="text-dark">
                                <td>
                                  <strong className="fw-bold">
                                    Site Name:
                                  </strong>{" "}
                                  {sharedRowData.site_name}
                                </td>
                                <td>
                                  <strong className="fw-bold">Month:</strong>{" "}
                                  {monthNames[
                                    parseInt(sharedRowData.at_month, 10)
                                  ] || sharedRowData.at_month}
                                </td>
                                <td>
                                  <strong className="fw-bold">Year:</strong>{" "}
                                  {sharedRowData.at_year}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Matrix Employee Logs Data Grid */}
                      <div className="row">
                        <div className="col-md-12 table-responsive">
                          <table className="table table-bordered table-striped align-middle m-0">
                            <thead className="table-light">
                              <tr>
                                <th>Sr No.</th>
                                <th>Employee Name</th>
                                <th>Emp code</th>
                                <th>Rank</th>
                                <th>P.F.</th>
                                <th>ESIC</th>
                                {daysArray.map((day) => (
                                  <th key={day} className="day-col">
                                    {day}
                                  </th>
                                ))}
                                <th className="day-col fw-bold bg-success-subtle text-success-dark">
                                  N.D.
                                </th>
                                <th className="day-col fw-bold bg-warning-subtle text-warning-dark">
                                  O.T.
                                </th>
                                <th className="day-col">O.T/HRS</th>
                                <th className="day-col fw-bold bg-info-subtle text-info-dark">
                                  Off
                                </th>
                                <th className="day-col">Holiday</th>
                                <th className="day-col fw-bold bg-secondary text-white">
                                  Total
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {employees.map((emp, index) => {
                                const ndVal = parseFloat(emp.nd) || 0;
                                const otVal = parseFloat(emp.ot) || 0;
                                const offVal = parseFloat(emp.off) || 0;
                                const rowSum =
                                  Number(emp.nd || 0) +
                                  Number(emp.ot || 0) +
                                  Number(emp.off || 0) +
                                  Number(emp.holiday || 0);
                                return (
                                  <tr key={emp.empCode || index}>
                                    <td className="fw-bold text-dark">
                                      {index + 1}
                                    </td>
                                    <td
                                      className="text-start fw-semibold"
                                      style={{ whiteSpace: "nowrap" }}
                                    >
                                      {emp.empName}
                                    </td>
                                    <td>{emp.empCode}</td>
                                    <td className="text-start text-muted small">
                                      {emp.rank}
                                    </td>
                                    <td>{emp.pf || ""}</td>
                                    <td>{emp.esic || ""}</td>
                                    {daysArray.map((day) => (
                                      <td
                                        key={day}
                                        className="day-col fw-bold text-dark"
                                      >
                                        {emp.days?.[day] || ""}
                                      </td>
                                    ))}
                                    <td className="bg-success-subtle fw-bold text-success-dark">
                                      {emp.nd}
                                    </td>
                                    <td className="bg-warning-subtle fw-bold text-warning-dark">
                                      {emp.ot}
                                    </td>
                                    <td>{emp.otHrs || 0}</td>
                                    <td className="bg-info-subtle fw-bold text-info-dark">
                                      {emp.off}
                                    </td>
                                    <td>{emp.holiday || 0}</td>
                                    <td className="bg-darktext-white fw-bold bg-dark text-white">
                                      {rowSum}
                                    </td>
                                  </tr>
                                );
                              })}
                              {/* Summary Row Aggregates Bottom Footer */}
                              <tr
                                className="fw-bold table-light border-dark-top"
                                style={{ fontSize: "14px" }}
                              >
                                <td
                                  colSpan="6"
                                  className="text-end text-dark pe-3"
                                >
                                  Deployment Total:
                                </td>
                                {daysArray.map((day) => (
                                  <td
                                    key={day}
                                    className="day-col text-primary fw-bold"
                                  >
                                    {getColumnTotal(day) || "0"}
                                  </td>
                                ))}
                                {/* ✨ Dynamic total count columns matching image_0d1aef.png */}
                                <td className="bg-success-subtle text-success fw-bold">
                                  {totalND || "0"}
                                </td>
                                <td className="bg-warning-subtle text-warning fw-bold">
                                  {totalOT || "0"}
                                </td>
                                <td>{totalOTHrs || ""}</td>
                                <td className="bg-info-subtle text-info fw-bold">
                                  {totalOff || "0"}
                                </td>
                                <td>{totalHoliday || "0"}</td>
                                <td className="bg-dark fw-bold">
                                  {grandTotalOverall || "0"}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Physical Signature Sign-Off Verification Footer Block */}
                      <div className="row" style={{ marginTop: "75px" }}>
                        <div className="col-md-12">
                          <table className="table w-100 border-0 m-0">
                            <tbody>
                              <tr>
                                <td
                                  align="center"
                                  className="border-0"
                                  style={{ width: "50%" }}
                                >
                                  <div
                                    className="border-bottom mx-auto mb-2"
                                    style={{
                                      width: "190px",
                                      borderColor: "#bbb",
                                    }}
                                  ></div>
                                  <span className="fw-bold text-dark small">
                                    Signature of Manager
                                  </span>
                                </td>
                                <td
                                  align="center"
                                  className="border-0"
                                  style={{ width: "50%" }}
                                >
                                  <div
                                    className="border-bottom mx-auto mb-2"
                                    style={{
                                      width: "190px",
                                      borderColor: "#bbb",
                                    }}
                                  ></div>
                                  <span className="fw-bold text-dark small">
                                    Signature of Site In-Charge
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintAttendance;
