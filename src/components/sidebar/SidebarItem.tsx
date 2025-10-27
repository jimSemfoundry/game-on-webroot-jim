import { Link } from '@tanstack/react-router'
import { m } from 'motion/react'
import { memo, useMemo, useCallback } from 'react'
import { useSidebar } from '@/contexts/SidebarContext'
import Iconify from '../iconify'

type SidebarItemProps = {
  icon?: string
  label?: string
  path?: string
  isActive?: boolean
  isMini?: boolean
}

const SidebarItemComponent = ({ icon, label, path, isActive, isMini }: SidebarItemProps) => {
  const { isMobile, closeDrawer } = useSidebar()

  // Memoize className computation to avoid recalculation on every render
  const linkClassName = useMemo(() => `
    flex items-center transition-all duration-200
    group relative h-11 hover:text-primary text-base-content/70
    ${isActive ? 'text-primary' : ''}
    ${isMini ? 'justify-center py-3 px-2 w-11 max-w-none mx-auto' : 'gap-3 px-3 py-3'}
  `, [isActive, isMini])

  const handleClick = useCallback(() => {
    if (isMobile) {
      closeDrawer()
    }
  }, [isMobile, closeDrawer])

  return (
    <li>
      <Link
        to={path ?? ''}
        className={linkClassName}
        onClick={handleClick}
      >
        {icon && <Iconify icon={icon} width={20} height={20} className="shrink-0" />}

        {!isMini && (
          <m.span layout className="text-sm font-semibold whitespace-nowrap overflow-hidden">
            {label ?? ''}
          </m.span>
        )}

        {/* Tooltip for mini mode */}
        {isMini && (
          <div className="fixed left-20 rtl:right-20 rtl:left-auto px-2 py-1 bg-base-100 shadow-lg text-base-content rounded-selector badge badge-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {label ?? ''}
          </div>
        )}
      </Link>
    </li>
  )
}

// Memoize the component to prevent unnecessary re-renders when parent components update
export const SidebarItem = memo(SidebarItemComponent)
