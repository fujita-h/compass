import { NextApiRequest, NextApiResponse } from "next"
import { validateAdminSession } from '@lib/session'
import { prisma } from '@lib/prisma/prismaClient'
import { esClient } from "@lib/elasticsearch/esClient"


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const adminSession = await validateAdminSession(req, res)
  if (!adminSession?.admin) return res.status(401).end()

  const docs = await prisma.document.findMany({
    include: { paper: { include: { user: true, group: true, paper_tag_map: { include: { tag: true } } } } }
  })

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i]
    const tags = doc.paper.paper_tag_map.map((x) => x.tag.text)
    await esClient.upsertDocument({
      id: doc.id,
      document: {
        paperId: doc.paper.id,
        userId: doc.paper.user.id,
        userName: doc.paper.user.username,
        userDisplayName: doc.paper.user.displayName,
        groupId: doc.paper.group.id,
        groupName: doc.paper.group.name,
        groupDisplayName: doc.paper.group.displayName,
        groupType: doc.paper.group.type,
        createdAt: doc.createdAt,
        createdAtNumber: Number(doc.createdAtNumber),
        updatedAt: doc.paper.updatedAt,
        updatedAtNumber: Number(doc.paper.updatedAtNumber),
        title: doc.paper.title,
        tags: tags,
        body: doc.paper.body
      }
    })
  }

  return res.json({ state: 'ok' })

}