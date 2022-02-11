import { Layout } from "@components/layouts"
import { useSession } from "@lib/hooks"
import Link from 'next/link'
import { useGroupsQuery, useStockCategoriesQuery, useStocksAndCategoriesQuery, useStocksQuery } from '@graphql/generated/react-apollo'
import { useState } from "react"
import { UserIconNameLinkSmall } from "@components/elements"

export default function Page() {

  const session = useSession({ redirectTo: "/login" })
  const { data, loading } = useStocksAndCategoriesQuery({ variables: { auth: 'user' } })

  const [selectedCategoryId, setSelectedCategoryId] = useState('')

  if (!session) return (<></>)
  if (loading) return (<></>)
  if (!data) return (<></>)

  return (<Layout>

    <div className='w-full max-w-7xl mx-auto mt-4 mb-2 p-4 bg-white'>
      <div>
        <div className="text-2xl">Stocks</div>
      </div>
      <div className="mt-4">
        <div className="flex gap-2 flex-wrap">
          <div className="w-80">
            {data.stockCategories.map((cat) => (

              selectedCategoryId == cat.id ?
                <div
                  key={`cat-${cat.id}`}
                  onClick={() => { setSelectedCategoryId(cat.id) }}
                  className="border rounded-md p-2 m-2 bg-orange-50">{cat.name}</div>
                :
                <div
                  key={`cat-${cat.id}`}
                  onClick={() => { setSelectedCategoryId(cat.id) }}
                  className="border rounded-md p-2 m-2 hover:cursor-pointer hover:bg-orange-50">{cat.name}</div>
            )
            )}
          </div>
          <div className="flex-1">
            {data.stocks.filter((x) => x.stock_category.id == selectedCategoryId).map((stock) =>
              <div key={`docs-${stock.document.id}`} className='w-full lg:w-full 2xl:w-1/2 max-w-4xl'>
                <Link href={`/docs/${encodeURIComponent(stock.document.id.toLowerCase())}`} passHref>
                  <a className='hover:text-green-700'>
                    <div className='border m-2 p-2 bg-white'>
                      <Link href={`/groups/${encodeURIComponent(stock.document.paper.group.name)}`} passHref>
                        <div className='bg-red-100 text-black inline-block px-2 mb-1 hover:underline'>
                          {stock.document.paper.group.displayName || stock.document.paper.group.name}
                        </div>
                      </Link>
                      <div className='text-black'>
                        <UserIconNameLinkSmall userId={stock.document.paper.user.id} username={stock.document.paper.user.username} />
                        <div className='inline-block ml-2'>
                          <span>が{new Date(stock.document.createdAt).toLocaleString()} に投稿</span>
                          {stock.document.createdAt !== stock.document.paper.updatedAt ? <span className='ml-2 text-sm'>{new Date(stock.document.paper.updatedAt).toLocaleString()} に更新</span> : <></>}
                        </div>
                      </div>
                      <div className='text-lg font-bold'>{stock.document.paper.title || 'UNTITLED'}</div>
                    </div></a>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </Layout>)
}