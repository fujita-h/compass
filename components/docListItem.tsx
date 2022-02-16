import Image from 'next/image'
import { UserGroupIcon } from '@heroicons/react/solid'
import { userIconLoader } from '@components/imageLoaders'
import { NextLink } from '@components/nextLink'

type Prop = {
  id: string
  title: string
  href: string
  groupName: string
  groupHref: string
  userId: string
  userName: string
  userHref: string
  updatedAt: string
}

//
// Sample Usage:
//
// <ul role="list" className="relative z-0 divide-y divide-gray-200 border-b border-gray-200">
//   {nodes.map((item) => <DocListItem key=... />
// </ul>
//

export const DocListItem = (item: Prop) => {
  return (
    <li key={item.id} className="relative py-4 pl-4 pr-2 hover:bg-gray-50 sm:pl-2">
      {/* エリア全体をリンク対象にする */}
      <NextLink href={item.href}>
        <span className="absolute inset-0" aria-hidden="true" />
      </NextLink>

      <div className="flex items-center">
        {/* image */}
        <div className="flex-none">
          <NextLink href={item.userHref}>
            <div className="has-tooltip hidden sm:block">
              <span className="tooltip  mt-10 rounded-lg bg-gray-100 px-2 py-1 text-sm shadow-lg">@{item.userName}</span>
              <div className="mr-2 h-12 w-12 rounded-full border-1 border-gray-300">
                <Image
                  loader={userIconLoader}
                  src={item.userId.toUpperCase()}
                  alt={item.userName}
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
              </div>
            </div>
          </NextLink>
        </div>
        <div className="flex-1">
          {/* A area */}
          <div>
            {/* Mini-User */}
            <div className="flex items-center space-x-3 sm:hidden">
              <NextLink href={item.userHref} className="group relative flex items-center space-x-2.5">
                <span className="truncate text-sm font-medium text-gray-500 group-hover:text-gray-900 ">
                  <div className="mr-1 inline-block h-4 w-4 align-middle">
                    <Image
                      loader={userIconLoader}
                      src={item.userId.toUpperCase()}
                      width={16}
                      height={16}
                      alt={item.userName}
                      className="rounded-full"
                    />
                  </div>
                  @{item.userName}
                </span>
              </NextLink>
            </div>
            {/* title */}
            <div className="flex items-center space-x-3">
              <span className="block">
                <h2 className="text-base font-bold text-gray-700">
                  <NextLink href={item.href}>{item.title}</NextLink>
                </h2>
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between space-x-4">
            {/* B (down, left) area */}
            <div>
              {/* Group */}
              <div className="flex items-center space-x-3">
                <a href={item.groupHref} className="group relative flex items-center space-x-2.5">
                  <span className="truncate text-sm font-medium text-gray-500 group-hover:text-gray-900">
                    <UserGroupIcon className="mr-1 inline-block h-4 w-4" />
                    {item.groupName}
                  </span>
                </a>
              </div>
            </div>
            {/* C (down, right) area */}
            <div>
              <span className="text-sm text-gray-500">Last Updated: {item.updatedAt}</span>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}
