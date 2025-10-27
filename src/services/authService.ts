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
  ReferralRewardsListResponse
} from "@/types/referral";

export const authService = {
  async signIn(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await publicAxiosInstance.post<LoginResponse>("/Authentication/login", credentials);

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Login failed");
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
      throw new Error(response.data.msg || "Sign up failed");
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
  async sendPasswordResetCode(username: string, hcaptchaToken: string): Promise<void> {
    const response = await publicAxiosInstance.post("/authentication/forgetPasswordToSendCode", {
      username,
      hcaptcha_token: hcaptchaToken
    });

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to send reset code");
    }
  },

  /**
   * 重置密码
   * @param emailOrPhone 邮箱或手机号
   * @param verificationCode 验证码
   * @param newPassword 新密码
   */
  async resetPassword(emailOrPhone: string, verificationCode: string, newPassword: string): Promise<void> {
    const response = await publicAxiosInstance.post("/Authentication/resetPassword", {
      username: emailOrPhone,
      code: verificationCode,
      password: newPassword
    });

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to reset password");
    }
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
    const response = await authAxiosInstance.post("/PaymentGateway/getFiatGatewayWithdrawParams", {
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
  async getClaimBonus(item: "cashback" | "rakeback" | "tournament" | "referral" | "group"): Promise<ApiResponse<any>> {
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
    const response = await authAxiosInstance.post("/PaymentGateway/getFiatGatewayDepositParams", {
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
    const response = await authAxiosInstance.get("/Claim/bonusDetails");
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
    const response = await authAxiosInstance.post("/GameOrder/getBetHistoryV2", params);
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
  async deleteUserWithdrawWallet(id: string): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserWithdrawWallet/delete", { id });
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
    tournament_id: number;
    tournament_level: string;
    limit?: number;
    page?: number;
    last_id?: number | string;
    last_wagered?: string;
  }): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/Tournament/getTournamentLeaderboard", params);
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
    const response = await authAxiosInstance.post("/FreeSpin/getSupportedGames", data);
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
    const response = await authAxiosInstance.post("/FreeSpin/enableRecord", data);
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
      throw new Error(response.data.msg || "Failed to create ad tag");
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
    const response = await authAxiosInstance.post('/NotificationMessage/getMessage', data);
    return response.data;
  },

  async updateWithdrawalPin(data: any): Promise<any> {
    const response = await authAxiosInstance.post('/user/updatePin', data);
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

  async getUserReferralRecords(query?: Record<string, any>): Promise<ApiResponse<any>> {
    const endpoint = query ? `/RewardReferUnlockLog/myList?${new URLSearchParams(query)}` : "/RewardReferUnlockLog/myList";
    const response = await authAxiosInstance.get(endpoint);
    return response.data;
  },

  async getUserCommissionRecords(query?: Record<string, any>): Promise<ApiResponse<any>> {
    const endpoint = query ? `/RewardGroupLog/myList?${new URLSearchParams(query)}` : "/RewardGroupLog/myList";
    const response = await authAxiosInstance.get(endpoint);
    return response.data;
  },

  async getUserRolloverRecords(params: Record<string, any>): Promise<ApiResponse<any>> {
    const response = await authAxiosInstance.post("/UserDeposit/rollover", params);
    return response.data;
  },

  async updateUser(data: any): Promise<any> {
    const response = await authAxiosInstance.post('/User/updateUser', data);
    return response.data;
  },

  async uploadPublicImage(data: any): Promise<any> {
    const response = await authAxiosInstance.post('/Images/uploadPublic', data);
    return response.data;
  },

  async uploadPrivateImage(data: any): Promise<any> {
    const response = await authAxiosInstance.post('/Images/uploadPrivate', data);
    return response.data;
  },

  async updateKyc(data: any): Promise<any> {
    const response = await authAxiosInstance.post('/UserKyc/update', data);
    console.log(response);
    return response.data;
  },

  async getKycDetail(): Promise<any> {
    const response = await authAxiosInstance.get('/UserKyc/getDetail');
    return response.data;
  },

  async getCurrentPromo(): Promise<any> {
    const response = await authAxiosInstance.get('/Promo/getCurrentPromo');
    return response.data;
  },

  async checkDetailPromo(): Promise<any> {
    const response = await authAxiosInstance.get('/Promo/checkDetailPromo');
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
  }
};
