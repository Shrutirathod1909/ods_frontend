import React, {  useEffect,useState } from "react";
import axios from "axios";
import Select from "react-select";
import {
  Alert,
  Table,
  Dropdown,
  Modal,
  Button,
  Form,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import {
  FaEllipsisV,
  FaPen,
  FaMoneyBill,
  FaExchangeAlt,
  FaTrash,
} from "react-icons/fa";
const API_URL = import.meta.env.VITE_API_URL;


const handleGenerateOfferLetter = async (emp) => {
  try {
    const token = localStorage.getItem("token");
    const empId = emp._id || emp.id;

    const response = await fetch(
      `${API_URL}/api/employees/${empId}/generate-offer-letter`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to generate offer letter");
    }

    const blob = await response.blob();

    if (!blob || blob.size === 0) {
      throw new Error("Empty PDF received");
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `OfferLetter_${emp.employee_code || empId}.pdf`;

    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error(err);
    alert("Offer Letter generation failed: " + err.message);
  }
};


const EmployeeTable = ({
  loading,
  error,
  employees,
  activeTab,
  onEdit,
  onUpdateSalary,
  onChangeStatus,
  onDelete,
  onVerificationClick,
  showVerificationModal,
  setShowVerificationModal,
  showVerifiedModal,
  setShowVerifiedModal,
  selectedEmployee,
  verificationData,
  setVerificationData,
  fetchEmployees,

 

  employeeTypes,
  reportingManagers,
  setSelectedEmployee,
  showDisabledList,
  disabledEmployees,
  handleRestoreEmployee,
}) => {
    const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/clients`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setCompanies(res.data?.data ?? res.data ?? []);
      } catch (err) {
        setCompanies([]);
      }
    };

    fetchCompanies();
  }, []);

  // ============================
  // COMPANY CHANGE (GLOBAL)
  // ============================
const handleCompanyChange = async (selected) => {
  setSelectedEmployee((prev) => ({
    ...prev,
    company_id: selected ? Number(selected.value) : null,
    company_name: selected ? selected.label : "",
    site_id: null,
  }));

  if (selected) {
    await fetchSites(selected.value);
  }
};
const fetchSites = async (companyId) => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `${API_URL}/api/sites/company/${companyId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("SITES =", res.data);

    setSites(res.data?.data || res.data || []);
  } catch (err) {
    console.error("FETCH SITE ERROR =", err);
    setSites([]);
  }
};
    console.log("COMPANIES DATA:", companies);
  console.log("SITES DATA:", sites);
  const [employeeDocs, setEmployeeDocs] = useState([]);
 const openVerificationModal = async (employee) => {
    try {

      console.log("EMPLOYEE =", employee);

      setSelectedEmployee(employee);

      setShowVerificationModal(true);

      const token = localStorage.getItem("token");

      const employeeId = employee.id || employee._id;

      console.log("EMPLOYEE ID =", employeeId);

      const res = await axios.get(
        `${API_URL}/api/employees/documents/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API RESPONSE =", res.data);

      setEmployeeDocs(res.data.data || []);

    } catch (err) {

      console.log("DOCUMENT ERROR =", err);

      alert("Failed to load documents");
    }
  };
  const handleUpdateDocument = async (doc) => {

  try {

    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${API_URL}/api/employees/documents/${doc.id}`,
      {
        doc_status: doc.doc_status,
        doc_remark: doc.doc_remark,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("UPDATE RESPONSE =", response.data);

    alert("Document Updated Successfully");

  } catch (err) {

    console.log("UPDATE ERROR =", err);

    alert("Failed To Update Document");
  }
};
  return (
    
    <div className="table-responsive">
      {loading ? (
        <Alert variant="warning" className="mb-0 text-center">
          Loading clients...
        </Alert>
      ) : error ? (
        <Alert variant="danger" className="mb-0 text-center">
          {error}
        </Alert>
      ) : (
        <Table hover bordered responsive className="employee-table">
          <thead className="table-secondary">
            <tr>
              <th>Sr No.</th>
              <th>Code & Name</th>
              <th>Designation</th>
              <th>Client</th>
              <th>Created & Modified Detail</th>
              <th>Attachement</th>
              <th>Verification</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr className="text-center">
                <td colSpan={9}>No data found</td>
              </tr>
            ) : (
              employees.map((emp, index) => (
        <tr key={emp._id || emp.id}>
                  <td>{index + 1}</td>
                  <td>
                    Code: {emp.employee_code} <br />
                    {emp.initial} {emp.first_name} {emp.last_name} <br />
                    {emp.uan_no && `UAN No: ${emp.uan_no}`} <br />
                    {emp.esisNo && `ESIS No: ${emp.esisNo}`}
                  </td>
                  <td>{emp.rank}</td>
                  <td>
                    {emp.company_name || "N/A"}
                    <br />
                    {emp.client_id ? "Client Code: " + emp.client_id : "N/A"}
                    <br />
                    {emp.site_name ? "Site Name: " + emp.site_name : "N/A"}
                  </td>
                  <td>
                    {emp.created_by?.name} <br />
                    {new Date(emp.created_on).toLocaleDateString("en-GB")}
                    <br />
                    {new Date(emp.modified_on).toLocaleDateString("en-GB")}
                  </td>
                  <td>
                    {[
                      emp.aadharcard_1,
                      emp.attachment_2,
                      emp.attachment_3,
                      emp.attachment_4,
                    ]
                      .filter(Boolean)
                      .map((file, i) => (
                        <div key={i}>
                          <a
                            href={`${import.meta.env.VITE_API_URL}/uploads/${file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                             Attachment {i + 1}
                          </a>
                        </div>
                      ))}

                    {!emp.attachment_1 &&
                      !emp.attachment_2 &&
                      !emp.attachment_3 &&
                      !emp.attachment_4 && (
                        <span className="text-muted">No Attachment</span>
                      )}
                  </td>
<td>
  <span
    className={`badge ${
      emp.emp_stages === "Approved"
        ? "bg-primary"
        : emp.verify_on
        ? "bg-success"
        : "bg-warning text-dark"
    }`}
    style={{ cursor: "pointer" }}
    onClick={() => {
      if (emp.emp_stages === "Approved") {
        onVerificationClick(emp, "approved");
      } else if (emp.verify_on) {
        onVerificationClick(emp, "verified");
      } else {
          openVerificationModal(emp, "pending");
      }
    }}
  >
    {emp.emp_stages === "Approved"
      ? "Approved"
      : emp.verify_on
      ? "Verified"
      : "Pending"}
  </span>
</td>
                  <td>
                    <span
                      className={`status-badge status-${emp?.status?.toLowerCase()}`}
                    >
                      {emp?.em_status}
                    </span>
                  </td>
                  <td>
                    <Dropdown align="end">
                      <Dropdown.Toggle
                        variant="secondary"
                        size="sm"
                        className="border-0 shadow-none"
                      >
                        Action
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => onEdit(emp)}>
                          <FaPen className="me-2 text-primary" />
                          Edit
                        </Dropdown.Item>

                        <Dropdown.Item onClick={() => onUpdateSalary(emp.id)}>
                          <FaMoneyBill className="me-2 text-success" />
                          Update Salary
                        </Dropdown.Item>

                        <Dropdown.Item onClick={() => onChangeStatus(emp)}>
                          <FaExchangeAlt className="me-2 text-warning" />
                          Change Status
                        </Dropdown.Item>

                        <Dropdown.Divider />

                        <Dropdown.Item
                          onClick={() => onDelete(emp.id)}
                          className="text-danger"
                        >
                          <FaTrash className="me-2" />
                          Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                    {activeTab === "Offer" && (
                      <Button
                        size="sm"
                        className="mt-2 w-100"
                        variant="primary"
                        onClick={() => handleGenerateOfferLetter(emp)}
                      >
                        Generate Letter
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
  
<Modal
  show={showVerificationModal}
  onHide={() => setShowVerificationModal(false)}
  size="xl"
>
  <Modal.Header closeButton>
    <Modal.Title>
      Employee Verification
    </Modal.Title>
  </Modal.Header>

  <Modal.Body>
    {selectedEmployee && (
      <>
        {/* ========================================= */}
        {/* EMPLOYEE DETAILS */}
        {/* ========================================= */}

        <Row className="mb-3">
          <Col md={6}>
            <strong>Employee Name</strong>

            <div>
              {selectedEmployee.first_name}{" "}
              {selectedEmployee.last_name}
            </div>
          </Col>

          <Col md={6}>
            <strong>Employee Code</strong>

            <div>
              {selectedEmployee.employee_code}
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <strong>Designation</strong>

            <div>{selectedEmployee.rank}</div>
          </Col>

          <Col md={6}>
            <strong>Status</strong>

            <div>
              <span className="badge bg-success">
                {verificationData.status}
              </span>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <strong>Verified By</strong>

            <div>
              {selectedEmployee.verify_name ||
                "N/A"}
            </div>
          </Col>

          <Col md={6}>
            <strong>Verified Date</strong>

            <div>
              {selectedEmployee.verify_on
                ? new Date(
                    selectedEmployee.verify_on
                  ).toLocaleDateString(
                    "en-GB"
                  )
                : "N/A"}
            </div>
          </Col>
        </Row>

        {/* ========================================= */}
        {/* DOCUMENTS */}
        {/* ========================================= */}

        <hr />

        <h5 className="mb-3">
          Uploaded Documents
        </h5>

        {employeeDocs.length === 0 ? (
          <Alert variant="danger">
            No Documents Found
          </Alert>
        ) : (
          <Row>
            {employeeDocs.map(
              (doc, index) => {

                const fixedPath =
                  doc.source?.replace(
                    /\\/g,
                    "/"
                  );

                const fileUrl =
                  `${API_URL}/${fixedPath}`;

                const isImage =
                  fixedPath?.match(
                    /\.(jpg|jpeg|png|gif|webp)$/i
                  );

                return (
                  <Col
                    md={6}
                    key={doc.id || index}
                    className="mb-4"
                  >
                    <div className="border rounded p-3 h-100 shadow-sm">

                      {/* DOCUMENT TYPE */}

                      <div className="mb-2">
                        <strong>
                          Document Type
                        </strong>

                        <div>
                          {doc.doc_type}
                        </div>
                      </div>

                      {/* IMAGE */}

                      <div className="text-center mb-3">

                        {isImage ? (
                          <img
                            src={fileUrl}
                            alt="document"
                            style={{
                              width:
                                "150px",
                              height:
                                "150px",
                              objectFit:
                                "cover",
                              border:
                                "1px solid #ddd",
                              borderRadius:
                                "10px",
                              cursor:
                                "pointer",
                            }}
                            onClick={() =>
                              window.open(
                                fileUrl,
                                "_blank"
                              )
                            }
                            onError={(e) => {
                              e.target.src =
                                "/no-image.png";
                            }}
                          />
                        ) : (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary btn-sm"
                          >
                            View Document
                          </a>
                        )}
                      </div>

                      {/* STATUS */}

                      <div className="mb-3">
                        <strong>
                          Document Status
                        </strong>

                        <Form.Select
                          className="mt-1"
                          value={
                            doc.doc_status ||
                            "Pending"
                          }
                          onChange={(e) => {

                            const updatedDocs =
                              employeeDocs.map(
                                (
                                  item,
                                  i
                                ) =>
                                  i ===
                                  index
                                    ? {
                                        ...item,
                                        doc_status:
                                          e
                                            .target
                                            .value,
                                      }
                                    : item
                              );

                            setEmployeeDocs(
                              updatedDocs
                            );
                          }}
                        >
                          <option value="Pending">
                            Pending
                          </option>

                          <option value="Approved">
                            Approved
                          </option>

                          <option value="Reject">
                            Reject
                          </option>
                        </Form.Select>
                      </div>

                      {/* REMARK */}

                      <div>
                        <strong>
                          Remark
                        </strong>

                        <Form.Control
                          className="mt-1"
                          type="text"
                          placeholder="Enter Remark"
                          value={
                            doc.doc_remark ||
                            ""
                          }
                          onChange={(e) => {

                            const updatedDocs =
                              employeeDocs.map(
                                (
                                  item,
                                  i
                                ) =>
                                  i ===
                                  index
                                    ? {
                                        ...item,
                                        doc_remark:
                                          e
                                            .target
                                            .value,
                                      }
                                    : item
                              );

                            setEmployeeDocs(
                              updatedDocs
                            );
                          }}
                        />
                      </div>
                    </div>
                  </Col>
                );
              }
            )}
          </Row>
        )}

        {/* ========================================= */}
        {/* COMPANY + SITE */}
        {/* ========================================= */}

        <hr />

        <Row className="mb-3">

          {/* COMPANY */}

          <Col md={6}>
            <Form.Group>
              <Form.Label>
                Client / Company
              </Form.Label>

              <Select
                options={companies.map(
                  (c) => ({
                    value: String(
                      c.id || c._id
                    ),
                    label:
                      c.company_name ||
                      c.companyName,
                  })
                )}
                value={
                  companies
                    .map((c) => ({
                      value: String(
                        c._id ||
                          c.id
                      ),
                      label:
                        c.companyName ||
                        c.company_name,
                    }))
                    .find(
                      (opt) =>
                        opt.value ===
                        String(
                          selectedEmployee?.company_id
                        )
                    ) || null
                }
                onChange={
                  handleCompanyChange
                }
              />
            </Form.Group>
          </Col>

          {/* SITE */}

          <Col md={6}>
            <Form.Group>
              <Form.Label>
                Location / Site
              </Form.Label>

              <Select
                isDisabled={
                  !selectedEmployee?.company_id
                }
                options={sites.map(
                  (s) => ({
                    value: String(
                      s.site_id ||
                        s.id ||
                        s._id
                    ),
                    label:
                      s.site_name,
                  })
                )}
                value={
                  sites
                    .map((s) => ({
                      value: String(
                        s.site_id ||
                          s.id ||
                          s._id
                      ),
                      label:
                        s.site_name,
                    }))
                    .find(
                      (opt) =>
                        opt.value ===
                        String(
                          selectedEmployee?.site_id
                        )
                    ) || null
                }
                onChange={(
                  selected
                ) =>
                  setSelectedEmployee(
                    (prev) => ({
                      ...prev,
                      site_id:
                        selected
                          ? String(
                              selected.value
                            )
                          : "",
                      site_name:
                        selected
                          ? selected.label
                          : "",
                    })
                  )
                }
              />
            </Form.Group>
          </Col>
        </Row>

        {/* ========================================= */}
        {/* STATUS */}
        {/* ========================================= */}

        <Form.Group className="mb-3">
          <Form.Label>
            Verification Status
          </Form.Label>

          <Form.Select
            value={
              verificationData.status
            }
            onChange={(e) =>
              setVerificationData({
                ...verificationData,
                status:
                  e.target.value,
              })
            }
          >
            <option value="Pending">
              Pending
            </option>

            <option value="Verified">
              Verified
            </option>

            <option value="On Hold">
              On Hold
            </option>

            <option value="Reject">
              Reject
            </option>
          </Form.Select>
        </Form.Group>

        {/* REMARK */}

        <Form.Group className="mb-3">
          <Form.Label>
            Verification Remark
          </Form.Label>

          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter verification remark"
            value={
              verificationData.remark
            }
            onChange={(e) =>
              setVerificationData({
                ...verificationData,
                remark:
                  e.target.value,
              })
            }
          />
        </Form.Group>
      </>
    )}
  </Modal.Body>

  <Modal.Footer>

    <Button
      variant="secondary"
      onClick={() =>
        setShowVerificationModal(
          false
        )
      }
    >
      Close
    </Button>

    <Button
      variant="success"
      onClick={async () => {

        try {

          const token =
            localStorage.getItem(
              "token"
            );

          // =========================================
          // UPDATE ALL DOCUMENTS
          // =========================================

          for (const doc of employeeDocs) {

            await axios.post(

              `${API_URL}/api/employees/documents/${doc.id}`,

              {
                doc_status:
                  doc.doc_status,

                doc_remark:
                  doc.doc_remark,
              },

              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );
          }

          // =========================================
          // EMPLOYEE VERIFY
          // =========================================

 const employeeId =
  selectedEmployee?.id ||
  selectedEmployee?._id ||
  selectedEmployee?.emp_id;

console.log("employeeId =", employeeId);

const response = await fetch(

  `${API_URL}/api/employees/verify/${employeeId}`,

  {
    method: "PUT",

    headers: {
      Authorization:
        `Bearer ${token}`,

      "Content-Type":
        "application/json",
    },

  body: JSON.stringify({
  verification_remark: verificationData.remark,
  status: verificationData.status,
  company_id: selectedEmployee.company_id,
  site_id: selectedEmployee.site_id,
}),
  }
);

const result =
  await response.json();

console.log(result);

          

          if (!response.ok) {

            throw new Error(
              result.message ||
              "Failed to verify employee"
            );
          }

          alert(
            "Documents + Verification Updated Successfully"
          );

          setShowVerificationModal(
            false
          );
console.log("Submitting", {
  company_id: selectedEmployee.company_id,
  site_id: selectedEmployee.site_id,
});
          fetchEmployees();

        } catch (err) {

          console.error(err);

          alert(err.message);
        }
      }}
    >
      Submit
    </Button>
  </Modal.Footer>

      </Modal>

      <Modal
        centered
        show={showVerifiedModal}
        onHide={() => setShowVerifiedModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Verified Employee Details</Modal.Title>
        </Modal.Header>
<Modal.Body>
  {selectedEmployee && (
    <>
      <Row className="mb-3">
        <Col md={6}>
          <strong>Employee Name</strong>
          <div>
            {selectedEmployee.first_name} {selectedEmployee.last_name}
          </div>
        </Col>

        <Col md={6}>
          <strong>Employee Code</strong>
          <div>{selectedEmployee.employee_code}</div>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <strong>Designation</strong>
          <div>{selectedEmployee.rank}</div>
        </Col>

        <Col md={6}>
          <strong>Status</strong>
          <div>
            <span className="badge bg-success">Verified</span>
          </div>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <strong>Verified By</strong>
          <div>{selectedEmployee.verify_name || "N/A"}</div>
        </Col>

        <Col md={6}>
          <strong>Verified Date</strong>
          <div>
            {selectedEmployee.verify_on
              ? new Date(selectedEmployee.verify_on).toLocaleDateString(
                  "en-GB"
                )
              : "N/A"}
          </div>
        </Col>
      </Row>

      {/* Company + Site */}
<Row className="mb-3">
  {/* COMPANY */}
  <Col md={6}>
    <Form.Group>
      <Form.Label>Company</Form.Label>

      <Select
        options={companies.map((c) => ({
          value: String(c._id || c.id),
          label: c.companyName || c.company_name,
        }))}
        value={
          companies
            .map((c) => ({
              value: String(c._id || c.id),
              label: c.companyName || c.company_name,
            }))
            .find(
              (opt) =>
                opt.value === String(selectedEmployee?.company_id)
            ) || null
        }
        onChange={handleCompanyChange}
      />
    </Form.Group>
  </Col>

  {/* SITE */}
  <Col md={6}>
    <Form.Group>
      <Form.Label>Site</Form.Label>

      <Select
        isDisabled={!selectedEmployee?.company_id}
        options={sites.map((s) => ({
          value: String(s.site_id || s.id || s._id),
          label: s.site_name,
        }))}
        value={
          sites
            .map((s) => ({
              value: String(s.site_id || s.id || s._id),
              label: s.site_name,
            }))
            .find(
              (opt) =>
                opt.value === String(selectedEmployee?.site_id)
            ) || null
        }
        onChange={(selected) =>
          setSelectedEmployee((prev) => ({
            ...prev,
            site_id: selected?.value || "",
            site_name: selected?.label || "",
          }))
        }
      />
    </Form.Group>
  </Col>
</Row>

     

      <Form.Group className="mb-3">
        <Form.Label>Status</Form.Label>

        <Form.Select
          value={verificationData.status}
          onChange={(e) =>
            setVerificationData({
              ...verificationData,
              status: e.target.value,
            })
          }
        >
          <option value="Pending">Pending</option>
          <option value="Offer Letter Issued">Offer Letter Issued</option>

          <option value="On Hold">On Hold</option>
          <option value=" Reject">Reject</option>

        </Form.Select>
      </Form.Group>
    </>
  )}
</Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowVerifiedModal(false)}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                  `${API_URL}/api/employees/${selectedEmployee.id}/offer-status`,
                  {
                    method: "PUT",
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      companies_id: selectedEmployee.companies_id,
                      site_id: selectedEmployee.site_id,
                      employee_type: selectedEmployee.employee_type,
                      reporting_manager: selectedEmployee.reporting_manager,

                      // change status after submit
                      verification_status: "Approved",
                    }),
                  },
                );

                const result = await response.json();

console.log("STATUS:", response.status);
console.log("RESULT:", result);

if (!response.ok) {
  throw new Error(
    result.error ||
    result.message ||
    JSON.stringify(result)
  );
}

                if (!response.ok) {
                  throw new Error(result.message || "Failed to update");
                }

                alert("Employee Approved Successfully");

                setShowVerifiedModal(false);

                fetchEmployees();
              } catch (err) {
                console.error(err);
                alert(err.message);
              }
            }}
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EmployeeTable;
