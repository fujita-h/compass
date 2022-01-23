import { useRouter } from "next/router"
import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import { useEsSearchQuery } from "@graphql/generated/react-apollo"
import { getAsString } from "@lib/utils"
import Link from "next/link"
import { UserIconNameLinkSmall } from "@components/elements"

export default function Page() {
  const router = useRouter()
  const session = useSession({ redirectTo: '/login' })

  if (!router.isReady) return (<></>)
  if (!session) return (<></>)
  const query = getAsString(router.query.q)

  console.log(router.query)
  console.log(session)
  return (<Layout searchText={query} ><InnerPage query={query} /></Layout>)
}

const InnerPage = ({ query }: { query: string }) => {

  const { data, loading } = useEsSearchQuery({ variables: { auth: 'user', index: 'documents', query: query } })

  if (loading) return (<></>)
  if (!data) return (<></>)

  console.log(data.esSearch)

  return (<>
    <div className="max-w-7xl mt-4 mx-auto flex bg-white">
      <div className="flex-none w-80 p-2">
        <div className="border rounded-lg">
          <a href="#" className="p-2 border-b flex justify-between"><span>Documents</span><span className="border rounded-lg text-md bg-gray-500 text-white px-2">{data.esCount.Documents.count}</span></a>
          <a href="#" className="p-2 border-b flex justify-between"><span>Groups</span><span className="border rounded-lg text-md bg-gray-500 text-white px-2">{data.esCount.Groups.count}</span></a>
          <a href="#" className="block p-2 border-b">Users</a>
        </div>
      </div>
      <div className="flex-1">
        <div>
          {data.esSearch.Documents.hits.hits.map((d) =>
            <div key={`search-docs-${d._id}`} className="className='w-full lg:w-full 2xl:w-1/2 max-w-4xl">
          <Link href={`/docs/${encodeURIComponent(d._id.toLowerCase())}`} passHref>
            <a className='hover:text-green-700'>
              <div className='border m-2 p-2 bg-white'>
                <Link href={`/groups/${encodeURIComponent(d._source.groupName)}`} passHref>
                  <div className='bg-red-100 text-black inline-block px-2 mb-1 hover:underline'>
                    {d._source.groupDisplayName || d._source.groupName}
                  </div>
                </Link>
                <div className='text-black'>
                  <UserIconNameLinkSmall userId={d._source.userId} username={d._source.userName} />
                  <div className='inline-block ml-2'>
                    が{new Date(d._source.updatedAt).toLocaleString()} に投稿
                  </div>
                </div>
                <div className='text-lg font-bold'>{d._source.title || 'UNTITLED'}</div>
              </div></a>
          </Link>

            </div>
          )}
        </div>

      </div>
    </div>
  </>)

}