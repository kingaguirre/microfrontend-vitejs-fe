import React, { useCallback, useState } from 'react'
import ModuleContainer from '../../../components/ModuleContainer'
import { Panel, Grid, GridItem, Dropdown, Button, Icon, DataTable } from 'react-components-lib.eaa'
import type { ColumnSetting } from 'react-components-lib.eaa'

type Row = {
  __internalId: string
  bookingLocation: string
  activeStatus: string
}

/* ---------- STABLE CONSTANTS (prevents re-create loops) ---------- */
const BOOKING_LOCATION_OPTIONS = [
  { text: 'HQ - Head Office', value: 'HQ' },
  { text: 'BR001 - Branch 1', value: 'BR001' },
  { text: 'BR002 - Branch 2', value: 'BR002' }
] as const

const STATUS_OPTIONS = [
  { text: 'ACTV - Active', value: 'ACTV' },
  { text: 'INACT - Inactive', value: 'INACT' }
] as const

const COLUMNS: ColumnSetting[] = [
  { column: 'bookingLocation', title: 'Booking Location' },
  { column: 'activeStatus', title: 'Active Status' }
]

/* small helper to avoid unnecessary state churn */
const sameRows = (a: Row[], b: Row[]) =>
  a.length === b.length &&
  a.every(
    (r, i) => r.bookingLocation === b[i].bookingLocation && r.activeStatus === b[i].activeStatus
  )

export default function FxRateMaintenance() {
  // filters
  const [bookingLocation, setBookingLocation] = useState<string>('')
  const [activeStatus, setActiveStatus] = useState<string>('ACTV')

  // table rows
  const [rows, setRows] = useState<Row[]>([])

  const onSearch = useCallback(() => {
    // If you fetch from server, do it here and setRows(response.rows)
    const locText =
      BOOKING_LOCATION_OPTIONS.find((o) => o.value === bookingLocation)?.text ||
      (bookingLocation ? bookingLocation : '—')
    const statusText = STATUS_OPTIONS.find((o) => o.value === activeStatus)?.text || activeStatus

    const next: Row[] = bookingLocation
      ? [
          { __internalId: 'r1', bookingLocation: locText, activeStatus: statusText },
          { __internalId: 'r2', bookingLocation: locText, activeStatus: statusText },
          { __internalId: 'r3', bookingLocation: locText, activeStatus: statusText }
        ]
      : []

    // only update if changed (prevents noisy renders in some table libs)
    setRows((prev) => (sameRows(prev, next) ? prev : next))
  }, [bookingLocation, activeStatus])

  const onClear = useCallback(() => {
    setBookingLocation('')
    setActiveStatus('ACTV')
    setRows([])
  }, [])

  return (
    <ModuleContainer title="FX Rate Maintenance" onBack={() => history.back()} showFooter>
      {/* Filters */}
      <Panel title="FX Rate Maintenance" hideShadow>
        <Grid spacing={16}>
          <GridItem xs={12} md={3}>
            <Dropdown
              required
              label="Booking Location"
              placeholder="Select Booking Location"
              options={BOOKING_LOCATION_OPTIONS as any}
              value={bookingLocation ?? ''}
              onChange={(v: string | string[] | null) =>
                setBookingLocation(Array.isArray(v) ? (v[0] ?? '') : (v ?? ''))
              }
              clearable
            />
          </GridItem>

          <GridItem xs={12} md={3}>
            <Dropdown
              required
              label="Active Status"
              placeholder="Select Status"
              options={STATUS_OPTIONS as any}
              value={activeStatus ?? 'ACTV'}
              onChange={(v: string | string[] | null) =>
                setActiveStatus(Array.isArray(v) ? (v[0] ?? '') : (v ?? ''))
              }
            />
          </GridItem>

          <GridItem xs={12} md={6}>
            <div className="flex items-end justify-end gap-3 h-full">
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
          <DataTable
            title="Enquirer Catalog"
            columnSettings={COLUMNS}
            dataSource={rows}
            height="calc(100vh - 444px)"
          />
        </div>
      </Panel>
    </ModuleContainer>
  )
}
