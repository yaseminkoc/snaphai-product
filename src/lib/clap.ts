/* =========================================================
   Alkış (el çırpma) tespiti — tarayıcı Web Audio API'si ile.
   API anahtarı GEREKMEZ. Ani ses yükselişini (transient)
   yakalayarak alkışı algılar. Mikrofon izni reddedilirse
   veya desteklenmezse null döner.
   ========================================================= */

export interface ClapListener {
  stop: () => void
}

export async function startClapListener(
  onClap: () => void,
): Promise<ClapListener | null> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return null
  }

  let stream: MediaStream
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  } catch {
    return null
  }

  const Ctx: typeof AudioContext =
    (window as any).AudioContext || (window as any).webkitAudioContext
  if (!Ctx) {
    stream.getTracks().forEach((t) => t.stop())
    return null
  }

  const ctx = new Ctx()
  const source = ctx.createMediaStreamSource(stream)
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 512
  source.connect(analyser)

  const buf = new Uint8Array(analyser.fftSize)
  let prevPeak = 0
  let lastClap = 0
  let raf = 0

  const tick = () => {
    analyser.getByteTimeDomainData(buf)
    let peak = 0
    for (let i = 0; i < buf.length; i++) {
      const v = Math.abs(buf[i] - 128)
      if (v > peak) peak = v
    }
    const now = performance.now()
    // Alkış: sessizlikten ani ve yüksek bir sıçrama.
    if (peak > 55 && prevPeak < 22 && now - lastClap > 450) {
      lastClap = now
      onClap()
    }
    prevPeak = peak
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)

  return {
    stop: () => {
      cancelAnimationFrame(raf)
      try {
        source.disconnect()
      } catch {
        /* yoksay */
      }
      stream.getTracks().forEach((t) => t.stop())
      ctx.close().catch(() => {})
    },
  }
}
