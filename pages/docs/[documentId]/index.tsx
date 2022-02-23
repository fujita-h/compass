import { NextRouter, useRouter } from 'next/router'
import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import { getAsString } from '@lib/utils'
import { Dispatch, MouseEventHandler, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { GrEdit } from 'react-icons/gr'
import { BsBookmark, BsBookmarkCheckFill, BsThreeDots, BsTags } from 'react-icons/bs'
import { IoReturnUpForward } from 'react-icons/io5'
import { AiOutlineLike, AiFillLike } from 'react-icons/ai'
import { RiDeleteBin6Line } from 'react-icons/ri'
import {
  CommentsDocument,
  DocumentQuery,
  LikesDocument,
  StockCategoriesAndStocksDocument,
  useCommentQuery,
  useCommentsQuery,
  useCreateCommentMutation,
  useCreateLikeMutation,
  useCreateStockCategoryMutation,
  useCreateStockMutation,
  useDeleteCommentMutation,
  useDeleteDocumentMutation,
  useDeleteLikeMutation,
  useDeleteStockMutation,
  useDocumentQuery,
  useLikesQuery,
  useReadMutation,
  useStockCategoriesAndStocksQuery,
  useUpdateCommentMutation,
} from '@graphql/generated/react-apollo'
import { MyModal } from '@components/modals'
import { UserIconNameLinkSmall } from '@components/elements'
import { XIcon } from '@heroicons/react/solid'
import { updatePageViews } from '@lib/localStorage/pageViews'

import dynamic from 'next/dynamic'

const MarkdownParser = dynamic(() => import('@components/markdown/markdownParser'))
const MarkdownReactiveTocParser = dynamic(() => import('@components/markdown/markdownReactiveTocParser'))
const MarkdownTextParser = dynamic(() => import('@components/markdown/markdownTextParser'))

export default function Page() {
  const session = useSession({ redirectTo: '/login' })
  const router = useRouter()
  const documentId = getAsString(router.query?.documentId)

  if (!session?.id) return <Layout></Layout>
  if (!documentId) return <Layout></Layout>
  return (
    <Layout>
      <InnerPage router={router} sessionUserId={session.id} documentId={documentId} />
    </Layout>
  )
}

const InnerPage = ({ router, sessionUserId, documentId }: { router: NextRouter; sessionUserId: string; documentId: string }) => {
  const { data, loading } = useDocumentQuery({ variables: { documentId } })

  const [read] = useReadMutation()

  useEffect(() => {
    if (documentId) {
      read({ variables: { auth: 'user', documentId: documentId } })
    }
  }, [documentId])

  useEffect(() => {
    if (!data?.document?.paper?.group?.name) return
    updatePageViews('group', data?.document?.paper?.group?.name)
  }, [data?.document?.paper?.group?.name])

  const [subMenuOpen, setSubMenuOpen] = useState(false)
  const [deleteModalState, setDeleteModalState] = useState(false)

  const [deleteDocument] = useDeleteDocumentMutation({
    onCompleted: (data) => {
      const groupName = data.deleteDocument?.paper?.group?.name
      router.push(`/groups/${encodeURIComponent(groupName)}`)
    },
  })

  if (loading) return <></>
  if (!data.document) {
    return <div className="text-red-500">{documentId} Not Found.</div>
  }

  const handleDeleteDocument = (e) => {
    deleteDocument({ variables: { auth: 'user', id: data.document.id } })
    setDeleteModalState(false)
  }

  return (
    <div className="mx-auto flex max-w-7xl">
      <div className="flex-1">
        <div className="bg-white">
          <div className="mt-3 p-4">
            <div className="flex place-content-between">
              <div>
                <Link href={`/groups/${encodeURIComponent(data.document.paper.group.name)}`} passHref>
                  <a>
                    <div className="mb-2 inline-block bg-red-200 px-3">
                      {data.document.paper.group.displayName || data.document.paper.group.name}
                    </div>
                  </a>
                </Link>
                <div>
                  <UserIconNameLinkSmall userId={data.document.paper.user.id} username={data.document.paper.user.username} />
                </div>
                <div>
                  投稿日: {new Date(data.document.createdAt).toLocaleString()} 更新日:{' '}
                  {new Date(data.document.paper.updatedAt).toLocaleString()}
                </div>
              </div>
              <div>
                {sessionUserId == data.document.paper.user.id ? (
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
                          <Link href={`/docs/${encodeURIComponent(documentId.toLowerCase())}/edit`} passHref>
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
                        <div>削除すると元に戻すことは出来ません。また、コメント、ストックの情報もすべて削除されます。</div>
                        <div className="mt-2">このドキュメントを削除しますか？</div>
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
                        <button className="border bg-red-200 px-2 py-1" onClick={handleDeleteDocument}>
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
            <h1 className="mt-1 mb-4 text-3xl font-medium">{data.document.paper.title}</h1>
            <div>
              <BsTags className="mr-2 inline-block h-5 w-5 text-gray-600" />
              {data.document.paper.tags
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
            <MarkdownParser addHeaderAnchor={true}>{data.document.paper.body}</MarkdownParser>
          </div>
        </div>
        <div className="mt-8 mb-8 bg-white p-4">
          <h2 className="mb-4 border-b text-2xl font-meduim">コメント</h2>
          <CommentsView userId={sessionUserId} documentId={documentId} />
        </div>
      </div>
      <div className="ml-4 w-60 flex-none hidden lg:block">
        <RightPane userId={sessionUserId} documentQuery={data} />
      </div>
    </div>
  )
}

const RightPane = ({ userId, documentQuery }: { userId: string; documentQuery: DocumentQuery }) => {
  return (
    <div className="sticky top-16">
      <div className="m-2 flex gap-1">
        <StockBadge userId={userId} documentId={documentQuery.document.id} />
        <LikeBadge userId={userId} documentId={documentQuery.document.id} />
      </div>
      <div className="mt-2">
        <MarkdownReactiveTocParser>{documentQuery.document.paper.body}</MarkdownReactiveTocParser>
      </div>
    </div>
  )
}

const StockBadge = ({ userId, documentId }: { userId: string; documentId: string }) => {
  const [modalState, setModalState] = useState({ show: false })
  const { data, loading } = useStockCategoriesAndStocksQuery({ variables: { auth: 'user', userId: userId, documentId: documentId } })

  // ストックの更新用
  const [createStock] = useCreateStockMutation({
    refetchQueries: [StockCategoriesAndStocksDocument],
  })
  const [deleteStock] = useDeleteStockMutation({
    refetchQueries: [StockCategoriesAndStocksDocument],
  })
  const handleStockCheckboxCanged = (e) => {
    const stockCategoryId = e.target.dataset.categoryid
    if (e.target.checked) {
      createStock({
        variables: {
          auth: 'user',
          userId: userId,
          documentId: documentId,
          stockCategoryId: stockCategoryId,
        },
      })
    } else {
      deleteStock({
        variables: {
          auth: 'user',
          userId: userId,
          documentId: documentId,
          stockCategoryId: stockCategoryId,
        },
      })
    }
  }

  // 新規のカテゴリ作成用
  const [newCategoryName, setNewCategoryName] = useState('')
  const [createStockCategory] = useCreateStockCategoryMutation({
    refetchQueries: [StockCategoriesAndStocksDocument],
  })
  const handleNewCategoryNameChanged = (e) => {
    setNewCategoryName(e.target.value)
  }
  const handleCreateNewCategory = (e) => {
    createStockCategory({ variables: { auth: 'user', userId: userId, name: newCategoryName } })
  }

  //if (loading) return (<></>)
  if (!data) return <></>

  return (
    <div>
      <div
        className="inline-block rounded-xl px-3 py-1 text-center text-green-700 outline-green-700 hover:cursor-pointer hover:outline"
        onClick={() => {
          setModalState({ ...modalState, show: true })
        }}
      >
        <span className="text-sm font-meduim">Stock</span>
        {data.stocks.some((stock) => stock.userId.toLocaleUpperCase() == userId.toUpperCase()) ? (
          <BsBookmarkCheckFill className="mx-auto block h-7 w-7" />
        ) : (
          <BsBookmark className="mx-auto block h-7 w-7" />
        )}
        <span className="text-sm font-meduim">{data.countStocks}</span>
      </div>
      <MyModal
        show={modalState.show}
        title="ストックするカテゴリー"
        close={() => {
          setModalState({ ...modalState, show: false })
        }}
      >
        <div>
          {data.stockCategories.map((category) => (
            <div key={`stockCategory-${category.id}`}>
              <input
                type="checkbox"
                id={`stockCategory-checkbox-${category.id}`}
                className="mr-3 h-4 w-4 align-middle"
                data-categoryid={category.id}
                checked={data.stocks.some((stock) => stock.stockCategoryId == category.id)}
                onChange={handleStockCheckboxCanged}
              />
              <label htmlFor={`stockCategory-checkbox-${category.id}`} className="align-middle">
                {category.name}
              </label>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <input type="text" className="w-60 rounded-md border p-2" value={newCategoryName} onChange={handleNewCategoryNameChanged}></input>
          <button className="mx-2 rounded-lg border bg-blue-200 p-2" onClick={handleCreateNewCategory}>
            <span>新しいカテゴリを作成</span>
          </button>
        </div>
      </MyModal>
    </div>
  )
}

const LikeBadge = ({ userId, documentId }: { userId: string; documentId: string }) => {
  const { data, loading } = useLikesQuery({ variables: { auth: 'user', documentId: documentId } })
  const [createLike] = useCreateLikeMutation({
    refetchQueries: [LikesDocument],
  })
  const [deleteLike] = useDeleteLikeMutation({
    refetchQueries: [LikesDocument],
  })

  const isLiked = useMemo(() => data?.likes?.find((like) => like.userId.toUpperCase() === userId.toUpperCase()), [data])
  const countLikes = useMemo(() => data?.likes.length, [data])

  const handleClick = (e) => {
    if (isLiked) {
      deleteLike({ variables: { auth: 'user', userId: userId, documentId: documentId } })
    } else {
      createLike({ variables: { auth: 'user', userId: userId, documentId: documentId } })
    }
  }

  if (loading) return <></>
  if (!data) return <></>

  return (
    <div
      className="inline-block rounded-xl px-3 py-1 text-center text-pink-600 outline-pink-600 hover:cursor-pointer hover:outline"
      onClick={handleClick}
      data-isliked={isLiked}
    >
      <span className="text-sm font-meduim"> Like </span>
      {isLiked ? <AiFillLike className="mx-auto block h-7 w-7" /> : <AiOutlineLike className="mx-auto block h-7 w-7" />}
      <span className="text-sm font-meduim">{countLikes}</span>
    </div>
  )
}

const CommentsView = ({ userId, documentId }: { userId: string; documentId: string }) => {
  const { data, loading } = useCommentsQuery({ variables: { auth: 'user', documentId } })
  const [refCommentId, setRefCommentId] = useState('')
  const [featureCommentId, setFeatureCommentId] = useState('')

  const handleResetfeature = (e) => {
    if (e.currentTarget?.dataset?.commentid?.toLowerCase() == featureCommentId.toLowerCase()) {
      setFeatureCommentId('')
    }
  }

  if (loading) return <></>
  if (!data) return <></>

  return (
    <div>
      <div>
        {data.comments.map((comment) => {
          const feaColoredBorder = comment.id.toUpperCase() === featureCommentId.toUpperCase() ? 'border-blue-300 border-2' : ''
          const refColoredBorder = comment.id.toUpperCase() === refCommentId.toUpperCase() ? 'border-red-300 border-2' : ''
          return (
            <div
              key={`document-comment-${comment.id}`}
              className={`m-1 border p-2 ${feaColoredBorder} ${refColoredBorder}`}
              data-commentid={comment.id}
              onClick={handleResetfeature}
            >
              <CommentView
                commentId={comment.id}
                userId={comment.user.id}
                username={comment.user.username}
                createdAt={comment.createdAt}
                rawCreatedAt={comment.comment_raw.createdAt}
                body={comment.comment_raw.body}
                refCommentId={comment.referenceCommentIdLazy}
                setRefCommentId={setRefCommentId}
                setFeatureCommentId={setFeatureCommentId}
              />
            </div>
          )
        })}
      </div>
      <div id="postNewComment">
        <PostComment userId={userId} documentId={documentId} refCommentId={refCommentId} setRefCommentId={setRefCommentId} />
      </div>
    </div>
  )
}

const CommentView = ({
  commentId,
  userId,
  username,
  createdAt,
  rawCreatedAt,
  body,
  refCommentId,
  setRefCommentId,
  setFeatureCommentId,
}: {
  commentId: string
  userId: string
  username: string
  createdAt: string
  rawCreatedAt: string
  body: string
  refCommentId: string
  setRefCommentId: Dispatch<SetStateAction<string>>
  setFeatureCommentId: Dispatch<SetStateAction<string>>
}) => {
  const [editorModeState, setEditorModeState] = useState(false)
  const [deleteModalState, setDeleteModalState] = useState(false)
  const [subMenuOpen, setSubMenuOpen] = useState(false)
  const [bodyText, setBodyText] = useState(body)
  const [updateComment] = useUpdateCommentMutation({
    refetchQueries: [CommentsDocument],
    onCompleted: () => setEditorModeState(false),
  })
  const [deleteComment] = useDeleteCommentMutation({
    refetchQueries: [CommentsDocument],
    onCompleted: () => setDeleteModalState(false),
  })

  const handleEditSubmit = (e) => {
    updateComment({
      variables: {
        auth: 'user',
        id: commentId,
        body: bodyText,
      },
    })
  }

  const handleFeatureComment = (e) => {
    e.stopPropagation()
    setFeatureCommentId(refCommentId)
    document.getElementById('comment-' + refCommentId.toLowerCase()).scrollIntoView()
  }

  const handleReply = (e) => {
    setRefCommentId(commentId)
    document.getElementById('postNewComment').scrollIntoView()
    setSubMenuOpen(false)
  }

  return (
    <div>
      <div id={`comment-${commentId.toLowerCase()}`} hidden={editorModeState}>
        {refCommentId ? (
          <div className="flex text-gray-500">
            <div className="mr-2 flex-none">
              <IoReturnUpForward className="ml-2 mr-2 inline-block h-6 w-6" />
              <span>返信元:</span>
            </div>
            <div className="mr-10 inline-block flex-1 bg-gray-100 align-bottom hover:cursor-pointer" onClick={handleFeatureComment}>
              <CommentSummary commentId={refCommentId} />
            </div>
          </div>
        ) : (
          <></>
        )}
        <div className="flex justify-between">
          <div>
            <UserIconNameLinkSmall userId={userId} username={username} />
          </div>
          <div>
            <div className="mr-2 inline-block align-top">
              {new Date(createdAt).toLocaleString()}
              {createdAt == rawCreatedAt ? '' : ' (編集済み)'}
            </div>

            {/* sub-menu */}
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
              <div className="h-6 w-6 border p-1" onClick={() => setSubMenuOpen(!subMenuOpen)}>
                <BsThreeDots className="h-full w-full" />
              </div>
              {/* menu list */}
              <div
                hidden={!subMenuOpen}
                className="absolute right-0 z-40 mt-1 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-10"
              >
                <div>
                  <span className="block px-4 py-2 hover:bg-gray-100" onClick={handleReply}>
                    このコメントに返信
                  </span>
                  <span className="block border-b"></span>
                  <span className="block px-4 py-2 hover:bg-gray-100" onClick={() => setEditorModeState(true)}>
                    編集
                  </span>
                  <span className="block border-b"></span>
                  <span className="block px-4 py-2 hover:bg-gray-100" onClick={() => setDeleteModalState(true)}>
                    削除
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <MarkdownParser>{body}</MarkdownParser>
        </div>
      </div>

      <div hidden={!editorModeState}>
        <CommentEditForm
          bodyText={bodyText}
          setBodyText={setBodyText}
          submitButtonLabel="コメントを修正"
          handleSubmit={handleEditSubmit}
          handleCancelButton={() => {
            setEditorModeState(false)
          }}
        />
      </div>

      <MyModal
        show={deleteModalState}
        close={() => {
          setDeleteModalState(false)
        }}
        title="コメントの削除"
      >
        <div>コメントを削除しますか？</div>
        <div className="mt-3 flex justify-between">
          <button
            className="border bg-gray-200 px-2 py-1"
            onClick={() => {
              setDeleteModalState(false)
            }}
          >
            キャンセル
          </button>
          <button
            className="border bg-red-200 px-2 py-1"
            onClick={() => {
              deleteComment({ variables: { auth: 'user', id: commentId } })
            }}
          >
            削除する
          </button>
        </div>
      </MyModal>
    </div>
  )
}

const PostComment = ({
  userId,
  documentId,
  refCommentId,
  setRefCommentId,
}: {
  userId: string
  documentId: string
  refCommentId?: string
  setRefCommentId?: Dispatch<SetStateAction<string>>
}) => {
  const [bodyText, setBodyText] = useState('')
  const [postComment] = useCreateCommentMutation({
    refetchQueries: [CommentsDocument],
  })

  const handleSubmit = (e) => {
    postComment({
      variables: {
        auth: 'user',
        userId,
        documentId,
        body: bodyText,
        referenceCommentIdLazy: refCommentId ? refCommentId : undefined,
      },
      onCompleted: (data) => {
        setBodyText('')
        setRefCommentId('')
      },
    })
  }

  return (
    <CommentEditForm
      bodyText={bodyText}
      setBodyText={setBodyText}
      refCommentId={refCommentId}
      setRefCommentId={setRefCommentId}
      submitButtonLabel="投稿"
      handleSubmit={handleSubmit}
    />
  )
}

const CommentEditForm = ({
  bodyText,
  setBodyText,
  refCommentId,
  setRefCommentId,
  submitButtonLabel,
  handleSubmit,
  handleCancelButton,
}: {
  bodyText: string
  setBodyText: Dispatch<SetStateAction<string>>
  refCommentId?: string
  setRefCommentId?: Dispatch<SetStateAction<string>>
  submitButtonLabel: string
  handleSubmit: MouseEventHandler<HTMLButtonElement>
  handleCancelButton?: MouseEventHandler<HTMLButtonElement>
}) => {
  const [selectedTab, setSelectedTab] = useState(0)
  const handleTextChanged = (e) => {
    setBodyText(e.target.value)
  }

  const editTabClass = selectedTab == 0 ? 'border-blue-600' : ''
  const previewTabClass = selectedTab == 1 ? 'border-blue-600' : ''

  return (
    <div className="p-3">
      <ul className="mb-2 flex list-none flex-col flex-wrap border-b-0 pl-0 md:flex-row">
        <li className="flex-none">
          <div
            className={`my-2 block border-x-0 border-t-0 border-b-2 border-transparent px-6 py-3 hover:cursor-pointer hover:bg-gray-100 ${editTabClass}`}
            onClick={() => {
              setSelectedTab(0)
            }}
          >
            <span>編集</span>
          </div>
        </li>
        <li className="flex-none">
          <div
            className={`my-2 block border-x-0 border-t-0 border-b-2 border-transparent px-6 py-3 hover:cursor-pointer hover:bg-gray-100 ${previewTabClass}`}
            onClick={() => {
              setSelectedTab(1)
            }}
          >
            <span>プレビュー</span>
          </div>
        </li>
        {handleCancelButton ? (
          <li className="flex-grow">
            <div className="my-2 block pt-6 text-right">
              <button type="button" className="" onClick={handleCancelButton}>
                <XIcon className="h-6 w-6 rounded-md border-1 text-gray-600" />
              </button>
            </div>
          </li>
        ) : (
          <></>
        )}
      </ul>
      <div className="min-h-[100px]">
        <div hidden={selectedTab !== 0}>
          <textarea
            className="m-1 h-full min-h-[80px] w-full border p-3"
            value={bodyText}
            onChange={handleTextChanged}
            onInput={(e) => {
              e.currentTarget.style.height = '80px'
              e.currentTarget.style.height = e.currentTarget.scrollHeight + 5 + 'px'
            }}
          ></textarea>
        </div>
        <div hidden={selectedTab !== 1}>
          <div className="m-1 inline-block h-full min-h-[80px] w-full border p-0">
            <MarkdownParser>{bodyText}</MarkdownParser>
          </div>
        </div>
      </div>
      <div className="flex justify-between gap-20">
        <div>
          {refCommentId && setRefCommentId ? (
            <div>
              <div className="mb-1">
                <span>以下に返信</span>
                <button
                  className="ml-3 rounded-lg border bg-blue-200 px-2 py-1 hover:bg-blue-300"
                  onClick={() => {
                    setRefCommentId('')
                  }}
                >
                  取り消す
                </button>
              </div>
              <div className="bg-gray-100">
                <span>
                  <a href={`#comment-${refCommentId.toLowerCase()}`}>
                    <CommentSummary commentId={refCommentId} />
                  </a>
                </span>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
        <div className="flex-none">
          <button className="rounded-lg border bg-blue-100 px-2 py-2" onClick={handleSubmit}>
            {submitButtonLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

const CommentSummary = ({ commentId }) => {
  const { data, loading } = useCommentQuery({ variables: { auth: 'user', id: commentId } })

  if (loading) return <span></span>
  if (!data) return <span>削除されたコメント</span>

  return (
    <div className="line-clamp-1">
      <div className="mr-2 inline-block">
        <UserIconNameLinkSmall userId={data.comment.user.id} username={data.comment.user.username} />
      </div>
      <span className="from-neutral-700 text-sm">
        <MarkdownTextParser slice={300}>{data.comment.comment_raw.body}</MarkdownTextParser>
      </span>
    </div>
  )
}
