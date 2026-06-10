import React from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { FaPlus, FaTimes } from "react-icons/fa";

const FilterPanel = ({
  searchFields,
  setSearchFields,
  dateFilter,
  setDateFilter,
  // monthYearFilter,
  // setMonthYearFilter,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  onSearch,
  onReset,
  onDownloadExcel,
  searchOptions,
  filterMode = "date",
  showDownload = true,
}) => {
  const handleFieldChange = (index, e) => {
    const updated = [...searchFields];
    updated[index][e.target.name] = e.target.value;
    setSearchFields(updated);
  };

  const addField = () => {
    setSearchFields([
      ...searchFields,
      { field: searchOptions[0]?.value || "", keyword: "" },
    ]);
  };

  const removeField = (index) => {
    setSearchFields(searchFields.filter((_, i) => i !== index));
  };

return (
  <Card
    className="filter-card p-2"
    style={{
      fontSize: "12px",
    }}
  >
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(e);
      }}
    >
      {/* --- Keyword Search Row --- */}
      {searchFields.map((item, index) => (
        <Row
          key={index}
          className="filter-row align-items-center g-2 mb-1"
        >
          <Col xs={12} sm={5} md={4} className="mb-1">
            <Form.Select
              name="field"
              id="field"
              value={item.field}
              onChange={(e) => handleFieldChange(index, e)}
              size="sm"
              style={{
                fontSize: "12px",
                height: "30px",
                padding: "2px 8px",
              }}
            >
              {searchOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col xs={12} sm={5} md={6} className="mb-1">
            <Form.Control
              type="text"
              name="keyword"
              id="keyword"
              placeholder="Enter Keyword"
              value={item.keyword}
              onChange={(e) => handleFieldChange(index, e)}
              size="sm"
              style={{
                fontSize: "12px",
                height: "30px",
                padding: "2px 8px",
              }}
            />
          </Col>

          <Col xs="auto" className="mb-1">
            {index === searchFields.length - 1 ? (
              <Button
                variant="success"
                onClick={addField}
                size="sm"
                style={{
                  height: "30px",
                  padding: "2px 8px",
                }}
              >
                <FaPlus size={10} />
              </Button>
            ) : (
              <Button
                variant="danger"
                onClick={() => removeField(index)}
                size="sm"
                style={{
                  height: "30px",
                  padding: "2px 8px",
                }}
              >
                <FaTimes size={10} />
              </Button>
            )}
          </Col>
        </Row>
      ))}

      {/* --- Date Filter Row --- */}
      {filterMode === "date" && (
        <Row className="filter-row align-items-end g-2 mb-1">
          <Col xs={12} sm={6} md={4} className="mb-1">
            <Form.Label
              style={{
                fontSize: "11px",
                marginBottom: "2px",
              }}
            >
              Date Filter
            </Form.Label>

            <Form.Select
              size="sm"
              style={{
                fontSize: "12px",
                height: "30px",
                padding: "2px 8px",
              }}
            >
              <option>Created On</option>
            </Form.Select>
          </Col>

          <Col xs={12} sm={6} md={4} className="mb-1">
            <Form.Label
              style={{
                fontSize: "11px",
                marginBottom: "2px",
              }}
            >
              From
            </Form.Label>

            <Form.Control
              type="date"
              value={dateFilter.from}
              onChange={(e) =>
                setDateFilter({
                  ...dateFilter,
                  from: e.target.value,
                })
              }
              size="sm"
              style={{
                fontSize: "12px",
                height: "30px",
                padding: "2px 8px",
              }}
            />
          </Col>

          <Col xs={12} sm={6} md={4} className="mb-1">
            <Form.Label
              style={{
                fontSize: "11px",
                marginBottom: "2px",
              }}
            >
              To
            </Form.Label>

            <Form.Control
              type="date"
              value={dateFilter.to}
              onChange={(e) =>
                setDateFilter({
                  ...dateFilter,
                  to: e.target.value,
                })
              }
              size="sm"
              style={{
                fontSize: "12px",
                height: "30px",
                padding: "2px 8px",
              }}
            />
          </Col>
        </Row>
      )}

      {/* --- Buttons --- */}
      <Row className="form-actions g-1 mt-1 d-flex justify-content-end">
        <Col xs="auto">
          <Button
            type="submit"
            variant="warning"
            size="sm"
            onClick={onSearch}
            style={{
              fontSize: "12px",
              height: "30px",
              padding: "2px 10px",
            }}
          >
            Search
          </Button>
        </Col>

        <Col xs="auto">
          <Button
            variant="danger"
            size="sm"
            onClick={onReset}
            style={{
              fontSize: "12px",
              height: "30px",
              padding: "2px 10px",
            }}
          >
            Reset
          </Button>
        </Col>

        {showDownload && (
          <Col xs="auto">
            <Button
              variant="success"
              size="sm"
              onClick={onDownloadExcel}
              style={{
                fontSize: "12px",
                height: "30px",
                padding: "2px 10px",
              }}
            >
              Download Excel
            </Button>
          </Col>
        )}
      </Row>
    </Form>
  </Card>
);
};

export default FilterPanel;
