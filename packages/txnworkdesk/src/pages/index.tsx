// packages/txnworkdesk/src/pages/index.tsx
import { useMemo, useState } from 'react'
import { DataTable, Icon, theme, Tooltip, Button } from 'react-components-lib.eaa'
import type { ColumnSetting, HeaderRightElement } from 'react-components-lib.eaa'
import moduleConfig from '../module.config.json'
import { apiGet, apiPatch, MainPageContainer, MAIN_PAGE_TABLE_HEIGHT } from '@app/common'
import { useQueryClient } from '@tanstack/react-query'

/* ---------------------- export util (CSV/XLSX) ---------------------- */
export type ExportColumn = { column: string; title: string }
type ExportOpts = { fileName?: string; format?: 'xlsx' | 'csv'; sheetName?: string }

export async function exportRows(
  rows: any[],
  columns: ExportColumn[],
  opts: ExportOpts = {}
): Promise<void> {
  const fileName = (opts.fileName || 'export').trim() || 'export'
  const format = opts.format || 'xlsx'
  const sheetName = opts.sheetName || 'Data'

  const header = columns.map((c) => c.title)
  const body = (Array.isArray(rows) ? rows : []).map((r) =>
    columns.map((c) => {
      const v = (r as any)?.[c.column]
      if (Array.isArray(v)) return v.map((x) => (x == null ? '' : String(x))).join(',')
      if (v == null) return ''
      return v instanceof Date ? v.toISOString() : v
    })
  )
  const aoa: any[][] = [header, ...body]

  const safeBase = fileName.replace(/\.(xlsx|csv)$/i, '')
  const dl = (blob: Blob, ext: 'xlsx' | 'csv') => {
    const a = document.createElement('a')
    const url = URL.createObjectURL(blob)
    a.href = url
    a.download = `${safeBase}.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (format === 'csv') {
    const esc = (val: any) => {
      const s = val == null ? '' : String(val)
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const csv = aoa.map((row) => row.map(esc).join(',')).join('\n')
    dl(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'csv')
    return
  }

  const getExcelJS = async () => {
    try {
      const mod = await import(/* @vite-ignore */ 'exceljs')
      return (mod as any).default ?? (mod as any)
    } catch {
      const g = (window as any)?.ExcelJS
      if (g) return g
      throw new Error('ExcelJS not found.')
    }
  }
  const ExcelJS = await getExcelJS()
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet(sheetName)
  ws.addRows(aoa)
  const buf: ArrayBuffer = await wb.xlsx.writeBuffer()
  dl(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    'xlsx'
  )
}
/* -------------------------------------------------------------------- */

type Row = {
  id: number
  arn: string
  trn: string
  customer: string
  counterparty: string
  product: string
  step: string
  subStep: string
  lockedBy: string
  stage: string
  lli: string | null
  aml: string | null
  snc: string | null
  clbk: string | null
  cocoa: string | null
  tdOpsApproval: string | null
  customerRef: string
  submissionMode: 'TNG' | 'EML' | 'OTC'
  regDate: string
  relDate: string
  segment: string
  subSegment: string
  splitId: string
}

// helper: N random digits as a string, zero-padded
const randomDigits = (len: number = 6): string => {
  const max = 10 ** len

  // Prefer Web Crypto if available
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    return String(buf[0] % max).padStart(len, '0')
  }

  // Fallback
  return String(Math.floor(Math.random() * max)).padStart(len, '0')
}

const STATUS_WORD_TO_COLOR: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'default'> =
  {
    ZEKE: 'success',
    BOLT: 'warning',
    ECHO: 'info',
    RISK: 'danger',
    NULL: 'default'
  }
const PILL_PALETTES = {
  default: {
    bg: theme.colors.default.pale,
    fg: theme.colors.default.darker,
    tip: 'default' as const
  },
  success: {
    bg: theme.colors.success.pale,
    fg: theme.colors.success.darker,
    tip: 'success' as const
  },
  warning: {
    bg: theme.colors.warning.pale,
    fg: theme.colors.warning.darker,
    tip: 'warning' as const
  },
  info: {
    bg: theme.colors.info?.pale ?? theme.colors.primary.pale,
    fg: theme.colors.info?.darker ?? theme.colors.primary.darker,
    tip: 'info' as const
  },
  danger: { bg: theme.colors.danger.pale, fg: theme.colors.danger.darker, tip: 'danger' as const }
}
function pillEl(value: string | null) {
  const token = String(value ?? '').toUpperCase() || 'NULL'
  const colorKey = (STATUS_WORD_TO_COLOR[token] ?? 'default') as keyof typeof PILL_PALETTES
  const palette = PILL_PALETTES[colorKey]
  return (
    <Tooltip content={token} color={palette.tip as any}>
      <div
        className="w-full text-center block"
        style={{
          background: palette.bg,
          color: palette.fg,
          fontSize: 11,
          lineHeight: '20px',
          padding: '0 6px',
          borderRadius: 0,
          border: 'none',
          width: '100%'
        }}
      >
        {token}
      </div>
    </Tooltip>
  )
}

export default function TxnWorkDesk() {
  const qc = useQueryClient()

  // header controls
  const [trnSearch, setTrnSearch] = useState('')
  const [hideAcr, setHideAcr] = useState(false)
  const [savedFilter, setSavedFilter] = useState<string>('')
  const [isPatching, setIsPatching] = useState(false)

  // columns
  const columns: ColumnSetting[] = useMemo(
    () => [
      { column: 'arn', title: 'ARN #', minWidth: 120, pin: 'pin', filter: { type: 'text' } },
      {
        column: 'trn',
        title: 'TRN #',
        minWidth: 180,
        pin: 'pin',
        cell: ({ rowValue }: any) => (
          <a
            className="underline decoration-dotted hover:opacity-80"
            style={{ color: theme.colors.primary.base }}
          >
            {rowValue.trn}
          </a>
        )
      },
      { column: 'customer', title: 'CUSTOMER', minWidth: 280 },
      {
        column: 'counterparty',
        title: 'COUNTERPARTY',
        minWidth: 160,
        cell: ({ rowValue }: any) => <span className="truncate block">{rowValue.counterparty}</span>
      },
      { column: 'product', title: 'PRODUCT', minWidth: 80 },
      {
        column: 'step',
        title: 'STEP',
        minWidth: 100,
        cell: ({ rowValue }: any) => (
          <a
            className="underline decoration-dotted hover:opacity-80"
            style={{ color: theme.colors.primary.base }}
          >
            {rowValue.step}
          </a>
        )
      },
      { column: 'subStep', title: 'SUB STEP', minWidth: 110 },
      { column: 'lockedBy', title: 'LOCKED BY', minWidth: 110 },
      {
        column: 'stage',
        title: 'STAGE',
        minWidth: 260,
        cell: ({ rowValue }: any) => (
          <div className="flex items-center gap-2">
            <span className="truncate">{rowValue.stage}</span>
            <Icon icon="arrow_right_alt" size={16} />
          </div>
        )
      },
      // COMPLIANCE
      {
        groupTitle: 'COMPLIANCE STATUS',
        column: 'lli',
        title: 'LLI',
        draggable: false,
        width: 75,
        headerAlign: 'center',
        align: 'center',
        cell: ({ rowValue }: any) => pillEl(rowValue.lli)
      },
      {
        groupTitle: 'COMPLIANCE STATUS',
        column: 'aml',
        title: 'AML',
        draggable: false,
        width: 75,
        headerAlign: 'center',
        align: 'center',
        cell: ({ rowValue }: any) => pillEl(rowValue.aml)
      },
      {
        groupTitle: 'COMPLIANCE STATUS',
        column: 'snc',
        title: 'SNC',
        draggable: false,
        width: 75,
        headerAlign: 'center',
        align: 'center',
        cell: ({ rowValue }: any) => pillEl(rowValue.snc)
      },
      {
        groupTitle: 'COMPLIANCE STATUS',
        column: 'clbk',
        title: 'CLBK',
        draggable: false,
        width: 80,
        headerAlign: 'center',
        align: 'center',
        cell: ({ rowValue }: any) => pillEl(rowValue.clbk)
      },
      {
        groupTitle: 'COMPLIANCE STATUS',
        column: 'cocoa',
        title: 'COCOA',
        draggable: false,
        width: 90,
        headerAlign: 'center',
        align: 'center',
        cell: ({ rowValue }: any) => pillEl(rowValue.cocoa)
      },
      {
        groupTitle: 'COMPLIANCE STATUS',
        column: 'tdOpsApproval',
        title: 'TD OPS APPROVAL',
        draggable: false,
        width: 155,
        headerAlign: 'center',
        align: 'center',
        cell: ({ rowValue }: any) => pillEl(rowValue.tdOpsApproval)
      },

      { column: 'customerRef', title: 'CUSTOMER REFERENCE', minWidth: 200 },
      { column: 'submissionMode', title: 'SUBMISSION MODE', minWidth: 140 },
      { column: 'regDate', title: 'REG. DATE', minWidth: 160 },
      { column: 'relDate', title: 'REL. DATE', minWidth: 160 },
      { column: 'segment', title: 'SEGMENT', width: 90, align: 'center' },
      { column: 'subSegment', title: 'SUB SEGMENT', width: 120, align: 'center' },
      { column: 'splitId', title: 'SPLIT ID', width: 100, align: 'right' },
      {
        column: '__actions',
        title: '',
        width: 110,
        align: 'center',
        cell: () => (
          <Button color="default" disabled size="sm">
            Action
          </Button>
        )
      }
    ],
    []
  )

  const server = useMemo(
    () => ({
      debounceMs: 300,
      fetcher: async ({ pageIndex, pageSize, sorting, columnFilters, globalFilter }: any) => {
        const sortBy = sorting?.[0]?.id ?? ''
        const order = sorting?.[0]?.desc ? 'desc' : 'asc'

        const params: any = {
          limit: pageSize,
          skip: pageIndex * pageSize,
          q: globalFilter ?? '',
          sortBy,
          order,
          filters: JSON.stringify(columnFilters ?? []),
          trnSearch,
          hideAcr,
          savedFilter,
          status: 'ALL'
        }

        const key = [
          'workdesk',
          moduleConfig.moduleName,
          'txn',
          {
            pageIndex,
            pageSize,
            sortBy,
            order,
            columnFilters,
            q: globalFilter ?? '',
            trnSearch,
            hideAcr,
            savedFilter,
            status: 'ALL'
          }
        ] as const

        const data = await apiGet<{ rows: Row[]; total: number }>({
          endpoint: '/workdesk/search',
          params,
          queryKey: key
        })

        return data
      }
    }),
    [trnSearch, hideAcr, savedFilter]
  )

  const downloadControls = useMemo(
    () => ({
      fileName: 'txn_work_desk',
      format: 'xlsx' as const,
      showConfigSection: true,
      showBuiltinAll: false,
      showBuiltinSelected: false,
      extraMenuItems: [
        {
          key: 'server-all',
          icon: 'cloud_download',
          label: 'Download ALL from server',
          onClick: async ({ fileName, format }: { fileName: string; format: 'xlsx' | 'csv' }) => {
            const params: any = {
              limit: 0,
              skip: 0,
              trnSearch,
              hideAcr,
              savedFilter,
              status: 'ALL'
            }
            const data = await apiGet<{ rows: Row[]; total: number }>({
              endpoint: '/workdesk/search',
              params
            })
            await exportRows(data.rows, columns as unknown as ExportColumn[], { fileName, format })
          }
        }
      ]
    }),
    [trnSearch, hideAcr, savedFilter, columns]
  )

  // 👇 Single, local function: patch + invalidate + refetch active TXN
  const patchArn2500001 = async () => {
    if (isPatching) return
    setIsPatching(true)
    try {
      const bookingLocation = `KUALA LUMPUR ${randomDigits(6)}`

      await apiPatch({
        endpoint: `/workdesk/ack/booking-location`,
        data: { arn: 2500001, bookingLocation }
      })

      await qc.invalidateQueries({ queryKey: ['workdesk', 'ackworkdesk'] })
    } finally {
      setIsPatching(false)
    }
  }

  const headerRightElements: HeaderRightElement[] = [
    {
      type: 'checkbox',
      text: 'Hide ACR Steps',
      checked: hideAcr,
      onChange: (e: any) => setHideAcr(!!e?.target?.checked)
    },
    {
      type: 'dropdown',
      width: 220,
      placeholder: 'Select saved filter',
      options: [
        { text: '— None —', value: '' },
        { text: 'Maker in-progress', value: 'MKIP' },
        { text: 'Locked by me', value: 'LOCKED_ME' }
      ],
      value: savedFilter,
      onChange: (v: string | string[] | null) =>
        setSavedFilter(Array.isArray(v) ? (v[0] ?? '') : (v ?? '')),
      clearable: true
    },
    {
      type: 'button',
      text: 'Clear',
      variant: 'outlined',
      onClick: () => {
        setTrnSearch('')
        setHideAcr(false)
        setSavedFilter('')
      }
    },
    {
      type: 'button',
      text: isPatching ? 'Updating…' : 'Test: Set ARN 2500001 → KL',
      color: 'warning',
      disabled: isPatching,
      icon: 'edit',
      onClick: patchArn2500001 // ← single local function
    }
  ]

  return (
    <MainPageContainer title="Transaction Work Desk">
      <DataTable
        serverMode
        server={server as any}
        columnSettings={columns}
        height={MAIN_PAGE_TABLE_HEIGHT}
        enableGlobalFiltering
        enableDownload
        downloadControls={downloadControls}
        headerRightElements={headerRightElements}
        pageSize={20}
      />
    </MainPageContainer>
  )
}
