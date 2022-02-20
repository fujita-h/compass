import { ChevronDownIcon, BadgeCheckIcon, SearchIcon, MailIcon, PhoneIcon, FilterIcon } from '@heroicons/react/solid'
import { GroupsNav } from '@components/groupsNav'
import { groupIconLoader, userIconLoader } from '@components/imageLoaders'
import ProfileHeader from '@components/profileHeader'
import { getAsString, classNames } from '@lib/utils'
import {
  useCreateGroupFollowMutation,
  useDeleteGroupFollowMutation,
  useGroupFollowsQuery,
  GroupFollowsDocument,
  useGroupPageLayoutQuery,
} from '@graphql/generated/react-apollo'
import { useMemo } from 'react'
import Link from 'next/link'
import NavTab from '@components/navTab'

type Props = {
  children: JSX.Element
  currentUrl?: string
  userId: string
  groupName: string
}

export default function GroupPageLayout(props: Props) {
  const { data, loading } = useGroupPageLayoutQuery({ variables: { auth: 'user', groupName: props.groupName } })

  if (loading || !data) return <></>
  if (!data.group) return <div className="text-red-500">{props.groupName} Not Found.</div>

  const groupId = data.group.id
  const groupDisplayName = data.group.displayName
  const groupMemberCount = data.group.user_group_map.length.toString()
  const groupDocumentCount = data.countDocuments.toString()
  const isGroupAdmin = Boolean(data.group.user_group_map.find((x) => x.user.id == props.userId)?.isAdmin)

  const baseUrl = '/groups/' + decodeURIComponent(props.groupName)
  const tabs = [
    { name: 'グループ概要', href: baseUrl, current: !props.currentUrl },
    { name: 'メンバー', href: baseUrl + '/members', count: groupMemberCount, current: props.currentUrl == '/members' },
    { name: 'ドキュメント', href: baseUrl + '/documents', count: groupDocumentCount, current: props.currentUrl == '/documents' },
    { name: 'グループ設定', href: baseUrl + '/settings', current: props.currentUrl == '/settings' },
  ]

  return (
    <>
      {/* 2-Pane wrapper */}
      <div className="mx-auto w-full max-w-7xl flex-grow lg:flex">
        {/* Pane-1 */}
        <div className="hidden bg-white pt-1 xl:block xl:w-80 xl:flex-shrink-0 xl:border-r xl:border-gray-200">
          <h2 className="mb-2 text-lg font-medium text-gray-900">Groups</h2>
          <GroupsNav current={props.groupName} />
        </div>
        {/* Pane-2 */}
        <div className="bg-white p-3 lg:min-w-0 lg:flex-1">
          {/* Group header */}
          <ProfileHeader
            coverImageUrl="https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            iconLoader={groupIconLoader}
            iconSrc={groupId}
            name={props.groupName}
            displayName={groupDisplayName || ''}
          >
            <>
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              >
                <MailIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                <span>Message</span>
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              >
                <PhoneIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                <span>Call</span>
              </button>

              <FollowGroupButton userId={props.userId} groupId={groupId} />
            </>
          </ProfileHeader>
          <div className="mt-6"></div>
          <NavTab tabs={tabs} />
          <div className="mt-6"></div>
          {props.children}
        </div>
      </div>
    </>
  )
}

const FollowGroupButton = ({ userId, groupId }: { userId: string; groupId: string }) => {
  const { data, loading } = useGroupFollowsQuery({ variables: { auth: 'user', groupId: groupId } })
  const [createWatch] = useCreateGroupFollowMutation({ refetchQueries: [GroupFollowsDocument] })
  const [deleteWatch] = useDeleteGroupFollowMutation({ refetchQueries: [GroupFollowsDocument] })

  const isWatched = useMemo(() => data?.groupFollows?.find((watch) => watch.userId.toUpperCase() === userId.toUpperCase()), [data])
  const countWatches = useMemo(() => data?.groupFollows.length, [data])

  const handleClick = (e) => {
    if (isWatched) {
      deleteWatch({ variables: { auth: 'user', groupId: groupId } })
    } else {
      createWatch({ variables: { auth: 'user', groupId: groupId } })
    }
  }

  if (loading || !data) return <div></div>

  return (
    <button
      type="button"
      onClick={handleClick}
      className={classNames(
        isWatched ? 'bg-red-100' : 'bg-white',
        'inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2'
      )}
    >
      <span>{isWatched ? 'フォロー解除' : 'フォローする'}</span>
    </button>
  )
}
