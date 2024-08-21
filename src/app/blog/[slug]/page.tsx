import { getAllPostSlugs, getPostBySlug } from '@/cms'
import { Markdown } from '@/components/ui/markdown'
import { Container, Section } from '@/components/ui/section'
import { Time } from '@/components/ui/time'
import { Metadata } from 'next'

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs()
  return slugs.map((slug) => ({
    slug
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  return {
    title: post.attributes.title,
    description: post.attributes.description,
    twitter: {
      card: 'summary_large_image',
      site: '@jcmosc',
      creator: '@jcmosc',
      title: `${post.attributes.title} | James Moschou`,
      description: post.attributes.description
    },
    openGraph: {
      url: `${process.env.WEBSITE_ROOT}/blog/${params.slug}`,
      type: 'article',
      title: `${post.attributes.title} | James Moschou`,
      description: post.attributes.description
    }
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)

  return (
    <main>
      <Section>
        <Container className="md:max-w-2xl">
          <aside>
            <span className="text-sm md:text-base">
              Published on <Time date={post.attributes.date} />
            </span>
          </aside>
          <article className="prose md:prose-lg prose-stone">
            <Markdown>{post.content}</Markdown>
          </article>
        </Container>
      </Section>
    </main>
  )
}
