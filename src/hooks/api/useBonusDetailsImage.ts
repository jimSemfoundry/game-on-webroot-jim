import { useBaseConfig } from "./usePublic";
import { BONUS_DETAILS_DEFAULT_IMAGES } from "@/sections/bonus/shared/bonusDetailsImages";
import { getImgCompressParams } from "@/utils/helper";

/**
 * 拿 branch 自定义的 bonus details 顶部图。
 *
 * 判空顺序: branch_url 是非空字符串 → 用它; 否则 → 用 BONUS_DETAILS_DEFAULT_IMAGES[key]。
 * 返回值已经过 imgix host 替换 + 优化参数(getImgCompressParams)。
 */
export function useBonusDetailsImage(bonusKey: string, w: number = 256): string {
  const { data } = useBaseConfig();
  const branchUrl = data?.data?.bonus_details_images?.[bonusKey];
  const rawUrl =
    typeof branchUrl === "string" && branchUrl !== ""
      ? branchUrl
      : BONUS_DETAILS_DEFAULT_IMAGES[bonusKey] ?? "";
  return rawUrl ? getImgCompressParams(rawUrl, w) : "";
}
