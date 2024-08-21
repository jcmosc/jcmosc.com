import { getAllPosts } from '@/cms'
import { PostList } from '@/components/post-list'
import { Container, Section, SectionHeader } from '@/components/ui/section'
import { Heading, Subheading, TextLink } from '@/components/ui/type'
import { ArrowRightIcon } from '@heroicons/react/16/solid'

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
          <div className="text-lg md:text-xl leading-relaxed">
            <p>I&apos;m currently building full-stack applications in the Next.js ecosystem.</p>
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <SectionHeader>
            <Subheading>Recent articles</Subheading>
          </SectionHeader>
          <PostList posts={posts.slice(0, 3)} />
          {posts.length > 3 && (
            <TextLink href="/blog" className="group flex items-center gap-2 text-lg md:text-xl">
              See all posts
              <ArrowRightIcon className="shrink-0 size-5 group-hover:translate-x-1 transition-transform" />
            </TextLink>
          )}
        </Container>
      </Section>
      <Section>
        <Container>
          <SectionHeader className="py-8">
            <Subheading>My links</Subheading>
          </SectionHeader>
          <p className="text-lg md:text-xl leading-relaxed space-y-4">
            You can find my public profiles on the web here:
          </p>
          <ul className="py-8 flex flex-col gap-4 text-lg md:text-xl">
            <li>
              <TextLink href="https://github.com/jcmosc">GitHub</TextLink>
            </li>
            <li>
              <TextLink href="https://www.linkedin.com/in/james-moschou">LinkedIn</TextLink>
            </li>
            <li>
              <TextLink href="https://x.com/jcmosc">X</TextLink>
            </li>
          </ul>
        </Container>
      </Section>
    </main>
  )
}
