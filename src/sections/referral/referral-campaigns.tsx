import Iconify from "@/components/iconify";
import { CreateCampaignModal } from "./referral-create-campaign-modal";
import { useAuth } from "@/contexts/AuthContext";
import { useAdTagList } from "@/hooks/api/useAuth";
import { cn } from "@/utils/cn";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ChevronRight } from "lucide-react";
import Copy from "@/components/ui/Copy";
import { AdTag } from "@/types/referral";

export const ReferralCampaigns = () => {
  const { t } = useTranslation(['referral', 'common']);
  const { status } = useAuth();
  const { data: adTagListResponse, isLoading } = useAdTagList();
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 639px)");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [compaignDetail, setCompaignDetail] = useState<AdTag | null>(null);

  const adTagList = adTagListResponse?.data || [];
  const itemsPerPage = isMobile ? 5 : 10;
  const totalPages = Math.max(1, Math.ceil(adTagList.length / itemsPerPage));
  const paginatedCampaigns = adTagList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (adTagList.length > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [adTagList.length, currentPage, totalPages]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentPage]);

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
      <div className="bg-base-200 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 mb-4">
          <img src="/icons/ui/speaker.png" alt="speaker" className="w-13 h-13" />
          <h3 className="text-base sm:text-lg font-bold">{t("referral:tabs.campaigns")}</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-3">
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-1 sm:gap-3">
            <div className="rounded-field bg-base-300/70 px-4 py-3 flex items-center gap-3">
              <Iconify icon="custom:speaker" className="text-primary h-5 w-5 shrink-0" />
              <div>
                <div className="text-xs uppercase font-semibold text-base-content/60">{t("referral:campaigns")}</div>
                <div className="text-base-content text-sm sm:text-2xl font-bold">
                  {isLoading ? "..." : `${adTagList.length} / 20`}
                </div>
              </div>
            </div>
            <div className="rounded-field bg-base-300/70 px-4 py-3 flex items-center gap-3">
              <Iconify icon="custom:referral" className="text-primary h-5 w-5 shrink-0" />
              <div>
                <div className="text-xs uppercase font-semibold text-base-content/60">{t("referral:referrals")}</div>
                <div className="text-base-content text-sm sm:text-2xl font-bold">{status?.direct_invitations || 0}</div>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg sm:btn-xl rounded-field font-semibold text-sm tracking-wide w-full sm:w-auto"
            onClick={() => setIsCreateModalOpen(true)}
          >
            {t("referral:createNewCampaign")}
          </button>
        </div>
      </div>

      <div className="bg-base-200 px-4 sm:px-6 py-3">
        <div className="sm:hidden flex items-center justify-between text-xs font-semibold text-base-content/60 uppercase">
          <span>{t("referral:campaignName")}</span>
          <span>{t("referral:referrals")}</span>
        </div>
      </div>

      <div className={cn(
        "bg-base-200 flex flex-col",
        // 根据数据数量动态设置高度
        isLoading || adTagList.length === 0
          ? "h-[320px] sm:h-[450px]"
          : adTagList.length <= itemsPerPage
            ? "" // 如果数据少于一页，使用自动高度
            : "h-[320px] sm:h-[450px]" // 如果数据超过一页，使用固定高度以显示滚动
      )}>
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <span className="loading loading-spinner loading-xl text-primary"></span>
          </div>
        ) : adTagList.length === 0 ? (
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
            <div ref={scrollContainerRef} className={cn(
              "hidden sm:block px-4",
              adTagList.length > itemsPerPage ? "flex-1 overflow-y-auto" : "" // 只在超过一页时启用滚动
            )}>
              <table className="w-full table-auto text-sm text-base-content border-separate border-spacing-y-1">
                <thead className="sticky top-0 z-10 bg-base-200 text-xs font-semibold uppercase text-base-content/60">
                  <tr>
                    <th className="px-4 py-3 text-left rtl:text-right">{t("referral:campaignName")}</th>
                    <th className="px-4 py-3 text-left rtl:text-right w-[11rem]">{t("referral:referralCode")}</th>
                    <th className="px-4 py-3 text-center">{t("referral:registration")}</th>
                    <th className="px-4 py-3 text-right rtl:text-left">{t("referral:referrals")}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCampaigns.map((item, index) => (
                    <tr
                      key={item.id}
                      className={cn(
                        "rounded-lg transition-colors cursor-pointer",
                        index % 2 === 0 ? "bg-base-300 hover:bg-base-300/50" : "bg-base-200 hover:bg-base-300/50"
                      )}
                      onClick={() => {
                        setCompaignDetail(item);
                        setIsCreateModalOpen(true);
                      }}
                    >
                      <td className="px-4 py-2.5 rounded-l-lg rtl:rounded-l-none rtl:rounded-r-lg min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          {item.is_default ? (
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M9.04894 2.92705C9.3483 2.00574 10.6517 2.00574 10.9511 2.92705L12.0206 6.21885C12.1545 6.63087 12.5385 6.90983 12.9717 6.90983H16.4329C17.4016 6.90983 17.8044 8.14945 17.0207 8.71885L14.2205 10.7533C13.87 11.0079 13.7234 11.4593 13.8572 11.8713L14.9268 15.1631C15.2261 16.0844 14.1717 16.8506 13.388 16.2812L10.5878 14.2467C10.2373 13.9921 9.7627 13.9921 9.41221 14.2467L6.61204 16.2812C5.82833 16.8506 4.77385 16.0844 5.0732 15.1631L6.14277 11.8713C6.27665 11.4593 6.12999 11.0079 5.7795 10.7533L2.97933 8.71885C2.19562 8.14945 2.59839 6.90983 3.56712 6.90983H7.02832C7.46154 6.90983 7.8455 6.63087 7.97937 6.21885L9.04894 2.92705Z"
                                fill="currentColor"
                                className="text-warning flex-shrink-0"
                              />
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M9.04894 2.92705C9.3483 2.00574 10.6517 2.00574 10.9511 2.92705L12.0206 6.21885C12.1545 6.63087 12.5385 6.90983 12.9717 6.90983H16.4329C17.4016 6.90983 17.8044 8.14945 17.0207 8.71885L14.2205 10.7533C13.87 11.0079 13.7234 11.4593 13.8572 11.8713L14.9268 15.1631C15.2261 16.0844 14.1717 16.8506 13.388 16.2812L10.5878 14.2467C10.2373 13.9921 9.7627 13.9921 9.41221 14.2467L6.61204 16.2812C5.82833 16.8506 4.77385 16.0844 5.0732 15.1631L6.14277 11.8713C6.27665 11.4593 6.12999 11.0079 5.7795 10.7533L2.97933 8.71885C2.19562 8.14945 2.59839 6.90983 3.56712 6.90983H7.02832C7.46154 6.90983 7.8455 6.63087 7.97937 6.21885L9.04894 2.92705Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className="text-base-content/30 flex-shrink-0"
                              />
                            </svg>
                          )}
                          <span className="font-semibold truncate text-base-content/50 text-sm max-w-full sm:hidden">
                            {item.campaign}
                          </span>
                          <div className="tooltip tooltip-top hidden sm:block min-w-0 max-w-full" data-tip={item.campaign}>
                            <span className="font-semibold truncate text-base-content/50 text-sm max-w-full block">
                              {item.campaign}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 align-middle">
                        <div className="w-[11rem] min-w-0">
                          <div className="bg-base-100/60 rounded-lg px-3 py-1.5 flex items-center justify-between gap-2 rtl:flex-row-reverse">
                            <span className="font-semibold text-left rtl:text-right truncate text-base-content/50 text-sm max-w-full sm:hidden" dir="ltr">
                              {item.code}
                            </span>
                            <div className="tooltip tooltip-top hidden sm:block min-w-0 flex-1">
                              <span className="font-semibold text-left rtl:text-right truncate text-base-content/50 text-sm max-w-full block" dir="ltr">
                                {item.code}
                              </span>
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                              <Copy
                                text={item.code}
                                trigger={
                                  <button
                                    className="inline-flex h-5 w-5 items-center justify-center rounded-md text-primary hover:text-primary-focus focus:outline-none cursor-pointer"
                                    aria-label={t("referral:referralCode")}
                                  >
                                    <Iconify icon="solar:copy-linear" width={12} height={12} />
                                  </button>
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center font-medium text-base-content/50 text-sm" dir="ltr">{dayjs(item.created_at * 1000).format("YYYY/MM/DD")}</td>
                      <td className="px-4 py-2.5 text-right rtl:text-left rounded-r-lg rtl:rounded-r-none rtl:rounded-l-lg">
                        <button className="bg-primary text-primary-content font-semibold text-sm px-3 py-1 rounded-lg inline-flex items-center gap-1 hover:opacity-90 transition-opacity rtl:flex-row-reverse">
                          <span>{item.register_count}</span>
                          <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={cn(
              "sm:hidden px-4 pb-4 space-y-2",
              adTagList.length > itemsPerPage ? "flex-1 overflow-y-auto" : "" // 只在超过一页时启用滚动
            )}>
              {paginatedCampaigns.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-2xl px-4 py-2.5 flex flex-col gap-2",
                    index % 2 === 0 ? "bg-base-300/30" : "bg-base-300/50"
                  )}
                  onClick={() => {
                    setCompaignDetail(item);
                    setIsCreateModalOpen(true);
                  }}
                >
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Iconify
                        icon={item.is_default ? "solar:star-bold" : "solar:star-linear"}
                        width={14}
                        height={14}
                        className={cn("flex-shrink-0", item.is_default ? "text-warning" : "text-base-content/30")}
                      />
                      <span className="font-semibold uppercase tracking-wide text-xs text-base-content truncate">
                        {item.campaign}
                      </span>
                    </div>
                    <div
                      className="bg-base-100/60 rounded-lg px-2 py-1 flex items-center gap-1.5 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-xs font-semibold text-base-content truncate uppercase max-w-[3.5rem]">{item.code}</span>
                      <Copy
                        text={item.code}
                        trigger={
                          <button
                            type="button"
                            className="text-primary hover:text-primary-focus flex-shrink-0"
                            aria-label={t("referral:copyCode", "Copy code")}
                          >
                            <Iconify icon="solar:copy-linear" width={10} height={10} />
                          </button>
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-base-content/60">
                    <span>{dayjs(item.created_at * 1000).format("YYYY/MM/DD")}</span>
                    <div className="bg-primary text-black font-semibold px-2 py-0.5 rounded-md inline-flex items-center gap-1 text-xs">
                      <span>{item.register_count}</span>
                    </div>
                  </div>
                </div>
              ))}
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

      <CreateCampaignModal
        compaignDetail={compaignDetail}
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCompaignDetail(null);
        }}
        onCreated={() => {
          setCurrentPage(1);
        }}
      />
    </div>
  );
};
