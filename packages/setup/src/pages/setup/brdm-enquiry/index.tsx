import React, { useMemo, useState } from 'react'
import ModuleContainer from '../../../components/ModuleContainer'
import {
  Panel,
  DataTable,
  Dropdown,
  FormControl,
  Button,
  Icon,
  Grid,
  GridItem
} from 'react-components-lib.eaa'
import type { ColumnSetting } from 'react-components-lib.eaa'

type Row = {
  __internalId: string
  routingCodeType: string // e.g., BIC, IFSC, ABA
  routingCodeValue: string
  bankName: string
  country: string
  city: string
  state: string
  branch: string
  address1?: string
  address2?: string
  address3?: string
  address4?: string
  address5?: string
  address6?: string
  address7?: string
  address8?: string
}

export default function BrdmEnquiry() {
  // filters
  const [codeType, setCodeType] = useState<string>('BIC')
  const [codeValue, setCodeValue] = useState<string>('')
  const [bankName, setBankName] = useState<string>('')
  const [country, setCountry] = useState<string>('')
  const [branch, setBranch] = useState<string>('')

  // applied filters
  const [query, setQuery] = useState({
    codeType: 'BIC',
    codeValue: '',
    bankName: '',
    country: '',
    branch: ''
  })

  const onSearch = () =>
    setQuery({
      codeType,
      codeValue: codeValue.trim(),
      bankName: bankName.trim(),
      country,
      branch: branch.trim()
    })

  const onClear = () => {
    setCodeType('BIC')
    setCodeValue('')
    setBankName('')
    setCountry('')
    setBranch('')
    setQuery({ codeType: 'BIC', codeValue: '', bankName: '', country: '', branch: '' })
  }

  const columns: ColumnSetting[] = useMemo(
    () => [
      { column: 'routingCodeType', title: 'Routing Code Type' },
      { column: 'routingCodeValue', title: 'Routing Code Value' },
      { column: 'bankName', title: 'Bank Name' },
      { column: 'country', title: 'Country' },
      { column: 'city', title: 'City' },
      { column: 'state', title: 'State' },
      { column: 'branch', title: 'Branch' },
      { column: 'address1', title: 'AddressLine1' },
      { column: 'address2', title: 'AddressLine2' },
      { column: 'address3', title: 'AddressLine3' },
      { column: 'address4', title: 'AddressLine4' },
      { column: 'address5', title: 'AddressLine5' },
      { column: 'address6', title: 'AddressLine6' },
      { column: 'address7', title: 'AddressLine7' },
      { column: 'address8', title: 'AddressLine8' }
    ],
    []
  )

  const ALL_ROWS: Row[] = useMemo(
    () => [
      {
        __internalId: 'r1',
        routingCodeType: 'BIC',
        routingCodeValue: 'ABCDEF12',
        bankName: 'Alpha Bank',
        country: 'MY',
        city: 'Kuala Lumpur',
        state: 'WP',
        branch: 'Main',
        address1: '123 Jalan Ampang',
        address2: 'Level 10'
      },
      {
        __internalId: 'r2',
        routingCodeType: 'ABA',
        routingCodeValue: '021000021',
        bankName: 'Beta Bank',
        country: 'US',
        city: 'New York',
        state: 'NY',
        branch: 'Downtown',
        address1: '1 Liberty St'
      },
      {
        __internalId: 'r3',
        routingCodeType: 'IFSC',
        routingCodeValue: 'HDFC0001234',
        bankName: 'HDFC Bank',
        country: 'IN',
        city: 'Mumbai',
        state: 'MH',
        branch: 'Andheri',
        address1: 'Sahar Rd'
      }
    ],
    []
  )

  const rows = useMemo(() => {
    return ALL_ROWS.filter((r) => {
      const tOk = query.codeType ? r.routingCodeType === query.codeType : true
      const vOk = query.codeValue
        ? r.routingCodeValue.toLowerCase().includes(query.codeValue.toLowerCase())
        : true
      const bOk = query.bankName
        ? r.bankName.toLowerCase().includes(query.bankName.toLowerCase())
        : true
      const cOk = query.country ? r.country === query.country : true
      const brOk = query.branch ? r.branch.toLowerCase().includes(query.branch.toLowerCase()) : true
      return tOk && vOk && bOk && cOk && brOk
    })
  }, [ALL_ROWS, query])

  const codeTypeOptions = [
    { text: 'BIC', value: 'BIC' },
    { text: 'IFSC', value: 'IFSC' },
    { text: 'ABA', value: 'ABA' }
  ]
  const countryOptions = [
    { text: 'Malaysia (MY)', value: 'MY' },
    { text: 'United States (US)', value: 'US' },
    { text: 'India (IN)', value: 'IN' }
  ]

  return (
    <ModuleContainer title="BRDM Enquiry" onBack={() => history.back()} showFooter>
      <Panel title="BRDM" hideShadow>
        {/* Filters row */}
        <Grid spacing={16}>
          <GridItem xs={12} md={3}>
            <Dropdown
              label="Routing Code Type"
              options={codeTypeOptions}
              value={codeType}
              onChange={(v: string | string[] | null) =>
                setCodeType(Array.isArray(v) ? (v[0] ?? '') : (v ?? ''))
              }
            />
          </GridItem>
          <GridItem xs={12} md={3}>
            <FormControl
              label="Routing Code Value"
              placeholder="Enter Routing Code Value"
              type="text"
              value={codeValue}
              onChange={(e: any) => setCodeValue(e?.target?.value ?? '')}
            />
          </GridItem>
          <GridItem xs={12} md={3}>
            <FormControl
              label="Bank Name"
              placeholder="Enter Bank Name"
              type="text"
              value={bankName}
              onChange={(e: any) => setBankName(e?.target?.value ?? '')}
            />
          </GridItem>
          <GridItem xs={12} md={3}>
            <Dropdown
              label="Country"
              placeholder="Select Country"
              options={countryOptions}
              value={country}
              onChange={(v: string | string[] | null) =>
                setCountry(Array.isArray(v) ? (v[0] ?? '') : (v ?? ''))
              }
              clearable
            />
          </GridItem>

          <GridItem xs={12} md={3}>
            <FormControl
              label="Branch"
              placeholder="Enter Branch"
              type="text"
              value={branch}
              onChange={(e: any) => setBranch(e?.target?.value ?? '')}
            />
          </GridItem>

          <GridItem xs={12} md={9}>
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

        {/* Table */}
        <div className="mt-4">
          <DataTable
            title="Results"
            columnSettings={columns}
            dataSource={rows}
            enableColumnSorting
            enableColumnResizing
            enableGlobalFiltering={false}
            cellTextAlignment="left"
            hideFooter={false}
          />
        </div>
      </Panel>
    </ModuleContainer>
  )
}
