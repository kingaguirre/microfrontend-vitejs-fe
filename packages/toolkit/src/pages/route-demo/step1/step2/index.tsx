// packages/toolkit/src/pages/route-demo/step1/step2/index.tsx
import Layout from '@components/demo/Layout'
import Card from '@components/demo/Card'
import ModuleLink from '@components/ModuleLink'

export default function Step2() {
  return (
    <Layout>
      <Card title="Step 2: Nested Static Route">
        <p className="text-gray-700 mb-4">
          Now you’re two levels deep: <code>/route-demo/step1/step2</code>.
        </p>
        <ModuleLink
          to="/route-demo"
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Back to Route Demo
        </ModuleLink>
      </Card>
    </Layout>
  )
}
