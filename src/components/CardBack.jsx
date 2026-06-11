export default function CardBack() {
  return (
    <div
      className="relative overflow-hidden flex-shrink-0"
      style={{ width: 160, height: 224, borderRadius: 10, border: '2.5px solid #C8A800' }}
    >
      {/* Top half — red */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: '50%', background: 'linear-gradient(135deg, #EE2222 0%, #AA1111 100%)' }}
      />
      {/* Bottom half — white */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: '50%', background: 'linear-gradient(135deg, #EEEEEE 0%, #CCCCCC 100%)' }}
      />
      {/* Centre band */}
      <div
        className="absolute left-0 right-0"
        style={{ top: 'calc(50% - 9px)', height: 18, background: '#111', zIndex: 2 }}
      />
      {/* Pokéball button */}
      <div
        className="absolute z-10 flex items-center justify-center"
        style={{
          width: 38,
          height: 38,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: '4px solid #111',
          background: '#FFFFFF',
          boxShadow: '0 0 0 2px #444',
        }}
      >
        <div
          style={{ width: 14, height: 14, borderRadius: '50%', background: '#DDDDDD', border: '2.5px solid #999' }}
        />
      </div>
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.18) 100%)', borderRadius: 8 }}
      />
    </div>
  )
}
