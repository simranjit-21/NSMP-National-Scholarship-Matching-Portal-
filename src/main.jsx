import React, { createContext, useContext, useMemo, useReducer, useState } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams
} from "react-router-dom";
import {
  AlertCircle,
  Bell,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileCheck2,
  Filter,
  GraduationCap,
  HelpCircle,
  Languages,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  UserRound,
  X
} from "lucide-react";
import "./i18n";
import "./styles.css";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh"
];

const initialProfile = {
  fullName: "Asha Kumari",
  dob: "2005-08-14",
  gender: "Female",
  state: "Punjab",
  district: "Amritsar",
  category: "SC",
  disability: "No",
  disabilityType: "",
  level: "UG",
  course: "B.Sc Computer Science",
  stream: "Science",
  institution: "Government College Amritsar",
  marks: "86",
  board: "Punjab University",
  income: "1-2.5L",
  incomeCertificate: "Yes",
  aadhaarBank: "Yes",
  documents: {
    aadhaar: true,
    marksheet: true,
    casteCertificate: true,
    incomeCertificate: true,
    bankPassbook: false
  }
};

const scholarships = [
  {
    id: "post-matric-sc",
    name: "Post Matric Scholarship for SC Students",
    ministry: "Ministry of Social Justice and Empowerment",
    body: "Central",
    category: "SC",
    amount: 45000,
    deadline: "2026-06-28",
    match: 96,
    badge: "Strong Match",
    reason: "You qualify because you are an SC student from Punjab with income under ₹2.5L.",
    description: "Financial support for SC students studying after Class 10 in recognized institutions.",
    criteria: [
      ["SC category", true],
      ["Annual income below ₹2.5L", true],
      ["Post-matric or higher education", true],
      ["Valid bank account", false]
    ],
    documents: ["Aadhaar", "Caste Certificate", "Income Certificate", "Marksheet", "Bank Passbook"],
    dates: ["01 May 2026", "28 Jun 2026"],
    renewal: "Renew every year after institute and attendance verification."
  },
  {
    id: "central-sector",
    name: "Central Sector Scheme for College Students",
    ministry: "Ministry of Education",
    body: "Central",
    category: "General",
    amount: 12000,
    deadline: "2026-07-14",
    match: 88,
    badge: "Eligible",
    reason: "Your marks are above the merit cut-off and your education level matches the scheme.",
    description: "Merit scholarship for students in college and university courses.",
    criteria: [
      ["Above 80th percentile or equivalent marks", true],
      ["Regular UG course", true],
      ["Income within scheme limit", true],
      ["No other major scholarship", true]
    ],
    documents: ["Class 12 Marksheet", "Enrollment Proof", "Aadhaar", "Bank Details"],
    dates: ["10 May 2026", "14 Jul 2026"],
    renewal: "Requires minimum marks and continued enrollment."
  },
  {
    id: "aicte-pragati",
    name: "AICTE Pragati Scholarship for Girls",
    ministry: "AICTE",
    body: "AICTE",
    category: "Girls",
    amount: 50000,
    deadline: "2026-08-02",
    match: 72,
    badge: "Partial Match",
    reason: "Your gender and course match. Upload admission proof to improve eligibility confidence.",
    description: "Scholarship for girl students admitted to technical degree or diploma courses.",
    criteria: [
      ["Girl student", true],
      ["Technical course", false],
      ["Family income below scheme limit", true],
      ["Admission in current year", true]
    ],
    documents: ["Admission Letter", "Fee Receipt", "Income Certificate", "Photo"],
    dates: ["20 May 2026", "02 Aug 2026"],
    renewal: "Continues during the approved technical course duration."
  }
];

const notifications = [
  { id: 1, type: "Deadline", unread: true, text: "Post Matric Scholarship closes on 28 Jun 2026." },
  { id: 2, type: "New Scheme", unread: true, text: "A new state scheme matching your profile was added." },
  { id: 3, type: "Renewal", unread: false, text: "Renewal window is open for Central Sector Scheme." },
  { id: 4, type: "Deadline", unread: false, text: "AICTE Pragati deadline is more than 30 days away." }
];

const applicationRows = [
  ["Post Matric Scholarship for SC Students", "Applied", "18 May 2026"],
  ["Central Sector Scheme for College Students", "Pending", "16 May 2026"],
  ["State Merit Scholarship", "Approved", "09 May 2026"]
];

const AuthContext = createContext(null);
const ProfileContext = createContext(null);
const RecommendationsContext = createContext(null);

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      localStorage.setItem("nsmp_token", action.token);
      return { ...state, isAuthenticated: true, token: action.token, role: action.role };
    case "LOGOUT":
      localStorage.removeItem("nsmp_token");
      return { isAuthenticated: false, token: null, role: "student" };
    default:
      return state;
  }
}

function profileReducer(state, action) {
  switch (action.type) {
    case "UPDATE":
      return { ...state, ...action.payload };
    case "DOC":
      return { ...state, documents: { ...state.documents, [action.key]: action.value } };
    default:
      return state;
  }
}

function recReducer(state, action) {
  switch (action.type) {
    case "FILTER":
      return { ...state, filters: { ...state.filters, [action.key]: action.value } };
    case "SORT":
      return { ...state, sort: action.value };
    default:
      return state;
  }
}

function Providers({ children }) {
  const [auth, dispatchAuth] = useReducer(authReducer, {
    isAuthenticated: Boolean(localStorage.getItem("nsmp_token")),
    token: localStorage.getItem("nsmp_token"),
    role: "student"
  });
  const [profile, dispatchProfile] = useReducer(profileReducer, initialProfile);
  const [recState, dispatchRec] = useReducer(recReducer, {
    filters: { type: "All", amount: "All", deadline: "All", category: "All" },
    sort: "Best Match"
  });

  return (
    <AuthContext.Provider value={{ auth, dispatchAuth }}>
      <ProfileContext.Provider value={{ profile, dispatchProfile }}>
        <RecommendationsContext.Provider value={{ recState, dispatchRec }}>
          {children}
        </RecommendationsContext.Provider>
      </ProfileContext.Provider>
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

function useProfile() {
  return useContext(ProfileContext);
}

function useRecommendations() {
  return useContext(RecommendationsContext);
}

function formatINR(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function daysLeft(date) {
  const now = new Date("2026-05-21");
  const target = new Date(date);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function Navbar() {
  const { t, i18n } = useTranslation();
  const { auth, dispatchAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function setLanguage(lang) {
    i18n.changeLanguage(lang);
    localStorage.setItem("nsmp_lang", lang);
  }

  return (
    <header className="gov-navbar">
      <Link className="brand" to="/">
        <span className="brand-mark"><GraduationCap size={23} /></span>
        <span>
          <strong>NSMP</strong>
          <small>National Scholarship Matching Portal</small>
        </span>
      </Link>
      <nav className={open ? "nav-links open" : "nav-links"} aria-label="Primary">
        <Link to="/#steps">{t("features")}</Link>
        <Link to="/recommendations">{t("scholarships")}</Link>
        <Link to="/dashboard">{t("dashboard")}</Link>
        <Link to="/notifications">{t("notifications")}</Link>
      </nav>
      <div className="nav-actions">
        <LanguageToggle language={i18n.language} setLanguage={setLanguage} />
        {auth.isAuthenticated ? (
          <button
            className="ghost-button"
            onClick={() => {
              dispatchAuth({ type: "LOGOUT" });
              navigate("/");
            }}
            type="button"
          >
            <LogOut size={17} /> Logout
          </button>
        ) : (
          <Link className="primary-button small-button" to="/login">{t("login")}</Link>
        )}
        <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Open menu" type="button">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}

function LanguageToggle({ language, setLanguage }) {
  return (
    <div className="language-toggle" aria-label="Language selection">
      <Languages size={16} />
      <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")} type="button">EN</button>
      <button className={language === "hi" ? "active" : ""} onClick={() => setLanguage("hi")} type="button">HI</button>
    </div>
  );
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { auth } = useAuth();
  if (!auth.isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && auth.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

function LandingPage() {
  const { t } = useTranslation();

  return (
    <main className="page landing">
      <section className="hero-grid">
        <div className="hero-copy">
          <span className="trust-chip"><ShieldCheck size={16} /> Student-first scholarship discovery</span>
          <h1>{t("heroTitle")}</h1>
          <p>{t("heroSubtitle")}</p>
          <div className="hero-actions">
            <Link className="primary-button" to="/register">{t("getStarted")} <ChevronRight size={18} /></Link>
            <Link className="secondary-button" to="/login">{t("login")}</Link>
          </div>
        </div>
        <div className="trust-panel" aria-label="How NSMP helps">
          <div className="panel-header">
            <BookOpenCheck size={22} />
            <strong>Scholarship Match Preview</strong>
          </div>
          {scholarships.map((item) => (
            <div className="mini-scheme" key={item.id}>
              <span>{item.match}%</span>
              <div>
                <strong>{item.name}</strong>
                <small>{item.reason}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="steps" className="three-steps" aria-label="Three step process">
        {[t("step1"), t("step2"), t("step3")].map((step, index) => (
          <article className="info-card" key={step}>
            <span>{index + 1}</span>
            <h2>{step}</h2>
            <p>{index === 0 ? "Answer simple profile questions." : index === 1 ? "See schemes you may qualify for." : "Go to the official NSP site to apply."}</p>
          </article>
        ))}
      </section>

      <section className="stats-strip" aria-label="Platform statistics">
        <strong>140+ schemes</strong>
        <strong>₹2000 Cr+ disbursed</strong>
        <strong>Multilingual support</strong>
      </section>

      <section className="trust-badges" aria-label="Trust badges">
        <span>Ministry of Education</span>
        <span>Digital India</span>
        <span>National Scholarship Portal</span>
      </section>
    </main>
  );
}

function LoginPage() {
  const { dispatchAuth } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function continueToPortal() {
    const nextErrors = {};
    if (mode === "signup" && !form.name.trim()) nextErrors.name = "Full name is required.";
    if (!form.email.trim()) nextErrors.email = "Email or mobile is required.";
    if (!form.password.trim()) nextErrors.password = "Password is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    dispatchAuth({ type: "LOGIN", token: "demo-jwt-token", role });
    navigate(role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <main className="page auth-page">
      <section className="auth-card">
        <h1>{mode === "login" ? "Login to NSMP" : "Create your NSMP account"}</h1>
        <p>Use your email or mobile number to continue.</p>
        <div className="tabs" role="tablist">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">Login</button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")} type="button">Signup</button>
        </div>
        {mode === "signup" && (
          <TextField
            error={errors.name}
            label="Full name"
            name="name"
            onChange={(value) => updateField("name", value)}
            required
            value={form.name}
          />
        )}
        <TextField
          error={errors.email}
          label="Email or mobile"
          name="email"
          onChange={(value) => updateField("email", value)}
          required
          value={form.email}
        />
        <TextField
          error={errors.password}
          label="Password"
          name="password"
          onChange={(value) => updateField("password", value)}
          required
          type="password"
          value={form.password}
        />
        <div className="role-toggle" aria-label="Choose role">
          <button className={role === "student" ? "active" : ""} onClick={() => setRole("student")} type="button">
            <UserRound size={16} /> Student
          </button>
          <button className={role === "admin" ? "active" : ""} onClick={() => setRole("admin")} type="button">
            <ShieldCheck size={16} /> Admin
          </button>
        </div>
        <button
          className="primary-button full-button"
          onClick={continueToPortal}
          type="button"
        >
          Continue
        </button>
        <Link className="plain-link" to="/register">New student? Register here</Link>
      </section>
    </main>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const { profile, dispatchProfile } = useProfile();
  const { dispatchAuth } = useAuth();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});

  const steps = ["Personal Details", "Academic Details", "Financial Details", "Document Checklist"];

  function update(key, value) {
    dispatchProfile({ type: "UPDATE", payload: { [key]: value } });
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function validate() {
    const requiredByStep = [
      ["fullName", "dob", "gender", "state", "district", "category"],
      ["level", "course", "institution", "marks", "board"],
      ["income", "incomeCertificate", "aadhaarBank"],
      []
    ];
    const nextErrors = {};
    requiredByStep[step].forEach((key) => {
      if (!profile[key]) nextErrors[key] = "This field is required.";
    });
    if (step === 1 && profile.marks && (Number(profile.marks) < 0 || Number(profile.marks) > 100)) {
      nextErrors.marks = "Enter marks between 0 and 100.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function next() {
    if (!validate()) return;
    if (step < 3) {
      setStep(step + 1);
      window.setTimeout(() => document.querySelector("main input, main select")?.focus(), 0);
    } else {
      dispatchAuth({ type: "LOGIN", token: "demo-jwt-token", role: "student" });
      navigate("/recommendations");
    }
  }

  return (
    <main className="page form-page">
      <section className="wizard">
        <div className="progress-header">
          <div>
            <p>Step {step + 1} of 4</p>
            <h1>{steps[step]}</h1>
          </div>
          <div className="progress-bar" aria-label={`Step ${step + 1} of 4`}>
            <i style={{ width: `${((step + 1) / 4) * 100}%` }} />
          </div>
        </div>
        {step === 0 && <PersonalStep profile={profile} update={update} errors={errors} />}
        {step === 1 && <AcademicStep profile={profile} update={update} errors={errors} />}
        {step === 2 && <FinancialStep profile={profile} update={update} errors={errors} />}
        {step === 3 && <DocumentStep profile={profile} dispatchProfile={dispatchProfile} />}
        <div className="wizard-actions">
          <button className="secondary-button" disabled={step === 0} onClick={() => setStep(step - 1)} type="button">
            <ChevronLeft size={17} /> Back
          </button>
          <button className="primary-button" onClick={next} type="button">
            {step === 3 ? "Submit and get matches" : "Next"} <ChevronRight size={17} />
          </button>
        </div>
      </section>
    </main>
  );
}

function TextField({ label, name, value, onChange, error, type = "text", required = false }) {
  const errorId = `${name}-error`;
  return (
    <label className="field">
      <span>{label}{required && <b aria-hidden="true">*</b>}</span>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        name={name}
        onChange={(event) => onChange?.(event.target.value)}
        type={type}
        value={value ?? ""}
      />
      {error && <em id={errorId}>{error}</em>}
    </label>
  );
}

function SelectField({ label, name, value, onChange, error, options, required = false, tooltip }) {
  const errorId = `${name}-error`;
  return (
    <label className="field">
      <span>
        {label}{required && <b aria-hidden="true">*</b>}
        {tooltip && <Tooltip text={tooltip} />}
      </span>
      <select
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        name={name}
        onChange={(event) => onChange(event.target.value)}
        value={value ?? ""}
      >
        <option value="">Select</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      {error && <em id={errorId}>{error}</em>}
    </label>
  );
}

function Tooltip({ text }) {
  return (
    <span className="tooltip" tabIndex="0">
      <HelpCircle size={15} />
      <small>{text}</small>
    </span>
  );
}

function PersonalStep({ profile, update, errors }) {
  return (
    <div className="form-grid">
      <TextField label="Full Name" name="fullName" value={profile.fullName} onChange={(v) => update("fullName", v)} error={errors.fullName} required />
      <TextField label="Date of Birth" name="dob" type="date" value={profile.dob} onChange={(v) => update("dob", v)} error={errors.dob} required />
      <SelectField label="Gender" name="gender" value={profile.gender} onChange={(v) => update("gender", v)} error={errors.gender} options={["Female", "Male", "Other"]} required />
      <SelectField label="State" name="state" value={profile.state} onChange={(v) => update("state", v)} error={errors.state} options={indianStates} required />
      <TextField label="District" name="district" value={profile.district} onChange={(v) => update("district", v)} error={errors.district} required />
      <SelectField
        label="Social Category"
        name="category"
        value={profile.category}
        onChange={(v) => update("category", v)}
        error={errors.category}
        options={["General", "SC", "ST", "OBC", "EWS", "Minority"]}
        tooltip="Choose the category written on your official certificate."
        required
      />
      <SelectField label="Disability Status" name="disability" value={profile.disability} onChange={(v) => update("disability", v)} options={["No", "Yes"]} />
      {profile.disability === "Yes" && <TextField label="Type of Disability" name="disabilityType" value={profile.disabilityType} onChange={(v) => update("disabilityType", v)} />}
    </div>
  );
}

function AcademicStep({ profile, update, errors }) {
  return (
    <div className="form-grid">
      <SelectField label="Current Education Level" name="level" value={profile.level} onChange={(v) => update("level", v)} error={errors.level} options={["Pre-Matric", "Post-Matric Class 11-12", "UG", "PG", "PhD"]} required />
      <TextField label="Course Name & Stream" name="course" value={profile.course} onChange={(v) => update("course", v)} error={errors.course} required />
      <TextField label="Institution Name" name="institution" value={profile.institution} onChange={(v) => update("institution", v)} error={errors.institution} required />
      <TextField label="Latest Marks / CGPA" name="marks" type="number" value={profile.marks} onChange={(v) => update("marks", v)} error={errors.marks} required />
      <TextField label="Board / University Name" name="board" value={profile.board} onChange={(v) => update("board", v)} error={errors.board} required />
    </div>
  );
}

function FinancialStep({ profile, update, errors }) {
  return (
    <div className="form-grid">
      <SelectField label="Annual Household Income" name="income" value={profile.income} onChange={(v) => update("income", v)} error={errors.income} options={["<1L", "1-2.5L", "2.5-5L", "5-8L", ">8L"]} required />
      <SelectField label="Income Certificate Available?" name="incomeCertificate" value={profile.incomeCertificate} onChange={(v) => update("incomeCertificate", v)} error={errors.incomeCertificate} options={["Yes", "No"]} required />
      <SelectField label="Bank Account Linked with Aadhaar?" name="aadhaarBank" value={profile.aadhaarBank} onChange={(v) => update("aadhaarBank", v)} error={errors.aadhaarBank} options={["Yes", "No"]} required />
    </div>
  );
}

function DocumentStep({ profile, dispatchProfile }) {
  const docs = [
    ["aadhaar", "Aadhaar"],
    ["marksheet", "Marksheet"],
    ["casteCertificate", "Caste Certificate"],
    ["incomeCertificate", "Income Certificate"],
    ["bankPassbook", "Bank Passbook"]
  ];

  return (
    <div className="document-list">
      {docs.map(([key, label]) => (
        <label className="doc-row" key={key}>
          <input
            checked={profile.documents[key]}
            onChange={(event) => dispatchProfile({ type: "DOC", key, value: event.target.checked })}
            type="checkbox"
          />
          <span>{label}</span>
          <strong className={profile.documents[key] ? "available" : "missing"}>
            {profile.documents[key] ? "Available" : "Not Available"}
          </strong>
        </label>
      ))}
    </div>
  );
}

function DashboardPage() {
  const { profile } = useProfile();

  return (
    <main className="page">
      <PageHeader title={`Hello ${profile.fullName}, here are your updates`} subtitle="Track your matches, applications, and upcoming deadlines." />
      <section className="summary-grid">
        <StatCard label="Schemes matched" value="3" />
        <StatCard label="Applications tracked" value="3" />
        <StatCard label="Deadlines this month" value="1" />
      </section>
      <section className="content-grid">
        <NotificationPanel />
        <div className="card">
          <div className="card-head">
            <h2>Application Tracker</h2>
            <Link className="plain-link" to="/profile">Edit profile</Link>
          </div>
          <ResponsiveTable rows={applicationRows} headers={["Scheme Name", "Status", "Last Updated"]} />
          <Link className="primary-button full-button" to="/recommendations">Re-run Recommendations</Link>
        </div>
      </section>
    </main>
  );
}

function RecommendationsPage() {
  const { profile } = useProfile();
  const { recState, dispatchRec } = useRecommendations();
  const filtered = useMemo(() => {
    let result = scholarships.filter((item) => (
      (recState.filters.type === "All" || item.body === recState.filters.type) &&
      (recState.filters.category === "All" || item.category === recState.filters.category)
    ));
    if (recState.sort === "Deadline") result = result.sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline));
    if (recState.sort === "Amount") result = result.sort((a, b) => b.amount - a.amount);
    if (recState.sort === "Best Match") result = result.sort((a, b) => b.match - a.match);
    return result;
  }, [recState]);

  return (
    <main className="page">
      <section className="summary-card">
        <div>
          <p>{profile.fullName} · {profile.category} · {profile.level}</p>
          <h1>{filtered.length} scholarships matched for you</h1>
        </div>
        <span>{profile.state}</span>
      </section>
      <FilterBar state={recState} dispatch={dispatchRec} />
      {filtered.length === 0 ? (
        <EmptyState title="No matches found" text="Try updating your profile or widening the filters." />
      ) : (
        <section className="recommendation-stack">
          {filtered.map((item) => <ScholarshipCard item={item} key={item.id} />)}
        </section>
      )}
    </main>
  );
}

function FilterBar({ state, dispatch }) {
  return (
    <section className="filter-bar" aria-label="Filter scholarships">
      <Filter size={18} />
      <select value={state.filters.type} onChange={(event) => dispatch({ type: "FILTER", key: "type", value: event.target.value })}>
        {["All", "Central", "State", "UGC", "AICTE"].map((x) => <option key={x}>{x}</option>)}
      </select>
      <select value={state.filters.category} onChange={(event) => dispatch({ type: "FILTER", key: "category", value: event.target.value })}>
        {["All", "SC", "ST", "OBC", "General", "Girls"].map((x) => <option key={x}>{x}</option>)}
      </select>
      <select value={state.sort} onChange={(event) => dispatch({ type: "SORT", value: event.target.value })}>
        {["Best Match", "Deadline", "Amount"].map((x) => <option key={x}>{x}</option>)}
      </select>
    </section>
  );
}

function ScholarshipCard({ item }) {
  return (
    <article className="scholarship-card">
      <div className="scheme-top">
        <div>
          <h2>{item.name}</h2>
          <p>{item.ministry}</p>
        </div>
        <MatchBadge label={item.badge} />
      </div>
      <div className="detail-pills">
        <span>Amount: {formatINR(item.amount)}/year</span>
        <DeadlineChip date={item.deadline} />
        <span>Category: {item.category}</span>
      </div>
      <p className="reason">{item.reason}</p>
      <div className="card-actions">
        <Link className="secondary-button" to={`/scholarship/${item.id}`}>View Details</Link>
        <a className="primary-button" href="https://scholarships.gov.in" target="_blank" rel="noreferrer">Apply on NSP →</a>
      </div>
    </article>
  );
}

function MatchBadge({ label }) {
  const className = label === "Strong Match" ? "strong" : label === "Eligible" ? "eligible" : "partial";
  return <span className={`match-badge ${className}`}>{label}</span>;
}

function DeadlineChip({ date }) {
  const left = daysLeft(date);
  const urgency = left < 7 ? "urgent" : left <= 30 ? "soon" : "safe";
  return <span className={`deadline-chip ${urgency}`}><CalendarClock size={15} /> Deadline: {new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>;
}

function ScholarshipDetailPage() {
  const { id } = useParams();
  const item = scholarships.find((scheme) => scheme.id === id) || scholarships[0];

  return (
    <main className="page">
      <Link className="back-link" to="/recommendations"><ChevronLeft size={17} /> Back to Recommendations</Link>
      <section className="detail-card">
        <div className="scheme-top">
          <div>
            <p>{item.ministry}</p>
            <h1>{item.name}</h1>
          </div>
          <a className="primary-button" href="https://scholarships.gov.in" target="_blank" rel="noreferrer">Apply on NSP →</a>
        </div>
        <p>{item.description}</p>
        <div className="detail-layout">
          <InfoBlock title="Eligibility criteria">
            {item.criteria.map(([text, met]) => (
              <p className={met ? "criteria met" : "criteria"} key={text}>
                <CheckCircle2 size={17} /> {text}
              </p>
            ))}
          </InfoBlock>
          <InfoBlock title="Benefits">
            <p>Amount: {formatINR(item.amount)} per year</p>
            <p>Renewal: {item.renewal}</p>
          </InfoBlock>
          <InfoBlock title="Required documents">
            {item.documents.map((doc) => <p key={doc}>{doc}</p>)}
          </InfoBlock>
          <InfoBlock title="Important dates">
            <p>Open date: {item.dates[0]}</p>
            <p>Last date: {item.dates[1]}</p>
          </InfoBlock>
        </div>
      </section>
    </main>
  );
}

function ProfilePage() {
  const { profile, dispatchProfile } = useProfile();
  const update = (key, value) => dispatchProfile({ type: "UPDATE", payload: { [key]: value } });

  return (
    <main className="page form-page">
      <PageHeader title="Profile" subtitle="Update your details. Saving changes can refresh recommendation quality." />
      <section className="wizard">
        <PersonalStep profile={profile} update={update} errors={{}} />
        <AcademicStep profile={profile} update={update} errors={{}} />
        <FinancialStep profile={profile} update={update} errors={{}} />
        <DocumentStep profile={profile} dispatchProfile={dispatchProfile} />
        <button className="primary-button full-button" type="button">Save changes and re-run recommendations</button>
      </section>
    </main>
  );
}

function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [items, setItems] = useState(notifications);
  const visible = items.filter((item) => filter === "All" || (filter === "Unread" ? item.unread : item.type === filter));

  return (
    <main className="page">
      <PageHeader title="Notifications" subtitle="Deadline reminders, new scheme alerts, and renewal updates." />
      <section className="filter-bar">
        {["All", "Unread", "Deadline", "New Scheme", "Renewal"].map((item) => (
          <button className={filter === item ? "active-filter" : ""} key={item} onClick={() => setFilter(item)} type="button">{item}</button>
        ))}
        <button className="ghost-button" onClick={() => setItems(items.map((item) => ({ ...item, unread: false })))} type="button">Mark all read</button>
      </section>
      <section className="notification-list">
        {visible.map((item) => (
          <article className={item.unread ? "notice-card unread" : "notice-card"} key={item.id}>
            <Bell size={18} />
            <div>
              <strong>{item.type}</strong>
              <p>{item.text}</p>
            </div>
            {item.unread && <span>Unread</span>}
          </article>
        ))}
      </section>
    </main>
  );
}

function AdminPage() {
  return (
    <main className="page">
      <PageHeader title="Admin Dashboard" subtitle="Monitor reach, scheme usage, and coverage gaps." />
      <section className="summary-grid">
        <StatCard label="Total Students Registered" value="18L+" />
        <StatCard label="Applications Submitted" value="3.8L" />
        <StatCard label="Schemes in Database" value="140+" />
        <StatCard label="Match Rate" value="92%" />
      </section>
      <section className="content-grid">
        <div className="card">
          <h2>Applications by Category</h2>
          <BarRows rows={[["SC", 74], ["ST", 52], ["OBC", 81], ["General", 36]]} />
        </div>
        <div className="card">
          <h2>District-wise Coverage Gaps</h2>
          <ResponsiveTable rows={[["Mewat", "Low reach"], ["Kiphire", "Needs awareness"], ["Dantewada", "Document gap"]]} headers={["District", "Gap"]} />
        </div>
      </section>
      <section className="card">
        <div className="card-head">
          <h2>Scheme Performance</h2>
          <div className="card-actions">
            <button className="secondary-button" type="button">Add / Edit Scheme</button>
            <button className="primary-button" type="button"><Download size={16} /> Export CSV</button>
          </div>
        </div>
        <ResponsiveTable rows={[["Post Matric SC", "1.2L", "96%", "On track"], ["Central Sector", "68K", "88%", "Pending"], ["AICTE Pragati", "24K", "72%", "On track"]]} headers={["Scheme Name", "Applications", "Match Rate", "Disbursement Status"]} />
      </section>
    </main>
  );
}

function NotificationPanel() {
  return (
    <div className="card">
      <div className="card-head">
        <h2>Notifications</h2>
        <NotificationBell />
      </div>
      {notifications.slice(0, 3).map((item) => (
        <div className="notice-line" key={item.id}>
          <AlertCircle size={17} />
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  );
}

function NotificationBell() {
  const unread = notifications.filter((item) => item.unread).length;
  return (
    <Link className="notification-bell" to="/notifications" aria-label={`${unread} unread notifications`}>
      <Bell size={18} />
      {unread > 0 && <span>{unread}</span>}
    </Link>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function PageHeader({ title, subtitle }) {
  return (
    <section className="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </section>
  );
}

function InfoBlock({ title, children }) {
  return (
    <section className="info-block">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function ResponsiveTable({ headers, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BarRows({ rows }) {
  return (
    <div className="bar-list">
      {rows.map(([label, value]) => (
        <div className="bar-row" key={label}>
          <span>{label}</span>
          <div><i style={{ width: `${value}%` }} /></div>
          <strong>{value}%</strong>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, text }) {
  return (
    <section className="empty-state">
      <Search size={34} />
      <h2>{title}</h2>
      <p>{text}</p>
      <Link className="primary-button" to="/profile">Update profile</Link>
    </section>
  );
}

function LoadingSpinner() {
  return <span className="loading-spinner" role="status" aria-label="Loading" />;
}

function App() {
  return (
    <BrowserRouter>
      <Providers>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
          <Route path="/scholarship/:id" element={<ProtectedRoute><ScholarshipDetailPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
        </Routes>
      </Providers>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<App />);
