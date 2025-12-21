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
      const nextFormItem = (params.currency || params.method)
        ? null
        : { ...state.depositFiat.formItem, ...params.formItem };

      const nextDepositFiat = {
        ...state.depositFiat,
        ...params,
        formItem: nextFormItem
      };

      const prev = state.depositFiat;
      const sameFormItem = (() => {
        if (prev.formItem === nextFormItem) return true;
        if (!prev.formItem || !nextFormItem) return false;
        const prevKeys = Object.keys(prev.formItem);
        const nextKeys = Object.keys(nextFormItem);
        if (prevKeys.length !== nextKeys.length) return false;
        for (const k of prevKeys) {
          if (prev.formItem[k] !== nextFormItem[k]) return false;
        }
        return true;
      })();

      if (prev.method === nextDepositFiat.method && prev.currency === nextDepositFiat.currency && sameFormItem) {
        return state;
      }

      return { depositFiat: nextDepositFiat };
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
            : { ...state.withdrawFiat.formItem, ...params.formItem }
      }
    })),

  // withdraw fiat V2
  // currency 还是依赖于 V1
  withdrawFiatV2: {
    method: null,
    formItem: null
  },
  setWithdrawFiatV2: (params) =>
    set((state) => {
      return ({
        withdrawFiatV2: {
          ...state.withdrawFiatV2,
          ...params,
          formItem:
            params.method
              ? null
              : { ...state.withdrawFiatV2.formItem, ...params.formItem }
        }
      });
    }),

  // withdraw fiat
  withdrawCrypto: {
    network: null,
    currency: null,
    comment: "",
    toWallet: "",
    inputAmount: ""
  },
  setWithdrawCrypto: (params) => {
    set((state) => {
      const effect = (params.currency || params.network)
        ? { ...params, comment: "", inputAmount: "" }
        : { ...state.withdrawCrypto, ...params };
      return ({
        withdrawCrypto: {
          ...state.withdrawCrypto,
          ...effect
        }
      });
    });
  },

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
