import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FormRenderer } from 'react-components-lib.eaa'
import { apiGet } from '@app/common'
import moduleConfig from '../../module.config.json'
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

export default function GeneralDetailsPane({
  onRegisterHandle,
  disabled
}: {
  onRegisterHandle?: (h: PaneHandle | null) => void
  disabled?: boolean
}) {
  const { txnNumber = '' } = useParams<{ txnNumber: string }>()
  const formRef = useRef<any>(null)

  const [values, setValues] = useState<GeneralDetails | null>(null)
  const [loadingFetch, setLoadingFetch] = useState(true)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Expose submit to SplitPanelLazy footer
  useEffect(() => {
    if (!onRegisterHandle) return
    const handle: PaneHandle = {
      submit: () => formRef.current?.submit?.()
    }
    onRegisterHandle(handle)
    return () => onRegisterHandle(null)
  }, [onRegisterHandle])

  // Fetch (cached)
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoadingFetch(true)
      setError(null)
      try {
        const isNumeric = /^\d+$/.test(txnNumber)
        const endpoint = isNumeric
          ? `/txn/id/${Number(txnNumber)}/general`
          : `/txn/${encodeURIComponent(txnNumber)}/general`

        const key = [
          'txnworkdesk',
          moduleConfig.moduleName,
          'txn',
          'general',
          { txnNumber, kind: isNumeric ? 'id' : 'trn' }
        ] as const

        const raw = await apiGet<GeneralDetails>({ endpoint, queryKey: key })
        if (cancelled) return
        setValues({ ...raw, valueDate: dashDate(raw.valueDate) })
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load general details')
      } finally {
        if (!cancelled) setLoadingFetch(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [txnNumber])

  // Zod validations + placeholders
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

  const handleSubmit = async (v: any) => {
    // Hook up PATCH/POST as needed
    try {
      setLoadingSubmit(true)
      console.log('[GeneralDetailsPane] submitted:', v)
    } finally {
      setLoadingSubmit(false)
    }
  }

  return (
    <>
      {error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : (
        <FormRenderer
          ref={formRef}
          disabled={disabled}
          fieldSettings={fieldSettings}
          dataSource={values ?? {}}
          onChange={handleChange}
          onSubmit={handleSubmit}
          loading={loadingFetch || loadingSubmit}
        />
      )}
    </>
  )
}
