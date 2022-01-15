import Error from 'next/error'
import { useRouter } from 'next/router'
import { useSession } from '@lib/session'
import { Layout } from '@components/layouts'
import { FollowsDocument, useCreateFollowMutation, useDeleteFollowMutation, useFollowsQuery, useGetUsersQuery, UserQuery, useUserQuery } from '@graphql/generated/react-apollo'
import { getAsString } from '@lib/utils'
import Image from 'next/image'
import { groupIconLoader, userIconLoader } from '@components/imageLoaders'
import { useMemo } from 'react'

export default function Page(props) {
  const session = useSession({ redirectTo: "/login" })
  const router = useRouter()
  const username = getAsString(router.query.username)

  const { data, loading } = useUserQuery({ variables: { auth: 'user', username: username } })

  if (loading || !data) return (<></>)
  if (!session?.id) return (<></>)
  if (!data.user) return (<Error statusCode={404} />)

  return (<Layout>
    <InnerPage sessionUserId={session.id} userData={data} />
  </Layout>)
}

const InnerPage = ({ sessionUserId, userData }: { sessionUserId: string, userData: UserQuery }) => {

  return (
    <div className='max-w-7xl mx-auto mt-4 mb-2 bg-white'>
      <div className='flex'>

        <div className='flex-none w-80'>
          <div className='border rounded-lg m-4 px-2 py-4'>
            <div className='text-center break-words'>
              <Image loader={userIconLoader} src={userData.user.id} width={96} height={96} alt={userData.user.username} className='rounded-lg' />
              <h3 className='text-lg font-bold'>{userData.user.displayName}</h3>
              <h4 className='text-md font-bold text-gray-600'>@{userData.user.username}</h4>
            </div>
          </div>
          <div className='px-4 py-2'>
            <FollowButton sessionUserId={sessionUserId} userId={userData.user.id} />
          </div>
        </div>

        <div className='flex-1'>
        </div>
      </div>
    </div>
  )
}

const FollowButton = ({ sessionUserId, userId }: { sessionUserId: string, userId: string }) => {
  const { data, loading } = useFollowsQuery({ variables: { auth: 'user', toUserId: userId } })
  const [Follow, { }] = useCreateFollowMutation({ refetchQueries: [FollowsDocument] })
  const [UnFollow, { }] = useDeleteFollowMutation({ refetchQueries: [FollowsDocument] })
  const isFollowing = useMemo(() => data?.follows.find((follow) => follow.fromUserId.toUpperCase() === sessionUserId.toUpperCase()), [data])
  const handleClick = (e) => {
    if (isFollowing) {
      UnFollow({ variables: { auth: 'user', fromUserId: sessionUserId, toUserId: userId } })
    } else {
      Follow({ variables: { auth: 'user', fromUserId: sessionUserId, toUserId: userId } })
    }
  }

  if (loading || !data) return (<></>)

  const bg = isFollowing ? 'bg-red-100' : 'bg-blue-100'

  return (
    <button className={`border p-2 w-full ${bg}`} onClick={handleClick}>
      {isFollowing ? 'フォローを解除する' : 'フォローする'}
    </button>
  )

}