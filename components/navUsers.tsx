import { useGroupsQuery, useUsersQuery } from '@graphql/generated/react-apollo'
import { FilterIcon } from '@heroicons/react/solid'
import { classNames } from '@lib/utils'
import { useState } from 'react'
import Image from 'next/image'
import { NextLink } from '@components/nextLink'

/* group nav */
export const NavUsers = ({ current }: { current?: string }) => {
  const { data, loading } = useUsersQuery({ variables: { auth: 'user' } })
  const [filter, setFilter] = useState('')

  if (loading) return <></>
  if (!data) return <></>

  return (
    <>
      <div className="mx-1">
        <div className="mb-4 min-w-0 flex-1">
          <label htmlFor="group-fileter" className="sr-only">
            Group Filter
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FilterIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="search"
              name="filter"
              id="group-fileter"
              className="form-input block w-full rounded-md border-gray-300 p-2  pl-10 placeholder:text-gray-400 focus:border-gray-300 focus:ring-gray-500 sm:text-sm"
              placeholder="フィルタ"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value)
              }}
            />
          </div>
        </div>
      </div>
      <nav className="space-y-1" aria-label="Sidebar">
        <ul role="list" className="relative z-0 divide-y divide-gray-200 border-y border-gray-200">
          {data.users
            .filter((x) => x.username.includes(filter))
            .map((user) => {
              const isCurrent = current ? current === user.username : false
              return (
                <li key={user.id}>
                  <div
                    className={classNames(
                      isCurrent ? 'border-l-3 border-orange-400' : '',
                      'relative flex items-center space-x-3 px-5 py-3 focus-within:ring-2 focus-within:ring-inset focus-within:ring-gray-500 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex-shrink-0">
                      <Image
                        src={`/api/files/usericons/${encodeURIComponent(user.id.toLowerCase())}`}
                        width={32}
                        height={32}
                        alt={user.username}
                        className="rounded-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <NextLink href={`/users/${encodeURIComponent(user.username)}`} className="focus:outline-none">
                        {/* Extend touch target to entire panel */}
                        <span className="absolute inset-0" aria-hidden="true" />
                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        <p className="truncate text-sm text-gray-500">{user.displayName}</p>
                      </NextLink>
                    </div>
                  </div>
                </li>
              )
            })}
        </ul>
      </nav>
    </>
  )
}
