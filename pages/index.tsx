import { Layout } from '@components/layouts'
import Link from 'next/link'
import { useSessionQuery, useMyTimelineCpQuery, useMyJoinedGroupsCpQuery } from '@graphql/generated/react-apollo'
import { groupIconLoader, userIconLoader } from '@components/imageLoaders'
import Image from 'next/image'

export default function Page() {

  // Indexページはログインの有無でページを切り替える必要があるので、errorPolicy:all
  const { data, loading, refetch, } = useSessionQuery({ fetchPolicy: 'cache-and-network', errorPolicy: 'all' })
  if (loading) return (<Layout />)

  console.log(data)
  // userSession が無ければ、未ログイン
  if (!data.session.userSession) {
    return (
      <Layout>
        <div className="mt-12 flex justify-center">
          <div>
            <Link href="/login" passHref><a>
              <div className="text-xl text-center bg-blue-200 rounded-lg px-6 py-3">
                Login to Start
              </div></a>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className='p-2'>
        <div className="flex content-between">
          <div className="w-full p-2">
            <h1 className="text-2xl border-b-1">タイムライン</h1>
            <Timeline />
          </div>
          <div className="w-80">
            <div className="border rounded-lg p-2">
              <h2 className="border-b-1">Joined Groups</h2>
              <MyJoinedGroup />
            </div>
            <div className="mt-6">
              <Link href="/groups/new" passHref><a>
                <div className='border rounded-lg px-3 py-1 my-2 bg-blue-100'>
                  新しいグループを作成する
                </div>
              </a></Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

const Timeline = () => {
  const { data, loading, fetchMore } = useMyTimelineCpQuery({ variables: { first: 20 }, fetchPolicy: "network-only" })
  if (loading) return (<></>)
  const nodes = data.myTimelineCP.edges.map((edge) => edge.node)
  const pageInfo = data.myTimelineCP.pageInfo

  return (
    <div className='flex flex-wrap'>
      {nodes.map((doc) =>
        <div key={`docs-${doc.id}`} className='w-full lg:w-1/2 2xl:w-1/3 max-w-xl'>
          <Link href={`/docs/${encodeURIComponent(doc.id.toLowerCase())}`} passHref>
            <a className='hover:text-green-700'>
              <div className='border m-2 p-2 bg-white'>
                <Link href={`/groups/${encodeURIComponent(doc.Paper.Group.id)}`} passHref><a>
                  <div className='bg-red-100 text-black inline-block px-2 mb-1 hover:underline'>
                    {doc.Paper.Group.displayName}
                  </div>
                </a></Link>
                <div className='text-black'>
                  <div className='inline-block'>
                    <Link href={`/users/${encodeURIComponent(doc.Paper.User.id.toLowerCase())}`} passHref>
                      <a className='group hover:underline'>
                        <div className='inline-block mr-1 group-hover:brightness-95'>
                          <Image loader={userIconLoader} src={doc.Paper.User.id.toLowerCase()} width={16} height={16} alt={doc.Paper.User.username} className='rounded-full' />
                        </div>
                        <span>@{doc.Paper.User.username}</span>
                      </a>
                    </Link>
                  </div>
                  <div className='inline-block ml-2'>
                    が{new Date(doc.Paper.updatedAt).toLocaleString()} に投稿
                  </div>
                </div>
                <div className='text-lg font-bold'>{doc.Paper.title || 'UNTITLED'}</div>
              </div></a>
          </Link>
        </div>
      )}
      {pageInfo.hasNextPage &&
        <div className='text-center w-full'>
          <button className='border rounded-md px-4 py-2 bg-gray-100'
            onClick={() => {
              fetchMore({ variables: { after: pageInfo.endCursor, } })
            }}>もっと読み込む</button>
        </div>
      }
    </div>
  )
}

const MyJoinedGroup = () => {
  const { data, loading, fetchMore } = useMyJoinedGroupsCpQuery({ variables: { first: 20 }, fetchPolicy: "network-only" })
  if (loading) return (<></>)
  const nodes = data.myJoinedGroupsCP.edges.map((edge) => edge.node)
  const pageInfo = data.myJoinedGroupsCP.pageInfo

  return (
    <div className='pt-2'>
      {nodes.map((group) =>
        <Link href={`/groups/${encodeURIComponent(group.id.toLowerCase())}`} passHref>
          <a className='hover:bg-orange-200'>
            <div key={`myGroups-${group.id}`} className='w-full border rounded-md p-2 my-1 hover:bg-orange-200'>
              <div>{group.displayName || group.name}</div>

            </div>       </a>
        </Link>
      )}
      {pageInfo.hasNextPage &&
        <div className='text-center w-full'>
          <button className='border rounded-md px-4 py-2 bg-gray-100'
            onClick={() => {
              fetchMore({ variables: { after: pageInfo.endCursor, } })
            }}>もっと読み込む</button>
        </div>
      }
    </div>
  )

}

