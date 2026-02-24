import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import Iconify from '../iconify'
import { Modal } from '../ui/Modal'
import { formatDateTime } from '@/utils/formatDateTime'
import { CurrencyIcon } from '@/components/ui/CurrencyIcon'
import { useDisplayCurrencyFormatter } from '@/contexts/DisplayCurrencyContext'

type BetSlipModalProps = {
  isOpen: boolean
  onClose: () => void
  order: any
}

export const BetSlipModal = ({ isOpen, onClose, order }: BetSlipModalProps) => {
  const { t } = useTranslation('casino')
  const navigate = useNavigate()
  const { formatWithoutConversion, formatWithConversion } = useDisplayCurrencyFormatter()

  if (!order) return null

  const handlePlayClick = () => {
    // Navigate to game detail page with game_provider:inner_game_id format if provider exists
    if (order?.inner_game_id) {
      // If game_provider exists, use format: provider:inner_game_id
      // Otherwise just use inner_game_id
      const gameId = order.game_provider 
        ? `${order.game_provider}:${order.inner_game_id}`
        : order.inner_game_id
      
      void navigate({ to: '/games/$gameId', params: { gameId }, search: {} })

      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="bg-base-400 max-w-[420px]"
      position="modal-middle"
      title={
        <div className="flex items-center gap-4">
          <Iconify icon="custom:bonus" className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
          <span className="text-lg sm:text-xl font-semibold">{t('casino:betSlip')}</span>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 px-6 h-10 sm:h-12">
          <img src={`/images/vip/levels/${order?.vip || 1}.png`} alt={order?.vip || '1'} className="w-10 h-10 sm:w-12 sm:h-12" />
          <div className="flex flex-col justify-between">
            <span className="text-md sm:text-lg font-bold">{order?.nickname ?? 'Anonymous'}</span>
            <p className="text-xs sm:text-sm font-semibold text-base-content/50 flex items-center gap-1">
              <span>{formatDateTime(order?.created_at * 1000)}</span>
              <Iconify icon="custom:shield" className="w-4 h-4 text-primary" />
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1 items-center">
          <p className="text-sm sm:text-md font-semibold">{t('casino:profit')}</p>
          <div className="flex items-center gap-4">
            <CurrencyIcon currency={order?.real_currency} className="w-5 h-5 sm:w-6 sm:h-6" />
            <p className="text-base-content font-bold text-2xl sm:text-4xl">
              {formatWithoutConversion(order?.real_win_amount, order?.real_currency, { compact: false, showCode: false, minimizeDecimals: true }).formatted}
            </p>
          </div>
          <p className="font-semibold sm:text-base text-sm text-base-content/50">
            {formatWithConversion(order?.real_win_amount, order?.real_currency, { compact: false, showCode: false, minimizeDecimals: true }).formatted}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-base-300 rounded-field p-4 flex flex-col">
            <p className="font-semibold text-base-content/50">{t('casino:betAmount')}</p>
            <p className="font-bold sm:text-lg text-base">
              {formatWithoutConversion(order?.real_bet_amount, order?.real_currency, { compact: false, showCode: false, minimizeDecimals: true }).formatted}
            </p>
          </div>

          <div className="bg-base-300 rounded-field p-4 flex flex-col">
            <p className="font-semibold text-base-content/50">X</p>
            <p className="font-bold sm:text-lg text-base">
              {(Number(order.real_win_amount) / Number(order.real_bet_amount)).toLocaleString()}x
            </p>
          </div>
        </div>

        <div className="p-4 rounded-field bg-base-300 flex items-center gap-4">
          <img src={order.image} className="w-[48px] aspect-3/4 rounded-field" />
          <div className="flex flex-col gap-1">
            <p className='font-semibold text-sm sm:text-base text-base-content/50'>{order.game_name}</p>
            <p className='font-bold text-base sm:text-lg'>{t(`explore:${order.game_category_1}`)}</p>
          </div>
          <button 
            className='btn btn-primary btn-md sm:btn-lg ml-auto rtl:mr-auto'
            onClick={handlePlayClick}
          >
            {t("common:common.play")}
          </button>
        </div>
      </div>
    </Modal>
  )
}
