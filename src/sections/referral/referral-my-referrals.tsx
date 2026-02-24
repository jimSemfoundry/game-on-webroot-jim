import Iconify from "@/components/iconify";
import { useAuth } from "@/contexts/AuthContext";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { authService } from "@/services/authService";
import type { ReferralListItem, ReferralListResponse } from "@/types/referral";
import { cn } from "@/utils/cn";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Select } from "@/components/ui/Select";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { X } from "lucide-react";
import ReferralMyReferralsDetails from "./referral-my-referrals-details";

const ITEMS_PER_PAGE = 10;

export const ReferralMyReferrals = () => {
  const { t } = useTranslation(['referral', 'transaction', 'common']);
  const { user } = useAuth();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const [currentPage, setCurrentPage] = useState(1);
  const [lastIds, setLastIds] = useState<string[]>([""]);
  const isMobile = useMediaQuery("(max-width: 639px)");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReferralListItem | null>(null);

  const typeOptions = [
    { label: t("transaction:filters.all", "All"), value: "All" },
    { label: t("referral:direct"), value: "direct" },
    { label: t("referral:indirect"), value: "indirect" },
  ]

  const periodOptions = [
    { label: t("transaction:filters.all"), value: "All" },
    { label: t("transaction:filters.past90Days"), value: "Past 90 Days" },
    { label: t("transaction:filters.past60Days"), value: "Past 60 Days" },
    { label: t("transaction:filters.past30Days"), value: "Past 30 Days" },
    { label: t("transaction:filters.past7Days"), value: "Past 7 Days" },
    { label: t("transaction:filters.past24Hours"), value: "Past 24 Hours" },
  ];

  const [selectedPeriod, setPeriod] = useState(periodOptions[0].value);
  const [selectedType, setType] = useState(typeOptions[0].value);

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const { data, isLoading, isFetching, isPlaceholderData } = useQuery<ReferralListResponse>({
    queryKey: ["referralList", currentPage, isMobile, user?.id, selectedPeriod, selectedType, inputValue],
    queryFn: () =>
      authService.getReferralList({
        limit: isMobile ? 5 : ITEMS_PER_PAGE,
        last_id: lastIds[currentPage - 1] || "",
        period: selectedPeriod as any,
        type: selectedType as any,
        keyword: inputValue,
      }),
    enabled: !!user,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

  // 筛选条件变更时重置分页状态
  useEffect(() => {
    setCurrentPage(1);
    setLastIds([""]);
  }, [selectedPeriod, selectedType, inputValue]);

  const referralList = data?.data || [];
  const itemsPerPage = isMobile ? 5 : ITEMS_PER_PAGE;
  const hasNextPage = referralList.length === itemsPerPage;

  useEffect(() => {
    if (isPlaceholderData) return;
    if (data?.data && data.data.length === itemsPerPage) {
      const lastItem = data.data[data.data.length - 1];
      if (lastItem) {
        setLastIds((prev) => {
          if (prev[currentPage] === lastItem.id) return prev;
          const newLastIds = [...prev];
          newLastIds[currentPage] = lastItem.id;
          return newLastIds;
        });
      }
    }
  }, [data, currentPage, itemsPerPage, isPlaceholderData]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [data]);


  return (
    <div className="bg-base-200 flex flex-col rounded-field overflow-hidden gap-3">
      <div className="bg-base-200 flex items-center gap-2 px-4 sm:px-6 pt-4 pb-1">
        <Iconify icon="custom:person" width={20} height={20} className="text-primary" />
        <h3 className="text-base sm:text-lg font-bold">{t("referral:myReferrals")}</h3>
      </div>
      <div className="bg-base-200 gap-2.5 px-4 sm:px-6 flex w-full relative" >
        <div className={cn(
          "bg-base-200 gap-2.5 flex items-center flex-1 min-w-0 ",
        )}>
          <div className="flex-1 min-w-0">
            <Select
              className="bg-base-300 rounded-field "
              size="md"
              dropdownClassName="bg-base-100"
              renderOption={(option) => (
                <p className="text-xs sm:text-sm font-semibold flex items-center gap-2">{option?.label}</p>
              )}
              renderValue={(option) => (
                <p className="text-xs sm:text-sm font-semibold flex items-center gap-2">{option?.label}</p>
              )}
              options={typeOptions}
              value={selectedType}
              onChange={(value) => setType(String(value) as "direct" | "indirect")}
            />
          </div>
          <div className="flex-1 min-w-0">
            <Select
              className="bg-base-300 rounded-field"
              size="md"
              dropdownClassName="bg-base-100"
              renderOption={(option) => (
                <p className="text-xs sm:text-sm font-semibold flex items-center gap-2">{option?.label}</p>
              )}
              renderValue={(option) => (
                <p className="text-xs sm:text-sm font-semibold flex items-center gap-2">{option?.label}</p>
              )}
              options={periodOptions}
              value={selectedPeriod}
              onChange={(value) => setPeriod(String(value))}
            />
          </div>
        </div>
        <label className={`flex-shrink-0 self-end relative input bg-base-300 px-0 input-ghost gap-0 transition-all duration-300 ease-in-out overflow-hidden ${isSearchFocused ? (isMobile ? `w-full absolute right-0 top-0 -ml-2.5` : 'w-[280px]') : 'w-[40px]'}`}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t("common:common.search")}
            className={cn(
              "transition-all duration-300 ease-in-out pr-10 pl-2.5",
              isSearchFocused
                ? "w-full opacity-100 translate-x-0"
                : "w-0 opacity-0 -translate-x-2"
            )}
          />
          <div className="flex items-center gap-2 absolute right-0 top-0 z-10">
            {isSearchFocused && inputValue !== '' && (
              <button
                type="button"
                className={cn("btn btn-sm btn-ghost text-base-content/50 px-2")}
                onClick={() => setInputValue("")}
              >
                <X size={16} />
              </button>
            )}
            {
              !isSearchFocused ? (
                <button
                  className="btn btn-square btn-md btn-primary  "
                  onClick={() => {
                    setIsSearchFocused(true);
                  }}
                >
                  <Search size={18} className="transition-transform duration-200" />
                </button>
              ) : (
                <button
                  className="btn btn-square btn-sm btn-primary    "
                  onClick={() => {
                    setIsSearchFocused(false);
                  }}
                >
                  <Iconify icon="custom:left-close" width={18} height={18} className="transition-transform duration-200" />
                </button>
              )
            }
          </div>
        </label>
      </div>
      <div className={cn("bg-base-200 flex flex-col relative", referralList.length > 0 ? "min-h-[560px]" : "")}>
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
              <div className="text-base-content/50 text-sm font-semibold">{t("common:common.noData")}</div>
            </div>
          </div>
        ) : (
          <>
            <div ref={scrollContainerRef} className="hidden sm:block flex-1 overflow-y-auto px-3 sm:px-6">
              <table className="w-full table-auto text-sm text-base-content border-separate border-spacing-y-1">
                <thead className="sticky top-0 z-10 bg-base-200 text-xs font-semibold uppercase text-base-content/60">
                  <tr>
                    <th className="px-4 py-3 text-left rtl:text-right">{t("referral:user")}</th>
                    <th className="px-4 py-3 text-left rtl:text-right">{t("referral:registration")}</th>
                    <th className="px-4 py-3 text-left rtl:text-right">{t("referral:date")}</th>
                    <th className="px-4 py-3 text-left rtl:text-right">{t("referral:code")}</th>
                    <th className="px-4 py-3 text-right rtl:text-left">{t("referral:amount")}</th>
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
                      onClick={() => {
                        setSelectedItem(item);
                        setIsOpen(true);
                      }}
                    >
                      <td className="px-4 py-2.5 rounded-l-lg rtl:rounded-l-none rtl:rounded-r-lg min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={`/images/vip/levels/${item.vip_level}.png`}
                            alt={`VIP ${item.vip_level}`}
                            className="w-5 h-5 flex-shrink-0"
                          />
                          <div className="text-sm font-semibold text-base-content/50 truncate max-w-full sm:hidden">
                            {item.down_line_username}
                          </div>
                          <div className="tooltip tooltip-top hidden sm:block min-w-0 max-w-full" data-tip={item.down_line_username}>
                            <div className="text-sm font-semibold text-base-content/50 truncate max-w-full block">
                              {item.down_line_username}
                            </div>
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

                      <td className="px-4 py-2.5 text-sm text-base-content/50 font-medium" dir="ltr">
                        {dayjs(item.regitration_date * 1000).format("YYYY/MM/DD")}
                      </td>

                      <td className="px-4 py-2.5 text-sm text-base-content/50 font-medium truncate max-w-full sm:hidden" dir="ltr">
                        {item.referral_code}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-base-content/50 font-medium hidden sm:table-cell">
                        <div className="tooltip tooltip-top min-w-0 max-w-full" data-tip={item.referral_code}>
                          <span className="truncate max-w-full block" dir="ltr">{item.referral_code}</span>
                        </div>
                      </td>

                      <td className="px-4 py-2.5 text-right rtl:text-left rounded-r-lg rtl:rounded-r-none rtl:rounded-l-lg">
                        <div className="text-success font-bold text-xs" dir="ltr">
                          +{formatWithConversion(item.reward, "USD", {
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
              {referralList.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-2xl p-3 flex flex-col gap-2 bg-base-300/50",
                  )}
                  onClick={() => {
                    setSelectedItem(item);
                    setIsOpen(true);
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={`/images/vip/levels/${item.vip_level}.png`}
                          alt={`VIP ${item.vip_level}`}
                          className="w-4 h-4 flex-shrink-0"
                        />
                        <div className="text-sm font-semibold text-base-content truncate">
                          {item.down_line_username}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "px-2 py-0.5 rounded text-xs font-bold uppercase flex-shrink-0",
                          item.refer_type === "direct"
                            ? "bg-primary text-primary-content"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {item.refer_type}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="text-xs text-base-content/60 font-medium">
                          {dayjs(item.regitration_date * 1000).format("YYYY/MM/DD")}
                        </div>
                        <div className="text-xs text-base-content/60 font-medium truncate">
                          {item.referral_code}
                        </div>
                      </div>
                      <div className="text-success font-bold text-xs flex items-center">
                        +
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
        <ReferralMyReferralsDetails item={selectedItem} isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </div>
    </div>
  );
};
