import { Layout } from '@components/layouts'
import { useSession } from '@lib/hooks'
import Link from 'next/link'
import { useGroupsQuery } from '@graphql/generated/react-apollo'
import { GroupsNav } from '@components/groupsNav'

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
          <GroupsNav current={''} />
        </div>
      </div>
    </Layout>
  )
}
