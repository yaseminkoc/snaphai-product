import clsx from 'clsx'

interface AvatarProps {
  initials: string
  size?: number
  tone?: 'navy' | 'gold' | 'soft'
  className?: string
}

const tones: Record<NonNullable<AvatarProps['tone']>, string> = {
  navy: 'bg-navy-700 text-white',
  gold: 'bg-gold-grad text-navy-900',
  soft: 'bg-navy-700/10 text-navy-700',
}

export function Avatar({ initials, size = 40, tone = 'soft', className }: AvatarProps) {
  return (
    <span
      className={clsx(
        'inline-flex flex-none items-center justify-center rounded-full font-bold',
        tones[tone],
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  )
}
