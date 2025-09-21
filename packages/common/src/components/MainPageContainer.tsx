// packages/common/src/components/MainPageContainer.tsx
import React from 'react'
import { theme } from 'react-components-lib.eaa'

export const MAIN_PAGE_TABLE_HEIGHT = 'calc(100vh - 212px)'

export function MainPageContainer({
  children,
  title
}: {
  children: React.ReactNode
  title: string
}) {
  return (
    <div className="w-full h-full bg-gray-100 rounded-[2px]">
      <div className="bg-white border border-gray-200 px-4 py-2">
        <div className="text-md font-semibold" style={{ color: theme.colors.primary.darker }}>
          {title}
        </div>
      </div>

      <div className="p-3">{children}</div>
    </div>
  )
}
