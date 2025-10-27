// VIP 功能配置
export const VIP_REQUIREMENTS = {
  achievements: {
    requiredLevel: 2,
    name: 'Achievements',
    translationKey: 'bonus:achievements'
  },
  mysteryBox: {
    requiredLevel: 4,
    name: 'Mystery Box',
    translationKey: 'bonus:mystery_box'
  },
  jester: {
    requiredLevel: 2,
    name: 'The Jester',
    translationKey: 'bonus:the_jester'
  },
  cannon: {
    requiredLevel: 48,
    name: 'The Cannon',
    translationKey: 'bonus:the_cannon'
  },
  luckyNumber: {
    requiredLevel: 7,
    name: 'Lucky Number Seven',
    translationKey: 'bonus:lucky_number_seven'
  }
} as const;

// 检查用户是否满足 VIP 要求
export const checkVipAccess = (userVipLevel: number, requiredLevel: number): boolean => {
  return userVipLevel >= requiredLevel;
};

// 获取 VIP 状态文本
export const getVipStatusText = (userVipLevel: number, requiredLevel: number): string => {
  if (userVipLevel >= requiredLevel) {
    return 'Go';
  }
  return `VIP ${requiredLevel}`;
};