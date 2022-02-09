import { Layout } from "@components/layouts"
import { useTagsQuery } from "@graphql/generated/react-apollo"
import { useSession } from "@lib/hooks"
import Link from "next/link"

export default function Page() {
  const session = useSession({ redirectTo: "/login" })
  const { data, loading } = useTagsQuery({ variables: { auth: 'user', size: 20 } })

  if (!session) return (<></>)
  if (loading) return (<Layout></Layout>)
  if (!data) return (<Layout></Layout>)

  return (<Layout>
    <div className='w-full max-w-7xl mx-auto mt-4 mb-2 p-4 bg-white'>
      <div>
        <div className="text-2xl">Tags</div>
      </div>
      <div className="mt-8">
        <div className="flex gap-2 flex-wrap">
          {data.esTags.aggregations.tags.buckets.map((bucket) =>
            <Link key={`tags-${bucket.key}`} href={`/tags/${encodeURIComponent(bucket.key)}`}>
              <div className="border rounded-md w-60 hover:cursor-pointer hover:bg-orange-50">
                <div className="px-2 py-1 flex justify-between">
                  <div>{bucket.key}</div>
                  <div className="bg-gray-500 border rounded-lg text-sm text-white px-2">
                    {bucket.doc_count}
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>

  </Layout>)

}