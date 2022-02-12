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
  useWatchesQuery,
  useCreateWatchMutation,
  WatchesDocument,
  useDeleteWatchMutation,
  useDraftsQuery,
  useTemplatesQuery,
} from '@graphql/generated/react-apollo'
import { RiLock2Fill } from 'react-icons/ri'
import { BsFlag, BsFlagFill, BsSquare, BsCheck2Square, BsEye, BsEyeFill } from 'react-icons/bs'
import { UserIconNameLinkSmall } from '@components/elements'
import { useEffect, useMemo } from 'react'
import { updatePageViews } from '@lib/localStorage/pageViews'
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'

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

  return (
    <div className="mx-auto mt-4 mb-2 max-w-7xl bg-white">
      <div className="flex">
        <div className="m-2 flex-none md:w-72">
          <div className="rounded-lg border px-2 py-4">
            <div className="break-words text-center">
              <Image loader={groupIconLoader} src={data.group.id} width={96} height={96} alt={data.group.name} className="rounded-lg" />
              <h3 className="text-lg font-bold">
                {data.group.displayName || data.group.name}
                {Boolean(data.group.type === 'private') && <RiLock2Fill className="ml-1 inline-block" />}
              </h3>
              <h4 className="text-md font-bold text-gray-600">{data.group.name}</h4>
            </div>

            {isGroupAdmin && (
              <div className="mt-3">
                <Link href={`${encodeURIComponent(data.group.name)}/${encodeURIComponent(data.group.id.toLowerCase())}/manage`}>
                  <a>
                    <div className="w-full rounded-lg border bg-orange-100 p-1 text-center">Manage This Group</div>
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="m-4 w-full flex-auto">
          <div className="mt-2 border-b text-lg font-bold">Documents</div>
          <div>
            <GroupDocuments groupId={groupId} />
          </div>
        </div>
        <div className="m-2 w-60 flex-none">
          <div>
            <div className="mb-4">
              <WatchBadge userId={userId} groupId={groupId} />
            </div>
            <div>
              <CreateDocumentButton groupName={groupName} />
            </div>
          </div>

          <div className="mt-8 border-b text-lg font-bold">Your Drafts</div>
          <MyGroupDrafts groupId={groupId} />
        </div>
      </div>
    </div>
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

  if (loading) return <></>

  const nodes = data.documentsCP.edges.map((edge) => edge.node)
  const pageInfo = data.documentsCP.pageInfo

  return (
    <div className="m-2 p-2">
      {nodes.map((doc) => (
        <div key={`docs-${doc.id}`}>
          <Link href={`/docs/${encodeURIComponent(doc.id.toLowerCase())}`} passHref>
            <a className="hover:text-blue-500">
              <div key={doc.id} className="m-2 border bg-white p-2">
                <div className="text-black">
                  <UserIconNameLinkSmall userId={doc.paper.user.id} username={doc.paper.user.username} />
                  <div className="ml-2 inline-block">が{new Date(doc.paper.updatedAt).toLocaleString()} に投稿</div>
                </div>
                <div className="text-lg font-bold">{doc.paper.title || 'UNTITLED'}</div>
              </div>
            </a>
          </Link>
        </div>
      ))}
      {pageInfo.hasNextPage && (
        <div className="text-center">
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

const WatchBadge = ({ userId, groupId }: { userId: string; groupId: string }) => {
  const { data, loading } = useWatchesQuery({ variables: { auth: 'user', groupId: groupId } })
  const [createWatch] = useCreateWatchMutation({ refetchQueries: [WatchesDocument] })
  const [deleteWatch] = useDeleteWatchMutation({ refetchQueries: [WatchesDocument] })

  const isWatched = useMemo(() => data?.watches?.find((watch) => watch.userId.toUpperCase() === userId.toUpperCase()), [data])
  const countWatches = useMemo(() => data?.watches.length, [data])

  const handleClick = (e) => {
    if (isWatched) {
      deleteWatch({ variables: { auth: 'user', userId: userId, groupId: groupId } })
    } else {
      createWatch({ variables: { auth: 'user', userId: userId, groupId: groupId } })
    }
  }

  if (loading || !data)
    return (
      <div className="inline-block rounded-xl px-3 py-1 text-center text-indigo-600 outline-indigo-600 hover:cursor-pointer hover:outline">
        <span className="text-sm font-bold"> Watch </span>
        <BsEye className="mx-auto block h-7 w-7" />
        <span className="text-sm font-bold">&nbsp;</span>
      </div>
    )

  return (
    <div
      className="inline-block rounded-xl px-3 py-1 text-center text-indigo-600 outline-indigo-600 hover:cursor-pointer hover:outline"
      onClick={handleClick}
      data-isliked={isWatched}
    >
      <span className="text-sm font-bold"> Watch </span>
      {isWatched ? <BsEyeFill className="mx-auto block h-7 w-7" /> : <BsEye className="mx-auto block h-7 w-7" />}
      <span className="text-sm font-bold">{countWatches}</span>
    </div>
  )
}
