import React, { useState, useEffect } from "react";
import axios from "axios";
import { Alert, Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import {
  FaAddressCard,
  FaMinus,
  FaPlus,
  FaPlusCircle,
  FaTrashAlt,
} from "react-icons/fa";
import Select from "react-select";

const API_URL = import.meta.env.VITE_API_URL;
const COMPANY_API = `${API_URL}/api/companies/all`;

const AddEmployee = ({ onSuccess, editingEmployee, onCancel }) => {
  const [employeeId, setEmployeeId] = useState(null);
const [step, setStep] = useState(1);
  const [companies, setCompanies] = useState([]);
  const [availableSite, setAvailableSite] = useState([]);
  const [employeeTypes, setEmployeeTypes] = useState([]);
  // ==============================
// STATES
// ==============================
const [nativePincodeSuggestions, setNativePincodeSuggestions] =
  useState([]);

const [showNativePincodeList, setShowNativePincodeList] =
  useState(false);
const [pincodes, setPincodes] = useState([]);
const [pincodeSuggestions, setPincodeSuggestions] = useState([]);
const [showPincodeList, setShowPincodeList] = useState(false);
const [permanentPincodeSuggestions, setPermanentPincodeSuggestions] = useState([]);
const [showPermanentPincodeList, setShowPermanentPincodeList] = useState(false);

const [employmentPincodeSuggestions, setEmploymentPincodeSuggestions] =
  useState({});

const [showEmploymentPincodeList, setShowEmploymentPincodeList] =
  useState({});

  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [gangOptions, setGangOptions] = useState([]);

  useEffect(() => {
    const fetchGangs = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/gangs`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // console.log("GANG API DATA:", res.data);

        const options = res.data.map((item) => ({
          value: item.id,
          label: item.gang_master,
        }));

        setGangOptions(options);
      } catch (err) {
        console.log(err);
      }
    };

    fetchGangs();
  }, []);

  const userOptions = users.map((user) => ({
    value: user._id,
    label: `${user.first_name} ${user.last_name}`,
  }));
  const initialFormData = {
// =========================
// EMPLOYEE DETAILS
// =========================

initial: "",
first_name: "",
middle_name: "",
last_name: "",

gender: "",

dob: "",

date_of_joining: "",

salaryGenerationFromDate: "",
salaryGenerationToDate: "",

father_name: "",

rank: "",

department: "",

client_id: "",
client_name: "",

site_id: "",
site_name: "",

reporting_manager: "",
reporting_user: "",

gang_name: "",

verification_status: "Pending",

// =========================
// PRESENT ADDRESS
// =========================

presentAddress: {
address: "",
city: "",
state: "",
pincode: "",
country: "",
phone1: "",
phone2: "",
},

// =========================
// PERMANENT ADDRESS
// =========================

permanentAddress: {
address: "",
city: "",
state: "",
pincode: "",
country: "",
phone1: "",
phone2: "",
},

sameAsPresentAddress: false,

// =========================
// EMERGENCY CONTACTS
// =========================

emergencyContacts: [
{
contact_person: "",
mobile: "",
relation: "",
email: "",
},
],

// =========================
// PERSONAL DETAILS
// =========================

marital_status: "",

mrg_date: "",

cast: "",

category: "",

native_place: "",

blood_group: "",

// =========================
// LANGUAGES
// =========================

languageKnown: ["", "", "", "", ""],

// =========================
// HOBBIES
// =========================

hobbies: ["", "", "", ""],

// =========================
// DOCUMENTS
// =========================

driving_license: "",

pancard_no: "",

aadhar_no: "",

passport_no: "",

passport_valid_date: "",

pf_no: "",

uan_no: "",

uan_date: "",

esis_no: "",

esis_date: "",

// =========================
// KYC DOCUMENTS
// =========================

kycDocuments: [
{
documentType: "",
file: null,
status: "",
remark: "",
imagePath: "",
},
],

// =========================
// FAMILY NOMINEE
// =========================

familyNomineeDetails: [
{
initial: "",
relativeName: "",
gender: "",
relation: "",
dob: "",
age: "",
isMinor: false,
guardianName: "",
address: "",
contactNo: "",
email_id: "",
sharePF: "",
shareESIC: "",
},
],

// =========================
// PREVIOUS EMPLOYMENT
// =========================

previousEmployments: [
{
companyName: "",
designation: "",
address: "",
city: "",
state: "",
country: "",
pincode: "",


  joinedDate: "",

  lastWorkingDate: "",

  annualCTC: "",
  monthlyCTC: "",

  reportingTo: "",
  reportingToDesignation: "",

  email: "",
  contact: "",

  grossIncomePrevEmpl: "",
  grossTDSDeducted: "",

  grossPT: "",
  totalPTDeducted: "",
},


],

// =========================
// BANK DETAILS
// =========================

bankDetails: {
  ac_holder_name: "",
  card_no: "",

  bank_name: "",
  account_no: "",
  bank_address: "",
  bank_city: "",
  bank_state: "",
  bank_ifsc: "",
  bank_micr: "",

  cancelled_cheque_image: null,
},

// =========================
// SEPARATION DETAILS
// =========================

separationDetails: {
separationType: "",

separationReason: "",

dateOfSeparation: "",

noticePeriodDays: "",

lastWorkingDate: "",

handoverGivenTo: "",

},
};


  const [formData, setFormData] = useState(initialFormData);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage");
      return {};
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };


  // ==============================
// FETCH PINCODES
// ==============================
const fetchPincodes = async () => {
  try {
    const res = await axios.get(
      `${API_URL}/api/pincodes`,
      getAuthHeaders()
    );

    console.log("📦 PINCODE DATA =", res.data);

    setPincodes(res.data || []);
  } catch (err) {
    console.log("PINCODE ERROR:", err);
  }
};

useEffect(() => {
  fetchPincodes();
}, []);

// ==============================
// PINCODE SEARCH
// ==============================
const handlePincodeSearch = (e) => {
  const value = e.target.value;

  // pincode update
  setFormData((prev) => ({
    ...prev,
    presentAddress: {
      ...prev.presentAddress,
      pincode: value,
    },
  }));

  // empty
  if (!value) {
    setPincodeSuggestions([]);
    setShowPincodeList(false);
    return;
  }

  // filter
  const filtered = pincodes.filter((p) => {
    const pin = String(p.pincode || "");
    return pin.startsWith(value);
  });

  setPincodeSuggestions(filtered.slice(0, 10));
  setShowPincodeList(true);
};



// ==============================
// SELECT PINCODE
// ==============================
const handleNativePincodeSearch = (e) => {
  const value = e.target.value;

  setFormData((prev) => ({
    ...prev,
    native_pincode: value,
  }));

  if (!value) {
    setNativePincodeSuggestions([]);
    setShowNativePincodeList(false);
    return;
  }

  const filtered = pincodes.filter((p) => {
    const pin = String(p.pincode || "");
    return pin.startsWith(value);
  });

  setNativePincodeSuggestions(
    filtered.slice(0, 10)
  );

  setShowNativePincodeList(true);
};
const handleSelectNativePincode = (p) => {
  setFormData((prev) => ({
    ...prev,

    native_pincode: p.pincode || "",

    native_city:
      p.city ||
      p.city_name ||
      "",

    native_state:
      p.state ||
      p.state_name ||
      "",

    native_country:
      p.country ||
      p.country_name ||
      "",
  }));

  // dropdown close
  setShowNativePincodeList(false);
};
const handleSelectPincode = (p) => {
  console.log("SELECTED PINCODE =", p);

  setFormData((prev) => ({
    ...prev,
    presentAddress: {
      ...prev.presentAddress,
      pincode: p.pincode || "",
      city: p.city || p.city_name || "",
      state: p.state || p.state_name || "",
      country: p.country || p.country_name || "India",
    },
  }));

  setShowPincodeList(false);
  setPincodeSuggestions([]);
};

const handlePermanentPincodeSearch = (e) => {
  const value = e.target.value;

  setFormData((prev) => ({
    ...prev,
    permanentAddress: {
      ...prev.permanentAddress,
      pincode: value,
    },
  }));

  if (!value) {
    setPermanentPincodeSuggestions([]);
    setShowPermanentPincodeList(false);
    return;
  }

  const filtered = pincodes.filter((p) => {
    const pin = String(p.pincode || "");
    return pin.startsWith(value);
  });

  setPermanentPincodeSuggestions(filtered.slice(0, 10));
  setShowPermanentPincodeList(true);
};

// ======================================
// SELECT PINCODE
// ======================================

const handleSelectPermanentPincode = (p) => {
  console.log("PERMANENT PINCODE =", p);

  setFormData((prev) => ({
    ...prev,
    permanentAddress: {
      ...prev.permanentAddress,
      pincode: p.pincode || "",
      city: p.city || p.city_name || "",
      state: p.state || p.state_name || "",
      country: p.country || p.country_name || "India",
    },
  }));

  setShowPermanentPincodeList(false);
  setPermanentPincodeSuggestions([]);
};



const handleEmploymentPincodeSearch = (
  e,
  index
) => {
  const value = e.target.value;

  // update pincode
  handleArrayChange(
    {
      target: {
        value,
      },
    },
    index,
    "previousEmployments",
    "pincode"
  );

  if (!value) {
    setEmploymentPincodeSuggestions((prev) => ({
      ...prev,
      [index]: [],
    }));

    setShowEmploymentPincodeList((prev) => ({
      ...prev,
      [index]: false,
    }));

    return;
  }

  // filter pincodes
  const filtered = pincodes.filter((p) => {
    const pin = String(p.pincode || "");
    return pin.startsWith(value);
  });

  setEmploymentPincodeSuggestions((prev) => ({
    ...prev,
    [index]: filtered.slice(0, 10),
  }));

  setShowEmploymentPincodeList((prev) => ({
    ...prev,
    [index]: true,
  }));
};

// ==========================================
// SELECT PINCODE
// ==========================================

const handleSelectEmploymentPincode = (
  p,
  index
) => {
  setFormData((prev) => {
    const updated = [...prev.previousEmployments];

    updated[index] = {
      ...updated[index],
      pincode: p.pincode || "",
      city: p.city || p.city_name || "",
      state: p.state || p.state_name || "",
      country:
        p.country || p.country_name || "India",
    };

    return {
      ...prev,
      previousEmployments: updated,
    };
  });

  setShowEmploymentPincodeList((prev) => ({
    ...prev,
    [index]: false,
  }));

  setEmploymentPincodeSuggestions((prev) => ({
    ...prev,
    [index]: [],
  }));
};
const fetchCompanies = async () => {
  try {
    const { data } = await axios.get(COMPANY_API, getAuthHeaders());

    // 🔥 PRINT FULL RESPONSE
    console.log("COMPANIES API FULL RESPONSE:", data);

    console.log("COMPANIES ARRAY:", data.data);

    setCompanies(data.data || data);

  } catch (err) {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    } else {
      setError("Failed to fetch clients. Please try again.");
    }

    console.error("Failed to fetch companies", err);
  }
};
const fetchNextEmployeeCode = async () => {
  try {
    const res = await axios.get(
      `${API_URL}/api/employees/next-code`,
      getAuthHeaders()
    );

    if (res.data.success) {
      setFormData((prev) => ({
        ...prev,
        emp_code: res.data.nextCode,
      }));
    }
  } catch (err) {
    console.log("EMP CODE ERROR:", err);
  }
};


useEffect(() => {
  fetchNextEmployeeCode();
}, []);

  const fetchDropdownData = async () => {
    try {
      const { data } = await axios.get(
        `${API_URL}/api/employee-types?simple=true`,
        getAuthHeaders(),
      );

      console.log("EMPLOYEE TYPES API:", data);

      setEmployeeTypes(
        Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [],
      );
    } catch (err) {
      console.error("Employee Types API Error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        setError("Failed to load dropdown data");
      }

      setEmployeeTypes([]);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (editingEmployee && companies.length > 0) {
      handleEditEmployee(editingEmployee);
    }
  }, [editingEmployee, companies]);

 const handleEditEmployee = async (employee) => {
  setStep(1);
  setValidationErrors({});

  const clientId =
    employee.client_id ||
    employee.client?._id ||
    "";

  // FETCH SITES
  if (clientId) {
    try {
      const res = await axios.get(
        `${API_URL}/api/clients/client/${clientId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setAvailableSite(res.data.data || []);
    } catch (err) {
      console.log(err);
      setAvailableSite([]);
    }
  }
  console.log("AVAILABLE SITES =>", availableSite)

  setFormData({
    ...initialFormData,

    // =========================
    // BASIC
    // =========================
    initial: employee.initial || "",
    employee_code: employee.employee_code || "",
    reg_date: employee.reg_date?.slice(0, 10) || "",
    first_name: employee.first_name || "",
    middle_name: employee.middle_name || "",
    last_name: employee.last_name || "",
    gender: employee.gender || "",
    dob: employee.dob?.slice(0, 10) || "",
    date_of_joining: employee.date_of_joining?.slice(0, 10) || "",
    email_id: employee.email_id || "",
    father_name: employee.father_name || "",
    rank: employee.rank || "",
    sal_from_date:employee.sal_from_date ||"",
    sal_to_date:employee.sal_to_date ||"",
    department: employee.department || "",

    // =========================
    // CLIENT / SITE
    // =========================
    client_id: String(employee.client_id || ""),
    client_name: employee.client_name || "",
    site_id: String(employee.site_id || ""),
    site_name: employee.site_name || "",

    // =========================
    // ADDRESS
    // =========================
    presentAddress: {
      address: employee.address || "",
      city: employee.city || "",
      state: employee.state || "",
      pincode: employee.pincode || "",
      country: employee.country || "",
      phone1: employee.phone1 || "",
      phone2: employee.phone2 || "",
    },

    permanentAddress: {
      address: employee.p_address || "",
      city: employee.p_city || "",
      state: employee.p_state || "",
      pincode: employee.p_pincode || "",
      country: employee.p_country || "",
      phone1: employee.p_phone1 || "",
      phone2: employee.p_phone2 || "",
    },

    native_address: employee.native_address || "",
native_city: employee.native_city || "",
native_state: employee.native_state || "",
native_pincode: employee.native_pincode || "",
native_country: employee.native_country || "",
    sameAsPresentAddress:
      employee.address === employee.p_address,


  contact_person: employee.contact_person?.[0] || "",
  contact_mobile: employee.contact_mobile?.[0] || "",
  contact_relation: employee.contact_relation?.[0] || "",
  contact_email: employee.contact_email?.[0] || "",
aadhar_no: employee.aadhar_no || "",
pancard_no: employee.pancard_no || "",
passport_no: employee.passport_no || "",
passport_valid_date: employee.passport_valid_date?.slice(0, 10) || "",
uan_no: employee.uan_no || "",
pf_no: employee.pf_no || "",
esis_no: employee.esis_no || "",

driving_license: employee.driving_license || "",
    // =========================
    // PERSONAL
    // =========================
    marital_status: employee.marital_status || "",
    mrg_date: employee.mrg_date?.slice(0, 10) || "",
    cast: employee.cast || "",
    category: employee.category || "",
    native_place: employee.native_place || "",
    blood_group: employee.blood_group || "",

    // =========================
    // DOCUMENTS
    // =========================
    driving_license: employee.driving_license || "",
    pancard_no: employee.pancard_no || "",
    aadhar_no: employee.aadhar_no || "",
    passport_no: employee.passport_no || "",
    passport_valid_date: employee.passport_valid_date?.slice(0, 10) || "",
    pf_no: employee.pf_no || "",
    uan_date:employee.uan_date?.slice(0, 10) || "",
    uan_no: employee.uan_no || "",
esis_date:employee.esis_date?.slice(0, 10) || "",
    esis_no: employee.esis_no || "",

    // =========================
    // LANGUAGES (IMPORTANT FIX)
    // =========================
    languageKnown: [
      employee.lang1 || "",
      employee.lang2 || "",
      employee.lang3 || "",
      employee.lang4 || "",
      employee.lang5 || "",
    ],

    // =========================
    // HOBBIES
    // =========================
    hobbies: [
      employee.hobby1 || "",
      employee.hobby2 || "",
      employee.hobby3 || "",
      employee.hobby4 || "",
    ],

    // =========================
    // BANK
    // =========================

  bank_name: employee.bank_name || "",
  account_no: employee.account_no || "",
  bank_address: employee.bank_address || "",
  bank_city: employee.bank_city || "",
  bank_state: employee.bank_state || "",
  bank_ifsc: employee.bank_ifsc || "",
  bank_micr: employee.bank_micr || "",
  ac_holder_name: employee.ac_holder_name || "",
  card_no: employee.card_no || "",


    // =========================
    // SEPARATION
    // =========================
  separationDetails: {
  separation_type: employee.separation_type || "",
  separate_reason: employee.separate_reason || "",
  date_of_separation: employee.date_of_separation?.slice(0, 10) || "",
  notice_period: employee.notice_period || "",
  last_working_date_sp: employee.last_working_date_sp?.slice(0, 10) || "",
  handover_given_to: employee.handover_given_to || "",
},
  });

  console.log("EDIT DATA LOADED:", employee);

  setEditingEmployee(employee);
};

  const handleClose = () => {
    onCancel();
  };

  // Previous Functions
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "sameAsPresentAddress") {
      setFormData((prevData) => ({
        ...prevData,
        sameAsPresentAddress: checked,
        permanentAddress: checked
          ? { ...prevData.presentAddress }
          : {
              address: "",
              city: "",
              state: "",
              pincode: "",
              country: "",
              phone1: "",
              phone2: "",
            },
        ...(name === "maritalStatus" && value !== "Married"
          ? { marriageDate: "" }
          : {}),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    const key = name;
    if (validationErrors[key]) {
      setValidationErrors((prev) => ({
        ...prev,
        [key]: "",
      }));
    }
  };

const handleClientChange = async (selected) => {
  const clientId = selected ? String(selected.value) : "";

  setFormData((prev) => ({
    ...prev,

    client_id: clientId,

    client_name: selected ? selected.label : "",

    site_id: "",
    site_name: "",
  }));

  if (!clientId) {
    setAvailableSite([]);
    return;
  }
console.log("AVAILABLE SITES =>", availableSite)
  try {
    const res = await axios.get(
      `${API_URL}/api/companies/branches/${clientId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    setAvailableSite(res.data.data || []);
  } catch (err) {
    console.log(err);
    setAvailableSite([]);
  }
};
  const handleObjectChange = (e, objectName, field) => {
    const value = e.target.value;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [objectName]: {
          ...prev[objectName],
          [field]: value,
        },
      };

      // If same checkbox selected then copy automatically
      if (objectName === "presentAddress" && prev.sameAsPresentAddress) {
        updated.permanentAddress = {
          ...updated.presentAddress,
        };
      }

      return updated;
    });
  };

  const handleHobbyChange = (e, index) => {
    const newValue = e.target.value;
    setFormData((prevData) => {
      const newArray = [...prevData.hobbies];
      newArray[index] = newValue;
      return { ...prevData, hobbies: newArray };
    });
  };

 const handleArrayChange = (
  e,
  index,
  arrayName,
  fieldName
) => {

  const { type, checked, files, value } = e.target;

  let fieldValue;

  // =========================
  // FILE INPUT
  // =========================

  if (type === "file") {

    fieldValue = files && files.length > 0
      ? files[0]
      : null;

  }

  // =========================
  // CHECKBOX INPUT
  // =========================

  else if (type === "checkbox") {

    fieldValue = checked;

  }

  // =========================
  // NORMAL INPUT
  // =========================

  else {

    fieldValue = value;

  }

  // =========================
  // VALIDATION
  // =========================

  if (!Array.isArray(formData[arrayName])) {

    console.error(
      `formData["${arrayName}"] is not an array`
    );

    return;

  }

  // =========================
  // UPDATE ARRAY
  // =========================

  const updatedArray = [...formData[arrayName]];

  updatedArray[index] = {
    ...updatedArray[index],

    [fieldName]: fieldValue,

    // Optional preview for image
    ...(type === "file" &&
      fieldValue && {
        preview: URL.createObjectURL(fieldValue),
      }),
  };

  // =========================
  // UPDATE STATE
  // =========================

  setFormData((prevData) => ({
    ...prevData,
    [arrayName]: updatedArray,
  }));

  // =========================
  // REMOVE VALIDATION ERROR
  // =========================

  const key =
    `${arrayName}[${index}].${fieldName}`;

  if (validationErrors[key]) {

    setValidationErrors((prev) => ({
      ...prev,
      [key]: "",
    }));

  }

};

  const addArrayItem = (arrayName, defaultItem) => {
    setFormData((prevData) => ({
      ...prevData,
      [arrayName]: [...prevData[arrayName], defaultItem],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData((prevData) => ({
      ...prevData,
      [arrayName]: prevData[arrayName].filter((_, i) => i !== index),
    }));
  };

  // Handlers for specific array of strings (languages, hobbies)
  const handleStringArrayChange = (e, index, arrayName) => {
    const newValue = e.target.value;
    setFormData((prevData) => {
      const newArray = [...prevData[arrayName]];
      newArray[index] = newValue;
      return { ...prevData, [arrayName]: newArray };
    });

    const key = `${arrayName}[${index}]`;
    if (validationErrors[key]) {
      setValidationErrors((prev) => ({
        ...prev,
        [key]: "",
      }));
    }
  };

  const nextStep = () => {
    setStep((prev) => {
      if (prev < 5) {
        return prev + 1;
      }
      return prev; // Stay on last step
    });
  };

  const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));

  const isValidPhone = (phone) => /^\d{10}$/.test(phone);
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPincode = (pincode) => /^\d{6}$/.test(pincode);
  const isValidPAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  const isValidAadhar = (aadhar) => /^\d{12}$/.test(aadhar);
  const isValidBankAccount = (acc) => /^[0-9]{6,18}$/.test(acc);
  const isValidIFSC = (ifsc) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);

  const validateStep1 = () => {
    const errors = {};

    if (!formData.first_name.trim())
      errors.first_name = "First name is required";
    if (!formData.last_name.trim()) errors.last_name = "Last name is required";
    if (!formData.email_id.trim()) errors.email_id = "Email ID is required";
    if (formData.email_id && !isValidEmail(formData.email_id)) {
      errors.email_id = "Invalid email address";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors = {};

   
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep4 = () => {
    const errors = {};

   
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const validateStep5 = () => {
    const errors = {};

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };


const handleNext = async () => {

  let validation;

  switch (step) {
    case 1:
      validation = validateStep1();
      break;
    case 2:
      validation = validateStep2();
      break;
    case 3:
      validation = validateStep3();
      break;
    case 4:
      validation = validateStep4();
      break;
    case 5:
      validation = validateStep5();
      break;
    default:
      validation = true;
  }

  if (!validation) {
    alert("Please fix validation errors");
    return;
  }

  try {

    let currentEmployeeId = employeeId;

    // STEP 1 CREATE EMPLOYEE ONLY
 if (step === 1) {

  // ============================
  // EDIT MODE
  // ============================
  if (editingEmployee) {

    currentEmployeeId = editingEmployee.id;

    setEmployeeId(currentEmployeeId);

    console.log(
      "EDIT MODE - Using existing ID:",
      currentEmployeeId
    );

  }

  // ============================
  // CREATE MODE
  // ============================
  else if (!currentEmployeeId) {

    const selectedClient = companies.find(
      (c) =>
        String(c.id || c._id) ===
        String(formData.client_id)
    );

    const selectedSite = availableSite.find(
      (s) =>
        String(s.site_id || s.id) ===
        String(formData.site_id)
    );

    const payload = {
      ...preprocessFormData(formData),

      // =========================
      // BASIC DETAILS
      // =========================
      initial: formData.initial || "",
      first_name: formData.first_name || "",
      middle_name: formData.middle_name || "",
      last_name: formData.last_name || "",

      gender: formData.gender || "",

      dob: safeDate(formData.dob),

      date_of_joining: safeDate(
        formData.date_of_joining
      ),

      email_id: formData.email_id || "",

      father_name: formData.father_name || "",

      rank: formData.rank || "",

      department: formData.department || "",

      gang_name: formData.gang_name || "",

      // =========================
      // CLIENT + SITE
      // =========================
      client_id: String(
        formData.client_id || ""
      ),

      client_name:
        selectedClient?.company_name ||
        selectedClient?.client_name ||
        "",

      site_id: String(
        formData.site_id || ""
      ),

      site_name:
        selectedSite?.site_name || "",

      // =========================
      // PRESENT ADDRESS
      // =========================
      address:
        formData.presentAddress?.address || "",

      city:
        formData.presentAddress?.city || "",

      state:
        formData.presentAddress?.state || "",

      pincode:
        formData.presentAddress?.pincode || "",

      country:
        formData.presentAddress?.country || "",

      phone1:
        formData.presentAddress?.phone1 || "",

      phone2:
        formData.presentAddress?.phone2 || "",

      // =========================
      // PERMANENT ADDRESS
      // =========================
      p_address:
        formData.permanentAddress?.address || "",

      p_city:
        formData.permanentAddress?.city || "",

      p_state:
        formData.permanentAddress?.state || "",

      p_pincode:
        formData.permanentAddress?.pincode || "",

      p_country:
        formData.permanentAddress?.country || "",

      p_phone1:
        formData.permanentAddress?.phone1 || "",

      p_phone2:
        formData.permanentAddress?.phone2 || "",

      // =========================
      // EMERGENCY CONTACT
      // =========================
      contact_person:
        formData.emergencyContacts?.[0]
          ?.contact_person || "",

      contact_mobile:
        formData.emergencyContacts?.[0]
          ?.mobile || "",

      contact_relation:
        formData.emergencyContacts?.[0]
          ?.relation || "",

      contact_email:
        formData.emergencyContacts?.[0]
          ?.email || "",

      // =========================
      // STATUS
      // =========================
      em_status: "Pending",

      active: "0",
    };

    console.log(
      "STEP 1 PAYLOAD =",
      payload
    );

    const response = await axios.post(
      `${API_URL}/api/employees`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "token"
          )}`,
          "Content-Type": "application/json",
        },
      }
    );

    currentEmployeeId =
      response.data.employeeId;

    setEmployeeId(currentEmployeeId);

    console.log(
      "NEW EMPLOYEE CREATED ID:",
      currentEmployeeId
    );
  }
}

    // 🔥 IMPORTANT
    // Step 2 onwards always update existing employee
  if (step >= 2 && currentEmployeeId) {

  const updatePayload = {
    ...preprocessFormData(formData),

    // =========================
    // PERSONAL
    // =========================
    marital_status: formData.marital_status || "",
    mrg_date: formData.mrg_date || "",

    cast: formData.cast || "",
    category: formData.category || "",
    native_place: formData.native_place || "",
    blood_group: formData.blood_group || "",

    // =========================
    // DOCUMENTS
    // =========================
    driving_license: formData.driving_license || "",
    pancard_no: formData.pancard_no || "",
    aadhar_no: formData.aadhar_no || "",
    passport_no: formData.passport_no || "",
    passport_valid_date: formData.passport_valid_date || "",

    pf_no: formData.pf_no || "",

    uan_no: formData.uan_no || "",
    uan_date: formData.uan_date || "",

    esis_no: formData.esis_no || "",
    esis_date: formData.esis_date || "",

    // =========================
    // LANGUAGE
    // =========================
    lang1: formData.languageKnown?.[0] || "",
    lang2: formData.languageKnown?.[1] || "",
    lang3: formData.languageKnown?.[2] || "",
    lang4: formData.languageKnown?.[3] || "",
    lang5: formData.languageKnown?.[4] || "",

    // =========================
    // HOBBIES
    // =========================
    hobby1: formData.hobbies?.[0] || "",
    hobby2: formData.hobbies?.[1] || "",
    hobby3: formData.hobbies?.[2] || "",
    hobby4: formData.hobbies?.[3] || "",

    // =========================
    // CLIENT + SITE
    // =========================
    client_id: formData.client_id || "",
site_id: formData.site_id || "",
  };

  console.log("UPDATE PAYLOAD =", updatePayload);

  await axios.put(
    `${API_URL}/api/employees/${currentEmployeeId}`,
    updatePayload,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    }
  );

  console.log(`STEP ${step} UPDATED`);
}

    if (step < 5) {
      nextStep();
    } else {
      handleSubmit();
    }

  } catch (error) {

    console.error(
      "STEP ERROR:",
      error.response?.data || error.message
    );

    alert("Employee save failed");
  }
};
const safeDate = (value) => {
  if (!value) return null;

  // If already ISO format
  if (typeof value === "string" && value.includes("T")) {
    return value;
  }

  // DD-MM-YYYY
  if (typeof value === "string" && value.includes("-")) {
    const parts = value.split("-");

    if (parts[0].length === 2) {
      const [dd, mm, yyyy] = parts;
      return `${yyyy}-${mm}-${dd}`;
    }

    // already YYYY-MM-DD
    if (parts[0].length === 4) {
      return value;
    }
  }

  // fallback safe parsing
  const date = new Date(value);

  if (isNaN(date.getTime())) return null;

  return date.toISOString().split("T")[0]; // IMPORTANT
};

const preprocessFormData = (data) => {
  const cloned = { ...data };

  // =========================
  // FILTER EMPTY ARRAYS
  // =========================

  cloned.languageKnown = (cloned.languageKnown || []).filter(
    (l) => l?.trim() !== ""
  );

  cloned.hobbies = (cloned.hobbies || []).filter(
    (h) => h?.trim() !== ""
  );

  // =========================
  // SAFE DATES
  // =========================

  const dateFields = [
    "dob",
    "date_of_joining",
    "marriageDate",
    "passportValidDate",
    "salaryGenerationFromDate",
    "salaryGenerationToDate",
    "esisDate",
    "uanDate",
  ];

  dateFields.forEach((key) => {
    cloned[key] = safeDate(cloned[key]);
  });

  // =========================
  // FAMILY NOMINEE
  // =========================

  cloned.familyNomineeDetails = (
    cloned.familyNomineeDetails || []
  ).map((item) => ({
    ...item,
    dob: safeDate(item.dob),
  }));

  // =========================
  // PREVIOUS EMPLOYMENT
  // =========================

  cloned.previousEmployments = (
    cloned.previousEmployments || []
  ).map((item) => ({
    ...item,
    joinedDate: safeDate(item.joinedDate),
    lastWorkingDate: safeDate(item.lastWorkingDate),
  }));

  // =========================
  // PRESENT ADDRESS
  // =========================

  cloned.address =
    cloned.presentAddress?.address || "";

  cloned.city =
    cloned.presentAddress?.city || "";

  cloned.state =
    cloned.presentAddress?.state || "";

  cloned.pincode =
    cloned.presentAddress?.pincode || "";

  cloned.country =
    cloned.presentAddress?.country || "";

  cloned.phone1 =
    cloned.presentAddress?.phone1 || "";

  cloned.phone2 =
    cloned.presentAddress?.phone2 || "";

  // =========================
  // PERMANENT ADDRESS
  // =========================

  cloned.p_address =
    cloned.permanentAddress?.address || "";

  cloned.p_city =
    cloned.permanentAddress?.city || "";

  cloned.p_state =
    cloned.permanentAddress?.state || "";

  cloned.p_pincode =
    cloned.permanentAddress?.pincode || "";

  cloned.p_country =
    cloned.permanentAddress?.country || "";

  cloned.p_phone1 =
    cloned.permanentAddress?.phone1 || "";

  cloned.p_phone2 =
    cloned.permanentAddress?.phone2 || "";

  // =========================
  // EMERGENCY CONTACT
  // =========================

  cloned.contact_person =
    cloned.emergencyContacts?.[0]?.contact_person || "";

  cloned.contact_mobile =
    cloned.emergencyContacts?.[0]?.mobile || "";

  cloned.contact_relation =
    cloned.emergencyContacts?.[0]?.relation || "";

  cloned.contact_email =
    cloned.emergencyContacts?.[0]?.email || "";

  // =========================
  // CLIENT / SITE
  // =========================

  cloned.client_id = cloned.client_id || "";

  cloned.client_name =
    cloned.client_name || "";

  cloned.site_id = cloned.site_id || "";

  cloned.site_name =
    cloned.site_name || "";

  // =========================
  // RANK
  // =========================

  cloned.rank = cloned.rank || "";

  // =========================
  // MARITAL STATUS
  // =========================

  cloned.marital_status =
    cloned.marital_status || "";

  return cloned;
};

  const buildFormData = (data) => {
  const formData = new FormData();

  for (const key in data) {
    const value = data[key];

    if (value === undefined || value === null) continue;

    // Skip frontend only fields
    if (
      [
        "sameAsPresentAddress",
        "presentAddress",
        "permanentAddress",
      ].includes(key)
    ) {
      continue;
    }

    // Arrays
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
      continue;
    }

    // File handling
    if (value instanceof File) {
      formData.append(key, value);
      continue;
    }

    // Objects stringify
    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
      continue;
    }

    // Normal values
    formData.append(key, String(value));
  }

  return formData;
};

// =====================================================
// FRONTEND - HANDLE SUBMIT + DOCUMENT UPLOAD
// =====================================================
// =====================================================
// HANDLE SUBMIT
// =====================================================

const handleSubmit = async () => {
  try {
    // =====================================================
    // CLIENT + SITE
    // =====================================================

    const selectedClient = companies.find(
      (c) =>
        String(c.id || c._id) ===
        String(formData.client_id)
    );

    const selectedSite = availableSite.find(
      (s) =>
        String(s.site_id || s.id) ===
        String(formData.site_id)
    );

    // =====================================================
    // PAYLOAD
    // =====================================================

    const payload = {
      ...preprocessFormData(formData),

      // =====================================================
      // COMPANY
      // =====================================================
emp_code:
  formData.emp_code || "",

reg_date:
  formData.reg_date || "",

// =====================================================
// NATIVE ADDRESS
// =====================================================

native_address:
  formData.native_address || "",

native_city:
  formData.native_city || "",

native_state:
  formData.native_state || "",

native_pincode:
  formData.native_pincode || "",

native_country:
  formData.native_country || "",
      client_id: formData.client_id || "",

      client_name:
        selectedClient?.company_name ||
        selectedClient?.client_name ||
        "",

      company_id: formData.company_id || "",

      branch_id: formData.branch_id || "",

      site_id: formData.site_id || "",

      site_name:
        selectedSite?.site_name || "",

      reporting_manager:
        formData.reporting_manager || "",

      reporting_user:
        formData.reporting_user || "",

      salary_template:
        formData.salary_template || "",

      department:
        formData.department || "",

      // =====================================================
      // BASIC DETAILS
      // =====================================================

      initial: formData.initial || "",

      first_name:
        formData.first_name || "",

      middle_name:
        formData.middle_name || "",

      last_name:
        formData.last_name || "",

      emp_full_name: `${formData.first_name || ""} ${
        formData.last_name || ""
      }`.trim(),

      gender: formData.gender || "",

      dob: formData.dob || "",

      date_of_joining:
        formData.date_of_joining || "",

      gang_name:
        formData.gang_name || "",

      rank: formData.rank || "",

      father_name:
        formData.father_name || "",

      migrant_status:
        formData.migrant_status || "",

      // =====================================================
      // PRESENT ADDRESS
      // =====================================================

      address:
        formData.presentAddress?.address ||
        "",

      city:
        formData.presentAddress?.city || "",

      state:
        formData.presentAddress?.state ||
        "",

      pincode:
        formData.presentAddress?.pincode ||
        "",

      country:
        formData.presentAddress?.country ||
        "",

      phone1:
        formData.presentAddress?.phone1 ||
        "",

      phone2:
        formData.presentAddress?.phone2 ||
        "",

      email_id:
        formData.email_id || "",

      // =====================================================
      // CONTACT PERSON
      // =====================================================

      contact_person:
        formData.contact_person || "",

      contact_mobile:
        formData.contact_mobile || "",

      contact_relation:
        formData.contact_relation || "",

      contact_email:
        formData.contact_email || "",

      // =====================================================
      // PERMANENT ADDRESS
      // =====================================================

      p_address:
        formData.permanentAddress?.address ||
        "",

      p_city:
        formData.permanentAddress?.city ||
        "",

      p_state:
        formData.permanentAddress?.state ||
        "",

      p_pincode:
        formData.permanentAddress?.pincode ||
        "",

      p_country:
        formData.permanentAddress?.country ||
        "",

      p_phone1:
        formData.permanentAddress?.phone1 ||
        "",

      p_phone2:
        formData.permanentAddress?.phone2 ||
        "",

      // =====================================================
      // PERSONAL DETAILS
      // =====================================================

      marital_status:
        formData.marital_status || "",

      mrg_date:
        formData.mrg_date || "",

      cast:
        formData.cast || "",

      category:
        formData.category || "",

      native_place:
        formData.native_place || "",

      blood_group:
        formData.blood_group || "",

      // =====================================================
      // DOCUMENT DETAILS
      // =====================================================

      driving_license:
        formData.driving_license || "",

      pancard_no:
        formData.pancard_no || "",

      aadhar_no:
        formData.aadhar_no || "",

      passport_no:
        formData.passport_no || "",

      passport_valid_date:
        formData.passport_valid_date ||
        "",

      pf_no:
        formData.pf_no || "",

      pf_applicable:
        formData.pf_applicable || "",

      uan_no:
        formData.uan_no || "",

      uan_date:
        formData.uan_date || "",

      esis_no:
        formData.esis_no || "",

      esis_date:
        formData.esis_date || "",

      // =====================================================
      // LANGUAGE
      // =====================================================

      lang1:
        formData.languageKnown?.[0] || "",

      lang2:
        formData.languageKnown?.[1] || "",

      lang3:
        formData.languageKnown?.[2] || "",

      lang4:
        formData.languageKnown?.[3] || "",

      lang5:
        formData.languageKnown?.[4] || "",

      // =====================================================
      // HOBBIES
      // =====================================================

      hobby1:
        formData.hobbies?.[0] || "",

      hobby2:
        formData.hobbies?.[1] || "",

      hobby3:
        formData.hobbies?.[2] || "",

      hobby4:
        formData.hobbies?.[3] || "",

      // =====================================================
      // SALARY DETAILS
      // =====================================================

      gross_salary:
        formData.gross_salary || "",

      gross_salary_type:
        formData.gross_salary_type || "",

      basic_salary:
        formData.basic_salary || "",

      basic_salary_type:
        formData.basic_salary_type || "",

      perday_salary:
        formData.perday_salary || "",

      basic_term:
        formData.basic_term || "",

      da_term:
        formData.da_term || "",

      sal_from_date:
        formData.sal_from_date || "",

      sal_to_date:
        formData.sal_to_date || "",

      // =====================================================
      // SEPARATION
      // =====================================================

      separation_type:
        formData.separationDetails
          ?.separation_type || "",

      separate_reason:
        formData.separationDetails
          ?.separate_reason || "",

      date_of_separation:
        formData.separationDetails
          ?.date_of_separation || "",

      notice_period:
        formData.separationDetails
          ?.notice_period || "",

      last_working_date_sp:
        formData.separationDetails
          ?.last_working_date_sp || "",

      handover_given_to:
        formData.separationDetails
          ?.handover_given_to || "",
    };

    // =====================================================
    // FORM DATA
    // =====================================================

    const submissionFormData =
      new FormData();

    Object.keys(payload).forEach((key) => {
      if (
        payload[key] !== undefined &&
        payload[key] !== null
      ) {
        submissionFormData.append(
          key,
          payload[key]
        );
      }
    });

    // =====================================================
    // BANK DETAILS
    // =====================================================

    submissionFormData.append(
      "ac_holder_name",
      formData.bankDetails
        ?.ac_holder_name || ""
    );

    submissionFormData.append(
      "card_no",
      formData.bankDetails?.card_no || ""
    );

    submissionFormData.append(
      "bank_name",
      formData.bankDetails?.bankName || ""
    );

    submissionFormData.append(
      "account_no",
      formData.bankDetails
        ?.bankAccountNo || ""
    );

    submissionFormData.append(
      "bank_address",
      formData.bankDetails
        ?.bankAddress || ""
    );

    submissionFormData.append(
      "bank_city",
      formData.bankDetails?.city || ""
    );

    submissionFormData.append(
      "bank_state",
      formData.bankDetails?.state || ""
    );

    submissionFormData.append(
      "bank_ifsc",
      formData.bankDetails?.ifscCode || ""
    );

    submissionFormData.append(
      "bank_micr",
      formData.bankDetails?.micrCode || ""
    );

    submissionFormData.append(
  "emergencyContacts",
  JSON.stringify(
    formData.emergencyContacts || []
  )
);
    // =====================================================
    // CANCELLED CHEQUE FILE
    // =====================================================

    if (
      formData.bankDetails
        ?.cancelledChequeFile instanceof File
    ) {
      submissionFormData.append(
        "cancelledChequeFile",
        formData.bankDetails
          ?.cancelledChequeFile
      );
    }

    // =====================================================
    // CREATE / UPDATE EMPLOYEE
    // =====================================================

    const finalEmployeeId =
      editingEmployee?.id || employeeId;

    const url = finalEmployeeId
      ? `${API_URL}/api/employees/${finalEmployeeId}`
      : `${API_URL}/api/employees`;

    const method =
      finalEmployeeId ? "PUT" : "POST";

    const res = await axios({
      method,
      url,
      data: submissionFormData,

      headers: {
        Authorization: `Bearer ${localStorage.getItem(
          "token"
        )}`,
        "Content-Type":
          "multipart/form-data",
      },
    });

    console.log(
      "EMPLOYEE SAVED:",
      res.data
    );

    // =====================================================
    // EMPLOYEE ID
    // =====================================================

    const savedEmployeeId =
      res.data.employeeId ||
      res.data.data?.id ||
      finalEmployeeId;

    // =====================================================
    // DOCUMENTS
    // =====================================================

    await uploadDocuments(
      savedEmployeeId
    );

    // =====================================================
    // NOMINEE
    // =====================================================

    await saveNominee(
      savedEmployeeId
    );

    // =====================================================
    // EXPERIENCE
    // =====================================================

    await saveExperience(
      savedEmployeeId
    );

    alert(
      "Employee + Documents + Nominee + Experience Saved Successfully"
    );
  } catch (err) {
    console.error(
      "SUBMIT ERROR:",
      err.response?.data || err.message
    );

    alert(
      err.response?.data?.error ||
        "Error while saving employee"
    );
  }
};



// =====================================================
// SAVE EXPERIENCE
// =====================================================

const saveExperience = async (
  empId
) => {

  try {

    for (
      const exp of
      formData.previousEmployments
    ) {

      const payload = {

        emp_id:
          empId,

        emp_company_name:
          exp.companyName || "",

        emp_designation:
          exp.designation || "",

        emp_address:
          exp.address || "",

        emp_city:
          exp.city || "",

        emp_state:
          exp.state || "",

        emp_country:
          exp.country || "",

        emp_pincode:
          exp.pincode || "",

        emp_joined_date:
          exp.joinedDate || "",

        last_working_date:
          exp.lastWorkingDate || "",

        annual_ctc:
          exp.annualCTC || 0,

        monthly_ctc:
          exp.monthlyCTC || 0,

        reporting_to:
          exp.reportingTo || "",

        reporting_to_designation:
          exp.reportingToDesignation || "",

        reporting_to_email:
          exp.email || "",

        reporting_to_contact:
          exp.contact || "",

        gross_income:
          exp.grossIncomePrevEmpl || 0,

        gross_tds:
          exp.grossTDSDeducted || 0,

        gross_pt:
          exp.grossPT || 0,

        total_pt:
          exp.totalPTDeducted || 0,

        active: 1,

        source: "",
      };

      const response =
        await axios.post(

          `${API_URL}/api/employees/experience`,

          payload,

          {
            headers: {
              Authorization:
                `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

      console.log(
        "EXPERIENCE SAVED:",
        response.data
      );
    }

  } catch (error) {

    console.log(
      "EXPERIENCE ERROR:",
      error.response?.data ||
      error.message
    );

    throw error;
  }
};






// ===============================================
// FRONTEND
// uploadDocuments FUNCTION
// ===============================================

const uploadDocuments = async (empId) => {
  try {

    console.log("================================");
    console.log("UPLOAD DOCUMENTS START");
    console.log("EMP ID =", empId);

    if (!empId) {
      throw new Error("Employee ID missing");
    }

    const formDataObj = new FormData();

    // ===========================================
    // EMPLOYEE DATA
    // ===========================================

    formDataObj.append(
      "emp_id",
      String(empId)
    );

    formDataObj.append(
      "emp_code",
      formData.emp_code || ""
    );

    console.log(
      "EMP CODE =",
      formData.emp_code
    );

    // ===========================================
    // DOCUMENT ARRAY
    // ===========================================

    const documentPayload = [];

    formData.kycDocuments?.forEach((doc, index) => {

      console.log(
        `DOCUMENT ${index + 1} =`,
        doc
      );

      documentPayload.push({

        id: doc.id || null,

        documentType:
          doc.documentType || "",

        documentName:
          doc.documentName || "",

        status:
          doc.status || "Pending",

        remark:
          doc.remark || "",

        imagePath:
          doc.imagePath || "",
      });

      // ===========================================
      // FILE
      // ===========================================

      if (doc.file instanceof File) {

        console.log(
          `FILE FOUND FOR DOC ${index + 1}`
        );

        console.log(
          "FILE NAME =",
          doc.file.name
        );

  formDataObj.append("kycDocuments", doc.file);
      } else {

        console.log(
          `NO FILE FOR DOC ${index + 1}`
        );
      }
    });

    console.log(
      "DOCUMENT PAYLOAD =",
      documentPayload
    );

    formDataObj.append(
      "documents",
      JSON.stringify(documentPayload)
    );

    // ===========================================
    // CANCELLED CHEQUE
    // ===========================================

    if (
      formData.bankDetails?.cancelledChequeFile
    ) {

      console.log(
        "CANCELLED CHEQUE FILE =",
        formData.bankDetails
          .cancelledChequeFile?.name
      );

      formDataObj.append(
        "cancelledChequeFile",
        formData.bankDetails
          .cancelledChequeFile
      );
    }

    // ===========================================
    // CREATE / UPDATE
    // ===========================================

    const isEdit =
      !!editingEmployee?.id;

    const method =
      isEdit ? "PUT" : "POST";

    const url =
      `${API_URL}/api/employees/upload-documents`;

    console.log("METHOD =", method);

    console.log("URL =", url);

    console.log(
      "TOKEN =",
      localStorage.getItem("token")
    );

    // ===========================================
    // FORMDATA PRINT
    // ===========================================

    console.log("========== FORMDATA ==========");

    for (let pair of formDataObj.entries()) {

      console.log(
        pair[0],
        "=",
        pair[1]
      );
    }

    console.log("==============================");

    // ===========================================
    // API CALL
    // ===========================================

    const response = await axios({

      method,

      url,

      data: formDataObj,

      headers: {
        Authorization:
          `Bearer ${localStorage.getItem("token")}`,
      },
    });

    console.log(
      "DOCUMENT RESPONSE =",
      response.data
    );

    console.log("UPLOAD SUCCESS");

    return response.data;

  } catch (error) {

    console.log("UPLOAD ERROR");

    console.log(
      error.response?.data ||
      error.message
    );

    console.log(error);

    throw error;
  }
};


// =====================================================
// SAVE NOMINEE
// =====================================================

const saveNominee = async (
  empId
) => {

  try {

    for (
      const nominee of
      formData.familyNomineeDetails
    ) {

      const payload = {

        emp_id:
          empId,

        f_initial:
          nominee.initial || "",

        f_relative_name:
          nominee.relativeName || "",

        f_gender:
          nominee.gender || "",

        f_relation:
          nominee.contact_relation || "",

        f_dob:
          nominee.dob || "",

        f_age:
          nominee.age || "",

        f_minor:
          nominee.isMinor
            ? "Yes"
            : "No",

        f_guardian:
          nominee.guardianName || "",

        f_address:
          nominee.address || "",

        f_contact:
          nominee.contactNo || "",

        f_email:
          nominee.email_id || "",

        f_sharepf:
          nominee.sharePF || "",

        f_shareesic:
          nominee.shareESIC || "",

        active: 1,

        source: "",
      };

      const response =
        await axios.post(

          `${API_URL}/api/employees/nominee`,

          payload,

          {
            headers: {
              Authorization:
                `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

      console.log(
        "NOMINEE SAVED:",
        response.data
      );
    }

  } catch (error) {

    console.log(
      "NOMINEE ERROR:",
      error.response?.data ||
      error.message
    );

    throw error;
  }
};



// =====================================================
// FRONTEND API CALL
// =====================================================

// const saveExperience = async (
//   empId
// ) => {

//   try {

//     for (
//       const exp of
//       formData.experienceDetails
//     ) {

//       const payload = {

//         emp_id:
//           empId,

//         emp_company_name:
//           exp.companyName || "",

//         emp_designation:
//           exp.designation || "",

//         emp_address:
//           exp.address || "",

//         emp_city:
//           exp.city || "",

//         emp_state:
//           exp.state || "",

//         emp_country:
//           exp.country || "",

//         emp_pincode:
//           exp.pincode || "",

//         emp_joined_date:
//           exp.joinedDate || "",

//         last_working_date:
//           exp.lastWorkingDate || "",

//         annual_ctc:
//           exp.annualCTC || 0,

//         monthly_ctc:
//           exp.monthlyCTC || 0,

//         reporting_to:
//           exp.reportingTo || "",

//         reporting_to_designation:
//           exp.reportingDesignation || "",

//         reporting_to_email:
//           exp.reportingEmail || "",

//         reporting_to_contact:
//           exp.reportingContact || "",

//         gross_income:
//           exp.grossIncome || 0,

//         gross_tds:
//           exp.grossTDS || 0,

//         gross_pt:
//           exp.grossPT || 0,

//         total_pt:
//           exp.totalPT || 0,

//         active: 1,

//         source: "",
//       };

//       const response =
//         await axios.post(

//           `${API_URL}/api/employees/experience`,

//           payload,

//           {
//             headers: {
//               Authorization:
//                 `Bearer ${localStorage.getItem("token")}`,
//             },
//           }
//         );

//       console.log(
//         "EXPERIENCE SAVED:",
//         response.data
//       );
//     }

//   } catch (error) {

//     console.log(
//       "EXPERIENCE ERROR:",
//       error.response?.data ||
//       error.message
//     );

//     throw error;
//   }
// };




// =====================================================
// DOCUMENT UPLOAD FUNCTION
// =====================================================

// const uploadDocuments = async (empId) => {

//   try {

//     const formDataObj = new FormData();

//     // =====================================================
//     // BASIC DATA
//     // =====================================================

//     formDataObj.append(
//       "emp_id",
//       empId
//     );

//     formDataObj.append(
//       "emp_code",
//       formData.emp_code || ""
//     );

//     // =====================================================
//     // KYC DOCUMENTS
//     // =====================================================

//     formData.kycDocuments?.forEach(
//       (doc, index) => {

//         // FILE
//         if (doc.file instanceof File) {

//           formDataObj.append(
//             "kycDocuments",
//             doc.file
//           );
//         }

//         // DOCUMENT TYPE
//         formDataObj.append(
//           `kyc_documentType_${index}`,
//           doc.documentType || ""
//         );

//         // DOCUMENT NAME
//         formDataObj.append(
//           `kyc_documentName_${index}`,
//           doc.documentName || ""
//         );

//         // STATUS
//         formDataObj.append(
//           `kyc_status_${index}`,
//           doc.status || ""
//         );

//         // REMARK
//         formDataObj.append(
//           `kyc_remark_${index}`,
//           doc.remark || ""
//         );
//       }
//     );

//     // =====================================================
//     // CANCELLED CHEQUE
//     // =====================================================

//     if (
//       formData.bankDetails
//         ?.cancelledChequeFile
//     ) {

//       formDataObj.append(
//         "cancelledChequeFile",
//         formData.bankDetails.cancelledChequeFile
//       );
//     }

//     // =====================================================
//     // DEBUG
//     // =====================================================

//     for (let pair of formDataObj.entries()) {

//       console.log(
//         pair[0],
//         pair[1]
//       );
//     }

//     // =====================================================
//     // API CALL
//     // =====================================================

//     const response = await axios.post(

//       `${API_URL}/api/employees/upload-documents`,

//       formDataObj,

//       {
//         headers: {
//           Authorization:
//             `Bearer ${localStorage.getItem("token")}`,
//         },
//       }
//     );

//     console.log(
//       "DOCUMENTS UPLOADED:",
//       response.data
//     );

//   } catch (error) {

//     console.log(
//       "UPLOAD ERROR:",
//       error.response?.data || error.message
//     );

//     throw error;
//   }
// };

// // =====================================================
// // FRONTEND API CALL
// // =====================================================

// const saveNominee = async () => {

//   try {

//     const payload = {

//       emp_id: employeeId,

//       f_initial:
//         nomineeData.f_initial,

//       f_relative_name:
//         nomineeData.f_relative_name,

//       f_gender:
//         nomineeData.f_gender,

//       f_relation:
//         nomineeData.f_relation,

//       f_dob:
//         nomineeData.f_dob,

//       f_age:
//         nomineeData.f_age,

//       f_minor:
//         nomineeData.f_minor,

//       f_guardian:
//         nomineeData.f_guardian,

//       f_address:
//         nomineeData.f_address,

//       f_contact:
//         nomineeData.f_contact,

//       f_email:
//         nomineeData.f_email,

//       f_sharepf:
//         nomineeData.f_sharepf,

//       f_shareesic:
//         nomineeData.f_shareesic,

//       source:
//         nomineeData.source,
//     };

//     const response = await axios.post(

//       `${API_URL}/api/employees/nominee`,

//       payload,

//       {
//         headers: {
//           Authorization:
//             `Bearer ${localStorage.getItem("token")}`,
//         },
//       }
//     );

//     console.log(response.data);

//     alert(
//       "Nominee Saved Successfully"
//     );

//   } catch (error) {

//     console.log(error);

//     alert(
//       error.response?.data?.message ||
//       "Error saving nominee"
//     );
//   }
// };



  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-section small-form">
            <div className="mb-3">
              <p className="form-subtitle">Employee Details</p>
              <Row>
                {/* EMP CODE */}
<Col xs={12} sm={6} md={3} className="mb-2">
  <Form.Group controlId="emp_code">
    <Form.Label className="small">
      Employee Code *
    </Form.Label>

    <Form.Control
      type="text"
      name="emp_code"
      value={formData.emp_code ||formData.employee_code || ""}
      onChange={handleChange}
      placeholder="Employee Code"
      isInvalid={!!validationErrors.emp_code}
    />

    <Form.Control.Feedback type="invalid">
      {validationErrors.emp_code}
    </Form.Control.Feedback>
  </Form.Group>
</Col>

{/* REGISTRATION DATE */}
<Col xs={12} sm={6} md={3} className="mb-2">
  <Form.Group controlId="reg_date">
    <Form.Label className="small">
      Registration Date
    </Form.Label>

    <Form.Control
      type="date"
      name="reg_date"
      value={formData.reg_date || ""}
      onChange={handleChange}
      isInvalid={!!validationErrors.reg_date}
    />

    <Form.Control.Feedback type="invalid">
      {validationErrors.reg_date}
    </Form.Control.Feedback>
  </Form.Group>
</Col>
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="initial">
                    <Form.Label className="small" >Initial</Form.Label>
                    <Form.Select
                      name="initial"
                      value={formData.initial}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="first_name">
                   <Form.Label className="small" >First Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      isInvalid={!!validationErrors.first_name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.first_name}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="middle_name">
                   <Form.Label className="small" >Middle Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="middle_name"
                      value={formData.middle_name}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="last_name">
                   <Form.Label className="small" >Last Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      isInvalid={!!validationErrors.last_name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.last_name}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="gender">
                   <Form.Label className="small" >gender</Form.Label>
                    <Form.Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="dob">
                
 <Form.Label className="small" >Date of Birth</Form.Label>
  <Form.Control
    type="date"
    name="dob"
    value={formData.dob}
    onChange={(e) => {
      const selectedDate = new Date(e.target.value);
      const today = new Date();

      let age = today.getFullYear() - selectedDate.getFullYear();
      const monthDiff = today.getMonth() - selectedDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < selectedDate.getDate())
      ) {
        age--;
      }

      if (age < 18) {
        alert("Employee must be at least 18 years old.");
        return;
      }

      setFormData({
        ...formData,
        dob: e.target.value,
      });
    }}
  />
</Form.Group>
                </Col>
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="date_of_joining">
                   <Form.Label className="small" >Date of Joining</Form.Label>
                    <Form.Control
                      type="date"
                      name="date_of_joining"
                      value={formData.date_of_joining}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="email_id">
                   <Form.Label className="small" >Email Id *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email_id"
                      value={formData.email_id}
                      onChange={handleChange}
                      isInvalid={!!validationErrors.email_id}
                    />
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.email_id}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="department">
                   <Form.Label className="small" >Father</Form.Label>
      <Form.Control
  type="text"
  name="father_name"
  value={formData.father_name}
  onChange={handleChange}
/>
                  </Form.Group>
                </Col>
               <Col xs={12} sm={6} md={3} className="mb-2">
<Form.Group controlId="designation">
  
  <Form.Label className="small">
    Designation/Rank *
  </Form.Label>

  <Select
    options={(employeeTypes || []).map((emp) => ({
      value:  emp.emp_type,
      label:  emp.emp_type,
    }))}

    value={
      (employeeTypes || [])
        .map((emp) => ({
          value:  emp.emp_type,
          label:  emp.emp_type,
        }))
        .find((opt) => opt.value === formData.rank) || null
    }

    onChange={(selected) =>
      setFormData((prev) => ({
        ...prev,
        rank: selected ? selected.value : "",
      }))
    }

    isSearchable
  />

  {validationErrors.designation && (
    <div className="invalid-feedback d-block">
      {validationErrors.designation}
    </div>
  )}
</Form.Group>
                </Col>
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="department">
                   <Form.Label className="small" >Department</Form.Label>
                    <Form.Control
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
<Col xs={12} sm={6} md={3} className="mb-2">
  <Form.Group>
    <Form.Label className="small">Client/Company</Form.Label>
<Select
  options={companies.map((c) => ({
    value: String(c.id || c._id),
    label: c.company_name || c.companyName,
  }))}

  value={
    formData.client_id
      ? {
          value: formData.client_id,
          label: formData.client_name,
        }
      : null
  }

  onChange={handleClientChange}
/>
  </Form.Group>
</Col>

<Col xs={12} sm={6} md={3} className="mb-2">

 <Form.Group>
  <Form.Label className="small">
    Location / Site
  </Form.Label>

  <Select
    isDisabled={!formData.client_id}

    options={(availableSite || []).map((s) => ({
      value: String(s.site_id),
      label: s.siteName,
    }))}

    value={
      (availableSite || [])
        .map((s) => ({
          value: String(s.site_id),
          label: s.siteName,
        }))
        .find(
          (opt) => opt.value === String(formData.site_id)
        ) || null
    }

    onChange={(selected) =>
      setFormData((prev) => ({
        ...prev,
        site_id: selected ? selected.value : "",
      }))
    }

    isSearchable
  />
</Form.Group>

</Col>
                {/*<Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="reportingManager">
                   <Form.Label className="small" >Reporting Manager</Form.Label>

                    <Select
                      options={userOptions}
                      value={userOptions.find(
                        (opt) => opt.value === formData.reportingManager,
                      )}
                      onChange={(selected) =>
                        setFormData({
                          ...formData,
                          reportingManager: selected?.value || "",
                        })
                      }
                      isSearchable
                      placeholder="Select Manager"
                    />
                  </Form.Group>
                </Col> */}
                {/*<Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="reportingUser">
                   <Form.Label className="small" >Reporting User</Form.Label>

                    <Select
                      options={userOptions}
                      value={userOptions.find(
                        (opt) => opt.value === formData.reportingUser,
                      )}
                      onChange={(selected) =>
                        setFormData({
                          ...formData,
                          reportingUser: selected?.value || "",
                        })
                      }
                      isSearchable
                      placeholder="Select User"
                    />
                  </Form.Group>
                </Col> */}
               {/* <Col xs={12} sm={6} md={3} className="mb-2">
                <Form.Group controlId="gangName">
  <Form.Label className="small">Gang Name</Form.Label>

  <Select
    options={gangOptions}
    value={gangOptions.find(
      (opt) => String(opt.value) === String(formData.gang_name)
    )}
    onChange={(selected) =>
      setFormData((prev) => ({
        ...prev,

        // SAFE STRING VALUE
        gang_name: selected?.label
          ? String(selected.label)
          : "",
      }))
    }
    isSearchable
  />
</Form.Group>
                </Col> */}
             
               {/* <Col xs={12} sm={6} md={3} className="mb-2"> */}
                  {/* <Form.Group controlId="verification_status">
                   <Form.Label className="small" >Verification Status</Form.Label>
                    <Select
                      options={[
                        { value: "Pending", label: "Pending" },
                        { value: "Verified", label: "Verified" },
                      ]}
                      value={{
                        value: formData.verification_status || "Pending",
                        label: formData.verification_status || "Pending",
                      }}
                      onChange={(selected) =>
                        setFormData((prev) => ({
                          ...prev,
                          verification_status: selected?.value || "Pending",
                        }))
                      }
                      isSearchable
                    />
                  </Form.Group> */}
                {/* </Col> */}
         
   <Col xs={12} sm={6} md={3} className="mb-2">
  <Form.Group controlId="sal_from_date">
    <Form.Label className="small">
      Salary Generation From Date
    </Form.Label>
    <Form.Control
      type="number"
      name="sal_from_date"
      value={formData.sal_from_date}
      onChange={handleChange}
      min="1"
      max="31"
      placeholder="Enter Day (1-31)"
    />
  </Form.Group>
</Col>

<Col xs={12} sm={6} md={3} className="mb-2">
  <Form.Group controlId="sal_to_date">
    <Form.Label className="small">
      Salary Generation To Date
    </Form.Label>
    <Form.Control
      type="number"
      name="sal_to_date"
      value={formData.sal_to_date}
      onChange={handleChange}
      min="1"
      max="31"
      placeholder="Enter Day (1-31)"
    />
  </Form.Group>
</Col>
              
              </Row>
            </div>
            <div className="mb-3">
              <p className="form-subtitle">Contact Details</p>
              <Row className="gy-4 gx-4 align-items-stretch">
                {/* ------- Present Address ------- */}
                <Col md={6} className="d-flex">
                  <Card className="flex-fill bg-info-subtle border border-info-subtle shadow-sm">
                    <Card.Body>
                      <Card.Title className="mb-3">Current Address</Card.Title>

                      <Row className="g-3">
                        <Col md={12}>
                          <Form.Group controlId="presentAddress.address">
                           <Form.Label className="small" >Address *</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              value={formData.presentAddress.address}
                              onChange={(e) =>
                                handleObjectChange(
                                  e,
                                  "presentAddress",
                                  "address",
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
  <Form.Group
    controlId="presentAddress.pincode"
    className="position-relative"
  >
    <Form.Label className="small">
      Pincode *
    </Form.Label>

    <Form.Control
      type="text"
      placeholder="Search Pincode"
      value={formData.presentAddress.pincode || ""}
      onChange={handlePincodeSearch}
      autoComplete="off"
      isInvalid={
        !!validationErrors["presentAddress.pincode"]
      }
    />

    <Form.Control.Feedback type="invalid">
      {validationErrors["presentAddress.pincode"]}
    </Form.Control.Feedback>

    {/* DROPDOWN */}
    {showPincodeList &&
      pincodeSuggestions.length > 0 && (
        <div
          className="border rounded bg-white shadow-sm position-absolute w-100"
          style={{
            zIndex: 9999,
            maxHeight: "250px",
            overflowY: "auto",
          }}
        >
          {pincodeSuggestions.map((p, index) => (
            <div
              key={index}
              className="p-2 border-bottom cursor-pointer"
              style={{ cursor: "pointer" }}
              onClick={() =>
                handleSelectPincode(p)
              }
            >
              <div>
                <strong>{p.pincode}</strong>
              </div>

              <small className="text-muted">
                {p.city || p.city_name},{" "}
                {p.state || p.state_name},{" "}
                {p.country || p.country_name}
              </small>
            </div>
          ))}
        </div>
      )}
  </Form.Group>
</Col>

                        <Col md={6}>
                          <Form.Group controlId="presentAddress.city">
                           <Form.Label className="small" >City *</Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.presentAddress.city}
                              onChange={(e) =>
                                handleObjectChange(e, "presentAddress", "city")
                              }
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group controlId="presentAddress.state">
                           <Form.Label className="small" >State *</Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.presentAddress.state}
                              onChange={(e) =>
                                handleObjectChange(e, "presentAddress", "state")
                              }
                            />
                          </Form.Group>
                        </Col>


                        <Col md={6}>
                          <Form.Group controlId="presentAddress.country">
                           <Form.Label className="small" >Country *</Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.presentAddress.country}
                              onChange={(e) =>
                                handleObjectChange(
                                  e,
                                  "presentAddress",
                                  "country",
                                )
                              }
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group controlId="presentAddress.phone1">
                           <Form.Label className="small" >Phone 1 *</Form.Label>
                          <Form.Control
  type="text"
  value={formData.presentAddress.phone1}
  onChange={(e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length <= 10) {
      handleObjectChange(
        { ...e, target: { ...e.target, value } },
        "presentAddress",
        "phone1"
      );
    }
  }}
  isInvalid={!!validationErrors["presentAddress.phone1"]}
/>
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group controlId="presentAddress.phone2">
                           <Form.Label className="small" >Phone 2</Form.Label>
                           <Form.Control
  type="text"
  value={formData.presentAddress.phone2}
  onChange={(e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length <= 10) {
      handleObjectChange(
        { ...e, target: { ...e.target, value } },
        "presentAddress",
        "phone2"
      );
    }
  }}
  isInvalid={!!validationErrors["presentAddress.phone2"]}
/>
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>

                {/* ------- Permanent Address ------- */}
                <Col md={6} className="d-flex">
                  <Card className="flex-fill bg-info-subtle border border-info-subtle shadow-sm">
                    <Form.Check
                      type="checkbox"
                      label="Permanent Address Same As Present Address"
                      checked={formData.sameAsPresentAddress}
                      onChange={(e) => {
                        const checked = e.target.checked;

                        setFormData((prev) => ({
                          ...prev,
                          sameAsPresentAddress: checked,
                          permanentAddress: checked
                            ? { ...prev.presentAddress }
                            : {
                                address: "",
                                city: "",
                                state: "",
                                pincode: "",
                                country: "",
                                phone1: "",
                                phone2: "",
                              },
                        }));
                      }}
                    />
                    <Card.Body>
                      <Card.Title className="mb-3">
                        Permanent Address
                      </Card.Title>

                      <Row className="g-3">
                        <Col md={12}>
                          <Form.Group controlId="permanentAddress.address">
                           <Form.Label className="small" >Address</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              value={formData.permanentAddress.address}
                              onChange={(e) =>
                                handleObjectChange(
                                  e,
                                  "permanentAddress",
                                  "address",
                                )
                              }
                              disabled={formData.sameAsPresentAddress}
                            />
                          </Form.Group>
                        </Col>
                       <Col md={6}>
  <Form.Group
    controlId="permanentAddress.pincode"
    className="position-relative"
  >
    <Form.Label className="small">
      Pincode
    </Form.Label>

    <Form.Control
      type="text"
      placeholder="Search Pincode"
      value={formData.permanentAddress.pincode || ""}
      onChange={handlePermanentPincodeSearch}
      autoComplete="off"
      disabled={formData.sameAsPresentAddress}
      onClick={(e) => e.stopPropagation()}
      isInvalid={
        !!validationErrors["permanentAddress.pincode"]
      }
    />

    <Form.Control.Feedback type="invalid">
      {validationErrors["permanentAddress.pincode"]}
    </Form.Control.Feedback>

    {/* DROPDOWN */}
    {showPermanentPincodeList &&
      permanentPincodeSuggestions.length > 0 && (
        <div
          className="border rounded bg-white shadow-sm position-absolute w-100"
          style={{
            zIndex: 9999,
            maxHeight: "250px",
            overflowY: "auto",
          }}
        >
          {permanentPincodeSuggestions.map((p, index) => (
            <div
              key={index}
              className="p-2 border-bottom"
              style={{ cursor: "pointer" }}
              onClick={() =>
                handleSelectPermanentPincode(p)
              }
            >
              <div>
                <strong>{p.pincode}</strong>
              </div>

              <small className="text-muted">
                {p.city || p.city_name},{" "}
                {p.state || p.state_name},{" "}
                {p.country || p.country_name}
              </small>
            </div>
          ))}
        </div>
      )}
  </Form.Group>
</Col>

                        <Col md={6}>
                          <Form.Group controlId="permanentAddress.city">
                           <Form.Label className="small" >City</Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.permanentAddress.city}
                              onChange={(e) =>
                                handleObjectChange(
                                  e,
                                  "permanentAddress",
                                  "city",
                                )
                              }
                              disabled={formData.sameAsPresentAddress}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group controlId="permanentAddress.state">
                           <Form.Label className="small" >State</Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.permanentAddress.state}
                              onChange={(e) =>
                                handleObjectChange(
                                  e,
                                  "permanentAddress",
                                  "state",
                                )
                              }
                              disabled={formData.sameAsPresentAddress}
                            />
                          </Form.Group>
                        </Col>


                        <Col md={6}>
                          <Form.Group controlId="permanentAddress.country">
                           <Form.Label className="small" >Country</Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.permanentAddress.country}
                              onChange={(e) =>
                                handleObjectChange(
                                  e,
                                  "permanentAddress",
                                  "country",
                                )
                              }
                              disabled={formData.sameAsPresentAddress}
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group controlId="permanentAddress.phone1">
                           <Form.Label className="small" >Phone 1</Form.Label>
                      <Form.Control
  type="text"
  value={formData.permanentAddress.phone1}
  onChange={(e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length <= 10) {
      handleObjectChange(
        { ...e, target: { ...e.target, value } },
        "permanentAddress",
        "phone1"
      );
    }
  }}
  disabled={formData.sameAsPresentAddress}
  isInvalid={!!validationErrors["permanentAddress._phone1"]}
/>
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group controlId="permanentAddress.phone2">
                           <Form.Label className="small" >Phone 2</Form.Label>
                   <Form.Control
  type="text"
  value={formData.permanentAddress.phone2}
  onChange={(e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length <= 10) {
      handleObjectChange(
        { ...e, target: { ...e.target, value } },
        "permanentAddress",
        "phone2"
      );
    }
  }}
  disabled={formData.sameAsPresentAddress}
  isInvalid={!!validationErrors["permanentAddress._phone2"]}
/>
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
         {/* =========================================
    EMERGENCY CONTACT DETAILS
========================================= */}
{/* ------- Native Address ------- */}
<Col md={12} className="mt-4">
  <Card className="bg-info-subtle border border-info-subtle shadow-sm">
    
    <Card.Body>
      <Card.Title className="mb-3">
         Native Address (Village  Address)
      </Card.Title>

      <Row className="g-3">

        {/* ADDRESS */}
        <Col xs={12}>
          <Form.Group controlId="native_address">
            <Form.Label className="small">
              Address
            </Form.Label>

            <Form.Control
              as="textarea"
              rows={2}
              value={formData.native_address || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  native_address: e.target.value,
                }))
              }
            />
          </Form.Group>
        </Col>

        {/* PINCODE */}
        <Col xs={12} sm={6} md={3}>
          <Form.Group
            controlId="native_pincode"
            className="position-relative"
          >
            <Form.Label className="small">
              Pincode
            </Form.Label>

            <Form.Control
              type="text"
              placeholder="Search Pincode"
              value={formData.native_pincode || ""}
              autoComplete="off"
              onClick={(e) => e.stopPropagation()}
              onChange={handleNativePincodeSearch}
            />

            {/* DROPDOWN */}
            {showNativePincodeList &&
              nativePincodeSuggestions.length > 0 && (
                <div
                  className="border rounded bg-white shadow-sm position-absolute w-100"
                  style={{
                    zIndex: 9999,
                    maxHeight: "250px",
                    overflowY: "auto",
                  }}
                >
                  {nativePincodeSuggestions.map(
                    (p, index) => (
                      <div
                        key={index}
                        className="p-2 border-bottom"
                        style={{
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          handleSelectNativePincode(
                            p
                          )
                        }
                      >
                        <div>
                          <strong>
                            {p.pincode}
                          </strong>
                        </div>

                        <small className="text-muted">
                          {p.city ||
                            p.city_name}
                          ,{" "}
                          {p.state ||
                            p.state_name}
                          ,{" "}
                          {p.country ||
                            p.country_name}
                        </small>
                      </div>
                    )
                  )}
                </div>
              )}
          </Form.Group>
        </Col>

        {/* CITY */}
        <Col xs={12} sm={6} md={3}>
          <Form.Group controlId="native_city">
            <Form.Label className="small">
              City
            </Form.Label>

            <Form.Control
              type="text"
              value={formData.native_city || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  native_city:
                    e.target.value,
                }))
              }
            />
          </Form.Group>
        </Col>

        {/* STATE */}
        <Col xs={12} sm={6} md={3}>
          <Form.Group controlId="native_state">
            <Form.Label className="small">
              State
            </Form.Label>

            <Form.Control
              type="text"
              value={formData.native_state || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  native_state:
                    e.target.value,
                }))
              }
            />
          </Form.Group>
        </Col>

        {/* COUNTRY */}
        <Col xs={12} sm={6} md={3}>
          <Form.Group controlId="native_country">
            <Form.Label className="small">
              Country
            </Form.Label>

            <Form.Control
              type="text"
              value={formData.native_country || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  native_country:
                    e.target.value,
                }))
              }
            />
          </Form.Group>
        </Col>

      </Row>
    </Card.Body>
  </Card>
</Col>
<div className="mb-3">
  <div className="d-flex justify-content-between align-items-center mb-3">
    <p className="form-subtitle mb-0">
      Emergency Contact Details
    </p>

    <Button
      variant="warning"
      type="button"
      onClick={() =>
        addArrayItem("emergencyContacts", {
          contact_person: "",
          mobile: "",
          relation: "",
          email: "",
        })
      }
    >
      <FaPlus />
    </Button>
  </div>

  {Array.isArray(formData.emergencyContacts) &&
    formData.emergencyContacts.map((contact, index) => (
      <Card
        key={index}
        className="mb-3 border-0 shadow-sm"
      >
        <Card.Body>
          <Row>
            {/* CONTACT PERSON */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label className="small">
                  Contact Person *
                </Form.Label>

                <Form.Control
                  type="text"
                  value={contact.contact_person || ""}
                  onChange={(e) =>
                    handleArrayChange(
                      e,
                      index,
                      "emergencyContacts",
                      "contact_person"
                    )
                  }
                />
              </Form.Group>
            </Col>

            {/* MOBILE */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label className="small">
                  Mobile *
                </Form.Label>

                <Form.Control
                  type="text"
                  value={contact.mobile || ""}
                  onChange={(e) => {
                    let value = e.target.value.replace(
                      /\D/g,
                      ""
                    );

                    if (value.length <= 10) {
                      handleArrayChange(
                        {
                          ...e,
                          target: {
                            ...e.target,
                            value,
                          },
                        },
                        index,
                        "emergencyContacts",
                        "mobile"
                      );
                    }
                  }}
                  isInvalid={
                    !!validationErrors[
                      `emergencyContacts[${index}].mobile`
                    ]
                  }
                />

                <Form.Control.Feedback type="invalid">
                  {
                    validationErrors[
                      `emergencyContacts[${index}].mobile`
                    ]
                  }
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* RELATION */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label className="small">
                  Relation
                </Form.Label>

                <Form.Control
                  type="text"
                  value={contact.relation || ""}
                  onChange={(e) =>
                    handleArrayChange(
                      e,
                      index,
                      "emergencyContacts",
                      "relation"
                    )
                  }
                />
              </Form.Group>
            </Col>

            {/* EMAIL */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label className="small">
                  Email
                </Form.Label>

                <Form.Control
                  type="email"
                  value={contact.email || ""}
                  onChange={(e) =>
                    handleArrayChange(
                      e,
                      index,
                      "emergencyContacts",
                      "email"
                    )
                  }
                  isInvalid={
                    !!validationErrors[
                      `emergencyContacts[${index}].email`
                    ]
                  }
                />

                <Form.Control.Feedback type="invalid">
                  {
                    validationErrors[
                      `emergencyContacts[${index}].email`
                    ]
                  }
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* REMOVE BUTTON */}
          {formData.emergencyContacts.length > 1 && (
            <Button
              variant="danger"
              size="sm"
              type="button"
              onClick={() =>
                removeArrayItem(
                  "emergencyContacts",
                  index
                )
              }
            >
              <FaMinus /> Remove
            </Button>
          )}
        </Card.Body>
      </Card>
    ))}
</div>
            <div className="form-actions d-flex justify-content-end align-items-center">
              <Button
                variant="secondary"
                type="button"
                className="me-2"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="button"
                onClick={handleNext}
                className="me-2"
              >
                Next
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-section">
            <div className="mb-3">
              <p className="form-subtitle">Personal Details</p>
              <Row>
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="maritalStatus">
                   <Form.Label className="small" >Marital Status</Form.Label>
                    <Form.Select
                      name="marital_status"
                      value={formData.marital_status}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

             {formData.marital_status === "Married" && (
  <Col xs={12} sm={6} md={3} className="mb-2">
    <Form.Group controlId="marriageDate">
      <Form.Label className="small">
        Marriage Date
      </Form.Label>

      <Form.Control
        type="date"
        name="mrg_date"
        value={formData.mrg_date || ""}
        onChange={handleChange}
      />
    </Form.Group>
  </Col>
)}
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="cast">
                   <Form.Label className="small" >Caste</Form.Label>
                    <Form.Control
                      type="text"
                      name="cast"
                      value={formData.cast}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="category">
                   <Form.Label className="small" >Category</Form.Label>
                    <Form.Control
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="nativePlace">
                   <Form.Label className="small" >Native Place</Form.Label>
                  <Form.Control
  type="text"
  name="native_place"
  value={formData.native_place}
  onChange={handleChange}
/>
                  </Form.Group>
                </Col>
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="bloodGroup">
                   <Form.Label className="small" >Blood Group</Form.Label>
                    <Form.Select
                      name="blood_group"
                      value={formData.blood_group}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                {formData.languageKnown.map((lang, index) => (
                  <Col
                    className="mb-3"
                    xs={12}
                    sm={6}
                    md={2}
                    key={`lang-${index}`}
                  >
                    <Form.Group controlId={`languageKnown${index + 1}`}>
                     <Form.Label className="small" >Language Known ({index + 1})</Form.Label>
                      <Form.Control
                        type="text"
                        value={lang}
                        name={`languageKnown${index + 1}`}
                        onChange={(e) =>
                          handleStringArrayChange(e, index, "languageKnown")
                        }
                      />
                    </Form.Group>
                  </Col>
                ))}
                {formData.hobbies.map((hobby, index) => (
                  <Col
                    className="mb-3"
                    xs={12}
                    sm={6}
                    md={2}
                    key={`hobby-${index}`}
                  >
                    <Form.Group controlId={`hobby${index + 1}`}>
                     <Form.Label className="small" >Hobby ({index + 1})</Form.Label>
                      <Form.Control
                        type="text"
                        value={hobby}
                        name={`hobby${index + 1}`}
                        onChange={(e) =>
                          handleStringArrayChange(e, index, "hobbies")
                        }
                      />
                    </Form.Group>
                  </Col>
                ))}
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="driving_license">
                   <Form.Label className="small" >Driving License No</Form.Label>
                <Form.Control
  type="text"
  name="driving_license"
  value={formData.driving_license}
  onChange={handleChange}
/>
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.drivingLicenseNo}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="panCardNo">
                   <Form.Label className="small" >Pan Card No</Form.Label>
<Form.Control
  type="text"
  name="pancard_no"
  value={formData.pancard_no}
  onChange={(e) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, ""); // only letters + numbers

    setFormData((prev) => ({
      ...prev,
      pancard_no: value,
    }));
  }}
/>
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.panCardNo}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="aadhar_no">
                   <Form.Label className="small" >Aadhar Card No</Form.Label>
     <Form.Control
  type="text"
  name="aadhar_no"
  value={formData.aadhar_no}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, ""); // only digits
    setFormData((prev) => ({
      ...prev,
      aadhar_no: value,
    }));
  }}
/>
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.aadharCardNo}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="passportNo">
                   <Form.Label className="small" >Passport No</Form.Label>
      <Form.Control
  type="text"
  name="passport_no"
  value={formData.passport_no}
  onChange={(e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, ""); // only alphanumeric
    setFormData((prev) => ({
      ...prev,
      passport_no: value.toUpperCase(), // optional (clean format)
    }));
  }}
/>           </Form.Group>
                </Col>
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="passportValidDate">
                   <Form.Label className="small" >Passport Valid Date</Form.Label>
                 <Form.Control
  type="date"
  name="passport_valid_date"
  value={formData.passport_valid_date}
  onChange={handleChange}
/>
                  </Form.Group>
                </Col>
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="pfNo">
                   <Form.Label className="small" >P.F. No</Form.Label>
   <Form.Control
  type="text"
  name="pf_no"
  value={formData.pf_no}
  onChange={(e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9/]/g, "");

    setFormData((prev) => ({
      ...prev,
      pf_no: value.toUpperCase(),
    }));
  }}
/>
                  </Form.Group>
                </Col>
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="uanNo">
                   <Form.Label className="small" >UAN No</Form.Label>
      <Form.Control
  type="text"
  name="uan_no"
  value={formData.uan_no}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, ""); // only digits

    if (value.length <= 12) {
      setFormData((prev) => ({
        ...prev,
        uan_no: value,
      }));
    }
  }}
/>
                  </Form.Group>
                </Col>
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="uanNo">
                   <Form.Label className="small" >UAN Date</Form.Label>
                <Form.Control
  type="date"
  name="uan_date"
  value={formData.uan_date}
  onChange={handleChange}
/>
                  </Form.Group>
                </Col>
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="esisNo">
                   <Form.Label className="small" >Esis No</Form.Label>
       <Form.Control
  type="text"
  name="esis_no"
  value={formData.esis_no}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, ""); // only digits

    if (value.length <= 17) {
      setFormData((prev) => ({
        ...prev,
        esis_no: value,
      }));
    }
  }}
/>
                  </Form.Group>
                </Col>
               <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="esisNo">
                   <Form.Label className="small" >Esis Date</Form.Label>
                 <Form.Control
  type="date"
  name="esis_date"
  value={formData.esis_date}
  onChange={handleChange}
/>
                  </Form.Group>
                </Col>
              </Row>
            </div>
           {/* ========================= KYC DOCUMENTS ========================= */}

<div className="mb-3">
  <div className="py-3 d-flex justify-content-between align-items-center">
    <p className="mb-0 form-subtitle">
      KYC Documents Detail
    </p>

    <Button
      type="button"
      className="d-flex align-items-center gap-2 add-earning-row"
      onClick={() =>
        addArrayItem("kycDocuments", {
          documentType: "",
          documentName: "",
          file: null,
          status: "",
          remark: "",
          imagePath: "",
        })
      }
    >
      <FaPlus />
      <span>Add New Row</span>
    </Button>
  </div>

  <Table hover bordered responsive>
    <thead className="table-secondary">
      <tr>
        <th>Document Type</th>
        <th>Document Name</th>
        <th>Choose File</th>
        <th>Preview</th>
        <th>Status</th>
        <th>Remark / Description</th>
        <th>Actions</th>
      </tr>
    </thead>

    <tbody>
      {formData.kycDocuments?.map((doc, index) => (
        <tr key={index}>

          {/* ================= DOCUMENT TYPE ================= */}
          <td>
            <Form.Select
              value={doc.documentType || ""}
              onChange={(e) =>
                handleArrayChange(
                  e,
                  index,
                  "kycDocuments",
                  "documentType"
                )
              }
            >
              <option value="">Select</option>

              <option value="Aadhar Card">
                Aadhar Card
              </option>

              <option value="Pan Card">
                Pan Card
              </option>

              <option value="UAN Card">
                UAN Card
              </option>

              <option value="PF">
                PF
              </option>

              <option value="ESIS">
                ESIS
              </option>

              <option value="Passport">
                Passport
              </option>

              <option value="Certificate">
                Certificate
              </option>

              <option value="Legal Document">
                Legal Document
              </option>

              <option value="Other">
                Other Certificate
              </option>
            </Form.Select>
          </td>

          {/* ================= DOCUMENT NAME ================= */}
          <td>
            <Form.Control
              type="text"
              placeholder="Enter Document Name"
              value={doc.documentName || ""}
              onChange={(e) =>
                handleArrayChange(
                  e,
                  index,
                  "kycDocuments",
                  "documentName"
                )
              }
            />
          </td>

          {/* ================= FILE ================= */}
          <td>
            <Form.Control
              type="file"
              name="kycDocuments"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={(e) =>
                handleArrayChange(
                  e,
                  index,
                  "kycDocuments",
                  "file"
                )
              }
            />

            {/* Selected File Name */}
            {doc.file && (
              <small className="text-success d-block mt-1">
                {doc.file.name}
              </small>
            )}
          </td>

          {/* ================= PREVIEW ================= */}
          <td>
            {/* Existing Uploaded File */}
            {doc.imagePath && (
              <div className="mb-2">

                {/* IMAGE PREVIEW */}
                {/\.(jpg|jpeg|png|webp)$/i.test(doc.imagePath) ? (
                  <img
                    src={`${API_URL}/${doc.imagePath}`}
                    alt={`Preview ${index}`}
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                    }}
                  />
                ) : (
                  <a
                    href={`${API_URL}/${doc.imagePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-primary"
                  >
                    View PDF
                  </a>
                )}
              </div>
            )}

            {/* NEW FILE PREVIEW */}
            {doc.file &&
              doc.file.type.startsWith("image/") && (
                <img
                  src={URL.createObjectURL(doc.file)}
                  alt="New Preview"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                  }}
                />
              )}

            {/* PDF PREVIEW */}
            {doc.file &&
              doc.file.type === "application/pdf" && (
                <small className="text-primary">
                  PDF Selected
                </small>
              )}
          </td>

          {/* ================= STATUS ================= */}
          <td>
            <Form.Select
              value={doc.status || ""}
              onChange={(e) =>
                handleArrayChange(
                  e,
                  index,
                  "kycDocuments",
                  "status"
                )
              }
            >
              <option value="">Select</option>

              <option value="Verified">
                Verified
              </option>

              <option value="Not Verified">
                Not Verified
              </option>

              <option value="Reject">
                Reject
              </option>
            </Form.Select>
          </td>

          {/* ================= REMARK ================= */}
          <td>
            <Form.Control
              type="text"
              placeholder="Enter Remark"
              value={doc.remark || ""}
              onChange={(e) =>
                handleArrayChange(
                  e,
                  index,
                  "kycDocuments",
                  "remark"
                )
              }
            />
          </td>

          {/* ================= ACTION ================= */}
          <td>
            <div className="table-actions">
              {formData.kycDocuments.length > 1 && (
                <button
                  type="button"
                  className="icon-btn delete"
                  onClick={() =>
                    removeArrayItem(
                      "kycDocuments",
                      index
                    )
                  }
                >
                  <FaTrashAlt />
                </button>
              )}
            </div>
          </td>

        </tr>
      ))}
    </tbody>
  </Table>
</div>
            <div className="mb-3">
              <div className="py-3 d-flex justify-content-between align-items-center">
                <p className="mb-0 form-subtitle">Family & Nominee Details</p>
                <Button
                  type="button"
                  className="d-flex align-items-center gap-2 add-earning-row"
                  onClick={() =>
                    addArrayItem("familyNomineeDetails", {
                      initial: "",
                      relativeName: "",
                      gender: "",
                      contact_relation: "",
                      dob: "",
                      age: "",
                      isMinor: false,
                      guardianName: "",
                      address: "",
                      contactNo: "",
                      email_id: "",
                      sharePF: "",
                      shareESIC: "",
                    })
                  }
                >
                  <FaPlus />
                  <span>Add New Row</span>
                </Button>
              </div>
              <Table hover bordered responsive>
                <thead className="table-secondary">
                  <tr>
                    <th style={{ minWidth: "100px" }}>Initial</th>
                    <th>Relative Name</th>
                    <th>gender</th>
                    <th>Relation</th>
                    <th>DOB</th>
                    <th>Age</th>
                    <th>Minor (Under 18)</th>
                    <th>Guardian Name (If Minor "Yes")</th>
                    <th>Address</th>
                    <th>Contact No</th>
                    <th>Email ID</th>
                    <th>Share PF %</th>
                    <th>Share ESIC %</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.familyNomineeDetails.map((nominee, index) => (
                    <tr key={index}>
                      <td>
                        <Form.Select
                          name="initial"
                          value={nominee.initial}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "familyNomineeDetails",
                              "initial",
                            )
                          }
                        >
                          <option value="">Select</option>
                          <option value="Mr.">Mr.</option>
                          <option value="Ms.">Ms.</option>
                          <option value="Mrs.">Mrs.</option>
                        </Form.Select>
                        {/* <Form.Control
                          style={{ width: "auto" }}
                          type="text"
                          value={nominee.initial}
                          
                        /> */}
                      </td>
                      <td>
                        <Form.Control
                          style={{ width: "auto" }}
                          type="text"
                          value={nominee.relativeName}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "familyNomineeDetails",
                              "relativeName",
                            )
                          }
                        />
                      </td>
                      <td>
                        <Form.Select
                          value={nominee.gender}
                          style={{ width: "auto" }}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "familyNomineeDetails",
                              "gender",
                            )
                          }
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          value={nominee.contact_relation}
                          style={{ width: "auto" }}
                       onChange={(e) =>
  handleArrayChange(
    e,
    index,
    "familyNomineeDetails",
    "contact_relation",
  )
}
                        />
                      </td>
                      <td>
                     <Form.Control
  type="date"
  style={{ width: "auto" }}
  value={nominee.dob}
  onChange={(e) => {
    const dob = e.target.value;

    let age = "";
    let isMinor = false;

    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();

      age = today.getFullYear() - birthDate.getFullYear();

      const monthDiff =
        today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 &&
          today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      // Auto checkbox select if age < 18
      isMinor = age < 18;
    }

    setFormData((prev) => {
      const updated = [...prev.familyNomineeDetails];

      updated[index] = {
        ...updated[index],
        dob,
        age: age.toString(),
        isMinor, // auto set checkbox
      };

      return {
        ...prev,
        familyNomineeDetails: updated,
      };
    });
  }}
/>
                      </td>
                      <td>
                      <Form.Control
  type="text"
  style={{ width: "auto" }}
  value={nominee.age || ""}
  readOnly
  isInvalid={
    !!validationErrors[
      `familyNomineeDetails[${index}].age`
    ]
  }
/>
                        <Form.Control.Feedback type="invalid">
                          {
                            validationErrors[
                              `familyNomineeDetails[${index}].age`
                            ]
                          }
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <Form.Check
                          style={{ width: "auto" }}
                          type="checkbox"
                          checked={nominee.isMinor}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "familyNomineeDetails",
                              "isMinor",
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              // Manually simulate a toggle
                              const fakeEvent = {
                                target: {
                                  type: "checkbox",
                                  checked: !nominee.isMinor,
                                },
                              };
                              handleArrayChange(
                                fakeEvent,
                                index,
                                "familyNomineeDetails",
                                "isMinor",
                              );
                            }
                          }}
                        />
                      </td>
                     <td>
  {nominee.isMinor && (
    <Form.Control
      style={{ width: "auto" }}
      type="text"
      placeholder="Guardian Name"
      value={nominee.guardianName}
      onChange={(e) =>
        handleArrayChange(
          e,
          index,
          "familyNomineeDetails",
          "guardianName",
        )
      }
    />
  )}
</td>
                      <td>
                        <Form.Control
                          style={{ width: "auto" }}
                          type="text"
                          value={nominee.address}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "familyNomineeDetails",
                              "address",
                            )
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          style={{ width: "auto" }}
                          type="text"
                          value={nominee.contactNo}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "familyNomineeDetails",
                              "contactNo",
                            )
                          }
                          isInvalid={
                            !!validationErrors[
                              `familyNomineeDetails[${index}].contactNo`
                            ]
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {
                            validationErrors[
                              `familyNomineeDetails[${index}].contactNo`
                            ]
                          }
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <Form.Control
                          type="email"
                          style={{ width: "auto" }}
                          value={nominee.email_id}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "familyNomineeDetails",
                              "email_id",
                            )
                          }
                          isInvalid={
                            !!validationErrors[
                              `familyNomineeDetails[${index}].email_id`
                            ]
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {
                            validationErrors[
                              `familyNomineeDetails[${index}].email_id`
                            ]
                          }
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          style={{ width: "auto" }}
                          value={nominee.sharePF}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "familyNomineeDetails",
                              "sharePF",
                            )
                          }
                          isInvalid={
                            !!validationErrors[
                              `familyNomineeDetails[${index}].sharePF`
                            ]
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {
                            validationErrors[
                              `familyNomineeDetails[${index}].sharePF`
                            ]
                          }
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          style={{ width: "auto" }}
                          value={nominee.shareESIC}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "familyNomineeDetails",
                              "shareESIC",
                            )
                          }
                          isInvalid={
                            !!validationErrors[
                              `familyNomineeDetails[${index}].shareESIC`
                            ]
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {
                            validationErrors[
                              `familyNomineeDetails[${index}].shareESIC`
                            ]
                          }
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <div className="table-actions">
                          {formData.familyNomineeDetails.length > 1 && (
                            <button
                              type="button"
                              className="icon-btn delete"
                              onClick={() =>
                                removeArrayItem("familyNomineeDetails", index)
                              }
                            >
                              <FaTrashAlt />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <div className="form-actions d-flex justify-content-end align-items-center">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={prevStep}
                className="me-2"
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                type="button"
                className="me-2"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button type="button" variant="primary" onClick={handleNext}>
                Next
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-section">
            <div className="mb-3">
              <div className="py-3 d-flex justify-content-between align-items-center">
                <p className="mb-0 form-subtitle">
                  Previous Employment Details
                </p>
                <Button
                  type="button"
                  className="d-flex align-items-center gap-2 add-earning-row"
                  onClick={() =>
                    addArrayItem("previousEmployments", {
                      companyName: "",
                      designation: "",
                      address: "",
                      pincode: "",
                      city: "",
                      state: "",
                      country: "",
                      joinedDate: "",
                      lastWorkingDate: "",
                      annualCTC: "",
                      monthlyCTC: "",
                      reportingTo: "",
                      reportingToDesignation: "",
                      email: "",
                      contact: "",
                      grossIncomePrevEmpl: "",
                      grossTDSDeducted: "",
                      grossPT: "",
                      totalPTDeducted: "",
                    })
                  }
                >
                  <FaPlus /> Add New Row
                </Button>
              </div>
              <Table bordered hover responsive>
                <thead className="table-secondary">
                  <tr>
                    <th>Company Name</th>
                    <th>Designation</th>
                    <th>Address</th>
                    <th>Pincode</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Country</th>
                    <th>Joined Date</th>
                    <th>Last Working Date</th>
                    <th>Annual CTC</th>
                    <th>Monthly CTC</th>
                    <th>Reporting To</th>
                    <th>Reporting To Designation</th>
                    <th>Email ID</th>
                    <th>Contact No</th>
                    <th>Gross Income Prev Empl</th>
                    <th>Gross TDS Deducted</th>
                    <th>Gross PT</th>
                    <th>Total PT Deducted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.previousEmployments.map((emp, index) => (
                    <tr key={index}>
                      <td>
                        <Form.Control
                          type="text"
                          style={{ width: "auto" }}
                          value={emp.companyName}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "previousEmployments",
                              "companyName",
                            )
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          value={emp.designation}
                          style={{ width: "auto" }}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "previousEmployments",
                              "designation",
                            )
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          value={emp.address}
                          style={{ width: "auto" }}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "previousEmployments",
                              "address",
                            )
                          }
                        />
                      </td>
                                        <td
  style={{
    position: "relative",
    minWidth: "180px",
  }}
>
  <Form.Control
    type="text"
    placeholder="Search Pincode"
    value={emp.pincode || ""}
    style={{ width: "auto" }}
    autoComplete="off"
    onClick={(e) => e.stopPropagation()}
    onChange={(e) =>
      handleEmploymentPincodeSearch(
        e,
        index
      )
    }
    isInvalid={
      !!validationErrors[
        `previousEmployments[${index}].pincode`
      ]
    }
  />

  <Form.Control.Feedback type="invalid">
    {
      validationErrors[
        `previousEmployments[${index}].pincode`
      ]
    }
  </Form.Control.Feedback>

  {/* DROPDOWN */}
  {showEmploymentPincodeList[index] &&
    employmentPincodeSuggestions[index]
      ?.length > 0 && (
      <div
        className="border rounded bg-white shadow-sm position-absolute"
        style={{
          zIndex: 9999,
          width: "250px",
          maxHeight: "250px",
          overflowY: "auto",
        }}
      >
        {employmentPincodeSuggestions[
          index
        ]?.map((p, i) => (
          <div
            key={i}
            className="p-2 border-bottom"
            style={{
              cursor: "pointer",
            }}
            onClick={() =>
              handleSelectEmploymentPincode(
                p,
                index
              )
            }
          >
            <div>
              <strong>{p.pincode}</strong>
            </div>

            <small className="text-muted">
              {p.city || p.city_name},{" "}
              {p.state || p.state_name},{" "}
              {p.country || p.country_name}
            </small>
          </div>
        ))}
      </div>
    )}
</td>
                      <td>
                        <Form.Control
                          type="text"
                          value={emp.city}
                          style={{ width: "auto" }}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "previousEmployments",
                              "city",
                            )
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          value={emp.state}
                          style={{ width: "auto" }}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "previousEmployments",
                              "state",
                            )
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          value={emp.country}
                          style={{ width: "auto" }}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "previousEmployments",
                              "country",
                            )
                          }
                        />
                      </td>

                      <td>
                        <Form.Control
                          type="date"
                          value={emp.joinedDate}
                          style={{ width: "auto" }}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "previousEmployments",
                              "joinedDate",
                            )
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="date"
                          style={{ width: "auto" }}
                          value={emp.lastWorkingDate}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "previousEmployments",
                              "lastWorkingDate",
                            )
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          style={{ width: "auto" }}
                          type="text"
                          value={emp.annualCTC}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "previousEmployments",
                              "annualCTC",
                            )
                          }
                          isInvalid={
                            !!validationErrors[
                              `previousEmployments[${index}].annualCTC`
                            ]
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {
                            validationErrors[
                              `previousEmployments[${index}].annualCTC`
                            ]
                          }
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          style={{ width: "auto" }}
                          value={emp.monthlyCTC}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "previousEmployments",
                              "monthlyCTC",
                            )
                          }
                          isInvalid={
                            !!validationErrors[
                              `previousEmployments[${index}].monthlyCTC`
                            ]
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {
                            validationErrors[
                              `previousEmployments[${index}].monthlyCTC`
                            ]
                          }
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          style={{ width: "auto" }}
                          value={emp.reportingTo}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "previousEmployments",
                              "reportingTo",
                            )
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          style={{ width: "auto" }}
                          value={emp.reportingToDesignation}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "previousEmployments",
                              "reportingToDesignation",
                            )
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="email"
                          value={emp.email}
                          style={{ width: "auto" }}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "previousEmployments",
                              "email",
                            )
                          }
                          isInvalid={
                            !!validationErrors[
                              `previousEmployments[${index}].email`
                            ]
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {
                            validationErrors[
                              `previousEmployments[${index}].email`
                            ]
                          }
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          value={emp.contact}
                          style={{ width: "auto" }}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "previousEmployments",
                              "contact",
                            )
                          }
                          isInvalid={
                            !!validationErrors[
                              `previousEmployments[${index}].contact`
                            ]
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {
                            validationErrors[
                              `previousEmployments[${index}].contact`
                            ]
                          }
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          style={{ width: "auto" }}
                          value={emp.grossIncomePrevEmpl}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "previousEmployments",
                              "grossIncomePrevEmpl",
                            )
                          }
                          isInvalid={
                            !!validationErrors[
                              `previousEmployments[${index}].grossIncomePrevEmpl`
                            ]
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {
                            validationErrors[
                              `previousEmployments[${index}].grossIncomePrevEmpl`
                            ]
                          }
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          value={emp.grossTDSDeducted}
                          style={{ width: "auto" }}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "previousEmployments",
                              "grossTDSDeducted",
                            )
                          }
                          isInvalid={
                            !!validationErrors[
                              `previousEmployments[${index}].grossTDSDeducted`
                            ]
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {
                            validationErrors[
                              `previousEmployments[${index}].grossTDSDeducted`
                            ]
                          }
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          value={emp.grossPT}
                          style={{ width: "auto" }}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "previousEmployments",
                              "grossPT",
                            )
                          }
                          isInvalid={
                            !!validationErrors[
                              `previousEmployments[${index}].grossPT`
                            ]
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {
                            validationErrors[
                              `previousEmployments[${index}].grossPT`
                            ]
                          }
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          value={emp.totalPTDeducted}
                          style={{ width: "auto" }}
                          onChange={(e) =>
                            handleArrayChange(
                              e,
                              index,
                              "previousEmployments",
                              "totalPTDeducted",
                            )
                          }
                          isInvalid={
                            !!validationErrors[
                              `previousEmployments[${index}].totalPTDeducted`
                            ]
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {
                            validationErrors[
                              `previousEmployments[${index}].totalPTDeducted`
                            ]
                          }
                        </Form.Control.Feedback>
                      </td>
                      <td>
                        <div className="table-actions">
                          {formData.previousEmployments.length > 1 && (
                            <button
                              type="button"
                              className="icon-btn delete"
                              onClick={() =>
                                removeArrayItem("previousEmployments", index)
                              }
                            >
                              <FaTrashAlt />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <div className="form-actions d-flex justify-content-end align-items-center">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={prevStep}
                className="me-2"
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                type="button"
                className="me-2"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button type="button" variant="primary" onClick={handleNext}>
                Next
              </Button>
            </div>
          </div>
        );

      case 4:
          return (
            <div className="form-section">
              <div className="mb-3">
                <p className="form-subtitle">Bank Details</p>
              </div>
              <Row>
              <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="ac_holder_name">
                  <Form.Label className="small" >Account Holder Name</Form.Label>
         <Form.Control
  type="text"
  value={formData.bankDetails.ac_holder_name}
  onChange={(e) =>
    handleObjectChange(e, "bankDetails", "ac_holder_name")
  }
/>
                  </Form.Group>
                </Col>
              <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="card_no">
                  <Form.Label className="small" >Card No</Form.Label>
         <Form.Control
  type="text"
  value={formData.bankDetails.card_no}
  onChange={(e) =>
    handleObjectChange(e, "bankDetails", "card_no")
  }
/>
                  </Form.Group>
                </Col>
              <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="bankName">
                  <Form.Label className="small" >Bank Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.bankDetails.bankName}
                      onChange={(e) =>
                        handleObjectChange(e, "bankDetails", "bankName")
                      }
                      style={{ color: "black" }}
                    />
                  </Form.Group>
                </Col>
              <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="bankAccountNo">
                  <Form.Label className="small" >Bank Account No</Form.Label>
                <Form.Control
    type="text"
    value={formData.bankDetails.bankAccountNo}
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, ""); // only digits

      handleObjectChange(
        { ...e, target: { ...e.target, value } },
        "bankDetails",
        "bankAccountNo"
      );
    }}
    isInvalid={!!validationErrors["bankDetails.bankAccountNo"]}
  />
                    <Form.Control.Feedback type="invalid">
                      {validationErrors["bankDetails.bankAccountNo"]}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="bankAddress">
                  <Form.Label className="small" >Bank Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.bankDetails.bankAddress}
                      onChange={(e) =>
                        handleObjectChange(e, "bankDetails", "bankAddress")
                      }
                    />
                  </Form.Group>
                </Col>
              <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="city">
                  <Form.Label className="small" >City</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.bankDetails.city}
                      onChange={(e) =>
                        handleObjectChange(e, "bankDetails", "city")
                      }
                    />
                  </Form.Group>
                </Col>
              <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="state">
                  <Form.Label className="small" >State</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.bankDetails.state}
                      onChange={(e) =>
                        handleObjectChange(e, "bankDetails", "state")
                      }
                    />
                  </Form.Group>
                </Col>
              <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="ifscCode">
                  <Form.Label className="small" >IFSC Code</Form.Label>
                  <Form.Control
    type="text"
    value={formData.bankDetails.ifscCode}
    onChange={(e) => {
      let value = e.target.value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, ""); // only valid chars

      if (value.length <= 11) {
        handleObjectChange(
          { ...e, target: { ...e.target, value } },
          "bankDetails",
          "ifscCode"
        );
      }
    }}
    isInvalid={!!validationErrors["bankDetails.ifscCode"]}
  />
                    <Form.Control.Feedback type="invalid">
                      {validationErrors["bankDetails.ifscCode"]}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="micrCode">
                  <Form.Label className="small" >MICR Code</Form.Label>
                  <Form.Control
    type="text"
    value={formData.bankDetails.micrCode}
    onChange={(e) => {
      let value = e.target.value.replace(/\D/g, ""); // only digits

      if (value.length <= 9) {
        handleObjectChange(
          { ...e, target: { ...e.target, value } },
          "bankDetails",
          "micrCode"
        );
      }
    }}
    isInvalid={!!validationErrors["bankDetails.micrCode"]}
  />
                    <Form.Control.Feedback type="invalid">
                      {validationErrors["bankDetails.micrCode"]}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              <Col xs={12} sm={6} md={3} className="mb-2">
                  <Form.Group controlId="cancelledChequeFile">
                  <Form.Label className="small" >Cancelled Cheque</Form.Label>
            <Form.Control
  type="file"
  accept=".jpg,.jpeg,.png,.pdf"
  onChange={(e) =>
    setFormData({
      ...formData,
      cancelledChequeFile: e.target.files[0],
    })
  }
/>
                  </Form.Group>
                </Col>
              </Row>

              <div className="form-actions d-flex justify-content-end align-items-center">
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={prevStep}
                  className="me-2"
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  className="me-2"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNext();
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          );

      case 5:
       return (
  <div className="form-section">
    <div className="mb-3">
      <p className="form-subtitle">Separation Details</p>
    </div>

    <Row className="form-grid">

      {/* Separation Type */}
      <Col xs={12} sm={6} md={3} className="mb-2">
        <Form.Group controlId="separation_type">
          <Form.Label className="small">
            Separation Type
          </Form.Label>

          <Form.Select
            name="separation_type"
            value={formData.separationDetails.separation_type}
            onChange={(e) =>
              handleObjectChange(
                e,
                "separationDetails",
                "separation_type"
              )
            }
          >
            <option value="">Select</option>
            <option value="Terminate">Terminate</option>
            <option value="Resigned">Resigned</option>
          </Form.Select>
        </Form.Group>
      </Col>

      {/* Separation Reason */}
      <Col xs={12} sm={6} md={3} className="mb-2">
        <Form.Group controlId="separate_reason">
          <Form.Label className="small">
            Separation Reason
          </Form.Label>

          <Form.Select
            name="separate_reason"
            value={formData.separationDetails.separate_reason}
            onChange={(e) =>
              handleObjectChange(
                e,
                "separationDetails",
                "separate_reason"
              )
            }
          >
            <option value="">Select</option>
            <option value="Terminate">Terminate</option>
            <option value="Another Job">Another Job</option>
            <option value="Personal Reason">
              Personal Reason
            </option>
            <option value="Best Opportunity">
              Best Opportunity
            </option>
          </Form.Select>
        </Form.Group>
      </Col>

      {/* Date Of Separation */}
      <Col xs={12} sm={6} md={3} className="mb-2">
        <Form.Group controlId="date_of_separation">
          <Form.Label className="small">
            Date of Separation
          </Form.Label>

          <Form.Control
            type="date"
            name="date_of_separation"
            value={formData.separationDetails.date_of_separation}
            onChange={(e) =>
              handleObjectChange(
                e,
                "separationDetails",
                "date_of_separation"
              )
            }
          />
        </Form.Group>
      </Col>

      {/* Notice Period */}
      <Col xs={12} sm={6} md={3} className="mb-2">
        <Form.Group controlId="notice_period">
          <Form.Label className="small">
            Notice Period Days
          </Form.Label>

          <Form.Control
            type="text"
            name="notice_period"
            value={formData.separationDetails.notice_period}
            onChange={(e) =>
              handleObjectChange(
                e,
                "separationDetails",
                "notice_period"
              )
            }
            isInvalid={
              !!validationErrors[
                "separationDetails.notice_period"
              ]
            }
          />

          <Form.Control.Feedback type="invalid">
            {
              validationErrors[
                "separationDetails.notice_period"
              ]
            }
          </Form.Control.Feedback>
        </Form.Group>
      </Col>

      {/* Last Working Date */}
      <Col xs={12} sm={6} md={3} className="mb-2">
        <Form.Group controlId="last_working_date_sp">
          <Form.Label className="small">
            Last Working Date
          </Form.Label>

          <Form.Control
            type="date"
            name="last_working_date_sp"
            value={
              formData.separationDetails.last_working_date_sp
            }
            onChange={(e) =>
              handleObjectChange(
                e,
                "separationDetails",
                "last_working_date_sp"
              )
            }
          />
        </Form.Group>
      </Col>

      {/* Handover Given To */}
      <Col xs={12} sm={6} md={3} className="mb-2">
        <Form.Group controlId="handover_given_to">
          <Form.Label className="small">
            Handover Given To
          </Form.Label>

          <Form.Control
            type="text"
            name="handover_given_to"
            value={
              formData.separationDetails.handover_given_to
            }
            onChange={(e) =>
              handleObjectChange(
                e,
                "separationDetails",
                "handover_given_to"
              )
            }
          />
        </Form.Group>
      </Col>

    </Row>

    <div className="form-actions d-flex justify-content-end align-items-center">
      <Button
        type="button"
        onClick={prevStep}
        variant="outline-secondary"
        className="me-2"
      >
        Previous
      </Button>

      <Button
        type="button"
        onClick={handleClose}
        variant="secondary"
        className="me-2"
      >
        Cancel
      </Button>

      <Button
        variant="primary"
        type="submit"
        onClick={(e) => {
          e.preventDefault();
          handleNext();
        }}
      >
        Submit
      </Button>
    </div>
  </div>
);

      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <Card>
        <div className="step-indicator">
  
  <div
    className={`step ${step >= 1 ? "active" : ""}`}
    onClick={() => setStep(1)}
    style={{ cursor: "pointer" }}
  >
    <span>1</span> Employee Details
  </div>

  <div
    className={`step ${step >= 2 ? "active" : ""}`}
    onClick={() => setStep(2)}
    style={{ cursor: "pointer" }}
  >
    <span>2</span> Personal Details
  </div>

  <div
    className={`step ${step >= 3 ? "active" : ""}`}
    onClick={() => setStep(3)}
    style={{ cursor: "pointer" }}
  >
    <span>3</span> Prev. Emp Details
  </div>

  <div
    className={`step ${step >= 4 ? "active" : ""}`}
    onClick={() => setStep(4)}
    style={{ cursor: "pointer" }}
  >
    <span>4</span> Account Details
  </div>

  <div
    className={`step ${step >= 5 ? "active" : ""}`}
    onClick={() => setStep(5)}
    style={{ cursor: "pointer" }}
  >
    <span>5</span> Separation Details
  </div>

</div>

        {Object.keys(validationErrors).length > 0 && (
          <Alert variant="danger">
            Please fix the validation errors below.
          </Alert>
        )}
        <Form className="add-employee-form" encType="multipart/form-data">
          {error ? (
            <Alert variant="danger" className="mb-3 text-center">
              {error}
            </Alert>
          ) : (
            ""
          )}
          {renderStep()}
          {/* ===== Your full multi-step form rendering goes here, exactly as in your design ===== */}
          {/* Use handleObjectChange for every bankDetails field. Do NOT use handleArrayChange for objects! */}
          {/* Make sure NOT to render employeeCode input anywhere! */}
        </Form>
      </Card>
    </div>
  );
};

export default AddEmployee;
