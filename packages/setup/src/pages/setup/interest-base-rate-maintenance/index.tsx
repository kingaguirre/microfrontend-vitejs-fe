// packages/setup/src/pages/setup/interest-base-rate-maintenance/index.tsx
import React, { useCallback, useState } from "react";
import ModuleContainer from "../../../components/ModuleContainer";
import {
  Panel,
  Grid,
  GridItem,
  Dropdown,
  FormControl,
  Button,
  Icon,
  DataTable,
} from "react-components-lib.eaa";
import type { ColumnSetting } from "react-components-lib.eaa";

type Row = {
  __internalId: string;
  bookingLocation: string;
  valueDate: string;
  activeStatus: string;
};

/* ---------- stable constants ---------- */
const MODULES = [
  "Product Pricing Standard Rate Sheet (PPS)",
  "Interest Rate Sheet Maintenance",
  "Country Specific Rate Maintenance",
] as const;

const BOOKING_LOCATION_OPTIONS = [
  { text: "HQ - Head Office", value: "HQ" },
  { text: "BR001 - Branch 1", value: "BR001" },
] as const;

const STATUS_OPTIONS = [
  { text: "ACTV - Active", value: "ACTV" },
  { text: "INACT - Inactive", value: "INACT" },
] as const;

const COLUMNS: ColumnSetting[] = [
  { column: "bookingLocation", title: "Booking Location" },
  { column: "valueDate", title: "Value Date" },
  { column: "activeStatus", title: "Active Status" },
];

export default function InterestBaseRateMaintenance() {
  const [activeModule, setActiveModule] = useState(0);

  // filters
  const [bookingLocation, setBookingLocation] = useState<string>("");
  const [valueDate, setValueDate] = useState<string>("");
  const [activeStatus, setActiveStatus] = useState<string>("ACTV");

  // table rows
  const [rows, setRows] = useState<Row[]>([]);

  const onSearch = useCallback(() => {
    if (!bookingLocation || !valueDate) {
      setRows([]);
      return;
    }

    const locText =
      BOOKING_LOCATION_OPTIONS.find((o) => o.value === bookingLocation)?.text ||
      bookingLocation;
    const statusText =
      STATUS_OPTIONS.find((o) => o.value === activeStatus)?.text || activeStatus;

    // demo rows; replace with server data if needed
    setRows([
      {
        __internalId: "r1",
        bookingLocation: locText,
        valueDate,
        activeStatus: statusText,
      },
      {
        __internalId: "r2",
        bookingLocation: locText,
        valueDate,
        activeStatus: statusText,
      },
    ]);
  }, [bookingLocation, valueDate, activeStatus]);

  const onClear = useCallback(() => {
    setBookingLocation("");
    setValueDate("");
    setActiveStatus("ACTV");
    setRows([]);
  }, []);

  return (
    <ModuleContainer
      title="Interest Base Rate Maintenance"
      onBack={() => history.back()}
      showFooter
    >
      <div className="grid grid-cols-12 gap-4">
        {/* left simple module list */}
        <div className="col-span-12 md:col-span-3">
          <div className="border rounded bg-white">
            <div className="px-3 py-2 text-xs font-semibold border-b">MODULE</div>
            {MODULES.map((m, idx) => (
              <button
                key={m}
                className={`w-full text-left px-3 py-2 border-b last:border-b-0 transition-colors ${
                  idx === activeModule ? "bg-blue-50 font-medium" : "hover:bg-gray-50"
                }`}
                onClick={() => setActiveModule(idx)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* right content */}
        <div className="col-span-12 md:col-span-9">
          {/* Filters panel */}
          <Panel title={MODULES[activeModule]} hasShadow={false}>
            <Grid spacing={16}>
              <GridItem xs={12} md={4}>
                <Dropdown
                  required
                  label="Booking Location"
                  placeholder="Select Booking Location"
                  options={BOOKING_LOCATION_OPTIONS as any}
                  value={bookingLocation}
                  onChange={(v: string | string[] | null) =>
                    setBookingLocation(Array.isArray(v) ? (v[0] ?? "") : (v ?? ""))
                  }
                  clearable
                />
              </GridItem>

              <GridItem xs={12} md={4}>
                <FormControl
                  required
                  label="Value Date"
                  type="date"
                  value={valueDate}
                  onChange={(e: any) => setValueDate(e?.target?.value ?? "")}
                  placeholder="YYYY-MM-DD"
                />
              </GridItem>

              <GridItem xs={12} md={4}>
                <Dropdown
                  required
                  label="Active Status"
                  placeholder="Select Status"
                  options={STATUS_OPTIONS as any}
                  value={activeStatus}
                  onChange={(v: string | string[] | null) =>
                    setActiveStatus(Array.isArray(v) ? (v[0] ?? "") : (v ?? ""))
                  }
                />
              </GridItem>

              <GridItem xs={12}>
                <div className="flex items-center justify-end gap-3">
                  <Button className="px-4" onClick={onSearch}>
                    <span className="inline-flex items-center gap-2">
                      Search <Icon icon="search" size={16} />
                    </span>
                  </Button>
                  <Button variant="outlined" className="px-4" onClick={onClear}>
                    Clear
                  </Button>
                </div>
              </GridItem>
            </Grid>
          </Panel>

          {/* Results panel */}
          <Panel title="Enquirer Catalog" hasShadow={false}>
            <DataTable
              columnSettings={COLUMNS}
              dataSource={rows}
            />
          </Panel>
        </div>
      </div>
    </ModuleContainer>
  );
}
