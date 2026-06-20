import { memo } from 'react'

const RAIN_DROPS = Array.from({ length: 32 }, (_, index) => ({
  left: `${(index * 29) % 100}%`,
  top: `${-30 - ((index * 47) % 260)}px`,
  height: `${36 + (index % 5) * 12}px`,
  animationDelay: `${-(index % 11) * 0.23}s`,
  animationDuration: `${1.1 + (index % 4) * 0.17}s`,
}))

const DUST_PARTICLES = Array.from({ length: 14 }, (_, index) => ({
  left: `${12 + ((index * 31) % 78)}%`,
  top: `${18 + ((index * 43) % 62)}%`,
  animationDelay: `${-(index % 7) * 0.8}s`,
  animationDuration: `${5 + (index % 5)}s`,
}))

type LofiRoomSceneProps = {
  isPaused: boolean
}

export const LofiRoomScene = memo(({ isPaused }: LofiRoomSceneProps) => {
  return (
    <div className="scene" aria-hidden="true">
      <div className="room-grain" />
      <div className="room-vignette" />

      <div className="poster-cluster">
        <span className="poster poster-moon">MOON<br />TAPES</span>
        <span className="poster poster-cat">stay<br />cozy</span>
        <span className="wall-sticker">✦</span>
        <span className="wall-sticker second">☾</span>
      </div>

      <div className="bookshelf">
        <span className="shelf-book pink" />
        <span className="shelf-book blue" />
        <span className="shelf-book gold" />
        <span className="shelf-book green" />
        <span className="shelf-radio"><i /></span>
      </div>

      <div className="rain-window">
        <div className="night-sky">
          <span className="moon"><i /></span>
          <span className="cloud cloud-one" />
          <span className="cloud cloud-two" />
          <span className="city-lights" />
        </div>
        <div className="rain-layer">
          {RAIN_DROPS.map((style, index) => <i key={index} style={style} />)}
        </div>
        <span className="window-cross horizontal" />
        <span className="window-cross vertical" />
        <span className="window-sill" />
      </div>

      <div className="dust-layer">
        {DUST_PARTICLES.map((style, index) => <i key={index} style={style} />)}
      </div>

      <span className={`lamp-glow${isPaused ? ' paused' : ''}`} />

      <div className="pendant-lamp">
        <span className="pendant-rope" />
        <div className="pendant-fixture">
          <span className="pendant-cap"><i /><i /></span>
          <span className="pendant-shade pendant-shade-left" />
          <span className="pendant-shade pendant-shade-right" />
          <span className="pendant-rim" />
          <span className="pendant-bulb" />
        </div>
        <span className="pendant-light" />
      </div>

      <div className="desk-scene">
        <div className="desk-items">
          <div className="round-cactus"><span><i /><i /><i /></span><b /></div>
          <div className="keyboard">
            {Array.from({ length: 15 }).map((_, index) => <i key={index} />)}
          </div>
          <div className="desk-cat">
            <div className="desk-cat-head">
              <span className="desk-cat-ear desk-cat-ear-left" />
              <span className="desk-cat-ear desk-cat-ear-right" />
              <span className="desk-cat-eye desk-cat-eye-left" />
              <span className="desk-cat-eye desk-cat-eye-right" />
              <span className="desk-cat-muzzle"><i className="desk-cat-nose" /></span>
            </div>
            <div className="desk-cat-body"><span className="desk-cat-paw" /></div>
            <svg className="desk-cat-tail" viewBox="0 0 72 100" aria-hidden="true">
              <path d="M55 10 C 8 8, 8 87, 55 89" transform="translate(72 0) scale(-1 1)" />
            </svg>
          </div>
          <div className="mug">
            <i className="mug-vapour mug-vapour-left" />
            <i className="mug-vapour mug-vapour-right" />
            <span className="mug-handle" />
            <span className="mug-body" />
            <span className="mug-petal mug-petal-top" />
            <span className="mug-petal mug-petal-bottom" />
          </div>
        </div>
      </div>
    </div>
  )
})

LofiRoomScene.displayName = 'LofiRoomScene'
