import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import { getAsString, classNames } from '@lib/utils'
import { useDocumentsCpQuery, useTemplatesQuery } from '@graphql/generated/react-apollo'
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'
import { DocListItem } from '@components/docListItem'
import GroupPageLayout from '@components/layouts/groupPageLayout'

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
  return (
    <GroupPageLayout currentUrl="/documents" userId={userId} groupName={groupName}>
      <div>
        <div className="mx-4 flex items-center justify-between">
          <div className="text-xl font-medium">Documents</div>
          <div className="z-30">
            <CreateDocumentButton groupName={groupName} />
          </div>
        </div>
        <div>
          <GroupDocuments groupName={groupName} />
        </div>
      </div>
    </GroupPageLayout>
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

const GroupDocuments = ({ groupName }: { groupName: string }) => {
  const { data, loading, fetchMore } = useDocumentsCpQuery({
    variables: { auth: 'user', groupName, first: 20 },
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
