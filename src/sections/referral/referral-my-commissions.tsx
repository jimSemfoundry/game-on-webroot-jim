import Iconify from "@/components/iconify";
import { useAuth } from "@/contexts/AuthContext";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { authService } from "@/services/authService";
import type { CommissionListResponse, CommissionRecord  } from "@/types/referral";
import { cn } from "@/utils/cn";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ReferralMyCommissionsDetails from "./referral-my-commissions-details";

const ITEMS_PER_PAGE = 10;

export const ReferralMyCommissions = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const [currentPage, setCurrentPage] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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
  const totalPages = data?.last_page || 1;

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [data]);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="bg-base-300 flex flex-col rounded-field overflow-hidden">
      <div className="bg-base-200 flex items-center gap-2 px-4 sm:px-6 py-4">
        <Iconify icon="custom:commission" width={20} height={20} className="text-primary" />
        <h3 className="text-base sm:text-lg font-bold">{t("referral:myReferralCommissions", "My Referral Commissions")}</h3>
      </div>

      <div className="bg-base-200 flex flex-col h-[320px] sm:h-[450px] relative">
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
            <div ref={scrollContainerRef} className="hidden sm:block flex-1 overflow-y-auto px-4">
              <table className="w-full table-auto text-sm text-base-content border-separate border-spacing-y-1">
                <thead className="sticky top-0 z-10 bg-base-200 text-xs font-semibold uppercase text-base-content/60">
                  <tr>
                    <th className="px-4 py-3 text-left" colSpan={4}>{t("referral:user")}</th>
                    <th className="px-4 py-3 text-left" colSpan={3}>{t("referral:relationship")}</th>
                    <th className="px-4 py-3 text-left" colSpan={3}>{t("referral:type")}</th>
                    <th className="px-4 py-3 text-right" colSpan={2}>{t("referral:amount")}</th>
                  </tr>
                </thead>
                <tbody>
                  {commissionList.map((item, index) => (
                    <tr
                      key={`${item.id}-${item.created_at}`}
                      className={cn(
                        "rounded-lg transition-colors cursor-pointer",
                        index % 2 === 0 ? "bg-base-300 hover:bg-base-300/50" : "bg-base-200 hover:bg-base-300/50"
                      )}
                      onClick={() => {
                        setSelectedItem(item);
                        setIsOpen(true);
                      }}
                    >
                      <td className="px-4 py-2.5 rounded-l-lg" colSpan={4}>
                        <div className="text-sm font-semibold text-base-content/50 truncate">
                          {item.down_line_username}
                        </div>
                      </td>

                      <td className="px-4 py-2.5" colSpan={3}>
                        <div
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold uppercase w-fit",
                            item.refer_type === "direct"
                              ? "bg-base-content/10 text-base-content"
                              : "bg-base-content/10 text-base-content/70"
                          )}
                        >
                          {item.refer_type}
                        </div>
                      </td>

                      <td className="px-4 py-2.5 text-sm text-base-content/50 font-medium capitalize" colSpan={3}>
                        {t(`referral:${item.game_type_2}`, item.game_type_2)}
                      </td>

                      <td className="px-4 py-2.5 text-right rounded-r-lg" colSpan={2}>
                        <div className="text-success font-bold text-sm">
                          +{" "}
                          {formatWithConversion(item.reward, "USD", {
                            showSymbol: false,
                            showCode: true,
                            minimizeDecimals: true,
                            displayDecimal: 4,
                          }).formatted}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden flex-1 overflow-y-auto px-4 pb-4 space-y-2">
              {commissionList.map((item, index) => (
                <div
                  key={`${item.id}-${item.created_at}`}
                  className={cn(
                    "rounded-2xl px-4 py-2.5 flex flex-col gap-2",
                    index % 2 === 0 ? "bg-base-300/30" : "bg-base-300/50"
                  )}
                  onClick={() => {
                    setSelectedItem(item);
                    setIsOpen(true);
                  }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2 min-w-0">
                      <div className="text-sm font-semibold text-base-content truncate">
                        {item.down_line_username}
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-bold uppercase",
                            item.refer_type === "direct"
                              ? "bg-primary/20 text-primary"
                              : "bg-base-content/20 text-base-content/70"
                          )}
                        >
                          {item.refer_type}
                        </div>
                        <div className="text-xs text-base-content/60 font-medium capitalize">
                          {t(`referral:${item.game_type_2}`, item.game_type_2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-start">
                      <div className="text-success font-bold text-sm">
                        +{" "}
                        {formatWithConversion(item.reward, "USD", {
                          showSymbol: false,
                          showCode: true,
                          minimizeDecimals: true,
                          displayDecimal: 4,
                        }).formatted}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 sm:gap-2 py-6 px-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isFetching}
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
                    disabled={page === "..." || isFetching}
                    className={cn(
                      "btn btn-sm min-w-[2.5rem] rounded-2xl",
                      page === currentPage ? "btn-primary text-black" : "btn-ghost bg-base-300/60 hover:bg-base-300",
                      page === "..." && "btn-ghost cursor-default hover:bg-transparent"
                    )}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isFetching}
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
        <ReferralMyCommissionsDetails item={selectedItem} isOpen={isOpen} onClose={() => setIsOpen(false)} /> 
      </div>
    </div>
  );
};

