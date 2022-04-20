import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/prisma/prismaClient'
import { getAsString } from '@lib/utils'
import { validateUserSession, validateAdminSession } from '@lib/session'
import * as jdenticon from 'jdenticon'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
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
    res.end()
  } catch (error) {
    res.status(500).json({ error })
  }
}

const getFile = (fileType: string, id: string) => {
  switch (fileType) {
    case 'attachments':
      return getAttachmentFile(id)
    case 'usericons':
      return getUserIconFile(id)
    case 'usercovers':
      return getUserCoverFile(id)
    case 'groupicons':
      return getGroupIconFile(id)
    case 'groupcovers':
      return getGroupCoverFile(id)
    case 'tagicons':
      return getTagIconFile(id)
    case 'tagcovers':
      return getTagCoverFile(id)
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
  jdenticon.configure({ backColor: '#ffffff' })
  return data ? { mimeType: data.mimeType, blob: data.blob } : { mimeType: 'image/svg+xml', blob: jdenticon.toPng(id, 256) }
}

const getUserCoverFile = async (id: string) => {
  const data = await prisma.user_cover.findUnique({ where: { userId: id } })
  jdenticon.configure({ backColor: '#88882220' })
  return data ? { mimeType: data.mimeType, blob: data.blob } : { mimeType: 'image/svg+xml', blob: jdenticon.toPng(id, 800) }
}

const getGroupIconFile = async (id: string) => {
  const data = await prisma.group_icon.findUnique({ where: { groupId: id } })
  jdenticon.configure({ backColor: '#ffffff' })
  return data ? { mimeType: data.mimeType, blob: data.blob } : { mimeType: 'image/png', blob: jdenticon.toPng(id, 256) }
}

const getGroupCoverFile = async (id: string) => {
  const data = await prisma.group_cover.findUnique({ where: { groupId: id } })
  jdenticon.configure({ backColor: '#22888820' })
  return data ? { mimeType: data.mimeType, blob: data.blob } : { mimeType: 'image/png', blob: jdenticon.toPng(id, 800) }
}

const getTagIconFile = async (id: string) => {
  const data = await prisma.tag_meta.findUnique({ where: { tag: id }, select: { iconMimeType: true, iconBlob: true } })
  jdenticon.configure({ backColor: '#ffffff' })
  return data && data.iconMimeType && data.iconBlob
    ? { mimeType: data.iconMimeType, blob: data.iconBlob }
    : { mimeType: 'image/png', blob: jdenticon.toPng(id, 256) }
}

const getTagCoverFile = async (id: string) => {
  const data = await prisma.tag_meta.findUnique({ where: { tag: id }, select: { coverMimeType: true, coverBlob: true } })
  jdenticon.configure({ backColor: '#22888820' })
  return data && data.coverMimeType && data.coverBlob
    ? { mimeType: data.coverMimeType, blob: data.coverBlob }
    : { mimeType: 'image/png', blob: jdenticon.toPng(id, 800) }
}
