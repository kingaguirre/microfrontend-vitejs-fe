import React from 'react'

export default function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white shadow rounded p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  )
}
