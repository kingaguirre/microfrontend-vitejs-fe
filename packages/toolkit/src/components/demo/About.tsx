// src/components/AboutPage.tsx
import React from 'react'
import { Icon } from 'react-components-lib.eaa'
import TableOfContents from './TableOfContents'

export default function AboutPage() {
  return (
    <div className="prose max-w-none p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">📄 About This Microfrontend Monorepo</h2>

      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-6">
        <p className="text-sm">
          ℹ️ <strong>Quick Tip:</strong> This page gives an overview of our microfrontend setup,
          core concepts, and how to get started.
        </p>
        <p className="text-sm mt-2 flex items-center">
          📑{' '}
          <span className="ml-2">
            Don’t forget to explore the <strong>Table of Contents</strong> below to jump straight to
            any feature section!
          </span>
        </p>
      </div>

      <TableOfContents />

      <section className="mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <Icon icon="info" className="h-5 w-5 mr-2 text-blue-500" />
          Overview
        </h3>
        <p>
          This repo implements a microfrontend architecture using <strong>Module Federation</strong>{' '}
          and <strong>Vite</strong>. Each module ships its own bundle and can be loaded
          independently or within the host <code>app-shell</code>.
        </p>
      </section>

      <section className="mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <Icon icon="view_module" className="h-5 w-5 mr-2 text-blue-500" />
          Module Structure
        </h3>
        <ul className="list-disc list-inside pl-6">
          <li>
            <code>packages/app-shell</code>: Host application that orchestrates remote modules.
          </li>
          <li>
            <code>packages/common</code>: Shared utilities (GraphQL client, components, styles).
          </li>
          <li>
            <code>packages/toolkit</code>: Example toolkit module demonstrating state sharing and
            auto-toolkit—any new folder under <code>src/pages</code> instantly becomes a route, no
            extra code needed.
          </li>
          <li>
            <code>packages/query</code>: Example data-fetching module with React Query and GraphQL.
          </li>
          <li>
            <code>packages/module-xyz</code>: Custom modules (scaffolded via{' '}
            <code>npm run create-module module-xyz 4003 3003</code>). This folder doesn’t exist
            until you run the command—shown here as an example.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <Icon icon="settings" className="h-5 w-5 mr-2 text-blue-500" />
          Core Concepts
        </h3>
        <ul className="list-disc list-inside pl-6 space-y-2">
          <li>
            <strong>Module Federation:</strong> Each package exposes a <code>remoteEntry.js</code>{' '}
            for dynamic, on-demand loading.
          </li>
          <li>
            <strong>Shared Dependencies:</strong> React, ReactDOM, translation context, and other
            commons are deduped via your Vite/MF shared config.
          </li>
          <li>
            <strong>Built-in Routing:</strong> Drop pages under <code>src/pages/</code>—the shell
            picks them up automatically via <code>vite-plugin-pages</code>.
          </li>
          <li>
            <strong>Built-in Scroll:</strong> Smooth scrolling highlights any element with{' '}
            <code>?scroll=&lt;id&gt;</code> using our Mutation Observer + offset logic.
          </li>
          <li>
            <strong>Built-in Translation:</strong> React-Context-powered —just add JSON under{' '}
            <code>src/language/&lt;lang&gt;.json</code>, then{' '}
            <code>useTranslate('toolkit').t('key')</code>.
          </li>
          <li>
            <strong>Built-in Data Handlers:</strong> TanStack React Query & a GraphQL client are
            wired in for every module.
          </li>
          <li>
            <strong>Global Store:</strong> Cross-module state via a shared Zustand store and{' '}
            <code>useGlobalStore</code> hook.
          </li>
          <li>
            <strong>Crash Handler:</strong> An <code>ErrorBoundary</code> around your routes
            surfaces styled infoboxes on any runtime exception.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <Icon icon="play_circle_filled" className="h-5 w-5 mr-2 text-blue-500" />
          Getting Started
        </h3>
        <ul className="list-disc list-inside pl-6">
          <li>
            <strong>Clone the repo:</strong> <code>git clone https://repo-url.git</code>
          </li>
          <li>
            <strong>Install deps:</strong> <code>npm install</code> or <code>yarn</code>
          </li>
          <li>
            <strong>Run shell:</strong> <code>npm run shell</code>
          </li>
          <li>
            <strong>Run a module standalone:</strong> <code>npm run toolkit</code>
          </li>
          <li>
            <strong>Run everything at once:</strong> <code>npm run start</code>
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <Icon icon="code" className="h-5 w-5 mr-2 text-blue-500" />
          Development Workflow
        </h3>
        <ul className="list-disc list-inside pl-6">
          <li>
            <strong>Scaffold new module:</strong>{' '}
            <code>npm run create-module module-abc 4003 3003</code>
          </li>
          <li>
            <strong>Remove module:</strong> <code>npm run remove-module module-xyz</code>
          </li>
          <li>
            <strong>Lint:</strong> <code>npm run fix</code> (Run lint and prettier)
          </li>
        </ul>
      </section>

      {/* How-To info box */}
      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded mb-6">
        <p className="text-sm">
          💡 <strong>How-To Guides:</strong> Head over to the How-To page for step-by-step
          instructions on scaffolding a new module and running it locally—click the link in the
          header.
        </p>
      </div>

      {/* Contributing Section */}
      <section>
        <h3 className="text-xl font-semibold flex items-center">
          <Icon icon="group" className="h-5 w-5 mr-2 text-blue-500" />
          Contributing
        </h3>
        <p>
          Feel free to open issues or pull requests. Follow <strong>Conventional Commits</strong>{' '}
          for commit messages.
        </p>
      </section>
    </div>
  )
}
