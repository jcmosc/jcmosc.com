import { getAllPosts } from '@/cms'
import { PostList } from '@/components/post-list'
import { Container, Section, SectionHeader } from '@/components/ui/section'
import { Heading } from '@/components/ui/type'

export default async function AllPostsPage() {
  const posts = await getAllPosts()
  return (
    <main>
      <Section>
        <Container>
          <SectionHeader>
            <Heading>All posts</Heading>
          </SectionHeader>
          <PostList posts={posts} />
        </Container>
      </Section>
    </main>
  )
}
