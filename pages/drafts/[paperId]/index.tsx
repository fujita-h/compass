import { NextRouter, useRouter } from 'next/router'
import { useState } from 'react'
import Link from 'next/link'
import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import { MyModal } from '@components/modals'
import { getAsString } from '@lib/utils'
import { DraftQuery, useDeleteDraftMutation, useDraftQuery } from '@graphql/generated/react-apollo'
import { UserIconNameLinkSmall } from '@components/elements'
import { BsThreeDots, BsTags } from 'react-icons/bs'
import { GrEdit } from 'react-icons/gr'
import { RiDeleteBin6Line } from 'react-icons/ri'
import dynamic from 'next/dynamic'

const MarkdownParser = dynamic(() => import('@components/markdown/markdownParser'))
const MarkdownReactiveTocParser = dynamic(() => import('@components/markdown/markdownReactiveTocParser'))

export default function Page() {
  const session = useSession({ redirectTo: '/login' })
  const router = useRouter()
  const paperId = getAsString(router.query?.paperId)

  if (!session?.id) return <Layout></Layout>
  if (!paperId) return <Layout></Layout>

  return (
    <Layout>
      <InnerPage router={router} sessionUserId={session.id} paperId={paperId} />
    </Layout>
  )
}

const InnerPage = ({ router, sessionUserId, paperId }: { router: NextRouter; sessionUserId: string; paperId: string }) => {
  const { data, loading } = useDraftQuery({ variables: { auth: 'user', id: paperId } })

  const [subMenuOpen, setSubMenuOpen] = useState(false)
  const [deleteModalState, setDeleteModalState] = useState(false)

  const [deleteDraft] = useDeleteDraftMutation()

  const handleDelete = (e) => {
    deleteDraft({
      variables: { auth: 'user', id: data.draft.id },
      onCompleted: (data) => {
        router.push(`/groups/${encodeURIComponent(data.deletePaper.group.name.toLowerCase())}`)
      },
    })
    setDeleteModalState(false)
  }

  if (loading) return <></>
  if (!data.draft) {
    return <div className="text-red-500">{paperId} Not Found.</div>
  }

  return (
    <div>
      <div className="mx-auto max-w-7xl">
        <div className="border-l-4 border-red-400 bg-red-100">
          <div className="mt-3 p-4">
            <span className="text-lg">これは下書きです。</span>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl">
        <div className="flex-1">
          <div className="bg-white">
            <div className="mt-3 p-2">
              <div className="flex place-content-between">
                <div>
                  <Link href={`/groups/${encodeURIComponent(data.draft.group.name)}`} passHref>
                    <a>
                      <div className="mb-2 inline-block bg-red-200 px-3">{data.draft.group.displayName || data.draft.group.name}</div>
                    </a>
                  </Link>
                  <div>
                    <UserIconNameLinkSmall userId={data.draft.user.id} username={data.draft.user.username} />
                  </div>
                  <div>
                    投稿日: {new Date(data.draft.createdAt).toLocaleString()} 更新日: {new Date(data.draft.updatedAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  {sessionUserId == data.draft.user.id ? (
                    <div>
                      <div
                        className="relative inline-block hover:cursor-pointer"
                        onClick={(e) => e.currentTarget.focus}
                        onBlur={(e) => {
                          if (!e.currentTarget.contains(e.relatedTarget)) {
                            setSubMenuOpen(false)
                          }
                        }}
                        tabIndex={0}
                      >
                        {/* menu button */}
                        <div className="h-8 w-8 rounded-md border p-1 hover:bg-gray-100" onClick={() => setSubMenuOpen(!subMenuOpen)}>
                          <BsThreeDots className="h-full w-full" />
                        </div>
                        {/* menu list */}
                        <div
                          hidden={!subMenuOpen}
                          className="absolute right-0 z-40 mt-1 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-10"
                        >
                          <div
                            onClick={() => {
                              setSubMenuOpen(false)
                            }}
                          >
                            <Link href={`/drafts/${encodeURIComponent(paperId.toLowerCase())}/edit`} passHref>
                              <a>
                                <span className="block px-4 py-2 hover:bg-gray-100">
                                  <GrEdit className="mr-2 inline-block" />
                                  <span className="align-middle">編集</span>
                                </span>
                              </a>
                            </Link>
                            <span className="block border-b"></span>
                            <span
                              className="block px-4 py-2 hover:bg-gray-100"
                              onClick={() => {
                                setDeleteModalState(true)
                              }}
                            >
                              <RiDeleteBin6Line className="mr-2 inline-block" />
                              <span className="align-middle">削除</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <MyModal
                        show={deleteModalState}
                        close={() => {
                          setDeleteModalState(false)
                        }}
                        title="ドキュメントの削除"
                      >
                        <div className="ml-4">
                          <div>削除すると元に戻すことは出来ません。</div>
                          <div className="mt-2">この下書きを削除しますか？</div>
                        </div>
                        <div className="mt-3 flex justify-between">
                          <button
                            className="border bg-gray-200 px-2 py-1"
                            onClick={() => {
                              setDeleteModalState(false)
                            }}
                          >
                            キャンセル
                          </button>
                          <button className="border bg-red-200 px-2 py-1" onClick={handleDelete}>
                            削除する
                          </button>
                        </div>
                      </MyModal>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
              <h1 className="font-meduim mt-1 mb-4 text-3xl">{data.draft.title}</h1>
              <div>
                <BsTags className="mr-2 inline-block h-5 w-5 text-gray-600" />
                {data.draft.tags
                  .split(',')
                  .filter((tag) => tag !== '')
                  .map((tag) => (
                    <span key={`tag-${tag}`} className="mx-1 rounded-md bg-blue-50 px-2 py-1">
                      {tag}
                    </span>
                  ))}
              </div>
            </div>
            <div className="p-2">
              <MarkdownParser addHeaderAnchor={true}>{data.draft.body}</MarkdownParser>
            </div>
          </div>
        </div>
        <div className="ml-4 mt-2 w-60 flex-none">
          <RightPane userId={sessionUserId} draftQuery={data} />
        </div>
      </div>
    </div>
  )
}

const RightPane = ({ userId, draftQuery }: { userId: string; draftQuery: DraftQuery }) => {
  return (
    <div className="sticky top-16">
      <div className="mt-2">
        <MarkdownReactiveTocParser>{draftQuery.draft.body}</MarkdownReactiveTocParser>
      </div>
    </div>
  )
}
