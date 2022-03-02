import { Layout } from '@components/layouts'
import Link from 'next/link'
import { useSessionQuery, useMyTimelineCpQuery } from '@graphql/generated/react-apollo'
import { RiCompasses2Line } from 'react-icons/ri'
import { DocListItem } from '@components/docListItem'

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
      <div className="m-2 p-2">
        <ul role="list" className="relative z-0 divide-y divide-gray-200 border-b border-t border-gray-200">
          {nodes.map((doc) => (
            <DocListItem
              key={doc.id}
              id={doc.id}
              title={doc.paper.title}
              href={`/docs/${encodeURIComponent(doc.id.toLowerCase())}`}
              groupName={doc.paper.group.displayName || doc.paper.group.name}
              userId={doc.paper.user.id}
              userName={doc.paper.user.username}
              userHref={`/users/${encodeURIComponent(doc.paper.user.username)}`}
              groupHref={`/groups/${encodeURIComponent(doc.paper.group.name.toLowerCase())}`}
              updatedAt={doc.paper.updatedAt}
            />
          ))}
        </ul>

        {pageInfo.hasNextPage && (
          <div className="mt-6 text-center">
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
