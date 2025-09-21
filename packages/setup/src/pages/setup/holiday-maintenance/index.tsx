// packages/setup/src/pages/setup/holiday-maintenance/index.tsx
import React, { useCallback, useState } from 'react'
import ModuleContainer from '../../../components/ModuleContainer'
import { Panel, Grid, GridItem, Dropdown, Button, Icon, DataTable } from 'react-components-lib.eaa'
import type { ColumnSetting } from 'react-components-lib.eaa'

type Row = {
  __internalId: string
  bookingLocation: string
  financeCentre: string
  year: string
}

/* ---------- Stable constants ---------- */
const BOOKING_LOCATION_OPTIONS = [
  { text: 'HQ - Head Office', value: 'HQ' },
  { text: 'BR001 - Branch 1', value: 'BR001' }
] as const

const FINANCE_OPTIONS = [
  { text: 'Kuala Lumpur', value: 'KL' },
  { text: 'Singapore', value: 'SG' }
] as const

const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const y = String(2023 + i)
  return { text: y, value: y }
}) as const

const COLUMNS: ColumnSetting[] = [
  { column: 'bookingLocation', title: 'Booking Location' },
  { column: 'financeCentre', title: 'Finance Centre' },
  { column: 'year', title: 'Year' }
]

export default function HolidayMaintenance() {
  const [bookingLocation, setBookingLocation] = useState<string>('')
  const [financeCentre, setFinanceCentre] = useState<string>('')
  const [year, setYear] = useState<string>('')

  const [rows, setRows] = useState<Row[]>([])

  const onSearch = useCallback(() => {
    if (!bookingLocation || !financeCentre || !year) {
      setRows([])
      return
    }

    const locText =
      BOOKING_LOCATION_OPTIONS.find((o) => o.value === bookingLocation)?.text || bookingLocation
    const finText = FINANCE_OPTIONS.find((o) => o.value === financeCentre)?.text || financeCentre

    // Demo data; replace with server results if needed
    setRows([
      { __internalId: 'r1', bookingLocation: locText, financeCentre: finText, year },
      { __internalId: 'r2', bookingLocation: locText, financeCentre: finText, year }
    ])
  }, [bookingLocation, financeCentre, year])

  const onClear = useCallback(() => {
    setBookingLocation('')
    setFinanceCentre('')
    setYear('')
    setRows([])
  }, [])

  return (
    <ModuleContainer title="Holiday Maintenance" onBack={() => history.back()} showFooter>
      {/* Filters */}
      <Panel title="Holiday Maintenance" hasShadow={false}>
        <Grid spacing={16}>
          <GridItem xs={12} md={3}>
            <Dropdown
              required
              label="Booking Location"
              placeholder="Select Booking Location"
              options={BOOKING_LOCATION_OPTIONS as any}
              value={bookingLocation}
              onChange={(v: string | string[] | null) =>
                setBookingLocation(Array.isArray(v) ? (v[0] ?? '') : (v ?? ''))
              }
              clearable
            />
          </GridItem>

          <GridItem xs={12} md={3}>
            <Dropdown
              required
              label="Finance Centre"
              placeholder="Select Finance Centre"
              options={FINANCE_OPTIONS as any}
              value={financeCentre}
              onChange={(v: string | string[] | null) =>
                setFinanceCentre(Array.isArray(v) ? (v[0] ?? '') : (v ?? ''))
              }
              clearable
            />
          </GridItem>

          <GridItem xs={12} md={3}>
            <Dropdown
              required
              label="Year"
              placeholder="Select Year"
              options={YEAR_OPTIONS as any}
              value={year}
              onChange={(v: string | string[] | null) =>
                setYear(Array.isArray(v) ? (v[0] ?? '') : (v ?? ''))
              }
              clearable
            />
          </GridItem>

          <GridItem xs={12} md={3}>
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
