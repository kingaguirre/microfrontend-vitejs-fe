#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import { spawnSync } from 'child_process'

const [, , moduleName] = process.argv
if (!moduleName) {
  console.error('Usage: npm run remove-module <moduleName>')
  process.exit(1)
}

const MODULE_DIR = path.join('packages', moduleName)
const HOST_VITE = path.join('packages', 'app-shell', 'vite.config.ts')
const HOST_MAIN = path.join('packages', 'app-shell', 'src', 'main.tsx')

async function removeDirectory(dir) {
  await fs.rm(dir, { recursive: true, force: true })
  console.log(`✅ Removed directory: ${dir}`)
}

async function stripBetweenMarkers(filePath, startTag, endTag) {
  let content = await fs.readFile(filePath, 'utf-8')
  const lines = content.split(/\r?\n/)
  const startIdx = lines.findIndex((l) => l.includes(startTag))
  const endIdx = lines.findIndex((l) => l.includes(endTag))
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    console.warn(`⚠️  Markers not found in ${path.basename(filePath)}`)
    return
  }
  // remove lines startIdx..endIdx (inclusive)
  const updated = [...lines.slice(0, startIdx), ...lines.slice(endIdx + 1)].join('\n')
  await fs.writeFile(filePath, updated)
  console.log(`✅ Stripped block ${startTag}…${endTag} from ${path.basename(filePath)}`)
}

async function main() {
  await removeDirectory(MODULE_DIR)

  // Remove the remote entry block in vite.config.ts
  await stripBetweenMarkers(HOST_VITE, `__MODULE_${moduleName}_START`, `__MODULE_${moduleName}_END`)

  // Remove the loader entry block in main.tsx
  await stripBetweenMarkers(HOST_MAIN, `__MODULE_${moduleName}_START`, `__MODULE_${moduleName}_END`)

  // Re-format both files
  console.log('🔧 Running Prettier to fix formatting…')
  spawnSync('npx', ['prettier', '--write', HOST_VITE], { stdio: 'inherit' })
  spawnSync('npx', ['prettier', '--write', HOST_MAIN], { stdio: 'inherit' })
  console.log('✅ Formatting complete\n')

  console.log('🏁 Module removal complete!')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
