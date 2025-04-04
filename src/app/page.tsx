import { getAllPosts } from '@/cms'
import { CriteriaPlaygroundCard } from '@/components/criteria-playground-card'
import { PageTitlePageContainer } from '@/components/page-title-visibility'
import { PostList } from '@/components/post-list'
import { SequenceCard } from '@/components/sequence-card'
import {
  Carousel,
  CarouselItem,
  CarouselItemContent,
  CarouselItemHeadline,
  CarouselItems,
  CarouselNextButton,
  CarouselPreviousButton
} from '@/components/ui/carousel'
import { Container, Section, SectionHeader } from '@/components/ui/section'
import { Heading, Subheading, TextLink } from '@/components/ui/type'
import { ArrowRightIcon } from '@heroicons/react/16/solid'

export default async function Home() {
  const posts = await getAllPosts()
  return (
    <main>
      <Section>
        <PageTitlePageContainer>
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
        </PageTitlePageContainer>
      </Section>
      <Section>
        <Container>
          <Carousel>
            <SectionHeader className="flex justify-between items-center">
              <Subheading>Projects</Subheading>
              <div className="flex gap-x-3">
                <CarouselPreviousButton />
                <CarouselNextButton />
              </div>
            </SectionHeader>
            <CarouselItems>
              <CarouselItem href="https://playsequence.xyz" className="bg-stone-800 shadow-stone-800/10">
                <CarouselItemContent>
                  <SequenceCard />
                </CarouselItemContent>
                <CarouselItemHeadline className="gradient from-stone-800 to-stone-800/0">Sequence</CarouselItemHeadline>
              </CarouselItem>
              <CarouselItem href="https://criteria.sh/play" className="bg-indigo-500 shadow-indigo-500/10">
                <CarouselItemContent>
                  <CriteriaPlaygroundCard />
                </CarouselItemContent>
                <CarouselItemHeadline className="gradient from-indigo-500 to-indigo-500/0">
                  Criteria Playground
                </CarouselItemHeadline>
              </CarouselItem>
            </CarouselItems>
          </Carousel>
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
