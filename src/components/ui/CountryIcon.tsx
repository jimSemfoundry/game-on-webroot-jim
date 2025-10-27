import { cn } from '@/utils/cn'

type CountryIconProps = {
  code: string | null
  className?: string
}

export const CountryIcon = ({ code, className }: CountryIconProps) => {
  if (!code) return null

  return <img src={`/icons/flags/country/${code?.toLowerCase()}.svg`} className={cn('w-4 h-4', className)} />
}
