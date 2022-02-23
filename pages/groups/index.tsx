import { Layout } from '@components/layouts'
import { useSession } from '@lib/hooks'
import Link from 'next/link'
import { NavGroups } from '@components/navGroups'

export default function Page() {
  const session = useSession({ redirectTo: '/login' })
  if (!session) return <></>

  return (
    <Layout>
      <div className="mx-auto mt-4 mb-2 w-full max-w-7xl bg-white p-4">
        <div className="flex justify-between">
          <div className="text-2xl">Groups</div>
          <div>
            <Link href="/groups/new" passHref>
              <a>
                <div className="rounded-lg border bg-green-600 px-3 py-2 text-white">
                  <span>グループの作成</span>
                </div>
              </a>
            </Link>
          </div>
        </div>
        <div className="mt-8">
          <NavGroups current={''} />
        </div>
      </div>
    </Layout>
  )
}
