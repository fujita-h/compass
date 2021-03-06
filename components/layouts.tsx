import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { Header, AdminHeader } from './headers'
import { Footer } from '@components/footer'

export const Layout = ({
  children,
  htmlTitle,
  searchText,
  showFooter = true,
}: {
  children?: any
  htmlTitle?: string
  searchText?: string
  showFooter?: boolean
}) => {
  return (
    <>
      <Head>
        <title key="title">{htmlTitle || 'compass'}</title>
      </Head>
      <div className="flex min-h-screen flex-col bg-gray-100">
        <header>
          <Header searchText={searchText} />
        </header>
        <main className="flex-1">
          <div className="max-w-full">{children}</div>
        </main>
        <footer>{showFooter ? <Footer /> : <></>}</footer>
      </div>
    </>
  )
}

export const AdminLayout = ({
  children,
  withMenu,
  fluid = 'xxl',
}: {
  children?: any
  withMenu?: boolean
  fluid?: boolean | 'xxl' | 'sm' | 'md' | 'lg' | 'xl'
}) => {
  const router = useRouter()

  const MenuItem = useCallback(({ name, badge, href, selected = false }: { name: any; badge?: any; href?: any; selected?: boolean }) => {
    return (
      <Link href={href} passHref>
        <a
          className={
            selected
              ? 'my-3 flex items-center rounded-lg bg-gray-50 p-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-800'
              : 'my-3 flex items-center rounded-lg p-2 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-800'
          }
        >
          <span className="mx-4 text-lg font-normal">{name}</span>
          <span className="flex-grow text-right">{badge}</span>
        </a>
      </Link>
    )
  }, [])

  return (
    <>
      <Head>
        <title key="title">compass Admin</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        <header>
          <AdminHeader />
        </header>
        <main>
          <div className="mx-auto mt-4 mb-4 max-w-7xl px-1">
            <div className="relative bg-white dark:bg-gray-800">
              <div className="flex flex-col sm:flex-row sm:justify-around">
                {withMenu && (
                  <div className="w-80">
                    <nav className="mt-3 px-3">
                      <MenuItem name="Admin Home" badge="" href="/admin" selected={router.pathname == '/admin'} />
                      <MenuItem name="??????" href="/admin/auth" selected={router.pathname == '/admin/auth'} />
                      <MenuItem name="????????????" href="/admin/groups" selected={router.pathname.startsWith('/admin/groups')} />
                    </nav>
                  </div>
                )}
                <div className="w-full">{children}</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
