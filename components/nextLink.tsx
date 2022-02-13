import Link from 'next/link'

export function NextLink(props) {
  let { href, children, passHref, ...rest } = props
  return (
    <Link href={href} passHref>
      <a {...rest}>{children}</a>
    </Link>
  )
}
