import { Layout } from '@components/layouts'
import Link from 'next/link'
import { useSessionQuery, useMyTimelineCpQuery, useMyJoinedGroupsCpQuery } from '@graphql/generated/react-apollo'
import { groupIconLoader, userIconLoader } from '@components/imageLoaders'
import Image from 'next/image'
import { UserIconNameLinkSmall } from '@components/elements'
import { BsAppIndicator } from 'react-icons/bs'

export default function Page() {

  // Indexページはログインの有無でページを切り替える必要があるので、errorPolicy:all
  const { data, loading, refetch, } = useSessionQuery({ errorPolicy: 'all' })
  if (loading) return (<Layout />)

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
          <div className="w-80">
            <div className="p-2">
              <div className='flex justify-between items-end'>
                <div><h2>参加グループ</h2></div>
                <div>
                  <Link href="/groups/new" passHref><a>
                    <div className='border rounded-lg px-2 py-1 text-sm text-white bg-green-600'><span>New</span></div>
                  </a></Link>
                </div>
              </div>
              <MyJoinedGroup />
            </div>
          </div>
          <div className="w-full p-2">
            <h1 className="text-2xl border-b-1">タイムライン</h1>
            <Timeline />
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
        <div key={`docs-${doc.id}`} className='w-full lg:w-full 2xl:w-1/2 max-w-4xl'>
          <Link href={`/docs/${encodeURIComponent(doc.id.toLowerCase())}`} passHref>
            <a className='hover:text-green-700'>
              <div className='border m-2 p-2 bg-white'>
                <Link href={`/groups/${encodeURIComponent(doc.paper.group.name)}`} passHref>
                  <div className='bg-red-100 text-black inline-block px-2 mb-1 hover:underline'>
                    {doc.paper.group.displayName || doc.paper.group.name}
                  </div>
                </Link>
                <div className='text-black'>
                  <UserIconNameLinkSmall userId={doc.paper.user.id} username={doc.paper.user.username} />
                  <div className='inline-block ml-2'>
                    <span>が{new Date(doc.createdAt).toLocaleString()} に投稿</span>
                    {doc.createdAt !== doc.paper.updatedAt ? <span className='ml-2 text-sm'>{new Date(doc.paper.updatedAt).toLocaleString()} に更新</span> : <></>}
                  </div>
                </div>
                <div className='text-lg font-bold'>{doc.paper.title || 'UNTITLED'}</div>
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
  const { data, loading, fetchMore } = useMyJoinedGroupsCpQuery({ variables: { first: 10 }, fetchPolicy: "network-only" })
  if (loading) return (<></>)
  const nodes = data.myJoinedGroupsCP.edges.map((edge) => edge.node)
  const pageInfo = data.myJoinedGroupsCP.pageInfo

  return (
    <div className='pt-2 text-base'>
      {nodes.map((group) =>
        <div key={`myGroups-${group.id}`} className='my-1'>
          <Link href={`/groups/${encodeURIComponent(group.name)}`} passHref>
            <a className='hover:underline'>
              <BsAppIndicator className='inline-block mr-1' /><span>{group.displayName || group.name}</span>
            </a>
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

