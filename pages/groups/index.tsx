import { Layout } from "@components/layouts"
import { useSession } from "@lib/hooks"
import Link from 'next/link'
import { useGroupsQuery } from '@graphql/generated/react-apollo'

export default function Page() {

  const session = useSession({ redirectTo: "/login" })
  const { data, loading } = useGroupsQuery({ variables: { auth: 'user' } })

  if (!session) return (<></>)
  if (loading) return (<></>)
  if (!data) return (<></>)

  return (<Layout>

    <div className='w-full max-w-7xl mx-auto mt-4 mb-2 p-4 bg-white'>
      <div className="flex justify-between">
        <div className="text-2xl">Groups</div>
        <div>
          <Link href="/groups/new" passHref><a>
            <div className='border rounded-lg px-3 py-2 text-white bg-green-600'><span>グループの作成</span></div>
          </a></Link>
        </div>
      </div>
      <div className="mt-8">
        <div className="flex gap-2 flex-wrap">
          {data.groups.map((group) =>
            <Link key={`groups-${group.id}`} href={`/groups/${encodeURIComponent(group.name)}`}>
              <div className="border rounded-md w-80 hover:cursor-pointer hover:bg-orange-50">
                <div className="px-2 py-1 flex justify-between">
                  <div>{group.displayName || group.name}</div>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  </Layout>)
}