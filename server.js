// server.js
// Run: npm i express cors && node server.js
// Env knobs: DELAY_MS=400 DELAY_JITTER=200 PORT=4000

import express from "express";
import cors from "cors";

const PORT = Number(process.env.PORT ?? 4000);
const BASE_DELAY = Number.isFinite(Number(process.env.DELAY_MS)) ? Number(process.env.DELAY_MS) : 100;
const JITTER = Number.isFinite(Number(process.env.DELAY_JITTER)) ? Number(process.env.DELAY_JITTER) : 50;

const app = express();
app.use(cors());
app.use(express.json());

// ---------- delay middleware ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
app.use(async (req, _res, next) => {
  if (req.path === "/health") return next();
  const qd = Number(req.query.__delay);
  const override = Number.isFinite(qd) ? Math.max(0, qd) : null;
  const rnd = Math.floor(Math.random() * (JITTER * 2 + 1)) - JITTER;
  const delay = override ?? Math.max(0, BASE_DELAY + rnd);
  if (delay > 0) await sleep(delay);
  next();
});

app.get("/health", (_req, res) => res.json({ ok: true }));

// ---------- data generation (4,934 rows) ----------
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20250921);

const BANKS = [
  "Standard Chartered Bank (Singapore) Ltd",
  "SCB Malaysia Berhad",
  "SCB Hong Kong Ltd",
];
const STAGES = [
  "SPLCP - Split Completed",
  "SPLIN - Split Initiated",
  "APRV - Approved",
  "EXEMK - Exception Handling Maker",
  "PRINP - Processing In-Progress",
  "TXPMK - Transaction Pending Maker",
  "PPRMK - Pre Processing Maker",
];
const SUBMISSION = ["EML", "TNG", "OTC"];
const PRODUCTS = ["EIF", "IIF", "SUF"];
const CUSTOMERS = [
  "100006898 - TXOPT TESTING LONG NAME COMPANY LTD",
  "100009999 - SAMPLE INDUSTRIES PTE LTD",
  "100001111 - DEMO GROUP HOLDINGS",
];
const CNTP = ["PHARMA MED", "100502577 - TEST", "NG-Adaptor-IIF6"];

const TOKENS = ["ZEKE", "BOLT", "ECHO", "RISK"];
const tokenForIndex = (i) => TOKENS[i % TOKENS.length];

const ROWS = [];
const N = 4934;
const base = Date.parse("2025-06-06T07:30:00Z");

const fmt = (ms) =>
  new Date(ms)
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    })
    .replace(", ", ", ");

for (let i = 0; i < N; i++) {
  const receivedAtMs = base + i * 57 * 60_000;
  const regMs = base + i * 37 * 60_000;
  const relMs = base + i * 59 * 60_000;

  ROWS.push({
    id: i + 1,

    // Common keys used by Ack
    arn: String(2_500_000 + i),
    bookingLocation: BANKS[i % BANKS.length],
    workflowStage: STAGES[i % STAGES.length],
    submissionMode: SUBMISSION[i % SUBMISSION.length],
    receivedAt: fmt(receivedAtMs),
    __receivedAtMs: receivedAtMs,
    generatedBy: "System",

    // Extra keys used by Txn
    trn: `SPBTR25RFC${String(3129 + i).padStart(6, "0")}`,
    customer: CUSTOMERS[i % CUSTOMERS.length],
    counterparty: CNTP[i % CNTP.length],
    product: PRODUCTS[i % PRODUCTS.length],
    step: "NEW001",
    subStep: "DRFF",
    lockedBy: String(1201231 + (i % 9999)),
    stage: STAGES[(i + 3) % STAGES.length],
    lli: tokenForIndex(i + 0),
    aml: tokenForIndex(i + 1),
    snc: tokenForIndex(i + 2),
    clbk: tokenForIndex(i + 3),
    cocoa: tokenForIndex(i + 4),
    tdOpsApproval: "NULL",
    customerRef: i % 11 === 0 ? "NG-Adaptor-IIF6" : "NG-STPAdaptor-EIF",
    regDate: fmt(regMs),
    relDate: fmt(relMs),
    segment: "ME",
    subSegment: "03",
    splitId: String(251 + (i % 9)),
  });
}

// ---------- helpers ----------
function cmp(a, b, order) {
  const dir = order === "desc" ? -1 : 1;
  if (a == null && b == null) return 0;
  if (a == null) return -1 * dir;
  if (b == null) return 1 * dir;
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return (na - nb) * dir;
  return String(a).localeCompare(String(b)) * dir;
}

function matchesGlobal(row, q) {
  if (!q) return true;
  const s = String(q).toLowerCase();
  return Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(s));
}

function applyColumnFilters(rows, filtersJson) {
  if (!filtersJson) return rows;
  let filters = [];
  try {
    filters = JSON.parse(String(filtersJson));
  } catch {}
  if (!Array.isArray(filters)) return rows;
  let out = rows;
  for (const f of filters) {
    const id = String(f.id ?? "");
    const raw = f.value;
    const mode = f.filterBy || "includesString";
    if (raw == null || raw === "") continue;
    out = out.filter((r) => {
      const cell = String(r[id] ?? "");
      if (mode === "includesStringSensitive") {
        return cell.includes(String(raw));
      }
      return cell.toLowerCase().includes(String(raw).toLowerCase());
    });
  }
  return out;
}

function deriveStatus(row) {
  return /Initiated/i.test(row.workflowStage) ? "PENDING" : "REGISTERED";
}

// ---------- Txn helpers for Header & General ----------
const BOOK_CODE_BY_NAME = {
  "Standard Chartered Bank (Singapore) Ltd": "SG01",
  "SCB Malaysia Berhad": "MY01",
  "SCB Hong Kong Ltd": "HK01",
};

const PRODUCT_LONG_NAME = {
  EIF: "Export Invoice Financing",
  IIF: "Import Invoice Financing",
  SUF: "Supply Chain / Shipping Under Finance",
};

const SUBMISSION_LABEL = {
  TNG: "TNG - Trade Nextgen",
  EML: "EML - Email",
  OTC: "OTC - Over the Counter",
};

function findByTrn(trn) {
  return ROWS.find((r) => String(r.trn) === String(trn));
}
function findById(id) {
  const num = Number(id);
  if (!Number.isFinite(num)) return undefined;
  return ROWS.find((r) => r.id === num);
}

function digitsFromCustomer(customer) {
  const m = String(customer).match(/\d+/);
  return m ? m[0] : "000000000";
}

function buildHeader(row) {
  return {
    trn: row.trn,
    product: row.product,
    step: row.step,
    subStep: row.subStep,
    client: row.customer,
    bookingLocation: BOOK_CODE_BY_NAME[row.bookingLocation] || "SG01", // compact code
    bookingLocationName: row.bookingLocation, // full name if needed
  };
}

function buildGeneral(row, indexSeed = 0) {
  const custDigits = digitsFromCustomer(row.customer);
  const btcId = `SG01${custDigits}${row.product}0101`;
  const valueDate = row.relDate; // reuse release date for demo

  return {
    ackNumber: Number(row.arn),
    submissionMode: SUBMISSION_LABEL[row.submissionMode] || row.submissionMode,
    btcId,
    limitGroupId: "1 - GTF-Default",
    financeType: `${row.product} - ${PRODUCT_LONG_NAME[row.product] || "—"}`,
    productGroup: "RF - Receivable finance",
    valueDateOption: "PD - PROCESSING DATE",
    valueDate,
    summaryListing: "SML01 - Allowed",
    submissionBranch: BOOK_CODE_BY_NAME[row.bookingLocation] || "SG01",
    clientReference: row.customerRef,
    isIslamicTransaction: row.product === "IIF" ? (indexSeed % 5 === 0) : false,
    reviewFlag: indexSeed % 7 === 0,
    almApprovalReceived: indexSeed % 9 === 0,
    emailIndemnityHeld: indexSeed % 6 === 0 ? "Required" : "Not Required",
    clientRemarks: "",
    signatureVerified: indexSeed % 8 === 0,
    counterparty: row.counterparty,
  };
}

// ---------- Txn Exceptions helpers ----------
const EXC_DEPTS = ["Operations", "Compliance", "Credit Control", "Trade Services", "Front Office"];
const EXC_CODES = ["E001", "E014", "E027", "E042", "E055", "E063", "E078"];

function buildExceptions(row) {
  // deterministic 0–3 exceptions per txn
  const r = mulberry32(100000 + row.id * 13);
  const count = Math.floor(r() * 4);
  const out = [];
  for (let i = 0; i < count; i++) {
    const code = EXC_CODES[Math.floor(r() * EXC_CODES.length)];
    const dept = EXC_DEPTS[Math.floor(r() * EXC_DEPTS.length)];
    out.push({
      id: `${row.id}-${i + 1}`,
      code,
      description: `Auto-generated exception ${code} for TRN ${row.trn}`,
      department: dept,
    });
  }
  return out;
}

function paginateAndFilter(list, { q = "", limit = 20, skip = 0, sortBy, order = "asc", filters }) {
  let rows = list.slice();
  rows = rows.filter((r) => matchesGlobal(r, q));
  rows = applyColumnFilters(rows, filters);
  if (sortBy) rows = rows.slice().sort((a, b) => cmp(a[String(sortBy)], b[String(sortBy)], order));
  const total = rows.length;
  const off = Number(skip);
  const lim = Number(limit);
  const page = lim > 0 ? rows.slice(off, off + lim) : rows.slice();
  return { rows: page, total };
}

// ---------- NEW: attach exceptions onto each ROW (single table) ----------
for (const r of ROWS) {
  r.exceptions = buildExceptions(r);
}

// ---------- routes ----------
// GET /workdesk/search?q=&limit=&skip=&sortBy=&order=&filters=&status=&trnSearch=&hideAcr=&savedFilter=
app.get("/workdesk/search", (req, res) => {
  let {
    q = "",
    limit = 30,
    skip = 0,
    sortBy,
    order = "asc",
    filters,
    status,
    trnSearch = "",
    hideAcr = "",
    savedFilter = "",
  } = req.query;

  let rows = ROWS.slice();

  const statusStr = typeof status === "string" ? status.trim().toUpperCase() : "";
  if (statusStr && statusStr !== "ALL") {
    rows = rows.filter((r) => deriveStatus(r) === statusStr);
  }
  if (String(trnSearch).trim()) {
    const needle = String(trnSearch).toLowerCase();
    rows = rows.filter((r) => String(r.trn).toLowerCase().includes(needle));
  }
  if (String(hideAcr) === "true") {
    rows = rows.filter((_, i) => i % 7 !== 0);
  }
  if (String(savedFilter).toUpperCase() === "MKIP") {
    rows = rows.filter((r) => /In-Progress/i.test(r.stage));
  } else if (String(savedFilter).toUpperCase() === "LOCKED_ME") {
    rows = rows.filter((_, i) => i % 5 === 0);
  }

  rows = rows.filter((r) => matchesGlobal(r, q));
  rows = applyColumnFilters(rows, filters);

  if (sortBy) {
    const id = String(sortBy);
    rows = rows.slice().sort((a, b) => {
      if (id === "receivedAt") {
        return cmp(a.__receivedAtMs, b.__receivedAtMs, order);
      }
      return cmp(a[id], b[id], order);
    });
  }

  const total = rows.length;
  const off = Number(skip);
  const lim = Number(limit);
  const page = lim > 0 ? rows.slice(off, off + lim) : rows.slice();

  res.json({ rows: page, total });
});

// CRUD (existing)
// GET /workdesk/:id
app.get("/workdesk/:id", (req, res) => {
  const id = Number(req.params.id);
  const row = ROWS.find((r) => r.id === id);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

// PATCH /workdesk/:id
app.patch("/workdesk/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = ROWS.findIndex((r) => r.id === id);
  if (idx < 0) return res.status(404).json({ error: "Not found" });
  ROWS[idx] = { ...ROWS[idx], ...req.body };
  res.json(ROWS[idx]);
});

// POST /workdesk
app.post("/workdesk", (req, res) => {
  const id = ROWS.length ? ROWS[ROWS.length - 1].id + 1 : 1;
  const now = Date.now();

  const row = {
    id,
    arn: String(2_500_000 + id),
    bookingLocation: BANKS[id % BANKS.length],
    workflowStage: STAGES[id % STAGES.length],
    submissionMode: SUBMISSION[id % SUBMISSION.length],
    receivedAt: fmt(now),
    __receivedAtMs: now,
    generatedBy: "System",

    trn: req.body?.trn ?? `SPBTR25RFC${String(3129 + id).padStart(6, "0")}`,
    customer: req.body?.customer ?? CUSTOMERS[id % CUSTOMERS.length],
    counterparty: CNTP[id % CNTP.length],
    product: PRODUCTS[id % PRODUCTS.length],
    step: "NEW001",
    subStep: "DRFF",
    lockedBy: String(1201231 + (id % 9999)),
    stage: STAGES[(id + 3) % STAGES.length],
    lli: tokenForIndex(id + 0),
    aml: tokenForIndex(id + 1),
    snc: tokenForIndex(id + 2),
    clbk: tokenForIndex(id + 3),
    cocoa: tokenForIndex(id + 4),
    tdOpsApproval: "NULL",
    customerRef: id % 11 === 0 ? "NG-Adaptor-IIF6" : "NG-STPAdaptor-EIF",
    regDate: fmt(now),
    relDate: fmt(now + 3600_000),
    segment: "ME",
    subSegment: "03",
    splitId: String(251 + (id % 9)),
  };
  row.exceptions = buildExceptions(row);

  ROWS.push(row);
  res.status(201).json(row);
});

// DELETE /workdesk/:id
app.delete("/workdesk/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = ROWS.findIndex((r) => r.id === id);
  if (idx < 0) return res.status(404).json({ error: "Not found" });
  ROWS.splice(idx, 1);
  res.json({ ok: true });
});

// PATCH /workdesk/ack/booking-location
app.patch("/workdesk/ack/booking-location", (req, res) => {
  const { arn, bookingLocation } = req.body || {};
  if (!arn) return res.status(400).json({ error: "arn required" });

  const idx = ROWS.findIndex((r) => String(r.arn) === String(arn));
  if (idx < 0) return res.status(404).json({ error: "Not found" });

  ROWS[idx] = { ...ROWS[idx], bookingLocation };
  return res.json({ ok: true, row: ROWS[idx] });
});

// ---------- NEW: Txn Details (Header & General) ----------
// Get header by TRN
// GET /txn/:trn/header
app.get("/txn/:trn/header", (req, res) => {
  const row = findByTrn(req.params.trn);
  if (!row) return res.status(404).json({ error: "Not found" });
  return res.json(buildHeader(row));
});

// Get general details by TRN
// GET /txn/:trn/general
app.get("/txn/:trn/general", (req, res) => {
  const row = findByTrn(req.params.trn);
  if (!row) return res.status(404).json({ error: "Not found" });
  // use id as seed to vary booleans deterministically
  return res.json(buildGeneral(row, row.id));
});

// (Optional) id-based mirrors if you prefer /txn/id/*
// GET /txn/id/:id/header
app.get("/txn/id/:id/header", (req, res) => {
  const row = findById(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  return res.json(buildHeader(row));
});
// GET /txn/id/:id/general
app.get("/txn/id/:id/general", (req, res) => {
  const row = findById(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  return res.json(buildGeneral(row, row.id));
});

// ---------- Exceptions endpoints (read from row.exceptions) ----------
app.get("/txn/:trn/exceptions", (req, res) => {
  const row = findByTrn(req.params.trn);
  if (!row) return res.status(404).json({ error: "Not found" });
  return res.json(paginateAndFilter(row.exceptions ?? [], req.query));
});

app.get("/txn/id/:id/exceptions", (req, res) => {
  const row = findById(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  return res.json(paginateAndFilter(row.exceptions ?? [], req.query));
});

app.listen(PORT, () => {
  console.log(`Local API http://localhost:${PORT}  (delay ~${BASE_DELAY}ms ± ${JITTER}ms)`);
});
