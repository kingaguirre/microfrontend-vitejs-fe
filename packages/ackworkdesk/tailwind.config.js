// packages/toolkit/tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // your module files
    '../app-shell/src/**/*.{js,jsx,ts,tsx}' // include all shell files
  ],
  theme: { extend: {} },
  plugins: []
}
