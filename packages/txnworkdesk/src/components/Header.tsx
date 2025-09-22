// packages/txnworkdesk/src/components/Header.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Icon, theme } from 'react-components-lib.eaa'
import { useGlobalStore } from '@app/common'
import { apiGet } from '@app/common'
import { shallow } from 'zustand/shallow'
import moduleConfig from '../module.config.json'

export type TxnHeader = {
  trn: string
  product: string
  step: string
  subStep: string
  client: string
  bookingLocation: string // SG01 / MY01 / HK01
  bookingLocationName?: string // full name
}

type Props = {
  className?: string
}

// Stable empty slice to avoid creating a new {} each render (prevents re-render loops)
const NULL_SLICE = Object.freeze({ rows: [] as any[], lastError: null as string | null })

// --- helpers ---
const pickHeaderFromRow = (row: any): TxnHeader => ({
  trn: String(row?.trn ?? row?.id ?? ''),
  product: row?.product ?? '-',
  step: row?.step ?? '-',
  subStep: row?.subStep ?? '-',
  client: row?.customer ?? row?.client ?? '-',
  bookingLocation: row?.bookingLocation ?? '-',
  bookingLocationName: row?.bookingLocationName ?? undefined
})

export default function Header({ className = '' }: Props) {
  const { txnNumber = '' } = useParams<{ txnNumber: string }>()
  // Use a stable default + shallow equality to avoid unnecessary re-renders
  const slice = useGlobalStore(
    (s: any) => (s?.store?.[moduleConfig.moduleName] ?? NULL_SLICE)
  )
  const rowsGlobal: any[] = slice?.rows ?? []
  const lastErrorGlobal: string | null = slice?.lastError ?? null

  const isNumeric = /^\d+$/.test(txnNumber)

  // Derive header from global (if available)
  const headerFromGlobal: TxnHeader | null = useMemo(() => {
    if (!txnNumber || rowsGlobal.length === 0) return null
    const n = Number(txnNumber)
    const match =
      rowsGlobal.find((r: any) =>
        isNumeric
          ? String(r?.id ?? '') === String(n) || String(r?.arn ?? '') === String(n)
          : String(r?.trn ?? '') === txnNumber
      ) ?? null
    return match ? pickHeaderFromRow(match) : null
  }, [rowsGlobal, txnNumber, isNumeric])

  const hasGlobal = rowsGlobal.length > 0

  // Local API fallback (only when no global slice exists)
  const [headerApi, setHeaderApi] = useState<TxnHeader | null>(null)
  const [loadingApi, setLoadingApi] = useState<boolean>(false)
  const [errorApi, setErrorApi] = useState<string | null>(null)
  const fetchedFor = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!txnNumber) {
      setHeaderApi(null)
      setErrorApi('Invalid transaction number')
      setLoadingApi(false)
      fetchedFor.current = null
      return
    }

    // If we already have global rows, rely on them and DO NOT fetch locally
    if (hasGlobal) return

    // No global rows — fetch just this header (one-shot, guarded by ref)
    if (fetchedFor.current === txnNumber) return
    fetchedFor.current = txnNumber

    ;(async () => {
      setLoadingApi(true)
      setErrorApi(null)
      try {
        const endpoint = isNumeric
          ? `/txn/id/${Number(txnNumber)}/header`
          : `/txn/${encodeURIComponent(txnNumber)}/header`
        const key = [
          'txnworkdesk',
          moduleConfig.moduleName,
          'txn',
          'header',
          { txnNumber, kind: isNumeric ? 'id' : 'trn' }
        ] as const

        const data = await apiGet<TxnHeader>({ endpoint, queryKey: key })
        if (!cancelled) setHeaderApi(data)
      } catch (e: any) {
        if (!cancelled) setErrorApi(e?.message || 'Failed to load header')
      } finally {
        if (!cancelled) setLoadingApi(false)
      }
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txnNumber, hasGlobal, isNumeric])

  // Final values
  const header = hasGlobal ? headerFromGlobal : headerApi
  const loading = hasGlobal ? false : loadingApi

  // Error precedence (container always mounted; show infobox on errors)
  const error =
    !txnNumber
      ? 'Invalid transaction number'
      : hasGlobal
      ? lastErrorGlobal
        ? `Failed to load transactions: ${lastErrorGlobal}`
        : !headerFromGlobal
        ? 'Transaction not found in the current list. Try searching or reload.'
        : null
      : errorApi

  return (
    <div
      className={`flex items-center gap-3 px-2 bg-white rounded-sm border border-gray-200 mb-3 ${className}`}
      // Always 52px tall
      style={{
        borderTop: `2px solid ${theme.colors.primary.base}`,
        height: '52px',
        minHeight: '52px',
        maxHeight: '52px'
      }}
    >
      {error ? (
        <DangerInfoBox message={error} />
      ) : (
        <>
          <HeaderItem
            label="Transaction Reference Number"
            value={header?.trn}
            loading={loading}
            className="max-w-[210px] flex-[1.2]"
            title={header?.trn}
          />
          <VSeparator />
          <HeaderItem
            label="Product"
            value={header?.product}
            loading={loading}
            className="max-w-[60px] flex-[0.5]"
          />
          <VSeparator />
          <HeaderItem
            label="Step Number"
            value={header?.step}
            loading={loading}
            className="max-w-[90px] flex-[0.5]"
          />
          <VSeparator />
          <HeaderItem
            label="Sub Step"
            value={header?.subStep}
            loading={loading}
            className="max-w-[65px] flex-[0.5]"
          />
          <VSeparator />
          <HeaderItem
            label="Client"
            value={header?.client}
            loading={loading}
            className="min-w-[260px] flex-[2]"
            title={header?.client}
          />
          <VSeparator />
          <HeaderItem
            label="Booking Location"
            value={header?.bookingLocation}
            loading={loading}
            className="max-w-[130px] flex-[0.6]"
            title={header?.bookingLocationName || header?.bookingLocation}
          />
        </>
      )}
    </div>
  )
}

/* vertical divider (full height of header row) */
function VSeparator() {
  return <div className="w-px bg-gray-200 self-stretch" />
}

/* compact item: label over value; VALUE = one line, ellipsis */
function HeaderItem({
  label,
  value,
  loading,
  className = '',
  title
}: {
  label: string
  value?: string | null
  loading: boolean
  className?: string
  title?: string
}) {
  return (
    <div className={`flex flex-col justify-center min-w-0 ${className}`}>
      <div
        className="text-[11px] leading-none uppercase tracking-wide text-gray-500 mb-1 whitespace-nowrap overflow-hidden text-ellipsis"
        title={label}
      >
        {label}
      </div>

      {loading ? (
        <div className="h-[18px] rounded bg-gray-200 animate-pulse w-3/4" />
      ) : (
        <div
          className="text-sm font-semibold text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis"
          title={title ?? value ?? '-'}
          style={{ lineHeight: '18px' }}
        >
          {value ?? '-'}
        </div>
      )}
    </div>
  )
}

/* danger infobox that keeps the header container mounted and within 52px */
function DangerInfoBox({ message }: { message: string }) {
  const bg = theme.colors.danger.pale
  const fg = theme.colors.danger.darker
  const border = theme.colors.danger.base

  return (
    <div
      className="flex items-center gap-2 p-2 rounded-[2px] w-full min-w-0"
      style={{
        background: bg,
        color: fg,
        borderLeft: `4px solid ${border}`,
        overflow: 'hidden'
      }}
      role="alert"
      aria-live="polite"
    >
      <Icon icon="error_outline" size={18} />
      <div className="text-sm whitespace-nowrap overflow-hidden text-ellipsis" title={message}>
        <strong className="mr-1">Error:</strong>
        <span>{message}</span>
      </div>
    </div>
  )
}
