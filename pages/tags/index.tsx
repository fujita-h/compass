import { Layout } from '@components/layouts'
import { useTagsQuery } from '@graphql/generated/react-apollo'
import { useSession } from '@lib/hooks'
import Link from 'next/link'

export default function Page() {
  const session = useSession({ redirectTo: '/login' })
  const { data, loading } = useTagsQuery({ variables: { auth: 'user', size: 20 } })

  if (!session) return <></>
  if (loading) return <Layout></Layout>
  if (!data) return <Layout></Layout>

  return (
    <Layout>
      <div className="mx-auto mt-4 mb-2 w-full max-w-7xl bg-white p-4">
        <div>
          <div className="text-2xl">Tags</div>
        </div>
        <div className="mt-8">
          <div className="flex flex-wrap gap-2">
            {data.esTags.aggregations.tags.buckets.map((bucket) => (
              <Link key={`tags-${bucket.key}`} href={`/tags/${encodeURIComponent(bucket.key)}`}>
                <div className="w-60 rounded-md border hover:cursor-pointer hover:bg-orange-50">
                  <div className="flex justify-between px-2 py-1">
                    <div>{bucket.key}</div>
                    <div className="rounded-lg border bg-gray-500 px-2 text-sm text-white">{bucket.doc_count}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
