import { ChevronDownIcon, BadgeCheckIcon, SearchIcon, MailIcon, PhoneIcon, FilterIcon } from '@heroicons/react/solid'
import { NavGroups } from '@components/navGroups'
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
  children?: JSX.Element
  currentUrl?: string
  userId: string
  groupName: string
  directImageLoading?: boolean
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
  ]
  const tabs2 = [
    { name: 'グループ設定', href: baseUrl + '/settings', current: props.currentUrl == '/settings' },
    { name: 'メンバー管理', href: baseUrl + '/settings/members', current: props.currentUrl == '/settings/members' },
  ]

  return (
    <>
      {/* 2-Pane wrapper */}
      <div className="mx-auto w-full max-w-7xl flex-grow lg:flex">
        {/* Pane-1 */}
        <div className="hidden bg-white pt-1 xl:block xl:w-80 xl:flex-shrink-0 xl:border-r xl:border-gray-200">
          <h2 className="mb-2 text-lg font-medium text-gray-900">Groups</h2>
          <NavGroups current={props.groupName} />
        </div>
        {/* Pane-2 */}
        <div className="bg-white p-3 lg:min-w-0 lg:flex-1">
          {/* Group header */}
          <ProfileHeader
            coverSrc={`/api/files/groupcovers/${encodeURIComponent(groupId.toLowerCase())}`}
            iconSrc={`/api/files/groupicons/${encodeURIComponent(groupId.toLowerCase())}`}
            name={props.groupName}
            displayName={groupDisplayName || ''}
            directImageLoading={props.directImageLoading}
          >
            <>
              <FollowGroupButton userId={props.userId} groupId={groupId} />
            </>
          </ProfileHeader>
          <div className="mt-6"></div>
          <NavTab tabs={tabs} tabs2={isGroupAdmin ? tabs2 : []} />
          <div className="mt-6"></div>
          {props.children}
        </div>
      </div>
    </>
  )
}

const FollowGroupButton = ({ userId, groupId, className }: { userId: string; groupId: string; className?: string }) => {
  const { data, loading } = useGroupFollowsQuery({ variables: { auth: 'user', groupId: groupId } })
  const [createFollow] = useCreateGroupFollowMutation({ refetchQueries: [GroupFollowsDocument] })
  const [deleteFollow] = useDeleteGroupFollowMutation({ refetchQueries: [GroupFollowsDocument] })

  const isFollowing = useMemo(() => data?.groupFollows?.find((follow) => follow.userId.toUpperCase() === userId.toUpperCase()), [data])
  const countFollow = useMemo(() => data?.groupFollows?.length, [data])

  const handleClick = (e) => {
    if (isFollowing) {
      deleteFollow({ variables: { auth: 'user', groupId: groupId } })
    } else {
      createFollow({ variables: { auth: 'user', groupId: groupId } })
    }
  }

  if (loading || !data) return <div></div>

  return (
    <button
      type="button"
      onClick={handleClick}
      className={classNames(
        isFollowing ? 'bg-indigo-600 text-white hover:bg-indigo-700 ' : ' bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
        className,
        'focus:ring-indigo-500" inline-flex items-center rounded-lg border border-transparent px-6 py-2 text-base font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2'
      )}
    >
      <span>{isFollowing ? 'フォロー解除' : 'フォローする'}</span>
    </button>
  )
}
