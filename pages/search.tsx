import { useRouter } from "next/router"
import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import { useEsSearchQuery } from "@graphql/generated/react-apollo"
import { getAsString } from "@lib/utils"
import Link from "next/link"
import { UserIconNameLinkSmall } from "@components/elements"
import { useCallback, useMemo } from "react"
import Image from 'next/image'
import { groupIconLoader, userIconLoader } from '@components/imageLoaders'
import { RiLock2Fill } from 'react-icons/ri'

export default function Page() {
  const router = useRouter()
  const session = useSession({ redirectTo: '/login' })

  if (!router.isReady) return (<></>)
  if (!session) return (<></>)
  const query = getAsString(router.query.q) || ''
  const type = getAsString(router.query.type)

  return (<Layout searchText={query}><InnerPage query={query} type={type} /></Layout>)
}

const InnerPage = ({ query, type }: { query: string, type: string }) => {

  const typeValidated = useMemo(() => {
    switch (type ? type.toLowerCase() : '') {
      case 'documents':
        return 'documents'
      case 'groups':
        return 'groups'
      case 'users':
        return 'users'
      default:
        return 'documents'
    }
  }, [type])

  const { data, loading } = useEsSearchQuery({ variables: { auth: 'user', index: typeValidated, query: query } })

  if (loading) return (<></>)
  if (!data) return (<></>)

  return (<>
    <div className="max-w-7xl mt-4 mx-auto flex bg-white">
      <div className="flex-none w-80 p-2">
        <div className="border rounded-lg">
          {typeValidated === 'documents' ?
            <div className="border-b">
              <div className="p-2 flex justify-between border-l-2 border-orange-400">
                <span>Documents</span>
                <span className="border rounded-lg text-md bg-gray-500 text-white px-2">{data.esCount.Documents.count}</span>
              </div>
            </div>
            :
            <Link href={`/search?q=${query}&type=documents`} passHref><a>
              <div className="border-b">
                <div className="p-2 flex justify-between">
                  <span>Documents</span>
                  <span className="border rounded-lg text-md bg-gray-500 text-white px-2">{data.esCount.Documents.count}</span>
                </div>
              </div>
            </a></Link>
          }
          {typeValidated === 'groups' ?
            <div className="border-b">
              <div className="p-2 flex justify-between border-l-2 border-orange-400">
                <span>Groups</span>
                <span className="border rounded-lg text-md bg-gray-500 text-white px-2">{data.esCount.Groups.count}</span>
              </div>
            </div>
            :
            <Link href={`/search?q=${query}&type=groups`} passHref><a>
              <div className="border-b">
                <div className="p-2 flex justify-between">
                  <span>Groups</span>
                  <span className="border rounded-lg text-md bg-gray-500 text-white px-2">{data.esCount.Groups.count}</span>
                </div>
              </div>
            </a></Link>
          }
          {typeValidated === 'users' ?
            <div className="">
              <div className="p-2 flex justify-between border-l-2 border-orange-400">
                <span>Users</span>
                <span className="border rounded-lg text-md bg-gray-500 text-white px-2">{data.esCount.Users.count}</span>
              </div>
            </div>
            :
            <Link href={`/search?q=${query}&type=users`} passHref><a>
              <div className="">
                <div className="p-2 flex justify-between">
                  <span>Users</span>
                  <span className="border rounded-lg text-md bg-gray-500 text-white px-2">{data.esCount.Users.count}</span>
                </div>
              </div>
            </a></Link>
          }
        </div>
      </div>
      <div className="flex-1">
        {typeValidated === 'documents' && data.esSearch.Documents ?
          <div>
            {data.esSearch.Documents.hits.hits.map((d) =>
              <div key={`search-docs-${d._id}`} className="w-full lg:w-full 2xl:w-1/2 max-w-4xl">
                <Link href={`/docs/${encodeURIComponent(d._id.toLowerCase())}`} passHref>
                  <a className='hover:text-green-700'>
                    <div className='border m-2 p-2 bg-white'>
                      <div className="flex justify-between">
                        <div>
                          <Link href={`/groups/${encodeURIComponent(d._source.groupName)}`} passHref>
                            <div className='bg-red-100 text-black inline-block px-2 mb-1 hover:underline'>
                              {d._source.groupDisplayName || d._source.groupName}
                            </div>
                          </Link>
                        </div>
                        <div className="text-sm">
                          {d._score.toFixed(4)}
                        </div>
                      </div>
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
          </div> : <></>
        }
        {typeValidated === 'groups' && data.esSearch.Groups ?
          <div>
            {data.esSearch.Groups.hits.hits.map((d) =>
              <div key={`search-groups-${d._id}`} >
                <Link href={`/groups/${encodeURIComponent(d._source.name.toLowerCase())}`} passHref>
                  <a className='hover:text-green-700'>
                    <div className='border rounded-lg m-4 p-2 flex'>
                      <Image loader={groupIconLoader} src={d._id} width={60} height={60} alt={d._source.name} className='rounded-lg' />
                      <div className='flex-1 break-words ml-2'>
                        <div className="border-b-1">
                          <h3 className='inline-block text-lg font-bold mr-2'>{d._source.displayName || d._source.name}{Boolean(d._source.type === 'private') && <RiLock2Fill className='ml-1 inline-block' />}</h3>
                          <h4 className='inline-block text-md font-bold text-gray-600'>{d._source.name}</h4>
                        </div>
                        <div className="mt-2 text-sm">{d._source.description}</div>
                      </div>
                    </div>
                  </a>
                </Link>
              </div>
            )}
          </div> : <></>
        }
        {typeValidated === 'users' && data.esSearch.Users ?
          <div>
            {data.esSearch.Users.hits.hits.map((d) =>
              <div key={`search-users-${d._id}`} >
                <Link href={`/users/${encodeURIComponent(d._source.username.toLowerCase())}`} passHref>
                  <a className='hover:text-green-700'>
                    <div className='border rounded-lg m-4 p-2 flex'>
                      <Image loader={userIconLoader} src={d._id} width={60} height={60} alt={d._source.username} className='rounded-lg' />
                      <div className='flex-1 break-words ml-2'>
                        <div className="border-b-1">
                          <h3 className='inline-block text-lg font-bold mr-2'>{d._source.displayName || d._source.username}</h3>
                          <h4 className='inline-block text-md font-bold text-gray-600'>{d._source.username}</h4>
                        </div>
                        <div className="mt-2 text-sm">{d._source.description}</div>
                      </div>
                    </div>
                  </a>
                </Link>
              </div>
            )}
          </div> : <></>
        }
      </div>
    </div>
  </>)

}