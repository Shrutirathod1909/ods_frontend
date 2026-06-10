import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  Card,
  Table,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Dropdown,
} from "react-bootstrap";
import {
  FaPlus,
  FaSearch,
  FaPen,
  FaTrashAlt,
} from "react-icons/fa";

const UserRole = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [search, setSearch] = useState("");

  const [roleName, setRoleName] = useState("");
  const [editingId, setEditingId] = useState(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
  };

  // ================= FETCH =================
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `${API_URL}/api/roles`,
        getAuthHeaders()
      );
      setRoles(res.data || []);
    } catch (err) {
      setError("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // ================= SAVE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roleName.trim()) {
      alert("Role Name is required");
      return;
    }

    try {
      if (editingId) {
        await api.post(
          `${API_URL}/api/roles/update/${editingId}`,
          { role_name: roleName },
          getAuthHeaders()
        );
      } else {
        await api.post(
          `${API_URL}/api/roles`,
          { role_name: roleName },
          getAuthHeaders()
        );
      }

      resetForm();
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  // ================= EDIT =================
  const handleEdit = (role) => {
    setEditingId(role.id);
    setRoleName(role.role_name);
    setShowForm(true);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    await api.delete(
      `${API_URL}/api/roles/${id}`,
      getAuthHeaders()
    );

    fetchRoles();
  };

  const resetForm = () => {
    setRoleName("");
    setEditingId(null);
    setShowForm(false);
  };

  // ================= FILTER =================
  const filteredRoles = roles.filter((item) =>
    item.role_name?.toLowerCase().includes(search.toLowerCase())
  );

  // ================= PAGINATION =================
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRoles = filteredRoles.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);

  return (
    <div className="page-container">

      {/* HEADER (same UI) */}
      <div className="page-header">
        <h1 className="page-title">
          Role Master{" "}
          <span className="text-success">
            ({filteredRoles.length})
          </span>
        </h1>

     <div className="page-actions">
  <button
    type="button"
    className="btn btn-warning btn-sm"
    onClick={() => setShowSearch(!showSearch)}
  >
    <FaSearch />{" "}
    {showSearch ? "Hide Search" : "Search"}
  </button>

  <button
    type="button"
    className="btn btn-primary btn-sm"
    onClick={() => {
      resetForm();
      setShowForm(true);
      setShowSearch(false);
    }}
  >
    <FaPlus /> Create New
  </button>
</div>
      </div>

      {/* SEARCH (same UI) */}
      {showSearch && (
        <Card className="mb-3 p-3">
          <Row>
            <Col md={4}>
              <Form.Control
                placeholder="Search Here..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* FORM (same UI) */}
      {showForm && (
        <Card className="p-4 mb-3">
          <h4 className="mb-4">
            {editingId ? "Edit Role" : "Create Role"}
          </h4>

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Role Name *</Form.Label>

                  <Form.Control
                    type="text"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button
                variant="secondary"
                className="me-2"
                onClick={resetForm}
              >
                Cancel
              </Button>

              <Button type="submit" variant="primary">
                {editingId ? "Update Role" : "Save Role"}
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {/* TABLE (same UI) */}
      {!showForm && (
        <Card>
          {loading ? (
            <Alert className="text-center">Loading...</Alert>
          ) : error ? (
            <Alert variant="danger" className="text-center">
              {error}
            </Alert>
          ) : (
            <>
              <Table bordered hover responsive>
                <thead className="table-secondary">
                  <tr>
                    <th width="80">Sr No.</th>
                    <th>Role Name</th>
                    <th width="120">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentRoles.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center">
                        No roles found
                      </td>
                    </tr>
                  ) : (
                    currentRoles.map((role, index) => (
                      <tr key={role.id}>
                        <td>
                          {indexOfFirst + index + 1}
                        </td>

                        <td>{role.role_name}</td>

                        <td>
                          <Dropdown>
                            <Dropdown.Toggle
                              variant="secondary"
                              size="sm"
                            >
                              Actions
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                              <Dropdown.Item
                                onClick={() => handleEdit(role)}
                              >
                                <FaPen className="me-2 text-primary" />
                                Edit
                              </Dropdown.Item>

                              <Dropdown.Item
                                onClick={() =>
                                  handleDelete(role.id)
                                }
                              >
                                <FaTrashAlt className="me-2 text-danger" />
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

              {/* PAGINATION (same UI style minimal change) */}
              <div className="d-flex justify-content-end mt-3">
                <ul className="pagination">

                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Prev
                    </button>
                  </li>

                  {[...Array(totalPages)].map((_, i) => (
                    <li
                      key={i}
                      className={`page-item ${
                        currentPage === i + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}

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
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default UserRole;