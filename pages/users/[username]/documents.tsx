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
  UserQuery,
  useUserQuery,
} from '@graphql/generated/react-apollo'
import { getAsString } from '@lib/utils'
import Image from 'next/image'
import { useMemo } from 'react'
import Link from 'next/link'
import { UserIconNameLinkSmall } from '@components/elements'
import UserPageLayout from '@components/layouts/userPageLayout'
import { DocListItem } from '@components/docListItem'

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
    <UserPageLayout currentUrl="/documents" sessionUserId={sessionUserId} username={username} >
      <UserDocuments username={username} />
    </UserPageLayout>

  )
}


const UserDocuments = ({ username }: { username: string }) => {
  const { data, loading, fetchMore } = useDocumentsCpQuery({
    variables: { auth: 'user', username: username, first: 20 },
    fetchPolicy: 'network-only',
  })

  if (loading) return <div className="m-2 p-2"></div>

  const nodes = data.documentsCP.edges.map((edge) => edge.node)
  const pageInfo = data.documentsCP.pageInfo

  return (
    <div className="m-2 p-2">
      <ul role="list" className="relative z-0 divide-y divide-gray-200 border-b border-t border-gray-200">
        {nodes.map((doc) => (
          <DocListItem
            key={doc.id}
            id={doc.id}
            title={doc.paper.title}
            href={`/docs/${encodeURIComponent(doc.id.toLowerCase())}`}
            groupName={doc.paper.group.displayName || doc.paper.group.name}
            userId={doc.paper.user.id}
            userName={doc.paper.user.username}
            userHref={`/users/${encodeURIComponent(doc.paper.user.username)}`}
            groupHref={`/groups/${encodeURIComponent(doc.paper.group.name.toLowerCase())}`}
            updatedAt={doc.paper.updatedAt}
          />
        ))}
      </ul>

      {pageInfo.hasNextPage && (
        <div className="mt-6 text-center">
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
