'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid'
import clsx from 'clsx'
import { ComponentProps, createContext, ReactNode, useCallback, useContext, useEffect, useId, useState } from 'react'

const CarouselContext = createContext({
  count: 0,
  selection: 0,
  setSelection: (value: number) => {},
  registerItem: (id: string) => {},
  unregisterItem: (id: string) => {}
})

export function Carousel({ children }: { children?: ReactNode }) {
  const [selection, setSelection] = useState(0)
  const [items, setItems] = useState<string[]>([])
  const registerItem = useCallback(
    (id: string) => {
      setItems((prev) => (prev.includes(id) ? prev : [...prev, id]))
    },
    [setItems]
  )
  const unregisterItem = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((registeredId) => registeredId != id))
    },
    [setItems]
  )
  return (
    <CarouselContext.Provider value={{ count: items.length, selection, setSelection, registerItem, unregisterItem }}>
      {children}
    </CarouselContext.Provider>
  )
}

export function CarouselItems({ className, children, ...props }: ComponentProps<'div'>) {
  const { selection } = useContext(CarouselContext)
  return (
    <div
      className={clsx(
        '[--carousel-item-max-width:calc(var(--container-width)-2*var(--container-padding))] [--carousel-spacing:--spacing(6)]',
        '[--carousel-item-width:calc(0.8*var(--carousel-item-max-width))]',
        'sm:[--carousel-item-width:var(--carousel-item-max-width)]',
        'md:[--carousel-item-width:calc(0.5*(var(--carousel-item-max-width)-var(--carousel-spacing))))]',
        'h-[calc(0.75*var(--carousel-item-width))]',
        className
      )}
      {...props}
    >
      <div
        className="absolute transition-transform"
        style={{ translate: `calc(${-selection} * (var(--carousel-item-width) + var(--carousel-spacing)))` }}
      >
        <div className="flex gap-x-(--carousel-spacing)">{children}</div>
      </div>
    </div>
  )
}

export function CarouselItem({ href, className, ...props }: ComponentProps<'a'>) {
  const { registerItem, unregisterItem } = useContext(CarouselContext)
  const id = useId()
  useEffect(() => {
    registerItem(id)
    return () => {
      unregisterItem(id)
    }
  }, [id, registerItem, unregisterItem])
  return (
    <a
      href={href ?? '#'}
      className={clsx(
        'relative bg-stone-800 p-3 w-(--carousel-item-width) aspect-4/3 overflow-hidden rounded-lg hover:scale-[105%] shadow-stone-950/10 hover:shadow-xl transition-all',
        className
      )}
      {...props}
    />
  )
}

export function CarouselItemHeadline({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={clsx(
        'absolute bottom-0 left-0 right-0 px-3 pb-3 pt-12 bg-linear-to-t gradient from-stone-800 to-stone-800/0 text-white',
        className
      )}
      {...props}
    >
      <span className="text-xl">{children}</span>
    </div>
  )
}

export function CarouselItemContent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={clsx('absolute inset-0', className)} {...props} />
}

function CarouselButton({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      className={clsx(
        'flex items-center justify-center size-8 bg-stone-100 rounded-full hover:scale-[110%] disabled:opacity-50 disabled:hover:scale-100',
        className
      )}
      {...props}
    />
  )
}

export function CarouselNextButton({ className, ...props }: Omit<ComponentProps<'button'>, 'children'>) {
  const { count, selection, setSelection } = useContext(CarouselContext)
  const enabled = selection < count - 1
  return (
    <CarouselButton
      aria-label="Next"
      disabled={!enabled}
      {...props}
      onClick={() => {
        if (enabled) {
          setSelection(selection + 1)
        }
      }}
    >
      <ChevronRightIcon className="size-6" />
    </CarouselButton>
  )
}

export function CarouselPreviousButton({ className, ...props }: Omit<ComponentProps<'button'>, 'children'>) {
  const { selection, setSelection } = useContext(CarouselContext)
  const enabled = selection > 0
  return (
    <CarouselButton
      aria-label="Previous"
      disabled={!enabled}
      {...props}
      onClick={() => {
        if (enabled) {
          setSelection(selection - 1)
        }
      }}
    >
      <ChevronLeftIcon className="size-6" />
    </CarouselButton>
  )
}
