import { NextApiRequest, NextApiResponse } from "next"
import formidable from "formidable";
import fs from "fs";
import { prisma } from '@lib/prisma/prismaClient'
import { ulid } from 'ulid'
import { validateUserSession } from '@lib/session';
import { getAsString } from "@lib/utils";


export default async function handler (req: NextApiRequest, res: NextApiResponse)  {
  if (req.method === "POST") {

    const userSession = await validateUserSession(req, res)
    if (!userSession?.id) return res.status(401).end()

    const fileType = getAsString(req.query.fileType)
    if (!fileType) return res.status(400).end()

    try {
      const { fields, files }: { fields: formidable.Fields, files: formidable.File[] } = await new Promise((resolve, reject) => {
        formidable({}).parse(req, (err, fields, files) => {
          if (err) { return reject(err) }
          const _files = Array.isArray(files.file) ? files.file : [files.file]
          return resolve({ fields, files: _files })
        })
      })
      const groupId = fields.groupId ? (Array.isArray(fields.groupId) ? fields.groupId[0] : fields.groupId) : undefined
      const results = await Promise.allSettled(files.map((file) =>
        new Promise((resolve, reject) => {
          saveFile(fileType, file, userSession.id, groupId)
            .then((data) => resolve(data))
            .catch((error) => reject(error))
        })
      ))
      res.status(200).json(results)
    } catch (error) {
      res.status(500).json({ error: error })
    }
  } else {
    res.status(405).end()
  }
}

const saveFile = async (fileType: string, file: formidable.File, userId: string, groupId: string) => {
  try {
    const blob = fs.readFileSync(file.filepath);
    return storeFile({ fileType, userId, groupId, file, blob })
  } catch (error) {
    console.error(error)
  } finally {
    fs.unlinkSync(file.filepath)
  }
};

const storeFile = ({ fileType, userId, groupId, file, blob }: { fileType: string, userId: string, groupId: string, file: formidable.File, blob: Buffer }) => {
  switch (fileType) {
    case 'attachments':
      return storeAttachment({ userId, file, blob })
    case 'usericons':
      return storeUserIcon({ userId, file, blob })
    case 'groupicons':
      return storeGroupIcon({ groupId, file, blob })
    default:
      throw 'Unknown fileType'
  }
}

const storeAttachment = ({ userId, file, blob }: { userId: string, file: formidable.File, blob: Buffer }) => {
  return prisma.attachment.create({
    data: {
      id: ulid(),
      userId: userId.toUpperCase(),
      fileName: file.originalFilename,
      mimeType: file.mimetype,
      blob
    },
    select: {
      id: true,
      userId: true,
      fileName: true,
      mimeType: true,
      blob: false,
    }
  })
}

const storeUserIcon = ({ userId, file, blob }: { userId: string, file: formidable.File, blob: Buffer }) => {
  return prisma.user_icon.upsert({
    where: { userId },
    create: {
      id: ulid(),
      userId: userId.toUpperCase(),
      mimeType: file.mimetype,
      blob
    },
    update: {
      mimeType: file.mimetype,
      blob
    },
    select: {
      id: true,
      userId: true,
      mimeType: true,
      blob: false,
    }
  })
}

const storeGroupIcon = ({ groupId, file, blob }: { groupId: string, file: formidable.File, blob: Buffer }) => {
  return prisma.group_icon.upsert({
    where: { groupId },
    create: {
      id: ulid(),
      groupId: groupId.toUpperCase(),
      mimeType: file.mimetype,
      blob
    },
    update: {
      mimeType: file.mimetype,
      blob
    },
    select: {
      id: true,
      groupId: true,
      mimeType: true,
      blob: false,
    }
  })
}


export const config = {
  api: {
    bodyParser: false
  }
}