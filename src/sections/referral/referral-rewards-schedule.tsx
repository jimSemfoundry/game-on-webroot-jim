import { useAuth } from "@/contexts/AuthContext.tsx";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useVipConfig } from "@/hooks/api/usePublic";
import { cn } from "@/utils/cn";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useReferralLink } from "@/hooks/useReferralLink.ts";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 17;

export const ReferralRewardsSchedule = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation(['referral', 'bonus', 'common']);
  const { data: vipConfigData, isLoading } = useVipConfig();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const [currentPage, setCurrentPage] = useState(1);

  const { referralLink } = useReferralLink()
  const hasShareableLink = /^https?:\/\//i.test(referralLink);

  const filteredVipConfig = useMemo(() => {
    if (!vipConfigData?.data) return [];
    return (vipConfigData.data as any[]).filter((item) => Number(item.referral) !== 0);
  }, [vipConfigData]);

  const totalPages = Math.ceil(filteredVipConfig.length / ITEMS_PER_PAGE);
  const paginatedData = filteredVipConfig.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const handleShare = async () => {
    if (!hasShareableLink) {
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: t("referral:spreadTheLove"),
          url: referralLink,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(referralLink);
    } catch {
      toast.error(t("common:error", "Something went wrong. Please try again."));
    }
  };

  return (
    <div className="flex flex-col">
      <div className="bg-base-200 flex flex-col gap-4 rounded-t-field p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 2.5L12.5 7.5L18 8.25L14 12.125L15 17.5L10 14.875L5 17.5L6 12.125L2 8.25L7.5 7.5L10 2.5Z"
              fill="currentColor"
              className="text-primary"
            />
          </svg>
          <h2 className="text-base sm:text-lg font-bold">{t("referral:referralRewardsAreEasy")}</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-start gap-3 flex-1 bg-base-300 rounded-field p-4">
            <img
              src="/images/illustrations/7d50d163ead34c96241165543db56f80358be8df.png"
              alt="Gather your crew"
              className="w-20 h-20 sm:w-25 sm:h-25 flex-shrink-0"
            />
            <div className="flex flex-col gap-2 min-w-0">
              <h3 className="text-sm sm:text-base font-bold">
                <span>{t("referral:gatherYour")} </span>
                <span className="text-primary">{t("referral:crew")}</span>
              </h3>
              <p className="text-xs sm:text-sm text-base-content/70">{t("referral:gatherYourCrewDescription")}</p>
              {isAuthenticated && (
                <div className="bg-base-300 flex items-center gap-2 rounded-lg px-3 py-2">
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="text-xs sm:text-sm text-base-content/50 truncate">
                      {hasShareableLink ? referralLink : t("referral:loadingLink")}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      void handleShare();
                    }}
                    className="btn btn-primary btn-sm h-8 min-h-0 px-4 rounded-full text-black font-bold"
                    disabled={!hasShareableLink}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M11.0833 4.66667C12.0958 4.66667 12.9167 3.84583 12.9167 2.83333C12.9167 1.82083 12.0958 1 11.0833 1C10.0708 1 9.25 1.82083 9.25 2.83333C9.25 2.96667 9.26667 3.09417 9.29417 3.21583L5.47083 5.67917C5.11667 5.38583 4.67083 5.20833 4.18333 5.20833C3.17083 5.20833 2.35 6.02917 2.35 7.04167C2.35 8.05417 3.17083 8.875 4.18333 8.875C4.67083 8.875 5.11667 8.6975 5.47083 8.40417L9.29417 10.8675C9.26667 10.9892 9.25 11.1167 9.25 11.25C9.25 12.2625 10.0708 13.0833 11.0833 13.0833C12.0958 13.0833 12.9167 12.2625 12.9167 11.25C12.9167 10.2375 12.0958 9.41667 11.0833 9.41667C10.5958 9.41667 10.15 9.59417 9.79583 9.8875L5.97167 7.42417C5.99917 7.30167 6.01667 7.17417 6.01667 7.04167C6.01667 6.90917 5.99917 6.78167 5.97167 6.65917L9.79583 4.19583C10.15 4.48917 10.5958 4.66667 11.0833 4.66667Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="hidden sm:inline">{t("bonus:share")}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 flex-1 bg-base-300 p-4 rounded-field">
            <div className="flex flex-col gap-2 min-w-0 flex-1 order-1 sm:order-0">
              <h3 className="text-sm sm:text-base font-bold">
                <span>{t("referral:crackThe")} </span>
                <span className="text-primary">{t("referral:vault")}</span>
              </h3>
              <p className="text-xs sm:text-sm text-base-content/70">{t("referral:crackTheVaultDescription")}</p>
            </div>
            <img
              src="/images/illustrations/a7639f92ff4e6a20148b23834346d93d2e06ce12.png"
              alt="Crack the Vault"
              className="w-20 h-20 sm:w-27.5 sm:h-27.5 shrink-0"
            />
          </div>
        </div>
      </div>

      <div className="bg-base-200 flex flex-col rounded-b-field">
        <div className="bg-base-200 flex flex-col h-[420px] sm:h-[640px] rounded-b-field pb-3">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <span className="loading loading-spinner loading-xl text-primary"></span>
            </div>
          ) : filteredVipConfig.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <div className="text-center">
                <div className="text-base-content/50 text-sm">{t("common:noData")}</div>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden sm:block flex-1 overflow-y-auto px-4">
                <table className="w-full table-auto text-sm text-base-content border-separate border-spacing-y-1">
                  <thead className="sticky top-0 z-10 bg-base-200 text-xs font-semibold uppercase text-base-content/60">
                    <tr>
                      <th className="px-4 py-3 text-left rtl:text-right">{t("referral:friendLevel")}</th>
                      <th className="px-4 py-3 text-left rtl:text-right">{t("referral:totalExp")}</th>
                      <th className="px-4 py-3 text-right rtl:text-left">{t("referral:unlockedAmount")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item: any, index: number) => (
                      <tr
                        key={item.vip}
                        className={cn(
                          "rounded-lg transition-colors",
                          index % 2 === 0 ? "bg-base-300 hover:bg-base-300/50" : "bg-base-200 hover:bg-base-300/50",
                        )}
                      >
                        <td className="px-4 py-2.5 rounded-l-lg rtl:rounded-l-none rtl:rounded-r-lg min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={`/images/vip/levels/${item.vip}.png`} alt={`VIP ${item.vip}`} className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-semibold text-base-content/50 truncate max-w-full sm:hidden">
                              {t("referral:vip")} {item.vip}
                            </span>
                            <div className="tooltip tooltip-top hidden sm:block min-w-0 max-w-full" data-tip={`${t("referral:vip")} ${item.vip}`}>
                              <span className="text-sm font-semibold text-base-content/50 truncate max-w-full block">
                                {t("referral:vip")} {item.vip}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-base-content/50 font-medium" dir="ltr">
                          {Math.floor(Number(item.xp)).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-right rtl:text-left rounded-r-lg rtl:rounded-r-none rtl:rounded-l-lg">
                          <div className="flex items-center justify-end gap-2 rtl:justify-start rtl:flex-row-reverse">
                            <span className="text-sm font-bold text-primary" dir="ltr">
                              {formatWithConversion(item.referral, "USD", {
                                showSymbol: false,
                                showCode: true,
                                minimizeDecimals: true,
                              }).formatted}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden flex-1 flex flex-col overflow-y-auto px-4 pb-4">
                {/* 表头 */}
                <div className="grid grid-cols-[1fr_0.8fr_1fr] gap-4 px-4 py-3 mb-2">
                  <span className="text-xs font-semibold text-base-content/50 uppercase">{t("referral:userLevel")}</span>
                  <span className="text-xs font-semibold text-base-content/50 uppercase text-center">{t("referral:exp")}</span>
                  <span className="text-xs font-semibold text-base-content/50 uppercase text-right">{t("bonus:rewards")}</span>
                </div>
                
                {/* 表格内容 */}
                <div className="space-y-2">
                  {paginatedData.map((item: any, index: number) => (
                    <div key={item.vip} className={cn("rounded-2xl px-4 py-2.5", index % 2 === 0 ? "bg-base-300/30" : "bg-base-300/50")}>
                      <div className="grid grid-cols-[1fr_0.8fr_1fr] gap-4 items-center">
                        {/* USER LEVEL */}
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={`/images/vip/levels/${item.vip}.png`} alt={`VIP ${item.vip}`} className="w-6 h-6 shrink-0" />
                          <span className="text-xs font-semibold text-base-content/70">
                            {t("referral:vip")} {item.vip}
                          </span>
                        </div>
                        
                        {/* EXP - 居中 */}
                        <div className="text-center">
                          <span className="text-xs text-base-content/60">{Math.floor(Number(item.xp)).toLocaleString()}</span>
                        </div>
                        
                        {/* REWARD - 右对齐 */}
                        <div className="text-right">
                          <span className="text-xs font-bold text-base-content">
                            {
                              formatWithConversion(item.referral, "USD", {
                                showSymbol: true,
                                showCode: false,
                                minimizeDecimals: true,
                              }).formatted
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 sm:gap-2 py-6 px-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-sm btn-ghost btn-square rounded-2xl disabled:opacity-30"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === "number" && setCurrentPage(page)}
                      disabled={page === "..."}
                      className={cn(
                        "btn btn-sm min-w-[2.5rem] rounded-2xl",
                        page === currentPage ? "btn-primary text-black" : "btn-ghost bg-base-300/60 hover:bg-base-300",
                        page === "..." && "btn-ghost cursor-default hover:bg-transparent",
                      )}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="btn btn-sm btn-ghost btn-square rounded-2xl disabled:opacity-30"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
