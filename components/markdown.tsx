import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import { Schema } from 'hast-util-sanitize'

export const Markdown = ({ children }) => {
  const mySchema: Schema = { ...defaultSchema }
  return (
    <ReactMarkdown remarkPlugins={[gfm]} rehypePlugins={[rehypeRaw, [rehypeSanitize, mySchema]]}>
      {children}
    </ReactMarkdown>
  )
}
