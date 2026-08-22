/* =========================================================
   Ses katmanı — Tarayıcının Web Speech API'sini kullanır.
   API anahtarı GEREKMEZ. Desteklenmeyen tarayıcıda sessizce
   devre dışı kalır (fallback: sadece metin gösterilir).
   ========================================================= */

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function recognitionSupported(): boolean {
  if (typeof window === 'undefined') return false
  return (
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  )
}

let currentUtterance: SpeechSynthesisUtterance | null = null

interface SpeakOptions {
  rate?: number
  pitch?: number
  onStart?: () => void
  onEnd?: () => void
  onBoundary?: (charIndex: number) => void
}

/** Metni Türkçe sesle okur. Desteklenmiyorsa onEnd hemen çağrılır. */
export function speak(text: string, opts: SpeakOptions = {}): void {
  if (!speechSupported()) {
    opts.onStart?.()
    opts.onEnd?.()
    return
  }
  cancelSpeech()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'tr-TR'
  u.rate = opts.rate ?? 1
  u.pitch = opts.pitch ?? 1

  // Türkçe ses varsa seç
  const voices = window.speechSynthesis.getVoices()
  const tr = voices.find((v) => v.lang?.toLowerCase().startsWith('tr'))
  if (tr) u.voice = tr

  u.onstart = () => opts.onStart?.()
  u.onend = () => {
    currentUtterance = null
    opts.onEnd?.()
  }
  u.onerror = () => {
    currentUtterance = null
    opts.onEnd?.()
  }
  if (opts.onBoundary) {
    u.onboundary = (e) => opts.onBoundary?.(e.charIndex)
  }
  currentUtterance = u
  window.speechSynthesis.speak(u)
}

export function cancelSpeech(): void {
  if (speechSupported()) {
    window.speechSynthesis.cancel()
    currentUtterance = null
  }
}

export function isSpeaking(): boolean {
  return speechSupported() && window.speechSynthesis.speaking
}

/* ---- Konuşma tanıma (STT) ---- */

type RecognitionHandlers = {
  onResult: (transcript: string, isFinal: boolean) => void
  onEnd?: () => void
  onError?: (err: string) => void
}

interface Recognizer {
  stop: () => void
}

/** Mikrofondan Türkçe dinlemeye başlar. Desteklenmiyorsa null döner. */
export function startRecognition(handlers: RecognitionHandlers): Recognizer | null {
  if (!recognitionSupported()) return null
  const Ctor =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  const rec = new Ctor()
  rec.lang = 'tr-TR'
  rec.interimResults = true
  rec.continuous = false

  rec.onresult = (event: any) => {
    let interim = ''
    let final = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const t = event.results[i][0].transcript
      if (event.results[i].isFinal) final += t
      else interim += t
    }
    if (final) handlers.onResult(final, true)
    else if (interim) handlers.onResult(interim, false)
  }
  rec.onerror = (e: any) => handlers.onError?.(e.error ?? 'error')
  rec.onend = () => handlers.onEnd?.()

  try {
    rec.start()
  } catch {
    return null
  }
  return { stop: () => rec.stop() }
}
