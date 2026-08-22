/** "Yazıyor…" göstergesi — AI yanıt hazırlarken sohbette solda belirir. */
export function TypingBubble() {
  return (
    <div className="flex w-full justify-start animate-fade-up">
      <div className="rounded-2xl rounded-bl-md border border-line bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-navy-700/50 animate-typing"
              style={{ animationDelay: `${i * 160}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
