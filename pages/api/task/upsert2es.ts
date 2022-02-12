import { NextApiRequest, NextApiResponse } from 'next'
import { validateAdminSession } from '@lib/session'
import { prisma } from '@lib/prisma/prismaClient'
import { esClient } from '@lib/elasticsearch/esClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const adminSession = await validateAdminSession(req, res)
  if (!adminSession?.admin) return res.status(401).end()

  const docs = await prisma.document.findMany({
    include: { paper: { include: { user: true, group: true } } },
  })

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i]
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
        updatedAt: doc.paper.updatedAt,
        title: doc.paper.title,
        tags: doc.paper.tags.split(',').filter((tag) => tag !== ''),
        body: doc.paper.body,
      },
    })
  }

  const groups = await prisma.group.findMany()

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]
    await esClient.upsertGroup({
      id: group.id,
      group: {
        name: group.name,
        displayName: group.displayName,
        description: group.description,
        type: group.type,
      },
    })
  }

  const users = await prisma.user.findMany()

  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    await esClient.upsertUser({
      id: user.id,
      user: {
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        description: user.description,
      },
    })
  }

  return res.json({ state: 'ok' })
}
