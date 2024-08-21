import { invariant } from '@/util/invariant'
import frontmatter from 'front-matter'
import { readFileSync } from 'fs'
import { glob } from 'glob'
import { basename, join } from 'path'

export type Post = {
  attributes: {
    slug: string
    title: string
    description: string
    date: Date
  }
  content: string
}

type Options = {
  directory?: string
}

const defaultDirectory = join(process.cwd(), 'src/content/posts')

export async function getAllPostSlugs(options?: Options): Promise<string[]> {
  const directory = options?.directory ?? defaultDirectory

  const paths = await glob('**/*.md', { cwd: directory })
  return paths.map((path) => basename(path, '.md'))
}

export async function getAllPosts(options?: Options): Promise<Pick<Post, 'attributes'>[]> {
  const directory = options?.directory ?? defaultDirectory

  const posts: Pick<Post, 'attributes'>[] = []

  const paths = await glob('**/*.md', { cwd: directory })
  for (const path of paths) {
    const slug = basename(path, '.md')

    const post = await getPostBySlug(slug)
    posts.push(post)
  }

  posts.sort((a, b) => b.attributes.date.getTime() - a.attributes.date.getTime())

  return posts
}

export async function getPostBySlug(slug: string, options?: Options): Promise<Post> {
  const directory = options?.directory ?? defaultDirectory
  const path = join(directory, `${slug}.md`)

  const text = readFileSync(path, { encoding: 'utf8' })
  const { attributes, body } = frontmatter<Post['attributes']>(text)

  invariant(attributes.date, `Missing date in post ${slug}`)

  const title = attributes.title
  const description = attributes.description
  const date = new Date(attributes.date)

  return {
    attributes: {
      slug,
      title,
      description,
      date
    },
    content: body
  }
}
