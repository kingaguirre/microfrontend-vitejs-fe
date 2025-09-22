import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { theme } from 'react-components-lib.eaa'
import { apiGet } from '@app/common'
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

export default function Header({ className = '' }: Props) {
  const { txnNumber = '' } = useParams<{ txnNumber: string }>()
  const [header, setHeader] = useState<TxnHeader | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const isNumeric = /^\d+$/.test(txnNumber)
        const endpoint = isNumeric
          ? `/txn/id/${Number(txnNumber)}/header`
          : `/txn/${encodeURIComponent(txnNumber)}/header`

        // cache-friendly key (same pattern you use elsewhere)
        const key = [
          'txnworkdesk',
          moduleConfig.moduleName,
          'txn',
          'header',
          { txnNumber, kind: isNumeric ? 'id' : 'trn' }
        ] as const

        const data = await apiGet<TxnHeader>({ endpoint, queryKey: key })
        if (!cancelled) setHeader(data)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load header')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (txnNumber) load()
    else {
      setHeader(null)
      setLoading(false)
      setError('Invalid transaction number')
    }

    return () => {
      cancelled = true
    }
  }, [txnNumber])

  if (error) {
    return (
      <div className="text-sm text-red-600 mb-3">Failed to load transaction header: {error}</div>
    )
  }

  return (
    <div
      className={`flex rounded-[2px] items-stretch gap-3 px-2 py-2 bg-white rounded-sm border border-gray-200 mb-3 ${className}`}
      style={{ borderTop: `2px solid ${theme.colors.primary.base}` }} // primary border-top
    >
      <HeaderItem
        label="Transaction Reference Number"
        value={header?.trn}
        loading={loading}
        className="max-w-[210px] flex-[1.2] truncate"
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
        className="min-w-[260px] flex-[2] truncate"
        title={header?.client}
        truncate
      />
      <VSeparator />
      <HeaderItem
        label="Booking Location"
        value={header?.bookingLocation}
        loading={loading}
        className="max-w-[130px] flex-[0.6]"
        title={header?.bookingLocationName || header?.bookingLocation}
      />
    </div>
  )
}

/* vertical divider (full height of header row) */
function VSeparator() {
  return <div className="w-px bg-gray-200 self-stretch" />
}

/* compact item: label over value; value shows skeleton when loading */
function HeaderItem({
  label,
  value,
  loading,
  className = '',
  title,
  truncate
}: {
  label: string
  value?: string | null
  loading: boolean
  className?: string
  title?: string
  truncate?: boolean
}) {
  return (
    <div className={`flex flex-col justify-center ${className}`}>
      {/* label in gray-500 */}
      <div className="text-[11px] leading-none uppercase tracking-wide text-gray-500 mb-1">
        {label}
      </div>

      {/* value in gray-700, or skeleton when loading */}
      {loading ? (
        <div className="h-[18px] rounded bg-gray-200 animate-pulse w-3/4" />
      ) : (
        <div
          className={`text-sm font-semibold text-gray-700 ${truncate ? 'truncate' : ''}`}
          title={title ?? value ?? '-'}
          style={{ lineHeight: '18px' }}
        >
          {value ?? '-'}
        </div>
      )}
    </div>
  )
}
