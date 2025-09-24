import React, { useState } from 'react'
import ModuleContainer from '../../../components/ModuleContainer'
import { Panel, Grid, GridItem, FormControl, Button, Icon } from 'react-components-lib.eaa'

export default function ClauseEnquiry() {
  // Top search input
  const [searchShortName, setSearchShortName] = useState('')

  // Details (mocked; wire to API after)
  const [clauseId, setClauseId] = useState('')
  const [detailShortName, setDetailShortName] = useState('')
  const [islamic, setIslamic] = useState(false)
  const [applicableTemplate, setApplicableTemplate] = useState('')
  const [active, setActive] = useState(false)
  const [longName, setLongName] = useState('')

  const onSearch = () => {
    // demo: populate some locked details to mirror the screenshot
    setClauseId('CL-0001')
    setDetailShortName(searchShortName || 'Sample Clause')
    setIslamic(false)
    setApplicableTemplate('Facility')
    setActive(false)
    setLongName('Sample Clause Long Name')
  }

  const onClear = () => {
    setSearchShortName('')
    setClauseId('')
    setDetailShortName('')
    setIslamic(false)
    setApplicableTemplate('')
    setActive(false)
    setLongName('')
  }

  return (
    <ModuleContainer title="Clause Enquiry" onBack={() => history.back()} showFooter>
      <Panel title="Clause Enquiry Details" hideShadow>
        <div className="mb-4">
          <Grid spacing={16}>
            {/* Row 1: Search + actions */}
            <GridItem xs={12} md={3}>
              <FormControl
                label="Clause Short Name"
                placeholder="Enter Clause Name.."
                type="text"
                value={searchShortName}
                onChange={(e: any) => setSearchShortName(e?.target?.value ?? '')}
              />
            </GridItem>
            <GridItem xs={12} md={3}>
              <div className="flex items-end justify-start gap-2 h-full">
                <Button className="px-4" onClick={onSearch}>
                  <span className="inline-flex items-center gap-2">
                    Search <Icon icon="search" size={16} />
                  </span>
                </Button>
                <Button variant="outlined" className="px-4" onClick={onClear}>
                  Clear
                </Button>
              </div>
            </GridItem>
          </Grid>
        </div>

        <Grid spacing={16}>
          {/* Row 2: Locked details */}
          <GridItem xs={12} md={3}>
            <FormControl
              label="Clause ID"
              placeholder="Placeholder text here.."
              type="text"
              value={clauseId}
              onChange={() => {}}
              disabled
            />
          </GridItem>
          <GridItem xs={12} md={3}>
            <FormControl
              label="Clause Short Name"
              placeholder="Enter Clause Name.."
              type="text"
              value={detailShortName}
              onChange={() => {}}
              disabled
            />
          </GridItem>
          <GridItem xs={12} md={3}>
            <FormControl
              label="Islamic Indicator"
              type="checkbox"
              checked={islamic}
              onChange={() => {}}
              disabled
            />
          </GridItem>
          <GridItem xs={12} md={3}>
            <FormControl
              label="Applicable on Template Type"
              placeholder="Enter Template Type"
              type="text"
              value={applicableTemplate}
              onChange={() => {}}
              disabled
            />
          </GridItem>

          {/* Row 3: Active Status */}
          <GridItem xs={12} md={3}>
            <FormControl
              label="Active Status"
              type="checkbox"
              checked={active}
              onChange={() => {}}
              disabled
            />
          </GridItem>

          {/* Row 4: Long name (textarea, disabled) */}
          <GridItem xs={12}>
            <FormControl
              label="Clause Long Name"
              placeholder="Placeholder text here..."
              type="textarea"
              value={longName}
              onChange={() => {}}
              disabled
              maxLength={5000}
            />
          </GridItem>
        </Grid>
      </Panel>
    </ModuleContainer>
  )
}
