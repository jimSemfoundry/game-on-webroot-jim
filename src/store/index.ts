import { Store } from "@/store/type.ts";
import { create } from "zustand";
import { createFinanceSlice } from "./financeSlice";

export const useBoundStore = create<Store>((...props) => ({
  ...createFinanceSlice(...props),
}));
