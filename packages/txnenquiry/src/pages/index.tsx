// packages/txn-enquiry/src/pages/index.tsx
import { useMemo, useState } from 'react'
import { DataTable, theme } from 'react-components-lib.eaa'
import type { ColumnSetting, HeaderRightElement } from 'react-components-lib.eaa'
import moduleConfig from '../module.config.json'
import { apiGet, MainPageContainer, MAIN_PAGE_TABLE_HEIGHT } from '@app/common'

type Row = {
  id: number
  trn: string
  customerId: string // derived from server `customer`
  counterparty: string
  product: string
  bookingLocation: string
}

export default function TransactionEnquiry() {
  // “Transaction Reference” search box (drives server param `trnSearch`)
  const [trnText, setTrnText] = useState('')

  const columns: ColumnSetting[] = useMemo(
    () => [
      {
        column: 'trn',
        title: 'TRN',
        minWidth: 180,
        pin: 'pin',
        filter: { type: 'text' },
        cell: ({ rowValue }: any) => (
          <a
            className="underline decoration-dotted hover:opacity-80"
            style={{ color: theme.colors.primary.base }}
          >
            {rowValue.trn}
          </a>
        )
      },
      { column: 'customerId', title: 'CUSTOMER ID', minWidth: 180, filter: { type: 'text' } },
      {
        column: 'counterparty',
        title: 'COUNTERPARTY',
        minWidth: 220,
        filter: { type: 'text' },
        cell: ({ rowValue }: any) => <span className="truncate block">{rowValue.counterparty}</span>
      },
      { column: 'product', title: 'PRODUCT', width: 120, filter: { type: 'text' } },
      {
        column: 'bookingLocation',
        title: 'BOOKING LOCATION',
        minWidth: 220,
        filter: { type: 'text' }
      }
    ],
    []
  )

  const server = useMemo(
    () => ({
      debounceMs: 250,
      fetcher: async ({
        pageIndex,
        pageSize,
        sorting,
        columnFilters,
        globalFilter
      }: {
        pageIndex: number
        pageSize: number
        sorting: { id: string; desc: boolean }[]
        columnFilters: { id: string; value: unknown }[]
        globalFilter: string
      }) => {
        const rawSortId = sorting?.[0]?.id ?? ''
        const order = sorting?.[0]?.desc ? 'desc' : 'asc'

        // Map visible column to real server field when possible
        const sortMap: Record<string, string> = {
          trn: 'trn',
          product: 'product',
          bookingLocation: 'bookingLocation',
          customerId: 'customer', // derived client-side
          counterparty: 'counterparty'
        }
        const sortBy = sortMap[rawSortId] ?? ''

        const params: any = {
          limit: pageSize,
          skip: pageIndex * pageSize,
          q: globalFilter ?? '',
          sortBy,
          order,
          filters: JSON.stringify(columnFilters ?? []),
          trnSearch: trnText, // primary filter for this screen
          view: 'enquiry'
        }

        const queryKey = [
          'workdesk',
          moduleConfig.moduleName,
          'enquiry',
          { pageIndex, pageSize, sortBy, order, q: globalFilter ?? '', columnFilters, trnText }
        ] as const

        const res = await apiGet<{
          rows: Array<{
            id: number
            trn: string
            customer: string // e.g. "100006898 - TXOPT TESTING..."
            counterparty: string
            product: string
            bookingLocation: string
          }>
          total: number
        }>({
          endpoint: '/workdesk/search',
          params,
          queryKey
        })

        // Map server rows → grid rows
        const rows: Row[] = res.rows.map((r) => ({
          id: r.id,
          trn: r.trn,
          customerId: String(r.customer ?? '').split(' - ')[0] || String(r.customer ?? ''),
          counterparty: r.counterparty,
          product: r.product,
          bookingLocation: r.bookingLocation
        }))

        // If we sorted by a derived field (e.g., customerId), do it client-side
        if (!sortBy && rawSortId) {
          const id = rawSortId
          const desc = sorting?.[0]?.desc
          rows.sort((a: any, b: any) => {
            const av = a[id],
              bv = b[id]
            const na = Number(av),
              nb = Number(bv)
            const cmp =
              !Number.isNaN(na) && !Number.isNaN(nb)
                ? na - nb
                : String(av).localeCompare(String(bv))
            return desc ? -cmp : cmp
          })
        }

        return { rows, total: res.total }
      }
    }),
    [trnText]
  )

  const headerRightElements: HeaderRightElement[] = [
    // search TRN #
    {
      type: 'text',
      placeholder: 'search TRN #',
      width: 320,
      value: trnText,
      onChange: (e: any) => setTrnText(e?.target?.value ?? ''),
      iconRight: [{ icon: 'search' }]
    },
    // Clear Filter
    {
      type: 'button',
      text: 'Clear Filter',
      variant: 'outlined',
      onClick: () => {
        setTrnText('')
        window.dispatchEvent(new CustomEvent('datatable-clear-filters'))
      }
    }
  ]

  return (
    <MainPageContainer title="Transaction Enquiry">
      <DataTable
        enableGlobalFiltering
        columnSettings={columns}
        serverMode
        server={server as any}
        height={MAIN_PAGE_TABLE_HEIGHT}
        pageSize={20}
        enableDownload
        headerRightElements={headerRightElements}
      />
    </MainPageContainer>
  )
}
