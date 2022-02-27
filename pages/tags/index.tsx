import { Layout } from '@components/layouts'
import { NavTags } from '@components/navTags'
import { useTagsQuery } from '@graphql/generated/react-apollo'
import { useSession } from '@lib/hooks'
import Link from 'next/link'

export default function Page() {
  const session = useSession({ redirectTo: '/login' })
  const { data, loading } = useTagsQuery({ variables: { auth: 'user', size: 20 } })

  if (!session) return <></>
  if (loading) return <Layout></Layout>
  if (!data) return <Layout></Layout>

  return (
    <Layout>
      <div className="mx-auto mt-4 mb-2 w-full max-w-7xl bg-white p-4">
        <div className="flex justify-between">
          <div className="text-2xl">Tags</div>
        </div>
        <div className="mt-8">
          <NavTags current={''} />
        </div>
      </div>
    </Layout>
  )
}
