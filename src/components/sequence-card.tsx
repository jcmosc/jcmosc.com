import Image from 'next/image'
import completeImage from '../content/projects/sequence/sequence-complete.png'
import gameImage from '../content/projects/sequence/sequence-game.png'
import helpImage from '../content/projects/sequence/sequence-help.png'
import resultsImage from '../content/projects/sequence/sequence-results.png'
import titleImage from '../content/projects/sequence/sequence-title.png'

const imageProps = [
  { src: titleImage, alt: 'Sequence: title screen' },
  { src: gameImage, alt: 'Sequence: game screen' },
  { src: completeImage, alt: 'Sequence: game completed screen' },
  { src: helpImage, alt: 'Sequence: help screen' },
  { src: resultsImage, alt: 'Sequence: results screen' }
]

export function SequenceCard() {
  return (
    <div className="relative group overflow-clip w-full h-full ">
      <div className="absolute w-full grid grid-cols-3 gap-1 transform-3d translate-x-1/5 -translate-y-1/10 rotate-x-[34deg] rotate-y-[9deg] -rotate-z-[26deg]">
        <div className="flex flex-col gap-1 translate-y-1/10 transition-transform group-hover:translate-y-0 ">
          <div className="w-full aspect-[3/5] rounded-lg overflow-hidden">
            <Image {...imageProps[0]} className="object-bottom" />
          </div>
          <div className="w-full aspect-[3/5] rounded-lg overflow-hidden">
            <Image {...imageProps[1]} className="object-bottom" />
          </div>
        </div>
        <div className="flex flex-col gap-1 -translate-y-1/10 transition-transform group-hover:-translate-y-1/20">
          <div className="w-full aspect-[3/5] rounded-lg overflow-hidden">
            <Image {...imageProps[2]} className="object-bottom" />
          </div>
          <div className="w-full aspect-[3/5] rounded-lg overflow-hidden">
            <Image {...imageProps[3]} className="object-bottom" />
          </div>
        </div>
        <div className="flex flex-col gap-1 translate-y-2/10 transition-transform group-hover:translate-y-1/10">
          <div className="w-full aspect-[3/5] rounded-lg overflow-hidden">
            <Image {...imageProps[4]} className="object-bottom" />
          </div>
        </div>
      </div>
    </div>
  )
}
