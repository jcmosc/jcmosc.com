'use client'

import { ClipboardIcon } from '@heroicons/react/16/solid'
import clsx from 'clsx'
import { ComponentProps, ReactNode, useEffect, useState } from 'react'
import { Language, languages, useHighlighter } from './useHighlighter'

export type HighlightedCodeProps = {
  language: Language
  children: string
  prominent?: boolean
}

export function HighlightedCode({
  language,
  children,
  className,
  prominent,
  ...props
}: HighlightedCodeProps & Omit<ComponentProps<'code'>, 'children' | 'dangerouslySetInnerHTML'>) {
  const highlighter = useHighlighter()
  if (highlighter) {
    const html = highlighter.codeToHtml(children, {
      lang: language,
      themes: {
        light: 'catppuccin-latte',
        dark: 'catppuccin-mocha'
      },
      defaultColor: false,
      transformers: [
        {
          root(node) {
            if (
              node.children.length === 1 &&
              node.children[0].type === 'element' &&
              node.children[0].tagName === 'pre'
            ) {
              const preNode = node.children[0]
              if (
                preNode.children.length === 1 &&
                preNode.children[0].type === 'element' &&
                preNode.children[0].tagName === 'code'
              ) {
                const codeNode = preNode.children[0]
                node.children = codeNode.children
              }
            }
          }
        }
      ]
    })
    return (
      <code
        className={clsx(className, 'shiki', prominent ? 'prominent bg-stone-900' : 'bg-stone-50 dark:bg-stone-900')}
        {...props}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  } else {
    return (
      <code
        className={clsx(className, prominent ? 'prominent bg-stone-900' : 'bg-stone-50 dark:bg-stone-900')}
        {...props}
      >
        {children}
      </code>
    )
  }
}

export type PlainCodeProps = {
  language?: never
  children?: ReactNode
}

export type CodeProps = HighlightedCodeProps | PlainCodeProps

export function Code({ ...props }: CodeProps & Omit<ComponentProps<'code'>, 'children'>) {
  if ('language' in props && props.language && languages.includes(props.language)) {
    return (
      <HighlightedCode language={props.language} prominent={props.prominent}>
        {props.children}
      </HighlightedCode>
    )
  } else {
    return <code {...props} />
  }
}

function CopyButton({ code }: { code: string }) {
  let [copyCount, setCopyCount] = useState(0)
  let copied = copyCount > 0

  useEffect(() => {
    if (copyCount > 0) {
      let timeout = setTimeout(() => setCopyCount(0), 1000)
      return () => {
        clearTimeout(timeout)
      }
    }
  }, [copyCount])

  return (
    <button
      type="button"
      className={clsx(
        'group/button absolute right-1.5 top-2 overflow-hidden rounded-full py-1 pl-2 pr-3 text-xs font-medium opacity-0 backdrop-blur transition focus:opacity-100 group-hover:opacity-100',
        copied
          ? 'bg-orange-400/10 ring-1 ring-inset ring-orange-400/20'
          : 'hover:bg-white/7.5 dark:bg-white/2.5 bg-white/5 dark:hover:bg-white/5'
      )}
      onClick={() => {
        window.navigator.clipboard.writeText(code).then(() => {
          setCopyCount((count) => count + 1)
        })
      }}
    >
      <span
        aria-hidden={copied}
        className={clsx(
          'pointer-events-none flex items-center gap-1.5 text-stone-400 transition duration-300',
          copied && '-translate-y-1.5 opacity-0'
        )}
      >
        <ClipboardIcon className="h-3 w-3 fill-stone-500/20 stroke-stone-500 transition-colors group-hover/button:stroke-stone-400" />
        Copy
      </span>
      <span
        aria-hidden={!copied}
        className={clsx(
          'pointer-events-none absolute inset-0 flex items-center justify-center text-orange-400 transition duration-300',
          !copied && 'translate-y-1.5 opacity-0'
        )}
      >
        Copied!
      </span>
    </button>
  )
}

export function CodeListing({
  className,
  code,
  language,
  prominent,
  ...props
}: ({ title: string; header?: never } | { title?: never; header?: ReactNode }) & {
  className?: string
  code: string
  language?: Language
  prominent?: boolean
}) {
  const header =
    'header' in props && props.header ? (
      props.header
    ) : props.title ? (
      <h3
        className={clsx([
          'flex items-center px-3 py-2 text-xs uppercase',
          prominent ? 'text-white' : 'text-stone-950 dark:text-white'
        ])}
      >
        {props.title}
      </h3>
    ) : null
  return (
    <div
      className={clsx(
        className,
        'not-prose group overflow-hidden rounded-lg border border-stone-950/10 dark:border-white/10',
        prominent ? 'bg-stone-700' : 'bg-stone-50 dark:bg-stone-900'
      )}
    >
      {header && <div className={clsx(prominent ? 'bg-stone-600' : 'bg-stone-200 dark:bg-stone-800')}>{header}</div>}
      <div className="relative">
        <pre className="overflow-x-auto p-3 text-xs leading-5">
          {language && (
            <Code language={language} prominent={prominent}>
              {code}
            </Code>
          )}
          {!language && <Code prominent={prominent}>{code}</Code>}
        </pre>
        <CopyButton code={code} />
      </div>
    </div>
  )
}
