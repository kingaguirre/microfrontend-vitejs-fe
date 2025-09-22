// packages/setup/src/pages/setup/booking-location-maintenance/index.tsx
import React, { useMemo, useState } from 'react'
import ModuleContainer from '../../../components/ModuleContainer'
import {
  Icon,
  Button,
  Tabs,
  DataTable,
  Dropdown,
  Panel,
  Grid,
  GridItem
} from 'react-components-lib.eaa'

type Row = {
  __internalId: string
  bookingLocationCode: string
  activeStatusCode: 'ACTV' | 'INACT'
  bookingLocation: string
  activeStatus: string
}

export default function BookingLocationMaintenance() {
  const [activeTab, setActiveTab] = useState<number>(0)

  // Draft selections
  const [bookingLocation, setBookingLocation] = useState<string>('')
  const [activeStatus, setActiveStatus] = useState<string>('')

  // Applied filters (only after Search)
  const [appliedLocation, setAppliedLocation] = useState<string>('')
  const [appliedStatus, setAppliedStatus] = useState<string>('')

  const handleBookingLocation = (v: string | string[] | null) =>
    setBookingLocation(Array.isArray(v) ? (v[0] ?? '') : (v ?? ''))
  const handleActiveStatus = (v: string | string[] | null) =>
    setActiveStatus(Array.isArray(v) ? (v[0] ?? '') : (v ?? ''))

  const onSearch = () => {
    setAppliedLocation(bookingLocation)
    setAppliedStatus(activeStatus)
  }
  const onClear = () => {
    setBookingLocation('')
    setActiveStatus('')
    setAppliedLocation('')
    setAppliedStatus('')
  }

  // Auto-width columns: no width properties
  const columns = useMemo(
    () => [
      { column: 'bookingLocation', title: 'Booking Location' },
      { column: 'activeStatus', title: 'Active Status' }
    ],
    []
  )

  const ALL_ROWS: Row[] = useMemo(
    () => [
      {
        __internalId: 'row-1',
        bookingLocationCode: 'HQ',
        activeStatusCode: 'ACTV',
        bookingLocation: 'HQ - Head Office',
        activeStatus: 'ACTV - Active'
      },
      {
        __internalId: 'row-2',
        bookingLocationCode: 'BR001',
        activeStatusCode: 'INACT',
        bookingLocation: 'BR001 - Branch 1',
        activeStatus: 'INACT - Inactive'
      },
      {
        __internalId: 'row-3',
        bookingLocationCode: 'BR002',
        activeStatusCode: 'ACTV',
        bookingLocation: 'BR002 - Branch 2',
        activeStatus: 'ACTV - Active'
      },
      {
        __internalId: 'row-4',
        bookingLocationCode: 'BR003',
        activeStatusCode: 'INACT',
        bookingLocation: 'BR003 - Branch 3',
        activeStatus: 'INACT - Inactive'
      },
      {
        __internalId: 'row-5',
        bookingLocationCode: 'HQ',
        activeStatusCode: 'INACT',
        bookingLocation: 'HQ - Head Office',
        activeStatus: 'INACT - Inactive'
      },
      {
        __internalId: 'row-6',
        bookingLocationCode: 'BR001',
        activeStatusCode: 'ACTV',
        bookingLocation: 'BR001 - Branch 1',
        activeStatus: 'ACTV - Active'
      }
    ],
    []
  )

  const filteredRows = useMemo(() => {
    return ALL_ROWS.filter((r) => {
      const locOk = appliedLocation ? r.bookingLocationCode === appliedLocation : true
      const statOk = appliedStatus ? r.activeStatusCode === appliedStatus : true
      return locOk && statOk
    })
  }, [ALL_ROWS, appliedLocation, appliedStatus])

  const bookingLocationOptions = [
    { text: 'HQ - Head Office', value: 'HQ' },
    { text: 'BR001 - Branch 1', value: 'BR001' },
    { text: 'BR002 - Branch 2', value: 'BR002' },
    { text: 'BR003 - Branch 3', value: 'BR003' }
  ]
  const statusOptions = [
    { text: 'ACTV - Active', value: 'ACTV' },
    { text: 'INACT - Inactive', value: 'INACT' }
  ]

  const tabs = [
    {
      title: 'Enquirer',
      content: (
        <div className="pt-4">
          {/* Filters: 25% each via Grid (12-col → md={3}) */}
          <Grid spacing={16}>
            <GridItem xs={12} md={3}>
              <Dropdown
                label="Booking Location"
                placeholder="Select Booking Location"
                options={bookingLocationOptions}
                value={bookingLocation}
                onChange={handleBookingLocation}
                clearable
              />
            </GridItem>
            <GridItem xs={12} md={3}>
              <Dropdown
                label="Active Status"
                placeholder="Select Active Status"
                options={statusOptions}
                value={activeStatus}
                onChange={handleActiveStatus}
                clearable
              />
            </GridItem>
          </Grid>

          {/* Enquirer Catalog header + actions */}
          <div className="mt-6 mb-4 flex items-center justify-end">
            <div className="flex items-center gap-3">
              <Button className="px-4" onClick={onSearch}>
                <span className="inline-flex items-center gap-2">
                  Search <Icon icon="search" size={16} />
                </span>
              </Button>
              <Button variant="outlined" className="px-4" onClick={onClear}>
                Clear
              </Button>
            </div>
          </div>

          {/* DataTable (auto-width columns) */}
          <DataTable
            title="Enquirer Catalog"
            columnSettings={columns}
            dataSource={filteredRows}
            enableColumnSorting
            enableColumnResizing
            enableGlobalFiltering={false}
            cellTextAlignment="left"
            hideFooter={false}
            headerRightControls={false}
          />
        </div>
      )
    }
  ]

  return (
    <ModuleContainer title="Booking Location Maintenance" onBack={() => history.back()}>
      <Panel title="Booking Location Maintenance" hideShadow>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </Panel>
    </ModuleContainer>
  )
}
