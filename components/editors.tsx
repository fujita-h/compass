import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Markdown } from '@components/markdown'
import { TagForm } from './forms/tagForm'
import { Auth, useCreateDraftMutation, useUpdateDraftMutation, useUpdateUserTemplateMutation } from '@graphql/generated/react-apollo'
import { useRouter } from 'next/router'

export type EditorData = {
  title: string
  body: string
  tags: string[]
}
export type EditorMeta = {
  groupId?: string
  documentId?: string
  paperId?: string
  userTemplateId?: string
  groupTemplateId?: string
}

const uploadFile = async (files) => {
  const body = new FormData()
  files.map((file) => {
    body.append('file', file)
  })
  const res = await fetch('/api/files/attachments', { method: 'POST', body })
  return res.json()
}

const insertFileText = (uploadResults) => {
  const snipet = uploadResults
    .map((result) => {
      if (result.status == 'fulfilled') {
        return `![${result.value.fileName}](/api/files/attachments/${encodeURIComponent(result.value.id.toLowerCase())})`
      } else {
        return '<!-- アップロードに失敗しました -->'
      }
    })
    .join('\n')
  return '\n' + snipet + '\n'
}

export const EditorForm = ({
  data,
  meta,
  submitButtonMap,
  submitType,
  loading = false,
  autoSaveDelay = 0,
}: {
  data: EditorData
  meta: EditorMeta
  submitButtonMap: Array<SubmitButtonSetting>
  submitType: string
  loading?: boolean
  autoSaveDelay?: number
}) => {
  const router = useRouter()
  const [displayStyle, setDisplayStyle] = useState(0)
  const [docData, setDocData] = useState<EditorData>(data)
  const [docMeta, setDocMeta] = useState<EditorMeta>(meta)
  const [selectionPosition, setSelectionPosition] = useState(0)
  const isFormValueChangedByUser = useRef(false)
  const [createDraft, {}] = useCreateDraftMutation()
  const [updateDraft, {}] = useUpdateDraftMutation()
  const [updateUserTemplate, {}] = useUpdateUserTemplateMutation()
  const paperIdRef = useRef(meta.paperId)

  // re-set when initDocData provided.
  useEffect(() => {
    isFormValueChangedByUser.current = false
    setDocData(data)
  }, [data])

  useEffect(() => {
    setDocMeta(meta)
  }, [meta])

  // auto-saving
  useEffect(() => {
    if (isFormValueChangedByUser.current && autoSaveDelay > 0) {
      const timer = setTimeout(() => {
        submitFunc('auto-saving', docData)
      }, autoSaveDelay * 1000)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [docData])

  const submitFunc = useCallback(
    (submitType, data: EditorData) => {
      const auth: Auth = 'user'
      const paperId = docMeta.paperId || paperIdRef.current
      const variables = {
        auth,
        paperId: paperId,
        groupId: docMeta.groupId,
        documentId: docMeta.documentId,
        title: data.title,
        body: data.body,
        tags: data.tags.join(','),
      }

      if (docMeta.userTemplateId) {
        if (submitType == 'auto-saving') {
          updateUserTemplate({
            variables: { ...variables, id: docMeta.userTemplateId },
          })
        } else {
          // if (submitType == 'save')
          updateUserTemplate({
            variables: { ...variables, id: docMeta.userTemplateId },
            onCompleted: (data) => {
              router.push(`/settings/templates`)
            },
          })
        }
      } else if (docMeta.groupTemplateId) {
        // not implemeted yet.
      } else if (paperId) {
        if (submitType == 'publish') {
          updateDraft({
            variables: { ...variables, isPosted: 1 },
            onCompleted: (data) => {
              router.push(`/docs/${encodeURIComponent(data.updatePaper.documentIdLazy.toLowerCase())}`)
            },
          })
        } else if (submitType == 'auto-saving') {
          updateDraft({
            variables: { ...variables },
          })
        } else {
          // if (submitType == 'draft')
          updateDraft({
            variables: { ...variables },
            onCompleted: (data) => {
              router.push(`/drafts/${encodeURIComponent(data.updatePaper.id.toLowerCase())}`)
            },
          })
        }
      } else {
        if (submitType == 'publish') {
          createDraft({
            variables: { ...variables, isPosted: 1 },
            onCompleted: (data) => {
              router.push(`/docs/${encodeURIComponent(data.createPaper.documentIdLazy.toLowerCase())}`)
            },
          })
        } else if (submitType == 'auto-saving') {
          createDraft({
            variables: { ...variables },
            onCompleted: (data) => {
              paperIdRef.current = data.createPaper.id
              setDocMeta({ ...docData, paperId: data.createPaper.id })
            },
          })
        } else {
          // if (submitType == 'draft')
          createDraft({
            variables: { ...variables },
            onCompleted: (data) => {
              router.push(`/drafts/${encodeURIComponent(data.createPaper.id.toLowerCase())}`)
            },
          })
        }
      }
    },
    [docMeta, paperIdRef]
  )

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const results = await uploadFile(acceptedFiles)
      const doc = insertFileText(results)
      isFormValueChangedByUser.current = true
      setDocData({
        ...docData,
        body: docData.body.substring(0, selectionPosition) + doc + docData.body.substring(selectionPosition),
      })
      const target: HTMLInputElement = document.getElementById('textarea-markdown-body') as HTMLInputElement
      target.setSelectionRange(selectionPosition + doc.length, selectionPosition + doc.length)
    },
    [docData, selectionPosition]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const displayStyleChangeHandler = useCallback(
    (value: number) => {
      if (value == -1) {
        if (displayStyle == 0) setDisplayStyle(-1)
        if (displayStyle > 0) setDisplayStyle(0)
      } else if (value == 1) {
        if (displayStyle < 0) setDisplayStyle(0)
        if (displayStyle == 0) setDisplayStyle(1)
      }
    },
    [displayStyle]
  )

  const handleSubmit = useCallback(
    (type) => {
      submitFunc(type, docData)
    },
    [submitType, docData]
  )

  return (
    <div className="mx-1 mt-1 bg-white">
      <div className="relative">
        <input
          type="text"
          className="mb-1 w-full flex-1 appearance-none border border-gray-300 bg-white py-2 px-2 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="タイトル"
          value={docData.title}
          onChange={(e) => {
            isFormValueChangedByUser.current = true
            setDocData({ ...docData, title: e.target.value })
          }}
        />
        <TagForm
          initState={docData.tags}
          setStateFunc={(tags) => {
            isFormValueChangedByUser.current = true
            setDocData({ ...docData, tags: tags })
          }}
        />
      </div>
      <div className="flex justify-between" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="w-full flex-1 border border-gray-400" style={{ display: displayStyle < 0 ? 'none' : '' }}>
          <div className="p-1" style={{ height: '2.4rem' }}>
            {displayStyle >= 0 && (
              <div className="text-right">
                <span
                  className="border border-gray-400 bg-gray-100 px-1 pb-1 align-middle hover:cursor-pointer"
                  onClick={() => displayStyleChangeHandler(-1)}
                >
                  &lt;
                </span>
              </div>
            )}
          </div>
          <div
            style={{ height: 'calc(100% - 2.4rem)' }}
            className="w-full"
            {...getRootProps({
              onClick: (e) => {
                e.stopPropagation()
              },
            })}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <div className="h-full w-full border-5 border-dashed border-indigo-300 p-2">Drag</div>
            ) : (
              <textarea
                id="textarea-markdown-body"
                className="h-full w-full resize-none p-2"
                value={docData.body}
                onKeyUp={(e) => {
                  setSelectionPosition(e.currentTarget.selectionStart)
                }}
                onClick={(e) => {
                  setSelectionPosition(e.currentTarget.selectionStart)
                }}
                onChange={(e) => {
                  isFormValueChangedByUser.current = true
                  setDocData({ ...docData, body: e.target.value })
                  setSelectionPosition(e.target.selectionStart)
                }}
                onPaste={async (e) => {
                  // Get the data of clipboard
                  const clipboardItems = e.clipboardData.items
                  const items = [].slice.call(clipboardItems).filter(function (item) {
                    // Filter the image items only
                    return item.type.indexOf('image') !== -1
                  })
                  if (items.length === 0) {
                    return
                  }

                  // 貼り付けられたファイルをアップロード
                  const results = await uploadFile(items.map((item) => item.getAsFile()))
                  const doc = insertFileText(results)
                  isFormValueChangedByUser.current = true
                  setDocData({
                    ...docData,
                    body: docData.body.substring(0, selectionPosition) + doc + docData.body.substring(selectionPosition),
                  })

                  const target = e.target as HTMLInputElement
                  target.setSelectionRange(selectionPosition + doc.length, selectionPosition + doc.length)
                }}
              ></textarea>
            )}
          </div>
        </div>
        <div
          className="w-full flex-1 border border-gray-400"
          style={{ display: displayStyle > 0 ? 'none' : '', maxWidth: displayStyle == 0 ? '50%' : '' }}
        >
          <div className="p-1" style={{ height: '2.4rem' }}>
            {displayStyle <= 0 && (
              <div className="text-left">
                <span
                  className="border border-gray-400 bg-gray-100 px-1 pb-1 align-middle hover:cursor-pointer"
                  onClick={() => displayStyleChangeHandler(1)}
                >
                  &gt;
                </span>
              </div>
            )}
          </div>
          <div style={{ height: 'calc(100% - 2.4rem)', overflowWrap: 'anywhere' }} className="markdown w-full overflow-auto p-2">
            <Markdown>{docData.body}</Markdown>
          </div>
        </div>
      </div>
      <div className="mt-1 flex justify-between">
        <div></div>
        <div>
          <SubmitButton submitButtonMap={submitButtonMap} onSubmit={handleSubmit} />
        </div>
      </div>
      <div id="loading-layer" hidden={!loading} className="absolute top-0 left-0 z-50 h-full w-full bg-transparent">
        <div className="flex h-full w-full items-center justify-center">
          <div>
            <div className="h-16 w-16 animate-spin rounded-full border-8 border-blue-500 border-t-transparent" />
            <div className="mt-2 text-center font-bold text-gray-700">Loading..</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export type SubmitButtonSetting = {
  key: string
  label: string
}

const SubmitButton = ({
  submitButtonMap,
  onSubmit,
}: {
  submitButtonMap: Array<SubmitButtonSetting>
  onSubmit: (submitType: string) => void
}) => {
  const [submitButtonType, setSubmitButtonType] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleBlur = (e) => {
    if (e.currentTarget === e.target) {
      //console.log("blur (self)")
    }
    //console.log(e.relatedTarget)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      //console.log("focusleave")
      setIsMenuOpen(false)
    }
  }

  const subitButtonLabel = (key: string) => {
    if (submitButtonMap.length == 0) throw 'submitButtonMap not defined.'
    // 初期状態では渡されたsubmitButtonMapの最後の値をセットする
    const item = submitButtonMap.find((x) => x.key == key) ?? submitButtonMap.slice(-1)[0]
    return item.label
  }

  const submitSelectionSelected = (e) => {
    const type = e.target.dataset.name ?? ''
    setSubmitButtonType(type)
    setIsMenuOpen(false)
  }

  const handleSubmit = (e) => {
    if (isMenuOpen) {
      setIsMenuOpen(false)
      return
    }
    onSubmit(submitButtonType)
  }

  return (
    <div onClick={(e) => e.currentTarget.focus()} onBlur={handleBlur} tabIndex={0}>
      <div
        hidden={!isMenuOpen}
        className="absolute right-2 bottom-14 z-40 mt-2 w-fit rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5"
      >
        {submitButtonMap.map((btn) => (
          <div className="py-1" key={btn.key}>
            <div
              data-name={btn.key}
              onClick={submitSelectionSelected}
              className="block cursor-pointer px-4 py-2 text-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              {btn.label}
            </div>
          </div>
        ))}
      </div>
      <div className="flex">
        <div className="cursor-pointer rounded-l-md bg-blue-500 px-3 py-1 text-base text-white hover:bg-blue-400" onClick={handleSubmit}>
          <span className="text-lg">{subitButtonLabel(submitButtonType)}</span>
        </div>
        <div
          className="cursor-pointer rounded-r-md bg-blue-500 py-1 pl-1 pr-2 text-base text-white hover:bg-blue-400"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-caret-up-fill mt-1 h-4 w-4" viewBox="0 0 14 12">
            <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
          </svg>
        </div>
      </div>
    </div>
  )
}
