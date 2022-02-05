import { NextRouter, useRouter } from 'next/router'
import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from '@lib/hooks'
import { Layout } from '@components/layouts'
import { MyModal } from '@components/modals'
import { getAsString } from '@lib/utils'
import { DraftQuery, useDeleteDraftMutation, useDraftQuery } from '@graphql/generated/react-apollo'
import { UserIconNameLinkSmall } from '@components/elements'
import ReactMarkdown from "react-markdown"
import gfm from 'remark-gfm'
import { BsBookmark, BsBookmarkCheckFill, BsThreeDots, BsTags } from 'react-icons/bs'
import { GrEdit } from 'react-icons/gr'
import { RiDeleteBin6Line } from 'react-icons/ri'

const CONTENT_ANCHOR_PREFIX = 'content-line'
const CONTENT_ANCHOR_CLASS_NAME = 'doc-content-lines'

export default function Page() {
  const session = useSession({ redirectTo: "/login" })
  const router = useRouter()
  const paperId = getAsString(router.query?.paperId)

  if (!session?.id) return (<Layout></Layout>)
  if (!paperId) return (<Layout></Layout>)

  return (<Layout><InnerPage router={router} sessionUserId={session.id} paperId={paperId} /></Layout>)

}

const InnerPage = ({ router, sessionUserId, paperId }: { router: NextRouter, sessionUserId: string, paperId: string }) => {
  const { data, loading } = useDraftQuery({ variables: { auth: 'user', id: paperId } })

  const H1 = useCallback(({ node, ...props }) => <h1 id={`${CONTENT_ANCHOR_PREFIX}-${node.position?.start.line.toString()}`} className={CONTENT_ANCHOR_CLASS_NAME}>{props.children}</h1>, [])
  const H2 = useCallback(({ node, ...props }) => <h2 id={`${CONTENT_ANCHOR_PREFIX}-${node.position?.start.line.toString()}`} className={CONTENT_ANCHOR_CLASS_NAME}>{props.children}</h2>, [])


  const [subMenuOpen, setSubMenuOpen] = useState(false)
  const [deleteModalState, setDeleteModalState] = useState(false)

  const [deleteDraft, { }] = useDeleteDraftMutation()

  const handleDelete = (e) => {
    deleteDraft({
      variables: { auth: 'user', id: data.draft.id },
      onCompleted: (data) => {
        router.push(`/groups/${encodeURIComponent(data.deletePaper.group.name.toLowerCase())}`)
      }
    })
    setDeleteModalState(false)
  }

  if (loading) return (<></>)
  if (!data.draft) {
    return (
      <div className="text-red-500">{paperId} Not Found.</div>
    )
  }

  return (
    <div>
      <div className='max-w-7xl mx-auto'>
        <div className='bg-red-100 border-l-4 border-red-400'>
          <div className='mt-3 p-4'>
            <span className='text-lg'>これは下書きです。</span>
          </div>
        </div>
      </div>
      <div className='max-w-7xl mx-auto flex'>
        <div className='flex-1'>

          <div className='bg-white'>
            <div className='mt-3 p-2'>
              <div className='flex place-content-between'>
                <div>
                  <Link href={`/groups/${encodeURIComponent(data.draft.group.name)}`} passHref><a>
                    <div className='mb-2 px-3 inline-block bg-red-200'>{data.draft.group.displayName || data.draft.group.name}</div>
                  </a></Link>
                  <div>
                    <UserIconNameLinkSmall userId={data.draft.user.id} username={data.draft.user.username} />
                  </div>
                  <div>投稿日: {new Date(data.draft.createdAt).toLocaleString()} 更新日: {new Date(data.draft.updatedAt).toLocaleString()}</div>
                </div>
                <div>
                  {sessionUserId == data.draft.user.id ?
                    <div>
                      <div className='relative inline-block hover:cursor-pointer'
                        onClick={(e) => e.currentTarget.focus}
                        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) { setSubMenuOpen(false) } }}
                        tabIndex={0}>
                        {/* menu button */}
                        <div className='w-8 h-8 p-1 border rounded-md hover:bg-gray-100'
                          onClick={() => setSubMenuOpen(!subMenuOpen)}>
                          <BsThreeDots className='w-full h-full' />
                        </div>
                        {/* menu list */}
                        <div hidden={!subMenuOpen}
                          className='z-40 origin-top-right absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-10'>
                          <div onClick={() => { setSubMenuOpen(false) }}>
                            <Link href={`/drafts/${encodeURIComponent(paperId.toLowerCase())}/edit`} passHref><a>
                              <span className='block px-4 py-2 hover:bg-gray-100'><GrEdit className='inline-block mr-2' /><span className='align-middle'>編集</span></span>
                            </a></Link>
                            <span className="block border-b"></span>
                            <span className='block px-4 py-2 hover:bg-gray-100' onClick={() => { setDeleteModalState(true) }}><RiDeleteBin6Line className='inline-block mr-2' /><span className='align-middle'>削除</span></span>
                          </div>
                        </div>
                      </div>
                      <MyModal show={deleteModalState} close={() => { setDeleteModalState(false) }} title="ドキュメントの削除">
                        <div className='ml-4'>
                          <div>削除すると元に戻すことは出来ません。</div>
                          <div className='mt-2'>この下書きを削除しますか？</div>
                        </div>
                        <div className='flex justify-between mt-3'>
                          <button className='border px-2 py-1 bg-gray-200' onClick={() => { setDeleteModalState(false) }}>キャンセル</button>
                          <button className='border px-2 py-1 bg-red-200' onClick={handleDelete}>削除する</button>
                        </div>
                      </MyModal>
                    </div>
                    : <></>}
                </div>
              </div>
              <h1 className='text-3xl font-bold mt-1 mb-4'>
                {data.draft.title}
              </h1>
              <div>
                <BsTags className='inline-block w-5 h-5 text-gray-600 mr-2' />
                {data.draft.tags.split(',').filter((tag) => tag !== '').map((tag) => <span key={`tag-${tag}`} className="mx-1 px-2 py-1 bg-blue-50 rounded-md">{tag}</span>)}
              </div>
            </div>
            <div className='p-2'>
              <ReactMarkdown className='markdown' remarkPlugins={[gfm]} unwrapDisallowed={false} components={{ h1: H1, h2: H2 }}>{data.draft.body}</ReactMarkdown>
            </div>
          </div>
        </div>
        <div className='flex-none w-60 ml-4 mt-2'>
          <RightPane userId={sessionUserId} draftQuery={data} />
        </div>
      </div>
    </div>
  )
}

const RightPane = ({ userId, draftQuery }: { userId: string, draftQuery: DraftQuery }) => {
  return (
    <div className='sticky top-16'>
      <div className='mt-2'>
        <ReactiveToC>{draftQuery.draft.body}</ReactiveToC>
      </div>
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