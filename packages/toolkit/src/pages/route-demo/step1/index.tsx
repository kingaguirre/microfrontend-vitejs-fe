// packages/toolkit/src/pages/route-demo/step1/index.tsx
import Layout from '@components/demo/Layout'
import Card from '@components/demo/Card'
import ModuleLink from '@components/ModuleLink'

export default function Step1() {
  return (
    <Layout>
      <Card title="Step 1: Static Route">
        <p className="text-gray-700 mb-4">
          You’re on a deeper static route. The path is <code>/route-demo/step1</code>.
        </p>
        <ModuleLink
          to="/route-demo/step1/step2"
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Go to Step 2
        </ModuleLink>
      </Card>
    </Layout>
  )
}
