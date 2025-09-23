// packages/txnworkdesk/src/pages/panes/GeneralDetailsPane.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FormRenderer, Icon, theme } from 'react-components-lib.eaa'
import { apiGet, apiPatch, useAlertStore, useGlobalStore } from '@app/common'
import moduleConfig from '../../module.config.json'
import { useQueryClient } from '@tanstack/react-query'
import type { PaneHandle } from '../../components/SplitPanelLazy'

type GeneralDetails = {
  ackNumber: number
  submissionMode: string
  financeType: string
  productGroup: string
  btcId: string
  limitGroupId: string
  valueDateOption: string
  valueDate: string
  summaryListing: string
  submissionBranch: string
  clientReference: string
  isIslamicTransaction: boolean
  reviewFlag: boolean
  almApprovalReceived: boolean
  emailIndemnityHeld: string
  clientRemarks: string
  signatureVerified: boolean
  counterparty: string
}

const dashDate = (s: string | null | undefined): string => {
  if (!s) return ''
  const m = String(s).match(/^(\d{2})\s([A-Za-z]{3})\s(\d{4})/)
  return m ? `${m[1]}-${m[2]}-${m[3]}` : s
}

const normalizeGeneral = (g: any): GeneralDetails => ({
  ackNumber: Number(g?.ackNumber ?? 0),
  submissionMode: g?.submissionMode ?? '',
  financeType: g?.financeType ?? '',
  productGroup: g?.productGroup ?? '',
  btcId: g?.btcId ?? '',
  limitGroupId: g?.limitGroupId ?? '',
  valueDateOption: g?.valueDateOption ?? '',
  valueDate: dashDate(g?.valueDate ?? ''),
  summaryListing: g?.summaryListing ?? '',
  submissionBranch: g?.submissionBranch ?? '',
  clientReference: g?.clientReference ?? '',
  isIslamicTransaction: !!g?.isIslamicTransaction,
  reviewFlag: !!g?.reviewFlag,
  almApprovalReceived: !!g?.almApprovalReceived,
  emailIndemnityHeld: g?.emailIndemnityHeld ?? '',
  clientRemarks: g?.clientRemarks ?? '',
  signatureVerified: !!g?.signatureVerified,
  counterparty: g?.counterparty ?? ''
})

// stable empty slice to avoid re-renders
const NULL_SLICE = Object.freeze({ rows: [] as any[], detailByTrn: {} as any, lastError: null as string | null })
const MODULE_NAME = moduleConfig.moduleName

export default function GeneralDetailsPane({
  onRegisterHandle,
  ...rest
}: {
  onRegisterHandle?: (h: PaneHandle | null) => void,
}) {
  const qc = useQueryClient()
  const { txnNumber = '' } = useParams<{ txnNumber: string }>()
  const formRef = useRef<any>(null)

  // expose submit to SplitPanelLazy footer
  useEffect(() => {
    if (!onRegisterHandle) return
    const handle: PaneHandle = {
      submit: () => formRef.current?.submit?.()}
    onRegisterHandle(handle)
    return () => onRegisterHandle(null)
  }, [onRegisterHandle])

  // ===== GLOBAL STATE LOOKUP =====
  const slice = useGlobalStore((s: any) => (s?.store?.[MODULE_NAME] ?? NULL_SLICE))
  const rowsGlobal: any[] = slice?.rows ?? []
  const detailByTrn: any = slice?.detailByTrn ?? {}
  const isNumeric = /^\d+$/.test(txnNumber)

  // prefer cached detailed general if present (we store it under detailByTrn[trn].general)
  const cachedGeneral = useMemo(() => {
    if (!txnNumber) return null
    const bucket = detailByTrn?.[txnNumber]
    const payload = bucket?.general ?? bucket // tolerate direct storage
    return payload ? normalizeGeneral(payload) : null
  }, [detailByTrn, txnNumber])

  // seed from rows if we have a matching row (lightweight optimistic fill)
  const seedFromRow = useMemo<Partial<GeneralDetails> | null>(() => {
    if (!txnNumber || rowsGlobal.length === 0) return null
    const n = Number(txnNumber)
    const match =
      rowsGlobal.find((r: any) =>
        isNumeric
          ? String(r?.id ?? '') === String(n) || String(r?.arn ?? '') === String(n)
          : String(r?.trn ?? '') === txnNumber
      ) ?? null
    if (!match) return null
    return {
      submissionMode: match?.submissionMode ?? '',
      clientReference: match?.customerRef ?? '',
      counterparty: match?.counterparty ?? ''
    }
  }, [rowsGlobal, txnNumber, isNumeric])

  // ===== LOCAL STATE (only for this pane) =====
  const [values, setValues] = useState<GeneralDetails | null>(cachedGeneral ?? (seedFromRow ? normalizeGeneral(seedFromRow) : null))
  const [loadingFetch, setLoadingFetch] = useState<boolean>(false)
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const fetchedFor = useRef<string | null>(null)

  // keep values in sync when cachedGeneral arrives later
  useEffect(() => {
    if (cachedGeneral) setValues(cachedGeneral)
  }, [cachedGeneral])

  // fetch if we have no cached state yet
  useEffect(() => {
    let cancelled = false

    if (!txnNumber) {
      setError('Invalid transaction number')
      setValues(null)
      setLoadingFetch(false)
      fetchedFor.current = null
      return
    }

    if (cachedGeneral) {
      setError(null)
      setLoadingFetch(false)
      return
    }

    // avoid refetching same txnNumber
    if (fetchedFor.current === txnNumber) return
    fetchedFor.current = txnNumber

    ;(async () => {
      try {
        setLoadingFetch(true)
        setError(null)

        const endpoint = isNumeric
          ? `/txn/id/${Number(txnNumber)}/general`
          : `/txn/${encodeURIComponent(txnNumber)}/general`

        const key = [
          'txnworkdesk',
          MODULE_NAME,
          'txn',
          'general',
          { txnNumber, kind: isNumeric ? 'id' : 'trn' }
        ] as const

        const raw = await apiGet<any>({ endpoint, queryKey: key })
        if (cancelled) return
        const normalized = normalizeGeneral(raw)
        setValues(normalized)

        // persist to global for cross-screen reuse
        const gs = useGlobalStore.getState()
        const prev: any = (gs.store as any)?.[MODULE_NAME] ?? {}
        const nextDetail = { ...(prev.detailByTrn ?? {}), [txnNumber]: { ...(prev.detailByTrn?.[txnNumber] ?? {}), general: normalized } }
        gs.setStateFor(MODULE_NAME, { ...prev, detailByTrn: nextDetail })
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load general details')
      } finally {
        if (!cancelled) setLoadingFetch(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [txnNumber, isNumeric, cachedGeneral])

  // ===== FORM CONFIG =====
  const fieldSettings: any[] = useMemo(
    () => [
      {
        header: 'General Details',
        fields: [
          {
            name: 'ackNumber',
            label: 'Acknowledgement Number',
            type: 'number',
            placeholder: 'Enter acknowledgement number',
            validation: (z: any) => z.number().positive('Acknowledgement number is mandatory')
          },
          {
            name: 'submissionMode',
            label: 'Submission Mode',
            type: 'text',
            placeholder: 'e.g., TNG - Trade Nextgen',
            validation: (z: any) => z.string().required('Submission Mode is mandatory')
          },
          {
            name: 'financeType',
            label: 'Finance Type',
            type: 'text',
            placeholder: 'e.g., EIF - Export Invoice Financing',
            validation: (z: any) => z.string().required('Finance Type is mandatory')
          },
          {
            name: 'productGroup',
            label: 'Product Group',
            type: 'text',
            placeholder: 'e.g., RF - Receivable finance',
            validation: (z: any) => z.string().required('Product Group is mandatory')
          },
          { name: 'btcId', label: 'BTC ID', type: 'text', placeholder: 'SG01xxxxxxxxEIF0101' },
          {
            name: 'limitGroupId',
            label: 'Limit Group ID',
            type: 'text',
            placeholder: 'e.g., 1 - GTF-Default',
            validation: (z: any) => z.string().required('Limit Group ID is mandatory')
          },
          {
            name: 'valueDateOption',
            label: 'Value Date Option',
            type: 'text',
            placeholder: 'e.g., PD - PROCESSING DATE',
            validation: (z: any) => z.string().required('Value Date Option is mandatory')
          },
          { name: 'valueDate', label: 'Value Date', type: 'text', placeholder: 'DD-MMM-YYYY' },
          {
            name: 'summaryListing',
            label: 'Summary Listing',
            type: 'text',
            placeholder: 'e.g., SML01 - Allowed'
          },
          {
            name: 'submissionBranch',
            label: 'Submission Branch',
            type: 'select',
            options: [
              { label: 'SG01', value: 'SG01' },
              { label: 'MY01', value: 'MY01' },
              { label: 'HK01', value: 'HK01' }
            ],
            placeholder: 'Select Submission Branch'
          },
          {
            name: 'clientReference',
            label: 'Client Reference',
            type: 'text',
            placeholder: 'Enter client reference'
          },
          {
            name: 'emailIndemnityHeld',
            label: 'Email Indemnity Held',
            type: 'select',
            options: [
              { label: 'Required', value: 'Required' },
              { label: 'Not Required', value: 'Not Required' }
            ],
            placeholder: 'Select Option'
          },
          { name: 'isIslamicTransaction', label: 'Islamic Transaction', type: 'checkbox' },
          { name: 'reviewFlag', label: 'Review Flag', type: 'checkbox' },
          { name: 'almApprovalReceived', label: 'ALM Approval Received', type: 'checkbox' },
          {
            name: 'clientRemarks',
            label: 'Client Remarks',
            type: 'textarea',
            rows: 4,
            placeholder: 'Enter Client Remarks..'
          },
          {
            name: 'counterparty',
            label: 'Counter Party',
            type: 'text',
            placeholder: 'Enter counterparty'
          },
          { name: 'signatureVerified', label: 'Signature Verification', type: 'checkbox' }
        ]
      }
    ],
    []
  )

  const handleChange = (v: any) => setValues(v)

  const handleSubmit = async (res: any) => {
    // FormRenderer may return either raw values or a { valid, values, invalidFields, updated } envelope
    const result =
      res && typeof res === 'object' && ('valid' in res || 'invalidFields' in res || 'updated' in res)
        ? res
        : { valid: true, values: res, invalidFields: [], updated: true };

    if (!result.valid) {
      return;
    }

    // Only save when the form actually changed
    const isUpdated = 'updated' in result ? !!result.updated : true;
    if (!isUpdated) {
      useAlertStore.setAlert({
        title: 'No changes',
        content: 'Nothing to save — the form has no changes.',
        color: 'info',
        icon: 'info',
        placement: 'top-right',
        closeDelay: 3500,
      });
      return;
    }

    const v = result.values;

    try {
      setLoadingSubmit(true);

      const isNumeric = /^\d+$/.test(txnNumber);
      const endpoint = isNumeric
        ? `/txn/id/${Number(txnNumber)}/general`
        : `/txn/${encodeURIComponent(txnNumber)}/general`;

      const updated = await apiPatch<any>({ endpoint, data: v });

      const normalized = normalizeGeneral(updated);
      setValues(normalized);

      // Update global cache so other panes reflect changes
      const gs = useGlobalStore.getState();
      const prev: any = (gs.store as any)?.[MODULE_NAME] ?? {};
      const nextDetail = {
        ...(prev.detailByTrn ?? {}),
        [txnNumber]: { ...(prev.detailByTrn?.[txnNumber] ?? {}), general: normalized },
      };
      gs.setStateFor(MODULE_NAME, { ...prev, detailByTrn: nextDetail });

      // Success toast (top-right)
      useAlertStore.setAlert({
        title: 'Saved',
        content: 'General details updated successfully.',
        color: 'success',
        icon: 'check_circle',
        placement: 'top-right',
        closeDelay: 4000,
      });

      // invalidate cache
      await qc.invalidateQueries({ queryKey: ['workdesk', MODULE_NAME, 'txn', 'catalog'] })
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <>
      <FormRenderer
        {...rest}
        disabled={loadingSubmit || (rest as any)?.disabled}
        ref={formRef}
        fieldSettings={fieldSettings}
        dataSource={values ?? {}}
        onChange={handleChange}
        onSubmit={handleSubmit}
        loading={loadingFetch}
      />
      {error && <DangerInfoBox message={error} />}
    </>
  )
}

export function DangerInfoBox({ message }: { message: string }) {
  const bg = theme.colors.danger.pale
  const fg = theme.colors.danger.darker
  const border = theme.colors.danger.base
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded m-3"
      style={{ background: bg, color: fg, borderLeft: `4px solid ${border}` }}
      role="alert"
      aria-live="polite"
    >
      <Icon icon="error_outline" size={18} />
      <div className="text-sm">
        <strong className="mr-1">Network error:</strong>
        <span>{message}</span>
      </div>
    </div>
  )
}
