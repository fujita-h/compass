import { useRouter } from 'next/router'
import { useSession } from '@lib/hooks'
import { getAsString } from '@lib/utils'
import { useEsSearchDocumentsByTagQuery, useTagMetaQuery } from '@graphql/generated/react-apollo'
import { Layout } from '@components/layouts'
import TagPageLayout from '@components/layouts/tagPageLayout'

export default function Page() {
  const session = useSession({ redirectTo: '/login' })
  const router = useRouter()
  const tagname = getAsString(router.query.tagname)

  if (!session?.id) return <></>

  return (
    <Layout>
      <InnerPage tagname={tagname} />
    </Layout>
  )
}

const InnerPage = ({ tagname }: { tagname: string }) => {
  const { data, loading } = useTagMetaQuery({ variables: { auth: 'user', tag: tagname } })

  return (
    <TagPageLayout currentUrl="" tagname={tagname}>
      <div className="m-6 p-2">
        <h2 className="text-lg text-gray-500">タグの説明</h2>
        <div className="p-2">{data?.tagMeta?.description}</div>
      </div>
    </TagPageLayout>
  )
}
