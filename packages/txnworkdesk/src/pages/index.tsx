// packages/setup/src/pages/txn-work-desk/index.tsx
import { useMemo, useState } from "react";
import {
  DataTable,
  Icon,
  theme,
  Tooltip,
  Button,
} from "react-components-lib.eaa";
import type { ColumnSetting, HeaderRightElement } from "react-components-lib.eaa";

/* ---------------------- export util (CSV/XLSX) ---------------------- */
export type ExportColumn = { column: string; title: string };
type ExportOpts = { fileName?: string; format?: "xlsx" | "csv"; sheetName?: string };

export async function exportRows(
  rows: any[],
  columns: ExportColumn[],
  opts: ExportOpts = {}
): Promise<void> {
  const fileName = (opts.fileName || "export").trim() || "export";
  const format = opts.format || "xlsx";
  const sheetName = opts.sheetName || "Data";

  const header = columns.map((c) => c.title);
  const body = (Array.isArray(rows) ? rows : []).map((r) =>
    columns.map((c) => {
      const v = (r as any)?.[c.column];
      if (Array.isArray(v)) return v.map((x) => (x == null ? "" : String(x))).join(",");
      if (v == null) return "";
      return v instanceof Date ? v.toISOString() : v;
    })
  );
  const aoa: any[][] = [header, ...body];

  const safeBase = fileName.replace(/\.(xlsx|csv)$/i, "");
  const triggerBlobDownload = (blob: Blob, ext: "xlsx" | "csv") => {
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `${safeBase}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (format === "csv") {
    const escapeCSV = (val: any) => {
      const s = val == null ? "" : String(val);
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const csv = aoa.map((row) => row.map(escapeCSV).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    triggerBlobDownload(blob, "csv");
    return;
  }

  const getExcelJS = async () => {
    try {
      const mod = await import(/* @vite-ignore */ "exceljs");
      return (mod as any).default ?? (mod as any);
    } catch {
      const g = (window as any)?.ExcelJS;
      if (g) return g;
      throw new Error("ExcelJS not found. Install 'exceljs' or expose window.ExcelJS before calling exportRows.");
    }
  };

  const ExcelJS = await getExcelJS();
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);
  ws.addRows(aoa);

  const buf: ArrayBuffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  triggerBlobDownload(blob, "xlsx");
}
/* -------------------------------------------------------------------- */

/* ---------- types ---------- */
type Row = {
  arn: string;
  trn: string;
  customer: string;
  counterparty: string;
  product: string;
  step: string;
  subStep: string;
  lockedBy: string;
  stage: string;
  lli: string | null;
  aml: string | null;
  snc: string | null;
  clbk: string | null;
  cocoa: string | null;
  tdOpsApproval: string | null; // keep "NULL" neutral for this one
  customerRef: string;
  submissionMode: "TNG" | "EML" | "OTC";
  regDate: string;
  relDate: string;
  segment: string;
  subSegment: string;
  splitId: string;
};

const TOTAL = 3835;
const TABLE_HEIGHT = "calc(100vh - 212px)";

/* ---------- helpers ---------- */
const fmtDate = (date: Date) =>
  date
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

/** non-periodic 4-token generator using a tiny LCG hash */
const TOKENS = ["ZEKE", "BOLT", "ECHO", "RISK", "Null"] as const;
const tokenForIndex = (i: number) => {
  let x = (i >>> 0) + 0x9e3779b9;          // mix
  x = (x ^ (x >>> 16)) * 0x7feb352d;
  x = (x ^ (x >>> 15)) * 0x846ca68b;
  x = x ^ (x >>> 16);
  return TOKENS[Math.abs(x) & 3];          // 0..3 non-periodic wrt page size
};

// Map token -> semantic color
const STATUS_WORD_TO_COLOR: Record<(typeof TOKENS)[number], "success" | "warning" | "info" | "danger" | "default"> = {
  ZEKE: "success",
  BOLT: "warning",
  ECHO: "info",
  RISK: "danger",
  Null: "default",
};

// color palettes (fallbacks included)
const PILL_PALETTES = {
  neutral: {
    bg: theme.colors?.default?.pale ?? "#F1F2F4",
    fg: theme.colors?.default?.darker ?? "#374151",
    tip: "default" as const,
  },
  success: { bg: theme.colors.success.pale, fg: theme.colors.success.darker, tip: "success" as const },
  warning: { bg: theme.colors.warning.pale, fg: theme.colors.warning.darker, tip: "warning" as const },
  info:    { bg: theme.colors.info?.pale ?? theme.colors.primary.pale, fg: theme.colors.info?.darker ?? theme.colors.primary.darker, tip: "info" as const },
  danger:  { bg: theme.colors.danger.pale, fg: theme.colors.danger.darker, tip: "danger" as const },
  default:  { bg: theme.colors.default.pale, fg: theme.colors.default.darker, tip: "default" as const },
} as const;

// Show actual token (or "NULL") and match tooltip color to pill color
function pillEl(value: string | null) {
  const token = String(value ?? "").toUpperCase();
  const label = token || "NULL";

  const colorKey =
    (STATUS_WORD_TO_COLOR[token as keyof typeof STATUS_WORD_TO_COLOR] as keyof typeof PILL_PALETTES) ??
    "neutral";
  const palette = PILL_PALETTES[colorKey];

  return (
    <Tooltip content={label} color={palette.tip as any}>
      <div
        className="w-full text-center block"
        style={{
          background: palette.bg,
          color: palette.fg,
          fontSize: 11,
          lineHeight: "20px",
          padding: "0 6px",
          borderRadius: 0,       // no radius
          border: "none",        // no border
          width: "100%",
        }}
      >
        {label}
      </div>
    </Tooltip>
  );
}

/* ---------- main ---------- */
export default function TxnWorkDesk() {
  // header controls
  const [trnSearch, setTrnSearch] = useState("");
  const [hideAcr, setHideAcr] = useState(false);
  const [savedFilter, setSavedFilter] = useState<string>("");

  // columns — keep COMPLIANCE STATUS physically after “Stage” (no `order`)
  const columns: ColumnSetting[] = useMemo(
    () => [
      { column: "arn", title: "ARN #", minWidth: 120, pin: "pin", filter: { type: "text" } },

      {
        column: "trn",
        title: "TRN #",
        minWidth: 180,
        pin: "pin",
        cell: ({ rowValue }: any) => (
          <a
            className="underline decoration-dotted hover:opacity-80"
            style={{ color: theme.colors.primary.base }}
          >
            {rowValue.trn}
          </a>
        ),
      },

      { column: "customer", title: "CUSTOMER", minWidth: 280 },

      {
        column: "counterparty",
        title: "COUNTERPARTY",
        minWidth: 160,
        cell: ({ rowValue }: any) => <span className="truncate block">{rowValue.counterparty}</span>,
      },

      { column: "product", title: "PRODUCT", minWidth: 80 },

      {
        column: "step",
        title: "STEP",
        minWidth: 100,
        cell: ({ rowValue }: any) => (
          <a className="underline decoration-dotted hover:opacity-80" style={{ color: theme.colors.primary.base }}>
            {rowValue.step}
          </a>
        ),
      },

      { column: "subStep", title: "SUB STEP", minWidth: 110 },
      { column: "lockedBy", title: "LOCKED BY", minWidth: 110 },

      {
        column: "stage",
        title: "STAGE",
        minWidth: 260,
        cell: ({ rowValue }: any) => (
          <div className="flex items-center gap-2">
            <span className="truncate">{rowValue.stage}</span>
            <Icon icon="arrow_right_alt" size={16} />
          </div>
        ),
      },

      // --- COMPLIANCE STATUS block (after stage) ---
      {
        groupTitle: "COMPLIANCE STATUS",
        column: "lli",
        title: "LLI",
        width: 75,
        draggable: false,
        headerAlign: "center",
        align: "center",
        cell: ({ rowValue }: any) => pillEl(rowValue.lli),
      },
      {
        groupTitle: "COMPLIANCE STATUS",
        column: "aml",
        title: "AML",
        width: 75,
        draggable: false,
        headerAlign: "center",
        align: "center",
        cell: ({ rowValue }: any) => pillEl(rowValue.aml),
      },
      {
        groupTitle: "COMPLIANCE STATUS",
        column: "snc",
        title: "SNC",
        width: 75,
        draggable: false,
        headerAlign: "center",
        align: "center",
        cell: ({ rowValue }: any) => pillEl(rowValue.snc),
      },
      {
        groupTitle: "COMPLIANCE STATUS",
        column: "clbk",
        title: "CLBK",
        width: 80,
        draggable: false,
        headerAlign: "center",
        align: "center",
        cell: ({ rowValue }: any) => pillEl(rowValue.clbk),
      },
      {
        groupTitle: "COMPLIANCE STATUS",
        column: "cocoa",
        title: "COCOA",
        width: 90,
        draggable: false,
        headerAlign: "center",
        align: "center",
        cell: ({ rowValue }: any) => pillEl(rowValue.cocoa),
      },
      {
        groupTitle: "COMPLIANCE STATUS",
        column: "tdOpsApproval",
        title: "TD OPS APPROVAL",
        width: 155,
        draggable: false,
        headerAlign: "center",
        align: "center",
        cell: ({ rowValue }: any) => pillEl(rowValue.tdOpsApproval),
      },

      // trailing columns
      { column: "customerRef", title: "CUSTOMER REFERENCE", minWidth: 200 },
      { column: "submissionMode", title: "SUBMISSION MODE", minWidth: 140 },
      { column: "regDate", title: "REG. DATE", minWidth: 160 },
      { column: "relDate", title: "REL. DATE", minWidth: 160 },
      { column: "segment", title: "SEGMENT", width: 90, align: "center" },
      { column: "subSegment", title: "SUB SEGMENT", width: 120, align: "center" },
      { column: "splitId", title: "SPLIT ID", width: 100, align: "right" },

      {
        column: "__actions",
        title: "",
        width: 110,
        align: "center",
        cell: () => (
          <Button color="default" disabled size="sm">
            Action
          </Button>
        ),
      },
    ],
    []
  );

  // full dataset (deterministic but non-periodic token assignment)
  const DB = useMemo<Row[]>(() => {
    const customers = [
      "100006898 - TXOPT TESTING LONG NAME COMPANY LTD",
      "100009999 - SAMPLE INDUSTRIES PTE LTD",
      "100001111 - DEMO GROUP HOLDINGS",
    ];
    const counterparties = ["PHARMA MED", "100502577 - TEST", "NG-Adaptor-IIF6"];
    const products = ["EIF", "IIF", "SUF"];
    const stages = [
      "EXEMK - Exception Handling Maker",
      "PRINP - Processing In-Progress",
      "TXPMK - Transaction Pending Maker",
      "PPRMK - Pre Processing Maker",
    ];
    const submission = ["TNG", "EML", "OTC"] as const;

    const base = new Date("2025-06-06T07:30:00Z").getTime();

    const rows: Row[] = [];
    for (let i = 0; i < TOTAL; i++) {
      const d1 = new Date(base + i * 37 * 60_000);
      const d2 = new Date(base + i * 59 * 60_000);

      rows.push({
        arn: String(25109426 + i),
        trn: `SPBTR25RFC${String(3129 + i).padStart(6, "0")}`,
        customer: customers[i % customers.length],
        counterparty: counterparties[i % counterparties.length],
        product: products[i % products.length],
        step: "NEW001",
        subStep: "DRFF",
        lockedBy: String(1201231 + (i % 9999)),
        stage: stages[i % stages.length],
        lli: tokenForIndex(i + 0),
        aml: tokenForIndex(i + 1),
        snc: tokenForIndex(i + 2),
        clbk: tokenForIndex(i + 3),
        cocoa: tokenForIndex(i + 4),
        tdOpsApproval: "NULL", // keep this neutral
        customerRef: i % 11 === 0 ? "NG-Adaptor-IIF6" : "NG-STPAdaptor-EIF",
        submissionMode: submission[i % submission.length],
        regDate: fmtDate(d1),
        relDate: fmtDate(d2),
        segment: "ME",
        subSegment: "03",
        splitId: String(251 + (i % 9)),
      });
    }
    return rows;
  }, []);

  // simulated server fetcher — REAL filtering before paging
  const server = useMemo(
    () => ({
      debounceMs: 300,
      fetcher: async ({
        pageIndex,
        pageSize,
        sorting,
        columnFilters,
        globalFilter,
      }: {
        pageIndex: number;
        pageSize: number;
        sorting: { id: string; desc: boolean }[];
        columnFilters: { id: string; value: unknown; filterBy?: string }[];
        globalFilter: string;
      }) => {
        let rows = DB;

        // header controls
        if (hideAcr) {
          // Example: remove ~15% deterministically
          rows = rows.filter((_, i) => i % 7 !== 0);
        }
        if (savedFilter === "MKIP") {
          rows = rows.filter((r) => /In-Progress/i.test(r.stage));
        } else if (savedFilter === "LOCKED_ME") {
          rows = rows.filter((_, i) => i % 5 === 0);
        }

        // DataTable global filter
        if (globalFilter?.trim()) {
          const q = globalFilter.toLowerCase();
          rows = rows.filter((r) =>
            Object.values(r).some((v) => String(v).toLowerCase().includes(q)),
          );
        }

        // Column filters (includesString / includesStringSensitive)
        for (const f of columnFilters || []) {
          const id = String(f.id);
          const raw = (f as any).value;
          if (raw == null || raw === "") continue;
          const mode = (f as any).filterBy ?? "includesString";
          rows = rows.filter((r) => {
            const cell = String((r as any)[id] ?? "");
            if (mode === "includesStringSensitive") {
              return cell.includes(String(raw));
            }
            return cell.toLowerCase().includes(String(raw).toLowerCase());
          });
        }

        // extra TRN search (header control)
        if (trnSearch.trim()) {
          const needle = trnSearch.trim().toLowerCase();
          rows = rows.filter((r) => r.trn.toLowerCase().includes(needle));
        }

        // sorting (first key)
        if (sorting?.length) {
          const { id, desc } = sorting[0]!;
          rows = [...rows].sort((a: any, b: any) => {
            const va = a[id];
            const vb = b[id];
            // numeric-ish?
            const na = Number(va);
            const nb = Number(vb);
            let cmp: number;
            if (!Number.isNaN(na) && !Number.isNaN(nb)) cmp = na - nb;
            else cmp = String(va).localeCompare(String(vb));
            return desc ? -cmp : cmp;
          });
        }

        // paginate
        const total = rows.length;
        const start = pageIndex * pageSize;
        const page = rows.slice(start, Math.min(total, start + pageSize));

        return { rows: page, total };
      },
    }),
    [DB, trnSearch, hideAcr, savedFilter],
  );

  // server-download (ALL) honoring header controls & filters
  const downloadControls = useMemo(
    () => ({
      fileName: "txn_work_desk",
      format: "xlsx" as const,
      showConfigSection: true,
      showBuiltinAll: false,
      showBuiltinSelected: false,
      extraMenuItems: [
        {
          key: "server-all",
          icon: "cloud_download",
          label: "Download ALL from server",
          onClick: async ({
            fileName,
            format,
          }: {
            fileName: string;
            format: "xlsx" | "csv";
          }) => {
            // Reuse the same filtering logic as fetcher (minus paging)
            let rows = DB;

            if (hideAcr) rows = rows.filter((_, i) => i % 7 !== 0);
            if (savedFilter === "MKIP") rows = rows.filter((r) => /In-Progress/i.test(r.stage));
            else if (savedFilter === "LOCKED_ME") rows = rows.filter((_, i) => i % 5 === 0);

            if (trnSearch.trim()) {
              const q = trnSearch.toLowerCase();
              rows = rows.filter((r) => r.trn.toLowerCase().includes(q));
            }

            await exportRows(rows, columns as any, { fileName, format });
          },
        },
      ],
    }),
    [columns, DB, trnSearch, hideAcr, savedFilter]
  );

  const headerRightElements: HeaderRightElement[] = [
    {
      type: "text",
      placeholder: "Search TRN #",
      width: 260,
      value: trnSearch,
      onChange: (e: any) => setTrnSearch(e?.target?.value ?? ""),
      iconRight: [{ icon: "search" }],
    },
    {
      type: "checkbox",
      text: "Hide ACR Steps",
      checked: hideAcr,
      onChange: (e: any) => setHideAcr(!!e?.target?.checked),
    },
    {
      type: "dropdown",
      width: 220,
      placeholder: "Select saved filter",
      options: [
        { text: "— None —", value: "" },
        { text: "Maker in-progress", value: "MKIP" },
        { text: "Locked by me", value: "LOCKED_ME" },
      ],
      value: savedFilter,
      onChange: (v: string | string[] | null) =>
        setSavedFilter(Array.isArray(v) ? (v[0] ?? "") : (v ?? "")),
      clearable: true,
    },
    {
      type: "button",
      text: "Clear",
      variant: "outlined",
      onClick: () => {
        setTrnSearch("");
        setHideAcr(false);
        setSavedFilter("");
      },
    },
  ];

  return (
    <div className="w-full h-full bg-gray-100 rounded-[2px]">
      {/* Title header */}
      <div className="bg-white border border-gray-200 px-4 py-2">
        <div className="text-md font-semibold" style={{ color: theme.colors.primary.darker }}>
          Transaction Work Desk
        </div>
      </div>

      <div className="p-3">
        <DataTable
          serverMode
          server={server as any}
          columnSettings={columns}
          height={TABLE_HEIGHT}
          enableGlobalFiltering
          enableDownload
          downloadControls={downloadControls}
          headerRightElements={headerRightElements}
          pageSize={20}
        />
      </div>
    </div>
  );
}
