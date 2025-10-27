import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Iconify from '../iconify'
import { Modal } from '../ui/Modal'
import { cn } from '@/utils/themeMerger'
import { Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { AUTH_QUERY_KEYS } from '@/hooks/api/useAuth'
import { useDisplayCurrency } from '@/contexts/DisplayCurrencyContext'
import { CurrencyIcon } from '../ui/CurrencyIcon'
import { useMediaQuery } from '@/hooks/useMediaQuery'

type GameCurrencySelectModalProps = {
  isOpen: boolean
  onClose: () => void
}

export const GameCurrencySelectModal = ({ isOpen, onClose }: GameCurrencySelectModalProps) => {
  const { t } = useTranslation(['common', 'wallet'])
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  // 使用真实的货币数据
  const { groupedCurrencies, isLoading: currencyLoading, selectedCurrency, setSelectedCurrency } = useDisplayCurrency()

  // 只显示FIAT类型的货币用于游戏货币选择
  const fiatCurrencies = groupedCurrencies.fiat || []

  // 过滤货币列表
  const filteredCurrencies = fiatCurrencies.filter(
    currency =>
      currency.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currency.currency.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 处理货币选择
  const handleCurrencySelect = async (currencyCode: string) => {
    if (isUpdating) return

    // 获取当前选中的货币（优先用户设置，其次CurrencyContext选择）
    const currentCurrency = user?.currency_fiat || selectedCurrency

    // 如果选择的是当前货币，直接关闭
    if (currentCurrency === currencyCode) {
      onClose()
      return
    }

    try {
      setIsUpdating(true)

      // 无论是否登录，都先更新CurrencyContext中的选中货币
      setSelectedCurrency(currencyCode)

      // 如果用户已登录，同时更新后端
      if (user) {
        try {
          // 调用后端接口更新货币设置
          const response = await authService.updateUserDisplayFiat(currencyCode)
          console.log('Update currency response:', response)

          // 检查响应状态
          if (response.code !== 0) {
            throw new Error(response.msg || 'Failed to update currency')
          }

          // 刷新用户数据以获取最新的货币设置
          await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser })
          // 同时刷新余额数据，因为余额显示可能依赖货币设置
          await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.userBalance })

          toast.success(t('wallet:currencyUpdated'))
        } catch (error) {
          console.error('Failed to update currency on server:', error)
          toast.error(t('wallet:updateCurrencyFailed'))
          // 如果后端更新失败，不回滚本地状态，因为用户可能只想本地切换
        }
      } else {
        // 未登录用户只更新本地状态
        toast.success(t('wallet:currencyUpdated'))
      }

      // 关闭模态框
      onClose()
    } catch (error) {
      console.error('Failed to update currency:', error)
      toast.error(t('wallet:updateCurrencyFailed'))
    } finally {
      setIsUpdating(false)
    }
  }

  const headerContent = (
    <div className="flex items-center gap-x-2 h-8">
      <Iconify icon="custom:wallet" width={20} height={20} className="text-primary" />
      <p className="text-base md:text-xl font-semibold">{t('menu:gameCurrency')}</p>
    </div>
  )

  return (
    <Modal position={isMobile ? 'modal-bottom' : 'modal-middle'} isOpen={isOpen} onClose={onClose} title={headerContent} className="bg-base-400 md:w-[420px] max-w-sm mx-auto overflow-hidden">
      <div className="flex flex-col max-h-[60vh]">
        {/* 固定区域 - 描述和搜索框 */}
        <div className="flex-shrink-0 pb-4">
          <p className="text-xs sm:text-sm text-base-content/50">
            {t('finance:realTimeConversionWillApplyIfYourGameAndSettlementCurrenciesDiffer')}
          </p>
          <div className="relative mt-4">
            <label className="input bg-base-300 input-ghost focus-within:bg-base-300 focus-within:!outline-none focus:!outline-none w-full rounded-field">
              <Search className="text-base-content/50 w-4 h-4 md:w-5 md:h-5" />
              <input
                type="search"
                placeholder={t('common:common.search')}
                className="input w-full focus-within:!outline-none focus:!outline-none text-sm md:text-base font-semibold px-0"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* 可滚动区域 - 只有这个区域会滚动 */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {currencyLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="loading loading-spinner loading-md"></div>
            </div>
          ) : (
            <ul className="menu menu-md bg-base-300 h-full w-full rounded-field overflow-y-auto max-h-[400px] flex-col flex-nowrap gap-1">
              {filteredCurrencies.map(currency => {
                // 获取当前选中的货币（优先用户设置，其次CurrencyContext选择）
                const currentCurrency = user?.currency_fiat || selectedCurrency
                const isSelected = currentCurrency === currency.currency

                return (
                  <li key={currency.currency}>
                    <a
                      className={cn(
                        'text-sm md:text-base font-semibold flex items-center gap-x-3 h-10 sm:h-12 cursor-pointer',
                        isSelected ? 'text-primary bg-primary/10' : 'text-base-content/50',
                        isUpdating && 'opacity-50 cursor-not-allowed',
                      )}
                      onClick={() => !isUpdating && handleCurrencySelect(currency.currency)}
                    >
                      <CurrencyIcon currency={currency.currency} className="w-4 h-4 sm:w-5 sm:h-5" />
                      {currency.display_name}
                      {isSelected && (
                        <span className="ml-auto text-primary">
                          <Iconify icon="custom:check" className="w-4 h-4" />
                        </span>
                      )}
                    </a>
                  </li>
                )
              })}
              {filteredCurrencies.length === 0 && !currencyLoading && (
                <li>
                  <div className="text-center text-base-content/50 py-8">{t('common:noResultsFound')}</div>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  )
}
