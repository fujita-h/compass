import { Layout } from '@components/layouts'
import { useSession } from '@lib/hooks'
import Link from 'next/link'
import { useGroupsQuery } from '@graphql/generated/react-apollo'

export default function Page() {
  const session = useSession({ redirectTo: '/login' })
  const { data, loading } = useGroupsQuery({ variables: { auth: 'user' } })

  if (!session) return <></>
  if (loading) return <></>
  if (!data) return <></>

  return (
    <Layout>
      <div className="mx-auto mt-4 mb-2 w-full max-w-7xl bg-white p-4">
        <div className="flex justify-between">
          <div className="text-2xl">Groups</div>
          <div>
            <Link href="/groups/new" passHref>
              <a>
                <div className="rounded-lg border bg-green-600 px-3 py-2 text-white">
                  <span>グループの作成</span>
                </div>
              </a>
            </Link>
          </div>
        </div>
        <div className="mt-8">
          <div className="flex flex-wrap gap-2">
            {data.groups.map((group) => (
              <Link key={`groups-${group.id}`} href={`/groups/${encodeURIComponent(group.name)}`}>
                <div className="w-80 rounded-md border hover:cursor-pointer hover:bg-orange-50">
                  <div className="flex justify-between px-2 py-1">
                    <div>{group.displayName || group.name}</div>
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
