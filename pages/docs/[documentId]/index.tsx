import { useRouter } from 'next/router'
import { useSession } from '@lib/session'
import { Layout } from '@components/layouts'
import { userIconLoader } from '@components/imageLoaders'
import { getAsString } from '@lib/utils'
import { useState } from 'react'
import ReactMarkdown from "react-markdown"
import gfm from 'remark-gfm'
import Image from 'next/image'
import Link from 'next/link'
import { GrEdit } from 'react-icons/gr'

import { useDocumentPageQuery } from "@graphql/generated/react-apollo"

export default function Page() {
  const session = useSession({ redirectTo: "/login" })
  const router = useRouter()
  const documentId = getAsString(router.query?.documentId)

  if (!session?.id) return (<Layout></Layout>)
  if (!documentId) return (<Layout></Layout>)
  return (<Layout><InnerPage sessionUserId={session.id} documentId={documentId} /></Layout>)
}

const InnerPage = ({ sessionUserId, documentId }: { sessionUserId: string, documentId: string }) => {
  const { data, loading } = useDocumentPageQuery({ variables: { documentId }, fetchPolicy: 'cache-and-network' })
  if (loading) return (<></>)
  if (!data.document) {
    return (
      <div className="text-red-500">{documentId} Not Found.</div>
    )
  }

  return (
    <div className='max-w-7xl mx-auto bg-white'>
      <div className='mt-3 p-2'>
        <div className='flex place-content-between'>
          <div>
            <Link href={`/groups/${encodeURIComponent(data.document.Paper.Group.id.toLowerCase())}`} passHref><a>
              <div className='mb-2 px-3 inline-block bg-red-200'>{data.document.Paper.Group.displayName || data.document.Paper.Group.name}</div>
            </a></Link>
            <div className='font-bold'>
              <Link href={`/users/${encodeURIComponent(data.document.Paper.User.id.toLowerCase())}`} passHref>
                <a className='group hover:underline'>
                  <div className='inline-block mr-1 group-hover:brightness-95'><Image loader={userIconLoader} src={data.document.Paper.User.id} width={16} height={16} alt={data.document.Paper.User.username} className='rounded-full' /></div>@{data.document.Paper.User.username}
                </a>
              </Link></div>
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
        <ReactMarkdown className='markdown' remarkPlugins={[gfm]} unwrapDisallowed={false}>{data.document.Paper.body}</ReactMarkdown>
      </div>
    </div>
  )
}