import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/prisma/prismaClient'
import { getAsString } from '@lib/utils'
import { validateUserSession, validateAdminSession } from '@lib/session'
import * as CryptoJs from 'crypto-js'
import Identicon from 'identicon.js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userSession = await validateUserSession(req, res)
  const adminSession = await validateAdminSession(req, res)

  if (!userSession?.id && !adminSession?.admin) return res.status(401).end()

  const fileType = getAsString(req.query.fileType)
  const id = getAsString(req.query.id)

  if (!fileType) return res.status(400).end()
  if (!id) return res.status(400).end()

  const data = await getFile(fileType, id)
  if (!data) return res.status(404).end()

  res.setHeader('Content-Type', data.mimeType)
  res.setHeader('Content-Length', data.blob.length)
  res.status(200).send(data.blob)
}

const getFile = async (fileType: string, id: string) => {
  switch (fileType) {
    case 'attachments':
      return getAttachmentFile(id)
    case 'usericons':
      return getUserIconFile(id)
    case 'groupicons':
      return getGroupIconFile(id)
    default:
      throw 'Unknown fileType'
  }
}
const getAttachmentFile = async (id: string) => {
  const data = await prisma.attachment.findUnique({ where: { id } })
  return data ? { mimeType: data.mimeType, blob: data.blob } : undefined
}

const getUserIconFile = async (id: string) => {
  const data = await prisma.user_icon.findUnique({ where: { userId: id } })
  return data ? { mimeType: data.mimeType, blob: data.blob } : { mimeType: 'image/svg+xml', blob: denticon(id).render().getDump() }
}

const getGroupIconFile = async (id: string) => {
  const data = await prisma.group_icon.findUnique({ where: { groupId: id } })
  return data ? { mimeType: data.mimeType, blob: data.blob } : { mimeType: 'image/svg+xml', blob: denticon(id).render().getDump() }
}

const denticon = (id: string) => {
  return new Identicon(CryptoJs.MD5(id.toUpperCase()).toString(), {
    size: 128,
    format: 'svg',
  })
}
