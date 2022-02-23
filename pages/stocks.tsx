import { Layout } from '@components/layouts'
import { useSession } from '@lib/hooks'
import Link from 'next/link'
import { useGroupsQuery, useStockCategoriesQuery, useStocksAndCategoriesQuery, useStocksQuery } from '@graphql/generated/react-apollo'
import { useState } from 'react'
import { UserIconNameLinkSmall } from '@components/elements'

export default function Page() {
  const session = useSession({ redirectTo: '/login' })
  const { data, loading } = useStocksAndCategoriesQuery({ variables: { auth: 'user' } })

  const [selectedCategoryId, setSelectedCategoryId] = useState('')

  if (!session) return <></>
  if (loading) return <></>
  if (!data) return <></>

  return (
    <Layout>
      <div className="mx-auto mt-4 mb-2 w-full max-w-7xl bg-white p-4">
        <div>
          <div className="text-2xl">Stocks</div>
        </div>
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            <div className="w-80">
              {data.stockCategories.map((cat) =>
                selectedCategoryId == cat.id ? (
                  <div
                    key={`cat-${cat.id}`}
                    onClick={() => {
                      setSelectedCategoryId(cat.id)
                    }}
                    className="m-2 rounded-md border bg-orange-50 p-2"
                  >
                    {cat.name}
                  </div>
                ) : (
                  <div
                    key={`cat-${cat.id}`}
                    onClick={() => {
                      setSelectedCategoryId(cat.id)
                    }}
                    className="m-2 rounded-md border p-2 hover:cursor-pointer hover:bg-orange-50"
                  >
                    {cat.name}
                  </div>
                )
              )}
            </div>
            <div className="flex-1">
              {data.stocks
                .filter((x) => x.stock_category.id == selectedCategoryId)
                .map((stock) => (
                  <div key={`docs-${stock.document.id}`} className="w-full max-w-4xl lg:w-full 2xl:w-1/2">
                    <Link href={`/docs/${encodeURIComponent(stock.document.id.toLowerCase())}`} passHref>
                      <a className="hover:text-green-700">
                        <div className="m-2 border bg-white p-2">
                          <Link href={`/groups/${encodeURIComponent(stock.document.paper.group.name)}`} passHref>
                            <div className="mb-1 inline-block bg-red-100 px-2 text-black hover:underline">
                              {stock.document.paper.group.displayName || stock.document.paper.group.name}
                            </div>
                          </Link>
                          <div className="text-black">
                            <UserIconNameLinkSmall userId={stock.document.paper.user.id} username={stock.document.paper.user.username} />
                            <div className="ml-2 inline-block">
                              <span>が{new Date(stock.document.createdAt).toLocaleString()} に投稿</span>
                              {stock.document.createdAt !== stock.document.paper.updatedAt ? (
                                <span className="ml-2 text-sm">{new Date(stock.document.paper.updatedAt).toLocaleString()} に更新</span>
                              ) : (
                                <></>
                              )}
                            </div>
                          </div>
                          <div className="text-lg font-meduim">{stock.document.paper.title || 'UNTITLED'}</div>
                        </div>
                      </a>
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
