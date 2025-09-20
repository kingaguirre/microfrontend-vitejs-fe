// packages/query/src/pages/tanstack-react-query-demo/UserDetails.tsx
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQueryApi } from '@app/common'
import Card from '@components/demo/Card'
import { Loader, Icon } from 'react-components-lib.eaa'
import type { User as UserType } from '../index'

export default function UserDetails() {
  const { userId } = useParams<{ userId: string }>()

  // 🔥 Fetch a single user by ID
  const {
    data: user, // ← the fetched user object
    isLoading, // ← true while the HTTP request is pending
    error // ← Error object if the request fails (4xx/5xx)
  } = useQueryApi<UserType>({
    queryKey: ['user', userId], // unique cache key per user ID
    endpoint: `https://jsonplaceholder.typicode.com/users/${userId}`, // URL to fetch user details
    enabled: !!userId, // only run when userId exists
    staleTime: 5 * 60_000 // treat data as fresh for 5 minutes
  })

  // Layout wrapper
  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Info banner */}
      <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded flex items-start">
        <span className="w-5 h-5 text-blue-500 mr-2">ℹ️</span>
        <p className="text-sm text-blue-700">
          This page demonstrates fetching a single user’s details using{' '}
          <code className="bg-gray-100 px-1 rounded">useQueryApi</code>. It automatically handles{' '}
          <strong>loading</strong>, <strong>errors</strong>, and <strong>caching</strong>.
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader size="lg" label="Loading user…" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <Card title="Error">
          <p className="text-red-600">Failed to load user. Please try again.</p>
          <div className="mt-4 text-right">
            <Link to=".." className="inline-flex items-center text-blue-600 hover:underline">
              <Icon icon="arrow-left" className="w-4 h-4 mr-1" />
              Back to Users
            </Link>
          </div>
        </Card>
      )}

      {/* User not found */}
      {!isLoading && !error && !user && (
        <Card title="User Not Found">
          <p>
            No user found with ID <code>{userId}</code>.
          </p>
          <div className="mt-4 text-right">
            <Link to=".." className="inline-flex items-center text-blue-600 hover:underline">
              <Icon icon="arrow-left" className="w-4 h-4 mr-1" />
              Back to Users
            </Link>
          </div>
        </Card>
      )}

      {/* Success state */}
      {user && (
        <Card
          title={
            <div className="flex items-center space-x-2">
              <Icon icon="user" className="w-5 h-5 text-gray-500" />
              <span>User Details — {user.name}</span>
            </div>
          }
        >
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            {/* ID */}
            <div className="flex items-center space-x-2">
              <Icon icon="tag" className="w-5 h-5 text-gray-400" />
              <dt className="font-medium">ID</dt>
              <dd className="ml-auto">{user.id}</dd>
            </div>
            {/* Username */}
            <div className="flex items-center space-x-2">
              <Icon icon="user" className="w-5 h-5 text-gray-400" />
              <dt className="font-medium">Username</dt>
              <dd className="ml-auto">{user.username}</dd>
            </div>
            {/* Email */}
            <div className="flex items-center space-x-2">
              <Icon icon="mail" className="w-5 h-5 text-gray-400" />
              <dt className="font-medium">Email</dt>
              <dd className="ml-auto">
                <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">
                  {user.email}
                </a>
              </dd>
            </div>
            {/* Phone */}
            <div className="flex items-center space-x-2">
              <Icon icon="phone" className="w-5 h-5 text-gray-400" />
              <dt className="font-medium">Phone</dt>
              <dd className="ml-auto">{user.phone}</dd>
            </div>
            {/* Website */}
            <div className="flex items-center space-x-2">
              <Icon icon="globe" className="w-5 h-5 text-gray-400" />
              <dt className="font-medium">Website</dt>
              <dd className="ml-auto">
                <a
                  href={`http://${user.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {user.website}
                </a>
              </dd>
            </div>
          </dl>

          <div className="mt-6 text-right">
            <Link to=".." className="inline-flex items-center text-blue-600 hover:underline">
              <Icon icon="arrow-left" className="w-4 h-4 mr-1" />
              Back to Users
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
