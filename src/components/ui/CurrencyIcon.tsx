import { useDisplayCurrency } from '@/contexts/DisplayCurrencyContext'
import { cn } from '@/utils/cn'
import { useState, useMemo } from 'react'

type CurrencyIconProps = {
  currency: string
  className?: string
  fallbackSrc?: string
}

export const CurrencyIcon = ({ currency, className, fallbackSrc }: CurrencyIconProps) => {
  const { groupedCurrencies } = useDisplayCurrency()
  const [imageLoaded, setImageLoaded] = useState(false)

  // 从所有货币中查找指定货币
  const currencyInfo = groupedCurrencies.all.find(c => c.currency === currency)
  
  // 缓存图标URL计算
  const getIconSrc = useMemo(() => {
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
    // if (currencyInfo?.currency_type) {
    //   switch (currencyInfo.currency_type) {
    //     case 'FIAT':
    //       return `/icons/currency/${currency.toLowerCase()}.svg`
    //     case 'CRYPTO':
    //       return `/icons/currency/${currency.toLowerCase()}.svg`
    //     case 'REWARDS':
    //       return `/icons/currency/${currency.toLowerCase()}.svg`
    //   }
    // }

    // 使用传入的fallback或默认图标
    return `/icons/currency/${currency.toLowerCase()}.png` || fallbackSrc
  }, [currencyInfo, fallbackSrc, currency])

  return (
    <div className="relative">
      {/* 加载中的skeleton */}
      {!imageLoaded && (
        <div className={cn("skeleton bg-base-300 w-4 h-4 rounded-full absolute inset-0", className)} />
      )}
      
      {/* 实际图片 */}
      <img
        src={getIconSrc}
        alt={currency}
        className={cn('w-4 h-4', className, {
          'opacity-0': !imageLoaded,
          'opacity-100': imageLoaded,
          'transition-opacity duration-200': true
        })}
        onLoad={() => setImageLoaded(true)}
      />
    </div>
  )
}
