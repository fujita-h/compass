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

  const { data, loading } = useTagMetaQuery({ variables: { auth: 'user', tag: tagname } })
  if (loading || !data) return <></>

  if (!session?.id) return <></>

  return (
    <Layout>
      <InnerPage tagname={tagname} />
    </Layout>
  )
}

const InnerPage = ({ tagname }: { tagname: string }) => {
  return (
    <TagPageLayout currentUrl="" tagname={tagname}>
      <></>
    </TagPageLayout>
  )
}
