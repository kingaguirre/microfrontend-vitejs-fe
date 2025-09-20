// packages/toolkit/src/pages/route-demo/[onboardId]/[onboardId2]/new/index.tsx
import { useParams } from 'react-router-dom'
import Layout from '@components/demo/Layout'
import Card from '@components/demo/Card'
import ModuleLink from '@components/ModuleLink'

export default function NewItem() {
  const { onboardId, onboardId2 } = useParams()
  return (
    <Layout>
      <Card title="Final Static Route">
        <p className="text-gray-700 mb-4">
          You’ve reached the final static segment:{' '}
          <code>
            /route-demo/{onboardId}/{onboardId2}/new
          </code>
          .
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
