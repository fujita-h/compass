//
// Analysis Settigs
//

const normalize = {
  type: 'icu_normalizer', // unicode 文字の正規化
  name: 'nfkc',
  mode: 'compose',
}

const ja_sudachi_search_split = {
  type: 'sudachi_split',
  mode: 'search',
}

const ja_sudachi_tokenizer_A = {
  type: 'sudachi_tokenizer',
  split_mode: 'A',
  discard_compound_token: true, // 複合語を含んだ同義語を設定した場合の処置
  additional_settings: '{"systemDict":"system_full.dic"}',
}

const ja_sudachi_tokenizer_B = {
  type: 'sudachi_tokenizer',
  split_mode: 'B',
  discard_compound_token: true, // 複合語を含んだ同義語を設定した場合の処置
  additional_settings: '{"systemDict":"system_full.dic"}',
}

const ja_sudachi_tokenizer_C = {
  type: 'sudachi_tokenizer',
  split_mode: 'C',
  discard_compound_token: true, // 複合語を含んだ同義語を設定した場合の処置
  additional_settings: '{"systemDict":"system_full.dic"}',
}

const ja_kuromoji_tokenizer = {
  mode: 'search',
  type: 'kuromoji_tokenizer',
  discard_compound_token: true, // 複合語を含んだ同義語を設定した場合の処置
  user_dictionary_rules: [
    // "東京スカイツリー,東京 スカイツリー,トウキョウ スカイツリー,カスタム名詞",
  ],
}

const ja_ngram_tokenizer = {
  type: 'ngram',
  min_gram: 2,
  max_gram: 3,
  token_chars: ['letter', 'digit'],
}

const ja_index_synonym = {
  type: 'synonym',
  lenient: false, // discard_compound_token: true が入っているので false でOK
  synonyms: [
    // "アメリカ, 米国"
  ],
}
const ja_search_synonym = {
  type: 'synonym_graph',
  lenient: false, // discard_compound_token: true が入っているので false でOK
  synonyms: [
    // "アメリカ, 米国"
  ],
}

const ja_sudachi_index_analyzer_A = {
  type: 'custom',
  char_filter: [
    'normalize', // unicode文字の正規化
  ],
  filter: ['cjk_width', 'lowercase', 'sudachi_baseform', 'sudachi_part_of_speech', 'sudachi_normalizedform', 'sudachi_ja_stop'],
  tokenizer: 'ja_sudachi_tokenizer_A',
}

const ja_sudachi_index_analyzer_B = {
  type: 'custom',
  char_filter: [
    'normalize', // unicode文字の正規化
  ],
  filter: ['cjk_width', 'lowercase', 'sudachi_baseform', 'sudachi_part_of_speech', 'sudachi_normalizedform', 'sudachi_ja_stop'],
  tokenizer: 'ja_sudachi_tokenizer_B',
}

const ja_sudachi_index_analyzer_C = {
  type: 'custom',
  char_filter: [
    'normalize', // unicode文字の正規化
  ],
  filter: ['cjk_width', 'lowercase', 'sudachi_baseform', 'sudachi_part_of_speech', 'sudachi_normalizedform', 'sudachi_ja_stop'],
  tokenizer: 'ja_sudachi_tokenizer_C',
}

const ja_sudachi_search_analyzer_A = {
  type: 'custom',
  char_filter: [
    'normalize', // unicode文字の正規化
  ],
  filter: ['sudachi_baseform', 'sudachi_part_of_speech', 'sudachi_normalizedform', 'sudachi_ja_stop', 'ja_sudachi_search_split'],
  tokenizer: 'ja_sudachi_tokenizer_A',
}

const ja_sudachi_search_analyzer_B = {
  type: 'custom',
  char_filter: [
    'normalize', // unicode文字の正規化
  ],
  filter: ['sudachi_baseform', 'sudachi_part_of_speech', 'sudachi_normalizedform', 'sudachi_ja_stop', 'ja_sudachi_search_split'],
  tokenizer: 'ja_sudachi_tokenizer_B',
}

const ja_sudachi_search_analyzer_C = {
  type: 'custom',
  char_filter: [
    'normalize', // unicode文字の正規化
  ],
  filter: ['sudachi_baseform', 'sudachi_part_of_speech', 'sudachi_normalizedform', 'sudachi_ja_stop', 'ja_sudachi_search_split'],
  tokenizer: 'ja_sudachi_tokenizer_C',
}

const ja_kuromoji_index_analyzer = {
  type: 'custom',
  char_filter: [
    'normalize', // unicode文字の正規化
  ],
  tokenizer: 'ja_kuromoji_tokenizer',
  filter: [
    'kuromoji_baseform', // 動詞・形容詞を原型に戻す
    'kuromoji_part_of_speech', // 不要な品詞を削除
    'ja_index_synonym', // 同義語
    'cjk_width', // 全角半角を統一する
    'ja_stop', // 日本語ストップワード除去
    'kuromoji_stemmer', // カタカナの末尾の伸ばし棒を削除
    'lowercase', // 英字の大文字を小文字に変換
  ],
}

const ja_kuromoji_search_analyzer = {
  type: 'custom',
  char_filter: [
    'normalize', // unicode文字の正規化
  ],
  tokenizer: 'ja_kuromoji_tokenizer',
  filter: [
    'kuromoji_baseform', // 動詞・形容詞を原型に戻す
    'kuromoji_part_of_speech', // 不要な品詞を削除
    'ja_search_synonym', // 同義語
    'cjk_width', // 全角半角を統一する
    'ja_stop', // 日本語ストップワード除去
    'kuromoji_stemmer', // カタカナの末尾の伸ばし棒を削除
    'lowercase', // 英字の大文字を小文字に変換
  ],
}

const ja_ngram_index_analyzer = {
  type: 'custom',
  char_filter: [
    'normalize', // unicode文字の正規化
  ],
  tokenizer: 'ja_ngram_tokenizer',
  filter: [
    'lowercase', // 英字の大文字を小文字に変換
  ],
}

const ja_ngram_search_analyzer = {
  type: 'custom',
  char_filter: [
    'normalize', // unicode文字の正規化
  ],
  tokenizer: 'ja_ngram_tokenizer',
  filter: [
    'ja_search_synonym', // 同義語
    'lowercase', // 英字の大文字を小文字に変換
  ],
}

//
// Indeces
//

export const documents = {
  index: 'documents',
  body: {
    settings: {
      analysis: {
        char_filter: {
          normalize,
        },
        tokenizer: {
          ja_sudachi_tokenizer_A,
          ja_sudachi_tokenizer_B,
          ja_sudachi_tokenizer_C,
          ja_kuromoji_tokenizer,
          ja_ngram_tokenizer,
        },
        filter: {
          ja_sudachi_search_split,
          ja_index_synonym,
          ja_search_synonym,
        },
        analyzer: {
          ja_sudachi_index_analyzer_A,
          ja_sudachi_search_analyzer_A,
          ja_sudachi_index_analyzer_B,
          ja_sudachi_search_analyzer_B,
          ja_sudachi_index_analyzer_C,
          ja_sudachi_search_analyzer_C,
          ja_kuromoji_index_analyzer,
          ja_kuromoji_search_analyzer,
          ja_ngram_index_analyzer,
          ja_ngram_search_analyzer,
        },
      },
    },
    mappings: {
      properties: {
        paperId: {
          type: 'keyword',
        },
        userId: {
          type: 'keyword',
        },
        userName: {
          type: 'keyword',
        },
        userDisplayName: {
          type: 'keyword',
        },
        groupId: {
          type: 'keyword',
        },
        groupName: {
          type: 'keyword',
        },
        groupDisplayName: {
          type: 'keyword',
        },
        groupType: {
          type: 'keyword',
        },
        createdAt: {
          type: 'date',
        },
        updatedAt: {
          type: 'date',
        },
        title: {
          type: 'text',
          fields: {
            sudachi_A: {
              type: 'text',
              search_analyzer: 'ja_sudachi_search_analyzer_A',
              analyzer: 'ja_sudachi_index_analyzer_A',
            },
            sudachi_B: {
              type: 'text',
              search_analyzer: 'ja_sudachi_search_analyzer_B',
              analyzer: 'ja_sudachi_index_analyzer_B',
            },
            sudachi_C: {
              type: 'text',
              search_analyzer: 'ja_sudachi_search_analyzer_C',
              analyzer: 'ja_sudachi_index_analyzer_C',
            },
            kuromoji: {
              type: 'text',
              search_analyzer: 'ja_kuromoji_search_analyzer',
              analyzer: 'ja_kuromoji_index_analyzer',
            },
            ngram: {
              type: 'text',
              search_analyzer: 'ja_ngram_search_analyzer',
              analyzer: 'ja_ngram_index_analyzer',
            },
          },
        },
        tags: {
          type: 'keyword',
          fields: {
            sudachi_A: {
              type: 'text',
              search_analyzer: 'ja_sudachi_search_analyzer_A',
              analyzer: 'ja_sudachi_index_analyzer_A',
            },
            sudachi_B: {
              type: 'text',
              search_analyzer: 'ja_sudachi_search_analyzer_B',
              analyzer: 'ja_sudachi_index_analyzer_B',
            },
            sudachi_C: {
              type: 'text',
              search_analyzer: 'ja_sudachi_search_analyzer_C',
              analyzer: 'ja_sudachi_index_analyzer_C',
            },
            kuromoji: {
              type: 'text',
              search_analyzer: 'ja_kuromoji_search_analyzer',
              analyzer: 'ja_kuromoji_index_analyzer',
            },
            ngram: {
              type: 'text',
              search_analyzer: 'ja_ngram_search_analyzer',
              analyzer: 'ja_ngram_index_analyzer',
            },
          },
        },
        body: {
          type: 'text',
          fields: {
            sudachi_A: {
              type: 'text',
              search_analyzer: 'ja_sudachi_search_analyzer_A',
              analyzer: 'ja_sudachi_index_analyzer_A',
            },
            sudachi_B: {
              type: 'text',
              search_analyzer: 'ja_sudachi_search_analyzer_B',
              analyzer: 'ja_sudachi_index_analyzer_B',
            },
            sudachi_C: {
              type: 'text',
              search_analyzer: 'ja_sudachi_search_analyzer_C',
              analyzer: 'ja_sudachi_index_analyzer_C',
            },
            kuromoji: {
              type: 'text',
              search_analyzer: 'ja_kuromoji_search_analyzer',
              analyzer: 'ja_kuromoji_index_analyzer',
            },
            ngram: {
              type: 'text',
              search_analyzer: 'ja_ngram_search_analyzer',
              analyzer: 'ja_ngram_index_analyzer',
            },
          },
        },
      },
    },
  },
}

export const groups = {
  index: 'groups',
  body: {
    settings: {
      analysis: {
        char_filter: {
          normalize,
        },
        tokenizer: {
          ja_sudachi_tokenizer_A,
          ja_sudachi_tokenizer_B,
          ja_sudachi_tokenizer_C,
          ja_kuromoji_tokenizer,
          ja_ngram_tokenizer,
        },
        filter: {
          ja_sudachi_search_split,
          ja_index_synonym,
          ja_search_synonym,
        },
        analyzer: {
          ja_sudachi_index_analyzer_A,
          ja_sudachi_search_analyzer_A,
          ja_sudachi_index_analyzer_B,
          ja_sudachi_search_analyzer_B,
          ja_sudachi_index_analyzer_C,
          ja_sudachi_search_analyzer_C,
          ja_kuromoji_index_analyzer,
          ja_kuromoji_search_analyzer,
          ja_ngram_index_analyzer,
          ja_ngram_search_analyzer,
        },
      },
    },
    mappings: {
      properties: {
        name: {
          type: 'keyword',
          fields: {
            ngram: {
              type: 'text',
              search_analyzer: 'ja_ngram_search_analyzer',
              analyzer: 'ja_ngram_index_analyzer',
            },
          },
        },
        displayName: {
          type: 'keyword',
          fields: {
            sudachi_A: {
              type: 'text',
              search_analyzer: 'ja_sudachi_search_analyzer_A',
              analyzer: 'ja_sudachi_index_analyzer_A',
            },
            sudachi_B: {
              type: 'text',
              search_analyzer: 'ja_sudachi_search_analyzer_B',
              analyzer: 'ja_sudachi_index_analyzer_B',
            },
            sudachi_C: {
              type: 'text',
              search_analyzer: 'ja_sudachi_search_analyzer_C',
              analyzer: 'ja_sudachi_index_analyzer_C',
            },
            kuromoji: {
              type: 'text',
              search_analyzer: 'ja_kuromoji_search_analyzer',
              analyzer: 'ja_kuromoji_index_analyzer',
            },
            ngram: {
              type: 'text',
              search_analyzer: 'ja_ngram_search_analyzer',
              analyzer: 'ja_ngram_index_analyzer',
            },
          },
        },
        type: {
          type: 'keyword',
        },
        description: {
          type: 'text',
          fields: {
            sudachi_A: {
              type: 'text',
              search_analyzer: 'ja_sudachi_search_analyzer_A',
              analyzer: 'ja_sudachi_index_analyzer_A',
            },
            sudachi_B: {
              type: 'text',
              search_analyzer: 'ja_sudachi_search_analyzer_B',
              analyzer: 'ja_sudachi_index_analyzer_B',
            },
            sudachi_C: {
              type: 'text',
              search_analyzer: 'ja_sudachi_search_analyzer_C',
              analyzer: 'ja_sudachi_index_analyzer_C',
            },
            kuromoji: {
              type: 'text',
              search_analyzer: 'ja_kuromoji_search_analyzer',
              analyzer: 'ja_kuromoji_index_analyzer',
            },
            ngram: {
              type: 'text',
              search_analyzer: 'ja_ngram_search_analyzer',
              analyzer: 'ja_ngram_index_analyzer',
            },
          },
        },
      },
    },
  },
}

export const users = {
  index: 'users',
  body: {
    settings: {
      analysis: {
        char_filter: {
          normalize,
        },
        tokenizer: {
          ja_sudachi_tokenizer_A,
          ja_sudachi_tokenizer_B,
          ja_sudachi_tokenizer_C,
          ja_kuromoji_tokenizer,
          ja_ngram_tokenizer,
        },
        filter: {
          ja_sudachi_search_split,
          ja_index_synonym,
          ja_search_synonym,
        },
        analyzer: {
          ja_sudachi_index_analyzer_A,
          ja_sudachi_search_analyzer_A,
          ja_sudachi_index_analyzer_B,
          ja_sudachi_search_analyzer_B,
          ja_sudachi_index_analyzer_C,
          ja_sudachi_search_analyzer_C,
          ja_kuromoji_index_analyzer,
          ja_kuromoji_search_analyzer,
          ja_ngram_index_analyzer,
          ja_ngram_search_analyzer,
        },
      },
    },
    mappings: {
      properties: {
        username: {
          type: 'keyword',
          fields: {
            ngram: {
              type: 'text',
              search_analyzer: 'ja_ngram_search_analyzer',
              analyzer: 'ja_ngram_index_analyzer',
            },
          },
        },
        email: {
          type: 'keyword',
          fields: {
            ngram: {
              type: 'text',
              search_analyzer: 'ja_ngram_search_analyzer',
              analyzer: 'ja_ngram_index_analyzer',
            },
          },
        },
        displayName: {
          type: 'keyword',
          fields: {
            sudachi_A: {
              type: 'text',
              search_analyzer: 'ja_sudachi_search_analyzer_A',
              analyzer: 'ja_sudachi_index_analyzer_A',
            },
            sudachi_B: {
              type: 'text',
              search_analyzer: 'ja_sudachi_search_analyzer_B',
              analyzer: 'ja_sudachi_index_analyzer_B',
            },
            sudachi_C: {
              type: 'text',
              search_analyzer: 'ja_sudachi_search_analyzer_C',
              analyzer: 'ja_sudachi_index_analyzer_C',
            },
            kuromoji: {
              type: 'text',
              search_analyzer: 'ja_kuromoji_search_analyzer',
              analyzer: 'ja_kuromoji_index_analyzer',
            },
            ngram: {
              type: 'text',
              search_analyzer: 'ja_ngram_search_analyzer',
              analyzer: 'ja_ngram_index_analyzer',
            },
          },
        },
        description: {
          type: 'text',
          fields: {
            sudachi_A: {
              type: 'text',
              search_analyzer: 'ja_sudachi_search_analyzer_A',
              analyzer: 'ja_sudachi_index_analyzer_A',
            },
            sudachi_B: {
              type: 'text',
              search_analyzer: 'ja_sudachi_search_analyzer_B',
              analyzer: 'ja_sudachi_index_analyzer_B',
            },
            sudachi_C: {
              type: 'text',
              search_analyzer: 'ja_sudachi_search_analyzer_C',
              analyzer: 'ja_sudachi_index_analyzer_C',
            },
            kuromoji: {
              type: 'text',
              search_analyzer: 'ja_kuromoji_search_analyzer',
              analyzer: 'ja_kuromoji_index_analyzer',
            },
            ngram: {
              type: 'text',
              search_analyzer: 'ja_ngram_search_analyzer',
              analyzer: 'ja_ngram_index_analyzer',
            },
          },
        },
      },
    },
  },
}
