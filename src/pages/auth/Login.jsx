import React, {
  useState,
  useEffect,
} from "react";

import api from "../../api/axios";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import Select from "react-select";

import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Card,
  Image,
  Alert,
  InputGroup,
} from "react-bootstrap";

import {
  FaUser,
  FaLock,
  FaBuilding,
  FaCodeBranch,
} from "react-icons/fa";

import logo from "../../assets/images/ods_logo.jpeg";
import Footer from "../../layouts/Footer";

export default function Login() {

  // =========================================
  // STATES
  // =========================================

  const [submitted, setSubmitted] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [company, setCompany] =
    useState("");

  const [branch, setBranch] =
    useState("");

  const [companies, setCompanies] =
    useState([]);

  const [branches, setBranches] =
    useState([]);

  const [error, setError] =
    useState("");

  const navigate = useNavigate();

  // =========================================
  // API URL CONSOLE
  // =========================================

  console.log(
    "API URL =",
    import.meta.env.VITE_API_URL
  );

  // =========================================
  // REDIRECT IF TOKEN EXISTS
  // =========================================

// =========================================
// CHECK TOKEN + TOKEN EXPIRY
// =========================================

useEffect(() => {

  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
    return;
  }

  try {

    // JWT TOKEN SPLIT
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    // EXP TIME IN MS
    const expiryTime = payload.exp * 1000;

    // TOKEN EXPIRED
    if (Date.now() >= expiryTime) {

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login");

    } else {

      navigate("/");

    }

  } catch (err) {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");

  }

}, [navigate]);

  // =========================================
  // FETCH COMPANIES
  // =========================================

useEffect(() => {
  const fetchCompanies = async () => {
    try {
      console.log(
        "API URL =",
        import.meta.env.VITE_API_URL
      );

      const res = await api.get(
        `${import.meta.env.VITE_API_URL}/api/companies`
      );

      console.log("SUCCESS RESPONSE =", res);
      console.log("DATA =", res.data);

      // SAFE ARRAY CHECK
      const companyData =
        res.data?.data || [];

      setCompanies(
        Array.isArray(companyData)
          ? companyData
          : []
      );

    } catch (err) {

      console.log("========== ERROR ==========");
      console.log(err);
      console.log(
        "STATUS =",
        err.response?.status
      );
      console.log(
        "DATA =",
        err.response?.data
      );
      console.log(
        "MESSAGE =",
        err.message
      );
      console.log("===========================");

      setCompanies([]);

      setError(
        "Failed to load companies"
      );
    }
  };

  fetchCompanies();
}, []);

  // =========================================
  // FETCH BRANCHES
  // =========================================

  useEffect(() => {

    if (company) {

      const fetchBranches =
        async () => {

          try {

            const res =
              await api.get(
                `${import.meta.env.VITE_API_URL}/api/branches/by-company/${company}`
              );

            console.log(
              "Branches API Response =",
              res.data
            );

            setBranches(res.data);

          } catch (err) {

            console.error(
              "Error fetching branches",
              err
            );

            setError(
              "Failed to load branches"
            );

          }
        };

      fetchBranches();

    } else {

      setBranches([]);

    }

  }, [company]);

  // =========================================
  // DEBUG CONSOLE
  // =========================================

  useEffect(() => {

    console.log(
      "Selected Company =",
      company
    );

  }, [company]);

  useEffect(() => {

    console.log(
      "Selected Branch =",
      branch
    );

  }, [branch]);

  // =========================================
  // LOGIN SUBMIT
  // =========================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setSubmitted(true);

      setError("");

      if (
        !email ||
        !password ||
        !company ||
        !branch
      ) {

        setError(
          "All fields are required"
        );

        return;

      }

      try {

        const res =
          await api.post(
            `${import.meta.env.VITE_API_URL}/api/auth/login`,
            {
              email,
              password,
              company,
              branch,
            }
          );

        console.log(
          "Login Response =",
          res.data
        );

        localStorage.setItem(
          "token",
          res.data.token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(
            res.data.user
          )
        );

        console.log(
          "Saved Token =",
          localStorage.getItem(
            "token"
          )
        );

        navigate("/");

      } catch (err) {

        console.error(
          "Login Error =",
          err.response?.data
        );

        setError(
          err.response?.data?.msg ||
          "Invalid credentials."
        );

      }
    };

  // =========================================
  // JSX
  // =========================================

  return (
<div
  className="d-flex flex-column min-vh-100"
  style={{
    background:
      "linear-gradient(to right, #f8f9fa, #eef1ff)",
  }}
>

  {/* MAIN SECTION */}

  <div
    className="
    flex-grow-1
    d-flex
    align-items-center
    justify-content-center
    py-3
    py-md-4
    px-2
    "
  >

    <Container fluid>

      <Card
        className="
        shadow-lg
        border-0
        mx-auto
        w-100
        "
        style={{
          maxWidth: "950px",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >

        <Row className="g-0">

          {/* ========================================= */}
          {/* LEFT SIDE */}
          {/* ========================================= */}

          <Col
            xs={12}
            lg={6}
            className="
            bg-white
            p-3
            p-sm-4
            p-md-5
            d-flex
            flex-column
            justify-content-center
            "
          >

            {/* HEADING */}

            <div className="text-center mb-4">

              <h2
                className="
                fw-bold
                fs-3
                fs-md-2
                "
                style={{
                  color: "#2f2d69",
                }}
              >
                Welcome to HRMS
              </h2>

              <p
                className="
                text-muted
                small
                "
              >
                Please login to continue
              </p>

            </div>

            {/* FORM */}

            <Form onSubmit={handleSubmit}>

              {/* EMAIL */}

              <Form.Group className="mb-3">

                <InputGroup>

                  <InputGroup.Text>
                    <FaUser />
                  </InputGroup.Text>

                  <Form.Control
                    type="email"
                    placeholder="Username / Email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    isInvalid={
                      submitted && !email
                    }
                    className="py-2"
                  />

                </InputGroup>

                {submitted && !email && (
                  <small className="text-danger">
                    Email is required
                  </small>
                )}

              </Form.Group>

              {/* PASSWORD */}

              <Form.Group className="mb-3">

                <InputGroup>

                  <InputGroup.Text>
                    <FaLock />
                  </InputGroup.Text>

                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    isInvalid={
                      submitted &&
                      !password
                    }
                    className="py-2"
                  />

                </InputGroup>

                {submitted &&
                  !password && (
                    <small className="text-danger">
                      Password is required
                    </small>
                  )}

              </Form.Group>

              {/* COMPANY */}

              <Form.Group className="mb-3">

                <InputGroup>

                  <InputGroup.Text>
                    <FaBuilding />
                  </InputGroup.Text>

                  <div
                    style={{
                      flex: 1,
                      width: "100%",
                    }}
                  >

                    <Select

                      options={companies.map(
                        (c) => ({
                          value: String(c.id),
                          label:
                            c.company_name,
                        })
                      )}

                      value={
                        companies
                          .map((c) => ({
                            value: String(c.id),
                            label:
                              c.company_name,
                          }))
                          .find(
                            (c) =>
                              c.value ===
                              company
                          ) || null
                      }

                      onChange={(
                        selectedOption
                      ) => {

                        setCompany(
                          String(
                            selectedOption?.value ||
                            ""
                          )
                        );

                        setBranch("");

                      }}

                      placeholder="Select Company"

                      isSearchable

                      menuPortalTarget={
                        document.body
                      }

                      menuPosition="fixed"

                      styles={{

                        menuPortal: (
                          base
                        ) => ({
                          ...base,
                          zIndex: 9999,
                        }),

                        control: (
                          provided
                        ) => ({
                          ...provided,
                          minHeight: "42px",
                          fontSize: "14px",
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                          borderColor:
                            submitted &&
                            !company
                              ? "red"
                              : provided.borderColor,
                        }),
                      }}

                    />

                  </div>

                </InputGroup>

                {submitted &&
                  !company && (
                    <small className="text-danger">
                      Company is required
                    </small>
                  )}

              </Form.Group>

              {/* BRANCH */}

              <Form.Group className="mb-4">

                <InputGroup>

                  <InputGroup.Text>
                    <FaCodeBranch />
                  </InputGroup.Text>

                  <div
                    style={{
                      flex: 1,
                      width: "100%",
                    }}
                  >

                    <Select

                      options={branches.map(
                        (b) => ({
                          value: String(b.id),
                          label:
                            b.branch_name,
                        })
                      )}

                      value={
                        branches
                          .map((b) => ({
                            value: String(b.id),
                            label:
                              b.branch_name,
                          }))
                          .find(
                            (b) =>
                              b.value ===
                              branch
                          ) || null
                      }

                      onChange={(
                        selectedOption
                      ) => {

                        setBranch(
                          String(
                            selectedOption?.value ||
                            ""
                          )
                        );

                      }}

                      placeholder="Select Branch"

                      isSearchable

                      isDisabled={!company}

                      menuPortalTarget={
                        document.body
                      }

                      menuPosition="fixed"

                      styles={{

                        menuPortal: (
                          base
                        ) => ({
                          ...base,
                          zIndex: 9999,
                        }),

                        control: (
                          provided
                        ) => ({
                          ...provided,
                          minHeight: "42px",
                          fontSize: "14px",
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                          borderColor:
                            submitted &&
                            !branch
                              ? "red"
                              : provided.borderColor,
                        }),
                      }}

                    />

                  </div>

                </InputGroup>

                {submitted &&
                  !branch && (
                    <small className="text-danger">
                      Branch is required
                    </small>
                  )}

              </Form.Group>

              {/* ERROR */}

              {error && (

                <Alert variant="danger">
                  {error}
                </Alert>

              )}

              {/* BUTTON */}

              <div className="d-grid mb-3">

                <Button
                  type="submit"
                  className="
                  py-2
                  py-md-3
                  fw-bold
                  "
                  style={{
                    backgroundColor:
                      "#2f2d69",
                    border: "none",
                  }}
                >
                  LOGIN
                </Button>

              </div>

              {/* FORGOT PASSWORD */}

              <div className="text-center">

                <Link
                  to="/forgot-password"
                  className="
                  text-decoration-none
                  small
                  "
                  style={{
                    color: "#2f2d69",
                  }}
                >
                  Forgot password?
                </Link>

              </div>

            </Form>

          </Col>

          {/* ========================================= */}
          {/* RIGHT SIDE */}
          {/* ========================================= */}

          <Col
            xs={12}
            lg={6}
            className="
            d-flex
            align-items-center
            justify-content-center
            bg-light
            p-3
            p-md-4
            "
          >

            <Image
              src={logo}
              alt="Company Logo"
              fluid
              rounded
              style={{
                width: "100%",
                maxWidth: "320px",
                objectFit: "contain",
              }}
            />

          </Col>

        </Row>

      </Card>

    </Container>

  </div>

  <Footer />

</div>
  );
}