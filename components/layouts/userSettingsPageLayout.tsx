import { classNames } from '@lib/utils'
import { NextLink } from '@components/nextLink'

type Props = {
  children?: JSX.Element
  currentUrl?: string
}

export const UserSettingsPageLayout = (props: Props) => {
  const baseUrl = '/settings'
  const items = [
    { name: 'プロフィール', badge: '', href: baseUrl + '/profile', current: props.currentUrl == '/profile' },
    { name: 'テンプレート', badge: '', href: baseUrl + '/templates', current: props.currentUrl == '/templates' },
  ]

  return (
    <>
      <div className="mx-auto mt-4 flex max-w-7xl">
        <div className="mr-5 flex w-80 flex-col">
          <h2 className="mb-4 text-xl">設定</h2>
          <nav className="w-full border">
            {items.map((item) => (
              <MenuItem key={item.name} name={item.name} badge={item.badge} href={item.href} current={item.current} />
            ))}
          </nav>
        </div>
        <div className="mt-10 w-full">{props.children}</div>
      </div>
    </>
  )
}

const MenuItem = ({ name, badge, href, current = false }: { name: any; badge?: any; href?: any; current?: boolean }) => {
  return (
    <NextLink
      href={href}
      className={classNames(
        current ? 'border-l-3 border-l-orange-500 bg-gray-50' : '',
        'flex items-center border px-2 py-1 text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-800'
      )}
    >
      <span className="mx-4 text-lg font-normal">{name}</span>
      <span className="flex-grow text-right">{badge}</span>
    </NextLink>
  )
}
