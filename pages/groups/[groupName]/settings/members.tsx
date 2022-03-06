import { useRouter } from 'next/router'
import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import { getAsString, classNames } from '@lib/utils'
import GroupPageLayout from '@components/layouts/groupPageLayout'
import {
  GroupMembersSettingPageDocument,
  useCreateGroupMemberMutation,
  useDeleteGroupMemberMutation,
  useGroupMembersSettingPageQuery,
  useUpdateGroupMemberMutation,
} from '@graphql/generated/react-apollo'
import { useState } from 'react'
import Image from 'next/image'
import { PlusSmIcon, MinusSmIcon, SearchIcon } from '@heroicons/react/solid'

export default function Page(props) {
  const session = useSession({ redirectTo: '/login' })
  const router = useRouter()
  const groupName = getAsString(router.query?.groupName)

  if (!session?.id) return <Layout></Layout>
  if (!groupName) return <Layout></Layout>
  return (
    <Layout>
      <InnerPage userId={session.id.toUpperCase()} groupName={groupName} />
    </Layout>
  )
}

const InnerPage = ({ userId, groupName }: { userId: string; groupName: string }) => {
  const { data, loading } = useGroupMembersSettingPageQuery({ variables: { auth: 'user', name: groupName } })
  const [addMember] = useCreateGroupMemberMutation()
  const [updateMember] = useUpdateGroupMemberMutation()
  const [deleteMember] = useDeleteGroupMemberMutation()
  const [searchMemberStr, setSerchMemberStr] = useState('')

  const [formState, setFormState] = useState(data?.group)

  const handleAddMember = (e) => {
    const userId = e.currentTarget.dataset.userid
    const groupId = e.currentTarget.dataset.groupid
    addMember({ variables: { auth: 'user', userId, groupId }, refetchQueries: [GroupMembersSettingPageDocument] })
  }

  const handleUpdateMember = (e) => {
    const userId = e.currentTarget.dataset.userid
    const groupId = e.currentTarget.dataset.groupid
    const isAdmin = Number(!Boolean(Number(e.currentTarget.dataset.isadmin)))
    updateMember({ variables: { auth: 'user', userId, groupId, isAdmin }, refetchQueries: [GroupMembersSettingPageDocument] })
  }

  const handleDeleteMember = (e) => {
    const userId = e.currentTarget.dataset.userid
    const groupId = e.currentTarget.dataset.groupid
    deleteMember({ variables: { auth: 'user', userId, groupId }, refetchQueries: [GroupMembersSettingPageDocument] })
  }

  if (loading) return <GroupPageLayout currentUrl="/settings/members" userId={userId} groupName={groupName} />
  if (!data)
    return (
      <GroupPageLayout currentUrl="/settings/members" userId={userId} groupName={groupName}>
        <div>Group Not Found.</div>
      </GroupPageLayout>
    )

  return (
    <GroupPageLayout currentUrl="/settings/members" userId={userId} groupName={groupName} directImageLoading={true}>
      <div className="ml-8 mr-4">
        <h2>メンバーの追加</h2>
        <div className="mb-4 min-w-0 flex-1">
          <label htmlFor="group-fileter" className="sr-only">
            Group Filter
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="search"
              name="filter"
              id="group-fileter"
              className="form-input block w-full rounded-md border-gray-300 p-2  pl-10 placeholder:text-gray-400 focus:border-gray-300 focus:ring-gray-500 sm:text-sm"
              placeholder="フィルタ"
              value={searchMemberStr}
              onChange={(e) => {
                setSerchMemberStr(e.target.value)
              }}
            />
          </div>
        </div>
        <ul role="list" className="relative z-0 divide-y divide-gray-200 border-y border-gray-200">
          {data.users
            .filter((user) => user.username.includes(searchMemberStr) || (user.displayName && user.displayName.includes(searchMemberStr)))
            .filter((user) => !data.group.user_group_map.find((x) => x.user.id === user.id))
            .slice(0, 20)
            .map((user) => {
              return (
                <li key={user.id}>
                  <div className="relative flex items-center space-x-3 px-5 py-3 focus-within:ring-2 focus-within:ring-inset focus-within:ring-gray-500 hover:bg-gray-50">
                    <div className="flex-shrink-0">
                      <Image
                        src={`/api/files/usericons/${encodeURIComponent(user.id.toLowerCase())}`}
                        width={32}
                        height={32}
                        alt={user.username}
                        className="rounded-full"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">{user.username}</p>
                      <p className="truncate text-sm text-gray-500">{user.displayName}</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div>
                        <button
                          type="button"
                          className="inline-flex items-center rounded-full border border-transparent bg-indigo-600 p-1 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          data-userid={user.id}
                          data-groupid={data.group.id}
                          onClick={handleAddMember}
                        >
                          <PlusSmIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
        </ul>
        <div className="mt-8"></div>
        <h2>現在のメンバー</h2>
        <ul role="list" className="relative z-0 divide-y divide-gray-200 border-y border-gray-200">
          {data.group.user_group_map.map((member) => {
            return (
              <li key={member.user.id}>
                <div className="relative flex items-center space-x-3 px-5 py-3 focus-within:ring-2 focus-within:ring-inset focus-within:ring-gray-500 hover:bg-gray-50">
                  <div className="flex-shrink-0">
                    <Image
                      src={`/api/files/usericons/${encodeURIComponent(member.user.id.toLowerCase())}`}
                      width={32}
                      height={32}
                      alt={member.user.username}
                      className="rounded-full"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{member.user.username}</p>
                    <p className="truncate text-sm text-gray-500">{member.user.displayName}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div>
                      <button
                        type="button"
                        className={classNames(
                          member.isAdmin
                            ? 'bg-indigo-600 text-white hover:bg-indigo-400'
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-200',
                          'inline-flex items-center rounded-full border border-transparent px-3 py-1.5 text-xs font-medium shadow-sm  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                        )}
                        data-userid={member.user.id}
                        data-groupid={data.group.id}
                        data-isadmin={member.isAdmin}
                        onClick={handleUpdateMember}
                      >
                        <span>{member.isAdmin ? 'Admin' : 'Member'}</span>
                      </button>
                    </div>
                    <div>
                      <button
                        type="button"
                        className="inline-flex items-center rounded-full border border-transparent bg-red-600 p-1 text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        data-userid={member.user.id}
                        data-groupid={data.group.id}
                        onClick={handleDeleteMember}
                      >
                        <MinusSmIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </GroupPageLayout>
  )
}
