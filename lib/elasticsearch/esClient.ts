import { Client } from '@elastic/elasticsearch'
import { EsSearchDocmentsResponse } from '@graphql/generated/resolvers'
import { documents } from './indices'


interface ShardsResponse {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
}

interface Explanation {
  value: number;
  description: string;
  details: Explanation[];
}

interface SearchResponse<T> {
  took: number;
  timed_out: boolean;
  _scroll_id?: string;
  _shards: ShardsResponse;
  hits: {
    total: {
      value: number
      relation: string
    }
    max_score: number;
    hits: Array<{
      _index: string;
      _type: string;
      _id: string;
      _score: number;
      _source: T;
      _version?: number;
      _explanation?: Explanation;
      fields?: any;
      highlight?: any;
      inner_hits?: any;
      matched_queries?: string[];
      sort?: string[];
    }>;
  };
  aggregations?: any;
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
  createdAtNumber: number
  updatedAt: string
  updatedAtNumber: number
  title: string
  body: string
}

class ElasticsearchClient {
  client: Client

  constructor(node) {
    this.client = new Client({ node: node })
    this.initIndices()
  }

  initIndices() {
    this.client.indices
      .exists({ index: 'documents' })
      .then((response) => {
        if (!response.body) { this.client.indices.create(documents) }
      })
  }

  async searchDocuments({ query, filterGroupIds, from = 0, size = 100 }: { query: string, filterGroupIds: string[], from: number, size: number }): Promise<EsSearchDocmentsResponse> {
    const result = await this.client.search<SearchResponse<Document>>({
      index: 'documents',
      body: {
        from,
        size,
        query: {
          bool: {
            filter: [
              { terms: { groupId: filterGroupIds } }
            ],
            must: [
              { match: { body: query } }
            ]
          }
        }
      }
    })
    return result.body
  }

  async countDocuments({ query, filterGroupIds }: { query: string, filterGroupIds: string[] }) {
    const result = await this.client.count<CountResponse>({
      index: 'documents',
      body: {
        query: {
          bool: {
            filter: [
              { terms: { groupId: filterGroupIds } }
            ],
            must: [
              { match: { body: query } }
            ]
          }
        }
      }
    })
    return result.body
  }

  upsertDocument({ id, document }: { id: string, document: Document }) {
    return this.client.index({
      index: 'documents',
      id,
      body: { ...document },
      timeout: '5s'
    })
  }
}


declare global {
  var esClient: ElasticsearchClient | undefined
}

export const esClient = global.esClient || new ElasticsearchClient(process.env.ELASTICSEARCH_URL)

if (process.env.NODE_ENV !== 'production') global.esClient = esClient


