import { useEffect, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { DataTable, Panel } from 'react-components-lib.eaa'
import type { ColumnSetting } from 'react-components-lib.eaa'
import { apiGet } from '@app/common'
import moduleConfig from '../../module.config.json'
import type { PaneHandle } from '../../components/SplitPanelLazy'

type ExceptionRow = {
  id: string | number
  code: string
  description: string
  department: string
}

type Props = {
  onRegisterHandle?: (h: PaneHandle | null) => void
  disabled?: boolean
}

export default function ExceptionDetailsPane({ onRegisterHandle, disabled = false }: Props) {
  const { txnNumber = '' } = useParams<{ txnNumber: string }>()
  const noopRef = useRef<PaneHandle>({
    submit: () => {},
    validate: () => true,
    reset: () => {}
  })

  // register a no-op handle so footer buttons won’t explode
  useEffect(() => {
    onRegisterHandle?.(noopRef.current)
    return () => onRegisterHandle?.(null)
  }, [onRegisterHandle])

  const columns: ColumnSetting[] = useMemo(
    () => [
      { column: 'code', title: 'EXCEPTION CODE', minWidth: 180 },
      { column: 'description', title: 'DESCRIPTION', minWidth: 320, grow: 1 },
      { column: 'department', title: 'DEPARTMENT', minWidth: 160 }
    ],
    []
  )

  const server = useMemo(
    () => ({
      debounceMs: 300,
      fetcher: async ({ pageIndex, pageSize, sorting, columnFilters, globalFilter }: any) => {
        const isNumeric = /^\d+$/.test(txnNumber)
        const endpoint = isNumeric
          ? `/txn/id/${Number(txnNumber)}/exceptions`
          : `/txn/${encodeURIComponent(txnNumber)}/exceptions`

        const sortBy = sorting?.[0]?.id ?? ''
        const order = sorting?.[0]?.desc ? 'desc' : 'asc'

        const params: any = {
          limit: pageSize,
          skip: pageIndex * pageSize,
          q: globalFilter ?? '',
          sortBy,
          order,
          filters: JSON.stringify(columnFilters ?? [])
        }

        const key = [
          'txnworkdesk',
          moduleConfig.moduleName,
          'txn',
          'exceptions',
          {
            txnNumber,
            kind: isNumeric ? 'id' : 'trn',
            pageIndex,
            pageSize,
            sortBy,
            order,
            columnFilters,
            q: globalFilter ?? ''
          }
        ] as const

        try {
          // If your server doesn’t have this route yet, this will 404.
          // We gracefully fall back to an empty grid to match the screenshot.
          const data = await apiGet<{ rows: ExceptionRow[]; total: number }>({
            endpoint,
            params,
            queryKey: key
          })
          return data
        } catch {
          return { rows: [], total: 0 }
        }
      }
    }),
    [txnNumber]
  )

  return (
    <Panel title="Exception Details" hideShadow>
      <DataTable
        serverMode
        server={server as any}
        columnSettings={columns}
        pageSize={20}
        enableGlobalFiltering
        enableDownload
        disabled={disabled}
        maxHeight='250px'
      />
    </Panel>
  )
}
