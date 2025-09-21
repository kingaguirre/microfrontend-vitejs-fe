// packages/home/src/pages/index.tsx
import { useMemo } from 'react'
import { Panel, Button, Icon, theme } from 'react-components-lib.eaa'

export default function Home() {
  const stats = useMemo(
    () => [
      {
        label: 'Open Transactions',
        value: '1,284',
        icon: 'assignment',
        change: +5.3,
        href: '/txnworkdesk',
        cta: 'View transactions'
      },
      {
        label: 'Pending Registrations',
        value: '312',
        icon: 'hourglass_bottom',
        change: -2.1,
        href: '/ackworkdesk',
        cta: 'View registrations'
      },
      {
        label: 'Exceptions',
        value: '47',
        icon: 'error_outline',
        change: +12.4,
        href: '/txnenquiry',
        cta: 'View exceptions'
      },
      {
        label: 'Today’s Releases',
        value: '539',
        icon: 'add_task',
        change: +1.8,
        href: '/txnenquiry',
        cta: 'See releases'
      }
    ],
    []
  )

  const Percent = ({ change }: { change: number }) => {
    const up = change >= 0
    const color = up ? theme.colors.success.base : theme.colors.danger.base
    const bg = up ? theme.colors.success.pale : theme.colors.danger.pale
    const icon = up ? 'arrow_upward' : 'arrow_downward'
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-[1px] text-xs rounded"
        style={{ background: bg, color }}
      >
        <Icon icon={icon} size={12} />
        {Math.abs(change).toFixed(1)}%
      </span>
    )
  }

  const go = (href: string) => (window.location.href = href)

  return (
    <div
      className="w-full h-full overflow-auto bg-gray-50 rounded-[2px]"
      style={{ borderBottom: `1px solid ${theme.colors.primary.base}` }}
    >
      {/* Hover rules for stats */}
      <style>{`
        /* smooth animation on hover */
        .stat-card .stat-icon,
        .stat-card .stat-text,
        .stat-card .stat-value {
          transition: color 300ms ease, transform 300ms ease, background-color 300ms ease;
        }

        /* hover targets */
        .stat-card:hover .stat-icon {
          color: ${theme.colors.primary.base} !important;
        }
        .stat-card:hover .stat-text {
          color: #374151 !important; /* gray-700 */
        }
        .stat-card:hover .stat-value {
          color: ${theme.colors.primary.darker} !important;
        }
      `}</style>

      {/* Hero / Header */}
      <div
        className="w-full"
        style={{
          background: `linear-gradient(90deg, ${theme.colors.primary.pale} 0%, #ffffff 100%)`,
          borderBottom: '1px solid #E5E7EB'
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-5 py-6">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 flex items-center justify-center rounded-md font-bold text-white shrink-0"
              style={{ background: theme.colors.primary.base }}
            >
              TX
            </div>
            <div className="flex-1">
              <div className="text-xl font-semibold" style={{ color: theme.colors.primary.darker }}>
                TradeXpress
              </div>
              <div className="text-sm text-gray-600">
                Event-driven, global platform for Trade Finance processing
              </div>
            </div>
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: `radial-gradient(ellipse at 30% 30%, #fff 0%, ${theme.colors.primary.pale} 90%)`,
                color: theme.colors.primary.base,
                border: `2px solid ${theme.colors.primary.base}`,
                boxShadow: `0 0 0 4px ${theme.colors.primary.pale}, 0 0 0 8px rgba(0,0,0,0.04)`
              }}
              aria-label="TradeXpress logo"
            >
              <Icon icon="logo-icon" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-screen-2xl mx-auto px-5 py-6 grid grid-cols-1 gap-6">
        {/* Quick stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Panel key={s.label}>
              <div
                role="link"
                tabIndex={0}
                onClick={() => go(s.href)}
                onKeyDown={(e) => (e.key === 'Enter' ? go(s.href) : undefined)}
                className="group stat-card cursor-pointer select-none outline-none"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="stat-icon h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                    style={{
                      background: theme.colors.primary.pale,
                      color: theme.colors.primary.darker
                    }}
                  >
                    <Icon icon={s.icon} size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="stat-text text-xs text-gray-500 truncate transition-colors">
                        {s.label}
                      </div>
                      <Percent change={s.change} />
                    </div>

                    <div className="mt-1 flex items-baseline gap-2">
                      <div className="stat-value text-2xl leading-none font-semibold transition-colors">
                        {s.value}
                      </div>
                      <div className="stat-text text-xs text-gray-500 transition-colors">
                        vs last week
                      </div>
                    </div>

                    <div className="mt-3 text-xs flex items-center gap-1">
                      <span
                        className="hover:opacity-80"
                        style={{ color: theme.colors.primary.base }}
                      >
                        {s.cta}
                      </span>
                      <span
                        className="transition-transform group-hover:translate-x-0.5"
                        style={{ color: theme.colors.primary.base }}
                        aria-hidden
                      >
                        <Icon icon="arrow_forward" size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          ))}
        </div>

        {/* About */}
        <Panel>
          <div
            className="px-4 py-2 mb-4 rounded"
            style={{ background: theme.colors.primary.base, color: 'white' }}
          >
            <div className="flex items-center gap-2">
              <Icon icon="info" size={16} />
              <span className="font-semibold tracking-wide">ABOUT TRADEXPRESS</span>
            </div>
          </div>
          <p className="text-sm leading-6 text-gray-700">
            TradeXpress is next generation state of the art application developed using event driven
            architecture to support trade finance transaction processing. TradeXpress is a global
            Business, Technology and Operations initiative that will revolutionise the Trade Finance
            world for the Bank. The key objectives of Trade Port are to provide our clients with a
            complete suite of products across all our markets; to become number one Trade Finance
            bank globally. We will re-align our operations model to address market and economic
            pressures implementing a standard global target operating model. And we will deliver a
            fully integrated back end operating platform that will enable greater efficiencies and
            provide comprehensive product offerings across all our markets.
          </p>
        </Panel>

        {/* Key benefits */}
        <Panel>
          <div
            className="px-4 py-2 mb-4 rounded"
            style={{ background: theme.colors.primary.base, color: 'white' }}
          >
            <div className="flex items-center gap-2">
              <Icon icon="emoji_objects" size={16} />
              <span className="font-semibold tracking-wide">WHAT ARE THE KEY BENEFITS?</span>
            </div>
          </div>
          <p className="text-sm leading-6 text-gray-700 mb-4">
            TradeXpress will drive extensive benefits for our clients as well as our staff. Clients
            will be able to access broader trade product offering delivered consistently in all our
            markets. New products or capabilities will be available sooner across the network. Using
            a single global system with integrated workflow and imaging, processing of clients
            transactions will be completed faster, eliminating the need for cut off times and
            introducing a true 24/7 operating environment. Workflow management will ensure
            transactions will be accurately tracked, traced, monitored and routed based on various
            predefined parameters to different teams for better control and efficiency. With the
            Bank&apos;s global footprint, exporters and importers across all client segments — from
            SME to Global Corporates — will benefit. TradeXpress will enable one-step processing for
            transactions where clients at both ends of the transaction bank with SCB.
          </p>
          <ul className="text-sm text-gray-700 list-disc pl-6 space-y-1">
            <li>Consistent and comprehensive trade offering across our network.</li>
            <li>Improved service guarantees and shortened turnaround times.</li>
            <li>Optimal utilisation of credit facilities.</li>
            <li>Flexible pricing structures and client specific customisation.</li>
            <li>
              Full integration with Straight2Bank/NextGen platform for transaction initiation,
              tracking and reporting.
            </li>
          </ul>
        </Panel>

        {/* Quick actions + help */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Workspace shortcuts */}
          <Panel>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon icon="apps" size={16} />
                <div className="font-semibold">Workspace shortcuts</div>
              </div>
              <div className="text-xs text-gray-500">Most-used flows</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={() => (window.location.href = '/ackworkdesk')}
                className="justify-start"
              >
                <Icon icon="desktop_mac" size={16} /> Ack Work Desk
              </Button>
              <Button
                onClick={() => (window.location.href = '/txnworkdesk')}
                className="justify-start"
              >
                <Icon icon="repeat" size={16} /> Txn Work Desk
              </Button>
              <Button
                onClick={() => (window.location.href = '/txnenquiry')}
                className="justify-start"
              >
                <Icon icon="auto_awesome_mosaic" size={16} /> Transaction Enquiry
              </Button>
              <Button
                variant="outlined"
                onClick={() => (window.location.href = '/setup')}
                className="justify-start"
              >
                <Icon icon="settings" size={16} /> Setup
              </Button>
            </div>

            <div className="mt-3 text-xs text-gray-500">
              Tip: Press <span className="px-1 rounded bg-gray-100 border font-mono">Command</span>/
              <span className="px-1 rounded bg-gray-100 border font-mono">Ctrl</span> +{' '}
              <span className="px-1 rounded bg-gray-100 border font-mono">.</span> to show side menu
              links shortcut.
            </div>
          </Panel>

          {/* System status */}
          <Panel>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon icon="monitor-check" size={16} />
                <div className="font-semibold">System status</div>
              </div>
              <div className="text-xs text-gray-500">Updated just now</div>
            </div>

            <div className="flex items-center gap-2 mb-3 text-sm">
              <Icon icon="check_circle" size={16} color={theme.colors.success.base} />
              <span className="text-gray-700">
                Platform is <span className="font-medium">operational</span>. No incidents reported.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
              <div className="flex items-center gap-2">
                <Icon icon="speed" size={14} className="opacity-70" />
                API latency: <span className="font-medium ml-1">~400ms</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="insights" size={14} className="opacity-70" />
                Uptime (30d): <span className="font-medium ml-1">99.98%</span>
              </div>
              {/* Shorter + no-wrap */}
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Icon icon="event_available" size={14} className="opacity-70" />
                <span>Maint:</span> <span className="font-medium ml-1">Sun 02:00 UTC</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="new_releases" size={14} className="opacity-70" />
                Release: <span className="font-medium ml-1">v2.7.3</span>
              </div>
            </div>
          </Panel>

          {/* Help & support */}
          <Panel>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon icon="support_agent" size={16} />
                <div className="font-semibold">Help &amp; support</div>
              </div>
              <div className="text-xs text-gray-500">We’re here to help</div>
            </div>

            <div className="text-sm text-gray-700 mb-3">
              Find how-tos in the User Guide or reach out to the TradeXpress support desk.
            </div>

            <div className="flex flex-wrap gap-3">
              <Button color="default" variant="outlined">
                Open a ticket
              </Button>
              <Button color="default">Ask the community</Button>
              <Button color="default">User Guide</Button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Icon icon="access_time" size={12} /> Response SLA:{' '}
                <span className="font-medium">4h</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon icon="mail" size={12} /> Email:{' '}
                <span className="font-medium">tx-support@bank.example</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
