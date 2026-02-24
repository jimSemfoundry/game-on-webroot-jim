import { Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { cn } from '@/utils/themeMerger'
import Iconify from '../iconify'
import { useSupportedLanguages } from '@/hooks/api/usePublic'
import { authService } from '@/services/authService'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useQueryClient } from '@tanstack/react-query'
import { AUTH_QUERY_KEYS } from '@/hooks/api/useAuth'

type LanguageSelectModalProps = {
  isOpen: boolean
  onClose: () => void
}

export const LanguageSelectModal = ({ isOpen, onClose }: LanguageSelectModalProps) => {
  const { i18n, t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const { data: languages } = useSupportedLanguages()
  const { user } = useAuth()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const queryClient = useQueryClient()

  const currentLang = (i18n.resolvedLanguage ?? i18n.language).toLowerCase()
  const currentLangBase = currentLang.split('-')[0]

  const filteredLanguages = languages?.filter((lang: any) => lang.label.toLowerCase().includes(searchTerm.toLowerCase()))

  const changeLanguage = async (lng: string) => {
    if (isUpdating) return

    try {
      setIsUpdating(true)

      // 如果用户已登录，先更新后端
      if (user) {
        await authService.updateUserLanguage(lng)
      }
      
      // 切换语言
      await i18n.changeLanguage(lng)
      
      // 刷新用户数据（保持后端同步）
      if (user) {
        await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser })
      }
      
      // 使用目标语言的翻译显示成功消息
      const tTarget = i18n.getFixedT(lng)
      toast.success(tTarget('common:languageUpdated'))
      onClose()
    } catch (error) {
      console.error('Failed to update language:', error)
      toast.error(t('common:updateLanguageFailed'))
    } finally {
      setIsUpdating(false)
    }
  }

  const headerContent = (
    <div className="flex items-center gap-x-2 h-8">
      <Iconify icon="custom:global" className="w-4 h-4 md:w-5 md:h-5 text-primary" />
      <p className="text-base md:text-xl font-semibold">{t('menu:language')}</p>
    </div>
  )

  return (
    <Modal
      position={isMobile ? 'modal-bottom' : 'modal-middle'}
      isOpen={isOpen}
      onClose={onClose}
      title={headerContent}
      className={cn(
        'bg-base-400 md:w-[375px] max-w-sm mx-auto overflow-hidden pb-16',
        isMobile ? 'h-[90vh] max-h-[90vh]' : 'md:h-[500px] md:max-h-[500px]',
      )}
    >
      <div className="flex flex-col h-full">
        {/* 固定区域 - 搜索框 */}
        <div className="flex-shrink-0 pb-4">
          <div className="relative">
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
          <div className="bg-base-300 p-2 h-full w-full rounded-field overflow-y-auto flex flex-col gap-1 pb-2 pr-1">
            {filteredLanguages?.map((lang: any) => (
              <button
                key={lang.value}
                className={cn(
                  'text-sm md:text-base font-semibold flex items-center gap-x-3 h-10 sm:h-12 px-4 py-2 rounded-lg transition-colors',
                  'hover:bg-base-200 active:bg-base-100',
                  (() => {
                    const optionLang = String(lang.value ?? '').toLowerCase()
                    const optionLangBase = optionLang.split('-')[0]
                    // 如果选项包含区域代码（如 zh-CN, zh-TW），必须完全匹配
                    // 否则只匹配基础语言代码
                    const hasRegion = optionLang.includes('-')
                    const isActive = hasRegion 
                      ? currentLang === optionLang 
                      : currentLang === optionLang || currentLangBase === optionLangBase
                    return isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-base-content/50 hover:text-base-content'
                  })(),
                  isUpdating && 'opacity-50 cursor-not-allowed',
                )}
                onClick={() => !isUpdating && changeLanguage(lang.value)}
                disabled={isUpdating}
              >
                <span className="truncate">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
