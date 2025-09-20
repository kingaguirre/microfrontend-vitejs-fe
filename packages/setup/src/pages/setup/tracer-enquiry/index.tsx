// packages/setup/src/pages/setup/tracer-enquiry/index.tsx
import React, { useMemo, useState } from "react";
import ModuleContainer from "../../../components/ModuleContainer";
import {
  Grid,
  GridItem,
  Dropdown,
  FormControl,
  Button,
  Icon,
  FormRenderer,
  DataTable,
  Panel
} from "react-components-lib.eaa";
import type { ColumnSetting, SettingsItem } from "react-components-lib.eaa";

type TopRow = {
  __internalId: string;
  bookingLocation: string;
  product: string;
  templateType: string;
  islamicIndicator: string; // "Yes" | "No"
  followUpType: string;
  daysFromEvent: string;
  eventInfo: string;
  templateId: string;
};

type BottomRow = {
  __internalId: string;
  startTracer: string;
  endTracer: string;
  frequencyFromPrev: string;
  templateId: string;
};

export default function TracerEnquiry() {
  // ---------- Filters ----------
  const [bookingLocation, setBookingLocation] = useState("");
  const [product, setProduct] = useState("");
  const [followUpType, setFollowUpType] = useState("");
  const [templateType, setTemplateType] = useState("");
  const [templateId, setTemplateId] = useState("");

  const bookingLocationOptions = useMemo(
    () => [
      { text: "HQ - Head Office", value: "HQ" },
      { text: "BR001 - Branch 1", value: "BR001" },
    ],
    []
  );
  const productOptions = useMemo(
    () => [
      { text: "Loan", value: "LOAN" },
      { text: "Deposit", value: "DEP" },
    ],
    []
  );
  const followUpOptions = useMemo(
    () => [
      { text: "Reminder", value: "REM" },
      { text: "Escalation", value: "ESC" },
    ],
    []
  );

  // ---------- Data for renderer / table ----------
  const [data, setData] = useState<Record<string, any>>({
    topRows: [] as TopRow[],
    bottomRows: [] as BottomRow[],
    dBookingLocation: "",
    dProduct: "",
    dTemplateType: "",
    dIslamic: false,
    dFollowUpType: "",
    dDaysFromEvent: "",
    dTemplateId: "",
  });

  // ---------- Columns ----------
  const topCols: ColumnSetting[] = useMemo(
    () => [
      { column: "bookingLocation", title: "Booking Location" },
      { column: "product", title: "Product" },
      { column: "templateType", title: "Template Type" },
      { column: "islamicIndicator", title: "Islamic Indicator" },
      { column: "followUpType", title: "Follow-up Type" },
      { column: "daysFromEvent", title: "Days From Event Date" },
      { column: "eventInfo", title: "Event Info" },
      { column: "templateId", title: "Template ID" },
    ],
    []
  );

  const bottomCols: ColumnSetting[] = useMemo(
    () => [
      { column: "startTracer", title: "Start Tracer" },
      { column: "endTracer", title: "End Tracer" },
      {
        column: "frequencyFromPrev",
        title: "Frequency From Previous Followup Number",
      },
      { column: "templateId", title: "Template ID" },
    ],
    []
  );

  // ---------- FormRenderer config (middle table + details) ----------
  const fieldSettings: SettingsItem[] = useMemo(
    () => [
      {
        dataTable: {
          // (no header bar here — matches the reference UI)
          config: { dataSource: "topRows", columnSettings: topCols },
          fields: [
            {
              name: "dBookingLocation",
              label: "Booking Location",
              type: "text",
              placeholder: "Select Booking Option",
              disabled: true,
              col: { md: 3 },
            },
            {
              name: "dProduct",
              label: "Product",
              type: "text",
              placeholder: "Select Product",
              disabled: true,
              col: { md: 3 },
            },
            {
              name: "dTemplateType",
              label: "Template Type",
              type: "text",
              placeholder: "Enter Template Type",
              disabled: true,
              col: { md: 3 },
            },
            {
              name: "dIslamic",
              label: "Islamic Indicator",
              type: "checkbox",
              disabled: true,
              col: { md: 3 },
            },
            {
              name: "dFollowUpType",
              label: "Follow-up Type",
              type: "text",
              placeholder: "Select Follow-up Type",
              disabled: true,
              col: { md: 3 },
            },
            {
              name: "dDaysFromEvent",
              label: "Days From Event Date",
              type: "text",
              placeholder: "Enter Days From Event Date",
              disabled: true,
              col: { md: 3 },
            },
            {
              name: "dTemplateId",
              label: "Template ID",
              type: "text",
              placeholder: "Enter Template ID",
              disabled: true,
              col: { md: 3 },
            },
          ],
        },
      },
    ],
    [topCols]
  );

  // ---------- Actions ----------
  const onSearch = () => {
    const top: TopRow[] =
      bookingLocation && product
        ? [
            {
              __internalId: "t1",
              bookingLocation:
                bookingLocationOptions.find((o) => o.value === bookingLocation)?.text ||
                bookingLocation,
              product: productOptions.find((o) => o.value === product)?.text || product,
              templateType: templateType || "Default",
              islamicIndicator: "No",
              followUpType: followUpOptions.find((o) => o.value === followUpType)?.text || "",
              daysFromEvent: "7",
              eventInfo: "Maturity reminder",
              templateId: templateId || "TMP-001",
            },
          ]
        : [];

    const steps: BottomRow[] = top.length
      ? [
          {
            __internalId: "b1",
            startTracer: "T-1",
            endTracer: "T-3",
            frequencyFromPrev: "2",
            templateId: top[0].templateId,
          },
        ]
      : [];

    setData({
      topRows: top,
      bottomRows: steps,
      dBookingLocation: top[0]?.bookingLocation ?? "",
      dProduct: top[0]?.product ?? "",
      dTemplateType: top[0]?.templateType ?? "",
      dIslamic: (top[0]?.islamicIndicator || "").toLowerCase() === "yes",
      dFollowUpType: top[0]?.followUpType ?? "",
      dDaysFromEvent: top[0]?.daysFromEvent ?? "",
      dTemplateId: top[0]?.templateId ?? "",
    });
  };

  const onClear = () => {
    setBookingLocation("");
    setProduct("");
    setFollowUpType("");
    setTemplateType("");
    setTemplateId("");
    setData({
      topRows: [],
      bottomRows: [],
      dBookingLocation: "",
      dProduct: "",
      dTemplateType: "",
      dIslamic: false,
      dFollowUpType: "",
      dDaysFromEvent: "",
      dTemplateId: "",
    });
  };

  return (
    <ModuleContainer title="Tracer Enquiry" onBack={() => history.back()}>
      <Panel hasShadow={false}>
        {/* Top filter row (no panel header) */}
        <Grid spacing={16}>
          <GridItem xs={12} md={3}>
            <Dropdown
              required
              label="Booking Location"
              placeholder="Select Booking Option"
              options={bookingLocationOptions as any}
              value={bookingLocation}
              onChange={(v: string | string[] | null) =>
                setBookingLocation(Array.isArray(v) ? (v[0] ?? "") : (v ?? ""))
              }
              clearable
            />
          </GridItem>
          <GridItem xs={12} md={3}>
            <Dropdown
              label="Product"
              placeholder="Select Product"
              options={productOptions as any}
              value={product}
              onChange={(v: string | string[] | null) =>
                setProduct(Array.isArray(v) ? (v[0] ?? "") : (v ?? ""))
              }
              clearable
            />
          </GridItem>
          <GridItem xs={12} md={3}>
            <Dropdown
              label="Follow-up Type"
              placeholder="Select Follow-up Type"
              options={followUpOptions as any}
              value={followUpType}
              onChange={(v: string | string[] | null) =>
                setFollowUpType(Array.isArray(v) ? (v[0] ?? "") : (v ?? ""))
              }
              clearable
            />
          </GridItem>
          <GridItem xs={12} md={3}>
            <FormControl
              label="Template Type"
              type="text"
              placeholder="Enter Template Type"
              value={templateType}
              onChange={(e: any) => setTemplateType(e?.target?.value ?? "")}
            />
          </GridItem>

          <GridItem xs={12} md={9}>
            <div className="flex items-end justify-start gap-3 h-full">
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

        {/* Middle: table + detail fields (FormRenderer) */}
        <div className="mt-4">
          <FormRenderer
            fieldSettings={fieldSettings}
            dataSource={data}
            onSubmit={() => {}}
            onChange={setData}
          />
        </div>

        {/* Bottom: steps table (standalone DataTable, NOT FormRenderer) */}
        <div className="mt-4">
          <DataTable
            title="Tracer Steps"
            columnSettings={bottomCols}
            dataSource={data.bottomRows}
            hideFooter={false}
          />
        </div>
      </Panel>
    </ModuleContainer>
  );
}
