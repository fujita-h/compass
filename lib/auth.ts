import bcrypt from 'bcrypt'
import { prisma } from './prisma/prismaClient'
import { ulid } from 'ulid'
import { MultiSamlStrategy } from 'passport-saml'
import { Strategy } from 'passport-local'
import { type } from 'os'

const saltRounds = 12
const REGEX_USERNAME_RULE = /^[a-z][a-z0-9-_]{2,}$/

export async function createUser({ uuid: _uuid, username: _username, email: _email, password }: { uuid?: string, username?: string, email?: string, password?: string })
  : Promise<{ id: string, uuid: string, username: string, email: string } | null> {

  // ユーザー名ルール適合チェック
  if (_username && _username.match(REGEX_USERNAME_RULE) == null) {
    return Promise.reject('Invalid username')
  }

  const id = ulid()
  const uuid = _uuid ?? id
  const username = _username ?? id
  const email = _email ?? id
  const hash = password ? await bcrypt.hash(password, saltRounds) : null

  const now = Date.now()
  return await prisma.user.create({
    data: { id, uuid, username, email, hash, createdAt: new Date(now).toISOString(), createdAtNumber: now },
    select: {
      id: true,
      uuid: true,
      username: true,
      email: true,
    }
  })
}

export async function findUser({ id, uuid, username, email, includeHash = false }: { id?: string, uuid?: string, username?: string, email?: string, includeHash?: boolean })
  : Promise<{ id: string, uuid: string, username: string, email: string, hash?: string } | null> {

  const select = {
    id: true,
    uuid: true,
    username: true,
    email: true,
    hash: includeHash,
  }

  if (id) {
    return await prisma.user.findUnique({ where: { id }, select })
  } else if (uuid) {
    return await prisma.user.findUnique({ where: { uuid }, select })
  } else if (username) {
    return await prisma.user.findUnique({ where: { username }, select })
  } else if (email) {
    return await prisma.user.findUnique({ where: { email }, select })
  } else {
    return null
  }
}

export function validatePassword(hash: string, password: string) {
  const match = bcrypt.compareSync(password, hash)
  return match
}

export const localStrategy = new Strategy((username: string, password: string, done) => {

  // username がメールアドレスである可能性を考慮する
  //   xxx の形式 -> ユーザー名
  //   @xxx の形式 -> @を取り除いてユーザー名
  //   xxx@yyy の形式 -> メールアドレス
  const query = { username: null, email: null }
  if (username.startsWith('@')) {
    query.username = username.replace('@', '')
  } else if (username.includes('@')) {
    query.email = username
  } else {
    query.username = username
  }

  findUser({ ...query, includeHash: true })
    .then((user) => {
      if (!user || !user.hash) done(new Error('ユーザー名/メールアドレスとパスワードに誤りがあるか、ログインできない状態です'))

      if (validatePassword(user.hash, password)) {
        //delete (user.hash)
        user.hash = null
        done(null, user)
      } else {
        done(new Error('ユーザー名/メールアドレスとパスワードに誤りがあるか、ログインできない状態です'))
      }
    }).catch((error) => {
      done(error)
    })
})

export const samlStrategy = new MultiSamlStrategy(
  {
    passReqToCallback: true,
    getSamlOptions: async function (req, done) {
      const id = req.query.id as string | undefined
      const idp = await prisma.saml.findUnique({ where: { id } })
      if (!idp) return done(new Error('Idp not found'))
      return done(null, { path: '/api/auth/user/saml/idps/' + idp.id + '/callback', entryPoint: idp.entryPoint, issuer: idp.issuer, cert: idp.cert })
    }
  }, (req, profile, done) => {
    const { id } = req.query
    return done(null, { id, profile })
  })

export async function getSamlIdp({ id }: { id: string }) {
  return await prisma.saml.findUnique({
    where: { id }
  })
}
