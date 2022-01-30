import { NextApiRequest, NextApiResponse } from 'next';
import { getCookie, removeCookie, setCookie } from '@lib/cookie'
import Iron from '@hapi/iron'
import Crypto from "crypto";
import { prisma } from '@lib/prisma/prismaClient'

const USER_TOKEN_NAME = process.env.USER_TOKEN_NAME || 'token'
const USER_TOKEN_SECRET = process.env.USER_TOKEN_SECRET || process.env.TOKEN_SECRET
const USER_TOKEN_MAX_AGE = 60 * 60 * 24 * 7 // 1 week
const USER_TOKEN_UPDATE_THRESHOLD = 1.2
// USER_TOKEN_UPDATE_THRESHOLD:0 から 1 の値
// 0.5: セッションの残り有効期限が50%になったらアップデートする
// 0: アップデートしない, 1: 常にアップデート


const ADMIN_TOKEN_NAME = process.env.ADMIN_TOKEN_NAME || 'adminToken'
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || process.env.TOKEN_SECRET
const ADMIN_TOKEN_MAX_AGE = 8 * 60 * 60 // 8 hours
const ADMIN_TOKEN_UPDATE_THRESHOLD = 0.25

export type UserSession = {
  id: string,
  random: string,
  createdAt: number,
  maxAge: number,
}
export type AdminSession = {
  admin: boolean,
  random: string,
  createdAt: number,
  maxAge: number,
}

export async function validateUserSession(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = getCookie(req, USER_TOKEN_NAME)
    if (!token) return null

    const session: UserSession = await Iron.unseal(token, USER_TOKEN_SECRET, Iron.defaults)
    if(!session?.id) return null

    // DB のユーザーに存在するかチェックし、存在しなければセッションを破棄する
    const check = await prisma.user.findUnique({ where: { id: session.id }, select: { id: true } })
    if (!check) {
      removeUserSession(res)
      return null
    }

    // 期限切れの場合はセッションを破棄する
    const expiresAt = session.createdAt + session.maxAge * 1000
    if (Date.now() > expiresAt) {
      removeUserSession(res)
      return null
    }

    // 閾値を超えたらセッションのアップデートする
    if (Date.now() > expiresAt - (session.maxAge * 1000 * USER_TOKEN_UPDATE_THRESHOLD)) {
      await setUserSession(res, session)
    }

    return session

  } catch (error) {
    console.error(error)
    return null
  }
}

export async function setUserSession(res, session: Omit<UserSession, 'random' | 'createdAt' | 'maxAge'>) {
  const random = Crypto.randomBytes(8).toString("hex")
  const newSession = { ...session, random, createdAt: Date.now(), maxAge: USER_TOKEN_MAX_AGE }
  const token = await Iron.seal(newSession, USER_TOKEN_SECRET, Iron.defaults)
  setCookie(res, USER_TOKEN_NAME, token, USER_TOKEN_MAX_AGE)
}

export function removeUserSession(res) {
  removeCookie(res, USER_TOKEN_NAME)
}


export async function validateAdminSession(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = getCookie(req, ADMIN_TOKEN_NAME)
    if (!token) return null

    const session: AdminSession = await Iron.unseal(token, ADMIN_TOKEN_SECRET, Iron.defaults)

    // 期限切れの場合はセッションを破棄する
    const expiresAt = session.createdAt + session.maxAge * 1000
    if (Date.now() > expiresAt) {
      removeAdminSession(res)
      return null
    }

    // 閾値を超えたらセッションのアップデートする
    if (Date.now() > expiresAt - (session.maxAge * 1000 * ADMIN_TOKEN_UPDATE_THRESHOLD)) {
      await setAdminSession(res, session)
    }

    return { ...session }

  } catch {
    return null
  }
}


export async function setAdminSession(res, session: Omit<AdminSession, 'random' | 'createdAt' | 'maxAge'>) {
  const random = Crypto.randomBytes(8).toString("hex")
  const newSession = { ...session, random, createdAt: Date.now(), maxAge: ADMIN_TOKEN_MAX_AGE }
  const token = await Iron.seal(newSession, ADMIN_TOKEN_SECRET, Iron.defaults)
  setCookie(res, ADMIN_TOKEN_NAME, token, ADMIN_TOKEN_MAX_AGE)
}

export function removeAdminSession(res) {
  removeCookie(res, ADMIN_TOKEN_NAME)
}