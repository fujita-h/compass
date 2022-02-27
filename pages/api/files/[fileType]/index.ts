import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import { prisma } from '@lib/prisma/prismaClient'
import { ulid } from 'ulid'
import { validateUserSession } from '@lib/session'
import { getAsString } from '@lib/utils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const userSession = await validateUserSession(req, res)
    if (!userSession?.id) return res.status(401).end()

    const fileType = getAsString(req.query.fileType)
    if (!fileType) return res.status(400).end()

    try {
      const { fields, files }: { fields: formidable.Fields; files: formidable.File[] } = await new Promise((resolve, reject) => {
        formidable({}).parse(req, (err, fields, files) => {
          if (err) {
            return reject(err)
          }
          const _files = Array.isArray(files.file) ? files.file : [files.file]
          return resolve({ fields, files: _files })
        })
      })
      const groupId = fields.groupId ? (Array.isArray(fields.groupId) ? fields.groupId[0] : fields.groupId) : undefined
      const tag = fields.tag ? (Array.isArray(fields.tag) ? fields.tag[0] : fields.tag) : undefined
      const results = await Promise.allSettled(
        files.map(
          (file) =>
            new Promise((resolve, reject) => {
              saveFile(fileType, file, userSession.id, groupId, tag)
                .then((data) => resolve(data))
                .catch((error) => reject(error))
            })
        )
      )
      res.status(200).json(results)
    } catch (error) {
      res.status(500).json({ error: error })
    }
  } else {
    res.status(405).end()
  }
}

const saveFile = async (fileType: string, file: formidable.File, userId: string, groupId: string, tag: string) => {
  try {
    const blob = fs.readFileSync(file.filepath)
    return storeFile({ fileType, userId, groupId, tag, file, blob })
  } catch (error) {
    console.error(error)
  } finally {
    fs.unlinkSync(file.filepath)
  }
}

const storeFile = ({
  fileType,
  userId,
  groupId,
  tag,
  file,
  blob,
}: {
  fileType: string
  userId: string
  groupId: string
  tag: string
  file: formidable.File
  blob: Buffer
}) => {
  switch (fileType) {
    case 'attachments':
      return storeAttachment({ userId, file, blob })
    case 'usericons':
      return storeUserIcon({ userId, file, blob })
    case 'usercovers':
      return storeUserCover({ userId, file, blob })
    case 'groupicons':
      return storeGroupIcon({ groupId, file, blob })
    case 'groupcovers':
      return storeGroupCover({ groupId, file, blob })
    case 'tagicons':
      return storeTagIcon({ tag, file, blob, userId })
    case 'tagcovers':
      return storeTagCover({ tag, file, blob, userId })
    default:
      throw 'Unknown fileType'
  }
}

const storeAttachment = ({ userId, file, blob }: { userId: string; file: formidable.File; blob: Buffer }) => {
  return prisma.attachment.create({
    data: {
      id: ulid(),
      userId: userId.toUpperCase(),
      fileName: file.originalFilename,
      mimeType: file.mimetype,
      blob,
    },
    select: {
      id: true,
      userId: true,
      fileName: true,
      mimeType: true,
      blob: false,
    },
  })
}

const storeUserIcon = ({ userId, file, blob }: { userId: string; file: formidable.File; blob: Buffer }) => {
  return prisma.user_icon.upsert({
    where: { userId },
    create: {
      id: ulid(),
      userId: userId.toUpperCase(),
      mimeType: file.mimetype,
      blob,
    },
    update: {
      mimeType: file.mimetype,
      blob,
    },
    select: {
      id: true,
      userId: true,
      mimeType: true,
      blob: false,
    },
  })
}

const storeUserCover = ({ userId, file, blob }: { userId: string; file: formidable.File; blob: Buffer }) => {
  return prisma.user_cover.upsert({
    where: { userId },
    create: {
      id: ulid(),
      userId: userId.toUpperCase(),
      mimeType: file.mimetype,
      blob,
    },
    update: {
      mimeType: file.mimetype,
      blob,
    },
    select: {
      id: true,
      userId: true,
      mimeType: true,
      blob: false,
    },
  })
}

const storeGroupIcon = ({ groupId, file, blob }: { groupId: string; file: formidable.File; blob: Buffer }) => {
  return prisma.group_icon.upsert({
    where: { groupId },
    create: {
      id: ulid(),
      groupId: groupId.toUpperCase(),
      mimeType: file.mimetype,
      blob,
    },
    update: {
      mimeType: file.mimetype,
      blob,
    },
    select: {
      id: true,
      groupId: true,
      mimeType: true,
      blob: false,
    },
  })
}

const storeGroupCover = ({ groupId, file, blob }: { groupId: string; file: formidable.File; blob: Buffer }) => {
  return prisma.group_cover.upsert({
    where: { groupId },
    create: {
      id: ulid(),
      groupId: groupId.toUpperCase(),
      mimeType: file.mimetype,
      blob,
    },
    update: {
      mimeType: file.mimetype,
      blob,
    },
    select: {
      id: true,
      groupId: true,
      mimeType: true,
      blob: false,
    },
  })
}

const storeTagIcon = ({ tag, file, blob, userId }: { tag: string; file: formidable.File; blob: Buffer; userId: string }) => {
  const now = Date.now()
  return prisma.tag_meta.upsert({
    where: { tag },
    create: {
      tag: tag,
      iconMimeType: file.mimetype,
      iconBlob: blob,
      coverMimeType: '',
      user: { connect: { id: userId.toUpperCase() } },
      updatedAt: new Date(now).toISOString(),
      updatedAtNumber: now,
    },
    update: {
      iconMimeType: file.mimetype,
      iconBlob: blob,
      user: { connect: { id: userId.toUpperCase() } },
      updatedAt: new Date(now).toISOString(),
      updatedAtNumber: now,
    },
    select: {
      tag: true,
      iconMimeType: true,
      iconBlob: true,
    },
  })
}

const storeTagCover = ({ tag, file, blob, userId }: { tag: string; file: formidable.File; blob: Buffer; userId: string }) => {
  const now = Date.now()
  return prisma.tag_meta.upsert({
    where: { tag },
    create: {
      tag: tag,
      coverMimeType: file.mimetype,
      coverBlob: blob,
      iconMimeType: '',
      user: { connect: { id: userId.toUpperCase() } },
      updatedAt: new Date(now).toISOString(),
      updatedAtNumber: now,
    },
    update: {
      coverMimeType: file.mimetype,
      coverBlob: blob,
      user: { connect: { id: userId.toUpperCase() } },
      updatedAt: new Date(now).toISOString(),
      updatedAtNumber: now,
    },
    select: {
      tag: true,
      coverMimeType: true,
      coverBlob: true,
    },
  })
}

export const config = {
  api: {
    bodyParser: false,
  },
}
