import Error from 'next/error'
import { useRouter } from 'next/router'
import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import { useDocumentsCpQuery, useUserQuery } from '@graphql/generated/react-apollo'
import { getAsString } from '@lib/utils'
import Link from 'next/link'
import { UserIconNameLinkSmall } from '@components/elements'
import UserPageLayout from '@components/layouts/userPageLayout'

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
      <InnerPage sessionUserId={session.id} username={username} />
    </Layout>
  )
}

const InnerPage = ({ sessionUserId, username }: { sessionUserId: string; username: string }) => {
  return (
    <UserPageLayout currentUrl="" sessionUserId={sessionUserId} username={username}>
      <div></div>
    </UserPageLayout>
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
                <div className="font-meduim text-lg">{doc.paper.title || 'UNTITLED'}</div>
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
