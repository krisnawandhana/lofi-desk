declare module 'howler' {
  type HowlOptions = {
    src: string[]
    loop?: boolean
    volume?: number
    format?: string[]
    onloaderror?: () => void
    onend?: () => void
  }

  export class Howl {
    constructor(options: HowlOptions)
    play(): number
    pause(): this
    stop(): this
    unload(): void
    volume(value: number): this
    mute(value: boolean): this
    fade(from: number, to: number, duration: number): this
  }
}
