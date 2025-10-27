import publicAxiosInstance from "@/lib/publicAxios";
import type { ApiResponse } from "@/types/auth";

export const publicService = {
  async getBaseConfig(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get<ApiResponse<any>>("/TelegramBot/baseUrl");
    return response.data;
  },
  async getSupportedLanguages(): Promise<any> {
    const response = await publicAxiosInstance.get<any>("/Language/getLanguageList");

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get supported languages");
    }

    return response.data.data;
  },

  /**
   * 获取最大赢家游戏订单
   * @param lang 语言，默认英文
   * @returns 最大赢家游戏订单
   */
  async getGreatestGameOrder(lang?: string): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get<ApiResponse<any>>("/GameOrderBigWin/binWinList", {
      params: {
        lang: lang || "en",
      },
    });

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get greatest game order");
    }

    return response.data;
  },

  /**
   * 获取所有支持的游戏币列表
   */
  async getSupportedGameCurrencies(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get<ApiResponse<any>>("/Currency/gameCurrency");

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get supported game currencies");
    }

    return response.data;
  },

  /**
   * 获取所有支持的结算币列表
   */
  async getSupportedSettlementCurrencies(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get<ApiResponse<any>>("/Currency");

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get supported settlement currencies");
    }

    return response.data;
  },

  /**
   * 获取所有币汇率
   */
  async getCurrencyExchangeRate(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.post<ApiResponse<any>>("/Config/getByGroupTimer", {
      group: "exchange_rate",
    });

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get currency exchange rate");
    }

    return response.data;
  },

  /**
   * 获取casino首页游戏列表
   */
  async getCasinoHomeGameList(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get<ApiResponse<any>>("/GameList/getGameHomeCacheV3");

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get game list");
    }

    return response.data;
  },

  /**
   * 获取Casino游戏提供商列表
   */
  async getGameProviders(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get<ApiResponse<any>>("/GameProvider/getProviders");

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get game providers");
    }

    return response.data;
  },

  /**
   * 获取Chatwoot Inbox ID
   */
  async getChatwootInboxId(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get<ApiResponse<any>>("/chat/getInboxId");

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get chatwoot inbox id");
    }

    return response.data;
  },

  /**
   * 获取Latest bets
   */
  async getLatestBets(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get<ApiResponse<any>>("/GameOrder/newestV2Timer", {
      params: {
        _t: Date.now(), // 添加时间戳参数强制获取新数据
      },
    });

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get latest bets");
    }

    return response.data;
  },

  /**
   * 获取Greatest bets
   */
  async getGreatestBets(lang?: string): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get<ApiResponse<any>>("/GameOrderBigWin/binWinList", {
      params: {
        _t: Date.now(), // 添加时间戳参数强制获取新数据
        lang: lang || "en",
      },
    });

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get greatest bets");
    }

    return response.data;
  },

  /**
   * 获取Casino游戏列表
   * @param game_category_1 游戏分类
   * @param game_category_2 游戏子分类
   * @param keyword 搜索关键词
   * @param lang 语言
   * @param limit 页大小
   * @param page 页码
   * @param providers 游戏提供商
   * @param sort 排序
   * @param type 游戏类型
   */
  async getCasinoGameList(data: any): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.post<ApiResponse<any>>("/GameList/getCommonGameListV2", data);

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get casino game list");
    }

    return response.data;
  },

  /**
   * 获取游戏详情
   * @param inner_game_id  内部游戏ID
   * @param provider  游戏提供商
   * @param lang  语言
   */
  async getGameDetail(data: any): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.post<ApiResponse<any>>("/GameList/getGameV2", data);

    if (response.data.code !== 0) {
      throw new Error(response.data.msg || "Failed to get game detail");
    }

    return response.data;
  },

  /**
   * Get deposit bonus config
   */
  async getDepositBonusConfig(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get("/DepositBonusConfig/indexTimer");
    return response.data;
  },

  async getGameCategories(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get("/GameCategory/gameCategoryList");
    return response.data;
  },

  async getVipConfig(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get("/VipConfig/index");
    return response.data;
  },

  async getCountryCodeByIp(): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.get("/Authentication/getCountryCodeByIp");
    return response.data;
  },

  async loginByGoogle(data: Record<string, any>, signal?: AbortSignal, headers?: Record<string, any>): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.post("/Authentication/loginByGoogle", data, {
      signal,
      headers,
    });
    return response.data;
  },

  async loginByFacebook(data: Record<string, any>, signal?: AbortSignal, headers?: Record<string, any>): Promise<ApiResponse<any>> {
    const response = await publicAxiosInstance.post("/Authentication/loginByFacebook", data, {
      signal,
      headers,
    });
    return response.data;
  },

  async getSocialList(): Promise<any> {
    const response = await publicAxiosInstance.get("/Authentication/getSocialList");
    return response.data;
  },
};
