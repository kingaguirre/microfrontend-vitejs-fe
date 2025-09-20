import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'

interface TocItem {
  label: string
  to: string
  description: string
}

interface TocSection {
  title: string
  items: TocItem[]
}

const sections: TocSection[] = [
  {
    title: 'How‑to Guides',
    items: [
      {
        label: 'Create Module',
        to: '/toolkit/how-to?scroll=how-to-create-module',
        description: 'Step‑by‑step guide to scaffold and configure a new module.'
      },
      {
        label: 'Run Locally',
        to: '/toolkit/how-to?scroll=how-to-run-local',
        description: 'Instructions to set up your development environment and start the app.'
      },
      {
        label: 'Update Page Title & Name',
        to: '/toolkit/how-to?scroll=how-to-change-page-data',
        description:
          'Learn how to dynamically update the shell’s page title and name from a remote module.'
      },
      {
        label: 'Add Sub‑menu Dynamically',
        to: '/toolkit/how-to?scroll=how-to-add-sub-menu',
        description:
          'Guide to dynamically register or override sub‑menu items at runtime using the SubMenuStore.'
      },
      {
        label: 'Use Alert Store',
        to: '/toolkit/how-to?scroll=how-to-use-alert-store',
        description:
          'Instructions on how to trigger, customize and clear alerts via the AlertStore API.'
      }
    ]
  },
  {
    title: 'Built-in State Management',
    items: [
      {
        label: 'State Demo',
        to: '/toolkit/state-demo',
        description:
          'Demonstrates local (`useStore`) and global (`useGlobalStore`) state management.'
      }
    ]
  },
  {
    title: 'Built-in Data Handler',
    items: [
      {
        label: 'TanStack React Query',
        to: '/query/tanstack-react-query-demo',
        description: 'Client for fetching, caching, and updating server data in React.'
      },
      {
        label: 'GraphQL Client',
        to: '/query/graphql-demo',
        description: 'Built-in GraphQL client for executing queries and mutations.'
      }
    ]
  },
  {
    title: 'Built-in Routing',
    items: [
      {
        label: 'Route Demo',
        to: '/toolkit/route-demo',
        description: 'Auto-generated routing powered by `vite-plugin-pages`.'
      }
    ]
  },
  {
    title: 'Built-in Scroll',
    items: [
      {
        label: 'Scroll Demo',
        to: '/toolkit/scroll-demo',
        description: 'Smooth scrolling to sections based on URL parameters.'
      }
    ]
  },
  {
    title: 'Built-in Translation',
    items: [
      {
        label: 'Translation Demo',
        to: '/toolkit/translation-demo',
        description:
          'Showcases the built-in React Context translation feature: dynamic locale loading and key lookup with `useTranslate`.'
      }
    ]
  },
  {
    title: 'Built-in Components',
    items: [
      {
        label: 'Component Overview',
        to: '/toolkit/components',
        description: 'Showcase of all available UI components in the app.'
      }
    ]
  },
  {
    title: 'Crash Handler',
    items: [
      {
        label: 'Error Boundary Page',
        to: '/toolkit/crash-test',
        description: 'Handles exceptions and displays a styled alert infobox.'
      }
    ]
  },
  {
    title: '404 Page',
    items: [
      {
        label: 'Not Found',
        to: '/toolkit/no-route',
        description: 'Fallback page for unmatched routes.'
      }
    ]
  }
]

export default function TableOfContents() {
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [tocOpen, setTocOpen] = useState(false)

  const toggleSection = (title: string) => {
    setOpenSection(openSection === title ? null : title)
  }

  const toggleToc = () => setTocOpen(!tocOpen)

  return (
    <div className="max-w-lg mx-auto p-2">
      {/* Accordion wrapper for entire TOC */}
      <button
        onClick={toggleToc}
        className="w-full flex justify-between items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 focus:outline-none rounded-md text-blue-800"
      >
        <span className="font-semibold">Table of Contents</span>
        <span className="text-xl font-bold text-blue-600">{tocOpen ? '−' : '+'}</span>
      </button>

      <div
        className={`mt-1 bg-white shadow rounded-md divide-y divide-gray-200 overflow-hidden transition-max-height duration-300 ease-in-out ${
          tocOpen ? 'max-h-screen' : 'max-h-0'
        }`}
      >
        {/* Individual sections accordion */}
        {sections.map((section) => (
          <div key={section.title}>
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex justify-between items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none"
            >
              <span className="font-medium text-gray-800">{section.title}</span>
              <span className="text-xl font-bold text-gray-600">
                {openSection === section.title ? '−' : '+'}
              </span>
            </button>
            <div
              className={`transition-max-height duration-300 ease-in-out overflow-hidden ${
                openSection === section.title ? 'max-h-screen' : 'max-h-0'
              }`}
            >
              <ul className="space-y-2 p-2">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `block p-3 rounded ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'} font-medium`
                      }
                    >
                      <div>{item.label}</div>
                      <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
