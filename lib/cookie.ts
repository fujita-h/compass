import { serialize, parse } from 'cookie'
import { IncomingMessage, OutgoingMessage } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'

export function parseCookies(req: NextApiRequest) {
  // For API Routes we don't need to parse the cookies.
  if (req.cookies) return req.cookies

  // For pages we do need to parse the cookies.
  const cookie = req.headers?.cookie
  return parse(cookie || '')
}

export function getCookie(req: NextApiRequest, cookieName: string): string {
  const cookies = parseCookies(req)
  return cookies[cookieName]
}

export function setCookie(res: NextApiResponse | OutgoingMessage, name: string, value: string, maxAge: number) {
  const cookie = serialize(name, value, {
    maxAge: maxAge,
    //expires: new Date(Date.now() + TOKEN_MAX_AGE * 1000),
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none',
  })

  res.setHeader('Set-Cookie', cookie)
}

export function removeCookie(res: NextApiResponse | OutgoingMessage, name: string) {
  const cookie = serialize(name, '', {
    maxAge: -1,
    path: '/',
  })

  res.setHeader('Set-Cookie', cookie)
}
