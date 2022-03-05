import { DocListItem } from '@components/docListItem'
import { Layout } from '@components/layouts'
import SimpleAlertModal from '@components/modals/simpleAlert'
import { NavDrafts } from '@components/navDrafts'
import { useDraftsQuery } from '@graphql/generated/react-apollo'
import { getAsString } from '@lib/utils'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function Page() {
  const router = useRouter()
  const groupId = getAsString(router.query.groupId)

  return (
    <Layout>
      <InnerPage groupId={groupId} />
    </Layout>
  )
}

const InnerPage = ({ groupId }: { groupId: string }) => {
  const { data, loading } = useDraftsQuery({ variables: { auth: 'user', groupId } })

  return (
    <>
      {/* 2-Pane wrapper */}
      <div className="mx-auto w-full max-w-7xl flex-grow lg:flex">
        {/* Pane-1 */}
        <div className="hidden bg-white pt-3 xl:block xl:w-80 xl:flex-shrink-0 xl:border-r xl:border-gray-200">
          <h2 className="mb-2 ml-2 mt-2 text-lg font-medium text-gray-900">Drafts</h2>
          <NavDrafts current={groupId} />
        </div>
        {/* Pane-2 */}
        <div className="bg-white p-3 lg:min-w-0 lg:flex-1">
          <div className="flex items-center justify-between space-x-2">
            <h1 className="m-2 text-xl ">下書き</h1>
          </div>
          <ul role="list" className="relative z-0 divide-y divide-gray-200 border-b border-gray-200">
            {(data?.drafts || []).map((draft) => (
              <DocListItem
                id={draft.id}
                title={draft.title}
                href={`/drafts/${encodeURIComponent(draft.id.toLowerCase())}`}
                groupName={draft.group.name}
                groupHref={`/groups/${encodeURIComponent(draft.group.name)}`}
                userId={draft.user.id}
                userName={draft.user.username}
                userHref={`/users/${encodeURIComponent(draft.user.username)}`}
                updatedAt={draft.updatedAt}
              />
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
