import i18n from "@/i18n";
import authAxiosInstance from "@/lib/authAxios";
import publicAxiosInstance from "@/lib/publicAxios";

import type { ApiResponse, LoginCredentials, LoginResponse } from "@/types/auth";
import type { BetHistoryQueryParams } from "@/types/bet-history";
import type {
  AdTag,
  AdTagListResponse,
  CommissionListResponse,
  CreateAdTagParams,
  GetCommissionListParams,
  GetReferralListParams,
  GetReferralRewardsListParams,
  ReferralListResponse,
  ReferralRewardsListResponse,
  SetDefaultAdTagParams,
  SetDefaultAdTagResponse
} from "@/types/referral";
import type { UserGameListParams, UserGameListResponse } from "@/types/game";
import type { TournamentPoolPrizeParams } from "@/types/tournament";

export const authService = {
  async signIn(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await publicAxiosInstance.post<LoginResponse>("/Authentication/login", credentials);

    if (response.data.code !== 0) {
      if (response.data.code === 11 || response.data.code === 5004) {
        throw new Error(i18n.t("toast:login_error_code_1"));
      }
      if (response.data.code === 5002 ) {
        throw new Error(i18n.t("toast:user_not_found_or_password_incorrect"));
      }

      throw new Error(response.data.msg || "Login failed");
    }

    return response.data;
  },

  async signupRoiBest(credentials: LoginCredentials): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.post<ApiResponse<any>>("/Authentication/signupRoiBest", credentials);

    if (response.data.code !== 0) {
      const error: Error & { code?: number; responseData?: ApiResponse<any> } = new Error(
        response.data.msg || "Login failed"
      );
      error.code = response.data.code;
      error.responseData = response.data;
      throw error;
    }

    return response.data;
  },

  async signUp(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await publicAxiosInstance.post<LoginResponse>("/Authentication/signup", credentials, {
      headers: {
        "Accept-Language": i18n.language
      }
    });

    if (response.data.code !== 0) {
      if (response.data.code === 11 || response.data.code === 5004) {
        throw new Error(i18n.t("toast:login_error_code_1"));
      }
      const error: Error & { code?: number; responseData?: LoginResponse } = new Error(
        response.data.msg || "Sign up failed"
      );
      error.code = response.data.code;
      error.responseData = response.data;
      throw error;
    }

    return response.data;
  },

  async signOut(): Promise<void> {
    await authAxiosInstance.post("/user/logout");
  },

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await authAxiosInstance.post<ApiResponse<LoginResponse>>("/auth/refresh", {
      refreshToken
    });

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Token refresh failed");
    }

    return response.data.data;
  },

  async getUserProfile(): Promise<LoginResponse> {
    const response = await authAxiosInstance.get<LoginResponse>("/User/profile");

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get user info");
    }

    return response.data;
  },

  /**
   * 更新用户的显示货币设置 (currency_fiat字段)
   * @param currency 显示货币代码
   */
  async updateUserDisplayFiat(currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/User/updateCurrency", { currency_fiat: currency });
    return response.data;
  },

  /**
   * 更新用户的结算货币设置 (currency字段)
   * @param currency 结算货币代码
   */
  async updateUserSettlementCurrency(currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/User/updateCurrency", { currency: currency });
    return response.data;
  },

  /**
   * 更新用户语言设置
   * @param language 语言代码
   *
   */
  async updateUserLanguage(language: string): Promise<void> {
    await authAxiosInstance.post("/User/updateUser", { language_code: language });
  },

  /**
   * 发送密码重置验证码
   * @param username 邮箱或手机号
   * @param hcaptchaToken hCaptcha验证令牌
   */
  async sendPasswordResetCode(data: any): Promise<void> {
    const response = await publicAxiosInstance.post("/authentication/forgetPasswordToSendCode", data);

    if (response.data.code !== 0) {
      const error: Error & { code?: number; responseData?: any } = new Error(
        response.data.msg || "Failed to send reset code"
      );
      error.code = response.data.code;
      error.responseData = response.data;
      throw error;
    }
  },

  /**
   * 重置密码
   * @param emailOrPhone 邮箱或手机号
   * @param verificationCode 验证码
   * @param newPassword 新密码
   */
  async resetPassword(emailOrPhone: string, verificationCode: string, newPassword: string): Promise<any> {
    const response = await publicAxiosInstance.post("/Authentication/resetPassword", {
      username: emailOrPhone,
      code: verificationCode,
      password: newPassword
    });
    return response.data;
    // if (response.data.code !== 0) {
    //   throw new Error(response.data.msg || "Failed to reset password");
    // }
  },

  /**
   * 获取数字货币的充值地址
   */
  async getCryptoDepositAddress(network: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserWallet", { network });
    return response.data;
  },

  /**
   * Get supported crypto withdraw gateways
   */
  async getSupportedCryptoWithdrawGateways(currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/PaymentGateway/getWithdrawCryptoGatewayList`, {
      params: { currency }
    });
    return response.data;
  },

  /**
   * Get supported fiat deposit gateways
   */
  async getSupportedFiatDepositGateways(currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/PaymentGateway/getFiatGatewayList", { currency });
    return response.data;
  },

  /**
   * Get supported crypto deposit gateways
   */
  async getSupportedCryptoDepositGateways(currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/PaymentGateway/getCryptoGatewayList`, {
      params: { currency }
    });
    return response.data;
  },

  // 获取法币提款网关的必填项
  async getFiatGatewayWithdrawParams(gateway_id: string, pay_bankcode: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/PaymentGateway/getFiatGatewayWithdrawParamsV2", {
      gateway_id,
      pay_bankcode
    });
    return response.data;
  },

  /**
   * 获取用户余额
   */
  async getUserBalance(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/UserBalance/indexTimer");
    return response.data;
  },

  /**
   * 获取当前用户是否有待领取的Bonus
   * @params item: cashback | rakeback | tournament | referral | group
   */
  async getClaimBonus(item: "cashback" | "rakeback" | "tournament" | "referral" | "group" | "level_up" | "vip_bonus_lucky_number_seven"): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Claim/index", {
      params: { item }
    });
    return response.data;
  },

  /**
   * Create a fiat deposit order
   */
  async createFiatDepositOrder(params: Record<string, any>): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserDeposit/fiat_deposit", params);
    return response.data;
  },

  /**
   * Get the required fields for a fiat deposit order
   */
  async getFiatGatewayDepositParams(gateway_id: string, pay_bankcode: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/PaymentGateway/getFiatGatewayDepositParamsV2", {
      gateway_id,
      pay_bankcode
    });
    return response.data;
  },

  /**
   * Get user balance extension
   */
  async getUserBalanceExtension(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/UserBalanceExtension");
    return response.data;
  },

  // 创建法币取款订单
  async createWithdrawFiatOrder(params: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserWithdraw/fiat_withdraw", params);
    return response.data;
  },

  /**
   * 获取用户bonus 领取详细记录
   */
  async getUserClaimBonus(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Claim/bonusDetailsV2");
    return response.data;
  },

  /**
   * 领取bonus
   * @param item - bonus类型 (必填)
   * @param currency - 货币类型 (可选)
   */
  async claimBonus(item: string, currency?: string): Promise<ApiResponse<any>> {
    const params: Record<string, any> = { item };
    if (currency) {
      params.currency = currency;
    }
    const response = await authAxiosInstance.post("/Claim/claim", params);
    return response.data;
  },

  async getConquestsCompleted(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Conquest/getConquestCompleted");
    return response.data;
  },

  async getConquestsReward(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Conquest/getConquestReward");
    return response.data;
  },

  async claimConquest(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Conquest/claimConquest");
    return response.data;
  },

  /**
   * 获取征服任务列表
   */
  async getConquestList(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Conquest/index");
    return response.data;
  },

  /**
   * 获取日历奖励数据
   */
  async getCalendarBonus(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Calendar/index");
    return response.data;
  },

  /**
   * 领取日历奖励
   */
  async claimCalendarBonus(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Calendar/claim");
    return response.data;
  },

  /**
   * 启动游戏 V2
   */
  async launchGameV2(params: {
    inner_game_id: string;
    game_provider: string;
    game_currency: string;
    lang: string;
    name_key?: string;
    home_url?: string;
    close_url?: string;
    deposit_url?: string;
    history_url?: string;
    is_support_demo_game?: string;
  }): Promise<
    ApiResponse<string> & {
    launch_type: "url" | "html";
  }
  > {
    const response = await authAxiosInstance.post("/Game/playV2", params);
    return response.data;
  },

  /**
   * 启动试玩游戏（需要登录）
   */
  async launchDemoGame(params: {
    inner_game_id: string;
    game_provider: string;
    game_currency: string;
    lang: string;
    name_key?: string;
    home_url?: string;
    close_url?: string;
    deposit_url?: string;
    history_url?: string;
  }): Promise<
    ApiResponse<string> & {
    launch_type: "url" | "html";
  }
  > {
    const response = await authAxiosInstance.post("/Game/playDemo", params);
    return response.data;
  },

  /**
   * 检查游戏是否支持演示模式
   */
  async checkDemoSupport(params: {
    inner_game_id: string;
    game_provider: string;
    game_currency?: string;
    lang?: string;
    name_key?: string;
  }): Promise<
    ApiResponse<{
      support_demo: boolean;
      inner_game_id: string;
      game_provider: string;
      game_name: string;
    }>
  > {
    const response = await authAxiosInstance.get("/Game/isSupportDemo", { params });
    return response.data;
  },

  /**
   * 获取用户游戏默认货币
   */
  async getUserDefaultCurrency(params: { inner_game_id: string }): Promise<
    ApiResponse<{
      default_currency: string;
    }>
  > {
    const response = await authAxiosInstance.post("/GameList/getUserDefaultCurrency", params);
    return response.data;
  },

  /**
   * 收藏/取消收藏游戏 V2
   * @param inner_game_id 内部游戏ID
   */
  async likeGameV2(inner_game_id: string): Promise<
    ApiResponse<{
      action: "added" | "removed";
      is_favorite: boolean;
    }>
  > {
    const response = await authAxiosInstance.post("/Game/likeV2", { inner_game_id });
    return response.data;
  },

  /*
   * Create a swap order
   */
  async createSwapOrder(params: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserSwap/new", params);
    return response.data;
  },

  async getUserBetHistory(params: BetHistoryQueryParams): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/GameOrder/getBetHistoryV4", params);
    return response.data;
  },

  async getUserSportsBetHistory(params: BetHistoryQueryParams): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/GameOrder/getBetHistoryV4", params);
    return response.data;
  },

  // 用户存款记录
  async getUserDepositOrders(query?: Record<string, any>): Promise<ApiResponse<any>> {
    const endpoint = query ? `/UserDeposit?${new URLSearchParams(query)}` : "/UserDeposit";
    const response = await authAxiosInstance.get(endpoint);
    return response.data;
  },

  // 用户取款记录
  async getUserWithdrawOrders(query?: Record<string, any>): Promise<ApiResponse<any>> {
    const endpoint = query ? `/UserWithdraw?${new URLSearchParams(query)}` : "/UserWithdraw";
    const response = await authAxiosInstance.get(endpoint);
    return response.data;
  },

  // 获取数字货币提款钱包地址
  async getUserWithdrawWallet(network?: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/UserWithdrawWallet${network ? `?network=${network}` : ""}`);
    return response.data;
  },

  // 添加数字货币钱包收款地址
  async addUserWithdrawWallet(params: Record<string, any>): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserWithdrawWallet/new", params);
    return response.data;
  },

  // 删除数字货币钱包收款地址
  async deleteUserWithdrawWallet(network: string, address: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/UserWithdrawWallet/delete?network=${network}&address=${address}`);
    return response.data;
  },

  // 创建数字货币取款订单
  async createWithdrawCryptoOrder(params: Record<string, any>): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserWithdraw/new", params);
    return response.data;
  },

  /**
   * 根据用户Free Spin记录获取游戏详情列表
   */
  async getUserFreeGameRecords(
    data: { page?: number; page_size?: number } = {
      page: 1,
      page_size: 20
    }
  ): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/FreeSpin/getGameDetailsByUserFreeSpinRecord", {
      page: 1,
      page_size: 20,
      ...data
    });
    return response.data;
  },

  /**
   * 激活用户的rakeback加速器
   */
  async activateBooster(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Claim/activateBooster");
    return response.data;
  },

  async getTopWageredGames(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/GameList/getTopWageredGamesV2");
    return response.data;
  },

  async getUserGameList(params: UserGameListParams): Promise<UserGameListResponse> {
    const response = await authAxiosInstance.get<UserGameListResponse>("/GameList/getUserGameListV2", {
      params
    });
    return response.data;
  },

  /**
   * 获取 Tournament 列表（需登录）
   */
  async getTournamentList(data: Record<string, any> = {}): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Tournament/getTournamentList", data);
    return response.data;
  },

  /**
   * 获取 Tournament 排行榜
   */
  async getTournamentLeaderboard(params: {
    tournament_id: string;
    tournament_level: string;
    limit?: number;
    page?: number;
    last_id?: string;
    last_wagered?: string;
  }): Promise<ApiResponse<any>> {
    const filteredParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, v]) => v != null && v !== "")
    );
    const response = await authAxiosInstance.post("/Tournament/getTournamentLeaderboard", filteredParams);
    return response.data;
  },

  async getTournamentPoolPrize(params: TournamentPoolPrizeParams): Promise<ApiResponse<number>> {
    const response = await authAxiosInstance.post<ApiResponse<number>>("/Tournament/getPoolPrizeTimer", params);

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get tournament pool prize");
    }

    return response.data;
  },

  async getDefaultAdTag(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/AdTag/getDefault");
    return response.data;
  },

  /**
   * 获取当前用户的成就列表
   * @params sort: 'asc' | 'desc' - 排序方式
   */
  async getUserAchievements(sort: "asc" | "desc" = "asc"): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Achievement/index", {
      params: { sort }
    });
    return response.data;
  },

  async getUserAchievementsV2(sort: "asc" | "desc" = "asc"): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Achievement/indexV2", {
      params: { sort }
    });
    return response.data;
  },

  /**
   * 获取当前用户已参与的成就记录
   */
  async getMyAchievements(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Achievement/myAchievement");
    return response.data;
  },

  async getVipConfig(level?: number): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/VipConfig/index${level ? `?vip=${level}` : ""}`);
    return response.data;
  },

  async changePassword(params: Record<string, any>): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Personal/changePassword", params);
    return response.data;
  },

  async setTmaPassword(params: { username: string; password: string }): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Personal/setTmaPassword", params);
    return response.data;
  },

  /**
   * 获取最早的待处理Free Spin记录
   */
  async getEarliestPendingRecord(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/FreeSpin/getEarliestPendingRecord");
    return response.data;
  },

  /**
   * 领取Free Spin奖励
   */
  async claimFreeSpinReward(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/FreeSpin/claimReward", data);
    return response.data;
  },

  /**
   * 获取支持的Free Spin游戏列表
   */
  async getSupportedFreeSpinGames(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/FreeSpin/getSupportedGamesV1", data);
    return response.data;
  },

  /**
   * 取消Free Spin记录
   */
  async cancelFreeSpinRecord(recordId: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post(`/FreeSpin/cancelFreeSpinRecord?record_id=${recordId}`);
    return response.data;
  },

  /**
   * 启用Free Spin记录
   */
  async enableFreeSpinRecord(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/FreeSpin/enableRecordV1", data);
    // const response = await authAxiosInstance.post("/FreeSpin/enableRecord", data);
    return response.data;
  },

  /**
   * 获取活跃的Free Spin记录
   */
  async getActiveFreeSpinRecords(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/FreeSpin/getActiveRecords", data);
    return response.data;
  },

  /**
   * 发送邮箱验证码
   */
  async sendEmailCode(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Personal/sendEmailCode", data);
    return response.data;
  },

  /**
   * 当前账号绑定邮箱
   */
  async bindEmail(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Personal/bindEmail", data);
    return response.data;
  },

  /**
   * 获取推荐列表
   */
  async getReferralList(params: GetReferralListParams): Promise<ReferralListResponse> {
    const response = await authAxiosInstance.post<ReferralListResponse>("/RewardReferUnlockLog/getReferralList", params);

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get referral list");
    }

    return response.data;
  },

  /**
   * 获取广告标签列表（Campaigns）
   */
  async getAdTagList(): Promise<AdTagListResponse> {
    const response = await authAxiosInstance.get<AdTagListResponse>("/AdTag");

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get ad tag list");
    }

    return response.data;
  },

  async setDefaultAdTag(params: SetDefaultAdTagParams): Promise<SetDefaultAdTagResponse> {
    const response = await authAxiosInstance.post("/AdTag/setDefault", params);
    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to set default ad tag");
    }

    return response.data;
  },

  /**
   * 发送手机验证码
   */
  async sendMobileCode(data: any): Promise<ReferralListResponse> {
    const response = await authAxiosInstance.post("/Personal/sendMobileCode", data);
    return response.data;
  },

  /**
   * 创建广告标签（Campaign）
   */
  async createAdTag(params: CreateAdTagParams): Promise<ApiResponse<AdTag>> {
    const response = await authAxiosInstance.post<ApiResponse<AdTag>>("/AdTag/create", params);

    if (response.data.code !== 0) {
      const { data, msg } = response.data;
      const errorMessage = (typeof data === "string" && data) || msg || "Failed to create ad tag";
      throw new Error(errorMessage);
    }

    return response.data;
  },

  /**
   * 获取佣金记录列表
   */
  async getCommissionList(params: GetCommissionListParams): Promise<CommissionListResponse> {
    const response = await authAxiosInstance.get<CommissionListResponse>("/RewardGroupLog/myList", {
      params
    });

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get commission list");
    }

    return response.data;
  },

  /**
   * 获取推荐奖励记录列表
   */
  async getReferralRewardsList(params: GetReferralRewardsListParams): Promise<ReferralRewardsListResponse> {
    const response = await authAxiosInstance.post<ReferralRewardsListResponse>("/RewardReferUnlockLog/getReferralRewardListTotal", params);

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get rewards list");
    }

    return response.data;
  },

  /**
   * 当前账号绑定手机号
   */
  async bindMobile(data: any): Promise<ReferralListResponse> {
    const response = await authAxiosInstance.post("/Personal/bindMobile", data);
    return response.data;
  },

  /**
   * 获取通知消息
   */
  async getNotificationMessage(data: any): Promise<any> {
    const response = await authAxiosInstance.post("/NotificationMessage/getMessageV1", data);
    return response.data;
  },

  async setNotificationMessageRead(data: any): Promise<any> {
    const response = await authAxiosInstance.post(`/NotificationMessage/readV1?ids=${data?.ids}`);
    return response.data;
  },

  async updateWithdrawalPin(data: any): Promise<any> {
    const response = await authAxiosInstance.post("/user/updatePin", data);
    return response.data;
  },

  async getUserBonusRecords(query?: Record<string, any>): Promise<ApiResponse<any>> {
    const endpoint = query ? `/UserBonus?${new URLSearchParams(query)}` : "/UserBonus";
    const response = await authAxiosInstance.get(endpoint);
    return response.data;
  },

  async getUserSwapRecords(query?: Record<string, any>): Promise<ApiResponse<any>> {
    const endpoint = query ? `/UserSwap?${new URLSearchParams(query)}` : "/UserSwap";
    const response = await authAxiosInstance.get(endpoint);
    return response.data;
  },

  async getBonusWalletRecords(query?: Record<string, any>): Promise<ApiResponse<any>> {
    const endpoint = query ? `/BonusWallet/transactionsList?${new URLSearchParams(query)}` : "/BonusWallet/transactionsList";
    const response = await authAxiosInstance.get(endpoint);
    return response.data;
  },

  async getUserReferralRecords(query?: Record<string, any>): Promise<ApiResponse<any>> {
    const searchParams = query ? new URLSearchParams(query) : undefined;
    const endpoint = searchParams && Array.from(searchParams.keys()).length > 0
      ? `/ClaimLog/index?${searchParams.toString()}`
      : "/ClaimLog/index";
    const response = await authAxiosInstance.get(endpoint);
    return response.data;
  },

  async getUserCommissionRecords(query?: Record<string, any>): Promise<ApiResponse<any>> {
    const searchParams = query ? new URLSearchParams(query) : undefined;
    const endpoint = searchParams && Array.from(searchParams.keys()).length > 0
      ? `/ClaimLog/index?${searchParams.toString()}`
      : "/ClaimLog/index";
    const response = await authAxiosInstance.get(endpoint);
    return response.data;
  },

  async getUserRolloverRecords(params: Record<string, any>): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserDeposit/rollover", params);
    return response.data;
  },

  async updateUser(data: any): Promise<any> {
    const response = await authAxiosInstance.post("/User/updateUser", data);
    return response.data;
  },

  async uploadPublicImage(data: any): Promise<any> {
    const response = await authAxiosInstance.post("/Images/uploadPublic", data);
    return response.data;
  },

  async uploadPrivateImage(data: any): Promise<any> {
    const response = await authAxiosInstance.post("/Images/uploadPrivate", data);
    return response.data;
  },

  async updateKyc(data: any): Promise<any> {
    const response = await authAxiosInstance.post("/UserKyc/update", data);
    console.log(response);
    return response.data;
  },

  async getKycDetail(): Promise<any> {
    const response = await authAxiosInstance.get("/UserKyc/getDetail");
    return response.data;
  },

  async getCurrentPromo(): Promise<any> {
    const response = await authAxiosInstance.get("/Promo/getCurrentPromo");
    return response.data;
  },

  async checkDetailPromo(): Promise<any> {
    const response = await authAxiosInstance.get("/Promo/checkDetailPromo");
    return response.data;
  },

  async donDeal(don_record_id: string): Promise<any> {
    const response = await authAxiosInstance.post("/Don/deal", { don_record_id });
    return response.data;
  },

  async checkDonPromo(don_record_id: string): Promise<any> {
    const response = await authAxiosInstance.post("/Promo/checkDonPromo", { don_record_id });
    return response.data;
  },

  async getUserWithdrawInfo(currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/UserWithdrawInfo/getUserWithdrawInfo?currency=${currency}`);
    return response.data;
  },

  async addUserWithdrawInfo(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserWithdrawInfo/addUserWithdrawInfo", data);
    return response.data;
  },

  async getSupportedFiatWithdrawGatewaysV2(currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/PaymentChannelClass/getWithdrawChannelClassList?currency=${currency}`);
    return response.data;
  },

  async getSupportedFiatWithdrawGatewaysV1(currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/PaymentGateway/getWithdrawFiatGatewayList?currency=${currency}`);
    return response.data;
  },

  async getReferralDetail(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/RewardReferUnlockLog/getReferralDetail", data);
    return response.data;
  },

  async getRewardGroupLogDetail(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/RewardGroupLog/detail", data);
    return response.data;
  },

  async getReferralRewardDetail(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/RewardReferUnlockLog/getReferralRewardListTotalDetail", data);
    return response.data;
  },

  async setUserWithdrawInfoDefaultById(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserWithdrawInfo/setUserWithdrawInfoDefaultById", data);
    return response.data;
  },

  async deleteUserWithdrawInfo(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserWithdrawInfo/deleteUserWithdrawInfo", data);
    return response.data;
  },

  async createWithdrawFiatOrderV2(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserWithdraw/fiat_withdraw_V2", data);
    return response.data;
  },

  async getSupportedCurrencyV2(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Currency/index_V2");
    return response.data;
  },

  async getPromoByPage(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Promo/getPromoByPage", data);
    return response.data;
  },

  async getPromoByPageV2(data?: any): Promise<any> {
    const response = await authAxiosInstance.post("/Promo/getPromoByPage2", data);
    return response.data;
  },

  async choicePromo(data: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Promo/choicePromo", data);
    return response.data;
  },

  /**
   * 钱包设置中的法币列表
   */
  async getWalletSettingsCurrency(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Currency/walletSettingsCurrency");
    return response.data;
  },

  async claimAchievementBonus(reward_achievement_log_id: number): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Achievement/claim", { reward_achievement_log_id });
    return response.data;
  },

  /*
* 统计可以提取的赏金分类个数
* */
  async getClaimCount() {
    const response = await authAxiosInstance.get("/claim/getClaimCount");
    return response.data;
  },

  async getMondayVipBonus(): Promise<any> {
    const response = await authAxiosInstance.get("/MondayVipBonus/index");
    return response.data;
  },

  async claimMondayVipBonus(id: any): Promise<any> {
    const response = await authAxiosInstance.post("/MondayVipBonus/claim", { id });
    return response.data;
  },

  async bonusSwitch() {
    const response = await authAxiosInstance.get("/branch/bonusSwitch");
    return response.data;
  },

  async hasMysteryBox() {
    const response = await authAxiosInstance.get("/Claim/hasMysteryBox");
    return response.data;
  },

  async getPaymentIcons() {
    const response = await authAxiosInstance.get("/PaymentGateway/getPaymentIcons");
    return response.data;
  },

  async getPaymentGatewayByUser() {
    const response = await authAxiosInstance.get("/PaymentGateway/getPaymentIconsByUser");
    return response.data;
  },

  // 周六充值奖励激活
  async userAddSundayBonus() {
    const response = await authAxiosInstance.post("/Promo/addSundayBonus");
    return response.data;
  },

  // 周四充值奖励激活
  async userAddThursdayBonus() {
    const response = await authAxiosInstance.post("/Promo/addThursdayBonus");
    return response.data;
  },

  async getBanGameList(currency: string) {
    const response = await authAxiosInstance.get(`/GameList/getBanGameList?currency=${currency}`);
    return response.data;
  },

  // 获取彩金账户信息
  async getBonusWallet(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/BonusWallet/index`);
    return response.data;
  },

  // 激活彩金账户
  async activeBonusWallet(id: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/BonusWallet/setClaimStatus?id=${id}`);
    return response.data;
  },

  // 提取彩金账户收益
  async claimBonusWallet(id: string, currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/BonusWallet/claim?id=${id}&claim_currency=${currency}`);
    return response.data;
  },

  // 彩金币种失效的时候用户应该设置为哪个结算币
  async getCurrencyOtherThanBonusCoin(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/Currency/userDefaultCurrency");
    return response.data;
  },

  // 选择彩金类型
  async userActiveBonusWallet(bonus: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/BonusWallet/welcomeBonus?bonus_wallet_name=${bonus}`);
    return response.data;
  },

  // 彩金类型列表
  async getBonusConfigList(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/BonusWallet/purchaseConfigList");
    return response.data;
  },

  // 用户放弃彩金
  async userAbandonBonus(id: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/BonusWallet/abandonBonus?id=${id}`);
    return response.data;
  },

  // 用户彩金操作记录
  async userBonusLatestHistory(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/BonusWallet/latestHistoryData`);
    return response.data;
  },

  // 用户今日首冲次数
  async getTodayDepositCount(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/Promo/getUtcTodayDepositCount`);
    return response.data;
  },

  // 用户获取优惠码
  async userClaimPromoCode(promo_code: string, device_id: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post(`/PromoCode/claim`, { promo_code, device_id });
    return response.data;
  },

  // 获取用户最近的锦标赛信息
  async getUserLastTournamentInfo(tournament_id: any): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/Tournament/getUserLastTournamentInfo`, {
      params: {
        tournament_id
      }
    });
    return response.data;
  },

  // 用户购买彩金
  async userPurchaseBonus(purchase_amount: string, purchase_currency: string, bonus_config_id: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post(`/BonusWallet/purchase`, {
      purchase_amount,
      purchase_currency,
      bonus_config_id
    });
    return response.data;
  },

  // 获取最近锦标赛排行榜
  async getLastTournamentLeaderboard(tournament_id: string, page: number, limit: number): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/Tournament/getLastTournamentLeaderboard`, {
      params: {
        tournament_id,
        page,
        limit
      }
    });
    return response.data;
  },

  // 获取用户彩金记录
  async getBonusWalletHistory(params: {
    page: number;
    limit: number;
    status: string;
    last_id?: string;
  }): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/BonusWallet/historyList?limit=${params.limit}&page=${params.page}&last_id=${params.last_id}&status=${params.status}`);
    return response.data;
  },

  // ========== Sports Bonus Wallet（独立于 slots BonusWallet）==========

  // 获取体育彩金账户信息
  async getSportsBonusWallet(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/SportsBonusWallet/index`);
    return response.data;
  },

  // 体育彩金类型列表
  async getSportsBonusConfigList(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/SportsBonusWallet/purchaseConfigList");
    return response.data;
  },

  // 体育彩金禁区判断(按请求 IP 所在区域)
  async getSportsBonusIsRegionBanned(): Promise<ApiResponse<{ is_region_banned: 0 | 1 }>> {
    const response = await authAxiosInstance.get("/SportsBonusWallet/isRegionBanned");
    return response.data;
  },

  // 用户购买体育彩金
  async userPurchaseSportsBonus(purchase_amount: string, purchase_currency: string, bonus_config_id: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post(`/SportsBonusWallet/purchase`, {
      purchase_amount,
      purchase_currency,
      bonus_config_id
    });
    return response.data;
  },

  // 提取体育彩金账户收益
  async claimSportsBonusWallet(id: string, currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/SportsBonusWallet/claim?id=${id}&claim_currency=${currency}`);
    return response.data;
  },

  // 用户放弃体育彩金
  async userAbandonSport(id: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/SportsBonusWallet/abandonBonus?id=${id}`);
    return response.data;
  },

  // 体育彩金最近操作记录
  async userSportsBonusLatestHistory(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/SportsBonusWallet/latestHistoryData`);
    return response.data;
  },

  // 体育彩金完整记录
  async getSportsBonusWalletHistory(params: {
    page: number;
    limit: number;
    status: string;
    last_id?: string;
  }): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/SportsBonusWallet/historyList?limit=${params.limit}&page=${params.page}&last_id=${params.last_id}&status=${params.status}`);
    return response.data;
  },

  // 体育彩金购买/领取流水(Transactions 页面用)
  async getSportsBonusWalletRecords(query?: Record<string, any>): Promise<ApiResponse<any>> {
    const endpoint = query
      ? `/SportsBonusWallet/transactionsList?${new URLSearchParams(query)}`
      : "/SportsBonusWallet/transactionsList";
    const response = await authAxiosInstance.get(endpoint);
    return response.data;
  },

  // 球游戏 -> 球游戏的主页信息
  async userBuddyBallsHome(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/BuddyBalls/index`);
    return response.data;
  },

  // BuddyBalls
  async getBuddyBalls(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/BuddyBalls/index`);
    return response.data;
  },

  // BuddyBalls/dailyCheckin
  async dailyCheckin(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post(`/BuddyBalls/dailyCheckin`);
    return response.data;
  },


  // BuddyBalls/checkInHistory
  async checkInHistory(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/BuddyBalls/checkInHistory`);
    return response.data;
  },
  // 球游戏 -> 提取球游戏的奖励
  async userBuddyBallsClaim(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post(`/BuddyBalls/claim`);
    return response.data;
  },

  // 球游戏 -> 球的消耗记录
  async getBuddyBallsPlayList(params: {
    page?: number;
    limit?: number;
    last_id?: string;
  }): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/BuddyBalls/playList", { params });
    return response.data;
  },

  // 球游戏 -> 收益提取操作记录
  async getBuddyBallsClaimList(params: {
    page?: number;
    limit?: number;
    last_id?: string;
  }): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/BuddyBalls/claimList", { params });
    return response.data;
  },

  // 球游戏 -> 签到来获取球游戏的球
  async userBuddyBallsDailyCheck(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/BuddyBalls/dailyCheckIn`);
    return response.data;
  },

  // 球游戏 -> 获取BuddyBalls玩球数据
  async getBuddyBallsPlay(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post<ApiResponse<any>>("/BuddyBalls/play");
    /*if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get game baddy balls play");
    }*/
    return response.data;
  },
  // 球游戏 -> 获取BuddyBalls球数量
  async getBuddyBallsCount(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/BuddyBalls/index");
    return response.data;
  },

  // 幸运盘 -> 主页信息
  async userLuckySpinHome(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/LuckySpin/index");
    return response.data;
  },

  // 幸运盘 -> 用户抽奖
  async userLuckySpinLottery(type: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/LuckySpin/lottery", { type });
    return response.data;
  },

  // 幸运盘 -> 奖池详情接口
  async getPoolPrizeList(type: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/LuckySpin/getPoolPrizeList?type=${type}`);
    return response.data;
  },

  // 幸运盘 -> 我的中奖列表接口
  async getUserSpinWinList(params: {
    page: number;
    limit: number;
    sort_type: string;
  }): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`LuckySpin/myWinList?limit=${params.limit}&page=${params.page}&sort_type=${params.sort_type}`);
    return response.data;
  },

  // 幸运盘 -> 用户的抽奖机会获得
  async getUserSpinChance(params: {
    page: number;
    limit: number;
  }): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`LuckySpin/chanceList?limit=${params.limit}&page=${params.page}`);
    return response.data;
  },

  // 幸运盘 -> 所有人中奖列表接口
  async getAllSpinWinList(params: {
    page: number;
    limit: number;
    sort_type: string;
  }): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`LuckySpin/winList?limit=${params.limit}&page=${params.page}&sort_type=${params.sort_type}`);
    return response.data;
  },

  // TODO: 法币存款通道分类支持
  async getDepositChannelClassList(currency: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get(`/PaymentChannelClass/getDepositChannelClassList?currency=${currency}`);
    return response.data;
  },
  // 球游戏 -> 获取球袋倍率配置
  async buddyBallConfigList(): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.get("/BuddyBalls/buddyBallConfigList");
    return response.data;
  },

  /**
   * 上传玩家分享图片（Big Win / Mega Win 等）
   * @param file 图片文件（jpg/png/jpeg/gif，≤2MB）
   * @param imageType 图片类型，如 'Big Win' / 'Mega Win' / 'Super Mega Win'
   */
  async uploadShareImage(file: File, imageType: string): Promise<ApiResponse<{
    number: number;
    image_url: string;
  }>> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("image_type", imageType);
    const response = await authAxiosInstance.post("/Images/uploadShareImage", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  }
};
