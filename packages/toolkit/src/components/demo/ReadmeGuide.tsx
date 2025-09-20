// src/components/ReadmeGuide.tsx
import React from 'react'
import { Icon } from 'react-components-lib.eaa'

export default function ReadmeGuide() {
  const steps = [
    {
      icon: 'desktop_windows' as const,
      title: 'Prerequisites',
      subtitle: 'Ensure your environment meets the minimum requirements.',
      desc: (
        <>
          <code>Node.js ≥ 20</code>
          <br />
          <code>npm ≥ 10</code>
        </>
      )
    },
    {
      icon: 'file_download' as const,
      title: 'Installation',
      subtitle: 'Install dependencies for all workspaces at once.',
      code: ['npm install']
    },
    {
      icon: 'play_arrow' as const,
      title: 'Running from Root',
      subtitle: 'Run each module standalone—AppShell is applied automatically.',
      code: [
        'npm run start --workspace=toolkit   → http://localhost:3001',
        'npm run start --workspace=query     → http://localhost:3002'
      ]
    },
    {
      icon: 'integration_instructions' as const,
      title: 'Host Integration',
      subtitle: 'Serve modules locally for the shell to consume.',
      code: [
        'npm run serve:local --workspace=toolkit (port 4001)',
        'npm run serve:local --workspace=query   (port 4002)',
        'npm run start --workspace=query         (port 3000)'
      ]
    },
    {
      icon: 'settings' as const,
      title: 'Dev Script',
      subtitle: 'Start everything with one command and open your browser.',
      code: ['npm run start']
    }
  ]

  return (
    <div
      className="prose max-w-none p-6 bg-white rounded-lg shadow-md"
      data-scroll-to-view="how-to-run-local"
      data-scroll-offset="70"
    >
      <h2 className="text-2xl font-bold mb-4">🚀 How to Run Locally</h2>

      <ul className="space-y-8">
        {steps.map(({ icon, title, subtitle, desc, code }, idx) => (
          <li key={idx} className="flex space-x-4">
            <Icon icon={icon} className="h-6 w-6 text-blue-500 mt-1" />
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
              {desc && <p className="mt-2">{desc}</p>}

              {code && (
                <pre className="w-full mt-2 bg-gray-100 p-3 rounded text-sm overflow-x-auto font-mono">
                  {code.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </pre>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <p className="text-sm">
          📘 For full details and advanced options, see <code>README.md</code> at the repo root.
        </p>
      </div>
    </div>
  )
}
