import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FormRenderer } from 'react-components-lib.eaa'
import { apiGet } from '@app/common'
import moduleConfig from '../../module.config.json'
import type { PaneHandle } from '../../components/SplitPanelLazy'

type DocDetailRow = {
  number: string
  currency: string
  amount: number
  issueDate: string
  dueDate: string
  eligibleAmt: number
  maxMaturityDate: string
  status: string
}

type GoodsRow = {
  description: string
  hsCode: string
  country: string
}

type PartyRow = {
  role: string
  partyId: string
  partyName: string
  partyType: string
}

type InstallmentRow = {
  percentage: number
  currency: string
  amount: number
  dueDate: string
  eligibleAmount: number
  maxMaturityDate: string
}

type DocumentsModel = {
  // --- Batch Details (top)
  batchType: string
  batchAmountCurrency: string
  batchAmount: number | ''
  batchCount: number | ''
  nonFactored: boolean
  maxEligibleCurrency: string
  maxEligibleAmount: number | ''
  batchAdjustmentCurrency: string
  batchAdjustmentAmount: number | ''
  originalInvoiceSubmissionDate: string
  statementDate: string
  manualLLITrigger: boolean

  // --- Main document form (2nd screenshot)
  documentNumber: string
  documentAmountCurrency: string
  documentAmount: number | ''
  adjustmentAmountCurrency: string
  adjustmentAmount: number | ''
  counterpartyName: string
  documentIssueDate: string
  documentTenor: string
  paymentTerms: string
  documentDueDate: string
  incoterms: string
  eligibleAmountCurrency: string
  eligibleAmount: number | ''
  maxMaturityDate: string
  documentApprovalStatus: string
  overrideDocStatus: string
  overrideReason: string

  // --- Tables
  docDetailRows: DocDetailRow[]
  goodsRows: GoodsRow[]
  partyRows: PartyRow[]
  installmentRows: InstallmentRow[]
}

const EMPTY: DocumentsModel = {
  batchType: '',
  batchAmountCurrency: 'SGD',
  batchAmount: '',
  batchCount: '',
  nonFactored: false,
  maxEligibleCurrency: 'SGD',
  maxEligibleAmount: '',
  batchAdjustmentCurrency: 'SGD',
  batchAdjustmentAmount: '',
  originalInvoiceSubmissionDate: '',
  statementDate: '',
  manualLLITrigger: false,

  documentNumber: '',
  documentAmountCurrency: 'SGD',
  documentAmount: '',
  adjustmentAmountCurrency: 'SGD',
  adjustmentAmount: '',
  counterpartyName: '',
  documentIssueDate: '',
  documentTenor: '',
  paymentTerms: '',
  documentDueDate: '',
  incoterms: '',
  eligibleAmountCurrency: 'SGD',
  eligibleAmount: '',
  maxMaturityDate: '',
  documentApprovalStatus: '',
  overrideDocStatus: '',
  overrideReason: '',

  docDetailRows: [],
  goodsRows: [],
  partyRows: [],
  installmentRows: [],
}

export default function DocumentsPane({
  onRegisterHandle,
  disabled,
}: {
  onRegisterHandle?: (h: PaneHandle | null) => void
  disabled?: boolean
}) {
  const { txnNumber = '' } = useParams<{ txnNumber: string }>()
  const formRef = useRef<any>(null)

  const [values, setValues] = useState<DocumentsModel | null>(null)
  const [loadingFetch, setLoadingFetch] = useState(true)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // expose only submit (same pattern you asked for)
  useEffect(() => {
    if (!onRegisterHandle) return
    onRegisterHandle({ submit: () => formRef.current?.submit?.() })
    return () => onRegisterHandle(null)
  }, [onRegisterHandle])

  // fetch with cache key
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadingFetch(true)
      setError(null)
      try {
        const isNumeric = /^\d+$/.test(txnNumber)
        const endpoint = isNumeric
          ? `/txn/id/${Number(txnNumber)}/documents`
          : `/txn/${encodeURIComponent(txnNumber)}/documents`

        const key = [
          'txnworkdesk',
          moduleConfig.moduleName,
          'txn',
          'documents',
          { txnNumber, kind: isNumeric ? 'id' : 'trn' },
        ] as const

        const data = await apiGet<DocumentsModel>({ endpoint, queryKey: key })
        if (!cancelled) setValues({ ...EMPTY, ...data })
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load documents')
      } finally {
        if (!cancelled) setLoadingFetch(false)
      }
    }
    if (txnNumber) load()
    return () => {
      cancelled = true
    }
  }, [txnNumber])

  const fieldSettings: any[] = useMemo(
    () => [
      // --- BATCH DETAILS ---
      {
        header: 'DOCUMENT DETAILS',
        fields: [
          {
            header: 'BATCH DETAILS',
            isSubHeader: true,
            fields: [
              {
                name: 'batchType',
                label: 'Batch Type',
                type: 'text',
                placeholder: 'INV - INVOICE',
                validation: (z: any) => z.string().required('Batch Type is mandatory'),
              },
              {
                name: 'batchAmountCurrency',
                label: 'Batch Amount (Currency)',
                type: 'dropdown',
                options: [{ label: 'SGD', value: 'SGD' }, { label: 'MYR', value: 'MYR' }, { label: 'HKD', value: 'HKD' }],
              },
              {
                name: 'batchAmount',
                label: 'Batch Amount',
                type: 'number',
                placeholder: 'Enter Amount',
                validation: (z: any) => z.number().positive('Batch Amount is mandatory'),
              },
              {
                name: 'batchCount',
                label: 'Batch Count',
                type: 'number',
                placeholder: '1',
                validation: (z: any) => z.number().int().positive('Batch Count is mandatory'),
              },
              { name: 'nonFactored', label: 'Non-Factored Document', type: 'checkbox' },

              {
                name: 'maxEligibleCurrency',
                label: 'Max Eligible Finance Amount (Cur)',
                type: 'dropdown',
                options: [{ label: 'SGD', value: 'SGD' }, { label: 'MYR', value: 'MYR' }, { label: 'HKD', value: 'HKD' }],
              },
              {
                name: 'maxEligibleAmount',
                label: 'Max Eligible Finance Amount',
                type: 'number',
                placeholder: 'Enter Amount',
              },

              {
                name: 'batchAdjustmentCurrency',
                label: 'Batch Adjustment Amount (Cur)',
                type: 'dropdown',
                options: [{ label: 'SGD', value: 'SGD' }, { label: 'MYR', value: 'MYR' }, { label: 'HKD', value: 'HKD' }],
              },
              {
                name: 'batchAdjustmentAmount',
                label: 'Batch Adjustment Amount',
                type: 'number',
                placeholder: 'Enter Amount',
                validation: (z: any) => z.number().nonnegative('Required'),
              },

              {
                name: 'originalInvoiceSubmissionDate',
                label: 'Original Invoice Submission Date',
                type: 'date',
                placeholder: 'Select Date',
                validation: (z: any) => z.string().required('Original Invoice Submission Date is mandatory'),
              },
              {
                name: 'statementDate',
                label: 'Statement Date',
                type: 'date',
                placeholder: 'Select Date',
                validation: (z: any) => z.string().required('Statement Date is mandatory'),
              },
              { name: 'manualLLITrigger', label: 'Manual LLI Trigger', type: 'checkbox' },
            ]
          }
        ],
      },

      {
        tabs: [
          {
            title: 'Document Details',
            fields: [
              {
                header: 'document details',
                isSubHeader: true,
                dataTable: {
                  header: 'DOCUMENT DETAILS',
                  isSubHeader: true,
                  config: {
                    dataSource: 'docDetailRows',
                    columnSettings: [
                      { title: 'NUMBER', column: 'number' },
                      { title: 'CURRENCY', column: 'currency' },
                      { title: 'AMOUNT', column: 'amount' },
                      { title: 'DOCUMENT ISSUE DATE', column: 'issueDate' },
                      { title: 'DUE DATE', column: 'dueDate' },
                      { title: 'ELIGIBLE AMT', column: 'eligibleAmt' },
                      { title: 'MAX MATURITY DATE', column: 'maxMaturityDate' },
                      { title: 'STATUS', column: 'status' },
                    ],
                  },
                  fields: [
                    { name: 'number', label: 'Number', type: 'text', placeholder: 'Enter number', validation: (z: any) => z.string().min(1) },
                    { name: 'currency', label: 'Currency', type: 'dropdown', options: [{ label: 'SGD', value: 'SGD' }, { label: 'MYR', value: 'MYR' }, { label: 'HKD', value: 'HKD' }] },
                    { name: 'amount', label: 'Amount', type: 'number', placeholder: 'Enter amount', validation: (z: any) => z.number().positive() },
                    { name: 'issueDate', label: 'Document Issue Date', type: 'date' },
                    { name: 'dueDate', label: 'Due Date', type: 'date' },
                    { name: 'eligibleAmt', label: 'Eligible Amount', type: 'number' },
                    { name: 'maxMaturityDate', label: 'Max Maturity Date', type: 'date' },
                    { name: 'status', label: 'Status', type: 'text', placeholder: 'ELGB/PEND/…' },
                  ],
                },
              }
            ],
          },
          {
            title: "Matched Documentts",
            fields: [
              {
                name: 'documentNumber',
                label: 'Document Number',
                type: 'text',
                placeholder: 'Enter Document Number',
                validation: (z: any) => z.string().required('Document Number is mandatory'),
              },
              {
                name: 'documentAmountCurrency',
                label: 'Document Amount (Cur)',
                type: 'dropdown',
                options: [{ label: 'SGD', value: 'SGD' }, { label: 'MYR', value: 'MYR' }, { label: 'HKD', value: 'HKD' }],
              },
              {
                name: 'documentAmount',
                label: 'Document Amount',
                type: 'number',
                placeholder: 'Enter Amount',
                validation: (z: any) => z.number().positive('Document Amount is mandatory'),
              },
              {
                name: 'adjustmentAmountCurrency',
                label: 'Adjustment Amount (Cur)',
                type: 'dropdown',
                options: [{ label: 'SGD', value: 'SGD' }, { label: 'MYR', value: 'MYR' }, { label: 'HKD', value: 'HKD' }],
              },
              {
                name: 'adjustmentAmount',
                label: 'Adjustment Amount',
                type: 'number',
                placeholder: 'Enter Amount',
                validation: (z: any) => z.number().nonnegative('Required'),
              },
              {
                name: 'counterpartyName',
                label: 'Counter Party Name',
                type: 'text',
                placeholder: 'Enter Counter Party Name',
                validation: (z: any) => z.string().required('Counter Party Name is mandatory'),
              },
              {
                name: 'documentIssueDate',
                label: 'Document Issue Date',
                type: 'date',
                placeholder: 'DD-MMM-YYYY',
                validation: (z: any) => z.string().required('Document Issue Date is mandatory'),
              },
              {
                name: 'documentTenor',
                label: 'Document Tenor',
                type: 'text',
                placeholder: 'Enter Document Tenor (in Days..)',
                validation: (z: any) => z.string().required('Document Tenor is mandatory'),
              },
              {
                name: 'paymentTerms',
                label: 'Payment Terms',
                type: 'dropdown',
                placeholder: 'Select Option',
                options: [
                  { label: 'NET 30', value: 'NET30' },
                  { label: 'NET 45', value: 'NET45' },
                  { label: 'NET 60', value: 'NET60' },
                ],
                validation: (z: any) => z.string().required('Payment Terms is mandatory'),
              },
              {
                name: 'documentDueDate',
                label: 'Document Due Date',
                type: 'date',
                placeholder: 'Select Date',
                validation: (z: any) => z.string().required('Document Due Date is mandatory'),
              },
              {
                name: 'incoterms',
                label: 'Incoterms',
                type: 'dropdown',
                placeholder: 'Select Option',
                options: [
                  { label: 'EXW', value: 'EXW' },
                  { label: 'FOB', value: 'FOB' },
                  { label: 'CIF', value: 'CIF' },
                ],
              },
              {
                name: 'eligibleAmountCurrency',
                label: 'Eligible Amount (Cur)',
                type: 'dropdown',
                options: [{ label: 'SGD', value: 'SGD' }, { label: 'MYR', value: 'MYR' }, { label: 'HKD', value: 'HKD' }],
              },
              {
                name: 'eligibleAmount',
                label: 'Eligible Amount',
                type: 'number',
                placeholder: 'Enter Amount',
                validation: (z: any) => z.number().positive('Eligible Amount is mandatory'),
              },
              {
                name: 'maxMaturityDate',
                label: 'Max Maturity Date',
                type: 'date',
                placeholder: 'Select Date',
              },
              {
                name: 'documentApprovalStatus',
                label: 'Document Approval Status',
                type: 'dropdown',
                placeholder: 'Select Option',
                options: [
                  { label: 'Approved', value: 'APPR' },
                  { label: 'Pending', value: 'PEND' },
                  { label: 'Rejected', value: 'REJ' },
                ],
                validation: (z: any) => z.string().required('Document Approval Status is mandatory'),
              },
              {
                name: 'overrideDocStatus',
                label: 'Override Doc Status',
                type: 'dropdown',
                placeholder: 'Select Option',
                options: [
                  { label: 'None', value: '' },
                  { label: 'Override', value: 'OVR' },
                ],
                validation: (z: any) => z.string().required('Override Doc Status is mandatory'),
              },
              {
                name: 'overrideReason',
                label: 'Override Reason',
                type: 'text',
                placeholder: 'Enter Override Reason',
                validation: (z: any) => z.string().required('Override Reason is mandatory'),
              },
            ],
          },
        ],
      },

      // --- GOODS DETAILS ---
      {
        header: 'GOODS DETAILS',
        fields: [
          {
            name: 'goodsRows',
            dataTable: {
              header: '',
              config: {
                dataSource: 'goodsRows',
                columnSettings: [
                  { title: 'GOODS DESCRIPTION', column: 'description' },
                  { title: 'HS CODE', column: 'hsCode' },
                  { title: 'COUNTRY OF ORIGIN', column: 'country' },
                ],
              },
              fields: [
                { name: 'hsCode', label: 'HS Code', type: 'text', placeholder: 'Select Option', validation: (z: any) => z.string().min(1) },
                { name: 'country', label: 'Country of Origin', type: 'text', placeholder: 'Select Option', validation: (z: any) => z.string().min(1) },
                { name: 'description', label: 'Goods Description', type: 'textarea', col: { md: 6, lg: 6 }, placeholder: 'Enter Goods Description', validation: (z: any) => z.string().min(1) },
              ],
            },
          } as any,
        ],
      },

      // --- DOCUMENT PARTIES ---
      {
        header: 'DOCUMENT PARTIES',
        fields: [
          {
            name: 'partyRows',
            dataTable: {
              header: '',
              config: {
                dataSource: 'partyRows',
                columnSettings: [
                  { title: 'PARTY ROLE', column: 'role' },
                  { title: 'PARTY ID', column: 'partyId' },
                  { title: 'PARTY NAME', column: 'partyName' },
                  { title: 'PARTY TYPE', column: 'partyType' },
                ],
              },
              fields: [
                { name: 'role', label: 'Party Role', type: 'text', placeholder: 'Select Option', validation: (z: any) => z.string().min(1) },
                { name: 'partyId', label: 'Party ID', type: 'text', placeholder: 'Party ID' },
                { name: 'partyName', label: 'Party Name', type: 'text', placeholder: 'Enter Party Name', validation: (z: any) => z.string().min(1) },
                { name: 'partyType', label: 'Party Type', type: 'text', placeholder: 'Select Option' },
              ],
            },
          } as any,
        ],
      },

      // --- INSTALLMENT DETAILS ---
      {
        header: 'INSTALLMENT DETAILS',
        fields: [
          {
            name: 'installmentRows',
            dataTable: {
              header: '',
              config: {
                dataSource: 'installmentRows',
                columnSettings: [
                  { title: 'PERCENTAGE', column: 'percentage' },
                  { title: 'CURRENCY', column: 'currency' },
                  { title: 'AMOUNT', column: 'amount' },
                  { title: 'DUE DATE', column: 'dueDate' },
                  { title: 'ELIGIBLE AMOUNT', column: 'eligibleAmount' },
                  { title: 'MAX MATURITY DATE', column: 'maxMaturityDate' },
                ],
              },
              fields: [
                { name: 'percentage', label: 'Percentage', type: 'number', placeholder: 'Enter Percentage', validation: (z: any) => z.number().positive() },
                { name: 'currency', label: 'Currency', type: 'dropdown', options: [{ label: 'SGD', value: 'SGD' }, { label: 'MYR', value: 'MYR' }, { label: 'HKD', value: 'HKD' }] },
                { name: 'amount', label: 'Amount', type: 'number', placeholder: 'Enter Amount', validation: (z: any) => z.number().positive() },
                { name: 'dueDate', label: 'Due Date', type: 'date', placeholder: 'Select Date', validation: (z: any) => z.string().min(1) },
                { name: 'eligibleAmount', label: 'Eligible Amount', type: 'number', placeholder: 'Enter Amount', validation: (z: any) => z.number().positive() },
                { name: 'maxMaturityDate', label: 'Max Maturity Date', type: 'date', placeholder: 'Select Date' },
              ],
            },
          } as any,
        ],
      },
    ],
    []
  )

  const handleChange = (v: any) => setValues(v)

  // same submit stance as your latest: just log + spinner
  const handleSubmit = async (v: any) => {
    try {
      setLoadingSubmit(true)
      console.log('[DocumentsPane] submitted:', v)
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
      dataSource={values ?? EMPTY}
      onChange={handleChange}
      onSubmit={handleSubmit}
      loading={loadingFetch || loadingSubmit}
    />
  )
}
