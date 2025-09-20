import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Tooltip } from 'react-components-lib.eaa'

const ScrollDemo: React.FC = () => {
  const { pathname } = useLocation()

  // Our 5 demo sections
  const sections = Array.from({ length: 5 }, (_, i) => ({
    id: `section-${i + 1}`,
    title: `Section ${i + 1}`,
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20)
  }))

  return (
    <div className="bg-gray-100 [&_code]:text-pink-500">
      {/* 1) Sticky header */}
      <div className="sticky top-0 bg-white shadow z-10">
        <ul className="flex gap-4 p-4 container mx-auto">
          <li className="text-gray-700 hover:text-blue-500">
            <Link to="/toolkit">Home</Link>
          </li>
          {sections.map((sec) => (
            <li key={sec.id} className="text-gray-700 hover:text-blue-500">
              <Link to={`${pathname}?scroll=${sec.id}`}>{sec.title}</Link>
            </li>
          ))}
          <li className="text-gray-700 hover:text-blue-500">
            <Link to={`${pathname}?scroll=custom-demo`}>Custom Demo</Link>
          </li>
          {/* New: No-Highlight demo link */}
          <li className="text-gray-700 hover:text-blue-500">
            <Link to={`${pathname}?scroll=no-highlight`}>No Highlight</Link>
          </li>
        </ul>
      </div>

      {/* Info box */}
      <div className="mt-4 container mx-auto px-4 py-4 bg-blue-50 border-l-4 border-blue-500 rounded">
        <div className="text-blue-800 text-sm space-y-4">
          <div>
            <strong>🔧 Built-in Features:</strong>
          </div>
          <ul className="list-disc list-inside ml-4">
            <li>Auto-scroll to top on every route change</li>
            <li>
              Scroll &amp; highlight via <code>data-scroll-to-view</code> +{' '}
              <code>?scroll=yourId</code>
            </li>
            <li>
              Control vertical offset with <code>data-scroll-offset="yourOffsetInPx"</code>
            </li>
            <li>
              Disable highlight by setting <code>data-highlight-class="none"</code>
            </li>
            <li>
              Any element with <code>data-scroll-to-top</code> will scroll the container back to top
              when clicked
            </li>
          </ul>

          <div>
            <strong>💡 How it works:</strong>
          </div>
          <ul className="list-disc list-inside ml-4">
            <li>
              Click a header link or append <code>?scroll=section-id</code> to the URL
            </li>
            <li>
              The element with <code>data-scroll-to-view="section-id"</code> is scrolled into view
            </li>
            <li>
              You can add <code>data-scroll-offset="100"</code> (for example) on the same element to
              shift the scroll position down by 100px from the top
            </li>
            <li>
              It’s highlighted unless you disable it with <code>data-highlight-class="none"</code>
            </li>
            <li>
              Override the highlight look with any Tailwind classes via{' '}
              <code>data-highlight-class</code>
            </li>
          </ul>
        </div>
      </div>

      {/* 2) Content blocks */}
      <div className="container mx-auto px-4 py-6">
        {sections.map((sec) => (
          <div
            key={sec.id}
            id={sec.id}
            data-scroll-to-view={sec.id}
            className="border rounded-lg p-6 bg-gray-50 mb-4"
          >
            <h2 className="text-xl font-semibold mb-4">{sec.title}</h2>
            <p>{sec.content}</p>
          </div>
        ))}

        {/* Custom Highlight Demo */}
        <div
          id="custom-demo"
          data-scroll-to-view="custom-demo"
          data-highlight-class="border border-pink-500 shadow-[0_0_12px_4px_rgba(236,72,153,0.6)]"
          className="border rounded-lg p-6 bg-gray-50 mb-4"
        >
          <h2 className="text-xl font-semibold mb-4">Custom Highlight Demo</h2>
          <p className="mb-2">This box demonstrates the custom highlight feature:</p>
          <ul className="list-disc list-inside mb-2 text-sm">
            <li>
              It uses{' '}
              <code>
                data-highlight-class="border-pink-500 shadow-[0_0_12px_4px_rgba(236,72,153,0.6)]"
              </code>
            </li>
            <li>
              Click “Custom Demo” or append <code>?scroll=custom-demo</code> to the URL
            </li>
          </ul>
        </div>

        {/* No Highlight Demo */}
        <div
          id="no-highlight"
          data-scroll-to-view="no-highlight"
          data-highlight-class="none"
          className="border rounded-lg p-6 bg-gray-50 mb-4"
        >
          <h2 className="text-xl font-semibold mb-4">No-Highlight Demo</h2>
          <p className="text-sm">
            This box will scroll into view but <strong>no highlight</strong> will be applied because
            <code>data-highlight-class="none"</code>.
          </p>
        </div>
      </div>

      {/* Floating Back-to-Top */}
      <div className="fixed bottom-12 right-6 z-20">
        <Tooltip content="Add 'data-scroll-to-top' to any element for auto-scrolling to top">
          <button
            data-scroll-to-top
            className="
              bg-blue-600 hover:bg-blue-700 
              text-white 
              p-3 
              rounded-full 
              shadow-lg 
              focus:outline-none 
              focus:ring-2 focus:ring-blue-300
            "
          >
            ↑ Top
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

export default ScrollDemo
