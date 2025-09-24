// packages/setup/src/pages/setup/advice-setup-enquiry/index.tsx
import React, { useMemo, useState } from 'react'
import ModuleContainer from '../../../components/ModuleContainer'
import {
  Panel,
  Button,
  Icon,
  Grid,
  GridItem,
  Dropdown,
  FormControl,
  FormRenderer
} from 'react-components-lib.eaa'
import type { SettingsItem, ColumnSetting } from 'react-components-lib.eaa'

/**
 * Table row shape (plain object). Keys must match ColumnSetting.column.
 */
type Row = {
  __internalId: string
  bookingLocationCode: string
  productGroupCode: string
  step: string
  subStep: string
  adviceId: string
  // display fields
  bookingLocation: string
  islamicIndicator: string // "Yes" | "No"
  productGroup: string
}

export default function AdviceSetupEnquiry() {
  /**
   * ---- Filters (outside FormRenderer) ----
   * Booking Location, Product Group, Advice ID + Search/Clear
   */
  const [bookingLocation, setBookingLocation] = useState<string>('')
  const [productGroup, setProductGroup] = useState<string>('')
  const [adviceId, setAdviceId] = useState<string>('')

  /**
   * ---- FormRenderer model ----
   * Keep all FR-bound values in a single object so FR can fully control it.
   * No local `FormData` TS interface per your request.
   */
  const [formData, setFormData] = useState<Record<string, any>>({
    // table rows
    enquirerRows: [],

    // details below table (disabled by default; wire to row-click later)
    detailBookingLocation: '',
    detailIslamic: false,
    detailProductGroup: '',
    detailStep: '',
    detailSubStep: '',
    detailAdviceId: ''
  })

  /**
   * Example dataset (swap to server loader later)
   */
  const ALL_ROWS: Row[] = useMemo(
    () => [
      {
        __internalId: 'r1',
        bookingLocationCode: 'HQ',
        productGroupCode: 'PG1',
        step: 'S1',
        subStep: 'SS1',
        adviceId: 'ADV-001',
        bookingLocation: 'HQ - Head Office',
        islamicIndicator: 'No',
        productGroup: 'Retail - PG1'
      },
      {
        __internalId: 'r2',
        bookingLocationCode: 'BR001',
        productGroupCode: 'PG2',
        step: 'S2',
        subStep: 'SS3',
        adviceId: 'ADV-129',
        bookingLocation: 'BR001 - Branch 1',
        islamicIndicator: 'Yes',
        productGroup: 'Corporate - PG2'
      },
      {
        __internalId: 'r3',
        bookingLocationCode: 'BR002',
        productGroupCode: 'PG1',
        step: 'S3',
        subStep: 'SS2',
        adviceId: 'ADV-245',
        bookingLocation: 'BR002 - Branch 2',
        islamicIndicator: 'No',
        productGroup: 'Retail - PG1'
      }
    ],
    []
  )

  /**
   * Search applies filters and populates the FR dataSource (`enquirerRows`).
   * Clear resets filters and table/detail values.
   */
  const onSearch = () => {
    const adv = (adviceId || '').trim().toLowerCase()
    const rows = ALL_ROWS.filter((r) => {
      const okLoc = bookingLocation ? r.bookingLocationCode === bookingLocation : true
      const okPg = productGroup ? r.productGroupCode === productGroup : true
      const okAdv = adv ? r.adviceId.toLowerCase().includes(adv) : true
      return okLoc && okPg && okAdv
    })
    setFormData((prev) => ({
      ...prev,
      enquirerRows: rows,
      detailBookingLocation: '',
      detailIslamic: false,
      detailProductGroup: '',
      detailStep: '',
      detailSubStep: '',
      detailAdviceId: ''
    }))
  }

  const onClear = () => {
    setBookingLocation('')
    setProductGroup('')
    setAdviceId('')
    setFormData({
      enquirerRows: [],
      detailBookingLocation: '',
      detailIslamic: false,
      detailProductGroup: '',
      detailStep: '',
      detailSubStep: '',
      detailAdviceId: ''
    })
  }

  /**
   * Table columns (auto width)
   */
  const columns: ColumnSetting[] = useMemo(
    () => [
      { column: 'bookingLocation', title: 'Booking Location' },
      { column: 'islamicIndicator', title: 'Islamic Indicator' },
      { column: 'productGroup', title: 'Product Group' },
      { column: 'step', title: 'Step' },
      { column: 'subStep', title: 'Substep' },
      { column: 'adviceId', title: 'Advice ID' }
    ],
    []
  )

  /**
   * Dropdown options
   */
  const bookingLocationOptions = [
    { text: 'HQ - Head Office', value: 'HQ' },
    { text: 'BR001 - Branch 1', value: 'BR001' },
    { text: 'BR002 - Branch 2', value: 'BR002' },
    { text: 'BR003 - Branch 3', value: 'BR003' }
  ]
  const productGroupOptions = [
    { text: 'Retail - PG1', value: 'PG1' },
    { text: 'Corporate - PG2', value: 'PG2' },
    { text: 'SME - PG3', value: 'PG3' }
  ]

  /**
   * FormRenderer field settings:
   * Tabs → (DataTable) Enquirer Catalog → fields below the table.
   *
   * NOTE on "required":
   * When you need required validation inside FR, use:
   *   validation: z => z.string().required('First name is mandatory')
   * (per your directive). Example left commented below for reference.
   */
  const fieldSettings: SettingsItem[] = useMemo(() => {
    return [
      {
        tabs: [
          {
            title: 'Enquirer',
            fields: [
              {
                dataTable: {
                  config: {
                    dataSource: 'enquirerRows',
                    columnSettings: columns
                  },
                  fields: [
                    {
                      name: 'bookingLocation',
                      label: 'Booking Location',
                      type: 'dropdown',
                      options: bookingLocationOptions,
                      disabled: true
                    },
                    {
                      name: 'islamicIndicator',
                      label: 'Islamic Indicator',
                      type: 'checkbox',
                      disabled: true
                    },
                    {
                      name: 'productGroup',
                      label: 'Product Group',
                      type: 'dropdown',
                      options: productGroupOptions,
                      disabled: true
                    },
                    {
                      name: 'step',
                      label: 'Step',
                      type: 'text',
                      placeholder: 'Enter Step',
                      disabled: true
                    },
                    {
                      name: 'subStep',
                      label: 'Sub Step',
                      type: 'text',
                      placeholder: 'Enter Sub Step',
                      disabled: true
                    },
                    {
                      name: 'adviceId',
                      label: 'Advice ID',
                      type: 'text',
                      placeholder: 'Enter Advice ID',
                      disabled: true
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  }, [columns, bookingLocationOptions, productGroupOptions])

  return (
    <ModuleContainer title="Advice Setup Enquiry" onBack={() => history.back()}>
      <Panel hideShadow>
        {/* ---- Filters outside FormRenderer ---- */}
        <Grid spacing={16}>
          <GridItem xs={12} md={3}>
            <Dropdown
              label="Booking Location"
              placeholder="Select Booking Option"
              options={bookingLocationOptions}
              required
              value={bookingLocation}
              onChange={(v: string | string[] | null) =>
                setBookingLocation(Array.isArray(v) ? (v[0] ?? '') : (v ?? ''))
              }
              clearable
            />
          </GridItem>

          <GridItem xs={12} md={3}>
            <Dropdown
              label="Product Group"
              placeholder="Select Product Group"
              options={productGroupOptions}
              value={productGroup}
              onChange={(v: string | string[] | null) =>
                setProductGroup(Array.isArray(v) ? (v[0] ?? '') : (v ?? ''))
              }
              clearable
            />
          </GridItem>

          <GridItem xs={12} md={3}>
            <FormControl
              label="Advice ID"
              placeholder="Enter Advice ID"
              type="text"
              value={adviceId}
              onChange={(e: any) => setAdviceId(e?.target?.value ?? '')}
            />
          </GridItem>

          <GridItem xs={12} md={3}>
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

        {/* ---- FormRenderer: Tabs → Table (Enquirer Catalog) → Fields below ---- */}
        <div className="mt-4">
          <FormRenderer
            fieldSettings={fieldSettings}
            dataSource={formData}
            onSubmit={() => {}}
            // onChange={(values: Record<string, any>) => setFormData(values)}
          />
        </div>
      </Panel>
    </ModuleContainer>
  )
}
