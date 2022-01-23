import { Auth, PageInfo, Resolvers, UserConnection, UserEdge, DocumentConnection, DocumentEdge, GroupConnection, GroupEdge } from '@graphql/generated/resolvers'
import { ApolloError, AuthenticationError, ForbiddenError, UserInputError } from 'apollo-server-micro'
import { prisma } from '@lib/prisma/prismaClient'
import { esClient } from '@lib/elasticsearch/esClient'
import { UserSession, AdminSession } from '@lib/session'
import { ulid } from 'ulid'
import { Prisma } from '.prisma/client'
import { NextApiResponse } from 'next'
import { IncomingHttpHeaders } from 'http'

export type GraphQLResolveContext = {
  headers: IncomingHttpHeaders
  res: NextApiResponse<any>
  userSession: UserSession
  adminSession: AdminSession
}

export const resolvers: Resolvers = {
  Query: {
    session: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      return {
        userSession: _context.userSession,
        adminSession: _context.adminSession,
      }
    },
    configuration: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        const result = await prisma.configuration.findFirst()
        return result ?? await prisma.configuration.create({ data: {} })
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    samls: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        return await prisma.saml.findMany()
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        return (await prisma.saml.findMany())
          .map(x => {
            x.cert = ''
            return x
          })
      }
      if (auth == 'none') {
        return (await prisma.saml.findMany())
          .map(x => {
            x.cert = ''
            return x
          })
      }
      throw new ApolloError('Unknown')
    },
    groups: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        return await prisma.group.findMany({})
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        return await prisma.group.findMany({})
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    group: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, id, name } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        if (!id && !name) throw new UserInputError('Invalid argument')
        return await prisma.group.findUnique({
          where: {
            id: id ? id.toUpperCase() : undefined,
            name: name ?? undefined,
          },
          include: { MapUserGroup: { include: { User: true } } }
        })
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        if (!id && !name) throw new UserInputError('Invalid argument')
        return await prisma.group.findUnique({
          where: {
            id: id ? id.toUpperCase() : undefined,
            name: name ?? undefined,
          },
          include: { MapUserGroup: { include: { User: true } } }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    joinedGroups: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      if (!_context.userSession) throw new AuthenticationError('Unauthorized')
      return (await prisma.mapUserGroup.findMany({ where: { userId: args.userId }, include: { Group: true } })).map(x => x.Group)
    },
    myJoinedGroups: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      if (!_context.userSession) throw new AuthenticationError('Unauthorized')
      return (await prisma.mapUserGroup.findMany({ where: { userId: _context.userSession.id }, include: { Group: true } })).map(x => x.Group)
    },
    myJoinedGroupsCP: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { first, after } = args
      if (!_context.userSession) throw new AuthenticationError('Unauthorized')
      const targetCursor: string = after ? (Buffer.from(after, 'base64').toString()) : Number.MAX_SAFE_INTEGER.toString()
      const _edges: GroupEdge[] = (await prisma.mapUserGroup.findMany({
        where: {
          userId: _context.userSession.id,
          Group: {
            name: { gt: targetCursor }
          }
        },
        include: { Group: true },
        orderBy: { Group: { name: 'asc' } },
        take: first + 1
      })).map(_item => {
        return {
          node: _item.Group,
          cursor: Buffer.from(_item.Group.name.toString(), 'ascii').toString('base64')
        }
      })
      const hasNextPage: boolean = _edges.length > first
      const edges: GroupEdge[] = hasNextPage ? _edges.slice(0, first) : _edges
      const pageInfo: PageInfo = {
        endCursor: edges.length ? edges.slice(-1)[0].cursor : '',
        hasNextPage: hasNextPage
      }
      const result: GroupConnection = { edges, pageInfo }
      return result
    },
    users: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, offset, limit } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        return await prisma.user.findMany({ skip: offset, take: limit })
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        return await prisma.user.findMany({
          select: { id: true, uuid: true, username: true, email: true },
          skip: offset, take: limit
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    usersCP: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, first, after } = args

      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')

        const targetId: string = after ? (Buffer.from(after, 'base64').toString()) : ''
        const _edges: UserEdge[] = (await prisma.user.findMany({ where: { id: { gt: targetId } }, take: first + 1 })).map(user => {
          return {
            node: user,
            cursor: Buffer.from(user.id, 'ascii').toString('base64')
          }
        })
        const hasNextPage: boolean = _edges.length > first
        const edges: UserEdge[] = hasNextPage ? _edges.slice(0, first) : _edges
        const pageInfo: PageInfo = {
          endCursor: edges.length ? edges.slice(-1)[0].cursor : '',
          hasNextPage: hasNextPage
        }
        const result: UserConnection = { edges, pageInfo }
        return result
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    countUsers: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        return await prisma.user.count()
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        return await prisma.user.count()
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    user: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, id, uuid, username, email } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        return await prisma.user.findUnique({
          where: {
            id: id ? id.toUpperCase() : undefined,
            uuid: uuid ? uuid.toUpperCase() : undefined,
            username: username ?? undefined,
            email: email ?? undefined,
          },
          include: { Follow: true, Follower: true }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    myProfile: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      if (!_context.userSession) return null
      return await prisma.user.findUnique({ where: { id: _context.userSession.id } })
    },
    myTimelineCP: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { first, after } = args
      if (!_context.userSession) throw new AuthenticationError('Unauthorized')
      const targetCursor: string = after ? (Buffer.from(after, 'base64').toString()) : Number.MAX_SAFE_INTEGER.toString()
      const followerResult = await prisma.user.findUnique({
        where: { id: _context.userSession.id },
        include: { Follower: true },
      })
      const follower = (followerResult && followerResult.Follower) ? followerResult.Follower.map(x => x.fromUserId) : []

      const _edges: DocumentEdge[] = (await prisma.document.findMany({
        where: {
          Paper: {
            OR: [
              { Group: { MapUserGroup: { some: { userId: { equals: _context.userSession.id } } } } },
              { User: { id: { in: follower } } }
            ],
            updatedAtNumber: { lt: Number(targetCursor) }
          }
        },
        include: { Paper: { include: { User: true, Group: true, Tags: { include: { Tag: true } } } } },
        orderBy: { Paper: { updatedAtNumber: 'desc' } },
        take: first + 1
      })).map(_item => {
        return {
          node: _item,
          cursor: Buffer.from(_item.Paper.updatedAtNumber.toString(), 'ascii').toString('base64')
        }
      })
      const hasNextPage: boolean = _edges.length > first
      const edges: DocumentEdge[] = hasNextPage ? _edges.slice(0, first) : _edges
      const pageInfo: PageInfo = {
        endCursor: edges.length ? edges.slice(-1)[0].cursor : '',
        hasNextPage: hasNextPage
      }
      const result: DocumentConnection = { edges, pageInfo }
      return result
    },
    documents: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, userId, groupId } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        return await prisma.document.findMany({
          where: {
            Paper: {
              userId,
              groupId,
              OR: [
                { Group: { OR: [{ type: 'public' }, { type: 'announce' }] } },
                { Group: { MapUserGroup: { some: { userId: { equals: _context.userSession.id } } } } },
                { canReadAll: { gt: 0 } },
              ],
            }
          },
          include: { Paper: { include: { User: true, Group: true, Tags: { include: { Tag: true } } } } }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    documentsCP: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, userId, groupId, first, after } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')

        /**
         * targgetCursor, cursor: ソート項目に合わせて設定すること。
         * orderBy の asc/desc でtargetCursorの初期値や where の gt, lt が変わることにも注意。
         */

        const targetCursor: string = after ? (Buffer.from(after, 'base64').toString()) : Number.MAX_SAFE_INTEGER.toString()
        const _edges: DocumentEdge[] = (await prisma.document.findMany({
          where: {
            Paper: {
              userId: userId ? userId.toUpperCase() : undefined,
              groupId: groupId ? groupId.toUpperCase() : undefined,
              OR: [
                { Group: { OR: [{ type: 'public' }, { type: 'announce' }] } },
                { Group: { MapUserGroup: { some: { userId: { equals: _context.userSession.id } } } } },
                { canReadAll: { gt: 0 } },
              ],
              updatedAtNumber: { lt: Number(targetCursor) }
            }
          },
          include: { Paper: { include: { User: true, Group: true, Tags: { include: { Tag: true } } } } },
          orderBy: { Paper: { updatedAtNumber: 'desc' } },
          take: first + 1
        })).map(_item => {
          return {
            node: _item,
            cursor: Buffer.from(_item.Paper.updatedAtNumber.toString(), 'ascii').toString('base64')
          }
        })
        const hasNextPage: boolean = _edges.length > first
        const edges: DocumentEdge[] = hasNextPage ? _edges.slice(0, first) : _edges
        const pageInfo: PageInfo = {
          endCursor: edges.length ? edges.slice(-1)[0].cursor : '',
          hasNextPage: hasNextPage
        }
        const result: DocumentConnection = { edges, pageInfo }
        return result
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    document: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, id } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        return await prisma.document.findFirst({
          where: {
            id,
            Paper: {
              OR: [
                { Group: { OR: [{ type: 'public' }, { type: 'announce' }] } },
                { Group: { MapUserGroup: { some: { userId: { equals: _context.userSession.id } } } } },
                { canReadAll: { gt: 0 } },
              ],
            }
          },
          include: { Paper: { include: { User: true, Group: true, Tags: { include: { Tag: true } } } } }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    drafts: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, groupId } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        return await prisma.paper.findMany({
          where: {
            userId: _context.userSession.id,
            groupId: groupId.toUpperCase(),
            isPosted: { equals: 0 }
          },
          include: { User: true, Group: true, Tags: { include: { Tag: true } } }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    draft: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, id } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        return await prisma.paper.findFirst({
          where: {
            id: id.toUpperCase(),
            userId: _context.userSession.id.toUpperCase(),
            OR: [
              { Group: { OR: [{ type: 'public' }, { type: 'announce' }] } },
              { Group: { MapUserGroup: { some: { userId: { equals: _context.userSession.id.toUpperCase() } } } } },
            ],
          },
          include: { User: true, Group: true, Tags: { include: { Tag: true } } }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    stockCategories: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, userId } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        if (!userId) throw new UserInputError('UserInputError')
        if (_context.userSession.id.toUpperCase() !== userId.toUpperCase()) throw new ForbiddenError('Forbidden')
        return await prisma.stockCategory.findMany({ where: { userId: userId.toUpperCase() } })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    stocks: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, userId, documentId } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        if (!userId) throw new UserInputError('UserInputError')
        if (_context.userSession.id.toUpperCase() !== userId.toUpperCase()) throw new ForbiddenError('Forbidden')
        return await prisma.stock.findMany({
          where: {
            userId: userId.toUpperCase(),
            documentId: documentId ? documentId.toUpperCase() : undefined,
          }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    countStocks: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, documentId } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        if (!documentId) throw new UserInputError('UserInputError')
        const result = await prisma.stock.findMany({
          where: {
            documentId: documentId.toUpperCase()
          },
          distinct: ['userId']
        })
        return result?.length ?? 0
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    likes: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, userId, documentId } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        if (!userId && !documentId) throw new UserInputError('UserInputError')
        return await prisma.like.findMany({
          where: {
            userId: userId ? userId.toUpperCase() : undefined,
            documentId: documentId ? documentId.toUpperCase() : undefined,
          }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    countLikes: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, documentId } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        if (!documentId) throw new UserInputError('UserInputError')
        return await prisma.like.count({ where: { documentId: documentId.toUpperCase() } })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    comments: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, userId, documentId } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        if (!userId && !documentId) throw new UserInputError('UserInputError')

        // need to check group private

        return await prisma.comment.findMany({
          where: {
            userId: userId ? userId.toUpperCase() : undefined,
            documentId: documentId ? documentId.toUpperCase() : undefined,
          },
          include: { RawComment: true, User: true },
          orderBy: { createdAtNumber: 'asc' }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    comment: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, id } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        const result = await prisma.comment.findUnique({
          where: { id: id.toUpperCase() },
          include: { RawComment: true, User: true, Document: { include: { Paper: { include: { Group: { include: { MapUserGroup: true } } } } } } },
        })
        if (result.Document.Paper.Group.type === 'private') {
          if (!result.Document.Paper.Group.MapUserGroup.find(x => x.userId.toUpperCase() === _context.userSession.id.toUpperCase())) {
            throw new ForbiddenError('Forbbiden')
          }
        }
        return result
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    follows: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, fromUserId, toUserId } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        if (!fromUserId && !toUserId) throw new UserInputError('UserInputError')
        return await prisma.follow.findMany({
          where: {
            fromUserId: fromUserId ? fromUserId.toUpperCase() : undefined,
            toUserId: toUserId ? toUserId.toUpperCase() : undefined,
          }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    watches: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, userId, groupId } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        if (!userId && !groupId) throw new UserInputError('UserInputError')
        return await prisma.watch.findMany({
          where: {
            userId: userId ? userId.toUpperCase() : undefined,
            groupId: groupId ? groupId.toUpperCase() : undefined,
          }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    esSearch: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, query, index, from, size } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        const groups = await prisma.mapUserGroup.findMany({
          where: {
            OR: [
              { Group: { type: 'public' } },
              { Group: { type: 'announce' } },
              {
                Group: { type: 'private' },
                userId: _context.userSession.id.toUpperCase()
              },
            ]
          },
          select: { groupId: true }
        })
        const documentsResult = (index && index.toLowerCase() === 'documents') ? await esClient.searchDocuments({ query: query, filterGroupIds: groups.map(x => x.groupId), from, size }) : undefined
        return { Documents: documentsResult }
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    esCount: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, query, index } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        const groups = await prisma.mapUserGroup.findMany({
          where: {
            OR: [
              { Group: { type: 'public' } },
              { Group: { type: 'announce' } },
              {
                Group: { type: 'private' },
                userId: _context.userSession.id.toUpperCase()
              },
            ]
          },
          select: { groupId: true }
        })
        const documentsResult = (index && index.toLowerCase() === 'documents') ? await esClient.countDocuments({ query: query, filterGroupIds: groups.map(x => x.groupId) }) : undefined
        return { Documents: documentsResult }
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
  },
  Mutation: {
    updateConfiguration: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, ...configuration } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        return await prisma.configuration.upsert({
          create: configuration, update: configuration, where: { ensureSingleRow: 'single' }
        })
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        throw new ForbiddenError('Forbbiden')
      }
      if (auth == 'none') {
        throw new ForbiddenError('Forbbiden')
      }
      throw new ApolloError('Unknown')
    },
    createGroup: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, name, displayName, description, type } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        if (!name) throw new UserInputError('Invalid argument value', { argumentName: 'name' })
        return await prisma.group.create({ data: { id: ulid(), name, displayName, description, type } })
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        if (!name) throw new UserInputError('Invalid argument value', { argumentName: 'name' })
        return await prisma.group.create(
          {
            data: {
              id: ulid(),
              name,
              displayName,
              description,
              type,
              MapUserGroup: {
                create: {
                  userId: _context.userSession.id,
                  isAdmin: 1
                }
              }
            }
          })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    updateGroup: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, id, name, displayName, description, type } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        return await prisma.group.update({ data: { name, displayName, description, type }, where: { id } })
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        const check = await prisma.group.findUnique({ where: { id }, include: { MapUserGroup: true } })
        if (!check) throw new UserInputError('NotFound')
        const checkAdmin = check.MapUserGroup.find(x => x.userId == _context.userSession.id)?.isAdmin || false
        if (!checkAdmin) throw new ForbiddenError('Forbidden')
        return await prisma.group.update({
          data: { name, displayName, description, type },
          where: { id }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    deleteGroup: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, id } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        /*
        ** deleteGroupした際、いろいろなものがカスケードで削除されるか確認すること
        */
        return await prisma.group.delete({ where: { id } })
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    createMapUserGroup: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, userId, groupId, isAdmin } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        return await prisma.mapUserGroup.create({ data: { userId, groupId, isAdmin } })
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        const check = await prisma.mapUserGroup.findUnique({
          where: { userId_groupId: { userId: _context.userSession.id.toUpperCase(), groupId: groupId.toUpperCase() } },
          include: { Group: true }
        })
        if (!check) throw new ApolloError('Forbbiden')
        if (check.Group.type === 'private' || check.Group.type === 'announce') {
          if (!check.isAdmin) throw new ForbiddenError('Forbbiden')
          return await prisma.mapUserGroup.create({ data: { userId: userId.toUpperCase(), groupId: groupId.toUpperCase(), isAdmin: isAdmin } })
        } else {
          if (userId.toUpperCase() !== _context.userSession.id.toUpperCase()) throw new ForbiddenError('Forbbiden')
          return await prisma.mapUserGroup.create({ data: { userId: userId.toUpperCase(), groupId: groupId.toUpperCase(), isAdmin: isAdmin } })
        }
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    updateMapUserGroup: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, userId, groupId, isAdmin } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        return await prisma.mapUserGroup.update({ data: { isAdmin }, where: { userId_groupId: { userId, groupId } } })
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        const check = await prisma.mapUserGroup.findUnique({ where: { userId_groupId: { userId: _context.userSession.id.toUpperCase(), groupId: groupId.toUpperCase() } } })
        if (!check) throw new ForbiddenError('Forbbiden')
        if (!check.isAdmin) throw new ForbiddenError('Forbbiden')
        return await prisma.mapUserGroup.update({ data: { isAdmin }, where: { userId_groupId: { userId, groupId } } })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    deleteMapUserGroup: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, groupId, userId } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        return await prisma.mapUserGroup.delete({ where: { userId_groupId: { userId: userId.toUpperCase(), groupId: groupId.toUpperCase() } } })
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        const check = await prisma.mapUserGroup.findUnique({
          where: { userId_groupId: { userId: _context.userSession.id.toUpperCase(), groupId: groupId.toUpperCase() } },
          include: { Group: true }
        })
        if (!check) throw new ForbiddenError('Forbbiden')
        if (check.Group.type === 'private' || check.Group.type === 'announce') {
          if (!check.isAdmin) throw new ForbiddenError('Forbbiden')
          return await prisma.mapUserGroup.delete({ where: { userId_groupId: { userId: userId.toUpperCase(), groupId: groupId.toUpperCase() } } })
        } else {
          if (userId.toUpperCase() !== _context.userSession.id.toUpperCase()) throw new ForbiddenError('Forbbiden')
          return await prisma.mapUserGroup.delete({ where: { userId_groupId: { userId: userId.toUpperCase(), groupId: groupId.toUpperCase() } } })
        }
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    createPaper: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, userId, groupId, title, body, tags, documentId, isPosted } = args

      /**
       * createPaper は以下のパターンで分岐する
       *  - isPosted === true
       *    -  documentId => 公開された記事の編集を開始し、それを公開する場合
       *    - !documentId => 記事の新規作成を開始し、それを公開する場合
       *  - isPosted === false
       *    -  documentId => 公開された記事の編集を開始し、それを draft に保存する場合
       *    - !documentId => 記事の新規作成を開始し、それを draft に保存する場合
       * 
       */

      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        // 入力チェック
        if (!groupId) { throw new UserInputError('groupId is not set') }

        // groupの存在チェックおよび、privateだった場合はそのグループのメンバーであるかを確認
        if (groupId) {
          const check = await prisma.group.findUnique({
            where: { id: groupId },
            include: { MapUserGroup: { where: { userId: { equals: _context.userSession.id } } } }
          })
          if (!check) { throw new ApolloError('Group not found.') }
          if ((check.type === 'private' || check.type === 'announce') && !check.MapUserGroup.some(x => x.userId == _context.userSession.id)) { throw new ForbiddenError('Forbidden') }
        }

        // args.documentId がある場合は、チェックをを実施する必要がある (documentIdの乗っ取り防止)
        if (documentId) {
          // 指定された documentId がすでにあるかを確認し、あった場合は、その document の作成者が本人かどうか確認
          const check = await prisma.document.findUnique({ where: { id: documentId }, include: { Paper: true } })
          if (check && check.Paper.userId !== _context.userSession.id) {
            throw new ForbiddenError('Forbidden')
          }
        }

        const now = Date.now()

        // まずは Tags を一括で追加する (重複はskip)
        await prisma.tag.createMany({ data: tags.map((x) => ({ id: ulid(), text: x })), skipDuplicates: true })
        const _tags = await prisma.tag.findMany({ where: { text: { in: tags } } })

        if (isPosted) {
          // isPosted === true の場合は、pageを新規に作りつつ、
          // document も処理する必要がある。
          // 引数:documentId は存在する場合としない場合があるので、
          // 指定されていなかった場合は新たに採番(_documentId)し、
          // これを upsert で処理することで実現できる。
          // その後Tagを処理して、結果を得る、一連のTransactionを実行する

          const _documentId = documentId ?? ulid()
          const _paperId = ulid()

          const [upsertDoc, deleteTagMap, createTagMap, result] = await prisma.$transaction([
            prisma.document.upsert({
              where: { id: _documentId },
              create: {
                id: _documentId,
                createdAt: new Date(now).toISOString(),
                createdAtNumber: now,
                Paper: {
                  create: {
                    id: _paperId,
                    userId: _context.userSession.id.toUpperCase(),
                    groupId: groupId.toUpperCase(),
                    documentIdLazy: _documentId.toUpperCase(),
                    title,
                    body,
                    isPosted,
                    createdAt: new Date(now).toISOString(),
                    createdAtNumber: now,
                    updatedAt: new Date(now).toISOString(),
                    updatedAtNumber: now,
                  }
                }
              },
              update: {
                Paper: {
                  create: {
                    id: _paperId,
                    userId: _context.userSession.id.toUpperCase(),
                    groupId: groupId.toUpperCase(),
                    documentIdLazy: _documentId.toUpperCase(),
                    title,
                    body,
                    isPosted,
                    createdAt: new Date(now).toISOString(),
                    createdAtNumber: now,
                    updatedAt: new Date(now).toISOString(),
                    updatedAtNumber: now
                  }
                }
              }
            }),
            prisma.mapPaperTag.deleteMany({
              where: { paperId: _paperId, tagId: { notIn: _tags.map((x) => x.id) } }
            }),
            prisma.mapPaperTag.createMany({
              data: _tags.map((x) => ({ paperId: _paperId, tagId: x.id })),
              skipDuplicates: true,
            }),
            prisma.paper.findUnique({
              where: { id: _paperId },
              include: { User: true, Group: true, Tags: { include: { Tag: true } } }
            })
          ])

          try {
            await esClient.upsertDocument({
              id: documentId,
              document: {
                paperId: result.id,
                userId: result.User.id,
                userName: result.User.username,
                userDisplayName: result.User.displayName,
                groupId: result.Group.id,
                groupName: result.Group.name,
                groupDisplayName: result.Group.displayName,
                groupType: result.Group.type,
                createdAt: upsertDoc.createdAt,
                createdAtNumber: Number(upsertDoc.createdAtNumber),
                updatedAt: result.updatedAt,
                updatedAtNumber: Number(result.updatedAtNumber),
                title: result.title,
                tags: tags,
                body: result.body,
              }
            })
          } catch (error) {
            console.error(error)
          }

          return result

        } else {
          // isPublishd === false の場合は、pageだけcreateすれば良い
          // documentId が指定されなかった場合は undefind を入れる
          // その後Tagを処理して、結果を得る、一連のTransactionを実行する

          const _paperId = ulid()

          const [createPaper, deleteTagMap, createTagMap, result] = await prisma.$transaction([
            prisma.paper.create({
              data: {
                id: _paperId,
                userId: _context.userSession.id.toUpperCase(),
                groupId: groupId.toUpperCase(),
                documentIdLazy: documentId ? documentId.toUpperCase() : undefined,
                title,
                body,
                isPosted,
                createdAt: new Date(now).toISOString(),
                createdAtNumber: now,
                updatedAt: new Date(now).toISOString(),
                updatedAtNumber: now
              }
            }),
            prisma.mapPaperTag.deleteMany({
              where: { paperId: _paperId, tagId: { notIn: _tags.map((x) => x.id) } }
            }),
            prisma.mapPaperTag.createMany({
              data: _tags.map((x) => ({ paperId: _paperId, tagId: x.id })),
              skipDuplicates: true,
            }),
            prisma.paper.findUnique({
              where: { id: _paperId },
              include: { User: true, Group: true, Tags: { include: { Tag: true } } }
            })
          ])

          return result
        }
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    updatePaper: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, paperId, title, body, tags, isPosted } = args

      /**
       * createPaper は以下のパターンで分岐する
       *  - isPosted === true
       *    -  paper.documentId     => 公開された記事の編集内容が draft に保存されていて、それを公開する場合。保存されているdocumentIdをそのまま使用。
       *    - !paper.documentId     => 記事の新規作成から開始された編集内容が draft に保存されていて、それを公開する場合。documentIdは新たに採番する。
       *  - isPosted === false  => draft が保存された状態。 argsの内容で、paperを更新するだけ。
       * 
       */

      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')

        const check = await prisma.paper.findUnique({ where: { id: paperId }, include: { Group: { include: { MapUserGroup: { include: { User: { select: { id: true } } } } } } } })
        if (!check) throw new ApolloError('NotFound')
        if (check.isPosted) throw new ApolloError('PageAlreadyPublished') // published がすでにマークされたものは変更不可
        if (check.userId !== _context.userSession.id) throw new ForbiddenError('Forbidden') // 自分のpaperでない場合は変更不可
        if (check.Group.type === 'private' || check.Group.type === 'announce') {
          // 記事のグループがprivate/announceだった場合、現在もそのgroupに自分が属しているのか確認。違った場合は変更不可
          if (!(check.Group.MapUserGroup.map((x) => x.User.id).includes(_context.userSession.id))) throw new ForbiddenError('Forbidden')
        }

        const now = Date.now()

        // まずは Tags を一括で追加する (重複はskip)
        await prisma.tag.createMany({ data: tags.map((x) => ({ id: ulid(), text: x })), skipDuplicates: true })
        const _tags = await prisma.tag.findMany({ where: { text: { in: tags } } })

        if (isPosted) {

          const documentId = check.documentIdLazy ?? ulid()
          const [updatePaper, upsertDoc, deleteTagMap, createTagMap, result] = await prisma.$transaction([
            prisma.paper.update({
              where: { id: paperId.toUpperCase() },
              data: { title, body, documentIdLazy: documentId.toUpperCase(), isPosted, updatedAt: new Date(now).toISOString(), updatedAtNumber: now },
            }),
            prisma.document.upsert({
              where: { id: documentId.toUpperCase() },
              create: { id: documentId.toUpperCase(), paperId: paperId.toUpperCase(), createdAt: new Date(now).toISOString(), createdAtNumber: now },
              update: { paperId: paperId.toUpperCase() }
            }),
            prisma.mapPaperTag.deleteMany({
              where: { paperId: paperId.toUpperCase(), tagId: { notIn: _tags.map((x) => x.id) } }
            }),
            prisma.mapPaperTag.createMany({
              data: _tags.map((x) => ({ paperId: paperId.toUpperCase(), tagId: x.id })),
              skipDuplicates: true,
            }),
            prisma.paper.findUnique({
              where: { id: paperId.toUpperCase() },
              include: { User: true, Group: true, Tags: { include: { Tag: true } } }
            })
          ])

          try {
            await esClient.upsertDocument({
              id: documentId,
              document: {
                paperId: result.id,
                userId: result.User.id,
                userName: result.User.username,
                userDisplayName: result.User.displayName,
                groupId: result.Group.id,
                groupName: result.Group.name,
                groupDisplayName: result.Group.displayName,
                groupType: result.Group.type,
                createdAt: upsertDoc.createdAt,
                createdAtNumber: Number(upsertDoc.createdAtNumber),
                updatedAt: result.updatedAt,
                updatedAtNumber: Number(result.updatedAtNumber),
                title: result.title,
                tags: tags,
                body: result.body,
              }
            })
          } catch (error) {
            console.error(error)
          }

          return result
        } else {

          const [updatePaper, deleteTagMap, createTagMap, result] = await prisma.$transaction([
            prisma.paper.update({
              where: { id: paperId.toUpperCase() },
              data: { title, body, isPosted, updatedAt: new Date(now).toISOString(), updatedAtNumber: now },
            }),
            prisma.mapPaperTag.deleteMany({
              where: { paperId: paperId.toUpperCase(), tagId: { notIn: _tags.map((x) => x.id) } }
            }),
            prisma.mapPaperTag.createMany({
              data: _tags.map((x) => ({ paperId: paperId.toUpperCase(), tagId: x.id })),
              skipDuplicates: true,
            }),
            prisma.paper.findUnique({
              where: { id: paperId.toUpperCase() },
              include: { User: true, Group: true, Tags: { include: { Tag: true } } }
            })
          ])

          return result
        }


      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    updateMyProfile: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, username, displayName } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        return await prisma.user.update({
          where: { id: _context.userSession.id.toUpperCase() },
          data: {
            username, displayName,
          }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    createStockCategory: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, userId, name } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        if (!userId) throw new UserInputError('UserInputError')
        if (!name) throw new UserInputError('UserInputError')
        if (_context.userSession.id.toUpperCase() !== userId.toUpperCase()) throw new ForbiddenError('Forbidden')
        return await prisma.stockCategory.create({
          data: {
            id: ulid(),
            userId: userId.toUpperCase(),
            name: name,
          }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    updateStockCategory: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, id, name } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        if (!id) throw new UserInputError('UserInputError')
        if (!name) throw new UserInputError('UserInputError')
        const check = await prisma.stockCategory.findUnique({ where: { id: id } })
        if (!check) throw new ApolloError('NotFound')
        if (check.userId !== _context.userSession.id.toUpperCase()) throw new ForbiddenError('Forbidden')
        return await prisma.stockCategory.update({
          where: { id: id.toUpperCase() },
          data: { name: name }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    deleteStockCategory: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, id } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        if (!id) throw new UserInputError('UserInputError')
        const check = await prisma.stockCategory.findUnique({ where: { id: id } })
        if (!check) throw new ApolloError('NotFound')
        if (check.userId !== _context.userSession.id.toUpperCase()) throw new ForbiddenError('Forbidden')
        return await prisma.stockCategory.delete({ where: { id: id.toUpperCase() } })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    createStock: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, userId, documentId, stockCategoryId } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        if (!userId) throw new UserInputError('UserInputError')
        if (!documentId) throw new UserInputError('UserInputError')
        if (!stockCategoryId) throw new UserInputError('UserInputError')
        if (_context.userSession.id.toUpperCase() !== userId.toUpperCase()) throw new ForbiddenError('Forbidden')
        return await prisma.stock.create({
          data: {
            userId: userId.toUpperCase(),
            documentId: documentId.toUpperCase(),
            stockCategoryId: stockCategoryId.toUpperCase(),
          }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    deleteStock: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, userId, documentId, stockCategoryId } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        if (!userId) throw new UserInputError('UserInputError')
        if (!documentId) throw new UserInputError('UserInputError')
        if (!stockCategoryId) throw new UserInputError('UserInputError')
        if (_context.userSession.id.toUpperCase() !== userId.toUpperCase()) throw new ForbiddenError('Forbidden')
        return await prisma.stock.delete({
          where: {
            documentId_userId_stockCategoryId: {
              userId: userId.toUpperCase(),
              documentId: documentId.toUpperCase(),
              stockCategoryId: stockCategoryId.toUpperCase(),
            }
          }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    createLike: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, userId, documentId } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        if (!userId) throw new UserInputError('UserInputError')
        if (!documentId) throw new UserInputError('UserInputError')
        if (_context.userSession.id.toUpperCase() !== userId.toUpperCase()) throw new ForbiddenError('Forbidden')
        return await prisma.like.create({
          data: {
            userId: userId.toUpperCase(),
            documentId: documentId.toUpperCase(),
          }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    deleteLike: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, userId, documentId } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        if (!userId) throw new UserInputError('UserInputError')
        if (!documentId) throw new UserInputError('UserInputError')
        if (_context.userSession.id.toUpperCase() !== userId.toUpperCase()) throw new ForbiddenError('Forbidden')
        return await prisma.like.delete({
          where: {
            userId_documentId: {
              userId: userId.toUpperCase(),
              documentId: documentId.toUpperCase(),
            }
          }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    createComment: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, userId, documentId, referenceCommentIdLazy, body } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        if (_context.userSession.id.toUpperCase() !== userId.toUpperCase()) throw new ForbiddenError('Forbidden')
        const check = await prisma.document.findUnique({
          where: { id: documentId.toUpperCase() },
          include: {
            Paper: { include: { Group: { include: { MapUserGroup: true } } } }
          }
        })
        if (!check) throw new ApolloError('NotFound')
        if (check.Paper.Group.type === 'private') {
          if (!check.Paper.Group.MapUserGroup.find((m) => m.userId.toUpperCase() == userId.toUpperCase())) {
            throw new ForbiddenError('Forbidden')
          }
        }
        const now = Date.now()
        const commentId = ulid()
        return prisma.comment.create({
          data: {
            id: commentId,
            User: { connect: { id: userId.toUpperCase() } },
            Document: { connect: { id: documentId.toUpperCase() } },
            referenceCommentIdLazy: referenceCommentIdLazy ? referenceCommentIdLazy.toUpperCase() : undefined,
            createdAt: new Date(now).toISOString(),
            createdAtNumber: now,
            RawComment: {
              create: {
                id: ulid(),
                userId: userId.toUpperCase(),
                documentId: documentId.toUpperCase(),
                commentIdLazy: commentId,
                body: body,
                createdAt: new Date(now).toISOString(),
                createdAtNumber: now,
              }
            }
          },
          include: { RawComment: true, User: true }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    updateComment: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, id, body } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        const check = await prisma.comment.findUnique({
          where: { id: id.toUpperCase() },
          include: {
            RawComment: true,
            Document: { include: { Paper: { include: { Group: { include: { MapUserGroup: true } } } } } }
          }
        })
        if (!check) throw new ApolloError('NotFound')
        if (check.userId.toUpperCase() !== _context.userSession.id.toUpperCase()) throw new ForbiddenError('Forbidden')
        if (check.Document.Paper.Group.type === 'private') {
          if (!check.Document.Paper.Group.MapUserGroup.find((x) => x.userId.toUpperCase() === _context.userSession.id.toUpperCase())) {
            throw new ForbiddenError('Forbidden')
          }
        }
        const now = Date.now()
        return await prisma.comment.update({
          where: { id: id.toUpperCase() },
          data: {
            RawComment: {
              create: {
                id: ulid(),
                userId: check.RawComment.userId.toUpperCase(),
                documentId: check.RawComment.documentId.toUpperCase(),
                commentIdLazy: check.RawComment.commentIdLazy,
                body: body,
                createdAt: new Date(now).toISOString(),
                createdAtNumber: now,
              }
            }
          },
          include: { RawComment: true, User: true }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    deleteComment: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, id } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        const check = await prisma.comment.findUnique({
          where: { id: id.toUpperCase() },
          include: {
            RawComment: true,
            Document: { include: { Paper: { include: { Group: { include: { MapUserGroup: true } } } } } }
          }
        })
        if (!check) throw new ApolloError('NotFound')
        if (check.userId.toUpperCase() !== _context.userSession.id.toUpperCase()) throw new ForbiddenError('Forbidden')
        if (check.Document.Paper.Group.type === 'private') {
          if (!check.Document.Paper.Group.MapUserGroup.find((x) => x.userId.toUpperCase() === _context.userSession.id.toUpperCase())) {
            throw new ForbiddenError('Forbidden')
          }
        }
        return await prisma.comment.delete({
          where: { id: id.toUpperCase() },
          include: { RawComment: true, User: true }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    createFollow: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, fromUserId, toUserId } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        if (!fromUserId) throw new UserInputError('UserInputError')
        if (!toUserId) throw new UserInputError('UserInputError')
        if (_context.userSession.id.toUpperCase() !== fromUserId.toUpperCase()) throw new ForbiddenError('Forbidden')
        return await prisma.follow.create({
          data: {
            fromUserId: fromUserId.toUpperCase(),
            toUserId: toUserId.toUpperCase(),
          }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    deleteFollow: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, fromUserId, toUserId } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        if (!fromUserId) throw new UserInputError('UserInputError')
        if (!toUserId) throw new UserInputError('UserInputError')
        if (_context.userSession.id.toUpperCase() !== fromUserId.toUpperCase()) throw new ForbiddenError('Forbidden')
        return await prisma.follow.delete({
          where: {
            fromUserId_toUserId: {
              fromUserId: fromUserId.toUpperCase(),
              toUserId: toUserId.toUpperCase(),
            }
          }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    createWatch: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, userId, groupId } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        if (!userId) throw new UserInputError('UserInputError')
        if (!groupId) throw new UserInputError('UserInputError')
        if (_context.userSession.id.toUpperCase() !== userId.toUpperCase()) throw new ForbiddenError('Forbidden')
        return await prisma.watch.create({
          data: {
            userId: userId.toUpperCase(),
            groupId: groupId.toUpperCase(),
          }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
    deleteWatch: async (_parent, args, _context: GraphQLResolveContext, _info) => {
      const { auth, userId, groupId } = args
      if (auth == 'admin') {
        if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
        throw new ApolloError('Unimplemented')
      }
      if (auth == 'user') {
        if (!_context.userSession) throw new AuthenticationError('Unauthorized')
        if (!userId) throw new UserInputError('UserInputError')
        if (!groupId) throw new UserInputError('UserInputError')
        if (_context.userSession.id.toUpperCase() !== userId.toUpperCase()) throw new ForbiddenError('Forbidden')
        return await prisma.watch.delete({
          where: {
            userId_groupId: {
              userId: userId.toUpperCase(),
              groupId: groupId.toUpperCase(),
            }
          }
        })
      }
      if (auth == 'none') {
        throw new ApolloError('Unimplemented')
      }
      throw new ApolloError('Unknown')
    },
  }
}

const _dummy_dummy_dummy_ = async (_parent, args, _context: GraphQLResolveContext, _info) => {
  const { auth } = args
  if (auth == 'admin') {
    if (!_context.adminSession) throw new AuthenticationError('Unauthorized')
    throw new ApolloError('Unimplemented')
  }
  if (auth == 'user') {
    if (!_context.userSession) throw new AuthenticationError('Unauthorized')
    throw new ApolloError('Unimplemented')
  }
  if (auth == 'none') {
    throw new ApolloError('Unimplemented')
  }
  throw new ApolloError('Unknown')
}