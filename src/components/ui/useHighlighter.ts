import { useEffect, useSyncExternalStore } from 'react'
import { Highlighter } from 'shiki'

export const languages = [
  'bash',
  'c',
  'c#',
  'c++',
  'clojure',
  'console',
  'cpp',
  'cs',
  'csharp',
  'css',
  'csv',
  'diff',
  'docker',
  'dockerfile',
  'go',
  'gql',
  'graphql',
  'html',
  'http',
  'java',
  'javascript',
  'js',
  'json',
  'jsx',
  'kotlin',
  'markdown',
  'md',
  'mdx',
  'mermaid',
  'objc',
  'objective-c',
  'perl',
  'perl6',
  'php',
  'proto',
  'py',
  'python',
  'rb',
  'ruby',
  'rust',
  'scala',
  'sh',
  'shell',
  'sql',
  'swift',
  'terraform',
  'ts',
  'tsx',
  'typescript',
  'xml',
  'yaml',
  'yml',
  'zsh'
]

export type Language = (typeof languages)[number]

let sharedHighlighter: Highlighter
let sharedHighlighterListeners = new Set<() => void>()

async function loadHighlighter() {
  const { getSingletonHighlighter } = await import('shiki')
  sharedHighlighter = await getSingletonHighlighter({
    langs: languages,
    themes: ['catppuccin-latte', 'catppuccin-mocha']
  })
  sharedHighlighterListeners.forEach((listener) => listener())
}

export function useHighlighter() {
  const highlighter = useSyncExternalStore(
    (onStoreChange) => {
      sharedHighlighterListeners.add(onStoreChange)
      return () => sharedHighlighterListeners.delete(onStoreChange)
    },
    () => {
      return sharedHighlighter
    },
    () => undefined
  )
  useEffect(() => {
    if (!highlighter) {
      loadHighlighter()
    }
  }, [highlighter])
  return highlighter
}
