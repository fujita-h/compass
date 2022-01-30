import Link from 'next/link'
import React, { useState } from 'react';
import { useSessionQuery, useHeaderQuery, Auth } from '@graphql/generated/react-apollo'
import { BsSearch } from 'react-icons/bs'
import { FaUserCircle, FaRegBell } from 'react-icons/fa'
import { BiDownArrow } from 'react-icons/bi'
import { getPageViews } from '@lib/localStorage/pageViews';

export type MyProfile = {
  id: String
}

const BlankHeader = ({ children }: { children?: JSX.Element }) => (<>
  <nav className="bg-zinc-800 text-white">
    <div className="max-w-none h-12 mx-auto px-4">
      {children}
    </div>
  </nav>
</>)

export const Header = ({ searchText = '' }: { searchText?: string }) => {

  const { data, loading } = useSessionQuery({ fetchPolicy: 'network-only' })
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchSuggestOpen, setSearchSuggestOpen] = useState(false)
  const [currentSearchText, setCurrentSearchText] = useState(searchText)

  const handleCloseSuggest = (e) => { setSearchSuggestOpen(false) }

  if (loading) return (<BlankHeader />)
  if (!data) return (<BlankHeader />)

  return (<BlankHeader>
    <div className="flex items-center justify-between h-full">

      <div className='block'>
        <div className='flex gap-3 items-baseline'>
          <div className='my-auto'>
            <Link href="/" passHref>
              <a className='hover:text-gray-300'>Compass</a>
            </Link>
          </div>

          <div className='mr-2 items-center h-7'
            onFocus={() => { setSearchSuggestOpen(true) }}
            onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) { setSearchSuggestOpen(false) } }}>
            <form method='GET' action='/search'>
              <input type="text" placeholder='検索..' autoComplete='off' value={currentSearchText} onChange={(e) => setCurrentSearchText(e.target.value)} name='q'
                className={`box-border w-52 h-full border-2 rounded-lg pl-2 pr-3 pt-1 pb-0.5 text-sm text-gray-700 duration-200 focus:rounded-b-none focus:outline-none focus:shadow-outline  focus:w-100`} />
            </form>
            <div hidden={!searchSuggestOpen}
              className="z-40 origin-top-right absolute mt-0 w-100 rounded-b-lg shadow-lg bg-white ring-1 ring-black ring-opacity-10">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu" >
                {searchSuggestOpen && currentSearchText ?
                  <div>
                    <Link href={`/search?q=${encodeURIComponent(currentSearchText)}`} passHref>
                      <a className='block px-4 py-1 border-b text-gray-700 hover:bg-gray-100 hover:text-gray-900 last:border-none text-base' onClick={handleCloseSuggest}><BsSearch className='inline-block mr-2' /><span>{currentSearchText}</span></a>
                    </Link>
                  </div> : <></>}
                {searchSuggestOpen ? <SearchMenu handleCloseSuggest={handleCloseSuggest} /> : <></>}
              </div>
            </div>
          </div>

          <div className='text-sm'><Link href="#" passHref><a className='hover:text-gray-300'>Gruops</a></Link></div>

          <div className='text-sm'><Link href="#" passHref><a className='hover:text-gray-300'>Tags</a></Link></div>

        </div>
      </div>


      <div className="block items-center">
        <div className="ml-4 flex items-center">
          <div className="ml-3 relative">

            {Boolean(data.session?.userSession?.id) ?
              <>
                {/* Logged-in Menu */}
                <div className='flex'>

                  <div className="flex items-center justify-center w-full rounded-md px-2 py-1 text-sm font-medium hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-500">
                    <FaRegBell className='h-5 w-5' />
                  </div>

                  {/* User Menu */}
                  <div
                    className="relative inline-block text-left hover:cursor-pointer"
                    onClick={(e) => e.currentTarget.focus()}
                    onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) { setUserMenuOpen(false) } }}
                    tabIndex={0}>
                    {/* Menu Button */}
                    <div onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center justify-center w-full rounded-md px-3 py-1 text-sm font-medium hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-500" id="options-menu">
                      <FaUserCircle className='h-6 w-6' />
                    </div>
                    {/* Menu List */}
                    <div hidden={!userMenuOpen}
                      className="z-40 origin-top-right absolute right-0 mt-2 w-52 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-10">
                      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu" >
                        <Link href="/profile" passHref>
                          <a className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900">Profile</a>
                        </Link>
                        <span className="block border-b"></span>
                        <Link href="/settings/profile" passHref>
                          <a className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900">設定</a>
                        </Link>
                        <span className="block border-b"></span>
                        <a href="/logout" className="block px-4 py-2 text-md text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">ログアウト</a>
                      </div>
                    </div>
                  </div>
                </div>
              </>
              :
              <>
                {/* Not-Logged-in, Login Link */}
                <div className="relative inline-block text-left hover:cursor-pointer">
                  <Link href="/login" passHref>
                    <a className="block px-4 py-2 hover:text-gray-300">Login</a>
                  </Link>
                </div>
              </>
            }
          </div>
        </div>
      </div>
    </div>

  </BlankHeader>)
}

export const AdminHeader = () => {
  //const session = useAdminSession()
  const { data, loading } = useSessionQuery()

  if (loading) return (<></>)
  if (!data) return (<></>)

  //if (!session) return (<></>)

  return (
    <nav className="bg-gray-800 text-gray-50 border-b-4 border-red-600">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex items-center justify-between h-16">
          <div>
            <Link href="/admin" passHref><a className="flex-shrink-0 hover:text-current">
              <span className="font-bold text-xl">compass admin</span>
            </a></Link>
          </div>
          <div className="flex mr-3">
            <div className="mr-3">
              <Link href="/" passHref><a className="text-gray-400 hover:text-gray-200">Back to Portal</a></Link>
            </div>
            {!Boolean(data.session?.adminSession?.admin) &&
              <div>
                <Link href="/admin/login" passHref><a className="text-gray-400 hover:text-gray-200">Login</a></Link>
              </div>
            }
            {Boolean(data.session?.adminSession?.admin) &&
              <div>
                <Link href="/admin/logout" passHref><a className="text-gray-400 hover:text-gray-200">Logout</a></Link>
              </div>
            }
          </div>
        </div>
      </div>
    </nav>

  )
}

const SearchMenu = ({ handleCloseSuggest }) => {
  const pageViews = getPageViews()
  const pvEntries = Object.entries(pageViews).sort(([key_a, value_a], [key_b, value_b]) => value_b.lastVisitedAt - value_a.lastVisitedAt).slice(0, 10)

  return (<div>
    {pvEntries.map(([key, value]) => {
      const keys = key.split(':', 2)
      if (keys[0] == 'group') {
        return (
          <Link key={`suggest-${key}`} href={`/groups/${encodeURIComponent(keys[1])}`} passHref>
            <a className="block px-4 py-1 border-b text-gray-700 hover:bg-gray-100 hover:text-gray-900 last:border-none text-base" onClick={handleCloseSuggest}>groups/{keys[1]}</a>
          </Link>
        )
      }
    })}
  </div>)
}