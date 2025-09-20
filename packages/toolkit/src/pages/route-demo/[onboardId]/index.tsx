// packages/toolkit/src/pages/route-demo/[onboardId]/index.tsx
import { useParams } from 'react-router-dom'
import Layout from '@components/demo/Layout'
import Card from '@components/demo/Card'
import ModuleLink from '@components/ModuleLink'

export default function DynamicStep() {
  const { onboardId } = useParams()
  return (
    <Layout>
      <Card title="Dynamic Route Example">
        <p className="text-gray-700 mb-4">
          This demonstrates a dynamic param: <code>/route-demo/{onboardId}</code>.
        </p>
        <ModuleLink
          to={`/route-demo/${onboardId}/abc`}
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Go deeper to <code>/route-demo/{onboardId}/abc</code>
        </ModuleLink>
      </Card>
    </Layout>
  )
}
