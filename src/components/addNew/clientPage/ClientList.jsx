import React from "react";
import { Alert, Card, Table, Dropdown } from "react-bootstrap";
import { FaEye, FaPen, FaTrashAlt, FaEllipsisV } from "react-icons/fa";

const ClientList = ({ clients, onEdit, onDelete, onView, loading, error }) => {
  return (
    <Card className="card table-card">
      {loading ? (
        <Alert variant="warning" className="mb-0 text-center">
          Loading clients...
        </Alert>
      ) : error ? (
        <Alert variant="danger" className="mb-0 text-center">
          {error}
        </Alert>
      ) : (
        <Table hover responsive bordered className="">
          <thead className="table-secondary">
            <tr>
              <th>Sr No.</th>
              <th>Client Name</th>
              <th>Contact</th>
              <th>Person/Email</th>
              <th>City</th>
              <th>State/Pincode</th>
              <th>Created Detail</th>
              <th>Total Sites</th>
              <th>Total Employee</th>
              <th>Billing company</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {clients.length > 0 ? (
              clients.map((client, index) => (
                <tr key={client._id}>
                  <td>{index + 1}</td>
                  <td>{client.companyName || ""}</td>
                  <td>{client.contactPersonName || ""}</td>
                  <td>{client.emailId || ""}</td>
                  <td>{client.city || ""}</td>
                  <td>
                    {`${client.state || ""} ${client.pincode || ""}`.trim() ||
                      ""}
                  </td>
                  <td>
                    {client.created_by} <br />
                    <span className="date-text">
                      {new Date(client.created_on).toLocaleDateString("en-GB")}
                    </span>
                  </td>
                  <td className="count-cell">{client.totalSites || 0}</td>
                  <td className="count-cell">{client.totalEmployees || 0}</td>
                <td>
 {client.billingCompany}
</td>
                  <td>
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="secondary"
                        size="sm"
                        className="border-0 shadow-none"
                      >
                        Action
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => onView(client)}>
                          <FaEye className="me-2 text-info" />
                          View
                        </Dropdown.Item>

                      <Dropdown.Item
  onClick={() => {
    console.log("👉 EDIT CLICKED CLIENT:", client);
    console.log("👉 CLIENT ID (_id):", client._id);

    onEdit(client._id || client.id);
  }}
>
  <FaPen className="me-2 text-primary" />
  Edit
</Dropdown.Item>

                        <Dropdown.Item onClick={() => onDelete(client._id)}>
                          <FaTrashAlt className="me-2 text-danger" />
                          Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="text-center">
                <td colSpan={11}>No data found</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </Card>
  );
};

export default ClientList;
