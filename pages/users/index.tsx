import { Layout } from '@components/layouts'
import { useSession } from '@lib/hooks'
import Link from 'next/link'
import { NavUsers } from '@components/navUsers'

export default function Page() {
  const session = useSession({ redirectTo: '/login' })
  if (!session) return <></>

  return (
    <Layout>
      <div className="mx-auto mt-4 mb-2 w-full max-w-7xl bg-white p-4">
        <div className="flex justify-between">
          <div className="text-2xl">Users</div>
        </div>
        <div className="mt-8">
          <NavUsers current={''} />
        </div>
      </div>
    </Layout>
  )
}
