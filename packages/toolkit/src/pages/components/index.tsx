import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '@components/demo/Layout'
import {
  Badge,
  Button,
  FormControl,
  Grid,
  GridItem,
  Icon,
  Loader,
  Tooltip,
  Accordion,
  Alert,
  DatePicker,
  Dropdown,
  Panel,
  DataTable,
  Modal,
  Tabs
} from 'react-components-lib.eaa'

export default function ComponentsOverview() {
  const [showAtoms, setShowAtoms] = useState(true)
  const [showMolecules, setShowMolecules] = useState(false)
  const [showOrganisms, setShowOrganisms] = useState(false)
  const [showModalDemo, setShowModalDemo] = useState(false)

  const badgeColors = ['primary', 'success', 'warning', 'danger', 'info', 'default'] as const
  const buttonVariants = ['default', 'outlined', 'link'] as const
  const buttonSizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
  const buttonColors = ['primary', 'success', 'warning', 'danger', 'info', 'default'] as const
  const formTypes = [
    'text',
    'password',
    'email',
    'number',
    'checkbox',
    'radio',
    'switch',
    'checkbox-group',
    'radio-group',
    'switch-group',
    'radio-button-group',
    'textarea'
  ] as const

  return (
    <Layout>
      <div className="w-full space-y-8">
        {/* Intro */}
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
          <p className="text-sm">
            🚀 <strong>Built-in Library:</strong> This app includes{' '}
            <code>react-components-lib.eaa</code> with reusable UI components.
          </p>
        </div>

        {/* Atoms Accordion */}
        <div className="border rounded-md overflow-hidden bg-white">
          <button
            onClick={() => setShowAtoms(!showAtoms)}
            className="w-full px-4 py-2 bg-blue-100 hover:bg-blue-200 flex justify-between items-center"
          >
            <span className="font-bold text-lg">⚛️ Atoms</span>
            <span className="text-xl">{showAtoms ? '−' : '+'}</span>
          </button>
          {showAtoms && (
            <div className="px-4 py-4">
              {/* Badge */}
              <section className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Badge</h3>
                <div className="flex flex-wrap gap-2">
                  {badgeColors.map((color) => (
                    <Badge key={color} color={color}>
                      {color}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {badgeColors.map((color) => (
                    <Badge key={color} color={color} outlined>
                      {color}
                    </Badge>
                  ))}
                </div>
              </section>
              {/* Button */}
              <section className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Button</h3>
                <Grid cols={buttonVariants.length} gap={4} className="mb-4">
                  {buttonVariants.map((v) => (
                    <GridItem key={v}>
                      <Button variant={v}>{v}</Button>
                    </GridItem>
                  ))}
                </Grid>
                <Grid cols={3} gap={4} className="mb-4">
                  {buttonColors.map((c) => (
                    <GridItem key={c}>
                      <Button color={c}>{c}</Button>
                    </GridItem>
                  ))}
                </Grid>
                <Grid cols={buttonSizes.length} gap={4}>
                  {buttonSizes.map((s) => (
                    <GridItem key={s}>
                      <Button size={s}>{s}</Button>
                    </GridItem>
                  ))}
                </Grid>
              </section>
              {/* FormControl */}
              <section className="mb-6">
                <h3 className="text-xl font-semibold mb-2">FormControl</h3>
                <Grid cols={2} gap={6}>
                  {formTypes.map((type) => (
                    <GridItem key={type}>
                      <FormControl
                        label={type}
                        type={type}
                        helpText={`Example of ${type}`}
                        placeholder={type === 'textarea' ? 'Enter long text...' : `Enter ${type}`}
                        options={
                          [
                            'checkbox-group',
                            'radio-group',
                            'switch-group',
                            'radio-button-group'
                          ].includes(type)
                            ? [
                                { value: 'opt1', text: 'Option 1' },
                                { value: 'opt2', text: 'Option 2' }
                              ]
                            : undefined
                        }
                      />
                    </GridItem>
                  ))}
                </Grid>
              </section>
              <div className="grid grid-cols-4 gap-8">
                {/* Icon */}
                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Icon</h3>
                  <Icon icon="standard-chartered" size={32} />
                </section>
                {/* Loader */}
                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Loader</h3>
                  <div className="flex flex-wrap gap-4 overflow-hidden">
                    <Loader />
                    <Loader size="lg" />
                    <div className="mb-4 w-[100%]">
                      <Loader type="line" />
                    </div>
                  </div>
                </section>
                {/* Tooltip */}
                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Tooltip</h3>
                  <Tooltip content="Info tooltip">
                    <Button>Hover me</Button>
                  </Tooltip>
                </section>
              </div>
            </div>
          )}
        </div>

        {/* Molecules Accordion */}
        <div className="border rounded-md overflow-hidden bg-white">
          <button
            onClick={() => setShowMolecules(!showMolecules)}
            className="w-full px-4 py-2 bg-blue-100 hover:bg-blue-200 flex justify-between items-center"
          >
            <span className="font-bold text-lg">🧬 Molecules</span>
            <span className="text-xl">{showMolecules ? '−' : '+'}</span>
          </button>
          {showMolecules && (
            <div className="px-4 py-4 space-y-8">
              {/* Accordion */}
              <section className="w-full bg-white">
                <h3 className="text-xl font-semibold mb-2">Accordion</h3>
                <Accordion
                  items={[
                    { title: 'Primary', children: <p>Primary content</p>, color: 'primary' },
                    { title: 'Disabled', children: <p>Can't open</p>, disabled: true },
                    {
                      title: 'Success',
                      children: <p>Success content</p>,
                      color: 'success',
                      open: true
                    }
                  ]}
                  allowMultiple
                />
              </section>
              {/* Alert */}
              <section className="w-full">
                <h3 className="text-xl font-semibold mb-2">Alert</h3>
                <div className="grid grid-cols-3 gap-8">
                  <Alert color="primary" title="Primary" show />
                  <Alert color="danger" title="Danger" show />
                  <Alert color="warning" title="Warning" show />
                  <Alert color="info" title="Info" show closeable />
                </div>
              </section>
              {/* DatePicker & Dropdown */}
              <section className="w-full">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">DatePicker</h3>
                    <DatePicker label="Pick a date" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Dropdown</h3>
                    <Dropdown
                      label="Select"
                      options={[
                        { value: '1', text: 'Option 1' },
                        { value: '2', text: 'Option 2', disabled: true }
                      ]}
                      filter
                      multiselect
                    />
                  </div>
                </div>
              </section>
              {/* Panel */}
              <section className="w-full">
                <h3 className="text-xl font-semibold mb-2">Panel</h3>
                <div className="grid grid-cols-3 gap-8">
                  {buttonColors.map((color) => (
                    <Panel
                      key={color}
                      title={`${color.charAt(0).toUpperCase() + color.slice(1)} Panel`}
                      color={color}
                      className="w-1/3"
                    >
                      <p>Content</p>
                    </Panel>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Organisms Accordion */}
        <div className="border rounded-md overflow-hidden bg-white">
          <button
            onClick={() => setShowOrganisms(!showOrganisms)}
            className="w-full px-4 py-2 bg-blue-100 hover:bg-blue-200 flex justify-between items-center"
          >
            <span className="font-bold text-lg">🌱 Organisms</span>
            <span className="text-xl">{showOrganisms ? '−' : '+'}</span>
          </button>
          {showOrganisms && (
            <div className="px-4 py-4">
              <h3 className="text-xl font-semibold mb-2">AppShell</h3>
              {/* AppShell Info */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6">
                <p className="text-sm">
                  ℹ️ <strong>AppShell Docs:</strong> Check out the full AppShell API, props, and
                  usage in Storybook.
                </p>
                <Link
                  to="https://react-components-sc-poc.vercel.app/?path=/docs/organisms-appshell--docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-yellow-600 hover:underline font-medium"
                >
                  View AppShell Docs →
                </Link>
              </div>

              {/* DataTable */}
              <section className="mt-6">
                <h3 className="text-xl font-semibold mb-2">DataTable</h3>
                <DataTable
                  title="Sample Table (10x10) with 1000 rows"
                  dataSource={Array.from({ length: 1000 }, (_, i) => {
                    const row: any = { __internalId: String(i) }
                    for (let c = 0; c < 10; c++) {
                      row[`col${c}`] = `R${i}C${c}`
                    }
                    return row
                  })}
                  columnSettings={Array.from({ length: 10 }, (_, c) => ({
                    title: `Column ${c}`,
                    column: `col${c}`
                  }))}
                />
              </section>

              {/* Modal Example */}
              <section className="mt-6">
                <h3 className="text-xl font-semibold mb-2">Modal</h3>
                <Button color="primary" onClick={() => setShowModalDemo(true)}>
                  Open Demo Modal
                </Button>
                <Modal
                  show={showModalDemo}
                  onClose={() => setShowModalDemo(false)}
                  title="Demo Modal"
                >
                  <p>This is a demo modal.</p>
                </Modal>
              </section>

              {/* Tabs Example */}
              <section className="mt-6">
                <h3 className="text-xl font-semibold mb-2">Tabs</h3>
                <Tabs
                  tabs={[
                    { title: 'Tab A', content: <p>Content A</p> },
                    { title: 'Tab B', content: <p>Content B</p> }
                  ]}
                />
              </section>
            </div>
          )}
        </div>

        {/* Storybook Link */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <p className="text-sm">🔍 Explore full API, props and variants in our Storybook:</p>
          <Link
            to="https://react-components-sc-poc.vercel.app/?path=/docs/about--docs"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-blue-600 hover:underline font-medium"
          >
            View Storybook Docs →
          </Link>
        </div>
      </div>
    </Layout>
  )
}
