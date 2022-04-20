import { AdminLayout } from '@components/layouts'
import { useAdminSession } from '@lib/hooks'

const Index = () => {
  const session = useAdminSession({ redirectTo: '/admin/login' })

  if (!session?.admin) return <></>

  return (
    <AdminLayout withMenu>
      <p>Admin Page Loggeg in</p>
    </AdminLayout>
  )
}

export default Index
