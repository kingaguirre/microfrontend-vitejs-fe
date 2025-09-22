// packages/setup/src/pages/setup/map-data-value/index.tsx
import React, { useCallback, useState } from 'react'
import ModuleContainer from '../../../components/ModuleContainer'
import {
  Panel,
  Grid,
  GridItem,
  FormControl,
  Dropdown,
  Button,
  Icon,
  DataTable
} from 'react-components-lib.eaa'
import type { ColumnSetting } from 'react-components-lib.eaa'

type Row = {
  __internalId: string
  sourceValue: string
  destinationValue: string
  active: string
}

/* ---------- stable constants ---------- */
const BOOKING_LOCATION_OPTIONS = [
  { text: 'HQ - Head Office', value: 'HQ' },
  { text: 'BR001 - Branch 1', value: 'BR001' }
] as const

const COLUMNS: ColumnSetting[] = [
  { column: 'sourceValue', title: 'Source Value' },
  { column: 'destinationValue', title: 'Destination Value' },
  { column: 'active', title: 'Active' }
]

export default function MapDataValue() {
  const [mapId, setMapId] = useState<string>('')
  const [bookingLocation, setBookingLocation] = useState<string>('')
  const [active, setActive] = useState<boolean>(false)

  const [rows, setRows] = useState<Row[]>([])

  const onSearch = useCallback(() => {
    // In real use, fetch from server with { mapId, bookingLocation, active }
    if (!mapId) {
      setRows([])
      return
    }
    setRows([
      {
        __internalId: 'r1',
        sourceValue: 'SRC-01',
        destinationValue: 'DST-99',
        active: active ? 'Yes' : 'No'
      },
      {
        __internalId: 'r2',
        sourceValue: 'SRC-02',
        destinationValue: 'DST-88',
        active: active ? 'Yes' : 'No'
      }
    ])
  }, [mapId, active])

  const onClear = useCallback(() => {
    setMapId('')
    setBookingLocation('')
    setActive(false)
    setRows([])
  }, [])

  return (
    <ModuleContainer title="Map Data Value" onBack={() => history.back()} showFooter>
      {/* Filters */}
      <Panel title="Map Value" hideShadow>
        <Grid spacing={16}>
          <GridItem xs={12} md={3}>
            <FormControl
              required
              label="Map ID"
              placeholder="Search Map ID"
              type="text"
              value={mapId}
              onChange={(e: any) => setMapId(e?.target?.value ?? '')}
              iconRight={[{ icon: 'search' }]}
            />
          </GridItem>

          <GridItem xs={12} md={3}>
            <Dropdown
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
            <FormControl
              label="Active Status"
              type="checkbox"
              checked={active}
              onChange={(e: any) => setActive(!!e?.target?.checked)}
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

        <div className="mt-4">
          {/* Results */}
          <DataTable columnSettings={COLUMNS} dataSource={rows} />
        </div>
      </Panel>
    </ModuleContainer>
  )
}
