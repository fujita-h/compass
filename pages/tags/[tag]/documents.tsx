import { useRouter } from 'next/router'
import { useSession } from '@lib/hooks'
import { getAsString } from '@lib/utils'
import { useEsSearchDocumentsByTagQuery } from '@graphql/generated/react-apollo'
import { Layout } from '@components/layouts'
import TagPageLayout from '@components/layouts/tagPageLayout'
import { DocListItem } from '@components/docListItem'

export default function Page() {
  const session = useSession({ redirectTo: '/login' })
  const router = useRouter()
  const tag = getAsString(router.query.tag)

  if (!session?.id) return <></>

  return (
    <Layout>
      <InnerPage userId={session.id} tag={tag} />
    </Layout>
  )
}

const InnerPage = ({ userId, tag }: { userId: string; tag: string }) => {
  return (
    <TagPageLayout currentUrl="/documents" userId={userId} tag={tag}>
      <TaggedDocuments tag={tag} />
    </TagPageLayout>
  )
}

const TaggedDocuments = ({ tag }: { tag: string }) => {
  const { data, loading } = useEsSearchDocumentsByTagQuery({ variables: { auth: 'user', query: tag } })
  if (loading || !data) return <></>
  return (
    <div className="m-2 p-2">
      <ul role="list" className="relative z-0 divide-y divide-gray-200 border-b border-t border-gray-200">
        {data.esSearchDocumentsByTag.Documents.hits.hits.map((doc) => (
          <DocListItem
            key={doc._id}
            id={doc._id}
            title={doc._source.title}
            href={`/docs/${encodeURIComponent(doc._id.toLowerCase())}`}
            groupName={doc._source.groupDisplayName || doc._source.groupName}
            userId={doc._source.userId}
            userName={doc._source.userName}
            userHref={`/users/${encodeURIComponent(doc._source.userName)}`}
            groupHref={`/groups/${encodeURIComponent(doc._source.groupName.toLowerCase())}`}
            updatedAt={doc._source.updatedAt}
          />
        ))}
      </ul>
    </div>
  )
}
