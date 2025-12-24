import { IFinanceSlice, IFiat, Store, TActions } from "@/store/type.ts";
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
  setDepositFiat: (params: Partial<IFiat>) =>
    set((state) => {
      const need_reset_form = Boolean(params.method);
      console.info("************ setDepositFiat start ************");
      console.info(params.currency?.currency);
      console.info(params.method?.display_name);
      console.info("need_reset_form", need_reset_form);
      console.info("************ setDepositFiat ended ************");
      const next_deposit_fiat = {
        ...state.depositFiat,
        ...params,
        formItem: need_reset_form
          ? null
          : { ...(state.depositFiat.formItem ?? {}), ...(params.formItem ?? {}) }
      };

      // ‼️清除后缀为_error的字段残留，避免影响下一个阶段的数据
      if (need_reset_form) {
        Object.keys(next_deposit_fiat).forEach((k) => {
          if (k.endsWith("_error")) Reflect.deleteProperty(next_deposit_fiat, k);
        });
      }

      return {
        depositFiat: {
          ...next_deposit_fiat
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
    set((state) => {
      const need_reset_form = Boolean(params.method);
      console.info("************ setWithdrawFiat store change start ************");
      console.info(params.currency?.currency);
      console.info(params.method?.display_name);
      console.info("need_reset_form", need_reset_form);
      console.info("************ setWithdrawFiat store change ended ************");
      const next_withdraw_fiat = {
        ...state.withdrawFiat,
        ...params,
        formItem: need_reset_form
          ? null
          : { ...(state.withdrawFiat.formItem ?? {}), ...(params.formItem ?? {}) }
      };

      // ‼️清除后缀为_error的字段残留，避免影响下一个阶段的数据
      if (need_reset_form) {
        Object.keys(next_withdraw_fiat).forEach((k) => {
          if (k.endsWith("_error")) Reflect.deleteProperty(next_withdraw_fiat, k);
        });
      }

      return {
        withdrawFiat: {
          ...next_withdraw_fiat
        }
      };
    }),

  // withdraw fiat V2
  // currency 还是依赖于 V1
  withdrawFiatV2: {
    method: null,
    formItem: null
  },
  setWithdrawFiatV2: (params) =>
    set((state) => {
      const need_reset_form = Boolean(params.method);
      console.info("************ setWithdrawFiatV2 store change start ************");
      console.info(params.method?.channel_class);
      console.info("need_reset_form", need_reset_form);
      console.info("************ setWithdrawFiatV2 store change ended ************");
      const next_withdraw_fiat_v2 = {
        ...state.withdrawFiatV2,
        ...params,
        formItem: need_reset_form
          ? null
          : { ...(state.withdrawFiatV2.formItem ?? {}), ...(params.formItem ?? {}) }
      };

      // ‼️清除后缀为_error的字段残留，避免影响下一个阶段的数据
      if (need_reset_form) {
        Object.keys(next_withdraw_fiat_v2).forEach((k) => {
          if (k.endsWith("_error")) Reflect.deleteProperty(next_withdraw_fiat_v2, k);
        });
      }

      return {
        withdrawFiatV2: {
          ...next_withdraw_fiat_v2
        }
      };
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
        ? { ...params, comment: "", inputAmount: "", toWallet: "" }
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
