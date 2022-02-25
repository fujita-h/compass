import { Layout } from '@components/layouts'
import Link from 'next/link'
import { useSessionQuery, useMyTimelineCpQuery, useMyJoinedGroupsCpQuery } from '@graphql/generated/react-apollo'
import { UserIconNameLinkSmall } from '@components/elements'
import { RiCompasses2Line } from 'react-icons/ri'

export default function Page() {
  // Indexページはログインの有無でページを切り替える必要があるので、errorPolicy:all
  const { data, loading, refetch } = useSessionQuery({ errorPolicy: 'all' })
  if (loading) return <Layout />

  // userSession が無ければ、未ログイン
  if (!data.session.userSession) {
    return (
      <Layout>
        <div className="mt-12 flex justify-center">
          <div>
            <div>
              <RiCompasses2Line className="inline-block h-20 w-20" />
              <span className="font-meduim align-middle text-3xl">Compass</span>
            </div>
            <div className="mt-6">
              <Link href="/login" passHref>
                <a>
                  <div className="rounded-lg bg-blue-100 px-4 py-2 text-center text-xl">
                    <span>Login to Start</span>
                  </div>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="my-4 w-full px-8">
        <Timeline />
      </div>
    </Layout>
  )
}

const Timeline = () => {
  const { data, loading, fetchMore } = useMyTimelineCpQuery({
    variables: { first: 20 },
    fetchPolicy: 'network-only',
  })
  if (loading) return <></>
  const nodes = data.myTimelineCP.edges.map((edge) => edge.node)
  const pageInfo = data.myTimelineCP.pageInfo

  if (nodes.length == 0) {
    return <WelcomeMessage />
  }

  return (
    <>
      <h1 className="border-b-1 text-2xl">タイムライン</h1>
      <div className="flex flex-wrap">
        {nodes.map((doc) => (
          <div key={`docs-${doc.id}`} className="w-full max-w-4xl lg:w-full 2xl:w-1/2">
            <Link href={`/docs/${encodeURIComponent(doc.id.toLowerCase())}`} passHref>
              <a className="hover:text-green-700">
                <div className="m-2 border bg-white p-2">
                  <Link href={`/groups/${encodeURIComponent(doc.paper.group.name)}`} passHref>
                    <div className="mb-1 inline-block bg-red-100 px-2 text-black hover:underline">
                      {doc.paper.group.displayName || doc.paper.group.name}
                    </div>
                  </Link>
                  <div className="text-black">
                    <UserIconNameLinkSmall userId={doc.paper.user.id} username={doc.paper.user.username} />
                    <div className="ml-2 inline-block">
                      <span>が{new Date(doc.createdAt).toLocaleString()} に投稿</span>
                      {doc.createdAt !== doc.paper.updatedAt ? (
                        <span className="ml-2 text-sm">{new Date(doc.paper.updatedAt).toLocaleString()} に更新</span>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                  <div className="font-meduim text-lg">{doc.paper.title || 'UNTITLED'}</div>
                </div>
              </a>
            </Link>
          </div>
        ))}
        {pageInfo.hasNextPage && (
          <div className="w-full text-center">
            <button
              className="rounded-md border bg-gray-100 px-4 py-2"
              onClick={() => {
                fetchMore({ variables: { after: pageInfo.endCursor } })
              }}
            >
              もっと読み込む
            </button>
          </div>
        )}
      </div>
    </>
  )
}

const WelcomeMessage = () => {
  return (
    <div>
      <div className="rounded-lg bg-white p-4">
        <div className="text-3xl">Welcome to Compass</div>
        <div>Compass へようこそ。</div>
        <div className="mt-4 border-b text-2xl">興味のあるグループを ウォッチ する</div>
        <div className="ml-4 mt-2">
          <div>
            Compass のドキュメントは必ずいずれかのグループに属しています。
            <br />
            興味のあるグループを ウォッチ することで、そのグループの新着記事がトップページに記事が表示されるようになります。
          </div>
          <Link href={`search?type=groups`}>
            <div className="mt-2 w-52 rounded-lg border-2 border-blue-200 bg-blue-100 p-1 text-center text-lg hover:cursor-pointer hover:border-blue-400">
              グループを探す
            </div>
          </Link>
        </div>
        <div className="mt-4 border-b text-2xl">興味のあるユーザーを フォロー する</div>
        <div className="ml-4 mt-2">
          <div>
            特定のユーザーの記事に興味がありますか?
            <br />
            興味のあるユーザーを フォロー することで、そのユーザーの新着記事がトップページに記事が表示されるようになります。
          </div>
          <Link href={`search?type=users`}>
            <div className="mt-2 w-52 rounded-lg border-2 border-blue-200 bg-blue-100 p-1 text-center text-lg hover:cursor-pointer hover:border-blue-400">
              ユーザーを探す
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
