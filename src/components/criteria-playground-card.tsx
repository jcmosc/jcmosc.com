import Image from 'next/image'
import docsImage from '../content/projects/criteria-playground/criteria-playground-docs.png'
import editorImage from '../content/projects/criteria-playground/criteria-playground-editor.png'
import issuesImage from '../content/projects/criteria-playground/criteria-playground-issues.png'

const imageProps = [
  { src: editorImage, alt: 'Criteria Playground: editor view' },
  { src: docsImage, alt: 'Criteria Playground: documentation view' },
  { src: issuesImage, alt: 'Criteria Playground: issues view' }
]

export function CriteriaPlaygroundCard() {
  return (
    <div className="relative group overflow-clip w-full h-full ">
      <div className="absolute w-full grid grid-cols-1 gap-1 transform-3d translate-x-1/5 -translate-y-1/10 rotate-x-[34deg] rotate-y-[9deg] -rotate-z-[26deg]">
        <div className="flex flex-col gap-1 -translate-y-[20%] transition-transform group-hover:-translate-y-[30%] ">
          <div className="w-full aspect-[8/5] rounded-lg overflow-hidden">
            <Image {...imageProps[0]} className="object-center" />
          </div>
          <div className="w-full aspect-[8/5] rounded-lg overflow-hidden">
            <Image {...imageProps[1]} className="object-center" />
          </div>
          <div className="w-full aspect-[8/5] rounded-lg overflow-hidden">
            <Image {...imageProps[2]} className="object-center" />
          </div>
        </div>
      </div>
    </div>
  )
}
