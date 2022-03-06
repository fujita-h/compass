import { useRouter } from 'next/router'
import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import { getAsString } from '@lib/utils'
import GroupPageLayout from '@components/layouts/groupPageLayout'
import { useGroupQuery } from '@graphql/generated/react-apollo'

export default function Page(props) {
  const session = useSession({ redirectTo: '/login' })
  const router = useRouter()
  const groupName = getAsString(router.query?.groupName)

  if (!session?.id) return <Layout></Layout>
  if (!groupName) return <Layout></Layout>
  return (
    <Layout>
      <InnerPage userId={session.id.toUpperCase()} groupName={groupName} />
    </Layout>
  )
}

const InnerPage = ({ userId, groupName }: { userId: string; groupName: string }) => {
  const { data, loading } = useGroupQuery({ variables: { auth: 'user', name: groupName } })
  if (loading) return <GroupPageLayout currentUrl="" userId={userId} groupName={groupName} />
  if (!data) return <div>Not Found</div>

  return (
    <GroupPageLayout currentUrl="" userId={userId} groupName={groupName}>
      <div className="ml-4">
        <div className="text-xl font-medium">グループの説明</div>
        <div className="ml-3">{data.group.description || '説明なし'}</div>
      </div>
    </GroupPageLayout>
  )
}
