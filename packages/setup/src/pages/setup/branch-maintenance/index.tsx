import React, { useMemo, useState } from 'react'
import ModuleContainer from '../../../components/ModuleContainer'
import {
  Panel,
  Tabs,
  DataTable,
  Dropdown,
  Button,
  Icon,
  Grid,
  GridItem
} from 'react-components-lib.eaa'
import type { ColumnSetting } from 'react-components-lib.eaa'

type Row = {
  __internalId: string
  branchCode: string
  branchName: string
  activeStatusCode: 'ACTV' | 'INACT'
  // display fields for table
  branch: string
  activeStatus: string
}

export default function BranchMaintenance() {
  const [activeTab, setActiveTab] = useState<number>(0)

  // filters (outside table)
  const [branchFilter, setBranchFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  // applied filters (after Search)
  const [appliedBranch, setAppliedBranch] = useState<string>('')
  const [appliedStatus, setAppliedStatus] = useState<string>('')

  const onSearch = () => {
    setAppliedBranch(branchFilter)
    setAppliedStatus(statusFilter)
  }
  const onClear = () => {
    setBranchFilter('')
    setStatusFilter('')
    setAppliedBranch('')
    setAppliedStatus('')
  }

  const columns: ColumnSetting[] = useMemo(
    () => [
      { column: 'branch', title: 'Branch' },
      { column: 'activeStatus', title: 'Active Status' }
    ],
    []
  )

  const ALL_ROWS: Row[] = useMemo(
    () => [
      {
        __internalId: 'b1',
        branchCode: 'BR001',
        branchName: 'Branch 1',
        activeStatusCode: 'ACTV',
        branch: 'BR001 - Branch 1',
        activeStatus: 'ACTV - Active'
      },
      {
        __internalId: 'b2',
        branchCode: 'BR002',
        branchName: 'Branch 2',
        activeStatusCode: 'INACT',
        branch: 'BR002 - Branch 2',
        activeStatus: 'INACT - Inactive'
      },
      {
        __internalId: 'b3',
        branchCode: 'HQ',
        branchName: 'Head Office',
        activeStatusCode: 'ACTV',
        branch: 'HQ - Head Office',
        activeStatus: 'ACTV - Active'
      }
    ],
    []
  )

  const rows = useMemo(() => {
    return ALL_ROWS.filter((r) => {
      const bOk = appliedBranch ? r.branchCode === appliedBranch : true
      const sOk = appliedStatus ? r.activeStatusCode === appliedStatus : true
      return bOk && sOk
    })
  }, [ALL_ROWS, appliedBranch, appliedStatus])

  const branchOptions = [
    { text: 'HQ - Head Office', value: 'HQ' },
    { text: 'BR001 - Branch 1', value: 'BR001' },
    { text: 'BR002 - Branch 2', value: 'BR002' }
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
          <Grid spacing={16}>
            <GridItem xs={12} md={3}>
              <Dropdown
                label="Branch"
                placeholder="Select Branch"
                options={branchOptions}
                value={branchFilter}
                onChange={(v: string | string[] | null) =>
                  setBranchFilter(Array.isArray(v) ? (v[0] ?? '') : (v ?? ''))
                }
                clearable
              />
            </GridItem>
            <GridItem xs={12} md={3}>
              <Dropdown
                label="Active Status"
                placeholder="Select Status"
                options={statusOptions}
                value={statusFilter}
                onChange={(v: string | string[] | null) =>
                  setStatusFilter(Array.isArray(v) ? (v[0] ?? '') : (v ?? ''))
                }
                clearable
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

          <div className="mt-6">
            <DataTable
              title="Enquirer Catalog"
              columnSettings={columns}
              dataSource={rows}
              enableColumnSorting
              enableColumnResizing
              enableGlobalFiltering={false}
              cellTextAlignment="left"
              hideFooter={false}
            />
          </div>
        </div>
      )
    }
  ]

  return (
    <ModuleContainer title="Branch Maintenance" onBack={() => history.back()} showFooter>
      <Panel title="Branch" hasShadow={false}>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </Panel>
    </ModuleContainer>
  )
}
