import { NextApiRequest, NextApiResponse } from "next"
import { validateAdminSession } from '@lib/session'
import { prisma } from '@lib/prisma/prismaClient'
import { esClient } from "@lib/elasticsearch/esClient"


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const adminSession = await validateAdminSession(req, res)
  if (!adminSession?.admin) return res.status(401).end()

  const docs = await prisma.document.findMany({
    include: { Paper: { include: { User: true, Group: true, Tags: { include: { Tag: true } } } } }
  })

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i]
    const tags = doc.Paper.Tags.map((tag) => tag.Tag.text)
    await esClient.upsertDocument({
      id: doc.id,
      document: {
        paperId: doc.Paper.id,
        userId: doc.Paper.User.id,
        userName: doc.Paper.User.username,
        userDisplayName: doc.Paper.User.displayName,
        groupId: doc.Paper.Group.id,
        groupName: doc.Paper.Group.name,
        groupDisplayName: doc.Paper.Group.displayName,
        groupType: doc.Paper.Group.type,
        createdAt: doc.createdAt,
        createdAtNumber: Number(doc.createdAtNumber),
        updatedAt: doc.Paper.updatedAt,
        updatedAtNumber: Number(doc.Paper.updatedAtNumber),
        title: doc.Paper.title,
        tags: tags,
        body: doc.Paper.body
      }
    })
  }

  return res.json({ state: 'ok' })

}