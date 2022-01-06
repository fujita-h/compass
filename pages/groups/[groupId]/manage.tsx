import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from '@lib/session'
import { Layout } from '@components/layouts'
import { getAsString } from '@lib/utils'
import { EditGroupForm, EditGroupMemberTable, DangerZoneForm } from '@components/forms/groups'
import { Auth, GetGroupWithMembersDocument, useGetGroupWithMembersQuery } from '@graphql/generated/react-apollo'


export default function Page() {
  const session = useSession({ redirectTo: "/login" })
  const router = useRouter()
  const { identifier } = router.query
  const groupId = getAsString(router.query?.groupId)

  if (!session?.id) return (<Layout></Layout>)
  if (!groupId) return (<Layout></Layout>)
  return (<Layout><InnerPage userId={session.id} groupId={groupId} /></Layout>)
}

const InnerPage = ({ userId, groupId }: { userId: string, groupId: string }) => {

  const { data, loading } = useGetGroupWithMembersQuery({ variables: { auth: Auth.User, id: groupId } })

  if (loading) return (<></>)
  if (!data.group) return (<></>)
  if (!data.group.MapUserGroup
    .filter((user) => user.isAdmin)
    .some((user) => user.userId.toUpperCase() === userId.toUpperCase())) {
    return (<div className='text-red-600'>Forbbiden</div>)
  }

  return (
    <div className='max-w-7xl mt-4 mx-auto p-4 bg-white'>
      <div>Group Management Page</div>
      <div className='mt-3 border rounded-lg p-3'>
        <EditGroupForm auth={Auth.User} groupId={data.group.id} refetchQueries={[GetGroupWithMembersDocument]} />
      </div>
      {data.group.isPrivate ?
        <div className='mt-3 border rounded-lg p-3'>
          <EditGroupMemberTable auth={Auth.User} groupId={data.group.id} />
        </div> : <></>
      }
    </div>
  )
}