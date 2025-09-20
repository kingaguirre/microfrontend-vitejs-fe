// src/components/NewModuleGuide.tsx
import React from 'react'
import { Icon } from 'react-components-lib.eaa'

export default function NewModuleGuide() {
  const steps = [
    {
      icon: 'file_copy' as const,
      title: '1. Duplicate the Toolkit Package',
      desc: `Run in your project root—this creates a new <code className="text-pink-500">module-xyz</code> folder:`,
      code: [
        ['// macOS / Linux', 'cp -R packages/toolkit packages/module-xyz'],
        ['// Windows (PowerShell)', 'xcopy /E /I packages\\toolkit packages\\module-xyz']
      ]
    },
    {
      icon: 'folder_open' as const,
      title: '2. Define Your Routes (Module Level)',
      desc: `In <code className="text-pink-500">packages/module-xyz/src/pages</code>, each folder with an <code className="text-pink-500">index.tsx</code> becomes a route.`,
      code: [['packages/module-xyz/src/pages/', '└── hello-world/', '    └── index.tsx']]
    },
    {
      icon: 'description' as const,
      title: '3. Set the Module Name (Module Level)',
      desc: `Edit <code className="text-pink-500">packages/module-xyz/src/module.config.json</code> to:`,
      code: [['{', '  "moduleName": "module-xyz"', '}']]
    },
    {
      icon: 'folder' as const,
      title: '4. Organize Pages & Components (Module Level)',
      desc: `Keep your code tidy in the module folders:`,
      code: [
        [
          'packages/module-xyz/src/pages      # page-level screens',
          'packages/module-xyz/src/components # shared UI bits'
        ]
      ]
    },
    {
      icon: 'settings' as const,
      title: '5. Tweak Vite Config & Module Files (Module Level)',
      desc: `At module level, only modify <code className="text-pink-500">vite.config.ts</code> and files under <code className="text-pink-500">/pages</code> & <code className="text-pink-500">/components</code> **during development** to avoid unnecessary breakage.`,
      code: [
        [
          '// packages/module-xyz/vite.config.ts',
          'export default defineConfig({',
          '  shared: { /* your shared packages */ },',
          '  server: { port: 3001 },    # standalone dev port',
          '})'
        ]
      ]
    },
    {
      icon: 'code' as const,
      title: '6. Configure In-Host Serve Port (Module Level)',
      desc: `In <code className="text-pink-500">packages/module-xyz/package.json</code>, set the <code>serve:local</code> script port for host consumption:`,
      code: [['"scripts": {', '  "serve:local": "vite --port 4001 --preview"', '}']]
    },
    {
      icon: 'link' as const,
      title: '7. Add Remote Entry in Host Vite Config (AppShell)',
      desc: `In <code className="text-pink-500">packages/app-shell/vite.config.ts</code>, under <code>remotes</code> add your module name:`,
      code: [['module-xyz: "http://localhost:4001/assets/remoteEntry.js",']]
    },
    {
      icon: 'view_module' as const,
      title: '8. Register Your Module Loader (AppShell)',
      desc: `In <code className="text-pink-500">packages/app-shell/src/main.tsx</code>, append this to your modules array:`,
      code: [
        [
          '{',
          '  path: "module-xyz",',
          '  title: "ModuleXyz",',
          '  loader: () => import("module-xyz/Routes"),',
          '},'
        ]
      ]
    }
  ]

  return (
    <div
      className="prose max-w-none p-6 bg-white rounded-lg shadow-md"
      data-scroll-to-view="how-to-create-module"
      data-scroll-offset="70"
    >
      <h2 className="text-2xl font-bold mb-4">🛠️ How to Create a New Module</h2>
      <ul className="space-y-8">
        {steps.map(({ icon, title, desc, code }, idx) => (
          <li key={idx} className="flex space-x-4">
            <Icon icon={icon} className="h-6 w-6 text-blue-500 mt-1" />
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-1" dangerouslySetInnerHTML={{ __html: desc }} />
              {code.map((block, i) => (
                <pre
                  key={i}
                  className="mt-2 bg-gray-100 p-3 rounded text-sm overflow-x-auto font-mono"
                >
                  {block.map((line, j) => (
                    <div
                      key={j}
                      className={
                        line.trim().startsWith('//') || line.includes('#') ? 'text-green-500' : ''
                      }
                    >
                      {line}
                    </div>
                  ))}
                </pre>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <hr className="my-6" />

      <div>
        <h3 className="text-xl font-semibold mb-2">🚀 Running Your Module</h3>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Stand-alone:</strong>{' '}
            <code className="text-pink-500 bg-gray-100 px-1 py-0.5 rounded">
              npm run start --workspace=packages/module-xyz
            </code>
          </li>
          <li>
            <strong>In-Host:</strong>
            <div className="mt-1 ml-4">
              <code className="text-pink-500 bg-gray-100 px-1 py-0.5 rounded">
                npm run serve:local --workspace=packages/module-xyz
              </code>
              <br />
              <code className="text-pink-500 bg-gray-100 px-1 py-0.5 rounded">
                npm run start --workspace=packages/app-shell
              </code>
              <p className="text-sm text-gray-600 mt-1">
                The module (<code className="text-pink-500">module-xyz</code>) will be loaded inside
                the host; ensure both module (serve:local) and host are running.
              </p>
            </div>
          </li>
        </ul>
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* Quick Module Creation Shortcut */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">💡 Quick Module Creation</h3>
        <p>Skip all the manual steps and scaffold a new module in one go:</p>
        <pre className="mt-2 bg-gray-100 p-3 rounded text-sm overflow-x-auto font-mono">
          npm run create-module module-xyz 4003 3003
        </pre>
        <p className="text-sm text-gray-600 mt-1">
          Be sure to pick ports <strong>3003</strong> (dev port) and <strong>4003</strong> (preview
          port) or higher to avoid any port conflicts.
        </p>
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* Quick Module Removal Shortcut */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <div className="mt-8 bg-red-50 border-l-4 border-red-400 p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">🗑️ Quick Module Removal</h3>
        <p>Remove a module and automatically clean up your host config:</p>
        <pre className="mt-2 bg-gray-100 p-3 rounded text-sm overflow-x-auto font-mono">
          npm run remove-module module-xyz
        </pre>
        <p className="text-sm text-gray-600 mt-1">
          This will delete <code className="font-mono">packages/module-xyz</code>, strip out the
          remotes entry in <code className="font-mono">vite.config.ts</code> and the loader block in
          <code className="font-mono">main.tsx</code>, then re-format those files with Prettier.
        </p>
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> Be sure to stop any running dev servers before removal.
        </p>
      </div>
    </div>
  )
}
