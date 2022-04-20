import { Layout } from '@components/layouts'
import { useSession } from '@lib/hooks'
import { NavStocks } from '@components/navStocks'

export default function Page() {
  const session = useSession({ redirectTo: '/login' })
  if (!session) return <></>

  return (
    <Layout>
      <div className="mx-auto mt-4 mb-2 w-full max-w-7xl bg-white p-4">
        <div>
          <div className="text-2xl">Stocks</div>
        </div>
        <div className="mt-8">
          <NavStocks current={''} />
        </div>
      </div>
    </Layout>
  )
}
