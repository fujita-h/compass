import { Client } from '@elastic/elasticsearch'
import { EsSearchDocmentsResponse, EsSearchGroupsResponse, EsSearchUsersResponse } from '@graphql/generated/resolvers'
import { documents, groups, users } from './indices'

interface ShardsResponse {
  total: number
  successful: number
  failed: number
  skipped: number
}

interface Explanation {
  value: number
  description: string
  details: Explanation[]
}

interface SearchResponse<T> {
  took: number
  timed_out: boolean
  _scroll_id?: string
  _shards: ShardsResponse
  hits: {
    total: {
      value: number
      relation: string
    }
    max_score: number
    hits: Array<{
      _index: string
      _type: string
      _id: string
      _score: number
      _source: T
      _version?: number
      _explanation?: Explanation
      fields?: any
      highlight?: any
      inner_hits?: any
      matched_queries?: string[]
      sort?: string[]
    }>
  }
  aggregations?: any
}

interface CountResponse {
  count: number
  _shards: ShardsResponse
}

interface Document {
  paperId: string
  userId: string
  userName: string
  userDisplayName: string
  groupId: string
  groupName: string
  groupDisplayName: string
  groupType: string
  createdAt: string
  updatedAt: string
  title: string
  tags: string[]
  body: string
}

interface Group {
  name: string
  displayName: string
  description: string
  type: string
}

interface User {
  username: string
  email: string
  displayName: string
  description: string
}

interface Bucket {
  key: string
  doc_count: number
}
interface Tags {
  buckets: [Bucket]
}
interface TagsAggregations {
  tags: Tags
}

interface TagsResponse {
  aggregations: TagsAggregations
}

class ElasticsearchClient {
  client: Client

  constructor(node) {
    this.client = new Client({ node: node })
    this.initIndices()
  }

  initIndices() {
    this.client.indices.exists({ index: 'documents' }).then((response) => {
      if (!response.body) {
        this.client.indices.create(documents)
      }
    })
    this.client.indices.exists({ index: 'groups' }).then((response) => {
      if (!response.body) {
        this.client.indices.create(groups)
      }
    })
    this.client.indices.exists({ index: 'users' }).then((response) => {
      if (!response.body) {
        this.client.indices.create(users)
      }
    })
  }

  private documentsQuery(query: string, filterGroupIds: string[]) {
    if (!query) {
      return {
        function_score: {
          query: {
            bool: {
              filter: [{ terms: { groupId: filterGroupIds } }],
              must: [{ match_all: {} }],
            },
          },
          functions: [
            {
              exp: {
                createdAt: {
                  offset: '1m',
                  scale: '360d',
                  decay: 0.5,
                },
              },
              weight: 1,
            },
          ],
          score_mode: 'multiply',
          boost_mode: 'sum',
        },
      }
    }

    return {
      function_score: {
        query: {
          bool: {
            filter: [{ terms: { groupId: filterGroupIds } }],
            should: [
              {
                // タイトルの検索マッチ
                multi_match: {
                  query: query,
                  operator: 'and',
                  fields: ['title.sudachi_C^2.0', 'title.sudachi_B^1.0', 'title.sudachi_A^0.5', 'title.kuromoji^0.3', 'title.ngram^0.1'],
                  boost: 1.2,
                },
              },
              {
                // タグのの完全マッチ
                terms: {
                  tags: query.replace('　', ' ').split(' '),
                  boost: 2.0
                }
              },
              {
                // タグの検索マッチ
                multi_match: {
                  query: query,
                  operator: 'and',
                  fields: ['tags.sudachi_C^2.0', 'tags.sudachi_B^1.0', 'tags.sudachi_A^0.5', 'tags.kuromoji^0.3', 'tags.ngram^0.1'],
                  boost: 1.8,
                },
              },
              {
                // 本文の検索マッチ
                multi_match: {
                  query: query,
                  operator: 'and',
                  fields: ['body.sudachi_C^2.0', 'body.sudachi_B^1.0', 'body.sudachi_A^0.5', 'body.kuromoji^0.3', 'body.ngram^0.1'],
                  boost: 1.0,
                },
              },
            ],
            minimum_should_match: 1,
          },
        },
        functions: [
          {
            exp: {
              createdAt: {
                offset: '30d',
                scale: '360d',
                decay: 0.5,
              },
            },
            weight: 1,
          },
        ],
        score_mode: 'multiply',
        boost_mode: 'sum',
      },
    }
  }

  async searchDocuments({
    query,
    filterGroupIds,
    from = 0,
    size = 100,
  }: {
    query: string
    filterGroupIds: string[]
    from: number
    size: number
  }): Promise<EsSearchDocmentsResponse> {
    const result = await this.client.search<SearchResponse<Document>>({
      index: 'documents',
      body: {
        from,
        size,
        query: this.documentsQuery(query, filterGroupIds),
      },
    })
    return result.body
  }

  async countDocuments({ query, filterGroupIds }: { query: string; filterGroupIds: string[] }) {
    const result = await this.client.count<CountResponse>({
      index: 'documents',
      body: {
        query: this.documentsQuery(query, filterGroupIds).function_score.query,
      },
    })
    return result.body
  }

  private groupsQuery(query: string) {
    if (!query) {
      return { match_all: {} }
    }

    return {
      bool: {
        should: [
          {
            multi_match: {
              query: query,
              fields: ['name', 'name.ngram'],
            },
          },
          {
            multi_match: {
              query: query,
              fields: [
                'displayName.sudachi_C',
                'displayName.sudachi_B',
                'displayName.sudachi_A',
                'displayName.kuromoji',
                'displayName.ngram',
              ],
            },
          },
          {
            multi_match: {
              query: query,
              fields: [
                'description.sudachi_C',
                'description.sudachi_B',
                'description.sudachi_A',
                'description.kuromoji',
                'description.ngram',
              ],
            },
          },
        ],
        minimum_should_match: 1,
      },
    }
  }

  async searchGroups({ query, from = 0, size = 100 }: { query: string; from: number; size: number }): Promise<EsSearchGroupsResponse> {
    const result = await this.client.search<SearchResponse<Group>>({
      index: 'groups',
      body: {
        from,
        size,
        query: this.groupsQuery(query),
      },
    })
    return result.body
  }

  async countGroups({ query }: { query: string }) {
    const result = await this.client.count<CountResponse>({
      index: 'groups',
      body: {
        query: this.groupsQuery(query),
      },
    })
    return result.body
  }

  private usersQuery(query: string) {
    if (!query) {
      return { match_all: {} }
    }
    return {
      bool: {
        should: [
          {
            multi_match: {
              query: query,
              fields: ['name', 'name.ngram'],
            },
          },
          {
            multi_match: {
              query: query,
              fields: ['email', 'email.ngram'],
            },
          },
          {
            multi_match: {
              query: query,
              fields: [
                'displayName.sudachi_C',
                'displayName.sudachi_B',
                'displayName.sudachi_A',
                'displayName.kuromoji',
                'displayName.ngram',
              ],
            },
          },
          {
            multi_match: {
              query: query,
              fields: [
                'description.sudachi_C',
                'description.sudachi_B',
                'description.sudachi_A',
                'description.kuromoji',
                'description.ngram',
              ],
            },
          },
        ],
        minimum_should_match: 1,
      },
    }
  }

  async searchUsers({ query, from = 0, size = 100 }: { query: string; from: number; size: number }): Promise<EsSearchUsersResponse> {
    const result = await this.client.search<SearchResponse<User>>({
      index: 'users',
      body: {
        from,
        size,
        query: this.usersQuery(query),
      },
    })
    return result.body
  }

  async countUsers({ query }: { query: string }) {
    const result = await this.client.count<CountResponse>({
      index: 'users',
      body: {
        query: this.usersQuery(query),
      },
    })
    return result.body
  }

  async tags({ filterGroupIds, size = 100 }: { filterGroupIds: string[]; size?: number }) {
    if (size < 0) size = undefined
    const result = await this.client.search<TagsResponse>({
      index: 'documents',
      filter_path: 'aggregations',
      body: {
        query: {
          bool: {
            filter: [{ terms: { groupId: filterGroupIds } }],
          },
        },
        aggs: {
          tags: {
            terms: {
              field: 'tags',
              size,
            },
          },
        },
      },
    })
    return result.body
  }

  private taggedDocumentsQuery(query: string, filterGroupIds: string[]) {
    if (!query) {
      return {
        bool: {
          filter: [{ terms: { groupId: filterGroupIds } }],
        },
      }
    }
    return {
      bool: {
        filter: [{ terms: { groupId: filterGroupIds } }],
        must: [{ match: { tags: query } }],
      },
    }
  }

  async searchTaggedDocuments({
    query,
    filterGroupIds,
    from = 0,
    size = 100,
  }: {
    query: string
    filterGroupIds: string[]
    from: number
    size: number
  }): Promise<EsSearchDocmentsResponse> {
    const result = await this.client.search<SearchResponse<Document>>({
      index: 'documents',
      body: {
        from,
        size,
        query: this.taggedDocumentsQuery(query, filterGroupIds),
        sort: [{ updatedAt: { order: 'desc' } }],
      },
    })
    return result.body
  }

  async countTaggedDocuments({ query, filterGroupIds }: { query: string; filterGroupIds: string[] }) {
    const result = await this.client.count<CountResponse>({
      index: 'documents',
      body: {
        query: this.taggedDocumentsQuery(query, filterGroupIds),
      },
    })
    return result.body
  }

  upsertDocument({ id, document }: { id: string; document: Document }) {
    return this.client.index({
      index: 'documents',
      id,
      body: { ...document },
      timeout: '5s',
    })
  }

  upsertGroup({ id, group }: { id: string; group: Group }) {
    return this.client.index({
      index: 'groups',
      id,
      body: { ...group },
      timeout: '5s',
    })
  }

  upsertUser({ id, user }: { id: string; user: User }) {
    return this.client.index({
      index: 'users',
      id,
      body: { ...user },
      timeout: '5s',
    })
  }

  deleteDocument({ id }: { id: string }) {
    return this.client.delete({
      index: 'documents',
      id,
    })
  }

  deleteGroup({ id }: { id: string }) {
    return this.client.delete({
      index: 'groups',
      id: id,
    })
  }

  deleteUser({ id }: { id: string }) {
    return this.client.delete({
      index: 'users',
      id: id,
    })
  }
}

declare global {
  var esClient: ElasticsearchClient | undefined
}

export const esClient = global.esClient || new ElasticsearchClient(process.env.ELASTICSEARCH_URL)

if (process.env.NODE_ENV !== 'production') global.esClient = esClient
