import Link from 'next/link'
import React, { useState } from 'react'
import { useSessionQuery } from '@graphql/generated/react-apollo'
import { BsSearch } from 'react-icons/bs'
import { FaUserCircle, FaRegBell } from 'react-icons/fa'
import { getPageViews } from '@lib/localStorage/pageViews'
import { classNames } from '@lib/utils'
import Image from 'next/image'
import { userIconLoader } from '@components/imageLoaders'
import { NextLink } from '@components/nextLink'
import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { SearchIcon } from '@heroicons/react/solid'
import { MenuAlt1Icon, XIcon } from '@heroicons/react/outline'

export type MyProfile = {
  id: String
}

export const Header = ({ searchText = '' }: { searchText?: string }) => {
  const navigation = [
    { name: 'グループ', href: '/groups', current: false },
    { name: 'タグ', href: '/tags', current: false },
    { name: 'ユーザー', href: '/users', current: false },
    { name: 'ストック', href: '/stocks', current: false },
  ]

  const userNavigation = [
    { name: 'プロファイル', href: '/profile' },
    { name: '設定', href: '/settings/profile' },
    { name: 'ログアウト', href: '/logout' },
  ]

  const { data, loading } = useSessionQuery({ fetchPolicy: 'network-only' })

  return (
    <Disclosure as="nav" className="flex-shrink-0 bg-gray-800">
      {({ open }) => (
        <>
          <div className="mx-auto px-4 ">
            <div className="relative flex h-16 items-center justify-between">
              {/* Logo section */}
              <div className="flex items-center px-0">
                <div className="flex-shrink-0">
                  <Link href="/" passHref>
                    <a className="rounded-md px-1 py-1 align-middle text-lg font-medium text-gray-200 hover:text-white">Compass</a>
                  </Link>
                </div>
              </div>

              {/* Search section */}
              <div className="flex flex-1 justify-center lg:justify-end">
                <div className="relative w-full px-2 lg:px-6">
                  <label htmlFor="search" className="sr-only">
                    ドキュメント検索
                  </label>
                  <div className="relative text-gray-200 focus-within:text-gray-400">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <SearchIcon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <form method="GET" action="/search">
                      <input
                        id="search"
                        name="q"
                        className="form-input block w-full rounded-md border border-transparent bg-gray-400 bg-opacity-25 py-2 pl-10 pr-3 leading-5 text-gray-100 placeholder-gray-200 focus:border-gray-500 focus:bg-white focus:text-gray-900 focus:placeholder-gray-400  focus:outline-none focus:ring-0 sm:text-sm"
                        placeholder="ドキュメントを検索"
                        type="search"
                        autoComplete="off"
                        defaultValue={searchText}
                      />
                    </form>
                  </div>
                </div>
              </div>
              <div className="flex lg:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-600">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuAlt1Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              {/* Links section */}
              <div className="lg:w-92 hidden lg:block">
                <div className="flex items-center justify-end">
                  <div className="flex">
                    {navigation.map((item) => (
                      <NextLink
                        href={item.href}
                        key={item.name}
                        className="rounded-md px-3 py-2 text-sm font-normal text-gray-200 hover:text-white"
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </NextLink>
                    ))}
                  </div>
                  {/* Profile dropdown */}
                  <Menu as="div" className="relative ml-4 flex-shrink-0">
                    <div>
                      <Menu.Button className="flex rounded-full bg-gray-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-1 focus:ring-offset-gray-700">
                        <span className="sr-only">Open user menu</span>
                        {!loading && data?.session?.userSession?.id ? (
                          <Image
                            loader={userIconLoader}
                            src={data?.session?.userSession?.id.toLowerCase()}
                            width={32}
                            height={32}
                            alt="usericon"
                            className="rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8" />
                        )}
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <NextLink
                                href={item.href}
                                className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                              >
                                {item.name}
                              </NextLink>
                            )}
                          </Menu.Item>
                        ))}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="lg:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current ? 'bg-gray-800 text-white' : 'text-gray-200 hover:bg-gray-600 hover:text-gray-100',
                    'block rounded-md px-3 py-2 text-base font-normal'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            <div className="border-t border-gray-500 pt-4 pb-3">
              <div className="space-y-1 px-2">
                {userNavigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-base font-normal text-gray-200 hover:bg-gray-600 hover:text-gray-100"
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}

const BlankHeader = ({ children }: { children?: JSX.Element }) => (
  <>
    <nav className="bg-zinc-800 text-white">
      <div className="mx-auto h-12 max-w-none px-4">{children}</div>
    </nav>
  </>
)

export const Header_02 = ({ searchText = '' }: { searchText?: string }) => {
  const { data, loading } = useSessionQuery({ fetchPolicy: 'network-only' })
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchSuggestOpen, setSearchSuggestOpen] = useState(false)
  const [currentSearchText, setCurrentSearchText] = useState(searchText)

  const handleCloseSuggest = (e) => {
    setSearchSuggestOpen(false)
  }

  if (loading) return <BlankHeader />
  if (!data) return <BlankHeader />

  return (
    <BlankHeader>
      <div className="flex h-full items-center justify-between">
        <div className="block">
          <div className="flex items-baseline gap-3">
            <div className="my-auto">
              <Link href="/" passHref>
                <a className="hover:text-gray-300">Compass</a>
              </Link>
            </div>

            <div
              className="mr-2 h-7 items-center"
              onFocus={() => {
                setSearchSuggestOpen(true)
              }}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setSearchSuggestOpen(false)
                }
              }}
            >
              <form method="GET" action="/search">
                <input
                  type="text"
                  placeholder="検索.."
                  autoComplete="off"
                  value={currentSearchText}
                  onChange={(e) => setCurrentSearchText(e.target.value)}
                  name="q"
                  className={`focus:shadow-outline box-border h-full w-52 rounded-lg border-2 pl-2 pr-3 pt-1 pb-0.5 text-sm text-gray-700 duration-200 focus:w-100 focus:rounded-b-none  focus:outline-none`}
                />
              </form>
              <div
                hidden={!searchSuggestOpen}
                className="absolute z-40 mt-0 w-100 origin-top-right rounded-b-lg bg-white shadow-lg ring-1 ring-black ring-opacity-10"
              >
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  {searchSuggestOpen && currentSearchText ? (
                    <div>
                      <Link href={`/search?q=${encodeURIComponent(currentSearchText)}`} passHref>
                        <a
                          className="block border-b px-4 py-1 text-base text-gray-700 last:border-none hover:bg-gray-100 hover:text-gray-900"
                          onClick={handleCloseSuggest}
                        >
                          <BsSearch className="mr-2 inline-block" />
                          <span>{currentSearchText}</span>
                        </a>
                      </Link>
                    </div>
                  ) : (
                    <></>
                  )}
                  {searchSuggestOpen ? <SearchMenu handleCloseSuggest={handleCloseSuggest} /> : <></>}
                </div>
              </div>
            </div>

            <div className="text-sm">
              <Link href="/groups" passHref>
                <a className="hover:text-gray-300">Groups</a>
              </Link>
            </div>
            <div className="text-sm">
              <Link href="/tags" passHref>
                <a className="hover:text-gray-300">Tags</a>
              </Link>
            </div>
            <div className="text-sm">
              <Link href="/stocks" passHref>
                <a className="hover:text-gray-300">Stocks</a>
              </Link>
            </div>
          </div>
        </div>

        <div className="block items-center">
          <div className="ml-4 flex items-center">
            <div className="relative ml-3">
              {Boolean(data.session?.userSession?.id) ? (
                <>
                  {/* Logged-in Menu */}
                  <div className="flex">
                    <div className="flex w-full items-center justify-center rounded-md px-2 py-1 text-sm font-medium hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                      <FaRegBell className="h-5 w-5" />
                    </div>

                    {/* User Menu */}
                    <div
                      className="relative inline-block text-left hover:cursor-pointer"
                      onClick={(e) => e.currentTarget.focus()}
                      onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget)) {
                          setUserMenuOpen(false)
                        }
                      }}
                      tabIndex={0}
                    >
                      {/* Menu Button */}
                      <div
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex w-full items-center justify-center rounded-md px-3 py-1 text-sm font-medium hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                        id="options-menu"
                      >
                        <FaUserCircle className="h-6 w-6" />
                      </div>
                      {/* Menu List */}
                      <div
                        hidden={!userMenuOpen}
                        className="absolute right-0 z-40 mt-2 w-52 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-10"
                      >
                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                          <Link href="/profile" passHref>
                            <a className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900">Profile</a>
                          </Link>
                          <span className="block border-b"></span>
                          <Link href="/settings/profile" passHref>
                            <a className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900">設定</a>
                          </Link>
                          <span className="block border-b"></span>
                          <a
                            href="/logout"
                            className="block px-4 py-2 text-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            role="menuitem"
                          >
                            ログアウト
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Not-Logged-in, Login Link */}
                  <div className="relative inline-block text-left hover:cursor-pointer">
                    <Link href="/login" passHref>
                      <a className="block px-4 py-2 hover:text-gray-300">Login</a>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </BlankHeader>
  )
}

export const AdminHeader = () => {
  //const session = useAdminSession()
  const { data, loading } = useSessionQuery()

  if (loading) return <></>
  if (!data) return <></>

  //if (!session) return (<></>)

  return (
    <nav className="border-b-4 border-red-600 bg-gray-800 text-gray-50">
      <div className="mx-auto max-w-7xl px-2">
        <div className="flex h-16 items-center justify-between">
          <div>
            <Link href="/admin" passHref>
              <a className="flex-shrink-0 hover:text-current">
                <span className="text-xl font-bold">compass admin</span>
              </a>
            </Link>
          </div>
          <div className="mr-3 flex">
            <div className="mr-3">
              <Link href="/" passHref>
                <a className="text-gray-400 hover:text-gray-200">Back to Portal</a>
              </Link>
            </div>
            {!Boolean(data.session?.adminSession?.admin) && (
              <div>
                <Link href="/admin/login" passHref>
                  <a className="text-gray-400 hover:text-gray-200">Login</a>
                </Link>
              </div>
            )}
            {Boolean(data.session?.adminSession?.admin) && (
              <div>
                <Link href="/admin/logout" passHref>
                  <a className="text-gray-400 hover:text-gray-200">Logout</a>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

const SearchMenu = ({ handleCloseSuggest }) => {
  const pageViews = getPageViews()
  const pvEntries = Object.entries(pageViews)
    .sort(([key_a, value_a], [key_b, value_b]) => value_b.lastVisitedAt - value_a.lastVisitedAt)
    .slice(0, 10)

  return (
    <div>
      {pvEntries.map(([key, value]) => {
        const keys = key.split(':', 2)
        if (keys[0] == 'group') {
          return (
            <Link key={`suggest-${key}`} href={`/groups/${encodeURIComponent(keys[1])}`} passHref>
              <a
                className="block border-b px-4 py-1 text-base text-gray-700 last:border-none hover:bg-gray-100 hover:text-gray-900"
                onClick={handleCloseSuggest}
              >
                groups/{keys[1]}
              </a>
            </Link>
          )
        }
      })}
    </div>
  )
}
