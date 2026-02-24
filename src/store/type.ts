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
  withdrawFiat: IFiat & { extraItem: Record<string, any> | null };
  setWithdrawFiat: (params: Partial<IFiat & { extraItem: Record<string, any> | null }>) => void;
  resetWithdrawFiat: () => void;

  // withdraw fiat V2
  withdrawFiatV2: Omit<IFiat, "currency">;
  setWithdrawFiatV2: (params: Partial<IFiat>) => void;
  resetWithdrawFiatV2: () => void;

  // withdraw crypto
  withdrawCrypto: IWithdrawCrypto;
  setWithdrawCrypto: (params: Partial<IWithdrawCrypto>) => void;
  resetWithdrawCrypto: () => void;

  depositType: "crypto" | "fiat";
  setDepositType: (params: "crypto" | "fiat") => void;

  // deposit crypto
  depositCrypto: ICrypto;
  setDepositCrypto: (params: Partial<ICrypto>) => void;

  // deposit fiat
  depositFiat: IFiat & { extraItem: Record<string, any> | null };
  setDepositFiat: (params: Partial<IFiat & { extraItem: Record<string, any> | null }>) => void;

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

  // 多弹窗状态管理（支持多个弹窗同时显示）
  modals: Record<string, { open: boolean; data?: any }>;
  openModal: (type: TActions, data?: any) => void;
  closeModal: (type: TActions) => void;
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
  | "OPEN_PHONE_VERIFICATION_MODAL"
  | "OPEN_WELCOME_SIGN_UP_MODAL"
  | "OPEN_BONUS_CLAIM_RESPONSE_MODAL"
  | "OPEN_EXTRA_REFERRAL_BONUS_MODAL"
  | "OPEN_DOUBLE_OR_NOTHING_MODAL"
  | "OPEN_VIP_MONDAY_BONUS_MODAL"
  | "OPEN_FINANCE_AML_MODAL"
  | "OPEN_FREE_PLAY_BONUS_MODAL"
  | "OPEN_MINI_SLOT_BONUS_MODAL"
  | "OPEN_MEGA_SLOT_BONUS_MODAL"
  | "OPEN_OPTIONAL_BONUS_MODAL"
  | "OPEN_GIVE_UP_BONUS_MODAL"
  | "OPEN_LIMIT_OFFER_MODAL"
  | "CLOSE_FINANCE_MODAL";

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

export interface ISettingSlice {
  gameIsFullScreen: boolean;
  setGameIsFullScreen: (isFullScreen: boolean) => void;
}

export interface IHeaderSlice {
  headerBackAction: (() => void) | null;
  setHeaderBackAction: (action: (() => void) | null) => void;
}

export interface IExploreSlice {
  exploreState: {
    games: any[];
    page: number;
    scrollTop: number;
    filterFingerprint: string;
  };
  setExploreState: (state: Partial<IExploreSlice["exploreState"]>) => void;
  resetExploreState: () => void;
}

export type Store = IFinanceSlice & ISettingSlice & IHeaderSlice & IExploreSlice;
