export default function Grain() {
  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.04 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="grain-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-noise)" />
      </svg>
    </div>
  )
}
