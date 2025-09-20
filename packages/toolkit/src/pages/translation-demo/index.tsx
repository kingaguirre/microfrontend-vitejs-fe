// packages/toolkit/src/pages/translation/index.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@components/demo/Layout'
import Card from '@components/demo/Card'
import { useTranslate } from '@app/common'

export default function TranslationContextDemo() {
  const navigate = useNavigate()
  const { t, lang, translations } = useTranslate('toolkit')

  const languages = [
    { code: 'en', label: 'English (en)' },
    { code: 'ms-SG', label: 'Malay (Singapore) (ms-SG)' },
    { code: 'hi-IN', label: 'Hindi (India) (hi-IN)' },
    { code: 'zh-CN', label: 'Chinese, Simplified (zh-CN)' },
    { code: 'zh-HK', label: 'Chinese, Traditional (zh-HK)' },
    { code: 'tl-PH', label: 'Tagalog (Philippines) (tl-PH)' },
    { code: 'ja-JP', label: 'Japanese (ja-JP)' }
  ]

  const onLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value
    navigate({ search: `?lang=${code}` }, { replace: true })
  }

  return (
    <Layout>
      <Card title="Translation Demo">
        {/* Witty, professional description */}
        <p className="mb-2 text-gray-700">
          🔧 Built-in and battle-tested: just drop a <code>src/language/&lt;lang&gt;.json</code> in
          any module, and our React-Context-powered engine auto-discovers it. Use{' '}
          <code>useTranslate('toolkit')</code> then <code>t('yourKey')</code> for a frictionless
          lookup.
        </p>
        <p className="mb-4 text-gray-600">
          🌐 Need a phrase from another module?{' '}
          <code>useTranslate('otherModule').t('someKey')</code>—zero extra setup. 🔍 No external
          deps; pure React Context magic.
        </p>

        {/* File tree snippet */}
        <div className="mb-6">
          <p className="text-gray-600 text-sm mb-2">
            Folder structure—and file names must match the <code>?lang=</code> codes:
          </p>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {`packages/
├── common/
│   └── src/
│       └── language/
│           ├── en.json
│           ├── ms-SG.json
│           ├── hi-IN.json
│           ├── zh-CN.json
│           ├── zh-HK.json
│           ├── tl-PH.json
│           └── ja-JP.json
└── toolkit/
    └── src/
        └── pages/
            └── translation/
                └── index.tsx  ← this demo
`}
          </pre>
        </div>

        {/* Info box */}
        <div className="mb-8 px-4 py-4 bg-blue-50 border-l-4 border-blue-400 rounded">
          <p className="text-blue-800 text-sm">
            🔍 Deep keys (e.g. <code>nested.header</code>) are flattened by the context—call{' '}
            <code>t('nested.header')</code> directly.
          </p>
        </div>

        {/* Usage example snippet */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">📘 Usage Example</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {`import { useTranslate } from '@app/common';

function MyComponent() {
  const { t } = useTranslate('toolkit');
  return <h1>{t('title')}</h1>;  // renders "Toolkit Module" (or localized title)
}`}
          </pre>
        </div>
      </Card>

      {/* Module title */}
      <Card title={t('title')}>
        {/* Language selector - dropdown */}
        <div className="mb-8 max-w-xs">
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
            Select language
          </label>
          <select
            id="language"
            value={lang}
            onChange={onLangChange}
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm
                       focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {languages.map(({ code, label }) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Deep object demo */}
        <div className="p-6 bg-blue-50 rounded-lg border border-blue-200 mb-8">
          <h2 className="text-2xl font-semibold mb-2">{t('nested.header')}</h2>
          <p className="text-gray-800">{t('nested.description')}</p>
        </div>

        {/* All translations grid */}
        <section>
          <h2 className="text-xl font-semibold mb-4">All Toolkit Translations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(translations).map(([key, val]) => (
              <div key={key} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 mb-1">{key}</p>
                <p className="text-gray-800">{val}</p>
              </div>
            ))}
          </div>
        </section>
      </Card>
    </Layout>
  )
}
