import type { Element } from 'hast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CodeListing } from './code'
import { Heading, Subheading, TextLink } from './type'
import { Language } from './useHighlighter'

function textContent(node: Element): string {
  return node.children
    .map((child) => (child.type === 'text' ? child.value : child.type == 'element' ? textContent(child) : ''))
    .join('')
}

export function Markdown({ children }: { children?: string | null | undefined }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...rest }) => <Heading {...rest} />,
        h2: ({ node, ...rest }) => <Subheading {...rest} />,
        a: ({ node, href, ...rest }) => <TextLink href={href ?? '#'} {...rest} />,
        pre: ({ node, ...rest }) => {
          let language: Language | undefined
          if (
            node?.type === 'element' &&
            node.tagName === 'pre' &&
            node.children.length >= 1 &&
            node.children[0].type === 'element' &&
            node.children[0].tagName === 'code'
          ) {
            const codeNode = node.children[0]

            if (Array.isArray(codeNode.properties.className)) {
              for (const className of codeNode.properties.className) {
                if (typeof className === 'string' && className.startsWith('language-')) {
                  language = className.replace(/^language-/, '') as Language | undefined
                  break
                }
              }
            }
          }

          const code = node ? textContent(node) : ''
          return <CodeListing code={code} language={language} {...rest} className="mt-6" />
        }
      }}
    >
      {children}
    </ReactMarkdown>
  )
}
