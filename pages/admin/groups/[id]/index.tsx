import { useRouter } from 'next/router'
import { useAdminSession } from '@lib/hooks'
import { AdminLayout } from 'components/layouts'
import { getAsString } from 'lib/utils'
import Link from 'next/link'
import { FullCard } from '@components/elements'
import { EditGroupForm, EditGroupMemberTable, DangerZoneForm } from '@components/forms/groups'
import { Auth } from '@graphql/generated/react-apollo'

export default function Page() {
  const session = useAdminSession({ redirectTo: '/admin/login' })
  const router = useRouter()
  const { id } = router.query
  const groupId = getAsString(id)

  if (!session) return <></>
  if (!groupId) return <AdminLayout withMenu></AdminLayout>

  return <InnerPage groupId={groupId} />
}

const InnerPage = ({ groupId }: { groupId: string }) => {
  return (
    <AdminLayout withMenu>
      <div>
        <div>
          <Link href="./" passHref>
            <a className="text-blue-600 ">Back</a>
          </Link>
        </div>
        <div className="mt-3">
          <FullCard>
            <p className="mb-2 text-xl font-medium text-gray-800">グループ設定</p>
            <EditGroupForm auth={'admin'} groupId={groupId} />
          </FullCard>
        </div>

        <div className="mt-3">
          <FullCard>
            <p className="mb-2 text-xl font-medium text-gray-800">メンバー</p>
            <EditGroupMemberTable auth={'admin'} groupId={groupId} />
          </FullCard>
        </div>

        <div className="mt-3">
          <FullCard>
            <p className="mb-2 border-b text-xl font-medium text-gray-800">Danger Zone</p>
            <DangerZoneForm auth={'admin'} groupId={groupId} />
          </FullCard>
        </div>
      </div>
    </AdminLayout>
  )
}
