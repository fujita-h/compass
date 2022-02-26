import { NavTags } from '@components/modals/NavTags'
import NavTab from '@components/navTab'
import ProfileHeader from '@components/profileHeader'
import { useCountDocumentsByTagQuery, useTagMetaQuery } from '@graphql/generated/react-apollo'

type Props = {
  children?: JSX.Element
  tagname: string
  currentUrl?: string
}

export default function TagPageLayout(props: Props) {
  const { data, loading } = useCountDocumentsByTagQuery({ variables: { auth: 'user', query: props.tagname } })

  const baseUrl = '/tags/' + decodeURIComponent(props.tagname)
  const tabs = [
    { name: 'タグ概要', href: baseUrl, current: !props.currentUrl },
    {
      name: 'ドキュメント',
      href: baseUrl + '/documents',
      count: data?.esCountDocumentsByTag?.Documents?.count?.toString(),
      current: props.currentUrl == '/documents',
    },
  ]

  return (
    <>
      {/* 2-Pane wrapper */}
      <div className="mx-auto w-full max-w-7xl flex-grow lg:flex">
        {/* Pane-1 */}
        <div className="hidden bg-white pt-1 xl:block xl:w-80 xl:flex-shrink-0 xl:border-r xl:border-gray-200">
          <h2 className="mb-2 text-lg font-medium text-gray-900">Tags</h2>
          <NavTags current={props.tagname} />
        </div>
        {/* Pane-2 */}
        <div className="bg-white p-3 lg:min-w-0 lg:flex-1">
          {/* Group header */}
          <ProfileHeader
            coverSrc={`/api/files/usercovers/${encodeURIComponent(props.tagname)}`}
            iconSrc={`/api/files/usericons/${encodeURIComponent(props.tagname)}`}
            name={''}
            displayName={props.tagname}
            iconRounded={false}
          >
            <>
              {/** 
              <FollowUserButton fromUserId={props.sessionUserId} toUserId={userId} />
              */}
            </>
          </ProfileHeader>
          <div className="mt-6"></div>
          <NavTab tabs={tabs} />
          <div className="mt-6"></div>
          {props.children}
        </div>
      </div>
    </>
  )
}
