import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from '@lib/session'
import { Layout } from '@components/layouts'
import { groupIconLoader, userIconLoader } from '@components/imageLoaders'
import Image from 'next/image'
import { getAsString } from '@lib/utils'
import { useGroupIndexPageQuery, GroupIndexPageQuery, useDocumentsCpQuery, Auth } from '@graphql/generated/react-apollo'
import { RiLock2Fill } from 'react-icons/ri'
import { UserIconNameLinkSmall } from '@components/elements'

export default function Page(props) {
  const session = useSession({ redirectTo: "/login" })
  const router = useRouter()
  const groupId = getAsString(router.query?.groupId)

  if (!session?.id) return (<Layout></Layout>)
  if (!groupId) return (<Layout></Layout>)
  return (<Layout><InnerPage groupId={groupId} /></Layout>)
}

const InnerPage = ({ groupId }: { groupId: string }) => {
  const { data, loading } = useGroupIndexPageQuery({ variables: { groupId }, fetchPolicy: 'cache-and-network' })
  if (loading) return (<></>)
  if (!data.group) return (<div className="text-red-500">{groupId} Not Found.</div>)

  const isGroupAdmin = Boolean(data.group.MapUserGroup.find(x => x.User.id == data.session.userSession.id)?.isAdmin)


  return (
    <div className='max-w-7xl mx-auto mt-4 mb-2 bg-white'>
      <div className='flex'>
        <div className='flex-none md:w-72 m-2'>
          <div className='border rounded-lg px-2 py-4'>
            <div className='text-center break-words'>
              <Image loader={groupIconLoader} src={data.group.id} width={96} height={96} alt={data.group.name} className='rounded-lg' />
              <h3 className='text-lg font-bold'>{data.group.displayName || data.group.name}{data.group.isPrivate && <RiLock2Fill className='ml-1 inline-block' />}</h3>
              <h4 className='text-md font-bold text-gray-600'>{data.group.name}</h4>
            </div>

            {isGroupAdmin &&
              <div className='mt-3'>
                <Link href={`${encodeURIComponent(data.group.id.toLowerCase())}/manage`}>
                  <a><div className='border rounded-lg p-1 text-center bg-orange-100 w-full'>Manage This Group</div></a>
                </Link>
              </div>
            }

          </div>

        </div>
        <div className='flex-auto w-full m-4'>

          <div className="mt-2 text-lg font-bold border-b">Documents</div>
          <div><GroupDocuments groupId={groupId} /></div>

        </div>
        <div className='flex-none w-60 m-2'>
          <div>
            <div>
              <Link href={`${encodeURIComponent(groupId)}/drafts/new`} passHref>
                <a><div className="border rounded-lg p-2 text-center bg-blue-100">Create New Document</div></a>
              </Link>
            </div>
          </div>
          <div className="mt-8 text-lg font-bold border-b">Your Drafts</div>
          <MyGroupDrafts data={data} />

        </div>
      </div>
    </div >

  )
}


const GroupDocuments = ({ groupId }: { groupId: string }) => {

  const { data, loading, fetchMore } = useDocumentsCpQuery({
    variables: { auth: Auth.User, groupId: groupId, first: 20 },
    fetchPolicy: "network-only"
  })

  if (loading) return (<></>)

  const nodes = data.documentsCP.edges.map((edge) => edge.node)
  const pageInfo = data.documentsCP.pageInfo

  return (
    <div className='m-2 p-2'>
      {nodes.map((doc) =>
        <div key={`docs-${doc.id}`}>
          <Link href={`/docs/${encodeURIComponent(doc.id.toLowerCase())}`} passHref>
            <a className='hover:text-blue-500'>
              <div key={doc.id} className='border m-2 p-2 bg-white'>
                <div className='text-black'>
                  <UserIconNameLinkSmall userId={doc.Paper.User.id} userName={doc.Paper.User.username} />
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
        <div className='text-center'>
          <button className='border rounded-md px-4 py-2 bg-gray-100'
            onClick={() => {
              fetchMore({ variables: { after: pageInfo.endCursor, } })
            }}>もっと読み込む</button>
        </div>
      }
    </div>
  )
}


const MyGroupDrafts = ({ data }: { data: GroupIndexPageQuery }) => {
  return (
    <div>
      {data.drafts.map((draft) =>
        <div key={draft.id} className='mx-2 my-1'>
          <Link href={`/drafts/${encodeURIComponent(draft.id.toLowerCase())}`} passHref>
            <a className='text-md text-blue-700 underline'>{draft.title || 'UNTITLED'}</a>
          </Link>
        </div>)}
    </div>
  )
}

