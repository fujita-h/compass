import { Layout } from '@components/layouts'
import { useSession } from '@lib/hooks'
import Link from 'next/link'
import {
  useDeleteStockCategoryMutation,
  useGroupsQuery,
  useStockCategoriesQuery,
  useStocksAndCategoriesQuery,
  useStocksQuery,
  useStocksWithDocumentQuery,
} from '@graphql/generated/react-apollo'
import { useState } from 'react'
import { UserIconNameLinkSmall } from '@components/elements'
import { FilterIcon } from '@heroicons/react/solid'
import { classNames, getAsString } from '@lib/utils'
import { NextLink } from '@components/nextLink'
import { NavStocks } from '@components/navStocks'
import Router, { useRouter } from 'next/router'
import { DocListItem } from '@components/docListItem'
import dynamic from 'next/dynamic'

const SimpleAlertModal = dynamic(() => import('@components/modals/simpleAlert'))

export default function Page() {
  const session = useSession({ redirectTo: '/login' })
  const router = useRouter()
  const catId = getAsString(router.query.catId)

  if (!session) return <></>

  return (
    <Layout>
      <InnerPage catId={catId} />
    </Layout>
  )
}

const InnerPage = ({ catId }: { catId: string }) => {
  const { data, loading } = useStocksWithDocumentQuery({ variables: { auth: 'user', categoryId: catId } })
  const [DeleteCategory] = useDeleteStockCategoryMutation()
  const [open, setOpen] = useState(false)

  const handleDelete = () => {
    DeleteCategory({
      variables: { auth: 'user', id: catId },
      onCompleted: () => {
        Router.push('/stocks')
      },
    })
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <>
      {/* 2-Pane wrapper */}
      <div className="mx-auto w-full max-w-7xl flex-grow lg:flex">
        {/* Pane-1 */}
        <div className="hidden bg-white pt-3 xl:block xl:w-80 xl:flex-shrink-0 xl:border-r xl:border-gray-200">
          <h2 className="mb-2 ml-2 mt-2 text-lg font-medium text-gray-900">Stocks</h2>
          <NavStocks current={catId} />
        </div>
        {/* Pane-2 */}
        <div className="bg-white p-3 lg:min-w-0 lg:flex-1">
          <div className="flex items-center justify-between space-x-2">
            <h1 className="m-2 text-xl ">ストック: {data?.stockCategory?.name}</h1>
            <div className="pr-4">
              <button
                type="button"
                className="inline-flex items-center rounded-full border border-transparent bg-red-500 px-3.5 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                onClick={() => {
                  setOpen(true)
                }}
              >
                カテゴリの削除
              </button>
              <SimpleAlertModal
                open={open}
                setOpen={setOpen}
                title="カテゴリの削除"
                message="カテゴリを削除するとこのカテゴリに保存したストックも削除されます。このカテゴリを削除しますか?"
                buttonLabel="削除する"
                cancelLabel="キャンセル"
                buttonFunc={handleDelete}
                cancelFunc={handleCancel}
              />
            </div>
          </div>
          <ul role="list" className="relative z-0 divide-y divide-gray-200 border-b border-gray-200">
            {(data?.stocks || []).map((stock) => (
              <DocListItem
                id={stock.document.id}
                title={stock.document.paper.title}
                href={`/docs/${encodeURIComponent(stock.document.id.toLowerCase())}`}
                groupName={stock.document.paper.group.name}
                groupHref={`/groups/${encodeURIComponent(stock.document.paper.group.name)}`}
                userId={stock.document.paper.user.id}
                userName={stock.document.paper.user.username}
                userHref={`/users/${encodeURIComponent(stock.document.paper.user.username)}`}
                updatedAt={stock.document.paper.updatedAt}
              />
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
