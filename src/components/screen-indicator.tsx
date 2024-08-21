export function ScreenIndicator() {
  if (process.env.NODE_ENV === 'production') {
    return null
  }
  return (
    <div className="absolute bottom-2 right-2 rounded-full bg-stone-950 size-6 text-white dark:bg-white dark:text-stone-950 justify-center items-center flex text-xs">
      <span className="hidden max-sm:inline">∅</span>
      <span className="hidden sm:max-md:inline">sm</span>
      <span className="hidden md:max-lg:inline">md</span>
      <span className="hidden lg:max-xl:inline">lg</span>
      <span className="hidden xl:max-2xl:inline">xl</span>
      <span className="hidden 2xl:inline">2xl</span>
    </div>
  )
}
