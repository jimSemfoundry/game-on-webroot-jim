import { IFinanceSlice, Store, TActions } from "@/store/type.ts";
import { StateCreator } from "zustand";

export const createFinanceSlice: StateCreator<Store, [], [], IFinanceSlice> = (set) => ({
  // deposit/withdraw [crypto,fiat]
  depositType: "crypto",
  setDepositType: (params) => set(() => ({ depositType: params })),

  // deposit fiat
  depositFiat: {
    method: null,
    currency: null,
    formItem: null
  },
  setDepositFiat: (params) =>
    set((state) => {
      return {
        depositFiat: {
          ...state.depositFiat,
          ...params,
          formItem:
            params.currency || params.method
              ? null
              : params.formItem
                ? { ...state.depositFiat.formItem, ...params.formItem }
                : state.depositFiat.formItem
        }
      };
    }),

  // deposit crypto
  depositCrypto: {
    currency: null,
    network: null
  },
  setDepositCrypto: (params) => set((state) => ({ depositCrypto: { ...state.depositCrypto, ...params } })),

  // deposit/withdraw [crypto,fiat]
  withdrawType: "crypto",
  setWithdrawType: (params) => set(() => ({ withdrawType: params })),

  // withdraw fiat V1
  withdrawFiat: {
    method: null,
    currency: null,
    formItem: null
  },
  setWithdrawFiat: (params) =>
    set((state) => ({
      withdrawFiat: {
        ...state.withdrawFiat,
        ...params,
        formItem:
          params.currency || params.method
            ? null
            : params.formItem
              ? { ...state.withdrawFiat.formItem, ...params.formItem }
              : state.withdrawFiat.formItem
      }
    })),

  // withdraw fiat V2
  // currency 还是依赖于 V1
  withdrawFiatV2: {
    method: null,
    formItem: null
  },
  setWithdrawFiatV2: (params) =>
    set((state) => ({
      withdrawFiatV2: {
        ...state.withdrawFiatV2,
        ...params,
        formItem:
          params.method
            ? null
            : params.formItem
              ? { ...state.withdrawFiatV2.formItem, ...params.formItem }
              : state.withdrawFiatV2.formItem
      }
    })),

  // withdraw fiat
  withdrawCrypto: {
    network: null,
    currency: null,
    comment: "",
    toWallet: "",
    inputAmount: ""
  },
  setWithdrawCrypto: (params) =>
    set((state) => ({
      withdrawCrypto: {
        ...state.withdrawCrypto,
        ...params,
        comment: params.currency || params.network ? "" : params.comment || state.withdrawCrypto.comment,
        inputAmount: params.currency || params.network ? "" : params.inputAmount || state.withdrawCrypto.inputAmount
      }
    })),

  // swap send
  swapFrom: { currency: null, inAmount: "" },
  setSwapFrom: (params) => set((state) => ({ swapFrom: { ...state.swapFrom, ...params } })),

  // swap receive
  swapTo: { currency: null, outAmount: "" },
  setSwapTo: (params) => set((state) => ({ swapTo: { ...state.swapTo, ...params } })),

  // which modal to show
  syncAction: { type: undefined, data: undefined },
  setSyncAction: (type: TActions | undefined, data?: any) => set({ syncAction: { type, data } })
});
