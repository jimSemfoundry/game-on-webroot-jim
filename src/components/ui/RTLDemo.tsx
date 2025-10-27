import React from 'react'
import { useRTLContext } from '@/contexts/RTLContext'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react'
import { rtlClasses, conditionalRTL, getIconDirection } from '@/utils/rtl'
import { cn } from '@/utils/themeMerger'

/**
 * Demo component showing RTL-aware UI patterns
 * This component demonstrates best practices for RTL layouts
 */
export const RTLDemo: React.FC = () => {
  const { isRTL, direction } = useRTLContext()
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar'
    i18n.changeLanguage(newLang)
  }

  return (
    <div className="space-y-6 p-6 bg-base-100 rounded-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">RTL Layout Demo</h2>
        <p className="text-base-content/70">
          Current direction: <span className="font-mono">{direction}</span> | 
          Language: <span className="font-mono">{i18n.language}</span>
        </p>
        <button 
          onClick={toggleLanguage}
          className="btn btn-primary btn-sm mt-2"
        >
          Switch to {i18n.language === 'ar' ? 'English' : 'العربية'}
        </button>
      </div>

      {/* Text Alignment Demo */}
      <div className="card bg-base-200 p-4">
        <h3 className="font-semibold mb-3">Text Alignment</h3>
        <div className="space-y-2">
          <p className={rtlClasses.textStart}>
            This text starts from the natural beginning ({isRTL ? 'right' : 'left'})
          </p>
          <p className={rtlClasses.textEnd}>
            This text aligns to the natural end ({isRTL ? 'left' : 'right'})
          </p>
        </div>
      </div>

      {/* Spacing Demo */}
      <div className="card bg-base-200 p-4">
        <h3 className="font-semibold mb-3">Logical Spacing</h3>
        <div className="space-y-2">
          <div className={cn('bg-primary/10 p-2 rounded', rtlClasses.marginStart('4'))}>
            Margin start (margin-{isRTL ? 'right' : 'left'})
          </div>
          <div className={cn('bg-secondary/10 p-2 rounded', rtlClasses.marginEnd('4'))}>
            Margin end (margin-{isRTL ? 'left' : 'right'})
          </div>
          <div className={cn('bg-accent/10 rounded', rtlClasses.paddingStart('4'), rtlClasses.paddingEnd('8'))}>
            Padding start & end
          </div>
        </div>
      </div>

      {/* Icon Direction Demo */}
      <div className="card bg-base-200 p-4">
        <h3 className="font-semibold mb-3">Directional Icons</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ArrowRight className={cn('w-5 h-5', getIconDirection(isRTL, true))} />
            <span>Forward arrow (auto-flipped in RTL)</span>
          </div>
          <div className="flex items-center gap-2">
            <ChevronRight className={cn('w-5 h-5', getIconDirection(isRTL, true))} />
            <span>Forward chevron (auto-flipped in RTL)</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowLeft className={cn('w-5 h-5', getIconDirection(isRTL, true))} />
            <span>Back arrow (auto-flipped in RTL)</span>
          </div>
        </div>
      </div>

      {/* Conditional Styling Demo */}
      <div className="card bg-base-200 p-4">
        <h3 className="font-semibold mb-3">Conditional Styling</h3>
        <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
          <span>Content aligned to start</span>
          <div className={conditionalRTL(isRTL, 'ml-auto', 'mr-auto')}>
            <ChevronRight className={cn('w-5 h-5', getIconDirection(isRTL, true))} />
          </div>
        </div>
      </div>

      {/* Tailwind v4 RTL Prefix Demo */}
      <div className="card bg-base-200 p-4">
        <h3 className="font-semibold mb-3">Tailwind v4 RTL Prefix</h3>
        <div className="space-y-3">
          <div className="p-3 bg-base-100 rounded-lg">
            <div className="text-left rtl:text-right mb-2">
              <strong>Text Alignment:</strong> <code>text-left rtl:text-right</code>
            </div>
            <p className="text-sm opacity-70">This text switches alignment using rtl: prefix</p>
          </div>
          
          <div className="p-3 bg-base-100 rounded-lg">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-primary rounded mr-2 rtl:ml-2 rtl:mr-0"></div>
              <span><strong>Margin:</strong> <code>mr-2 rtl:ml-2 rtl:mr-0</code></span>
            </div>
          </div>
          
          <div className="p-3 bg-base-100 rounded-lg relative">
            <div className="absolute right-2 rtl:left-2 rtl:right-auto top-2 w-3 h-3 bg-accent rounded-full"></div>
            <div><strong>Positioning:</strong> <code>right-2 rtl:left-2 rtl:right-auto</code></div>
            <p className="text-sm opacity-70">Notice the dot position changes</p>
          </div>
        </div>
      </div>

      {/* Form Layout Demo */}
      <div className="card bg-base-200 p-4">
        <h3 className="font-semibold mb-3">Form Layout</h3>
        <form className="space-y-3">
          <div>
            <label className={cn('label', rtlClasses.textStart)}>
              <span className="label-text">Name / الاسم</span>
            </label>
            <input 
              type="text" 
              placeholder={isRTL ? 'أدخل اسمك' : 'Enter your name'}
              className={cn('input input-bordered w-full', rtlClasses.textStart)}
            />
          </div>
          <div>
            <label className={cn('label', rtlClasses.textStart)}>
              <span className="label-text">Email / البريد الإلكتروني</span>
            </label>
            <input 
              type="email" 
              placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
              className={cn('input input-bordered w-full', rtlClasses.textStart)}
            />
          </div>
          <div className={conditionalRTL(isRTL, 'flex flex-row-reverse gap-2', 'flex gap-2')}>
            <button type="submit" className="btn btn-primary">
              {isRTL ? 'إرسال' : 'Submit'}
            </button>
            <button type="reset" className="btn btn-outline">
              {isRTL ? 'إعادة تعيين' : 'Reset'}
            </button>
          </div>
        </form>
      </div>

      {/* Navigation Demo */}
      <div className="card bg-base-200 p-4">
        <h3 className="font-semibold mb-3">Navigation Layout</h3>
        <div className="breadcrumbs text-sm">
          <ul className={conditionalRTL(isRTL, 'flex-row-reverse', '')}>
            <li><a>Home</a></li>
            <li><a>Category</a></li>
            <li>Current Page</li>
          </ul>
        </div>
        
        <div className="divider"></div>
        
        <nav className="menu menu-horizontal bg-base-100 rounded-box">
          <li><a>الرئيسية / Home</a></li>
          <li><a>حول / About</a></li>
          <li><a>اتصل / Contact</a></li>
        </nav>
      </div>
    </div>
  )
}