export type ErrorString = `${string}_error`;

export interface IFiat {
  method: Record<string, any> | null;
  currency: Record<string, any> | null;
  formItem: Record<string, any> | null;

  [key: ErrorString]: boolean;
}

export interface ICrypto {
  network: Record<string, any> | null;
  currency: Record<string, any> | null;
}

export interface IWithdrawCrypto extends ICrypto {
  inputAmount: string;
  toWallet: string;
  comment?: string;
}

export interface IFinanceSlice {
  withdrawType: "crypto" | "fiat";
  setWithdrawType: (params: "crypto" | "fiat") => void;

  // withdraw fiat
  withdrawFiat: IFiat;
  setWithdrawFiat: (params: Partial<IFiat>) => void;

  // withdraw fiat V2
  withdrawFiatV2: Omit<IFiat, "currency">;
  setWithdrawFiatV2: (params: Partial<IFiat>) => void;

  // withdraw crypto
  withdrawCrypto: IWithdrawCrypto;
  setWithdrawCrypto: (params: Partial<IWithdrawCrypto>) => void;

  depositType: "crypto" | "fiat";
  setDepositType: (params: "crypto" | "fiat") => void;

  // deposit crypto
  depositCrypto: ICrypto;
  setDepositCrypto: (params: Partial<ICrypto>) => void;

  // deposit fiat
  depositFiat: IFiat;
  setDepositFiat: (params: Partial<IFiat>) => void;

  swapFrom: {
    currency: Record<string, any> | null;
    inAmount: string;
  };
  setSwapFrom: (params: { currency?: Record<string, any>; inAmount?: string }) => void;

  swapTo: {
    currency: Record<string, any> | null;
    outAmount: string;
  };
  setSwapTo: (params: { currency?: Record<string, any>; outAmount?: string }) => void;

  syncAction: { type: TActions | undefined; data?: any };
  setSyncAction: (t: TActions | undefined, data?: any) => void;
}

export type TActions =
  | "SYNC_USER_LATEST_DEPOSIT"
  | "SYNC_DEPOSIT_FIAT_CREATE"
  | "SYNC_WITHDRAW_FIAT_CREATE"
  | "SYNC_WITHDRAW_CRYPTO_CREATE"
  | "SYNC_ADD_WITHDRAW_ADDRESS"
  | "OPEN_TRANSACTION_DETAILS_MODAL"
  | "OPEN_DEPOSIT_FIAT_VIEW_MODAL"
  | "OPEN_DEPOSIT_BONUS_TIPS_MODAL"
  | "OPEN_DEPOSIT_MIN_AMOUNT_MODAL"
  | "OPEN_WITHDRAW_MIN_AMOUNT_MODAL"
  | "OPEN_WITHDRAW_ADDRESS_ADD_MODAL"
  | "OPEN_WITHDRAW_METHOD_ADD_MODAL"
  | "OPEN_WITHDRAW_ORDER_OK_MODAL"
  | "OPEN_WITHDRAW_FIAT_PIN_MODAL"
  | "OPEN_WITHDRAW_CRYPTO_PIN_MODAL"
  | "OPEN_CRYPTO_SETTLEMENT_MODAL"
  | "OPEN_CHANGE_PASSWORD_MODAL"
  | "OPEN_SET_WITHDRAWAL_PIN_MODAL"
  | "OPEN_EMAIL_VERIFICATION_MODAL"
  | "OPEN_PHONE_VERIFICATION_MODAL";

export type TPublicProfileKeys =
  | "HideAllProfileInfo"
  | "HideStatistics"
  | "HideTop3Games"
  | "HideAchievements"
  | "HideTournamentRewards"
  | "DoNotPushNotifications"
  | "DoNOTReceivePromotionalOffers";

export type IPublicProfileKeys = {
  [key in TPublicProfileKeys]: boolean;
};

export interface IPublicProfileSlice {
  publicProfile: IPublicProfileKeys;
  setPublicProfile: (params: Partial<IPublicProfileKeys>) => void;
}

export type Store = IFinanceSlice;
