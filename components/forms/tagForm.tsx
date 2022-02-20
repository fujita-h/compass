import { useEffect, useState } from 'react'

export const NormarizeText = (text) =>
  text
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(/\s/g, ' ')
    .replace(',', ' ')

export function TagForm({ initState, setStateFunc }: { initState: string[]; setStateFunc: Function }) {
  const [tagState, setTagState] = useState({ tags: initState ?? [] })

  useEffect(() => {
    setTagState({ ...tagState, tags: initState })
  }, [initState])

  const areaClicked = (e) => {
    const eTarget = e.target as HTMLDivElement
    const target = Array.from(eTarget.children).find((x) => x.localName === 'input')
    if (target) {
      ;(target as HTMLElement).focus()
    }
  }

  const tagInputKeyDown = (e) => {
    const eTarget = e.target as HTMLInputElement
    // code=='Enter'だと変換確定時のEnterと通常のEnterを区別できない。
    // keyCodeを使うことで区別できるが、Deprecated であるので注意。
    // keyCode=13は通常のEnter, 変換確定時のEnterはkeyCode=229
    if (e.keyCode === 13 && eTarget.value) {
      tagInputBlured(e)
    }
    if (e.code == 'Backspace' && !eTarget.value) {
      const newTags = tagState.tags
      if (newTags.length > 0) {
        newTags.pop()
        setStateFunc(newTags)
        setTagState({ ...tagState, tags: newTags })
      }
    }
  }

  const tagInputChanged = (e) => {
    const txtArray = NormarizeText(e.target.value).split(' ')

    if (txtArray.length <= 1) {
      // 通常の入力。
      // nothing to do.
    } else if (txtArray.length == 2) {
      // スペース(区切り文字)が入力された場合に相当
      if (txtArray[0]) {
        if (!tagState.tags.includes(txtArray[0])) {
          const newTags = [...tagState.tags, txtArray[0]]
          setStateFunc(newTags)
          setTagState({ ...tagState, tags: newTags })
          e.target.value = txtArray[1]
        } else {
          e.target.value = txtArray[0]
        }
      } else {
        e.target.value = ''
      }
    } else {
      // txtArray.length > 2 の場合。クリップボードから貼られたと想定
      var accepted = []
      var rejected = []
      for (let i = 0; i < txtArray.length - 1; i++) {
        if (txtArray[i]) {
          if (!tagState.tags.includes(txtArray[i]) && !accepted.includes(txtArray[i])) {
            accepted.push(txtArray[i])
          } else {
            rejected.push(txtArray[i])
          }
        }
      }
      if (accepted.length > 0) {
        const newTags = tagState.tags.concat(accepted)
        setStateFunc(newTags)
        setTagState({ ...tagState, tags: newTags })
      }
      e.target.value = ''
    }
  }

  const tagInputBlured = (e) => {
    const txtArray = NormarizeText(e.target.value).split(' ')
    if (txtArray.length > 0) {
      if (txtArray[0]) {
        if (!tagState.tags.includes(txtArray[0])) {
          const newTags = [...tagState.tags, txtArray[0]]
          setStateFunc(newTags)
          setTagState({ ...tagState, tags: newTags })
          e.target.value = ''
        }
      } else {
        e.target.value = ''
      }
    }
  }

  const deleteTag = (e) => {
    if (e.target.dataset.key) {
      const newTags = tagState.tags.filter((x) => x !== e.target.dataset.key)
      setStateFunc(newTags)
      setTagState({ ...tagState, tags: newTags })
    }
  }

  const BadgeComponent = (tag) => {
    return (
      <div key={tag} className="my-0.5 mx-1 inline-block rounded-xl border bg-blue-200 py-0.5 pl-3 pr-2">
        <span>{tag}</span>
        <span data-key={tag} className="ml-2 px-0.5 hover:cursor-pointer" onClick={deleteTag}>
          ×
        </span>
      </div>
    )
  }

  return (
    <>
      <div
        className="mb-1 inline-table h-10 w-full items-center border border-gray-300 px-2 shadow-sm focus-within:border-transparent focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500"
        onClick={areaClicked}
      >
        {tagState.tags.map((tag) => BadgeComponent(tag))}
        <input
          type="text"
          className="h-full border-none placeholder-gray-400 focus:outline-none"
          placeholder="タグ..."
          onKeyDown={tagInputKeyDown}
          onChange={tagInputChanged}
          onBlur={tagInputBlured}
        />
      </div>
    </>
  )
}
