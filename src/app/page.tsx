import { getAllPosts } from '@/cms'
import { PostList } from '@/components/post-list'
import { Container, Section, SectionHeader } from '@/components/ui/section'
import { Heading, Subheading } from '@/components/ui/type'
import { ArrowRightIcon } from '@heroicons/react/16/solid'
import Link from 'next/link'

export default async function Home() {
  const posts = await getAllPosts()
  return (
    <main>
      <Section>
        <Container>
          <SectionHeader className="py-8">
            <Heading>
              Hey, I&apos;m <strong>James Moschou</strong>, a digital product generalist.
            </Heading>
          </SectionHeader>
          <div className="text-xl leading-relaxed space-y-4">
            <p>I&apos;m currently building full-stack applications in the Next.js ecosystem.</p>
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <SectionHeader>
            <Subheading>Posts</Subheading>
          </SectionHeader>
          <PostList posts={posts.slice(0, 3)} />
          {posts.length > 3 && (
            <Link href="/blog" className="group flex items-center gap-2 text-stone-700 hover:text-stone-950">
              See all posts
              <ArrowRightIcon className="shrink-0 size-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </Container>
      </Section>
    </main>
  )
}
