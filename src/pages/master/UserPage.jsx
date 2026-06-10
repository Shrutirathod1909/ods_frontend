import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import SearchPanel from "../../utils/FilterPanel";
import { FaPen, FaTrashAlt, FaEye, FaPlus, FaSearch } from "react-icons/fa"; // Added FaPlus, FaSearch
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Image,
  Modal,
  Row,
  Table,
  Dropdown,
    Pagination,
} from "react-bootstrap";
import defaultImg from "./download.jfif";
 const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
const [currentPage, setCurrentPage] = useState(1);
const usersPerPage = 10;
const indexOfLastUser = currentPage * usersPerPage;
const indexOfFirstUser = indexOfLastUser - usersPerPage;
const [pincodes, setPincodes] = useState([]);
const [pincodeSuggestions, setPincodeSuggestions] = useState([]);
const [showPincodeList, setShowPincodeList] = useState(false);
const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

const totalPages = Math.ceil(users.length / usersPerPage);
  // Dropdown and Form state
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);
  const [sites, setSites] = useState([]);
  const [branches, setBranches] = useState([]);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const initialFormData = {
    first_name: "",
    last_name: "",
    fullname: "",
    email: "",
    password: "",
    phone: "",
    role: "",
    address: "",
    city: "",
    pincode: "",
    company_id: "",
    branch_id: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [viewUser, setViewUser] = useState(null); // For the view modal
  const fetchPincodes = async () => {
  try {
    const res = await api.get(
      `${API_URL}/api/pincodes`,
      getAuthHeaders()
    );
console.log("📦 RAW PINCODE RESPONSE:", res);
console.log("📦 RES.DATA:", res.data);
    setPincodes(res.data || []);
  } catch (err) {
    console.log("PINCODE ERROR:", err);
  }
};

const handlePincodeChange = (e) => {
  const value = e.target.value;

  console.log("📍 PINCODE INPUT VALUE:", value);

  setFormData((prev) => ({
    ...prev,
    pincode: value,
  }));

  if (!value) {
    console.log("⚠️ Pincode empty - clearing suggestions");
    setPincodeSuggestions([]);
    setShowPincodeList(false);
    return;
  }

  const filtered = (pincodes || []).filter((p) => {
    const pin = String(p.pincode || "");
    return pin.startsWith(value);
  });

  console.log("🔎 FILTERED PINCODES:", filtered);
  console.log("📊 TOTAL MATCH:", filtered.length);

  setPincodeSuggestions(filtered.slice(0, 10));
  setShowPincodeList(true);
};

const handleSelectPincode = (p) => {
  console.log("PIN DATA =", p);

  setFormData((prev) => ({
    ...prev,
    pincode: p.pincode || "",
    city: p.city || p.city_name || "",
    regionState: p.state || p.state_name || "",
    country: p.country || p.country_name || "India",
  }));

  setShowPincodeList(false);
  setPincodeSuggestions([]);
};
  // Dual list box state
  const [availableClients, setAvailableClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);

  // Search Panel State
 const [searchFields, setSearchFields] = useState([
  { field: "fullname", keyword: "" },
]);
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
const userSearchOptions = [
  { value: "fullname", label: "Full Name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Contact No" },
  // { value: "created_on", label: "Created Date" },
];

  // Helper to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  // --- Data Fetching ---
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      const validSearch = searchFields.filter((f) => f.field && f.keyword);
      if (validSearch.length > 0)
        params.searchFields = JSON.stringify(validSearch);
      if (dateFilter.from && dateFilter.to) {
        params.fromDate = dateFilter.from;
        params.toDate = dateFilter.to;
      }
      const res = await api.get(`${API_BASE_URL}/users`, {
        params,
        ...getAuthHeaders(),
      });
      setUsers(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else setError("Failed to load branches.");
      // console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  fetchPincodes();
}, []);
  // Single useEffect for all initial data
  useEffect(() => {
 const fetchInitialData = async () => {
  setLoading(true);

  try {
    const companiesRes = await api.get(
      `${API_BASE_URL}/companies`,
      getAuthHeaders()
    );

    console.log("COMPANY RESPONSE =>", companiesRes.data);

    const companyData = Array.isArray(companiesRes.data?.data)
      ? companiesRes.data.data
      : Array.isArray(companiesRes.data)
      ? companiesRes.data
      : [];

    setCompanies(companyData);

    const rolesRes = await api.get(
      `${API_BASE_URL}/users/roles`,
      getAuthHeaders()
    );

    const clientsRes = await api.get(
      `${API_BASE_URL}/users/clients`,
      getAuthHeaders()
    );

    const clientData = Array.isArray(clientsRes.data?.data)
      ? clientsRes.data.data
      : Array.isArray(clientsRes.data)
      ? clientsRes.data
      : [];

    setRoles(rolesRes.data);
    setClients(clientData);
    setAvailableClients(clientData);

  } catch (error) {
  console.error("FETCH USERS ERROR =>", error);

  if (error.response?.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  } else {
    setError(
      error.response?.data?.message || "Failed to load users."
    );
  }
}
};
    fetchInitialData();
    // console.log(clients, availableClients);
  }, []);

  // Fetch branches only when the selected company changes
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        if (!formData.company_id) {
          setBranches([]);
          return;
        }

        console.log("SELECTED COMPANY =>", formData.company_id);

        const token = localStorage.getItem("token");

        const res = await api.get(
          `${API_BASE_URL}/branches/by-company/${formData.company_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log("BRANCH API RESPONSE =>", res.data);

        setBranches(res.data || []);
      } catch (error) {
        console.error("BRANCH FETCH ERROR =>", error);
        setBranches([]);
      }
    };

    fetchBranches();
  }, [formData.company_id]);
  // --- Form Handlers ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    console.log("FIELD =>", name);
    console.log("VALUE =>", value);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleFileChange = (e) => {
  const file = e.target.files?.[0];

  if (!file) return;

  setProfileImageFile(file);

  setLogoPreview((prev) => {
    if (prev) URL.revokeObjectURL(prev);
    return URL.createObjectURL(file);
  });
};

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(null);
    setLogoPreview(null);
    setValidationErrors({});
    setSelectedClients([]);
    setProfileImageFile(null);
    setAvailableClients(clients);
  };

  const validateForm = () => {
    const newErrors = {};

    // Full Name
    if (!formData.fullname.trim()) {
      newErrors.fullname = "Full name is required";
    }

    // Email
// Email Optional
if (
  formData.email &&
  !/^\S+@\S+\.\S+$/.test(formData.email)
) {
  newErrors.email = "Invalid email format";
}

    // Password
    if (!isEditing && !formData.password) {
      newErrors.password = "Password is required";
    }

    // Phone
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Contact number must be 10 digits";
    }

    // Role
    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    // Company
    if (!formData.company_id) {
      newErrors.company_id = "Company is required";
    }

    // Branch
    if (!formData.branch_id) {
      newErrors.branch_id = "Branch is required";
    }

    // Pincode
    const pincodeRegex = /^[1-9][0-9]{5}$/;

    if (formData.pincode && !pincodeRegex.test(formData.pincode)) {
      newErrors.pincode = "Please enter valid 6 digit pincode";
    }

    setValidationErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fix validation errors");
      return;
    }

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (profileImageFile) {
        data.append("profileImage", profileImageFile);
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          ...getAuthHeaders().headers,
        },
      };

      if (isEditing) {
        await api.post(`${API_BASE_URL}/users/update/${isEditing.id}`, data, config);

        alert("User updated successfully");
      } else {
        await api.post(`${API_BASE_URL}/users`, data, config);

        alert("User created successfully");
      }

      setShowForm(false);

      resetForm();

      fetchUsers();
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Failed to save user");
    }
  };

  // === ACTION HANDLERS (UPDATED) ===
  const handleEdit = (user) => {
    console.log("EDIT USER =>", user);

    setIsEditing(user);

    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      fullname: user.fullname || "",
      email: user.email || "",
      password: "",
      phone: user.phone || "",
      role: user.role || "",
      address: user.address || "",
      city: user.city || "",
      pincode: user.pincode || "",
      company_id: user.company_id ? String(user.company_id) : "",
      branch_id: user.branch_id ? String(user.branch_id) : "",
    });
    console.log("PROFILE =", user.profile_image);

setLogoPreview(
  user.profile_image
    ? encodeURI(
        user.profile_image.startsWith("http")
          ? user.profile_image
          : `${import.meta.env.VITE_API_URL}/${user.profile_image.replace(/\\/g, "/")}`
      )
    : null
);

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`${API_BASE_URL}/users/${id}`, getAuthHeaders());
        alert("User deleted successfully");
        fetchUsers();
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else alert("Failed to delete user");
        // console.error(error);
      }
    }
  };
  const handleView = (user) => setViewUser(user);

  // --- Search and Dual List Box Handlers ---
  const handleSearch = () => {
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [searchFields, dateFilter]);

const resetSearch = () => {
  setSearchFields([{ field: "fullname", keyword: "" }]);
  setDateFilter({ from: "", to: "" });
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

      const response = await api.get(
        `${import.meta.env.VITE_API_URL}/api/users/export`,
        {
          params,
          responseType: "blob", // IMPORTANT
          ...getAuthHeaders(),
        },
      );

      // Create Excel File
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Users_${randomNumber}.xlsx`;
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

  const moveItems = (source, dest, setSource, setDest, itemIds) => {
    const itemsToMove = source.filter((item) =>
      itemIds.includes(String(item.id)),
    );

    const remainingSource = source.filter(
      (item) => !itemIds.includes(String(item.id)),
    );

    setSource(remainingSource);

    setDest(
      [...dest, ...itemsToMove].sort((a, b) =>
        (a.company_name || "").localeCompare(b.company_name || ""),
      ),
    );
  };
  const handleSelectClients = (all = false) => {
    const selectedIds = all
      ? availableClients.map((c) => String(c.id))
      : Array.from(
          document.getElementById("availableClients").selectedOptions,
        ).map((opt) => opt.value);
    moveItems(
      availableClients,
      selectedClients,
      setAvailableClients,
      setSelectedClients,
      selectedIds,
    );
  };
  const handleDeselectClients = (all = false) => {
    const selectedIds = all
      ? selectedClients.map((c) => String(c.id))
      : Array.from(
          document.getElementById("selectedClients").selectedOptions,
        ).map((opt) => opt.value);
    moveItems(
      selectedClients,
      availableClients,
      setSelectedClients,
      setAvailableClients,
      selectedIds,
    );
  };

  // === FETCH SITES BY SELECTED CLIENTS ===
  const fetchSitesByClientIds = async (selectedClientList) => {
    if (!selectedClientList || selectedClientList.length === 0) {
      console.log("No clients selected for site fetch.");
      return [];
    }

    try {
      const clientIds = selectedClientList.map((c) => ({ $oid: c._id }));
      const res = await api.post(
        `${API_BASE_URL}/clients/site/by-client-ids`,
        { clientIds },
        getAuthHeaders(),
      );
      // console.log("Fetched Sites:", res.data.data);
      return res.data.data;
    } catch (error) {
      console.error("Failed to fetch sites by client IDs:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return [];
    }
  };

  // Inside handleSelectClients or handleDeselectClients
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const sites = await fetchSitesByClientIds(selectedClients);
        // console.log("Sites for selected clients:", sites);
        setSites(sites);
      } catch (error) {
        console.error("Failed to fetch sites by client IDs:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }
    };

    if (selectedClients.length > 0) {
      fetchSites();
    }
  }, [selectedClients]);

  // --- RENDER ---
  return (
   <div
  className="page-container"
  style={{
    fontSize: "13px",
  }}
>
      <Modal
        show={!!viewUser}
        onHide={() => setViewUser(null)}
        centered
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {viewUser && (
            <>
              <p>
                <strong>Name:</strong> {viewUser.first_name}{" "}
                {viewUser.last_name}
              </p>
              <p>
                <strong>Email:</strong> {viewUser.email}
              </p>
              <p>
                <strong>Role:</strong> {viewUser.role || "N/A"}
              </p>
              <p>
                <strong>Company:</strong>{" "}
                {viewUser.company_name_actual || "N/A"}
              </p>
              <p>
                <strong>Branch:</strong> {viewUser.branch_name_actual || "N/A"}
              </p>

              {viewUser.profile_image && (
                <div className="text-center mt-3">
                  <Image
                    src={`${import.meta.env.VITE_API_URL}/${viewUser.profile_image.replace(
                      /\\/g,
                      "/",
                    )}`}
                    alt={viewUser.name}
                    roundedCircle
                    fluid
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewUser(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* <div className="page-header"> */}
      <div className="page-header d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <h1 className="page-title mb-0">
            User Management{" "}
            <span className="text-success">({users.length})</span>
          </h1>
          
        </div>

        {/* <div className="page-actions"> */}
        <div className="page-actions">
         <button
  type="button"
  className="btn btn-warning btn-sm"
            onClick={() => setShowSearch(!showSearch)}
          >
            <FaSearch /> {showSearch ? "Hide Search" : "Search"}
          </button>
         <button
  type="button"
  className="btn btn-primary btn-sm"
            onClick={() => {
              resetForm();
              setIsEditing(null);
              setShowForm(true);
              setShowSearch(false);
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
          searchOptions={userSearchOptions}
        />
      )}
      {showForm && (
     <Card className="shadow-sm border-0">
       <h2 className="card-header bg-primary text-white mb-0 py-3">
  {isEditing ? (
    <span>
      Edit User - {isEditing.fullname || isEditing.first_name}
    </span>
  ) : (
    "Create New User"
  )}
</h2>
          {Object.keys(validationErrors).length > 0 && (
            <Alert variant="danger">
              Please fix the validation errors below.
            </Alert>
          )}
           <Card.Body>
          <Form className="user-form" onSubmit={handleSubmit}>
            <Row className="g-1">
              <Col xs={12} sm={6} md={4} className="mb-3">
                <Form.Group controlId="name">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                  size="sm"
                    name="fullname"
                    placeholder="Enter full name"
                    value={formData.fullname || ""}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={4} className="mb-3">
                <Form.Group controlId="email">
                  <Form.Label>Email ID</Form.Label>
                  <Form.Control
                    name="email"
                    placeholder="Email"
                    type="text"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={4} className="mb-3">
                <Form.Group controlId="password">
                  <Form.Label>
                    {isEditing ? "New password (optional)" : "Password *"}
                  </Form.Label>
                  <Form.Control
                    name="password"
                    placeholder={
                      isEditing ? "Enter new password (optional)" : "Password"
                    }
                    type="password"
                    value={formData.password || ""}
                    onChange={handleInputChange}
                    isInvalid={!isEditing && !!validationErrors.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.password}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={4} className="mb-3">
                <Form.Group controlId="contactNo">
                  <Form.Label>Contact No</Form.Label>
                  <Form.Control
                    name="phone"
                    placeholder="Contact No"
                    value={formData.phone || ""}
                    isInvalid={!!validationErrors.phone}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.phone}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={4} className="mb-3">
                <Form.Group controlId="address">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    name="address"
                    as={"textarea"}
                    placeholder="Address"
                    value={formData.address || ""}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </Form.Group>
              </Col>
             <Col xs={12} sm={6} md={4} className="mb-3">
  <Form.Group controlId="pincode">
    <Form.Label>Pincode</Form.Label>

    <div style={{ position: "relative" }}>
      <Form.Control
        name="pincode"
        placeholder="Pincode"
        value={formData.pincode || ""}
        onChange={handlePincodeChange}
        onFocus={() => setShowPincodeList(true)}
        isInvalid={!!validationErrors.pincode}
        autoComplete="off"
      />

      {/* DROPDOWN */}
      {showPincodeList && pincodeSuggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #ddd",
            zIndex: 999,
            maxHeight: "200px",
            overflowY: "auto",
            borderRadius: "6px",
          }}
        >
          {pincodeSuggestions.map((p, index) => (
            <div
              key={index}
              onClick={() => handleSelectPincode(p)}
              style={{
                padding: "8px",
                cursor: "pointer",
              }}
              onMouseDown={(e) => e.preventDefault()} // prevents blur issue
            >
              {p.pincode} - {p.city || p.city_name}
            </div>
          ))}
        </div>
      )}
    </div>

    <Form.Control.Feedback type="invalid">
      {validationErrors.pincode}
    </Form.Control.Feedback>
  </Form.Group>
</Col>
              <Col xs={12} sm={6} md={4} className="mb-3">
                <Form.Group controlId="city">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    name="city"
                    placeholder="City"
                    value={formData.city || ""}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
             
              <Col xs={12} sm={6} md={4} className="mb-3">
                <Form.Group controlId="roleId">
                  <Form.Label>Role *</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role || ""}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.role}
                  >
                    <option value="">Select Role</option>

                    {roles.map((role) => (
                      <option key={role.id} value={role.role_name}>
                        {role.role_name}
                      </option>
                    ))}
                  </Form.Select>

                  <Form.Control.Feedback type="invalid">
                    {validationErrors.role}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} md={4} className="mb-3">
                <Form.Group controlId="company">
                  <Form.Label>Company *</Form.Label>
                 <Form.Select
  name="company_id"
  value={formData.company_id || ""}
  onChange={handleInputChange}
>
  <option value="">Select Company</option>

  {Array.isArray(companies) &&
    companies.map((c) => (
      <option key={c.id} value={c.id}>
        {c.company_name}
      </option>
    ))}
</Form.Select>

                  <Form.Control.Feedback type="invalid">
                    {validationErrors.company_id}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12} sm={6} md={4} className="mb-3">
                <Form.Group controlId="branch">
                  <Form.Label>Branch *</Form.Label>
                  <Form.Select
                    name="branch_id"
                    value={formData.branch_id || ""}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.branch_id}
                  >
                    <option value="">Select Branch</option>

                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.branch_name}
                      </option>
                    ))}
                  </Form.Select>

                  <Form.Control.Feedback type="invalid">
                    {validationErrors.branch_id}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            <Col xs={12} sm={6} md={4} className="mb-3">
  <Form.Group controlId="profileImage">
    <Form.Label>Profile Image</Form.Label>

    <Form.Control
      type="file"
      accept=".jpg,.jpeg,.png,.webp"
      name="logo"
      onChange={handleFileChange}
    />
  </Form.Group>
</Col>

<Col xs={12} sm={6} md={4} className="mb-3">
  {logoPreview && (
    <div style={{ marginTop: "10px" }}>
      <img
        src={logoPreview}
        alt="logo preview"
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "10px",
          objectFit: "cover",
          border: "1px solid #ddd",
          padding: "4px",
          background: "#fff",
        }}
      />
    </div>
  )}
</Col>
              
            </Row>

            <Row
              className="d-flex justify-content-center align-items-center text-center"
              // style={{ minHeight: "250px" }}
            >
              <Col
                xs={12}
                md={5}
                className="d-flex justify-content-center align-items-center"
              >
                <Card className="shadow-sm border-0 w-100 p-3">
                  <Form.Label>Available Clients</Form.Label>
                  <Form.Select
                    id="availableClients"
                    multiple
                    className="dual-list-select"
                  >
                    {availableClients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company_name}
                      </option>
                    ))}
                  </Form.Select>
                </Card>
              </Col>
              <Col
                // md={2}
                className="d-flex flex-column mb-3 gap-2 align-items-center justify-content-center"
              >
                <Button
                  type="button"
                  variant="secondary"
                  className="w-100"
                  onClick={() => handleSelectClients(true)}
                >
                  &gt;&gt;
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-100"
                  onClick={() => handleSelectClients(false)}
                >
                  &gt;
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-100"
                  onClick={() => handleDeselectClients(false)}
                >
                  &lt;
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-100"
                  onClick={() => handleDeselectClients(true)}
                >
                  &lt;&lt;
                </Button>
              </Col>
              <Col
                xs={12}
                md={5}
                className="d-flex justify-content-center align-items-center"
              >
                <Card className="user-card  w-100 p-3">
                  <Form.Label>Assigned Clients</Form.Label>
                  <Form.Select
                    id="selectedClients"
                    multiple
                    className="dual-list-select"
                  >
                    {selectedClients
                      .filter((c) => c)
                      .map((c) => (
                        <option key={c?.id} value={c?.id}>
                          {c?.company_name}
                          {/* {c?._id} */}
                        </option>
                      ))}
                  </Form.Select>
                </Card>
              </Col>
            </Row>

            <div className="d-flex justify-content-center gap-3 mt-5">
              <Button
                type="button"
                variant="secondary"
                className="me-2"
                onClick={() => {
                  setShowForm(false);
                  setIsEditing(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
             <Button type="submit" variant="success">
                {isEditing ? "Update User" : "Save User"}
              </Button>
            </div>
          </Form>
          </Card.Body>
        </Card>
      )}

      {/* Users List Table */}
      {!showForm && (
        <Card className="shadow-sm border-0">
          {loading ? (
            <Alert variant="warning" className="mb-0 text-center">
              Loading...
            </Alert>
          ) : error ? (
            <Alert variant="danger" className="mb-0 text-center">
              {error}
            </Alert>
          ) : (
            <Table responsive bordered hover className="list-table">
             <thead className="table-secondary">
  <tr>
    <th style={{ width: "70px" }}>Sr No</th>
    <th>Name</th>
    <th>Email ID</th>
    <th>Role</th>
    <th>Branch</th>
    <th>Contact No</th>

    {/* ONE BOX */}
    <th style={{ minWidth: "180px" }}>
      Created / Modified Date
    </th>

    <th style={{ width: "120px" }}>Actions</th>
  </tr>
</thead>

<tbody>
  {users.length === 0 ? (
    <tr className="text-center">
      <td colSpan={8}>No data found</td>
    </tr>
  ) : (
    currentUsers.map((user, index) => (
      <tr key={user.id}>
        
        {/* SR NO */}
        <td className="text-center">
          {indexOfFirstUser + index + 1}
        </td>

        {/* NAME */}
        <td>
       <div className="info d-flex align-items-center gap-2">
  <img
    src={
      user.profile_image
        ? encodeURI(
            user.profile_image.startsWith("http")
              ? user.profile_image
              : `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/${user.profile_image
                  .replace(/\\/g, "/")
                  .replace(/^\/+/, "")}`
          )
        : defaultImg
    }
    alt="profile"
    onError={(e) => {
      console.log("FAILED IMAGE =", e.target.src);
      e.target.onerror = null;
      e.target.src = defaultImg;
    }}
    style={{
      width: "45px",
      height: "45px",
      borderRadius: "50%",
      objectFit: "cover",
      border: "1px solid #ddd",
    }}
  />

  <div className="user-details">
    <span className="user-name fw-semibold">
      {user.fullname || user.first_name}
    </span>
  </div>
</div>
        </td>

        {/* EMAIL */}
        <td>{user.email || "N/A"}</td>

        {/* ROLE */}
        <td>{user.role || "N/A"}</td>

        {/* BRANCH */}
        <td>
          {user.branch_name_actual ||
            user.branch_name ||
            "N/A"}
        </td>

        {/* PHONE */}
        <td>{user.phone || "N/A"}</td>

        {/* CREATED / MODIFIED */}
       {/* CREATED / MODIFIED */}
<td>
  <div className="d-flex flex-column">
    <small>
      <strong>C :</strong>{" "}
      {user.created_on
        ? new Date(user.created_on).toLocaleDateString("en-IN")
        : "N/A"}
    </small>

    <small>
      <strong>M :</strong>{" "}
      {user.modified_on
        ? new Date(user.modified_on).toLocaleDateString("en-IN")
        : "N/A"}
    </small>
  </div>
</td>

        {/* ACTIONS */}
        <td>
          <Dropdown>
            <Dropdown.Toggle
              variant="secondary"
              size="sm"
              id={`dropdown-${user.id}`}
            >
              Actions
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item
                onClick={() => handleView(user)}
              >
                <FaEye className="me-2" />
                View
              </Dropdown.Item>

              <Dropdown.Item
                onClick={() => handleEdit(user)}
              >
                <FaPen className="me-2" />
                Edit
              </Dropdown.Item>

              <Dropdown.Item
                className="text-danger"
                onClick={() => handleDelete(user.id)}
              >
                <FaTrashAlt className="me-2" />
                Delete
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </td>
      </tr>
    ))
  )}
</tbody>
            </Table>
          )}
{/* PAGINATION */}
{totalPages > 1 && (
  <div className="d-flex justify-content-end mt-3">
    <Pagination>
      
      {/* PREVIOUS */}
      <Pagination.Prev
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(currentPage - 1)}
      />

      {/* PAGE NUMBERS */}
      {[...Array(totalPages)].map((_, index) => (
        <Pagination.Item
          key={index + 1}
          active={index + 1 === currentPage}
          onClick={() => setCurrentPage(index + 1)}
        >
          {index + 1}
        </Pagination.Item>
      ))}

      {/* NEXT */}
      <Pagination.Next
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(currentPage + 1)}
      />
    </Pagination>
  </div>
)}
        </Card>
      )}
    </div>
  );
};

export default UserPage;
