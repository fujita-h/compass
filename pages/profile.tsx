import { useSession } from '@lib/hooks'
import { NextRouter, useRouter } from 'next/router'
import { useUserQuery } from '@graphql/generated/react-apollo'

export default function Page() {
  const session = useSession({ redirectTo: '/login' })
  const router = useRouter()

  if (!session) return (<></>)
  if (!router.isReady) return (<></>)

  return <InnerPage userId={session.id} router={router} />
}

const InnerPage = ({ userId, router }: { userId: string, router: NextRouter }) => {
  const { data, loading } = useUserQuery({ variables: { auth: 'user', id: userId } })
  if (loading) return (<></>)
  if (!data) return (<></>)
  router.replace(`/users/${data.user.username}`)
  return (<></>)
}
