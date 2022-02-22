import { useRouter } from 'next/router'
import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import { useEsSearchQuery } from '@graphql/generated/react-apollo'
import { getAsString } from '@lib/utils'
import Link from 'next/link'
import { UserIconNameLinkSmall } from '@components/elements'
import { useCallback, useMemo } from 'react'
import Image from 'next/image'
import { RiLock2Fill } from 'react-icons/ri'

export default function Page() {
  const router = useRouter()
  const session = useSession({ redirectTo: '/login' })

  if (!router.isReady) return <></>
  if (!session) return <></>
  const query = getAsString(router.query.q) || ''
  const type = getAsString(router.query.type)

  return (
    <Layout searchText={query}>
      <InnerPage query={query} type={type} />
    </Layout>
  )
}

const InnerPage = ({ query, type }: { query: string; type: string }) => {
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

  if (loading) return <></>
  if (!data) return <></>

  return (
    <>
      <div className="mx-auto mt-4 flex max-w-7xl bg-white">
        <div className="w-80 flex-none p-2">
          <div className="rounded-lg border">
            {typeValidated === 'documents' ? (
              <div className="border-b">
                <div className="flex justify-between border-l-2 border-orange-400 p-2">
                  <span>Documents</span>
                  <span className="rounded-lg border bg-gray-500 px-2 text-md text-white">{data.esCount.Documents.count}</span>
                </div>
              </div>
            ) : (
              <Link href={`/search?q=${query}&type=documents`} passHref>
                <a>
                  <div className="border-b">
                    <div className="flex justify-between p-2">
                      <span>Documents</span>
                      <span className="rounded-lg border bg-gray-500 px-2 text-md text-white">{data.esCount.Documents.count}</span>
                    </div>
                  </div>
                </a>
              </Link>
            )}
            {typeValidated === 'groups' ? (
              <div className="border-b">
                <div className="flex justify-between border-l-2 border-orange-400 p-2">
                  <span>Groups</span>
                  <span className="rounded-lg border bg-gray-500 px-2 text-md text-white">{data.esCount.Groups.count}</span>
                </div>
              </div>
            ) : (
              <Link href={`/search?q=${query}&type=groups`} passHref>
                <a>
                  <div className="border-b">
                    <div className="flex justify-between p-2">
                      <span>Groups</span>
                      <span className="rounded-lg border bg-gray-500 px-2 text-md text-white">{data.esCount.Groups.count}</span>
                    </div>
                  </div>
                </a>
              </Link>
            )}
            {typeValidated === 'users' ? (
              <div className="">
                <div className="flex justify-between border-l-2 border-orange-400 p-2">
                  <span>Users</span>
                  <span className="rounded-lg border bg-gray-500 px-2 text-md text-white">{data.esCount.Users.count}</span>
                </div>
              </div>
            ) : (
              <Link href={`/search?q=${query}&type=users`} passHref>
                <a>
                  <div className="">
                    <div className="flex justify-between p-2">
                      <span>Users</span>
                      <span className="rounded-lg border bg-gray-500 px-2 text-md text-white">{data.esCount.Users.count}</span>
                    </div>
                  </div>
                </a>
              </Link>
            )}
          </div>
        </div>
        <div className="flex-1">
          {typeValidated === 'documents' && data.esSearch.Documents ? (
            <div>
              {data.esSearch.Documents.hits.hits.map((d) => (
                <div key={`search-docs-${d._id}`} className="w-full max-w-4xl lg:w-full 2xl:w-1/2">
                  <Link href={`/docs/${encodeURIComponent(d._id.toLowerCase())}`} passHref>
                    <a className="hover:text-green-700">
                      <div className="m-2 border bg-white p-2">
                        <div className="flex justify-between">
                          <div>
                            <Link href={`/groups/${encodeURIComponent(d._source.groupName)}`} passHref>
                              <div className="mb-1 inline-block bg-red-100 px-2 text-black hover:underline">
                                {d._source.groupDisplayName || d._source.groupName}
                              </div>
                            </Link>
                          </div>
                          <div className="text-sm">{d._score.toFixed(4)}</div>
                        </div>
                        <div className="text-black">
                          <UserIconNameLinkSmall userId={d._source.userId} username={d._source.userName} />
                          <div className="ml-2 inline-block">が{new Date(d._source.updatedAt).toLocaleString()} に投稿</div>
                        </div>
                        <div className="text-lg font-bold">{d._source.title || 'UNTITLED'}</div>
                      </div>
                    </a>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <></>
          )}
          {typeValidated === 'groups' && data.esSearch.Groups ? (
            <div>
              {data.esSearch.Groups.hits.hits.map((d) => (
                <div key={`search-groups-${d._id}`}>
                  <Link href={`/groups/${encodeURIComponent(d._source.name.toLowerCase())}`} passHref>
                    <a className="hover:text-green-700">
                      <div className="m-4 flex rounded-lg border p-2">
                        <Image
                          src={`/api/files/groupicons/${encodeURIComponent(d._id.toLowerCase())}`}
                          width={60}
                          height={60}
                          alt={d._source.name}
                          className="rounded-lg"
                        />
                        <div className="ml-2 flex-1 break-words">
                          <div className="border-b-1">
                            <h3 className="mr-2 inline-block text-lg font-bold">
                              {d._source.displayName || d._source.name}
                              {Boolean(d._source.type === 'private') && <RiLock2Fill className="ml-1 inline-block" />}
                            </h3>
                            <h4 className="inline-block text-md font-bold text-gray-600">{d._source.name}</h4>
                          </div>
                          <div className="mt-2 text-sm">{d._source.description}</div>
                        </div>
                      </div>
                    </a>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <></>
          )}
          {typeValidated === 'users' && data.esSearch.Users ? (
            <div>
              {data.esSearch.Users.hits.hits.map((d) => (
                <div key={`search-users-${d._id}`}>
                  <Link href={`/users/${encodeURIComponent(d._source.username.toLowerCase())}`} passHref>
                    <a className="hover:text-green-700">
                      <div className="m-4 flex rounded-lg border p-2">
                        <Image
                          src={`/api/files/usericons/${encodeURIComponent(d._id.toLowerCase())}`}
                          width={60}
                          height={60}
                          alt={d._source.username}
                          className="rounded-lg"
                        />
                        <div className="ml-2 flex-1 break-words">
                          <div className="border-b-1">
                            <h3 className="mr-2 inline-block text-lg font-bold">{d._source.displayName || d._source.username}</h3>
                            <h4 className="inline-block text-md font-bold text-gray-600">{d._source.username}</h4>
                          </div>
                          <div className="mt-2 text-sm">{d._source.description}</div>
                        </div>
                      </div>
                    </a>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  )
}
