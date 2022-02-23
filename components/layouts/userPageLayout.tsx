import { ChevronDownIcon, BadgeCheckIcon, SearchIcon, MailIcon, PhoneIcon, FilterIcon } from '@heroicons/react/solid'
import { NavGroups } from '@components/navGroups'
import ProfileHeader from '@components/profileHeader'
import { getAsString, classNames } from '@lib/utils'
import {
  useCreateGroupFollowMutation,
  useDeleteGroupFollowMutation,
  useGroupFollowsQuery,
  GroupFollowsDocument,
  useUserPageLayoutQuery,
  useFollowsQuery,
  useCreateFollowMutation,
  useDeleteFollowMutation,
  FollowsDocument,
} from '@graphql/generated/react-apollo'
import { useMemo } from 'react'
import Link from 'next/link'
import NavTab from '@components/navTab'
import { NavUsers } from '@components/navUsers'

type Props = {
  children?: JSX.Element
  currentUrl?: string
  sessionUserId: string
  username: string
}

export default function UserPageLayout(props: Props) {
  const { data, loading } = useUserPageLayoutQuery({ variables: { auth: 'user', username: props.username } })

  if (loading || !data) return <></>
  if (!data.user) return <div className="text-red-500">{props.username} Not Found.</div>

  const userId = data.user.id
  const userDisplayName = data.user.displayName
  const groupDocumentCount = data.countDocuments.toString()

  const baseUrl = '/users/' + decodeURIComponent(props.username)
  const tabs = [
    { name: 'ユーザー概要', href: baseUrl, current: !props.currentUrl },
    { name: 'ドキュメント', href: baseUrl + '/documents', count: groupDocumentCount, current: props.currentUrl == '/documents' },
  ]

  return (
    <>
      {/* 2-Pane wrapper */}
      <div className="mx-auto w-full max-w-7xl flex-grow lg:flex">
        {/* Pane-1 */}
        <div className="hidden bg-white pt-1 xl:block xl:w-80 xl:flex-shrink-0 xl:border-r xl:border-gray-200">
          <h2 className="mb-2 text-lg font-medium text-gray-900">Users</h2>
          <NavUsers current={props.username} />
        </div>
        {/* Pane-2 */}
        <div className="bg-white p-3 lg:min-w-0 lg:flex-1">
          {/* Group header */}
          <ProfileHeader
            coverImageUrl="https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            iconSrc={`/api/files/usericons/${encodeURIComponent(userId.toLowerCase())}`}
            name={props.username}
            displayName={userDisplayName || ''}
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

              <FollowUserButton fromUserId={props.sessionUserId} toUserId={userId} />
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

const FollowUserButton = ({ fromUserId, toUserId }: { fromUserId: string; toUserId: string }) => {
  const { data, loading } = useFollowsQuery({ variables: { auth: 'user', toUserId: toUserId } })
  const [createWatch] = useCreateFollowMutation({ refetchQueries: [FollowsDocument] })
  const [deleteWatch] = useDeleteFollowMutation({ refetchQueries: [FollowsDocument] })

  const isWFollowing = useMemo(
    () => data?.userFollows?.find((follow) => follow.fromUserId.toUpperCase() === fromUserId.toUpperCase()),
    [data]
  )
  const countFollows = useMemo(() => data?.userFollows.length, [data])

  const handleClick = (e) => {
    if (isWFollowing) {
      deleteWatch({ variables: { auth: 'user', toUserId: toUserId } })
    } else {
      createWatch({ variables: { auth: 'user', toUserId: toUserId } })
    }
  }

  if (loading || !data) return <div></div>

  return (
    <button
      type="button"
      onClick={handleClick}
      className={classNames(
        isWFollowing ? 'bg-red-100' : 'bg-white',
        'inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2'
      )}
    >
      <span>{isWFollowing ? 'フォロー解除' : 'フォローする'}</span>
    </button>
  )
}
