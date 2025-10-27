import Iconify from "@/components/iconify";
import { useAuth } from "@/contexts/AuthContext";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { authService } from "@/services/authService";
import type { ReferralListResponse } from "@/types/referral";
import { cn } from "@/utils/cn";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const ITEMS_PER_PAGE = 10;

export const ReferralMyReferrals = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const [currentPage, setCurrentPage] = useState(1);
  const [lastIds, setLastIds] = useState<string[]>([""]);
  const isMobile = useMediaQuery("(max-width: 639px)");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetching } = useQuery<ReferralListResponse>({
    queryKey: ["referralList", currentPage, isMobile, user?.id],
    queryFn: () =>
      authService.getReferralList({
        limit: isMobile ? 5 : ITEMS_PER_PAGE,
        last_id: lastIds[currentPage - 1] || "",
        period: "All",
        type: "All",
        keyword: "",
      }),
    enabled: !!user,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

  const referralList = data?.data || [];
  const itemsPerPage = isMobile ? 5 : ITEMS_PER_PAGE;
  const hasNextPage = referralList.length === itemsPerPage;
  const totalPages = hasNextPage ? currentPage + 1 : currentPage;

  useEffect(() => {
    if (data?.data && data.data.length === itemsPerPage) {
      const lastItem = data.data[data.data.length - 1];
      if (lastItem && !lastIds[currentPage]) {
        setLastIds((prev) => {
          const newLastIds = [...prev];
          newLastIds[currentPage] = lastItem.id;
          return newLastIds;
        });
      }
    }
  }, [data, currentPage, lastIds, itemsPerPage]);

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
        <Iconify icon="custom:person" width={20} height={20} className="text-primary" />
        <h3 className="text-base sm:text-lg font-bold">{t("referral:myReferrals")}</h3>
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
        ) : referralList.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <img 
                src="/images/illustrations/no-data.svg" 
                alt="No data" 
                className="w-32 h-32 sm:w-40 sm:h-40 opacity-50"
              />
              <div className="text-base-content/50 text-sm font-semibold">{t("common:common.nothingYet")}</div>
            </div>
          </div>
        ) : (
          <>
            <div ref={scrollContainerRef} className="hidden sm:block flex-1 overflow-y-auto px-4">
              <table className="w-full table-auto text-sm text-base-content border-separate border-spacing-y-1">
                <thead className="sticky top-0 z-10 bg-base-200 text-xs font-semibold uppercase text-base-content/60">
                  <tr>
                    <th className="px-4 py-3 text-left col-span-2">{t("referral:user")}</th>
                    <th className="px-4 py-3 text-left">{t("referral:type")}</th>
                    <th className="px-4 py-3 text-left">{t("referral:registration")}</th>
                    <th className="px-4 py-3 text-left">{t("referral:code")}</th>
                    <th className="px-4 py-3 text-right">{t("referral:amount")}</th>
                  </tr>
                </thead>
                <tbody>
                  {referralList.map((item, index) => (
                    <tr
                      key={item.id}
                      className={cn(
                        "rounded-lg transition-colors cursor-pointer",
                        index % 2 === 0 ? "bg-base-300 hover:bg-base-300/50" : "bg-base-200 hover:bg-base-300/50"
                      )}
                    >
                      <td className="px-4 py-2.5 rounded-l-lg" colSpan={2}>
                        <div className="flex items-center gap-2">
                          <img
                            src={`/images/vip/levels/${item.vip_level}.png`}
                            alt={`VIP ${item.vip_level}`}
                            className="w-5 h-5 flex-shrink-0"
                          />
                          <div className="text-sm font-semibold text-base-content/50 truncate">
                            {item.down_line_username}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-2.5">
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

                      <td className="px-4 py-2.5 text-sm text-base-content/50 font-medium">
                        {dayjs(item.regitration_date * 1000).format("YYYY/MM/DD")}
                      </td>

                      <td className="px-4 py-2.5 text-sm text-base-content/50 font-medium">{item.referral_code}</td>

                      <td className="px-4 py-2.5 text-right rounded-r-lg">
                        <div className="text-success font-bold text-sm">
                          +{" "}
                          {formatWithConversion(item.reward, "USD", {
                            showSymbol: false,
                            showCode: true,
                            minimizeDecimals: true,
                          }).formatted}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden flex-1 overflow-y-auto px-4 pb-4 space-y-2">
              {referralList.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-2xl px-4 py-2.5 flex flex-col gap-2",
                    index % 2 === 0 ? "bg-base-300/30" : "bg-base-300/50"
                  )}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <img
                          src={`/images/vip/levels/${item.vip_level}.png`}
                          alt={`VIP ${item.vip_level}`}
                          className="w-4 h-4 flex-shrink-0"
                        />
                        <div className="text-sm font-semibold text-base-content truncate">
                          {item.down_line_username}
                        </div>
                      </div>
                      <div className="text-xs text-base-content/60 font-medium">
                        {dayjs(item.regitration_date * 1000).format("YYYY/MM/DD")}
                      </div>
                      <div className="text-xs text-base-content/60 font-medium truncate">
                        {item.referral_code}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-start gap-1">
                      <div
                        className={cn(
                          "px-2 py-0.5 rounded text-xs font-bold uppercase",
                          item.refer_type === "direct"
                            ? "bg-primary/20 text-primary"
                            : "bg-base-content/20 text-base-content/70"
                        )}
                      >
                        {item.refer_type}
                      </div>
                      <div className="text-success font-bold text-sm">
                        +{" "}
                        {formatWithConversion(item.reward, "USD", {
                          showSymbol: false,
                          showCode: true,
                          minimizeDecimals: true,
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
      </div>
    </div>
  );
};
