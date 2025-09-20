// packages/query/src/pages/graphql-demo/index.tsx
import React, { useEffect, useState } from 'react'
import moduleConfig from '@components/../module.config.json'
import ModuleLink from '@components/ModuleLink'
import { createGraphQLClient, request, gql } from '@app/common'
import { FormControl, Button, Icon, Loader, Tooltip } from 'react-components-lib.eaa'
import { useStore } from '@components/../useStore'
import { Link } from 'react-router-dom'

const { moduleName } = moduleConfig

/** CONFIGURE YOUR ENDPOINT & TOKEN HERE OR VIA ENV */
const GRAPHQL_ENDPOINT = 'https://graphqlzero.almansi.me/api'
const GRAPHQL_TOKEN = ''

const client = createGraphQLClient(
  GRAPHQL_ENDPOINT,
  GRAPHQL_TOKEN ? { Authorization: `Bearer ${GRAPHQL_TOKEN}` } : undefined
)

/** GRAPHQL QUERIES & MUTATIONS */
const GET_EMAILS = gql`
  query GetEmails($options: PageQueryOptions) {
    posts(options: $options) {
      data {
        id
        title
        body
      }
    }
  }
`
const CREATE_EMAIL = gql`
  mutation CreateEmail($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      body
    }
  }
`
const UPDATE_EMAIL = gql`
  mutation UpdateEmail($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      id
      title
      body
    }
  }
`
const DELETE_EMAIL = gql`
  mutation DeleteEmail($id: ID!) {
    deletePost(id: $id)
  }
`

interface Email {
  id: string
  title: string
  body: string
}

export default function GraphQLDemo() {
  // ─────────────────────────────────────────────────────────────────────────────
  // Component state
  // ─────────────────────────────────────────────────────────────────────────────
  const [emails, setEmails] = useState<Email[]>([])
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ─────────────────────────────────────────────────────────────────────────────
  // Module-local slice for starred items (stored under 'query' slice)
  // ─────────────────────────────────────────────────────────────────────────────
  const { state: queryState, setState: setQueryState } = useStore<{ starredEmails?: Email[] }>()

  const starredEmails = queryState.starredEmails || []

  // Toggle star for full Email object
  const toggleStar = (emailObj: Email) => {
    const current = queryState.starredEmails || []
    const exists = current.some((e) => e.id === emailObj.id)
    const updated = exists ? current.filter((e) => e.id !== emailObj.id) : [...current, emailObj]
    setQueryState({ starredEmails: updated })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Fetch on mount
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchEmails()
  }, [])

  async function fetchEmails() {
    setLoading(true)
    try {
      const res = await request<{ posts: { data: Email[] } }>(client, GET_EMAILS, {
        options: { paginate: { page: 1, limit: 5 } }
      })
      setEmails(res.posts.data)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Create / Update
  // ─────────────────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingId) {
        const { updatePost } = await request<{ updatePost: Email }>(client, UPDATE_EMAIL, {
          id: editingId,
          input: { title: subject, body: content }
        })
        setEmails(emails.map((e) => (e.id === editingId ? updatePost : e)))
        setEditingId(null)
      } else {
        const { createPost } = await request<{ createPost: Email }>(client, CREATE_EMAIL, {
          input: { title: subject, body: content }
        })
        setEmails([createPost, ...emails])
      }
      setSubject('')
      setContent('')
    } catch (err) {
      console.error('Submit error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Delete
  // ─────────────────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await request<{ deletePost: boolean }>(client, DELETE_EMAIL, { id })
      setEmails(emails.filter((e) => e.id !== id))
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setDeletingId(null)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 [&_code]:text-pink-500">
      <h1 className="text-2xl font-semibold mb-4">Email Manager</h1>

      {/* Info box */}
      <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">💡 GraphQL CRUD Demo</h3>
        <p className="text-sm">
          This component (in <code>{moduleName}</code> module) shows how to wire up CRUD calls via
          the shared utility function <code>@app/common/graphql-client</code>, a common GraphQL
          client within this micro-frontend.
          <br />
          <br />
          <strong>Starring an email is an example of cross-module state</strong>, demonstrating how
          that data flows into another module’s store for inter-module interaction.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 my-6">
        <FormControl
          label="Subject"
          type="text"
          placeholder="Enter subject…"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={loading || !!deletingId}
          required
        />
        <FormControl
          label="Content"
          type="textarea"
          placeholder="Enter content…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading || !!deletingId}
          required
        />
        <div className="flex justify-end items-center space-x-3">
          <ModuleLink to="/" className="text-gray-600 underline hover:text-gray-800">
            ← Back to Query Home
          </ModuleLink>
          <Button
            type="submit"
            disabled={loading || !subject.trim() || !content.trim()}
            className="flex items-center"
          >
            {loading && <Loader size="xs" className="mr-2" />}
            {editingId ? 'Update Email' : 'Send Email'}
          </Button>
        </div>
      </form>

      {/* Link to toolkit state demo */}
      <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <p className="text-sm">
          ⭐ Want to see all starred emails across modules?{' '}
          <Link to="/toolkit/state-demo?scroll=starred-emails" className="text-blue-600 underline">
            View Global State Demo →
          </Link>
        </p>
      </div>
      {/* List */}
      <ul className="space-y-4">
        {emails.map((email) => (
          <li key={email.id} className="border p-4 rounded flex justify-between items-start">
            <div>
              <h2 className="font-semibold text-lg flex items-center">
                <Icon icon="mail_outline" className="mr-2 text-2xl" />
                {email.title}
              </h2>
              <p className="text-gray-700">{email.body}</p>
            </div>

            <div className="flex space-x-3 items-center">
              {/* STAR */}
              <Tooltip
                content={
                  starredEmails.some((e) => e.id === email.id)
                    ? 'Unstar this email'
                    : 'Star this email'
                }
              >
                <button
                  type="button"
                  onClick={() => toggleStar(email)}
                  className="text-yellow-500 hover:text-yellow-700 text-2xl"
                >
                  <Icon
                    icon={starredEmails.some((e) => e.id === email.id) ? 'star' : 'star_outline'}
                  />
                </button>
              </Tooltip>

              {/* EDIT */}
              <button
                onClick={() => {
                  setEditingId(email.id)
                  setSubject(email.title)
                  setContent(email.body)
                }}
                disabled={loading || !!deletingId}
                className="text-blue-600 hover:text-blue-800 text-2xl"
              >
                <Icon icon="edit" size={18} />
              </button>

              {/* DELETE */}
              <button
                onClick={() => handleDelete(email.id)}
                disabled={deletingId === email.id}
                className="text-red-600 hover:text-red-800 text-2xl"
              >
                {deletingId === email.id ? <Loader size="xs" /> : <Icon icon="delete_forever" />}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
