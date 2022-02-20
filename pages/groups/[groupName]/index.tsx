import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import { groupIconLoader, userIconLoader } from '@components/imageLoaders'
import Image from 'next/image'
import { getAsString, classNames } from '@lib/utils'
import {
  useGroupIndexPageQuery,
  GroupIndexPageQuery,
  useDocumentsCpQuery,
  Auth,
  useGroupFollowsQuery,
  useCreateGroupFollowMutation,
  GroupFollowsDocument,
  useDeleteGroupFollowMutation,
  useDraftsQuery,
  useTemplatesQuery,
  useGroupsQuery,
} from '@graphql/generated/react-apollo'
import { RiLock2Fill } from 'react-icons/ri'
import { BsFlag, BsFlagFill, BsSquare, BsCheck2Square, BsEye, BsEyeFill } from 'react-icons/bs'
import { UserIconNameLinkSmall } from '@components/elements'
import { useEffect, useMemo, useState } from 'react'
import { updatePageViews } from '@lib/localStorage/pageViews'
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon, BadgeCheckIcon, SearchIcon, MailIcon, PhoneIcon, FilterIcon } from '@heroicons/react/solid'
import { DocListItem } from '@components/docListItem'
import { GroupsNav } from '@components/groupsNav'
import ProfileHeader from '@components/profileHeader'

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
  const { data, loading } = useGroupIndexPageQuery({ variables: { groupName } })

  useEffect(() => {
    if (!data?.group?.name) return
    updatePageViews('group', data.group.name)
  }, [data?.group?.name])

  if (loading || !data) return <></>
  if (!data.group) return <div className="text-red-500">{groupName} Not Found.</div>

  const groupId = data.group.id
  const isGroupAdmin = Boolean(data.group.user_group_map.find((x) => x.user.id == data.session.userSession.id)?.isAdmin)

  const tabs = [
    { name: 'グループ概要', href: '#', current: true },
    { name: 'メンバー', href: '#', count: '52', current: false },
    { name: 'ドキュメント', href: '#', count: '6', current: false },
    { name: 'グループ設定', href: '#', current: false },
  ]

  return (
    <>
      {/* 2-Pane wrapper */}
      <div className="mx-auto w-full max-w-7xl flex-grow lg:flex">
        {/* Pane-1 */}
        <div className="hidden bg-white pt-1 xl:block xl:w-80 xl:flex-shrink-0 xl:border-r xl:border-gray-200">
          <h2 className="mb-2 text-lg font-medium text-gray-900">Groups</h2>
          <GroupsNav current={data.group?.name} />
        </div>
        {/* Pane-2 */}
        <div className="bg-white p-3 lg:min-w-0 lg:flex-1">
          {/* Group header */}
          <ProfileHeader
            coverImageUrl="https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            iconLoader={groupIconLoader}
            iconSrc={data.group.id}
            name={data.group.name}
            displayName={data.group.displayName || ''}
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

              <FollowGroupButton userId={userId} groupId={groupId} />

              {isGroupAdmin ? (
                <div>
                  <Link href={`/settings/groups/${encodeURIComponent(data.group.id.toLowerCase())}`}>
                    <a className="flex items-center space-x-2">
                      <BadgeCheckIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      <span className="text-sm font-medium text-gray-500">Group Admin</span>
                    </a>
                  </Link>
                </div>
              ) : (
                <div></div>
              )}
            </>
          </ProfileHeader>

          <div className="mt-6"></div>

          {/* Tabs */}
          <div>
            <div className="sm:hidden">
              <label htmlFor="tabs" className="sr-only">
                Select a tab
              </label>
              {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
              <select
                id="tabs"
                name="tabs"
                className="form-select block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                defaultValue={tabs.find((tab) => tab.current).name}
              >
                {tabs.map((tab) => (
                  <option key={tab.name}>{tab.name}</option>
                ))}
              </select>
            </div>
            <div className="hidden sm:block">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 first:pl-8" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <a
                      key={tab.name}
                      href="#"
                      className={classNames(
                        tab.current
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700',
                        'flex whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
                      )}
                      aria-current={tab.current ? 'page' : undefined}
                    >
                      {tab.name}
                      {tab.count ? (
                        <span
                          className={classNames(
                            tab.current ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-900',
                            'ml-3 hidden rounded-full py-0.5 px-2.5 text-xs font-medium md:inline-block'
                          )}
                        >
                          {tab.count}
                        </span>
                      ) : null}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </div>
          {/* Tabs End */}

          <div className="mt-6"></div>

          <div className="mx-4 flex items-center justify-between">
            <div className="text-2xl font-bold">Documents</div>
            <div className="z-30">
              <CreateDocumentButton groupName={groupName} />
            </div>
          </div>
          <div>
            <GroupDocuments groupId={groupId} />
          </div>
        </div>
      </div>
    </>
  )
}

/* With dropdown */
const CreateDocumentButton = ({ groupName }: { groupName: string }) => {
  const { data, loading } = useTemplatesQuery({ variables: { auth: 'user' } })

  if (loading) return <span></span>

  return (
    <span className="relative z-0 inline-flex rounded-md shadow-sm">
      <Link href={`/groups/${encodeURIComponent(groupName.toLowerCase())}/drafts/new`} passHref>
        <a
          type="button"
          className="relative inline-flex w-48 items-center rounded-l-md border border-gray-300 bg-blue-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-100 focus:z-10 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        >
          新規ドキュメント作成
        </a>
      </Link>
      <Menu as="span" className="relative -ml-px block">
        <Menu.Button className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500">
          <span className="sr-only">Open options</span>
          <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-1 -mr-1 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {data.userTemplates.map((template) => (
                <Menu.Item key={template.id}>
                  {({ active }) => (
                    <div>
                      <Link
                        href={`/groups/${encodeURIComponent(groupName.toLowerCase())}/drafts/new?ut=${template.id.toLowerCase()}`}
                        passHref
                      >
                        <a className={classNames(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm')}>
                          {template.name}
                        </a>
                      </Link>
                    </div>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </span>
  )
}

const GroupDocuments = ({ groupId }: { groupId: string }) => {
  const { data, loading, fetchMore } = useDocumentsCpQuery({
    variables: { auth: 'user', groupId: groupId, first: 20 },
    fetchPolicy: 'network-only',
  })

  if (loading) return <div className="m-2 p-2"></div>

  const nodes = data.documentsCP.edges.map((edge) => edge.node)
  const pageInfo = data.documentsCP.pageInfo

  return (
    <div className="m-2 p-2">
      <ul role="list" className="relative z-0 divide-y divide-gray-200 border-b border-t border-gray-200">
        {nodes.map((doc) => (
          <DocListItem
            key={doc.id}
            id={doc.id}
            title={doc.paper.title}
            href={`/docs/${encodeURIComponent(doc.id.toLowerCase())}`}
            groupName={doc.paper.group.displayName || doc.paper.group.name}
            userId={doc.paper.user.id}
            userName={doc.paper.user.username}
            userHref={`/users/${encodeURIComponent(doc.paper.user.username)}`}
            groupHref={`/groups/${encodeURIComponent(doc.paper.group.name.toLowerCase())}`}
            updatedAt={doc.paper.updatedAt}
          />
        ))}
      </ul>

      {pageInfo.hasNextPage && (
        <div className="mt-6 text-center">
          <button
            className="rounded-md border bg-gray-100 px-4 py-2"
            onClick={() => {
              fetchMore({ variables: { after: pageInfo.endCursor } })
            }}
          >
            もっと読み込む
          </button>
        </div>
      )}
    </div>
  )
}

const MyGroupDrafts = ({ groupId }: { groupId: string }) => {
  const { data, loading } = useDraftsQuery({ variables: { auth: 'user', groupId: groupId } })
  if (loading || !data) return <div></div>

  return (
    <div>
      {data.drafts.map((draft) => (
        <div key={draft.id} className="mx-2 my-1">
          <Link href={`/drafts/${encodeURIComponent(draft.id.toLowerCase())}`} passHref>
            <a className="text-md text-blue-700 underline">{draft.title || 'UNTITLED'}</a>
          </Link>
        </div>
      ))}
    </div>
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
      deleteWatch({ variables: { auth: 'user', userId: userId, groupId: groupId } })
    } else {
      createWatch({ variables: { auth: 'user', userId: userId, groupId: groupId } })
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
