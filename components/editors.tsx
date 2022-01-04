import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from "react-dropzone"
import { Markdown } from '@components/markdown'

export type DocumentData = {
  title: string,
  body: string,
}

const uploadFile = async (files) => {
  const body = new FormData()
  files.map((file) => { body.append('file', file) })
  const res = await fetch("/api/files/attachments", { method: "POST", body })
  return res.json()
}

const insertFileText = (uploadResults) => {
  const snipet = uploadResults.map((result) => {
    if (result.status == "fulfilled") {
      return `![${result.value.fileName}](/api/files/attachments/${encodeURIComponent(result.value.id.toLowerCase())})`
    } else {
      return "<!-- アップロードに失敗しました -->"
    }
  }).join('\n')
  return '\n' + snipet + '\n'
}

export const DocumentEditorForm = ({ children, initDocData, submitButtonMap, onSubmit }: { children?: any, initDocData: DocumentData, submitButtonMap: Array<SubmitButtonSetting>, onSubmit: (submitType: string, data: DocumentData) => void }) => {
  const [displayStyle, setDisplayStyle] = useState(0)
  const [docData, setDocData] = useState<DocumentData>(initDocData)
  const [selectionPosition, setSelectionPosition] = useState(0)

  const onDrop = useCallback(async (acceptedFiles) => {
    const results = await uploadFile(acceptedFiles)
    const doc = insertFileText(results)
    setDocData({
      ...docData, body:
        docData.body.substring(0, selectionPosition) + doc + docData.body.substring(selectionPosition)
    })
    const target: HTMLInputElement = document.getElementById("textarea-markdown-body") as HTMLInputElement
    target.setSelectionRange(selectionPosition + doc.length, selectionPosition + doc.length)
  }, [docData, selectionPosition])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const displayStyleChangeHandler = useCallback((value: number) => {
    if (value == -1) {
      if (displayStyle == 0) setDisplayStyle(-1)
      if (displayStyle > 0) setDisplayStyle(0)
    } else if (value == 1) {
      if (displayStyle < 0) setDisplayStyle(0)
      if (displayStyle == 0) setDisplayStyle(1)
    }
  }, [displayStyle])

  const handleSubmit = (submitType) => {
    onSubmit(submitType, docData)
  }


  return (
    <div className='mx-1 mt-1 bg-white'>
      <div className="relative">
        <input type="text"
          className="flex-1 appearance-none border border-gray-300 w-full py-2 px-2 mb-1 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          placeholder="タイトル"
          value={docData.title}
          onChange={(e) => { setDocData({ ...docData, title: e.target.value }) }} />
        <input type="text" className="flex-1 appearance-none border border-gray-300 w-full py-2 px-2 mb-1 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" placeholder="タグ" />
      </div>
      <div className="flex justify-between" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="w-full border border-gray-400" style={{ display: displayStyle < 0 && 'none' }}>
          <div className="p-1" style={{ height: '2.4rem' }}>
            {displayStyle >= 0 && <div className="text-right">
              <span className="align-middle pb-1 px-1 border bg-gray-100 border-gray-400 hover:cursor-pointer" onClick={() => displayStyleChangeHandler(-1)}>&lt;</span>
            </div>}
          </div>
          <div style={{ height: 'calc(100% - 2.4rem)' }} className="w-full" {...getRootProps({ onClick: (e) => { e.stopPropagation() } })}>
            <input {...getInputProps()} />
            {isDragActive ? <div className="p-2 w-full h-full border-5 border-dashed border-indigo-300">Drag</div> :
              <textarea id="textarea-markdown-body" className="p-2 w-full h-full resize-none" value={docData.body}
                onKeyUp={(e) => {
                  setSelectionPosition(e.currentTarget.selectionStart)
                }}
                onClick={(e) => {
                  setSelectionPosition(e.currentTarget.selectionStart)
                }}
                onChange={(e) => {
                  setDocData({ ...docData, body: e.target.value })
                  setSelectionPosition(e.target.selectionStart)
                }}
                onPaste={async (e) => {
                  // Get the data of clipboard
                  const clipboardItems = e.clipboardData.items;
                  const items = [].slice.call(clipboardItems).filter(function (item) {
                    // Filter the image items only
                    return item.type.indexOf('image') !== -1;
                  });
                  if (items.length === 0) {
                    return;
                  }

                  // 貼り付けられたファイルをアップロード
                  const results = await uploadFile(items.map(item => item.getAsFile()))
                  const doc = insertFileText(results)
                  setDocData({
                    ...docData, body:
                      docData.body.substring(0, selectionPosition) + doc + docData.body.substring(selectionPosition)
                  })

                  const target = e.target as HTMLInputElement
                  target.setSelectionRange(selectionPosition + doc.length, selectionPosition + doc.length)

                }}
              ></textarea>
            }
          </div>
        </div>
        <div className="w-full border border-gray-400" style={{ display: displayStyle > 0 && 'none' }}>
          <div className="p-1" style={{ height: '2.4rem' }}>
            {displayStyle <= 0 && <div className="text-left">
              <span className="align-middle pb-1 px-1 border bg-gray-100 border-gray-400 hover:cursor-pointer" onClick={() => displayStyleChangeHandler(1)}>&gt;</span>
            </div>}
          </div>
          <div style={{ height: 'calc(100% - 2.4rem)' }} className="w-full p-2 overflow-auto markdown">
            <Markdown>{docData.body}</Markdown>
          </div>
        </div>
      </div>
      <div className="mt-1 flex justify-between">
        <div>left pain</div>
        <div>
          <SubmitButton submitButtonMap={submitButtonMap} onSubmit={handleSubmit} />
        </div>

      </div>
    </div>
  )
}

export type SubmitButtonSetting = {
  key: string,
  label: string
}

const SubmitButton = ({ submitButtonMap, onSubmit }: { submitButtonMap: Array<SubmitButtonSetting>, onSubmit: (submitType: string) => void }) => {



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
    const item = submitButtonMap.find(x => x.key == key) ?? submitButtonMap.slice(-1)[0]
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
      <div hidden={!isMenuOpen} className="z-40 absolute right-2 bottom-12 mt-2 w-40 rounded-md shadow-lg bg-white  ring-1 ring-black ring-opacity-5">
        {submitButtonMap.map((btn) =>
          <div className="py-1" key={btn.key} >
            <div data-name={btn.key} onClick={submitSelectionSelected} className="cursor-pointer block px-4 py-2 text-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white dark:hover:bg-gray-600">{btn.label}</div>
          </div>
        )}
      </div>
      <div className="flex">
        <div className="px-3 py-1 rounded-l-md text-base text-white bg-blue-500 hover:bg-blue-400 cursor-pointer"
          onClick={handleSubmit}><span className="text-lg">{subitButtonLabel(submitButtonType)}</span></div>
        <div className="pl-1 pr-2 py-1 rounded-r-md text-base text-white bg-blue-500 hover:bg-blue-400 cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="mt-1 h-4 w-4 bi bi-caret-up-fill" viewBox="0 0 14 12">
            <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
          </svg>
        </div>
      </div>
    </div>

  )
}