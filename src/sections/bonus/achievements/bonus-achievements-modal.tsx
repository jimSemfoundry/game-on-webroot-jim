import { useMediaQuery } from '@/hooks/useMediaQuery'
import Iconify from '@/components/iconify'
import { Modal } from '@/components/ui/Modal'
import { BonusAchievementsList } from './bonus-achievements-list'
import { m as motion, AnimatePresence } from 'motion/react'
import { createPortal } from 'react-dom'
import { ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type BonusAchievementsModalProps = {
  isOpen: boolean
  onClose: () => void
}

export const BonusAchievementsModal = ({ isOpen, onClose }: BonusAchievementsModalProps) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 768px)')

  const headerContent = (
    <div className="flex items-center gap-x-2 h-8">
      <Iconify icon="custom:profile-achievements" className="w-4 h-4 md:w-5 md:h-5 text-primary" />
      <p className="text-base md:text-xl font-semibold">{t("bonus:achievements")}</p>
    </div>
  )

  const mobileHeaderContent = (
    <div className="flex items-center justify-center relative text-lg font-semibold h-10">
      <button
        className="absolute left-0 btn btn-md btn-square rounded-lg bg-base-300 border-0"
        onClick={onClose}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <div className="flex items-center gap-x-2">
        <Iconify icon="custom:achievement" className="w-5 h-5 text-primary" />
        <span>{t("bonus:achievements")}</span>
      </div>
    </div>
  )

  return (
    <>
      {/* 桌面端 - 使用 Modal */}
      {!isMobile && (
        <Modal
          position="modal-middle"
          isOpen={isOpen}
          onClose={onClose}
          title={headerContent}
          className="bg-base-400 md:w-[600px] max-w-2xl mx-auto overflow-hidden md:max-h-[600px]"
        >
          <div className="flex flex-col h-full max-h-[calc(600px-120px)]">
            {/* Achievement Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <BonusAchievementsList closeModal={onClose}/>
            </div>
          </div>
        </Modal>
      )}

      {/* 移动端 - 使用全屏抽屉 */}
      {isMobile && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              style={{ marginTop: "var(--safe-area-inset-top)" }}
              className="px-4 py-4 bg-base-400 fixed w-full z-[1002] top-0 bottom-0 flex flex-col"
            >
              {/* 标题栏 */}
              {mobileHeaderContent}

              {/* 成就网格 - 可滚动 */}
              <div className="mt-4 overflow-y-auto flex-1 hide-scrollbar">
                <BonusAchievementsList closeModal={onClose}/>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
