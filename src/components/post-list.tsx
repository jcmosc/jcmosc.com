import { Post } from '@/cms'
import { ArrowRightIcon } from '@heroicons/react/16/solid'
import { Time } from './ui/time'

export function PostList({ posts }: { posts: Pick<Post, 'attributes'>[] }) {
  return (
    <ul className="text-lg flex flex-col gap-4 py-8">
      {posts.map((post) => (
        <li key={post.attributes.slug}>
          <a
            href={'/blog/' + post.attributes.slug}
            className="block group hover:bg-stone-100 -mx-2 md:-mx-4 px-2 md:px-4 py-4 rounded-lg"
          >
            <div className="flex flex-col gap-1">
              <div className="text-lg md:text-xl font-medium flex items-center gap-2">
                {post.attributes.title}
                <ArrowRightIcon className="shrink-0 size-5 group-hover:translate-x-1 transition-transform" />
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
