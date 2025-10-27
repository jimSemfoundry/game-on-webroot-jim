import { useDisplayCurrency } from '@/contexts/DisplayCurrencyContext'
import { cn } from '@/utils/cn'

type CurrencyIconProps = {
  currency: string
  className?: string
  fallbackSrc?: string
}

export const CurrencyIcon = ({ currency, className, fallbackSrc }: CurrencyIconProps) => {
  const { groupedCurrencies } = useDisplayCurrency()

  // 从所有货币中查找指定货币
  const currencyInfo = groupedCurrencies.all.find(c => c.currency === currency)
  // 获取图标URL
  const getIconSrc = () => {
    // 优先使用接口返回的icon字段
    if (currencyInfo?.icon) {
      // 如果icon是完整的URL，直接使用
      if (currencyInfo.icon.startsWith('http')) {
        return currencyInfo.icon
      }
      // 否则拼接VITE_IMAGE_URL
      const baseUrl = import.meta.env.VITE_IMAGE_URL || ''
      return `${baseUrl}${currencyInfo.icon}`
    }

    // 根据货币类型提供fallback图标
    if (currencyInfo?.currency_type) {
      switch (currencyInfo.currency_type) {
        case 'FIAT':
          return `/icons/flags/fiat/${currency.toLowerCase()}.svg`
        case 'CRYPTO':
          return `/icons/crypto/${currency.toLowerCase()}.svg`
        case 'REWARDS':
          return `/icons/rewards/${currency.toLowerCase()}.svg`
      }
    }

    // 使用传入的fallback或默认图标
    return fallbackSrc || `/icons/currency/default.svg`
  }

  return (
    <img
      src={getIconSrc()}
      alt={currency}
      className={cn('w-4 h-4', className)}
    />
  )
}
