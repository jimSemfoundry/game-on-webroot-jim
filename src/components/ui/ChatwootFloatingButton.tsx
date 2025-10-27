import { useChatwootContext } from '@/contexts/ChatwootContext'
import Iconify from '../iconify'
import { useLocation } from '@tanstack/react-router'

export const ChatFloatingButton = () => {
  const { toggleWidget, visible } = useChatwootContext()
  const location = useLocation()
  
  // 检查是否在游戏详情页面，如果是则隐藏客服按钮
  const isGamePage = location.pathname.startsWith('/games/')
  
  // 如果在游戏页面或chatwoot不可见，则隐藏按钮
  if (isGamePage || !visible) {
    return null
  }

  return (
    <button
      onClick={() => {
        toggleWidget()
      }}
      className="btn btn-primary btn-md sm:btn-md fixed bottom-27 sm:bottom-12 right-3 rtl:left-3 sm:right-12 rtl:sm:left-12 rtl:right-auto z-50000 flex items-center justify-center shadow-lg shadow-base-300 rounded-lg btn-square p-0"
      style={{
        boxShadow:
          '-12px 0px 32px color(display - p3 0.000 0.000 0.000 / 0.04), -8px 0px 16px color(display - p3 0.000 0.000 0.000 / 0.08), -4px 0px 8px color(display - p3 0.000 0.000 0.000 / 0.12)',
      }}
    >
      <Iconify icon="custom:headphone-2" className="w-5 h-5" />
    </button>
  )
}
