import { Post } from '@/cms'
import { Time } from './ui/time'

export function PostList({ posts }: { posts: Pick<Post, 'attributes'>[] }) {
  return (
    <ul className="text-lg flex flex-col gap-4 py-8">
      {posts.map((post) => (
        <li key={post.attributes.slug}>
          <a
            href={'/blog/' + post.attributes.slug}
            className="block group hover:bg-stone-100 -mx-2 md:-mx-4 px-2 md:px-4 py-4 rounded-lg dark:hover:bg-white/5"
          >
            <div className="flex flex-col gap-1">
              <div className="text-lg md:text-xl font-medium text-blue-600 group-hover:text-blue-700 dark:text-blue-500 dark:group-hover:text-blue-400">
                {post.attributes.title}
              </div>
              <dl className="text-xs md:text-sm text-stone-500">
                <dt className="sr-only">Published on</dt>
                <dd>
                  <Time date={post.attributes.date} />
                </dd>
              </dl>
            </div>
          </a>
        </li>
      ))}
    </ul>
  )
}
