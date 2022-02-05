export const documents = {
  index: 'documents',
  body: {
    settings: {
      analysis: {
        char_filter: {
          normalize: {
            type: "icu_normalizer", // unicode 文字の正規化
            name: "nfkc",
            mode: "compose"
          }
        },
        tokenizer: {
          ja_kuromoji_tokenizer: {
            mode: "search",
            type: "kuromoji_tokenizer",
            discard_compound_token: true, // 複合語を含んだ同義語を設定した場合の処置
            user_dictionary_rules: [
              // "東京スカイツリー,東京 スカイツリー,トウキョウ スカイツリー,カスタム名詞",
            ]
          },
          ja_ngram_tokenizer: {
            type: "ngram",
            min_gram: 2,
            max_gram: 2,
            token_chars: [
              "letter",
              "digit"
            ]
          }
        },
        filter: {
          ja_index_synonym: {
            type: "synonym",
            lenient: false, // discard_compound_token: true が入っているので false でOK
            synonyms: [
              // "アメリカ, 米国"
            ]
          },
          ja_search_synonym: {
            type: "synonym_graph",
            lenient: false, // discard_compound_token: true が入っているので false でOK
            synonyms: [
              // "アメリカ, 米国"
            ]
          }
        },
        analyzer: {
          ja_kuromoji_index_analyzer: {
            type: "custom",
            char_filter: [
              "normalize" // unicode文字の正規化
            ],
            tokenizer: "ja_kuromoji_tokenizer",
            filter: [
              "kuromoji_baseform", // 動詞・形容詞を原型に戻す
              "kuromoji_part_of_speech", // 不要な品詞を削除
              "ja_index_synonym", // 同義語
              "cjk_width", // 全角半角を統一する
              "ja_stop", // 日本語ストップワード除去
              "kuromoji_stemmer", // カタカナの末尾の伸ばし棒を削除
              "lowercase", // 英字の大文字を小文字に変換
            ]
          },
          ja_kuromoji_search_analyzer: {
            type: "custom",
            char_filter: [
              "normalize" // unicode文字の正規化
            ],
            tokenizer: "ja_kuromoji_tokenizer",
            filter: [
              "kuromoji_baseform", // 動詞・形容詞を原型に戻す
              "kuromoji_part_of_speech", // 不要な品詞を削除
              "ja_search_synonym", // 同義語
              "cjk_width", // 全角半角を統一する
              "ja_stop", // 日本語ストップワード除去
              "kuromoji_stemmer", // カタカナの末尾の伸ばし棒を削除
              "lowercase", // 英字の大文字を小文字に変換
            ]
          },
          ja_ngram_index_analyzer: {
            type: "custom",
            char_filter: [
              "normalize" // unicode文字の正規化
            ],
            tokenizer: "ja_ngram_tokenizer",
            filter: [
              "lowercase" // 英字の大文字を小文字に変換
            ]
          },
          ja_ngram_search_analyzer: {
            type: "custom",
            char_filter: [
              "normalize" // unicode文字の正規化
            ],
            tokenizer: "ja_ngram_tokenizer",
            filter: [
              "ja_search_synonym", // 同義語
              "lowercase" // 英字の大文字を小文字に変換
            ]
          }
        }
      }
    },
    mappings: {
      properties: {
        paperId: {
          type: "keyword",
        },
        userId: {
          type: "keyword",
        },
        userName: {
          type: "keyword"
        },
        userDisplayName: {
          type: "keyword"
        },
        groupId: {
          type: "keyword",
        },
        groupName: {
          type: "keyword"
        },
        groupDisplayName: {
          type: "keyword"
        },
        groupType: {
          type: "keyword"
        },
        createdAt: {
          type: "keyword"
        },
        createdAtNumber: {
          type: "unsigned_long"
        },
        updatedAt: {
          type: "keyword"
        },
        updatedAtNumber: {
          type: "unsigned_long"
        },
        title: {
          type: "text",
          search_analyzer: "ja_kuromoji_search_analyzer",
          analyzer: "ja_kuromoji_index_analyzer",
          fields: {
            ngram: {
              type: "text",
              search_analyzer: "ja_ngram_search_analyzer",
              analyzer: "ja_ngram_index_analyzer"
            }
          }
        },
        tags: {
          type: "keyword",
          fields: {
            text: {
              type: "text",
              search_analyzer: "ja_kuromoji_search_analyzer",
              analyzer: "ja_kuromoji_index_analyzer",
            },
            ngram: {
              type: "text",
              search_analyzer: "ja_ngram_search_analyzer",
              analyzer: "ja_ngram_index_analyzer"
            }
          }
        },
        body: {
          type: "text",
          search_analyzer: "ja_kuromoji_search_analyzer",
          analyzer: "ja_kuromoji_index_analyzer",
          fields: {
            ngram: {
              type: "text",
              search_analyzer: "ja_ngram_search_analyzer",
              analyzer: "ja_ngram_index_analyzer"
            }
          }
        }
      }
    }
  }
}


export const groups = {
  index: 'groups',
  body: {
    settings: {
      analysis: {
        char_filter: {
          normalize: {
            type: "icu_normalizer", // unicode 文字の正規化
            name: "nfkc",
            mode: "compose"
          }
        },
        tokenizer: {
          ja_kuromoji_tokenizer: {
            mode: "search",
            type: "kuromoji_tokenizer",
            discard_compound_token: true, // 複合語を含んだ同義語を設定した場合の処置
            user_dictionary_rules: [
              // "東京スカイツリー,東京 スカイツリー,トウキョウ スカイツリー,カスタム名詞",
            ]
          },
          ja_ngram_tokenizer: {
            type: "ngram",
            min_gram: 2,
            max_gram: 2,
            token_chars: [
              "letter",
              "digit"
            ]
          }
        },
        filter: {
          ja_index_synonym: {
            type: "synonym",
            lenient: false, // discard_compound_token: true が入っているので false でOK
            synonyms: [
              // "アメリカ, 米国"
            ]
          },
          ja_search_synonym: {
            type: "synonym_graph",
            lenient: false, // discard_compound_token: true が入っているので false でOK
            synonyms: [
              // "アメリカ, 米国"
            ]
          }
        },
        analyzer: {
          ja_kuromoji_index_analyzer: {
            type: "custom",
            char_filter: [
              "normalize" // unicode文字の正規化
            ],
            tokenizer: "ja_kuromoji_tokenizer",
            filter: [
              "kuromoji_baseform", // 動詞・形容詞を原型に戻す
              "kuromoji_part_of_speech", // 不要な品詞を削除
              "ja_index_synonym", // 同義語
              "cjk_width", // 全角半角を統一する
              "ja_stop", // 日本語ストップワード除去
              "kuromoji_stemmer", // カタカナの末尾の伸ばし棒を削除
              "lowercase", // 英字の大文字を小文字に変換
            ]
          },
          ja_kuromoji_search_analyzer: {
            type: "custom",
            char_filter: [
              "normalize" // unicode文字の正規化
            ],
            tokenizer: "ja_kuromoji_tokenizer",
            filter: [
              "kuromoji_baseform", // 動詞・形容詞を原型に戻す
              "kuromoji_part_of_speech", // 不要な品詞を削除
              "ja_search_synonym", // 同義語
              "cjk_width", // 全角半角を統一する
              "ja_stop", // 日本語ストップワード除去
              "kuromoji_stemmer", // カタカナの末尾の伸ばし棒を削除
              "lowercase", // 英字の大文字を小文字に変換
            ]
          },
          ja_ngram_index_analyzer: {
            type: "custom",
            char_filter: [
              "normalize" // unicode文字の正規化
            ],
            tokenizer: "ja_ngram_tokenizer",
            filter: [
              "lowercase" // 英字の大文字を小文字に変換
            ]
          },
          ja_ngram_search_analyzer: {
            type: "custom",
            char_filter: [
              "normalize" // unicode文字の正規化
            ],
            tokenizer: "ja_ngram_tokenizer",
            filter: [
              "ja_search_synonym", // 同義語
              "lowercase" // 英字の大文字を小文字に変換
            ]
          }
        }
      }
    },
    mappings: {
      properties: {
        name: {
          type: "keyword"
        },
        displayName: {
          type: "keyword",
          fields: {
            text: {
              type: "text",
              search_analyzer: "ja_kuromoji_search_analyzer",
              analyzer: "ja_kuromoji_index_analyzer",
            },
            ngram: {
              type: "text",
              search_analyzer: "ja_ngram_search_analyzer",
              analyzer: "ja_ngram_index_analyzer"
            }
          }
        },
        type: {
          type: "keyword"
        },
        description: {
          type: "text",
          search_analyzer: "ja_kuromoji_search_analyzer",
          analyzer: "ja_kuromoji_index_analyzer",
          fields: {
            ngram: {
              type: "text",
              search_analyzer: "ja_ngram_search_analyzer",
              analyzer: "ja_ngram_index_analyzer"
            }
          }
        }
      }
    }
  }
}

export const users = {
  index: 'users',
  body: {
    settings: {
      analysis: {
        char_filter: {
          normalize: {
            type: "icu_normalizer", // unicode 文字の正規化
            name: "nfkc",
            mode: "compose"
          }
        },
        tokenizer: {
          ja_kuromoji_tokenizer: {
            mode: "search",
            type: "kuromoji_tokenizer",
            discard_compound_token: true, // 複合語を含んだ同義語を設定した場合の処置
            user_dictionary_rules: [
              // "東京スカイツリー,東京 スカイツリー,トウキョウ スカイツリー,カスタム名詞",
            ]
          },
          ja_ngram_tokenizer: {
            type: "ngram",
            min_gram: 2,
            max_gram: 2,
            token_chars: [
              "letter",
              "digit"
            ]
          }
        },
        filter: {
          ja_index_synonym: {
            type: "synonym",
            lenient: false, // discard_compound_token: true が入っているので false でOK
            synonyms: [
              // "アメリカ, 米国"
            ]
          },
          ja_search_synonym: {
            type: "synonym_graph",
            lenient: false, // discard_compound_token: true が入っているので false でOK
            synonyms: [
              // "アメリカ, 米国"
            ]
          }
        },
        analyzer: {
          ja_kuromoji_index_analyzer: {
            type: "custom",
            char_filter: [
              "normalize" // unicode文字の正規化
            ],
            tokenizer: "ja_kuromoji_tokenizer",
            filter: [
              "kuromoji_baseform", // 動詞・形容詞を原型に戻す
              "kuromoji_part_of_speech", // 不要な品詞を削除
              "ja_index_synonym", // 同義語
              "cjk_width", // 全角半角を統一する
              "ja_stop", // 日本語ストップワード除去
              "kuromoji_stemmer", // カタカナの末尾の伸ばし棒を削除
              "lowercase", // 英字の大文字を小文字に変換
            ]
          },
          ja_kuromoji_search_analyzer: {
            type: "custom",
            char_filter: [
              "normalize" // unicode文字の正規化
            ],
            tokenizer: "ja_kuromoji_tokenizer",
            filter: [
              "kuromoji_baseform", // 動詞・形容詞を原型に戻す
              "kuromoji_part_of_speech", // 不要な品詞を削除
              "ja_search_synonym", // 同義語
              "cjk_width", // 全角半角を統一する
              "ja_stop", // 日本語ストップワード除去
              "kuromoji_stemmer", // カタカナの末尾の伸ばし棒を削除
              "lowercase", // 英字の大文字を小文字に変換
            ]
          },
          ja_ngram_index_analyzer: {
            type: "custom",
            char_filter: [
              "normalize" // unicode文字の正規化
            ],
            tokenizer: "ja_ngram_tokenizer",
            filter: [
              "lowercase" // 英字の大文字を小文字に変換
            ]
          },
          ja_ngram_search_analyzer: {
            type: "custom",
            char_filter: [
              "normalize" // unicode文字の正規化
            ],
            tokenizer: "ja_ngram_tokenizer",
            filter: [
              "ja_search_synonym", // 同義語
              "lowercase" // 英字の大文字を小文字に変換
            ]
          }
        }
      }
    },
    mappings: {
      properties: {
        username: {
          type: "keyword",
        },
        email: {
          type: "keyword",
        },
        displayName: {
          type: "keyword",
        },
        description: {
          type: "text",
          search_analyzer: "ja_kuromoji_search_analyzer",
          analyzer: "ja_kuromoji_index_analyzer",
          fields: {
            ngram: {
              type: "text",
              search_analyzer: "ja_ngram_search_analyzer",
              analyzer: "ja_ngram_index_analyzer"
            }
          }
        },
      }
    }
  }
}
