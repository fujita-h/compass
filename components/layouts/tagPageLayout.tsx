import { NavTags } from '@components/navTags'
import NavTab from '@components/navTab'
import ProfileHeader from '@components/profileHeader'
import {
  TagFollowsDocument,
  useCountDocumentsByTagQuery,
  useCreateTagFollowMutation,
  useDeleteTagFollowMutation,
  useTagFollowsQuery,
  useTagMetaQuery,
} from '@graphql/generated/react-apollo'
import { useMemo } from 'react'
import { classNames } from '@lib/utils'

type Props = {
  children?: JSX.Element
  userId: string
  tag: string
  currentUrl?: string
}

export default function TagPageLayout(props: Props) {
  const { data, loading } = useCountDocumentsByTagQuery({ variables: { auth: 'user', query: props.tag } })

  const baseUrl = '/tags/' + decodeURIComponent(props.tag)
  const tabs = [
    { name: 'タグ概要', href: baseUrl, current: !props.currentUrl },
    {
      name: 'ドキュメント',
      href: baseUrl + '/documents',
      count: data?.esCountDocumentsByTag?.Documents?.count?.toString(),
      current: props.currentUrl == '/documents',
    },
  ]
  const tabs2 = [{ name: '編集', href: baseUrl + '/edit', current: props.currentUrl == '/edit' }]

  return (
    <>
      {/* 2-Pane wrapper */}
      <div className="mx-auto w-full max-w-7xl flex-grow lg:flex">
        {/* Pane-1 */}
        <div className="hidden bg-white pt-1 xl:block xl:w-80 xl:flex-shrink-0 xl:border-r xl:border-gray-200">
          <h2 className="mb-2 text-lg font-medium text-gray-900">Tags</h2>
          <NavTags current={props.tag} />
        </div>
        {/* Pane-2 */}
        <div className="bg-white p-3 lg:min-w-0 lg:flex-1">
          {/* Group header */}
          <ProfileHeader
            coverSrc={`/api/files/tagcovers/${encodeURIComponent(props.tag)}`}
            iconSrc={`/api/files/tagicons/${encodeURIComponent(props.tag)}`}
            name={''}
            displayName={props.tag}
            iconRounded={false}
          >
            <>
              {/** フォローしたタグをTimelineに反映できるようになるまで、フォローボタンは非表示
              <FollowTagButton userId={props.userId} tag={props.tag} />
              */}
            </>
          </ProfileHeader>
          <div className="mt-6"></div>
          <NavTab tabs={tabs} tabs2={tabs2} />
          <div className="mt-6"></div>
          {props.children}
        </div>
      </div>
    </>
  )
}

const FollowTagButton = ({ userId, tag, className }: { userId: string; tag: string; className?: string }) => {
  const { data, loading } = useTagFollowsQuery({ variables: { auth: 'user', tag: tag } })
  const [createFollow] = useCreateTagFollowMutation({ refetchQueries: [TagFollowsDocument] })
  const [deleteFollow] = useDeleteTagFollowMutation({ refetchQueries: [TagFollowsDocument] })

  const isFollowing = useMemo(() => data?.tagFollows?.find((follow) => follow.userId.toUpperCase() === userId.toUpperCase()), [data])
  const countFollow = useMemo(() => data?.tagFollows?.length, [data])

  const handleClick = (e) => {
    if (isFollowing) {
      deleteFollow({ variables: { auth: 'user', tag: tag } })
    } else {
      createFollow({ variables: { auth: 'user', tag: tag } })
    }
  }

  if (loading || !data) return <div></div>

  return (
    <button
      type="button"
      onClick={handleClick}
      className={classNames(
        isFollowing ? 'bg-indigo-600 text-white hover:bg-indigo-700 ' : ' bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
        className,
        'focus:ring-indigo-500" inline-flex items-center rounded-lg border border-transparent px-6 py-2 text-base font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2'
      )}
    >
      <span>{isFollowing ? 'フォロー解除' : 'フォローする'}</span>
    </button>
  )
}
