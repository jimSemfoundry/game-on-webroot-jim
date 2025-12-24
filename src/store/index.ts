import { Store } from "@/store/type.ts";
import { create } from "zustand";
import { createFinanceSlice } from "./financeSlice";
import { createSettingSlice } from "./settingSlice";
import { createHeaderSlice } from "./headerSlice";

// TODO： 要拆分
export const useBoundStore = create<Store>((...props) => ({
  ...createFinanceSlice(...props),
  ...createSettingSlice(...props),
  ...createHeaderSlice(...props),
}));
