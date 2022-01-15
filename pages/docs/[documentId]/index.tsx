import { useRouter } from 'next/router'
import { useSession } from '@lib/session'
import { Layout } from '@components/layouts'
import { getAsString } from '@lib/utils'
import { Dispatch, MouseEventHandler, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from "react-markdown"
import gfm from 'remark-gfm'
import Link from 'next/link'
import { GrEdit } from 'react-icons/gr'
import { BsBookmark, BsBookmarkCheckFill, BsThreeDots } from 'react-icons/bs'
import { IoReturnUpForward } from 'react-icons/io5'
import { AiOutlineLike, AiFillLike } from 'react-icons/ai'
import {
  Auth, CommentsDocument, DocumentPageQuery, LikesDocument, StockCategoriesAndStocksDocument, useCommentQuery,
  useCommentsQuery, useCreateCommentMutation, useCreateLikeMutation, useCreateStockCategoryMutation, useCreateStockMutation,
  useDeleteCommentMutation, useDeleteLikeMutation, useDeleteStockMutation, useDocumentPageQuery, useLikesQuery,
  useStockCategoriesAndStocksQuery, useUpdateCommentMutation
} from "@graphql/generated/react-apollo"
import { MyModal } from '@components/modals'
import { UserIconNameLinkSmall } from '@components/elements'
import { XIcon } from '@heroicons/react/solid'

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

const CONTENT_ANCHOR_PREFIX = 'content-line'
const CONTENT_ANCHOR_CLASS_NAME = 'doc-content-lines'

export default function Page() {
  const session = useSession({ redirectTo: "/login" })
  const router = useRouter()
  const documentId = getAsString(router.query?.documentId)

  if (!session?.id) return (<Layout></Layout>)
  if (!documentId) return (<Layout></Layout>)
  return (<Layout><InnerPage sessionUserId={session.id} documentId={documentId} /></Layout>)
}

const InnerPage = ({ sessionUserId, documentId }: { sessionUserId: string, documentId: string }) => {
  const { data, loading } = useDocumentPageQuery({ variables: { documentId } })

  const H1 = useCallback(({ node, ...props }) => <h1 id={`${CONTENT_ANCHOR_PREFIX}-${node.position?.start.line.toString()}`} className={CONTENT_ANCHOR_CLASS_NAME}>{props.children}</h1>, [])
  const H2 = useCallback(({ node, ...props }) => <h2 id={`${CONTENT_ANCHOR_PREFIX}-${node.position?.start.line.toString()}`} className={CONTENT_ANCHOR_CLASS_NAME}>{props.children}</h2>, [])

  if (loading) return (<></>)
  if (!data.document) {
    return (
      <div className="text-red-500">{documentId} Not Found.</div>
    )
  }

  return (
    <div className='max-w-7xl mx-auto flex'>
      <div className='flex-1'>
        <div className='bg-white'>
          <div className='mt-3 p-2'>
            <div className='flex place-content-between'>
              <div>
                <Link href={`/groups/${encodeURIComponent(data.document.Paper.Group.name)}`} passHref><a>
                  <div className='mb-2 px-3 inline-block bg-red-200'>{data.document.Paper.Group.displayName || data.document.Paper.Group.name}</div>
                </a></Link>
                <div>
                  <UserIconNameLinkSmall userId={data.document.Paper.User.id} username={data.document.Paper.User.username} />
                </div>
                <div>投稿日: {new Date(data.document.Paper.createdAt).toLocaleString()} 更新日: {new Date(data.document.Paper.updatedAt).toLocaleString()}</div>
              </div>
              <div>
                {sessionUserId == data.document.Paper.User.id &&
                  <div><Link href={`/docs/${encodeURIComponent(documentId.toLowerCase())}/edit`} passHref><a><div className='border rounded-md m-1 p-2 bg-orange-100 text-center'><GrEdit className='w-6 h-6 block mx-auto' /><span>Edit</span></div></a></Link></div>}
              </div>
            </div>
            <h1 className='text-3xl font-bold mt-1 mb-4'>
              {data.document.Paper.title}
            </h1>
          </div>
          <div className='p-2'>
            <ReactMarkdown className='markdown' remarkPlugins={[gfm]} unwrapDisallowed={false} components={{ h1: H1, h2: H2 }}>{data.document.Paper.body}</ReactMarkdown>
          </div>
        </div>
        <div className='mt-8 mb-8 p-4 bg-white'>
          <h2 className='text-2xl font-bold border-b mb-4'>コメント</h2>
          <CommentsView userId={sessionUserId} documentId={documentId} />
        </div>
      </div>
      <div className='flex-none w-60 ml-4'>
        <RightPane userId={sessionUserId} documentPageQuery={data} />
      </div>

    </div>
  )
}

const RightPane = ({ userId, documentPageQuery }: { userId: string, documentPageQuery: DocumentPageQuery }) => {
  return (
    <div className='sticky top-16'>
      <div className='m-2 flex gap-1'>
        <StockBadge userId={userId} documentId={documentPageQuery.document.id} />
        <LikeBadge userId={userId} documentId={documentPageQuery.document.id} />
      </div>
      <div className='mt-2'>
        <ReactiveToC>{documentPageQuery.document.Paper.body}</ReactiveToC>
      </div>
    </div>

  )
}

const StockBadge = ({ userId, documentId }: { userId: string, documentId: string }) => {
  const [modalState, setModalState] = useState({ show: false })
  const { data, loading } = useStockCategoriesAndStocksQuery({ variables: { auth: 'user', userId: userId, documentId: documentId } })

  // ストックの更新用
  const [createStock, { }] = useCreateStockMutation({
    refetchQueries: [StockCategoriesAndStocksDocument]
  })
  const [deleteStock, { }] = useDeleteStockMutation({
    refetchQueries: [StockCategoriesAndStocksDocument]
  })
  const handleStockCheckboxCanged = (e) => {
    const stockCategoryId = e.target.dataset.categoryid
    if (e.target.checked) {
      createStock({
        variables: {
          auth: 'user',
          userId: userId,
          documentId: documentId,
          stockCategoryId: stockCategoryId
        }
      })
    } else {
      deleteStock({
        variables: {
          auth: 'user',
          userId: userId,
          documentId: documentId,
          stockCategoryId: stockCategoryId
        }
      })
    }
  }

  // 新規のカテゴリ作成用
  const [newCategoryName, setNewCategoryName] = useState('')
  const [createStockCategory, { }] = useCreateStockCategoryMutation({
    refetchQueries: [StockCategoriesAndStocksDocument]
  })
  const handleNewCategoryNameChanged = (e) => {
    setNewCategoryName(e.target.value)
  }
  const handleCreateNewCategory = (e) => {
    createStockCategory({ variables: { auth: 'user', userId: userId, name: newCategoryName } })
  }

  if (loading) return (<></>)
  if (!data) return (<></>)

  return (
    <div>
      <div className='outline-green-700 text-green-700 rounded-xl px-3 py-1 text-center inline-block hover:outline hover:cursor-pointer'
        onClick={() => { setModalState({ ...modalState, show: true }) }}>
        <span className='text-sm font-bold'>Stock</span>
        {data.stocks.some((stock) => stock.userId.toLocaleUpperCase() == userId.toUpperCase()) ?
          <BsBookmarkCheckFill className='w-7 h-7 block mx-auto' /> :
          <BsBookmark className='w-7 h-7 block mx-auto' />}
        <span className='text-sm font-bold'>{data.countStocks}</span>
      </div>
      <MyModal show={modalState.show} title="ストックするカテゴリー" close={() => { setModalState({ ...modalState, show: false }) }}>
        <div>
          {data.stockCategories.map((category) =>
            <div key={`stockCategory-${category.id}`}>
              <input type="checkbox" id={`stockCategory-checkbox-${category.id}`} className='mr-3 w-4 h-4 align-middle'
                data-categoryid={category.id}
                checked={data.stocks.some((stock) => stock.stockCategoryId == category.id)}
                onChange={handleStockCheckboxCanged} />
              <label htmlFor={`stockCategory-checkbox-${category.id}`} className='align-middle'>{category.name}</label>
            </div>
          )}
        </div>
        <div className='mt-3'>
          <input type="text" className='p-2 border rounded-md w-60' value={newCategoryName} onChange={handleNewCategoryNameChanged}></input>
          <button className='mx-2 p-2 border rounded-lg bg-blue-200' onClick={handleCreateNewCategory}>
            <span>新しいカテゴリを作成</span>
          </button>
        </div>
      </MyModal>
    </div>
  )
}

const LikeBadge = ({ userId, documentId }: { userId: string, documentId: string }) => {
  const { data, loading } = useLikesQuery({ variables: { auth: 'user', documentId: documentId } })
  const [createLike, { }] = useCreateLikeMutation({
    refetchQueries: [LikesDocument]
  })
  const [deleteLike, { }] = useDeleteLikeMutation({
    refetchQueries: [LikesDocument]
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

  if (loading) return (<></>)
  if (!data) return (<></>)

  return (
    <div className='outline-pink-600 text-pink-600 rounded-xl px-3 py-1 text-center inline-block hover:outline hover:cursor-pointer'
      onClick={handleClick} data-isliked={isLiked}>
      <span className='text-sm font-bold'> Like </span>
      {isLiked ?
        <AiFillLike className='w-7 h-7 block mx-auto' /> :
        <AiOutlineLike className='w-7 h-7 block mx-auto' />}
      <span className='text-sm font-bold'>{countLikes}</span>
    </div>
  )
}

const ReactiveToC = ({ children }) => {
  const [scrollMarker, setScrollMarker] = useState('')
  const throrttleTimer = useRef(Date.now())
  const throttle = useCallback((fn, delay) => {
    if ((throrttleTimer.current + delay) < Date.now()) {
      throrttleTimer.current = Date.now()
      return fn();
    }
  }, [])

  const handleScroll = useCallback((e) => {
    throttle(() => updateScrollMarker(), 100)
  }, [])

  const updateScrollMarker = useCallback(() => {
    const elements = Array.from(document.getElementsByClassName(CONTENT_ANCHOR_CLASS_NAME))
    const targets = elements.map(element => {
      const rect = element.getBoundingClientRect()
      return { id: element.id, top: rect.top }
    }).sort((a, b) => b.top - a.top)
    const target = targets.find(x => x.top < 0) ?? targets.slice(-1)[0]
    setScrollMarker(target?.id ?? '')
  }, [])

  useEffect(() => {
    document.addEventListener('scroll', handleScroll, { passive: true })
    updateScrollMarker()
  }, [])

  const H1 = useCallback(({ node, ...props }) => {
    const className = `${CONTENT_ANCHOR_PREFIX}-${node.position?.start.line.toString()}` == scrollMarker ? 'bg-gray-200' : ''
    return (<div className={className}><a href={`#${CONTENT_ANCHOR_PREFIX}-${node.position?.start.line.toString()}`}>{props.children}</a></div>)
  }, [scrollMarker])
  const H2 = useCallback(({ node, ...props }) => {
    const className = `${CONTENT_ANCHOR_PREFIX}-${node.position?.start.line.toString()}` == scrollMarker ? 'bg-gray-200 pl-4' : 'pl-4'
    return (<div className={className}><a href={`#${CONTENT_ANCHOR_PREFIX}-${node.position?.start.line.toString()}`}>{props.children}</a></div>)
  }, [scrollMarker])

  return (
    <ReactMarkdown allowedElements={['h1', 'h2']} components={{ h1: H1, h2: H2 }}>{children}</ReactMarkdown>
  )
}

const CommentsView = ({ userId, documentId }: { userId: string, documentId: string }) => {
  const { data, loading } = useCommentsQuery({ variables: { auth: 'user', documentId } })
  const [refCommentId, setRefCommentId] = useState('')
  const [featureCommentId, setFeatureCommentId] = useState('')

  const handleResetfeature = (e) => {
    if (e.currentTarget?.dataset?.commentid?.toLowerCase() == featureCommentId.toLowerCase()) {
      setFeatureCommentId('')
    }
  }

  if (loading) return (<></>)
  if (!data) return (<></>)

  return (
    <div>
      <div>
        {data.comments.map((comment) => {
          const feaColoredBorder = comment.id.toUpperCase() === featureCommentId.toUpperCase() ? 'border-blue-300 border-2' : ''
          const refColoredBorder = comment.id.toUpperCase() === refCommentId.toUpperCase() ? 'border-red-300 border-2' : ''
          return (
            <div key={`document-comment-${comment.id}`} className={`border m-1 p-2 ${feaColoredBorder} ${refColoredBorder}`} data-commentid={comment.id} onClick={handleResetfeature}>
              <CommentView commentId={comment.id} userId={comment.User.id} username={comment.User.username}
                createdAt={comment.createdAt} rawCreatedAt={comment.RawComment.createdAt} body={comment.RawComment.body}
                refCommentId={comment.referenceCommentIdLazy} setRefCommentId={setRefCommentId} setFeatureCommentId={setFeatureCommentId} />
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

const CommentView = ({ commentId, userId, username, createdAt, rawCreatedAt, body, refCommentId, setRefCommentId, setFeatureCommentId }:
  {
    commentId: string,
    userId: string,
    username: string,
    createdAt: string,
    rawCreatedAt: string,
    body: string,
    refCommentId: string,
    setRefCommentId: Dispatch<SetStateAction<string>>,
    setFeatureCommentId: Dispatch<SetStateAction<string>>
  }) => {

  const [editorModeState, setEditorModeState] = useState(false)
  const [deleteModalState, setDeleteModalState] = useState(false)
  const [subMenuOpen, setSubMenuOpen] = useState(false)
  const [bodyText, setBodyText] = useState(body)
  const [updateComment, { }] = useUpdateCommentMutation({
    refetchQueries: [CommentsDocument],
    onCompleted: () => setEditorModeState(false)
  })
  const [deleteComment, { }] = useDeleteCommentMutation({
    refetchQueries: [CommentsDocument],
    onCompleted: () => setDeleteModalState(false)
  })

  const handleEditSubmit = (e) => {
    updateComment({
      variables: {
        auth: 'user', id: commentId, body: bodyText
      }
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
        {refCommentId ?
          <div className='text-gray-500 flex'>
            <div className='flex-none mr-2'>
              <IoReturnUpForward className='ml-2 mr-2 w-6 h-6 inline-block' />
              <span>返信元:</span>
            </div>
            <div className='flex-1 inline-block align-bottom mr-10 bg-gray-100 hover:cursor-pointer' onClick={handleFeatureComment}>
              <CommentSummary commentId={refCommentId} />
            </div>
          </div> : <></>
        }
        <div className='flex justify-between'>
          <div>
            <UserIconNameLinkSmall userId={userId} username={username} />
          </div>
          <div>
            <div className='inline-block align-top mr-2'>
              {new Date(createdAt).toLocaleString()}
              {createdAt == rawCreatedAt ? '' : ' (編集済み)'}
            </div>

            {/* sub-menu */}
            <div className='relative inline-block hover:cursor-pointer'
              onClick={(e) => e.currentTarget.focus}
              onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) { setSubMenuOpen(false) } }}
              tabIndex={0}>
              {/* menu button */}
              <div className='w-6 h-6 p-1 border'
                onClick={() => setSubMenuOpen(!subMenuOpen)}>
                <BsThreeDots className='w-full h-full' />
              </div>
              {/* menu list */}
              <div hidden={!subMenuOpen}
                className='z-40 origin-top-right absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-10'>
                <div>
                  <span className='block px-4 py-2 hover:bg-gray-100' onClick={handleReply}>このコメントに返信</span>
                  <span className="block border-b"></span>
                  <span className='block px-4 py-2 hover:bg-gray-100' onClick={() => setEditorModeState(true)}>編集</span>
                  <span className="block border-b"></span>
                  <span className='block px-4 py-2 hover:bg-gray-100' onClick={() => setDeleteModalState(true)}>削除</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <ReactMarkdown className='markdown' remarkPlugins={[gfm]} unwrapDisallowed={false}>{body}</ReactMarkdown>
        </div>
      </div>

      <div hidden={!editorModeState}>
        <CommentEditForm bodyText={bodyText} setBodyText={setBodyText} submitButtonLabel="コメントを修正" handleSubmit={handleEditSubmit} handleCancelButton={() => { setEditorModeState(false) }} />
      </div>

      <MyModal show={deleteModalState} close={() => { setDeleteModalState(false) }} title="コメントの削除">
        <div>
          コメントを削除しますか？
        </div>
        <div className='flex justify-between mt-3'>
          <button className='border px-2 py-1 bg-gray-200' onClick={() => { setDeleteModalState(false) }}>キャンセル</button>
          <button className='border px-2 py-1 bg-red-200' onClick={() => { deleteComment({ variables: { auth: 'user', id: commentId } }) }}>削除する</button>
        </div>
      </MyModal>

    </div>
  )
}

const PostComment = ({ userId, documentId, refCommentId, setRefCommentId }:
  {
    userId: string,
    documentId: string,
    refCommentId?: string,
    setRefCommentId?: Dispatch<SetStateAction<string>>
  }) => {

  const [bodyText, setBodyText] = useState('')
  const [postComment, { }] = useCreateCommentMutation({
    refetchQueries: [CommentsDocument]
  })

  const handleSubmit = (e) => {
    postComment({
      variables: {
        auth: 'user',
        userId,
        documentId,
        body: bodyText,
        referenceCommentIdLazy: refCommentId ? refCommentId : undefined
      },
      onCompleted: (data) => {
        setBodyText('')
        setRefCommentId('')
      }
    })
  }

  return <CommentEditForm bodyText={bodyText} setBodyText={setBodyText}
    refCommentId={refCommentId} setRefCommentId={setRefCommentId}
    submitButtonLabel="投稿" handleSubmit={handleSubmit} />
}


const CommentEditForm = ({ bodyText, setBodyText, refCommentId, setRefCommentId, submitButtonLabel, handleSubmit, handleCancelButton }:
  {
    bodyText: string,
    setBodyText: Dispatch<SetStateAction<string>>,
    refCommentId?: string,
    setRefCommentId?: Dispatch<SetStateAction<string>>,
    submitButtonLabel: string,
    handleSubmit: MouseEventHandler<HTMLButtonElement>,
    handleCancelButton?: MouseEventHandler<HTMLButtonElement>
  }) => {

  const [selectedTab, setSelectedTab] = useState(0)
  const handleTextChanged = (e) => {
    setBodyText(e.target.value)
  }

  const editTabClass = selectedTab == 0 ? 'border-blue-600' : ''
  const previewTabClass = selectedTab == 1 ? 'border-blue-600' : ''

  return (
    <div className='p-3'>
      <ul className="flex flex-col md:flex-row flex-wrap list-none border-b-0 pl-0 mb-2">
        <li className='flex-none'>
          <div className={`block border-x-0 border-t-0 border-b-2 border-transparent px-6 py-3 my-2 hover:cursor-pointer hover:bg-gray-100 ${editTabClass}`}
            onClick={() => { setSelectedTab(0) }}>
            <span>編集</span>
          </div>
        </li>
        <li className='flex-none'>
          <div className={`block border-x-0 border-t-0 border-b-2 border-transparent px-6 py-3 my-2 hover:cursor-pointer hover:bg-gray-100 ${previewTabClass}`}
            onClick={() => { setSelectedTab(1) }}>
            <span>プレビュー</span>
          </div>
        </li>
        {handleCancelButton ?
          <li className='flex-grow'>
            <div className='block pt-6 my-2 text-right'>
              <button type="button" className="" onClick={handleCancelButton}><XIcon className="text-gray-600 w-6 h-6 border-1 rounded-md" /></button>
            </div>
          </li> : <></>}
      </ul>
      <div className='min-h-[100px]'>
        <div hidden={selectedTab !== 0}>
          <textarea className='w-full h-full min-h-[80px] p-3 m-1 border'
            value={bodyText}
            onChange={handleTextChanged}
            onInput={(e) => {
              e.currentTarget.style.height = '80px'
              e.currentTarget.style.height = e.currentTarget.scrollHeight + 5 + 'px'
            }}></textarea>
        </div>
        <div hidden={selectedTab !== 1}>
          <div className='w-full h-full min-h-[80px] p-0 m-1 border inline-block'>
            <ReactMarkdown className='markdown' remarkPlugins={[gfm]} unwrapDisallowed={false}>{bodyText}</ReactMarkdown>
          </div>
        </div>
      </div>
      <div className='flex justify-between gap-20'>
        <div>
          {refCommentId && setRefCommentId ?
            <div>
              <div className='mb-1'>
                <span>以下に返信</span>
                <button className='ml-3 border rounded-lg px-2 py-1 bg-blue-200 hover:bg-blue-300' onClick={() => { setRefCommentId('') }}>取り消す</button>
              </div>
              <div className='bg-gray-100'>
                <span><a href={`#comment-${refCommentId.toLowerCase()}`}>
                  <CommentSummary commentId={refCommentId} />
                </a></span>
              </div>
            </div> : <></>
          }
        </div>
        <div className='flex-none'>
          <button className='px-2 py-2 border rounded-lg bg-blue-100' onClick={handleSubmit}>{submitButtonLabel}</button>
        </div>
      </div>
    </div>
  )
}

const CommentSummary = ({ commentId }) => {
  const { data, loading } = useCommentQuery({ variables: { auth: 'user', id: commentId } })

  if (loading) return (<span></span>)
  if (!data) return (<span>削除されたコメント</span>)

  const file = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .processSync(data.comment.RawComment.body)
  const html = String(file)

  return (
    <div className='line-clamp-1'>
      <div className='inline-block mr-2'>
        <UserIconNameLinkSmall userId={data.comment.User.id} username={data.comment.User.username} />
      </div>
      <span className='text-sm from-neutral-700'>{html.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '').slice(0, 300)}</span>
    </div>)
}
