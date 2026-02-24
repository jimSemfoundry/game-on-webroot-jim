import Iconify from "@/components/iconify";
import { useAuth } from "@/contexts/AuthContext";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { authService } from "@/services/authService";
import type { CommissionListResponse, CommissionRecord } from "@/types/referral";
import { cn } from "@/utils/cn";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import ReferralMyCommissionsDetails from "./referral-my-commissions-details";

const ITEMS_PER_PAGE = 10;

export const ReferralMyCommissions = () => {
  const { t } = useTranslation(['referral', 'common']);
  const { user } = useAuth();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CommissionRecord | null>(null);

  const { data, isLoading, isFetching } = useQuery<CommissionListResponse>({
    queryKey: ["commissionList", currentPage, user?.id],
    queryFn: () =>
      authService.getCommissionList({
        limit: ITEMS_PER_PAGE,
        page: currentPage,
        up_line: user?.id?.toString(),
      }),
    enabled: !!user,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

  const commissionList = data?.data || [];
  const hasNextPage = commissionList.length === ITEMS_PER_PAGE;

  return (
    <div className="bg-base-200 flex flex-col rounded-field overflow-hidden">
      <div className="flex items-center gap-2 px-4 sm:px-6 py-4">
        <Iconify icon="custom:commission" width={20} height={20} className="text-primary" />
        <h3 className="text-base sm:text-lg font-bold">{t("referral:myReferralCommissions", "My Referral Commissions")}</h3>
      </div>

      {/* 表头 */}
      <div className="grid grid-cols-3 px-4 sm:px-6 py-2 text-xs font-bold uppercase text-base-content/50">
        <div>{t("referral:user")}</div>
        <div className="text-center">{t("referral:type")}</div>
        <div className="text-right">{t("referral:amount")}</div>
      </div>

      <div className={cn("flex flex-col relative", commissionList.length > 0 ? "min-h-[520px]" : "")}>
        {isFetching && (
          <div className="absolute inset-0 bg-base-200/50 backdrop-blur-sm z-20 flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        )}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <span className="loading loading-spinner loading-xl text-primary"></span>
          </div>
        ) : commissionList.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <img
                src="/images/illustrations/no-data.svg"
                alt="No data"
                className="w-32 h-32 sm:w-40 sm:h-40 opacity-50"
              />
              <div className="text-base-content/50 text-sm font-semibold">{t("common:common.noData")}</div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-2 sm:px-4 space-y-1">
              {commissionList.map((item, index) => (
                <div
                  key={`${item.id}-${item.created_at}`}
                  className={cn(
                    "grid grid-cols-3 items-center px-3 py-3 rounded-field cursor-pointer transition-colors",
                    index % 2 === 0 ? "bg-base-300" : "bg-base-200"
                  )}
                  onClick={() => {
                    setSelectedItem(item);
                    setIsOpen(true);
                  }}
                >
                  {/* USER */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold text-base-content/50 truncate">
                      {item.down_line_username}
                    </span>
                  </div>

                  {/* TYPE */}
                  <div className="text-center text-xs text-base-content/50 capitalize font-semibold">
                    {item.refer_type === "direct" ? t("referral:direct") : t("referral:indirect")}
                  </div>

                  {/* AMOUNT */}
                  <div className="text-right text-primary font-semibold text-xs">
                    + {formatWithConversion(item.reward, "USD", {
                      showSymbol: true,
                      showCode: false,
                      minimizeDecimals: true,
                    }).formatted}
                  </div>
                </div>
              ))}
            </div>

            {(currentPage > 1 || hasNextPage) && (
              <div className="py-6 px-4">
                <div className="w-full max-w-[340px] mx-auto flex items-center justify-between">
                  <button
                    className="btn btn-sm bg-base-100 btn-square rounded-field disabled:opacity-30"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isFetching}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="text-xs text-base-content/50 select-none rounded-field badge badge-soft font-semibold w-8 h-8">
                    {currentPage}
                  </div>

                  <button
                    className="btn btn-sm bg-base-100 btn-square rounded-field disabled:opacity-30"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={!hasNextPage || isFetching}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        <ReferralMyCommissionsDetails item={selectedItem} isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </div>
    </div>
  );
};

