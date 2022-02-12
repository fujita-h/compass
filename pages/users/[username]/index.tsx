import Error from 'next/error'
import { useRouter } from 'next/router'
import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import {
  FollowsDocument,
  useCreateFollowMutation,
  useDeleteFollowMutation,
  useDocumentsCpQuery,
  useFollowsQuery,
  useGetUsersQuery,
  UserQuery,
  useUserQuery,
} from '@graphql/generated/react-apollo'
import { getAsString } from '@lib/utils'
import Image from 'next/image'
import { groupIconLoader, userIconLoader } from '@components/imageLoaders'
import { useMemo } from 'react'
import Link from 'next/link'
import { UserIconNameLinkSmall } from '@components/elements'

export default function Page(props) {
  const session = useSession({ redirectTo: '/login' })
  const router = useRouter()
  const username = getAsString(router.query.username)

  const { data, loading } = useUserQuery({ variables: { auth: 'user', username: username } })

  if (loading || !data) return <></>
  if (!session?.id) return <></>
  if (!data.user) return <Error statusCode={404} />

  return (
    <Layout>
      <InnerPage sessionUserId={session.id} userData={data} />
    </Layout>
  )
}

const InnerPage = ({ sessionUserId, userData }: { sessionUserId: string; userData: UserQuery }) => {
  return (
    <div className="mx-auto mt-4 mb-2 max-w-7xl bg-white">
      <div className="flex">
        <div className="w-80 flex-none">
          <div className="m-4 rounded-lg border px-2 py-4">
            <div className="break-words text-center">
              <Image
                loader={userIconLoader}
                src={userData.user.id}
                width={96}
                height={96}
                alt={userData.user.username}
                className="rounded-lg"
              />
              <h3 className="text-lg font-bold">{userData.user.displayName}</h3>
              <h4 className="text-md font-bold text-gray-600">@{userData.user.username}</h4>
            </div>
          </div>
          <div className="px-4 py-2">
            <FollowButton sessionUserId={sessionUserId} userId={userData.user.id} />
          </div>
        </div>
        <div className="flex-1">
          <div className="mt-2 border-b text-lg font-bold">Documents</div>
          <div>
            <UserDocuments userId={userData.user.id} />
          </div>
        </div>
      </div>
    </div>
  )
}

const FollowButton = ({ sessionUserId, userId }: { sessionUserId: string; userId: string }) => {
  const { data, loading } = useFollowsQuery({ variables: { auth: 'user', toUserId: userId } })
  const [Follow, {}] = useCreateFollowMutation({ refetchQueries: [FollowsDocument] })
  const [UnFollow, {}] = useDeleteFollowMutation({ refetchQueries: [FollowsDocument] })
  const isFollowing = useMemo(() => data?.follows.find((follow) => follow.fromUserId.toUpperCase() === sessionUserId.toUpperCase()), [data])
  const handleClick = (e) => {
    if (isFollowing) {
      UnFollow({ variables: { auth: 'user', fromUserId: sessionUserId, toUserId: userId } })
    } else {
      Follow({ variables: { auth: 'user', fromUserId: sessionUserId, toUserId: userId } })
    }
  }

  if (loading || !data) return <></>

  const bg = isFollowing ? 'bg-red-100' : 'bg-blue-100'

  return (
    <button className={`w-full border p-2 ${bg}`} onClick={handleClick}>
      {isFollowing ? 'フォローを解除する' : 'フォローする'}
    </button>
  )
}

const UserDocuments = ({ userId }: { userId: string }) => {
  const { data, loading, fetchMore } = useDocumentsCpQuery({
    variables: { auth: 'user', userId: userId, first: 20 },
    fetchPolicy: 'network-only',
  })

  if (loading) return <></>

  const nodes = data.documentsCP.edges.map((edge) => edge.node)
  const pageInfo = data.documentsCP.pageInfo

  return (
    <div className="m-2 p-2">
      {nodes.map((doc) => (
        <div key={`docs-${doc.id}`}>
          <Link href={`/docs/${encodeURIComponent(doc.id.toLowerCase())}`} passHref>
            <a className="hover:text-blue-500">
              <div key={doc.id} className="m-2 border bg-white p-2">
                <div className="text-black">
                  <UserIconNameLinkSmall userId={doc.paper.user.id} username={doc.paper.user.username} />
                  <div className="ml-2 inline-block">が{new Date(doc.paper.updatedAt).toLocaleString()} に投稿</div>
                </div>
                <div className="text-lg font-bold">{doc.paper.title || 'UNTITLED'}</div>
              </div>
            </a>
          </Link>
        </div>
      ))}
      {pageInfo.hasNextPage && (
        <div className="text-center">
          <button
            className="rounded-md border bg-gray-100 px-4 py-2"
            onClick={() => {
              fetchMore({ variables: { after: pageInfo.endCursor } })
            }}
          >
            もっと読み込む
          </button>
        </div>
      )}
    </div>
  )
}
