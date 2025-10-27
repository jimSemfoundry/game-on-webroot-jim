/**
 * Calendar Bonus 相关类型定义
 */

// 原始的 Calendar Bonus 数据结构
export interface CalendarBonus {
  id: string | number;
  amount: string;
  start_time: number;
  end_time: number;
  status: number; // 0: 未领取, 1: 已领取
  handle_status: number;
  currency?: string;
  time?: string; // 添加处理后的时间字段
}

// 处理后的日期卡片数据结构
export interface CalendarItem {
  date: Date;
  day: number;
  month: string;
  dayOfWeek: string;
  isPast: boolean;
  isCurrent: boolean;
  isFuture: boolean;
  claimTime?: string;
  amount?: number;
  // 新增字段，与参考代码对应
  dayName: string;
  isActive: boolean;
  claimAmount: string;
  totalAmount: string;
  completed: number;
  bonuses: CalendarBonus[];
  hasBonus: boolean;
}

// 全局下一个解锁奖励状态
export interface NextUnlockingBonus {
  cardIndex: number;
  bonusIndex: number;
  bonusId: string | number;
  startTime: number;
}

// 倒计时状态
export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
