import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FormRenderer } from 'react-components-lib.eaa'
import { apiGet } from '@app/common'
import moduleConfig from '../../module.config.json'
import type { PaneHandle } from '../../components/SplitPanelLazy'
import { DangerInfoBox } from './GeneralDetailsPane'

export default function FinancesPane({
  onRegisterHandle,
  ...rest
}: {
  onRegisterHandle?: (h: PaneHandle | null) => void
}) {
  const { txnNumber = '' } = useParams<{ txnNumber: string }>()
  const formRef = useRef<any>(null)
  
  // unified dataSource for FormRenderer (includes both tabs’ values)
  const [values, setValues] = useState<any>({ processedRows: [] as any[] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // expose imperative handle to SplitPanel footer
  useEffect(() => {
    if (!onRegisterHandle) return;
    const handle: PaneHandle = {
      submit: () => formRef.current?.submit?.(),
      validate: () => formRef.current?.validate?.(),
      getValues: () => formRef.current?.getValues?.(),
      reset: () => formRef.current?.reset?.(),
    };
    onRegisterHandle(handle);
    return () => onRegisterHandle(null);
  }, [onRegisterHandle]);

  // fetch Request + Processed (both from the same TXN in server.js)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const isNumeric = /^\d+$/.test(txnNumber);
        const base = isNumeric
          ? `/txn/id/${Number(txnNumber)}`
          : `/txn/${encodeURIComponent(txnNumber)}`;

        const [req, proc] = await Promise.all([
          apiGet<any>({
            endpoint: `${base}/finances/request`,
            queryKey: [
              "txnworkdesk",
              moduleConfig.moduleName,
              "finances",
              "request",
              { txnNumber, kind: isNumeric ? "id" : "trn" },
            ] as const,
          }),
          apiGet<{ rows: any[] }>({
            endpoint: `${base}/finances/processed`,
            queryKey: [
              "txnworkdesk",
              moduleConfig.moduleName,
              "finances",
              "processed",
              { txnNumber, kind: isNumeric ? "id" : "trn" },
            ] as const,
          }),
        ]);

        if (cancelled) return;
        setValues({
          ...req,
          processedRows: proc?.rows ?? [],
        });
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load finances");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [txnNumber]);

  // --------- field settings per tab ----------
  const fianceFields: any[] = useMemo(() => [
    {
      header: 'Finance Details',
      isSubHeader: true,
      fields: [
        { name: 'financeAmount', label: 'Finance Amount', type: 'text', placeholder: 'Currency + Amount', validation: (z: any) => z.string().required('Finance Amount is mandatory') },
        { name: 'financeTenorOption', label: 'Finance Tenor Option', type: 'text', placeholder: 'e.g., SFC - SPECIFIC TENOR', validation: (z: any) => z.string().required('Tenor option is mandatory') },
        { name: 'financeTenorDays', label: 'Finance Tenor (Days)', type: 'number', placeholder: 'Enter tenor days' },
        { name: 'financeEndDate', label: 'Finance End Date', type: 'text', placeholder: 'DD-MMM-YYYY' }
      ]
    },
    {
      allowMultiple: true,
      accordion: [
        {
          title: "Settlement Instructions",
          fields: [
            { name: 'principalAccountNumber', label: 'Principal Account Number', type: 'text', placeholder: 'Enter account number', validation: (z: any) => z.string().required('Principal account is mandatory') },
            { name: 'principalFxRateSource', label: 'Principal FX Rate Source', type: 'text', placeholder: 'Select option' },
            { name: 'principalFxContractNumber', label: 'Principal FX Contract Number', type: 'text', placeholder: 'Enter contract number' },
            { name: 'principalFxRate', label: 'Principal FX rate', type: 'text', placeholder: 'Enter FX rate' },

            { name: 'interestAccountNumber', label: 'Interest Account Number', type: 'text', placeholder: 'Enter account number' },
            { name: 'interestFxRateSource', label: 'Interest FX Rate Source', type: 'text', placeholder: 'Select option' },
            { name: 'interestFxContractNumber', label: 'Interest FX Contract Number', type: 'text', placeholder: 'Enter contract number' },
            { name: 'interestFxRate', label: 'Interest FX rate', type: 'text', placeholder: 'Enter FX rate' }
          ] },
        {
          title: "Interest Override — Customer Interest Override",
          fields: [
            { name: 'collectionOption', label: 'Collection Option', type: 'text', placeholder: 'Select Option' },
            { name: 'collectionPeriodicity', label: 'Collection Periodicity', type: 'text', placeholder: 'Select Option' },
            { name: 'baseRateType', label: 'Base Rate Type', type: 'text', placeholder: 'Select Option' },
            { name: 'rateResetPeriodicity', label: 'Rate Reset Periodicity', type: 'text', placeholder: 'Select Option' },
            { name: 'baseRate', label: 'Base Rate', type: 'text', placeholder: 'Enter Base Rate' },
            { name: 'baseRateIndex', label: 'Base Rate Index', type: 'text', placeholder: 'Select Option' },
            { name: 'indexTenor', label: 'Index Tenor', type: 'text', placeholder: 'Enter Index Tenor' },
            { name: 'allInLP', label: 'All in LP', type: 'text', placeholder: 'Enter All in LP' },
            { name: 'updateBaseRate', label: 'Update Base Rate', type: 'checkbox' },
            { name: 'baseRateMultiplier', label: 'Base Rate Multiplier', type: 'text', placeholder: 'Enter Base Rate Multiplier' },
            { name: 'marginPercentage', label: 'Margin Percentage', type: 'text', placeholder: 'Enter Margin Percentage' },
            { name: 'computationMethod', label: 'Computation Method', type: 'text', placeholder: 'Select Computation Method' },
            { name: 'applySpecialRolloverPricing', label: 'Apply Special Rollover Pricing', type: 'checkbox' }
          ]
        },
        {
          title: 'Interest Override — FTP Override',
          fields: [
            { name: 'ftpUpdateBaseRate', label: 'Update Base Rate', type: 'checkbox' },
            { name: 'ftpBaseRate', label: 'Base Rate', type: 'text', placeholder: 'Enter Base Rate' },
            { name: 'ftpUpdateLP', label: 'Update LP', type: 'checkbox' },
            { name: 'ftpContractualLP', label: 'Contractual LP', type: 'text', placeholder: 'Enter Contractual LP' },
            { name: 'ftpBehaviouralLP', label: 'Behavioural LP', type: 'text', placeholder: 'Enter Behavioural LP' },
            { name: 'ftpCostOfLiquidity', label: 'Cost of Liquidity', type: 'text', placeholder: 'Enter Cost of Liquidity' },
            { name: 'ftpIncentivePremiumSubsidy', label: 'Incentive Premium Subsidy', type: 'text', placeholder: 'Enter Incentive Premium Subsidy' }
          ]
        },
        {
          title: 'Finance to Disbursements',
          fields: [
            { name: 'disbFinanceAmount', label: 'Finance Amount', type: 'text', placeholder: 'Currency + Amount' },
            { name: 'disbAmount', label: 'Disbursement Amount', type: 'text', placeholder: 'Currency + Amount' },
            { name: 'disbFxRateSource', label: 'FX Rate Source', type: 'text', placeholder: 'Select Option' },
            { name: 'disbContractNumber', label: 'Contract Number', type: 'text', placeholder: 'Enter Contract Number' },
            { name: 'disbFxRate', label: 'FX Rate', type: 'text', placeholder: 'Enter FX Rate' }
          ]
        },
        {
          title: 'Balance Debit Instructions',
          fields: [
            { name: 'bdiOverrideImport', label: 'Balance Amount Override (for Import Invoice Financing)', type: 'checkbox' },
            { name: 'bdiAccountNumber', label: 'Account Number', type: 'text', placeholder: 'Currency + Account Number' },
            { name: 'bdiContractNumber', label: 'Contract Number', type: 'text', placeholder: 'Enter Contract Number' },
            { name: 'bdiFxRateSource', label: 'FX Rate Source', type: 'text', placeholder: 'Select Option' },
            { name: 'bdiFxRate', label: 'FX Rate', type: 'text', placeholder: 'Enter FX Rate' },
            { name: 'bdiBalanceDebitAmount', label: 'Balance Debit Amount', type: 'text', placeholder: 'Currency + Amount' }
          ]
        }
      ],
    },
  ], [])

  const reqFields: any[] = useMemo(
    () => [
      {
        dataTable: {
          header: "Processed Details",
          config: {
            dataSource: "processedRows",
            columnSettings: [
              { title: "Finance Number", column: "financeNumber", minWidth: 180 },
              { title: "Currency", column: "currency", width: 80, align: "center" },
              { title: "Finance Amount", column: "financeAmount", minWidth: 140, align: "right" },
              { title: "Effective Date", column: "effectiveDate", minWidth: 130 },
              { title: "Tenor Days", column: "tenorDays", width: 100, align: "right" },
              { title: "Maturity Date", column: "maturityDate", minWidth: 130 },
              { title: "Collection Option", column: "collectionOption", minWidth: 160 },
            ],
          },
          fields: [
            { name: 'financeNumber', label: 'Finance Number', type: 'text', placeholder: 'Enter Finance Number..' },
            { name: 'financeType', label: 'Finance Type', type: 'text', placeholder: 'Select Option' },
            { name: 'financeAmount', label: 'Finance Amount', type: 'text', placeholder: 'Currency + Amount' },
            { name: 'financeTenorDays', label: 'Finance Tenor (Days)', type: 'number', placeholder: 'Enter tenor' },
            { name: 'effectiveDate', label: 'Finance Effective Date', type: 'text', placeholder: 'Select Date' },
            { name: 'maturityDate', label: 'Finance Maturity Date', type: 'text', placeholder: 'Select Date' },
            { name: 'financeEvent', label: 'Finance Event', type: 'text', placeholder: 'Select Option' },
            { name: 'autoSettlement', label: 'Auto Settlement', type: 'checkbox' },

            { name: 'principalAccountNumber', label: 'Principal Account Number', type: 'text', placeholder: 'Currency + Account Number' },
            { name: 'interestAccountNumber', label: 'Interest Account Number', type: 'text', placeholder: 'Currency + Account Number' },
            { name: 'principalFxRateSource', label: 'FX Rate Source (Principal)', type: 'text', placeholder: 'Select Option' },
            { name: 'interestFxRateSource', label: 'FX Rate Source (Interest)', type: 'text', placeholder: 'Select Option' },
            { name: 'principalContractNumber', label: 'Contract Number (Principal)', type: 'text', placeholder: 'Enter Contract Number' },
            { name: 'interestContractNumber', label: 'Contract Number (Interest)', type: 'text', placeholder: 'Enter Contract Number' },
            { name: 'principalFxRate', label: 'FX Rate (Principal)', type: 'text', placeholder: 'Enter FX Rate' },
            { name: 'interestFxRate', label: 'FX Rate (Interest)', type: 'text', placeholder: 'Enter FX Rate' }
          ]
        },
      },
      {
        accordion: [
          {
            title: "Interest Details",
            fields: [
              {
                header: 'Customer Interest Details',
                isSubHeader: true,
                fields: [
                  { name: 'piCollectionOption', label: 'Collection Option', type: 'text', placeholder: 'Select Option' },
                  { name: 'piCollectionPeriodicity', label: 'Collection Periodicity', type: 'text', placeholder: 'Select Option' },
                  { name: 'piBaseRateType', label: 'Base Rate Type', type: 'text', placeholder: 'Select Option' },
                  { name: 'piRateResetPeriodicity', label: 'Rate Reset Periodicity', type: 'text', placeholder: 'Select Option' },
                  { name: 'piBaseRateIndex', label: 'Base Rate Index', type: 'text', placeholder: 'Select Option' },
                  { name: 'piIndexTenor', label: 'Index Tenor', type: 'text', placeholder: 'Enter Index Tenor' },
                  { name: 'piBaseRate', label: 'Base Rate', type: 'text', placeholder: 'Enter Base Rate' },
                  { name: 'piAllInLP', label: 'All in LP', type: 'text', placeholder: 'Enter All in LP' },
                  { name: 'piBaseRateMultiplier', label: 'Base Rate Multiplier', type: 'text', placeholder: 'Enter Base Rate Multiplier' },
                  { name: 'piMarginPercentage', label: 'Margin Percentage', type: 'text', placeholder: 'Enter Margin Percentage' },
                  { name: 'piComputationMethod', label: 'Computation Method', type: 'text', placeholder: 'Select Computation Method' }
                ]
              }
            ]
          },
          {
            title: "FTP Details",
            fields: [
              { name: 'ftpBaseRate', label: 'Base Rate', type: 'text', placeholder: 'Enter Base Rate' },
              { name: 'ftpContractualLP', label: 'Contractual LP', type: 'text', placeholder: 'Enter Contractual LP' },
              { name: 'ftpBehaviouralLP', label: 'Behavioural LP', type: 'text', placeholder: 'Enter Behavioural LP' },
              { name: 'ftpCostOfLiquidity', label: 'Cost of Liquidity', type: 'text', placeholder: 'Enter Cost of Liquidity' }
            ]
          },
        ],
      }
    ],
    []
  )

  const fieldSettings: any[] = useMemo(() => [
    {
      tabs: [
        {
          title: "Finance Details",
          fields: fianceFields,
        },
        {
          title: "Request Details",
          fields: reqFields,
        },
      ],
    },
  ], []);
  
  const onChange = (v: any) => setValues(v);

  const onSubmit = async (v: any) => {
    try {
      setSubmitting(true);
      // Wire to PATCH here when you’re ready. For now we just log.
      // await apiPatch({ endpoint: '...', data: v })
      // Keep single source of truth: write back into the ROWS record for this TRN/ID.
      console.log("[FinancesPane] submit payload:", v);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <FormRenderer
        {...rest}
        ref={formRef}
        fieldSettings={fieldSettings}
        dataSource={values}
        onChange={onChange}
        onSubmit={onSubmit}
        loading={loading || submitting}
      />
      {error && <DangerInfoBox message={error} />}
    </>
  )
}
