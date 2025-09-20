#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import detectPort from 'detect-port'
import spawn from 'cross-spawn'
import { spawnSync } from 'child_process' // for Prettier

const [, , moduleName, hostPortRaw, standalonePortRaw] = process.argv
if (!moduleName || !hostPortRaw || !standalonePortRaw) {
  console.error('Usage: npm run create-module <moduleName> <inHostPort> <standalonePort>')
  process.exit(1)
}

const hostPort = parseInt(hostPortRaw, 10)
const standalonePort = parseInt(standalonePortRaw, 10)
const TOOLKIT_DIR = path.join('packages', 'toolkit')
const NEW_MODULE = path.join('packages', moduleName)
const HOST_VITE = path.join('packages', 'app-shell', 'vite.config.ts')
const HOST_MAIN = path.join('packages', 'app-shell', 'src', 'main.tsx')
const envVar = `VITE_REMOTE_${moduleName.toUpperCase().replace(/-/g, '_')}`

// 0. Prevent accidental overwrite if module already exists
try {
  await fs.access(NEW_MODULE)
  console.error(
    `❌ Module folder already exists at ${NEW_MODULE}. Pick a different name or remove it first.`
  )
  process.exit(1)
} catch {
  // doesn't exist—good to go
}

// 1. Port checks
async function assertFree(port, label) {
  const free = await detectPort(port)
  if (free !== port) {
    console.error(`❌ ${label} port ${port} is in use (suggested free: ${free})`)
    process.exit(1)
  }
  console.log(`✅ ${label} port ${port} is free`)
}
await assertFree(standalonePort, 'Stand-alone')
await assertFree(hostPort, 'In-Host')

console.log('🔨 Creating module…')

// 2. Copy toolkit template
await fs.cp(TOOLKIT_DIR, NEW_MODULE, { recursive: true })

// 3. Update module’s package.json
const pkgPath = path.join(NEW_MODULE, 'package.json')
let pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'))
pkg.name = moduleName
pkg.scripts['serve:local'] = `vite build && vite preview --port ${hostPort} --strictPort`
await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2))

// 4. Patch module.config.json
const cfgPath = path.join(NEW_MODULE, 'src', 'module.config.json')
let cfg = JSON.parse(await fs.readFile(cfgPath, 'utf-8'))
cfg.moduleName = moduleName
await fs.writeFile(cfgPath, JSON.stringify(cfg, null, 2))

// 5. Seed src/components with ModuleLink
const compsDir = path.join(NEW_MODULE, 'src', 'components')
await fs.rm(compsDir, { recursive: true, force: true })
await fs.mkdir(compsDir, { recursive: true })
await fs.writeFile(
  path.join(compsDir, 'ModuleLink.tsx'),
  `import { FC } from 'react'
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom'
import moduleConfig from '../module.config.json'

interface ModuleLinkProps extends Omit<RouterLinkProps, 'to'> {
  to: string
  [key: string]: any
}

const ModuleLink: FC<ModuleLinkProps> = ({ to, ...rest }) => {
  const raw = to.startsWith('/') ? to : \`/\${to}\`
  const prefixed = \`/\${moduleConfig.moduleName}\${raw}\`
  return <RouterLink to={prefixed} {...rest} />
}

export default ModuleLink
`
)

// 6. Create landing pages
const pagesDir = path.join(NEW_MODULE, 'src', 'pages')
await fs.rm(pagesDir, { recursive: true, force: true })
await fs.mkdir(path.join(pagesDir, 'hello-world'), { recursive: true })
await fs.mkdir(pagesDir, { recursive: true })

// 6a. hello-world page
await fs.writeFile(
  path.join(pagesDir, 'hello-world', 'index.tsx'),
  `import React from 'react'

export default function HelloWorld() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800">👋 Hello, ${moduleName}!</h1>
    </div>
  )
}`
)

// 6b. index landing page
await fs.writeFile(
  path.join(pagesDir, 'index.tsx'),
  `import React from 'react'
import ModuleLink from '../components/ModuleLink'

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-white">
      <h1 className="text-3xl font-semibold">Welcome to the ${moduleName} module</h1>
      <ModuleLink
        to="hello-world"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go to Hello World
      </ModuleLink>
    </div>
  )
}`
)

// 7. Patch vite.config.ts standalone port
const viteCfgPath = path.join(NEW_MODULE, 'vite.config.ts')
let viteCfg = await fs.readFile(viteCfgPath, 'utf-8')
viteCfg = viteCfg.replace(/server:\s*{\s*port:\s*\d+\s*}/, `server: { port: ${standalonePort} }`)
await fs.writeFile(viteCfgPath, viteCfg)

// 8. Wire up host remotes (with markers)
let hostViteTxt = await fs.readFile(HOST_VITE, 'utf-8')
hostViteTxt = hostViteTxt.replace(
  /remotes:\s*{/,
  `remotes: {\n` +
    `    /* __MODULE_${moduleName}_START */\n` +
    `    "${moduleName}": env.${envVar} || "http://localhost:${hostPort}/assets/remoteEntry.js",\n` +
    `    /* __MODULE_${moduleName}_END */`
)
await fs.writeFile(HOST_VITE, hostViteTxt)

// 9. Register loader in app-shell main.tsx (with markers)
let hostMain = await fs.readFile(HOST_MAIN, 'utf-8')
// remove stray comma
hostMain = hostMain.replace(/},\s*\n(\s*\] as const)/, '}\n$1')
hostMain = hostMain.replace(
  /\] as const/,
  `  /* __MODULE_${moduleName}_START */\n` +
    `  ,{\n` +
    `    path: "${moduleName}",\n` +
    `    title: "${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}",\n` +
    `    loader: () => import("${moduleName}/Routes"),\n` +
    `  }\n` +
    `  /* __MODULE_${moduleName}_END */\n` +
    `] as const`
)
await fs.writeFile(HOST_MAIN, hostMain)

// 10. Auto-format host files with Prettier
console.log('\n🔧 Running Prettier on host files…')
spawnSync('npx', ['prettier', '--write', HOST_VITE], { stdio: 'inherit' })
spawnSync('npx', ['prettier', '--write', HOST_MAIN], { stdio: 'inherit' })
console.log('✅ Host files formatted')

// 11. Launch module & host
console.log('\n🏁 Module ready!')
console.log(`   • Stand-alone port: ${standalonePort}`)
console.log(`   • In-Host port:     ${hostPort}\n`)

console.log('🚀 Starting module & host…')
spawn('npm', ['run', 'serve:local', `--workspace=packages/${moduleName}`], { stdio: 'inherit' })
spawn('npm', ['run', 'start', `--workspace=packages/app-shell`], { stdio: 'inherit' })
