import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

const TextParser = ({ children, slice = 0 }) => {
  const file = unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeStringify).processSync(children)
  const str = String(file)
  const html = str.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '')

  if (slice == 0) return <span>{html}</span>
  return <span>{html.slice(0, slice)}</span>
}

export default TextParser
