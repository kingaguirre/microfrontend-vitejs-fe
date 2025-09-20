// packages/app-shell/tailwind.config.js
const path = require('path')

module.exports = {
  content: [
    // your HTML entrypoint
    path.resolve(__dirname, 'index.html'),

    // all of your shell’s components
    path.resolve(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),

    // if you ever import shared components via an alias,
    // include them here too:
    path.resolve(__dirname, '../**/src/**/*.{js,ts,jsx,tsx}')
  ],
  theme: { extend: {} },
  plugins: []
}
