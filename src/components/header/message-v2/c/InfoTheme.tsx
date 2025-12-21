import { AnimatePresence, m } from "motion/react";
import { ReactNode } from "react";
import { memoize, random } from 'lodash-es'

const search = memoize(function (type: string) {
  let config = null
  const target = matchTheme.find((m) => {
    const a: Record<string, any> = m.icon
    for (const i in a) {
      if (Object.prototype.hasOwnProperty.call(a, i) && (a[i].includes(type))) return true
    }
  })
  if (target) {
    const b: Record<string, any> = target.icon
    for (const i in b) {
      if (b[i].includes(type) || b[i].find((k: string) => type.includes(k))) {
        config = {
          icon: `/icons/isometric/${i}`,
          background: target.background,
        }
        break
      }
    }
  }
  return config ?? {
    icon: `/logos/${import.meta.env.VITE_THEME ?? '1stgame'}/logo-pwa.png`,
    background: matchTheme[random(0, matchTheme.length - 1)].background,
  }
})

export const InfoTheme = ({ i, type, children, resetAnimate }: {
  i: number,
  type: any,
  resetAnimate: boolean
  children: (data: any) => ReactNode,
}) => {
  return (
    <AnimatePresence>
      {resetAnimate && <m.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05, type: 'spring', stiffness: 500, damping: 30 } }}
        exit={{ opacity: 0, y: 12, transition: { duration: 0.15 } }}
        className='rounded-lg border-1 border-base-200 p-4 relative min-h-20'
        style={{ background: search(type).background }}
      >
        {children({ data: search(type) })}
      </m.div>}
    </AnimatePresence>
  )
}

/**
 * 多个类型共用一个图标
 * 多个类型共用一种背景色
 */
const matchTheme = [
  {
    icon: {
      'free-pins.png': ['free_spins'],
      'inferno.png': ['Inferno', ''],
    },
    background: 'radial-gradient(60.05% 100% at 0% 46.47%, color(display-p3 0.3961 0.8 0.2392 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: { 'rakeback.png': ['rakeback', 'promo_code'] },
    background: 'radial-gradient(60.05% 100% at 0% 46.47%, color(display-p3 0.2 0.302 0.6706 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: {
      'UNKNOWN': ['Template', 'template'],
    },
    background: 'radial-gradient(60.05% 100% at 0% 46.47%, color(display-p3 0.2627 0.2196 0.4196 / 0.30) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: { 'cashback.png': ['cashback'], },
    background: 'radial-gradient(60.05% 100% at 0% 46.47%, color(display-p3 0.902 0.6784 0.2627 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: {
      'calendar.png': ['calendar'],
      'cannon.png': ['cannon'],
    },
    background: 'radial-gradient(225.96% 141.42% at 0% 0%, color(display-p3 0.3216 0.2667 0.5137 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: {
      'tournaments.png': ['tournaments'],
      'lucky-number-seven.png': ['lucky_number_seven'],
      'level_up.png': ['level_up', 'rising star'],
    },
    background: 'radial-gradient(60.05% 100% at 0% 46.47%, color(display-p3 0.898 0.4588 0.2078 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: {
      'mystery-box.png': ['vip_bonus_mystery_box'],
    },
    background: 'radial-gradient(60.05% 100% at 0% 46.47%, color(display-p3 0.3843 0.5843 0.2667 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: {
      'slots-legend.png': ['Slots Legend'],
      'jester.png': ['jester'],
      'achievement.png': ['achievement'],
      'conquest.png': ['conquest', 'Conquistador'],
      'roulette-legend.png': ['', 'Roulette Legend'],
      'crash-legend.png': ['', 'Crash Legend'],
      'card-shark.png': ['', 'Card Shark'],
    },
    background: 'radial-gradient(60.05% 100% at 0% 46.47%, color(display-p3 0.7804 0.2745 0.3176 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: {
      'rewards.png': ['referral_rewards', 'Catalyst']
    },
    background: 'radial-gradient(60.05% 100% at 0% 46.47%, color(display-p3 0.3569 0.5882 0.3373 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: { 'referral-commissions.png': ['referral_commissions'] },
    background: 'radial-gradient(60.05% 100% at 0% 46.47%, color(display-p3 0.7922 0.8863 0.7922 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: { 'system.png': ['system'] },
    background: 'radial-gradient(60.05% 100% at 0% 46.47%, color(display-p3 0.502 0.3373 0.8588 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: { 'deposit.png': ['deposit', '1'] },
    background: 'radial-gradient(60.05% 100% at 0% 46.47%, color(display-p3 0.0941 0.5216 0.8549 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: {
      'deposit-bonus.png': ['deposit bonus'],
      'bonus_expired.png': ['deposit bonus expired'],
    },
    background: 'radial-gradient(60.05% 100% at 0% 46.47%, color(display-p3 1 0.5686 0 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: {
      'maintenance.png': ['Maintenance'],
      'blackjack-legend.png': ['Blackjack Legend'],
    },
    background: 'radial-gradient(293.4% 100% at 0% 46.47%, color(display-p3 0.2627 0.2196 0.4196 / 0.30) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: { 'game-show-legend.png': ['Gameshow Legend'],      'withdraw.png': ['withdraw', '2'], },
    background: 'radial-gradient(293.4% 100% at 0% 46.47%, color(display-p3 0.3333 0.6941 0.2078 / 0.30) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: { 'baccarat-legend.png': ['Baccarat Legend'] },
    background: 'radial-gradient(293.4% 100% at 0% 46.47%, color(display-p3 0.0627 0.7765 0.6471 / 0.30) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: {
      'sports-legend.png': ['Sports Legend'],
      'money-transfer.png': ['Money monster'],
      'chain-shifter.png': ['Chain shifter'],
      'crypto-bro.png': ['crypto bro'],
    },
    background: 'radial-gradient(293.4% 100% at 0% 46.47%, color(display-p3 0.6824 0.3412 0.1608 / 0.30) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: {
      'champion.png': ['Champion'],
      'face-of-fortune.png': ['Face of Fortune'],
    },
    background: 'radial-gradient(60.05% 100% at 0% 46.47%, color(display-p3 0.6353 0.5725 0.302 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: { 'sniper.png': ['Sniper'] },
    background: 'radial-gradient(60.05% 100% at 0% 46.47%, color(display-p3 1 0.2784 0.3412 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: { 'super-spreader.png': ['Super Spreader'] },
    background: 'radial-gradient(60.05% 100% at 0% 46.47%, color(display-p3 0.7451 0.9843 0.9961 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098));'
  },
  {
    icon: { 'game-explorer.png': ['Game Explorer'] },
    background: 'radial-gradient(60.05% 100% at 0% 46.47%, color(display-p3 0.4353 0.3765 0.8667 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: {
      'challenger.png': ['The Challenger'],
      'dynamo.png': ['Dynamo'],
    },
    background: 'radial-gradient(60.05% 100% at 0% 46.47%, color(display-p3 0.2706 0.498 0.9647 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: {
      'guiding-star.png': ['Guiding Star'],
    },
    background: 'radial-gradient(60.05% 100% at 0% 46.47%, color(display-p3 0.749 0.8235 0.2706 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: {
      'name-of-fame.png': ['Name of Fame'],
    },
    background: 'radial-gradient(60.05% 100% at 0% 46.47%, color(display-p3 0.3961 0.4235 0.5647 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: {
      'money-maverick.png': ['Money Maverick'],
    },
    background: 'radial-gradient(60.05% 100% at 0% 46.47%, color(display-p3 0.1412 0.4784 0.2 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  },
  {
    icon: {
      'crypto-baron.png': ['crypto baron'],
    },
    background: 'radial-gradient(60.05% 100% at 0% 46.47%, color(display-p3 0.6275 0.1765 0.3193 / 0.40) 0%, var(--d-color-base-3000, color(display-p3 0.0627 0.0784 0.098 / 0.00)) 100%), var(--d-color-base-300, color(display-p3 0.0627 0.0784 0.098))'
  }
]
