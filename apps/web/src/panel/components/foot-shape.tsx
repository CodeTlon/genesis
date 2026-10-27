/** Silueta decorativa de pie (login). Es la misma forma que usa el mapa de pies. */
export function FootShape({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 10 200 410" className={className} fill="none">
      <defs><linearGradient id="fs-g" x1="0" y1="0" x2="0.5" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity=".12" /></linearGradient></defs>
      <path d="M46 120 C34 154 38 196 56 236 C68 264 70 292 64 320 C58 362 74 404 112 408 C148 410 168 380 164 336 C162 300 176 264 184 214 C191 176 192 140 184 118 C152 92 94 90 46 120 Z" fill="url(#fs-g)" stroke="#fff" strokeOpacity=".7" strokeWidth={2.5} strokeLinejoin="round" />
      {[[52, 58, 26, -8], [96, 62, 18, -3], [128, 72, 16, 1], [153, 85, 15, 6], [174, 100, 14, 12]].map(([cx, cy, r, a]) => (
        <ellipse key={cx} cx={cx} cy={cy} rx={r * 0.94} ry={r * 1.08} transform={`rotate(${a} ${cx} ${cy})`} fill="url(#fs-g)" stroke="#fff" strokeOpacity=".7" strokeWidth={2.5} />
      ))}
    </svg>
  )
}
