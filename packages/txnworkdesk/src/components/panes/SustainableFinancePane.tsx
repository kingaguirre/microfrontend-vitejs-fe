import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FormRenderer } from 'react-components-lib.eaa'
import { apiGet } from '@app/common'
import moduleConfig from '../../module.config.json'
import type { PaneHandle } from '../../components/SplitPanelLazy'

type SustainableData = {
  sustainableFlag: boolean | null
  classification: string
  empoweredStatus: boolean | null
  empoweredDate: string
  remarks: string
  othersSpecify: string
}

const EMPTY: SustainableData = {
  sustainableFlag: null,
  classification: '',
  empoweredStatus: null,
  empoweredDate: '',
  remarks: '',
  othersSpecify: ''
}

export default function SustainableFinancePane({
  onRegisterHandle,
  disabled
}: {
  onRegisterHandle?: (h: PaneHandle | null) => void
  disabled?: boolean
}) {
  const { txnNumber = '' } = useParams<{ txnNumber: string }>()
  const formRef = useRef<any>(null)

  const [values, setValues] = useState<SustainableData | null>(null)
  const [loadingFetch, setLoadingFetch] = useState(true)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Expose submit to SplitPanelLazy footer (match GeneralDetails)
  useEffect(() => {
    if (!onRegisterHandle) return
    const handle: PaneHandle = {
      submit: () => formRef.current?.submit?.()
    }
    onRegisterHandle(handle)
    return () => onRegisterHandle(null)
  }, [onRegisterHandle])

  // Fetch (cached) — mirrors your GeneralDetailsPane pattern
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoadingFetch(true)
      setError(null)
      try {
        const isNumeric = /^\d+$/.test(txnNumber)
        const endpoint = isNumeric
          ? `/txn/id/${Number(txnNumber)}/sustainable`
          : `/txn/${encodeURIComponent(txnNumber)}/sustainable`

        const key = [
          'txnworkdesk',
          moduleConfig.moduleName,
          'txn',
          'sustainable',
          { txnNumber, kind: isNumeric ? 'id' : 'trn' }
        ] as const

        const data = await apiGet<SustainableData>({ endpoint, queryKey: key })
        if (cancelled) return
        setValues({ ...EMPTY, ...data })
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load sustainable finance')
      } finally {
        if (!cancelled) setLoadingFetch(false)
      }
    }
    if (txnNumber) load()
    return () => {
      cancelled = true
    }
  }, [txnNumber])

  // Zod validations + placeholders (same style as your GeneralDetailsPane)
  const fieldSettings: any[] = useMemo(
    () => [
      {
        header: 'Sustainable Finance',
        fields: [
          {
            name: 'sustainableFlag',
            label: 'Sustainable Finance Flag',
            type: 'radio',
            options: [
              { label: 'Yes', value: true },
              { label: 'No', value: false }
            ],
            validation: (z: any) =>
              z.boolean().or(z.null()).refine((v: any) => v !== null, 'Required')
          },
          {
            name: 'classification',
            label: 'Sustainable Finance Classification',
            type: 'select',
            placeholder: 'Select Option',
            options: [
              { label: 'Green', value: 'GREEN' },
              { label: 'Sustainability-Linked', value: 'SL' },
              { label: 'Transition', value: 'TRANSITION' },
              { label: 'Others', value: 'OTHERS' }
            ],
            validation: (z: any) => z.string().optional()
          },
          {
            name: 'empoweredStatus',
            label: 'Empowered Approval Status',
            type: 'radio',
            options: [
              { label: 'Yes', value: true },
              { label: 'No', value: false }
            ],
            validation: (z: any) => z.boolean().or(z.null()).optional()
          },
          {
            name: 'empoweredDate',
            label: 'Empowered Approval Date',
            type: 'date',
            placeholder: 'Select Date',
            validation: (z: any) => z.string().optional()
          },
          {
            name: 'remarks',
            label: 'Sustainable Finance Remarks',
            type: 'text',
            placeholder: 'Select Remarks',
            validation: (z: any) => z.string().required('Sustainable Finance Remarks is mandatory')
          },
          {
            name: 'othersSpecify',
            label: 'Others Specify',
            type: 'textarea',
            placeholder: '-',
            maxLength: 65,
            validation: (z: any) => z.string().max(65, 'Max 65 characters')
          }
        ]
      }
    ],
    []
  )

  const handleChange = (v: any) => setValues(v)

  // Submit — follow your GeneralDetails behavior (no server write, just log + spinner)
  const handleSubmit = async (v: any) => {
    try {
      setLoadingSubmit(true)
      console.log('[SustainableFinancePane] submitted:', v)
    } finally {
      setLoadingSubmit(false)
    }
  }

  return error ? (
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
  )
}
