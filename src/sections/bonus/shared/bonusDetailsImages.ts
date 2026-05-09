/**
 * Bonus Details 顶部图片默认值表。
 *
 * 取每个 bonus 的 modal 文件原硬编码 URL。card 与 modal 同图（站长上传一张图覆盖两处）。
 * 4 个历史不一致 bonus（vip_monday / super_rakeback / lucky_number_seven / sports_bonus）
 * 的 card 历史路径丢弃，统一为 modal 那张。
 */
export const BONUS_DETAILS_DEFAULT_IMAGES: Record<string, string> = {
  mystery_box: "/images/illustrations/a0460e0b128df2ab73ba3a735212bd9d95c841b1.png",
  members_day: "/images/illustrations/6df60175af2bfcc308ff69b83a6a320795c694b3.png",
  bonus_store: "/images/bonus/bonus-store.png",
  sports_bonus: "/images/dollars/bonus-sport.png",
  buddy_balls: "/images/bonus/ball-pool.png",
  super_rakeback: "/images/bonus/rakeback.png",
  tournament_reward: "/images/illustrations/976143dfd2c953990ba4fcb7aec3cf7b471c5beb.png",
  vip_monday: "/images/bonus/vip-monday.png",
  lucky_number_seven: "/images/illustrations/bdff680c12dae6bd01b27ff35cb22ad0cd656f89.png",
  cashback: "/images/illustrations/e344898e01d3ab8d8c618f8f5cb07dcf3bdde883.png",
  achievements: "/images/illustrations/0bfb7eed784e639b1f6c07fda138122d67b96eef.png",
  deposit_bonus: "/images/illustrations/deposit-bonus.png",
  free_spins: "/images/bonus/free-spins.png",
};

export type BonusDetailsKey = keyof typeof BONUS_DETAILS_DEFAULT_IMAGES;
