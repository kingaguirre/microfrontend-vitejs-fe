// packages/statement-browser/src/pages/index.tsx
import { useMemo, useState } from 'react'
import { DataTable, Icon, Button, Tooltip, theme } from 'react-components-lib.eaa'
import type { ColumnSetting, HeaderRightElement } from 'react-components-lib.eaa'
import moduleConfig from '../module.config.json'
import { apiGet, MainPageContainer, MAIN_PAGE_TABLE_HEIGHT } from '@app/common'

type Row = {
  id: number
  bookingLocation: string // BOOKING LOCATION
  reportName: string // derived from product + trn
  customer: string
  genStatus: 'QUEUED' | 'RUNNING' | 'DONE' | 'FAILED'
  genDate: string // maps from regDate
  emailDeliveryStatus: 'SENT' | 'PENDING' | 'BOUNCED'
  deliveryDate: string // maps from relDate
  deliveryStatus: 'DELIVERED' | 'SCHEDULED' | 'UNDELIVERED'
}

/** tiny neutral pill for statuses */
function statusPill(
  txt: string,
  tone: 'default' | 'success' | 'warning' | 'danger' | 'info' = 'default'
) {
  const palette = {
    default: { bg: theme.colors.default.pale, fg: theme.colors.default.darker },
    success: { bg: theme.colors.success.pale, fg: theme.colors.success.darker },
    warning: { bg: theme.colors.warning.pale, fg: theme.colors.warning.darker },
    danger: { bg: theme.colors.danger.pale, fg: theme.colors.danger.darker },
    info: {
      bg: theme.colors.info?.pale ?? theme.colors.primary.pale,
      fg: theme.colors.info?.darker ?? theme.colors.primary.darker
    }
  }[tone]

  return (
    <span
      className="inline-block px-2 text-xs"
      style={{ background: palette.bg, color: palette.fg, lineHeight: '18px', borderRadius: 0 }}
    >
      {txt}
    </span>
  )
}

export default function StatementBrowser() {
  // header controls
  const [savedFilter, setSavedFilter] = useState<string>('')

  const columns: ColumnSetting[] = useMemo(
    () => [
      {
        column: 'bookingLocation',
        title: 'BOOKING LOCATION',
        minWidth: 160,
        filter: { type: 'text' }
      },
      {
        column: 'reportName',
        title: 'REPORT NAME',
        minWidth: 240,
        filter: { type: 'text' },
        cell: ({ rowValue }: any) => (
          <a
            className="underline decoration-dotted hover:opacity-80"
            style={{ color: theme.colors.primary.base }}
          >
            {rowValue.reportName}
          </a>
        )
      },
      { column: 'customer', title: 'CUSTOMER', minWidth: 260, filter: { type: 'text' } },

      {
        column: 'genStatus',
        title: 'GENERATION STATUS',
        minWidth: 180,
        filter: { type: 'text' },
        cell: ({ rowValue }: any) => {
          const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
            QUEUED: 'info',
            RUNNING: 'warning',
            DONE: 'success',
            FAILED: 'danger'
          }
          return statusPill(rowValue.genStatus, map[rowValue.genStatus] ?? 'default')
        }
      },
      { column: 'genDate', title: 'GENERATION DATE', minWidth: 160, filter: { type: 'text' } },

      {
        column: 'emailDeliveryStatus',
        title: 'EMAIL DELIVERY STATUS',
        minWidth: 190,
        filter: { type: 'text' },
        cell: ({ rowValue }: any) => {
          const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
            SENT: 'success',
            PENDING: 'warning',
            BOUNCED: 'danger'
          }
          return statusPill(
            rowValue.emailDeliveryStatus,
            map[rowValue.emailDeliveryStatus] ?? 'default'
          )
        }
      },

      { column: 'deliveryDate', title: 'DELIVERY DATE', minWidth: 160, filter: { type: 'text' } },
      {
        column: 'deliveryStatus',
        title: 'DELIVERY STATUS',
        minWidth: 160,
        filter: { type: 'text' },
        cell: ({ rowValue }: any) => {
          const map: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
            DELIVERED: 'success',
            SCHEDULED: 'info',
            UNDELIVERED: 'danger'
          }
          return statusPill(rowValue.deliveryStatus, map[rowValue.deliveryStatus] ?? 'default')
        }
      },

      // actions
      {
        column: '__actions',
        title: 'ACTIONS',
        width: 160,
        align: 'center',
        cell: () => (
          <div className="flex items-center justify-center gap-2">
            <Tooltip content="Download">
              <Button size="sm">
                <Icon icon="download" size={14} /> Download
              </Button>
            </Tooltip>
            <Tooltip content="Re-run">
              <Button size="sm">
                <Icon icon="refresh" size={14} /> Re-run
              </Button>
            </Tooltip>
          </div>
        )
      }
    ],
    []
  )

  // serverMode loader using apiGet (with queryKey for caching)
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
        // server-side sort fields that exist on /workdesk/search
        const rawSortId = sorting?.[0]?.id ?? ''
        const order = sorting?.[0]?.desc ? 'desc' : 'asc'
        const sortMap: Record<string, string> = {
          bookingLocation: 'bookingLocation',
          customer: 'customer',
          genDate: 'regDate',
          deliveryDate: 'relDate'
        }
        const sortBy = sortMap[rawSortId] ?? ''

        const params = {
          limit: pageSize,
          skip: pageIndex * pageSize,
          q: globalFilter ?? '',
          sortBy,
          order,
          filters: JSON.stringify(columnFilters ?? []),
          view: 'reports', // let the server know this is Statement Browser
          savedFilter // DELIVERED_WEEK | FAILED | ""
        }

        const key = [
          'workdesk',
          moduleConfig.moduleName,
          'reports',
          { pageIndex, pageSize, sortBy, order, q: globalFilter ?? '', columnFilters, savedFilter }
        ] as const

        const res = await apiGet<{
          rows: Array<{
            id: number
            bookingLocation: string
            product: string
            trn: string
            customer: string
            regDate: string
            relDate: string
            genStatus?: Row['genStatus']
            emailDeliveryStatus?: Row['emailDeliveryStatus']
            deliveryStatus?: Row['deliveryStatus']
          }>
          total: number
        }>({
          endpoint: '/workdesk/search',
          params,
          queryKey: key // ✅ cached by TanStack Query
        })

        // Map/enrich into the Statement rows shape
        const mapped: Row[] = res.rows.map((r, idx) => {
          const seq = (r.id ?? idx) % 4
          const fallback = {
            genStatus: (['QUEUED', 'RUNNING', 'DONE', 'FAILED'] as const)[seq],
            emailDeliveryStatus: (['PENDING', 'SENT', 'BOUNCED', 'PENDING'] as const)[
              (seq + 1) % 4
            ],
            deliveryStatus: (['SCHEDULED', 'DELIVERED', 'UNDELIVERED', 'SCHEDULED'] as const)[
              (seq + 2) % 4
            ]
          }
          return {
            id: r.id,
            bookingLocation: r.bookingLocation,
            reportName: `${r.product} Statement — ${r.trn}`,
            customer: r.customer,
            genStatus: (r as any).genStatus ?? fallback.genStatus,
            genDate: r.regDate,
            emailDeliveryStatus: (r as any).emailDeliveryStatus ?? fallback.emailDeliveryStatus,
            deliveryDate: r.relDate,
            deliveryStatus: (r as any).deliveryStatus ?? fallback.deliveryStatus
          }
        })

        // Apply column filters client-side (case-insensitive)
        let rows = mapped
        for (const f of columnFilters || []) {
          const id = String(f.id)
          const raw = (f as any).value
          if (raw == null || raw === '') continue
          const needle = String(raw).toLowerCase()
          rows = rows.filter((r: any) =>
            String(r[id] ?? '')
              .toLowerCase()
              .includes(needle)
          )
        }

        // Client sort if not done server-side
        if (!sortBy && rawSortId) {
          const id = rawSortId
          const desc = sorting?.[0]?.desc
          rows = rows.slice().sort((a: any, b: any) => {
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
    [savedFilter]
  )

  const headerRightElements: HeaderRightElement[] = [
    {
      type: 'dropdown',
      width: 240,
      placeholder: 'Select saved filter',
      options: [
        { text: '— None —', value: '' },
        { text: 'Delivered this week', value: 'DELIVERED_WEEK' },
        { text: 'Failed runs', value: 'FAILED' }
      ],
      value: savedFilter,
      onChange: (v: string | string[] | null) =>
        setSavedFilter(Array.isArray(v) ? (v[0] ?? '') : (v ?? '')),
      clearable: true
    },
    {
      type: 'button',
      text: 'Clear Filters',
      variant: 'outlined',
      onClick: () => window.dispatchEvent(new CustomEvent('datatable-clear-filters'))
    }
  ]

  return (
    <MainPageContainer title="Statement Browser">
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
