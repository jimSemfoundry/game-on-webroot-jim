import { useSidebar } from '@/contexts/SidebarContext'
import Iconify from '../iconify/iconify'
import { SegmentedControl } from '../ui/SegmentedControl'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

export const SidebarHeader = () => {
  const [active, setActive] = useState('casino')
  const { mode } = useSidebar()
  const isMini = mode === 'mini'
  const navigate = useNavigate()

  const { t } = useTranslation()

  const handleChange = (value: string) => {
    setActive(value)
    if (value === 'casino') {
      navigate({ to: '/casino', search: { openLogin: undefined, redirect: undefined } })
    } else if (value === 'sport') {
      navigate({ to: '/sports' })
    }
  }

  const options = [
    {
      value: 'casino',
      label: (
        <div className="flex items-center gap-x-2 whitespace-nowrap">
          <Iconify icon="custom:casino" className="w-5 h-5" />
          {!isMini && <span>{t('explore:casino')}</span>}
        </div>
      ),
    },
    {
      value: 'sport',
      label: (
        <div className="flex items-center gap-x-2 whitespace-nowrap">
          <Iconify icon="custom:sports" className="w-5 h-5" />
          {!isMini && <span>{t('explore:sport')}</span>}
        </div>
      ),
    },
  ]

  return (
    <div className={`flex items-center justify-center overflow-hidden`}>
      <SegmentedControl
        options={options}
        value={active}
        onChange={handleChange}
        layoutId={isMini ? 'mini-sidebar' : 'desktop-sidebar'}
        orientation={isMini ? 'vertical' : 'horizontal'}
        className={isMini ? 'w-12' : ''}
      />
    </div>
  )
}
