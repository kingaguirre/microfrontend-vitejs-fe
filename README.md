# Microfrontend Monorepo

This repository contains three packages:

- **app-shell**: the host application
- **toolkit**: a remote module demonstrating toolkit
- **query**: a remote module demonstrating data fetching with TanStack React Query

Thanks to npm workspaces, running `npm install` at the root will install all dependencies for every package.

---

## Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10

---

## Installation

At the root of the repo, simply run:

```bash
npm install
```

This will install dependencies for **app-shell**, **toolkit**, and **query** in one go.

---

## Development Scripts

A set of helpful scripts is defined in the root `package.json`:

```json
{
  "scripts": {
    "shell": "npm run start --workspace=packages/app-shell",
    "toolkit:local": "npm run serve:local --workspace=packages/toolkit",
    "query:local": "npm run serve:local --workspace=packages/query",
    "start": "concurrently \"npm run shell\" \"npm run toolkit:local\" \"npm run query:local\" \"npx wait-on http://localhost:3000 && npx open-cli http://localhost:3000\""
  }
}
```

- **shell**: starts the host app (`app-shell`) on port 3000
- **toolkit\:local**: runs the `toolkit` module for host consumption (port 4001)
- **query\:local**: runs the `query` module for host consumption (port 4002)
- **start**: launches **app-shell** + both modules in parallel, then opens your browser at [http://localhost:3000](http://localhost:3000)

> **Note:** This requires the dev-dependencies: `concurrently`, `wait-on`, and `open-cli`.

---

## Running from Root

You can start each package directly from the repository root using npm workspace commands:

| Package       | Command                                        | Port (default) | URL                                            |
| ------------- | ---------------------------------------------- | -------------- | ---------------------------------------------- |
| **app-shell** | `npm run start --workspace=packages/app-shell` | 3000           | [http://localhost:3000](http://localhost:3000) |
| **toolkit**   | `npm run start --workspace=packages/toolkit`   | 3001           | [http://localhost:3001](http://localhost:3001) |
| **query**     | `npm run start --workspace=packages/query`     | 3002           | [http://localhost:3002](http://localhost:3002) |

---

## Running Modules in the Host (serve\:local)

When you want `app-shell` to consume your locally built remotes, use each module’s `serve:local` script from the root:

```bash
npm run serve:local --workspace=packages/toolkit  # remote at port 4001
npm run serve:local --workspace=packages/query    # remote at port 4002
```

Then, in a separate terminal, start the host as before:

```bash
npm run shell
```

The host will fetch the remotes automatically from ports **4001** and **4002**.

---

## Summary of Commands

| Script                  | Runs                           | Description                                |
| ----------------------- | ------------------------------ | ------------------------------------------ |
| `npm run start`         | shell + modules + browser open | Fire up the entire microfrontend in one go |
| `npm run shell`         | app-shell only                 | Start host application                     |
| `npm run toolkit:local` | toolkit as remote              | Serve `toolkit` for host integration       |
| `npm run query:local`   | query as remote                | Serve `query` for host integration         |
| `npm run build`         | —                              | Lint, format, then build all packages      |
| `npm run verify`        | —                              | Lint and format check only                 |
| `npm run lint`          | —                              | Run ESLint (with auto-fix)                 |
| `npm run format`        | —                              | Run Prettier write                         |

---

Happy coding! 🚀
