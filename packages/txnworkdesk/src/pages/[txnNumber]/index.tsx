// packages/txnworkdesk/src/pages/[txnNumber]/index.tsx
import { useMemo, useState } from 'react'
import { SplitPanelLazy, type SplitItem } from '../../components/SplitPanelLazy'
import Header from '../../components/Header'

/* ---------- Page ---------- */
export default function TxnDetails() {
  const [globallyDisabled, setGloballyDisabled] = useState(true)

  // left menu (lazy panes). Other sections are placeholders for now.
  const items: SplitItem[] = useMemo(
    () => [
      {
        id: 'exception-details',
        title: 'Exception Details',
        loader: () => import('../../components/panes/ExceptionDetailsPane')
      },
      {
        id: 'general',
        title: 'General Details',
        icon: 'info',
        loader: () => import('../../components/panes/GeneralDetailsPane')
      },
      {
        id: 'sustainable',
        title: 'Sustainable Finance',
        loader: () => import('../../components/panes/SustainableFinancePane')
      },
      {
        id: 'documents',
        title: 'Documents',
        loader: () => import('../../components/panes/DocumentsPane')
      },
      { id: 'parties', title: 'Parties', loader: () => import('../../components/panes/EmptyPane') },
      {
        id: 'finances',
        title: 'Finances',
        loader: () => import('../../components/panes/FinancesPane')
      },
      { id: 'charges', title: 'Charges', loader: () => import('../../components/panes/EmptyPane') },
      {
        id: 'disbursement',
        title: 'Disbursement',
        loader: () => import('../../components/panes/EmptyPane')
      },
      { id: 'journal', title: 'Journal', loader: () => import('../../components/panes/EmptyPane') },
      {
        id: 'compliance',
        title: 'Compliance',
        loader: () => import('../../components/panes/EmptyPane')
      },
      { id: 'advices', title: 'Advices', loader: () => import('../../components/panes/EmptyPane') },
      {
        id: 'referral',
        title: 'Referral Details',
        loader: () => import('../../components/panes/EmptyPane')
      },
      {
        id: 'scpay',
        title: 'SCPay Messages',
        loader: () => import('../../components/panes/EmptyPane')
      },
      { id: 'remarks', title: 'Remarks', loader: () => import('../../components/panes/EmptyPane') }
    ],
    []
  )

  return (
    <>
      {/* compact top summary */}
      <Header />

      {/* split panel (left menu + lazy right content). Height uses app constant */}
      <SplitPanelLazy
        items={items}
        defaultActiveId="general"
        onChangeActiveId={() => setGloballyDisabled(true)}
        onSuccess={({ id, data, source }) => {
          // After success saving return to disable state
          setGloballyDisabled(true)
          // e.g., log, trigger a parent-level toast, update some context, etc.
          console.log(`[${id}] ${source} success`, data)
        }}
        onError={({ id, error, source }) => {
          console.warn(`[${id}] ${source} error:`, error)
        }}
        // 1) add more buttons in the shared footer
        footerActions={[
          {
            key: 'edit',
            label: globallyDisabled ? 'Edit' : 'Cancel',
            onClick: () => setGloballyDisabled(!globallyDisabled),
            variant: 'outlined',
            color: 'default'
          },
          {
            key: 'save',
            label: 'Save',
            disabled: globallyDisabled,
            onClick: async (helpers) => {
              // const { handle } = helpers
              // const data = await handle?.submit?.() // call submit
              console.log(helpers)
            },
            color: 'success',
            width: 80
          }
        ]}
        disabledSubmit={globallyDisabled}
        // 2) pass props to panes (lazy panes only)
        paneProps={{
          // boolean OR a fn. Using a fn to show per-pane logic example:
          disabled: globallyDisabled,
          errorBoxConfig: {
            bottomOffset: 48
          }
        }}
      />
    </>
  )
}
