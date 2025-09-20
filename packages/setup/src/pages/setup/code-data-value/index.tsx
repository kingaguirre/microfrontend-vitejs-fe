import React, { useMemo, useState } from "react";
import ModuleContainer from "../../../components/ModuleContainer";
import {
  Panel,
  Grid,
  GridItem,
  FormControl,
  Dropdown,
  Button,
  Icon,
  DataTable,
} from "react-components-lib.eaa";
import type { ColumnSetting } from "react-components-lib.eaa";

type Row = {
  __internalId: string;
  codeValue: string;
  description: string;
  codeId: string;
  bookingLocation?: string;
};

type ExclRow = {
  __internalId: string;
  codeValue: string;
  description: string;
  exclusionCodeId: string;
};

export default function CodeDataValue() {
  // --- Code Value section filters ---
  const [codeId, setCodeId] = useState<string>("");
  const [bookingLocation, setBookingLocation] = useState<string>("");

  // --- Exclusion section filter ---
  const [exclCodeId, setExclCodeId] = useState<string>("");

  // applied (simulate server query)
  const [applied, setApplied] = useState({ codeId: "", bookingLocation: "" });
  const [appliedExcl, setAppliedExcl] = useState({ exclusionCodeId: "" });

  const onSearchMain = () => setApplied({ codeId: codeId.trim(), bookingLocation });
  const onClearMain = () => {
    setCodeId("");
    setBookingLocation("");
    setApplied({ codeId: "", bookingLocation: "" });
  };

  const onSearchExcl = () => setAppliedExcl({ exclusionCodeId: exclCodeId.trim() });
  const onClearExcl = () => {
    setExclCodeId("");
    setAppliedExcl({ exclusionCodeId: "" });
  };

  // Tables (auto width)
  const columns: ColumnSetting[] = useMemo(
    () => [
      { column: "codeValue", title: "Code Value" },
      { column: "description", title: "Description" },
    ],
    []
  );

  const exclColumns: ColumnSetting[] = useMemo(
    () => [
      { column: "codeValue", title: "Exclusion Code Value" },
      { column: "description", title: "Description" },
    ],
    []
  );

  // Mock data
  const ALL_ROWS: Row[] = useMemo(
    () => [
      {
        __internalId: "cv1",
        codeValue: "A001",
        description: "Alpha",
        codeId: "CUST-SEG",
        bookingLocation: "HQ",
      },
      {
        __internalId: "cv2",
        codeValue: "A002",
        description: "Beta",
        codeId: "CUST-SEG",
        bookingLocation: "BR001",
      },
      {
        __internalId: "cv3",
        codeValue: "B100",
        description: "General Purpose",
        codeId: "DOC-TYPE",
        bookingLocation: "HQ",
      },
    ],
    []
  );

  const ALL_EXCL_ROWS: ExclRow[] = useMemo(
    () => [
      {
        __internalId: "ex1",
        codeValue: "X-01",
        description: "Exclude code 1",
        exclusionCodeId: "EXC-SET-01",
      },
      {
        __internalId: "ex2",
        codeValue: "X-02",
        description: "Exclude code 2",
        exclusionCodeId: "EXC-SET-02",
      },
    ],
    []
  );

  const codeRows = useMemo(() => {
    return ALL_ROWS.filter((r) => {
      const idOk = applied.codeId ? r.codeId.toLowerCase().includes(applied.codeId.toLowerCase()) : true;
      const locOk = applied.bookingLocation ? r.bookingLocation === applied.bookingLocation : true;
      return idOk && locOk;
    });
  }, [ALL_ROWS, applied]);

  const exclRows = useMemo(() => {
    return ALL_EXCL_ROWS.filter((r) => {
      return appliedExcl.exclusionCodeId
        ? r.exclusionCodeId.toLowerCase().includes(appliedExcl.exclusionCodeId.toLowerCase())
        : true;
    });
  }, [ALL_EXCL_ROWS, appliedExcl]);

  // Options
  const bookingLocationOptions = [
    { text: "HQ - Head Office", value: "HQ" },
    { text: "BR001 - Branch 1", value: "BR001" },
    { text: "BR002 - Branch 2", value: "BR002" },
  ];

  return (
    <ModuleContainer title="Code Data Value" onBack={() => history.back()} showFooter>
      {/* --- Code Value panel --- */}
      <div className="mb-4">
        <Panel title="Code Value" hasShadow={false}>
          <Grid spacing={16}>
            <GridItem xs={12} md={3}>
              <FormControl
                required
                label="Code ID"
                placeholder="Search Code ID"
                type="text"
                value={codeId}
                onChange={(e: any) => setCodeId(e?.target?.value ?? "")}
                iconRight={[{ icon: "search" }]}
              />
            </GridItem>
            <GridItem xs={12} md={3}>
              <Dropdown
                label="Booking Location"
                placeholder="Select Booking Location"
                options={bookingLocationOptions}
                value={bookingLocation}
                onChange={(v: string | string[] | null) =>
                  setBookingLocation(Array.isArray(v) ? (v[0] ?? "") : (v ?? ""))
                }
                clearable
              />
            </GridItem>
            <GridItem xs={12} md={6}>
              <div className="flex items-end justify-end gap-2 h-full">
                <Button className="px-4" onClick={onSearchMain}>
                  <span className="inline-flex items-center gap-2">
                    Search <Icon icon="search" size={16} />
                  </span>
                </Button>
                <Button variant="outlined" className="px-4" onClick={onClearMain}>
                  Clear
                </Button>
              </div>
            </GridItem>
          </Grid>

          <div className="mt-4">
            <DataTable
              title="Code Value"
              columnSettings={columns}
              dataSource={codeRows}
              enableColumnSorting
              enableColumnResizing
              enableGlobalFiltering={false}
              cellTextAlignment="left"
              hideFooter={false}
            />
          </div>
        </Panel>
      </div>

      {/* --- Exclusion panel --- */}
      <Panel title="Exclusion" hasShadow={false}>
        <Grid spacing={16}>
          <GridItem xs={12} md={3}>
            <FormControl
              label="Exclusion Code ID"
              placeholder="Search Exclusion Code ID"
              type="text"
              value={exclCodeId}
              onChange={(e: any) => setExclCodeId(e?.target?.value ?? "")}
              iconRight={[{ icon: "search" }]}
            />
          </GridItem>
          <GridItem xs={12} md={9}>
            <div className="flex items-end justify-start gap-2 h-full">
              <Button className="px-4" onClick={onSearchExcl}>
                <span className="inline-flex items-center gap-2">
                  Search <Icon icon="search" size={16} />
                </span>
              </Button>
              <Button variant="outlined" className="px-4" onClick={onClearExcl}>
                Clear
              </Button>
            </div>
          </GridItem>
        </Grid>

        <div className="mt-4">
          <DataTable
            title="Exclusion Code Value"
            columnSettings={exclColumns}
            dataSource={exclRows}
            enableColumnSorting
            enableColumnResizing
            enableGlobalFiltering={false}
            cellTextAlignment="left"
            hideFooter={false}
          />
        </div>
      </Panel>
    </ModuleContainer>
  );
}
