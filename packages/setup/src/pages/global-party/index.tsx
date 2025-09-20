import React, { useMemo, useState } from "react";
import ModuleContainer from "../../components/ModuleContainer";
import {
  Panel,
  Grid,
  GridItem,
  FormControl,
  Button,
  Icon,
  FormRenderer,
} from "react-components-lib.eaa";
import type { ColumnSetting, SettingsItem } from "react-components-lib.eaa";

type AddressRow = {
  __internalId: string;
  addressId: string;
  line1?: string;
  line2?: string;
  line3?: string;
  line4?: string;
  line5?: string;
  line6?: string;
  line7?: string;
  country?: string;
};

type LlsRow = {
  __internalId: string;
  llsAddressId: string;
  line1?: string;
  country?: string;
};

type ContactRow = {
  __internalId: string;
  contactName: string;
  role: string;
  phone: string;
  email: string;
  country?: string;
};

type SciRow = {
  __internalId: string;
  subProfileId: string;
  subType: string;
  status: string;
};

export default function GlobalParty() {
  const [party, setParty] = useState("");

  const [data, setData] = useState<Record<string, any>>({
    // Tab 1: Multiple Address
    addressRows: [] as AddressRow[],
    addrId: "",
    addr1: "",
    addr2: "",
    addr3: "",
    addr4: "",
    addr5: "",
    addr6: "",
    addr7: "",
    country: "",
    poBox: "",
    stateCode: "",
    mailZip: "",
    provinceCode: "",
    taxRegNo: "",
    indiaStateCode: "",
    specEcoArea: "",

    // Tab 2: LLS Party Address (simpler)
    llsRows: [] as LlsRow[],
    llsAddrId: "",
    llsLine1: "",
    llsCountry: "",

    // Tab 3: Multiple Contacts
    contactRows: [] as ContactRow[],
    cName: "",
    cRole: "",
    cPhone: "",
    cEmail: "",
    cCountry: "",

    // Tab 4: SCI Sub Profile Details
    sciRows: [] as SciRow[],
    sciId: "",
    sciType: "",
    sciStatus: "",
  });

  // --- columns ---
  const columns: ColumnSetting[] = useMemo(
    () => [
      { column: "addressId", title: "Address ID" },
      { column: "line1", title: "Address Line 1" },
      { column: "line2", title: "Address Line 2" },
      { column: "line3", title: "Address Line 3" },
      { column: "line4", title: "Address Line 4" },
      { column: "line5", title: "Address Line 5" },
      { column: "line6", title: "Address Line 6" },
      { column: "line7", title: "Address Line 7" },
      { column: "country", title: "Country" },
    ],
    []
  );

  const llsColumns: ColumnSetting[] = useMemo(
    () => [
      { column: "llsAddressId", title: "LLS Address ID" },
      { column: "line1", title: "Address Line 1" },
      { column: "country", title: "Country" },
    ],
    []
  );

  const contactColumns: ColumnSetting[] = useMemo(
    () => [
      { column: "contactName", title: "Contact Name" },
      { column: "role", title: "Role" },
      { column: "phone", title: "Phone" },
      { column: "email", title: "Email" },
      { column: "country", title: "Country" },
    ],
    []
  );

  const sciColumns: ColumnSetting[] = useMemo(
    () => [
      { column: "subProfileId", title: "Sub Profile ID" },
      { column: "subType", title: "Sub Type" },
      { column: "status", title: "Status" },
    ],
    []
  );

  // --- FormRenderer config (tabs) ---
  const fieldSettings: SettingsItem[] = useMemo(
    () => [
      {
        tabs: [
          // TAB 1: Multiple Address
          {
            title: "Multiple Address",
            fields: [
              {
                dataTable: {
                  config: { dataSource: "addressRows", columnSettings: columns },
                  fields: [
                    { name: "addrId", label: "Address ID", type: "text", disabled: true, col: { md: 3 }, placeholder: "Enter Address ID" },
                    { name: "addr1", label: "Address Line 1", type: "text", disabled: true, col: { md: 3 }, placeholder: "Enter Address Line 1" },
                    { name: "addr2", label: "Address Line 2", type: "text", disabled: true, col: { md: 3 }, placeholder: "Enter Address Line 2" },
                    { name: "addr3", label: "Address Line 3", type: "text", disabled: true, col: { md: 3 }, placeholder: "Enter Address Line 3" },
                    { name: "addr4", label: "Address Line 4", type: "text", disabled: true, col: { md: 3 }, placeholder: "Enter Address Line 4" },
                    { name: "addr5", label: "Address Line 5", type: "text", disabled: true, col: { md: 3 }, placeholder: "Enter Address Line 5" },
                    { name: "addr6", label: "Address Line 6", type: "text", disabled: true, col: { md: 3 }, placeholder: "Enter Address Line 6" },
                    { name: "addr7", label: "Address Line 7", type: "text", disabled: true, col: { md: 3 }, placeholder: "Enter Address Line 7" },
                    { name: "country", label: "Country", type: "text", disabled: true, col: { md: 3 }, placeholder: "Enter Country" },
                    { name: "poBox", label: "PO Box", type: "text", disabled: true, col: { md: 3 }, placeholder: "Enter PO Box" },
                    { name: "stateCode", label: "State Code", type: "text", disabled: true, col: { md: 3 }, placeholder: "Enter State Code" },
                    { name: "mailZip", label: "Mail Zip Code", type: "text", disabled: true, col: { md: 3 }, placeholder: "Enter Mail Zip Code" },
                    { name: "provinceCode", label: "Province Code", type: "text", disabled: true, col: { md: 3 }, placeholder: "Enter Province Code" },
                    { name: "taxRegNo", label: "Tax Registration Number", type: "text", disabled: true, col: { md: 3 }, placeholder: "Enter Tax Registration Number" },
                    { name: "indiaStateCode", label: "India State Code", type: "text", disabled: true, col: { md: 3 }, placeholder: "Enter India State Code" },
                    { name: "specEcoArea", label: "Special Economic Area", type: "text", disabled: true, col: { md: 3 }, placeholder: "Enter Special Economic Area" },
                  ],
                },
              },
            ],
          },

          // TAB 2: LLS Party Address (simpler)
          {
            title: "LLS Party Address",
            fields: [
              {
                dataTable: {
                  config: { dataSource: "llsRows", columnSettings: llsColumns },
                  fields: [
                    { name: "llsAddrId", label: "LLS Address ID", type: "text", disabled: true, col: { md: 4 }, placeholder: "Enter LLS Address ID" },
                    { name: "llsLine1", label: "Address Line 1", type: "text", disabled: true, col: { md: 4 }, placeholder: "Enter Address Line 1" },
                    { name: "llsCountry", label: "Country", type: "text", disabled: true, col: { md: 4 }, placeholder: "Enter Country" },
                  ],
                },
              },
            ],
          },

          // TAB 3: Multiple Contacts
          {
            title: "Multiple Contacts",
            fields: [
              {
                dataTable: {
                  config: { dataSource: "contactRows", columnSettings: contactColumns },
                  fields: [
                    { name: "cName", label: "Contact Name", type: "text", disabled: true, col: { md: 3 }, placeholder: "Enter Contact Name" },
                    { name: "cRole", label: "Role", type: "text", disabled: true, col: { md: 3 }, placeholder: "Enter Role" },
                    { name: "cPhone", label: "Phone", type: "text", disabled: true, col: { md: 3 }, placeholder: "Enter Phone" },
                    { name: "cEmail", label: "Email", type: "text", disabled: true, col: { md: 3 }, placeholder: "Enter Email" },
                    { name: "cCountry", label: "Country", type: "text", disabled: true, col: { md: 3 }, placeholder: "Enter Country" },
                  ],
                },
              },
            ],
          },

          // TAB 4: SCI Sub Profile Details
          {
            title: "SCI Sub Profile Details",
            fields: [
              {
                dataTable: {
                  config: { dataSource: "sciRows", columnSettings: sciColumns },
                  fields: [
                    { name: "sciId", label: "Sub Profile ID", type: "text", disabled: true, col: { md: 4 }, placeholder: "Enter Sub Profile ID" },
                    { name: "sciType", label: "Sub Type", type: "text", disabled: true, col: { md: 4 }, placeholder: "Enter Sub Type" },
                    { name: "sciStatus", label: "Status", type: "text", disabled: true, col: { md: 4 }, placeholder: "Enter Status" },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
    [columns, llsColumns, contactColumns, sciColumns]
  );

  // --- actions ---
  const onSearch = () => {
    setData((d) => ({
      ...d,
      addressRows: party
        ? [
            {
              __internalId: "a1",
              addressId: "ADDR-0001",
              line1: "123 Alpha Street",
              line2: "Level 2",
              country: "MY",
            },
          ]
        : [],
      llsRows: party
        ? [
            {
              __internalId: "l1",
              llsAddressId: "LLS-1001",
              line1: "LLS Main Ave",
              country: "MY",
            },
          ]
        : [],
      contactRows: party
        ? [
            {
              __internalId: "c1",
              contactName: "Jane Doe",
              role: "Account Manager",
              phone: "+60 12-345 6789",
              email: "jane.doe@example.com",
              country: "MY",
            },
          ]
        : [],
      sciRows: party
        ? [
            {
              __internalId: "s1",
              subProfileId: "SCI-0007",
              subType: "Retail",
              status: "Active",
            },
          ]
        : [],
    }));
  };

  const onClear = () => {
    setParty("");
    setData({
      addressRows: [],
      addrId: "",
      addr1: "",
      addr2: "",
      addr3: "",
      addr4: "",
      addr5: "",
      addr6: "",
      addr7: "",
      country: "",
      poBox: "",
      stateCode: "",
      mailZip: "",
      provinceCode: "",
      taxRegNo: "",
      indiaStateCode: "",
      specEcoArea: "",

      llsRows: [],
      llsAddrId: "",
      llsLine1: "",
      llsCountry: "",

      contactRows: [],
      cName: "",
      cRole: "",
      cPhone: "",
      cEmail: "",
      cCountry: "",

      sciRows: [],
      sciId: "",
      sciType: "",
      sciStatus: "",
    });
  };

  return (
    <ModuleContainer title="Global Party" onBack={() => history.back()} showFooter>
      <Panel title="Global Party" hasShadow={false}>
        <Grid spacing={16}>
          <GridItem xs={12} md={6}>
            <FormControl
              required
              label="Party Details"
              placeholder="Search Party ID / Name"
              type="text"
              value={party}
              onChange={(e: any) => setParty(e?.target?.value ?? "")}
              iconRight={[{ icon: "search" }]}
            />
          </GridItem>
          <GridItem xs={12} md={6}>
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

        <div className="mt-4">
          <FormRenderer
            fieldSettings={fieldSettings}
            dataSource={data}
            onSubmit={() => {}}
            onChange={setData}
          />
        </div>
      </Panel>
    </ModuleContainer>
  );
}
