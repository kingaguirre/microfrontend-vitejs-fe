// packages/app-shell/src/main.tsx
import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader } from "react-components-lib.eaa";
import AppRouter from "./component/AppRouter";
import NotFound from "./NotFound";
import type { RouteObject } from "react-router-dom";
import "./index.css";

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000 } },
});

function AppRouterWrapper() {
  const [combined, setCombined] = useState<any[] | null>(null);

  useEffect(() => {
    const modules = [
      /* __MODULE_setup_START */
      {
        path: "setup",
        title: "Setup",
        loader: () => import("setup/Routes"),
      },
      /* __MODULE_setup_END */
      /* __MODULE_ackworkdesk_START */
      {
        path: "ackworkdesk",
        title: "Ackworkdesk",
        loader: () => import("ackworkdesk/Routes"),
      },
      /* __MODULE_ackworkdesk_END */
      /* __MODULE_txnworkdesk_START */
      {
        path: "txnworkdesk",
        title: "Txnworkdesk",
        loader: () => import("txnworkdesk/Routes"),
      },
      /* __MODULE_txnworkdesk_END */
      {
        // loader import string is built from:
        //  • toolkit  = the name of the remote federation module
        //  • Routes   = the key you exposed in that module’s federation config
        //
        // Combined: import('toolkit/Routes')
        path: "toolkit",
        title: "Toolkit",
        loader: () => import("toolkit/Routes"),
      },
      {
        // Similarly:
        //  • query    = remote module name
        //  • Routes   = exposed entry key
        //
        // Combined: import('query/Routes')
        path: "query",
        title: "Query",
        loader: () => import("query/Routes"),
      }
    ] as const;

    Promise.allSettled(modules.map((m) => m.loader())).then((results) => {
      console.log(modules)
      const routes: RouteObject[] = results.flatMap((res, i) => {
        if (res.status === "fulfilled") {
          return [
            {
              title: modules[i].title,
              path: modules[i].path,
              children: res.value.default as RouteObject[],
            },
          ];
        } else {
          console.warn(
            `Module "${modules[i].path}" failed to load:`,
            res.reason,
          );
          return []; // drop it
        }
      });

      setCombined(routes);
    });
  }, []);

  // null = still loading *any* attempt; [] = attempted but nothing loaded
  if (combined === null) {
    return <Loader appendTo="body" size="md" label="Getting ready..." />;
  }

  const routesToUse =
    combined.length === 0
      ? [{ path: "*", title: "No route found", element: <NotFound /> }]
      : combined;

  return <AppRouter menuItems={routesToUse} routes={combined} />;
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <QueryClientProvider client={qc}>
    <AppRouterWrapper />
  </QueryClientProvider>,
);
