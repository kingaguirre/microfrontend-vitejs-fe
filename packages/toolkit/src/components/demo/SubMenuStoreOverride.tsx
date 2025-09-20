// packages/toolkit/src/components/demo/SubMenuStoreOverride.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubMenuStore, SubMenuItem } from '@app/common'

function parseMenuItems(raw: any[], navigate: ReturnType<typeof useNavigate>): SubMenuItem[] {
  return raw.map((item, idx) => {
    const { id, icon, title, path, badge, children } = item
    if (typeof id !== 'string' || typeof title !== 'string') {
      throw new Error(`Item at index ${idx} needs id, icon, and title as strings`)
    }
    if (path !== undefined && typeof path !== 'string') {
      throw new Error(`path for item ${id} must be a string`)
    }
    if (badge !== undefined && typeof badge !== 'object') {
      throw new Error(`badge for item ${id} must be an object`)
    }
    const onClick = () => {
      if (path) navigate(`/${path}`, { replace: true })
    }
    const menuItem: SubMenuItem = { id, icon, title, onClick }
    if (badge) {
      // @ts-ignore
      menuItem.badge = badge
    }
    if (Array.isArray(children)) {
      // @ts-ignore
      menuItem.children = parseMenuItems(children, navigate)
    }
    return menuItem
  })
}

export default function SubMenuStoreDemo() {
  const navigate = useNavigate()
  const setSubMenu = useSubMenuStore((s) => s.setSubMenu)
  const resetSubMenu = useSubMenuStore((s) => s.resetSubMenu)
  const subMenus = useSubMenuStore((s) => s.subMenus)

  const [moduleKey, setModuleKey] = useState('toolkit')
  const [jsonInput, setJsonInput] = useState<string>(
    `[
  {
    "id": "sub-a1",
    "icon": "upload_file",
    "title": "Subproject A1",
    "path": "toolkit/sub-a1"
  }
]`
  )
  const [removeId, setRemoveId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const buildItems = (): SubMenuItem[] | null => {
    try {
      const parsed = JSON.parse(jsonInput)
      if (!Array.isArray(parsed)) throw new Error('JSON must be an array')
      return parseMenuItems(parsed, navigate)
    } catch (err: any) {
      console.error(err)
      setError(err.message)
      return null
    }
  }

  // Replace submenu entirely
  const handleReplace = () => {
    const items = buildItems()
    if (items) {
      setSubMenu(moduleKey, items)
      setError(null)
    }
  }

  // Append items without duplicating
  const handleAppend = () => {
    const items = buildItems()
    if (items) {
      setSubMenu(moduleKey, (current) => [
        ...current,
        ...items.filter((newItem) => !current.some((c) => c.id === newItem.id))
      ])
      setError(null)
    }
  }

  const handleLoadDemo = () => {
    setSubMenu(moduleKey, (curr) => [
      ...curr,
      ...parseMenuItems(SUB_MENU_DEMO, navigate).filter((n) => !curr.some((c) => c.id === n.id))
    ])
    setError(null)
  }

  // Remove a single submenu item by id
  const handleRemoveOne = () => {
    if (!removeId) {
      setError('Enter submenu id to remove')
      return
    }
    setSubMenu(moduleKey, (current) => current.filter((item) => item.id !== removeId))
    setError(null)
  }

  return (
    <div
      className="prose max-w-none p-6 bg-white rounded-lg shadow-md"
      data-scroll-to-view="how-to-add-sub-menu"
      data-scroll-offset="70"
    >
      <h2 className="text-2xl font-bold mb-4">🛠️ Add Sub-menu dynamically.</h2>

      {/* Tip Info Box */}
      <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <h3 className="text-blue-800 font-semibold mb-1">ℹ️ Tip</h3>
        <ul className="list-disc list-inside text-sm text-blue-800">
          <li>
            Include <code>path</code> in JSON to auto-generate navigation.
          </li>
          <li>
            Optionally add <code>onClick</code> to trigger custom logic (e.g.,{' '}
            <code>console.log()</code>) alongside navigation.
          </li>
          <li>
            Omit <code>path</code> to skip navigation entirely and only run <code>onClick</code>.
          </li>
          <li>
            Use <code>useSubMenuStore</code> anywhere in your page to manage any module’s submenu.
          </li>
        </ul>
      </div>

      {/* Module Key Input */}
      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Module Key</label>
          <input
            value={moduleKey}
            onChange={(e) => setModuleKey(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* JSON Editor and Actions */}
        <div>
          <label className="block font-medium mb-1">
            SubMenu JSON (array of {'{id, icon, title, path?}'})
          </label>
          <textarea
            rows={5}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full border rounded px-3 py-2 font-mono"
          />
          <div className="flex space-x-2 mt-2">
            <button onClick={handleReplace} className="bg-blue-500 text-white px-4 py-2 rounded">
              Replace SubMenu
            </button>
            <button onClick={handleAppend} className="bg-green-500 text-white px-4 py-2 rounded">
              Append SubMenu
            </button>
            <button onClick={handleLoadDemo} className="bg-purple-500 text-white px-4 py-2 rounded">
              Load Deep Demo
            </button>
          </div>
        </div>

        {/* Remove One or All */}
        <div>
          <label className="block font-medium mb-1">Remove SubMenu ID</label>
          <input
            value={removeId}
            onChange={(e) => setRemoveId(e.target.value)}
            placeholder="submenu-id"
            className="w-full border rounded px-3 py-2"
          />
          <div className="flex space-x-2 mt-2">
            <button onClick={handleRemoveOne} className="bg-red-500 text-white px-4 py-2 rounded">
              Remove One
            </button>
            <button
              onClick={() => {
                resetSubMenu(moduleKey)
                setError(null)
              }}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              Remove All
            </button>
          </div>
        </div>

        {/* Error */}
        {error && <div className="text-red-600">Error: {error}</div>}

        {/* Current State */}
        <div className="mt-6">
          <h3 className="font-semibold">Current subMenus state</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
            {JSON.stringify(subMenus, null, 2)}
          </pre>
        </div>

        {/* Static Initialization Tip */}
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <h3 className="text-yellow-800 font-semibold mb-1">⚙️ Default Sub-menu Setup</h3>
          <p className="text-sm text-yellow-800 mb-2">
            To add a default sub-menu for a module, declare it in that module’s{' '}
            <code>module.config.json</code>. For example, in{' '}
            <code>packages/toolkit/src/module.config.json</code>:
          </p>
          <pre className="bg-gray-100 p-2 rounded text-sm font-mono overflow-auto">{`{
  "moduleName": "toolkit",
  "subMenu": [
    {
      "id": "dashboard",
      "title": "Executive Dashboard",
      "path": "/dashboard",
      "icon": "dashboard",
      "badge": { "value": 5 }
    },
    {
      "id": "analytics",
      "title": "Performance Analytics",
      "icon": "bar_chart",
      "children": [
        { "id": "user-trends", "title": "User Trends", "path": "/analytics/user-trends", "icon": "trending_up", "badge": { "icon": "whatshot", "color": "warning" } },
        { "id": "revenue", "title": "Revenue Streams", "path": "/analytics/revenue", "icon": "attach_money" }
      ]
    },
    { "id": "settings", "title": "System Settings", "path": "/settings", "icon": "settings", "badge": { "icon": "new_releases", "color": "success" } }
  ]
}`}</pre>

          <p className="text-sm text-yellow-800 mt-4">
            Your app will automatically load these entries on startup—no extra{' '}
            <code>useEffect</code> needed.
          </p>
        </div>

        {/* Code Examples */}
        <div className="mt-6 bg-gray-50 p-4 rounded border-2 border-blue-300">
          <h3 className="font-semibold mb-2">Code Examples</h3>
          <pre className="bg-white p-2 rounded text-sm overflow-auto font-mono">
            {`// Replace entire submenu
setSubMenu('toolkit', [
  { id: 'new1', icon: 'star', title: 'New One', path: 'toolkit/new1', onClick: () => console.log('new1 clicked') }
])

// Append to existing submenu
setSubMenu('toolkit', current => [
  ...current,
  { id: 'extra', icon: 'add', title: 'Extra', path: 'toolkit/extra', onClick: () => console.log('extra clicked') }
])

// Remove specific item
setSubMenu('toolkit', current =>
  current.filter(item => item.id !== 'extra')
)

// Reset entire submenu
resetSubMenu('toolkit')
`}{' '}
          </pre>
        </div>
      </div>
    </div>
  )
}

const SUB_MENU_DEMO = [
  {
    id: 'dashboard',
    title: 'Executive Dashboard',
    icon: 'dashboard',
    badge: { value: 5 }
  },
  {
    id: 'analytics',
    title: 'Performance Analytics',
    icon: 'bar_chart',
    badge: { icon: 'insights', color: 'primary' },
    children: [
      {
        id: 'user-trends',
        title: 'User Trends',
        icon: 'trending_up',
        badge: { value: 3 },
        children: [
          {
            id: 'daily-active',
            title: 'Daily Active Users',
            icon: 'today'
          },
          {
            id: 'user-demographics',
            title: 'Demographics Breakdown',
            icon: 'supervised_user_circle',
            badge: { icon: 'group', color: 'success' },
            children: [
              {
                id: 'age-groups',
                title: 'By Age Group',
                badge: { value: 2 }
              },
              {
                id: 'geography',
                title: 'By Geography',
                badge: { icon: 'public' }
              }
            ]
          }
        ]
      },
      {
        id: 'revenue',
        title: 'Revenue Streams',
        icon: 'attach_money',
        children: [
          {
            id: 'subscription-rev',
            title: 'Subscription Revenue',
            icon: 'repeat',
            badge: { value: 7, color: 'warning' },
            children: [
              {
                id: 'monthly-sub',
                title: 'Monthly Subscriptions'
              },
              {
                id: 'annual-sub',
                title: 'Annual Subscriptions'
              }
            ]
          },
          {
            id: 'one-time-purchases',
            title: 'One-Time Purchases',
            icon: 'add_shopping_cart',
            badge: { value: 1 }
          },
          {
            id: 'revenue-forecast',
            title: 'Forecast & Projections',
            icon: 'show_chart'
          }
        ]
      }
    ]
  },
  {
    id: 'settings',
    title: 'System Settings',
    icon: 'settings',
    badge: { icon: 'new_releases', color: 'success' },
    children: [
      {
        id: 'user-management',
        title: 'User Management',
        icon: 'supervisor_account',
        children: [
          {
            id: 'roles-permissions',
            title: 'Roles & Permissions',
            icon: 'security',
            badge: { value: 4 },
            children: [
              {
                id: 'add-role',
                title: 'Add New Role'
              },
              {
                id: 'edit-roles',
                title: 'Edit Existing Roles',
                badge: { icon: 'edit', color: 'primary' }
              }
            ]
          },
          {
            id: 'account-settings',
            title: 'Account Settings',
            icon: 'account_circle'
          }
        ]
      },
      {
        id: 'system-preferences',
        title: 'Preferences',
        icon: 'tune',
        badge: { value: 2, color: 'secondary' }
      }
    ]
  }
]
