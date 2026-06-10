import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import {
  FaPlus,
  FaSearch,
  FaPen,
  FaTrashAlt,
} from "react-icons/fa";

import SearchPanel from "../../utils/FilterPanel";

import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Row,
  Table,
  Dropdown,
  Pagination,
} from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const BranchPage = () => {
  const [branches, setBranches] = useState([]);
  const [companies, setCompanies] = useState([]);
    const [pincodes, setPincodes] = useState([]);

  const [pincodeSearch, setPincodeSearch] = useState("");
  const [showPincodeList, setShowPincodeList] = useState(false);

  const pincodeRef = React.useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const API_URL = import.meta.env.VITE_API_URL;
  const initialFormData = {
    branchName: "",
    areaName: "",
    email: "",
    costingMethod: "FIFO",
    defSalesAccount: "",
    defBranchDispAccount: "",
    address: "",
    pincode: "",
    contactNo: "",
    defPurchaseAccount: "",
    defBranchRecvAccount: "",
    companyId: [],
  };
  const [formData, setFormData] = useState(initialFormData);

  const [searchFields, setSearchFields] = useState([
    { field: "branchName", keyword: "" },
  ]);
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });

  const branchSearchOptions = [
    { value: "branchName", label: "Branch Name" },
    { value: "areaName", label: "Area Name" },
    { value: "pincode", label: "Pincode" },
  ];
const handleNumberOnly = (e) => {
  const { name, value } = e.target;

  // allow only digits
  if (/^\d*$/.test(value)) {
    handleInputChange(e);
  }
};
  const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage] = useState(10);
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;

const currentBranches = branches.slice(
  indexOfFirstItem,
  indexOfLastItem
);

const totalPages = Math.ceil(
  branches.length / itemsPerPage
);
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

const fetchPincodes = async () => {
  try {
    const res = await api.get(`${API_URL}/api/pincodes`, getAuthHeaders());

    console.log("PINCODES API RESPONSE:", res.data); // 👈 ADD THIS

    setPincodes(res.data || []);
  } catch (err) {
    console.log(err);
  }
};

  // ================= FILTER =================
  const filteredPincodes = pincodes.filter((p) =>
    p.pincode?.toString().includes(pincodeSearch)
  );

  // ================= CLICK OUTSIDE =================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pincodeRef.current &&
        !pincodeRef.current.contains(event.target)
      ) {
        setShowPincodeList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ================= LOAD PINCODES =================
  useEffect(() => {
    fetchPincodes();
  }, []);


  const fetchBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      const validSearchFields = searchFields.filter(
        (f) => f.field && f.keyword,
      );
      if (validSearchFields.length > 0) {
        params.searchFields = JSON.stringify(validSearchFields);
      }
      if (dateFilter.from && dateFilter.to) {
        params.fromDate = dateFilter.from;
        params.toDate = dateFilter.to;
      }
      const res = await api.get(`${API_URL}/api/branches`, {
        params,
        ...getAuthHeaders(),
      });
      setBranches(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else setError("Failed to load branches.");
    } finally {
      setLoading(false);
    }
  };

const fetchCompanies = async () => {
  try {
    const response = await api.get(
      `${API_URL}/api/companies`,
      getAuthHeaders()
    );

    console.log("COMPANY RESPONSE =", response.data);

    // ✅ Correct
    setCompanies(response.data.data || []);
  } catch (error) {
    console.log(error);
  }
};

  useEffect(() => {
    fetchBranches();
    fetchCompanies();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    const key = name;
    if (validationErrors[key]) {
      setValidationErrors((prev) => ({
        ...prev,
        [key]: "",
      }));
    }
  };

  const handleCompanySelection = (companyId) => {
    const selectedCompanies = [...formData.companyId];
    const index = selectedCompanies.indexOf(companyId);
    if (index > -1) {
      selectedCompanies.splice(index, 1);
    } else {
      selectedCompanies.push(companyId);
    }
    setFormData({ ...formData, companyId: selectedCompanies });

    if (validationErrors.companyId) {
      setValidationErrors((prev) => ({
        ...prev,
        companyId: "",
      }));
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setValidationErrors({});
    setIsEditing(null);
    // setShowForm(false);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.branchName.trim()) {
      errors.branchName = "Branch name is required.";
    }

    if (!formData.companyId || formData.companyId.length === 0) {
      errors.companyId = "Please select at least one company.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fix validation errors");
      return;
    }

    try {
      const selectedCompanyNames = companies
  .filter((c) =>
    formData.companyId.includes(Number(c.id))
  )
  .map((c) => c.company_name)
  .join(",");

      const payload = {
        branch_name: formData.branchName,
        branch_code: "",
        company_name: selectedCompanyNames,
        company_id: formData.companyId.join(","),

        email: formData.email,
        address: formData.address,
        city: formData.areaName,
        pincode: formData.pincode,

        costing_method: formData.costingMethod,
        def_purchase_ac: formData.defPurchaseAccount,
        def_sales_ac: formData.defSalesAccount,
        def_branch_recv_ac: formData.defBranchRecvAccount,
        def_branch_desp_ac: formData.defBranchDispAccount,

        phone: formData.contactNo,
      };

     const url = isEditing
  ? `${API_URL}/api/branches/update/${isEditing.id}`
  : `${API_URL}/api/branches`;

const method = "post";

await api.post(url, payload, {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

      alert(`Branch ${isEditing ? "updated" : "created"} successfully!`);

      resetForm();
      setShowForm(false);
      fetchBranches();
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Operation failed");
    }
  };

const handleEdit = (branch) => {
  setIsEditing(branch);

  setValidationErrors({});

  setFormData({
    branchName: branch.branch_name || "",
    areaName: branch.city || "",
    email: branch.email || "",
    costingMethod: branch.costing_method || "FIFO",

    defSalesAccount: branch.def_sales_ac || "",
    defBranchDispAccount: branch.def_branch_desp_ac || "",

    address: branch.address || "",
    pincode: branch.pincode || "",
    contactNo: branch.phone || "",

    defPurchaseAccount: branch.def_purchase_ac || "",
    defBranchRecvAccount: branch.def_branch_recv_ac || "",

    companyId: branch.company_id
      ? branch.company_id.split(",").map(Number)
      : [],
  });

  // IMPORTANT
  setPincodeSearch(branch.pincode || "");

  setShowForm(true);
  setShowSearch(false);
};

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      try {
        await api.delete(`${API_URL}/api/branches/${id}`, getAuthHeaders());
        alert("Branch deleted successfully!");
        fetchBranches();
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else alert("Delete operation failed!");
      }
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [searchFields, dateFilter]);

  const handleSearch = () => fetchBranches();

  const resetSearch = () => {
    setSearchFields([{ field: "branchName", keyword: "" }]);
    setDateFilter({ from: "", to: "" });
    fetchBranches();
  };

  const handleDownloadExcel = async () => {
    try {
      const params = {};
      const validSearch = searchFields.filter((f) => f.field && f.keyword);
      if (validSearch.length > 0)
        params.searchFields = JSON.stringify(validSearch);

      if (dateFilter.from && dateFilter.to) {
        params.fromDate = dateFilter.from;
        params.toDate = dateFilter.to;
      }

      const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000);

      const response = await api.get(`${API_URL}/api/branches/export`, {
        params,
        responseType: "blob", // IMPORTANT
        ...getAuthHeaders(),
      });

      // Create Excel File
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Branches_${randomNumber}.xlsx`;
      link.click();
    } catch (error) {
      // api sends 401 here
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      console.error("Excel download error:", error);
      alert("Failed to download Excel. Please try again.");
    }
  };

  return (
    <div
  className="page-container"
  style={{
    fontSize: "13px",
  }}
>
      <div className="page-header">
        <h1 className="page-title">
          Branch Management{" "}
          <span className="text-success">({branches.length})</span>
        </h1>
        <div className="page-actions">
          <button
  type="button"
  className="btn btn-warning btn-sm" // Changed class name
            onClick={() => setShowSearch(!showSearch)}
          >
            <FaSearch /> {showSearch ? "Hide Search" : "Search"}
          </button>
        <button
  type="button"
  className="btn btn-primary btn-sm"// Changed class name
            onClick={() => {
              resetForm();
              // setIsEditing(null);
              setShowSearch(false);
              setShowForm(true);
            }}
          >
            <FaPlus /> Create New
          </button>
        </div>
      </div>

      {showSearch && (
        <SearchPanel
          searchFields={searchFields}
          setSearchFields={setSearchFields}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          onSearch={handleSearch}
          onReset={resetSearch}
          onDownloadExcel={handleDownloadExcel}
          searchOptions={branchSearchOptions}
        />
      )}

      {showForm && (
       <Card className="shadow-sm border-0">
         <h2 className="card-header bg-primary text-white mb-0 py-3">
            {isEditing ? (
              <span>Edit Branch - {isEditing.branch_name}</span>
            ) : (
              "Create New Branch"
            )}
          </h2>
          {Object.keys(validationErrors).length > 0 && (
            <Alert variant="danger">
              Please fix the validation errors below.
            </Alert>
          )}
          <Card.Body>
          <Form className="branch-form" onSubmit={handleSubmit}>
            <Row>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="branchName">
                  <Form.Label>Branch Name *</Form.Label>
                  <Form.Control
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleInputChange}
                    placeholder="Enter Branch name"
                    isInvalid={!!validationErrors.branchName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.branchName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
             <Form.Group controlId="address">
  <Form.Label>Address</Form.Label>

  <Form.Control
    as="textarea"
    rows={3}
    name="address"
    value={formData.address}
    onChange={handleInputChange}
    placeholder="Enter address"
  />
</Form.Group>
              </Col>
                <Col xs={12} sm={6} md={3} className="mb-3">
             
                 <Form.Group>
                  <Form.Label>Pincode</Form.Label>

                  <div style={{ position: "relative" }} ref={pincodeRef}>
                    <Form.Control
                      value={pincodeSearch}
                      placeholder="Search Pincode..."
                      autoComplete="off"
                      onChange={(e) => {
                        setPincodeSearch(e.target.value);
                        setShowPincodeList(true);
                      }}
                      onFocus={() => setShowPincodeList(true)}
                    />

                    {showPincodeList && (
                      <div
                        style={{
                          position: "absolute",
                          width: "100%",
                          background: "#fff",
                          border: "1px solid #ddd",
                          zIndex: 999,
                          maxHeight: "200px",
                          overflowY: "auto",
                        }}
                      >
                        {filteredPincodes.length > 0 ? (
                          filteredPincodes.map((item) => (
                            <div
                              key={item.id}
                              style={{
                                padding: "8px",
                                cursor: "pointer",
                              }}
                             onClick={() => {
  setFormData((prev) => ({
    ...prev,
    pincode: item.pincode,
    areaName: item.area_name || "",
    regionState: item.state || "",
    country: item.country || "",
  }));

  setPincodeSearch(item.pincode);
  setShowPincodeList(false);
}}
                            >
                              {item.pincode} - {item.area_name}
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: "8px" }}>
                            No pincode found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
              <Form.Group controlId="areaName">
  <Form.Label>City</Form.Label>
  <Form.Control
    name="areaName"
    value={formData.areaName}
    placeholder="Auto filled from pincode"
    readOnly   // ✅ IMPORTANT
  />
</Form.Group>
              </Col>
            
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="email">
                  <Form.Label>Email ID</Form.Label>
                  <Form.Control
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email ID"
                    type="text"
                  />
                </Form.Group>
              </Col>
             <Col xs={12} sm={6} md={3} className="mb-3">
  <Form.Group controlId="contactNo">
    <Form.Label>Contact No</Form.Label>
    <Form.Control
      name="contactNo"
      value={formData.contactNo}
      onChange={(e) => {
        const value = e.target.value;

        // allow only numbers
        if (/^\d*$/.test(value)) {
          handleInputChange(e);
        }
      }}
      maxLength={10}
      placeholder="Enter Contact No"
      inputMode="numeric"
    />
  </Form.Group>
</Col>
              <Col xs={12} sm={6} md={3} className="mb-3">
                <Form.Group controlId="costingMethod">
                  <Form.Label>Costing Method</Form.Label>
                  <Form.Select
                    name="costingMethod"
                    value={formData.costingMethod}
                    onChange={handleInputChange}
                  >
                    <option value="FIFO">FIFO</option>
                    <option value="LIFO">LIFO</option>
                  </Form.Select>
                </Form.Group>
              </Col>
       <Col xs={12} sm={6} md={3} className="mb-3">
  <Form.Group controlId="defPurchaseAccount">
    <Form.Label>Def. Purchase Account</Form.Label>
    <Form.Control
      name="defPurchaseAccount"
      value={formData.defPurchaseAccount}
      onChange={handleNumberOnly}
      placeholder="Def. Purchase Account"
      inputMode="numeric"
    />
  </Form.Group>
</Col>

<Col xs={12} sm={6} md={3} className="mb-3">
  <Form.Group controlId="defSalesAccount">
    <Form.Label>Def. Sales Account</Form.Label>
    <Form.Control
      name="defSalesAccount"
      value={formData.defSalesAccount}
      onChange={handleNumberOnly}
      placeholder="Def. Sales Account"
      inputMode="numeric"
    />
  </Form.Group>
</Col>

<Col xs={12} sm={6} md={3} className="mb-3">
  <Form.Group controlId="defBranchRecvAccount">
    <Form.Label>Def. Branch Recv. Account</Form.Label>
    <Form.Control
      name="defBranchRecvAccount"
      value={formData.defBranchRecvAccount}
      onChange={handleNumberOnly}
      placeholder="Def. Branch Recv. Account"
      inputMode="numeric"
    />
  </Form.Group>
</Col>

<Col xs={12} sm={6} md={3} className="mb-3">
  <Form.Group controlId="defBranchDispAccount">
    <Form.Label>Def. Branch Disp. Account</Form.Label>
    <Form.Control
      name="defBranchDispAccount"
      value={formData.defBranchDispAccount}
      onChange={handleNumberOnly}
      placeholder="Def. Branch Disp. Account"
      inputMode="numeric"
    />
  </Form.Group>
</Col>
            </Row>
            <hr />
<div className="mb-3 branch-company-selection">
  <h4 className="fs-5">Select Company *</h4>

  {companies.length > 0 ? (
   <div className="row">
  {companies.map((company) => (
    <div key={company.id} className="col-6 col-md-3 mb-2">
      <Form.Check
        type="checkbox"
        id={`company-${company.id}`}
        label={company.company_name}
        checked={formData.companyId.includes(Number(company.id))}
        onChange={() => handleCompanySelection(Number(company.id))}
      />
    </div>
  ))}
</div>
  ) : (
    <p>No Companies Found</p>
  )}

  {validationErrors.companyId && (
    <div className="invalid-feedback d-block">
      {validationErrors.companyId}
    </div>
  )}
</div>

            <div className="form-actions d-flex justify-content-end">
              <Button
                variant="secondary"
                className="me-2"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </Button>
              <Button type="button" variant="primary" onClick={handleSubmit}>
                {isEditing ? "Update Company" : "Save Company"}
              </Button>
            </div>
          </Form>
          </Card.Body>
        </Card>
      )}

      {/* Branch List Table */}
      {!showForm && (
        <Card className="branch-card">
          {loading ? (
            <Alert variant="warning" className="mb-0 text-center">
              Loading...
            </Alert>
          ) : error ? (
            <Alert variant="danger" className="mb-0 text-center">
              {error}
            </Alert>
          ) : (
           <Table hover bordered responsive>
  <thead className="table-secondary">
    <tr>
      <th>Sr No</th>
      <th>Branch Name</th>
      <th>Area Name</th>
      <th>Address</th>
      <th>Pincode</th>
      <th>Companies</th>

      {/* ONE COLUMN */}
      <th>Created / Modified</th>

      <th>Actions</th>
    </tr>
  </thead>

  <tbody>
    {branches.length === 0 ? (
      <tr className="text-center">
        <td colSpan={8}>No data found</td>
      </tr>
    ) : (
      currentBranches.map((branch, index) => (
        <tr key={branch.id}>

         <td>{indexOfFirstItem + index + 1}</td>

          <td>{branch.branch_name}</td>

          <td>{branch.city || "-"}</td>

          <td>{branch.address}</td>

          <td>{branch.pincode}</td>

          <td>{branch.company_name || "-"}</td>

          {/* CREATED / MODIFIED */}
          <td>
            <div>
              <strong>C:</strong>{" "}
              {branch.created_on
                ? new Date(
                    branch.created_on
                  ).toLocaleDateString()
                : "-"}
            </div>

            <div>
  <strong>M:</strong>{" "}
  {branch.modified_on &&
  !isNaN(new Date(branch.modified_on))
    ? new Date(branch.modified_on).toLocaleDateString("en-GB")
    : "-"}
</div>
          </td>

          <td>
            <div className="dropdown">
              <button
                className="btn btn-sm btn-secondary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Actions
              </button>

              <ul className="dropdown-menu">
                <li>
                  <button
                    className="dropdown-item d-flex align-items-center gap-2"
                    onClick={() =>
                      handleEdit(branch)
                    }
                  >
                    <FaPen /> Edit
                  </button>
                </li>

                <li>
                  <button
                    className="dropdown-item d-flex align-items-center gap-2 text-danger"
                    onClick={() =>
                      handleDelete(branch.id)
                    }
                  >
                    <FaTrashAlt /> Delete
                  </button>
                </li>
              </ul>
            </div>
          </td>

        </tr>
      ))
    )}
  </tbody>
</Table>
          )}
          <div className="d-flex justify-content-end mt-3">
  <ul className="pagination">

    {/* Prev */}
    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
      <button
        className="page-link"
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        Prev
      </button>
    </li>

    {/* Pages */}
    {[...Array(totalPages)].map((_, i) => (
      <li
        key={i}
        className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
      >
        <button
          className="page-link"
          onClick={() => setCurrentPage(i + 1)}
        >
          {i + 1}
        </button>
      </li>
    ))}

    {/* Next */}
    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
      <button
        className="page-link"
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        Next
      </button>
    </li>

  </ul>
</div>
        </Card>
      )}
    </div>
  );
};

export default BranchPage;
