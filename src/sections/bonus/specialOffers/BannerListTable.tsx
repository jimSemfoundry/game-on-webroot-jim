import { TableVirtuoso } from "react-virtuoso";
import { useQueryClient } from "@tanstack/react-query";
import { useGetPromoByPage } from "@/query/promo";
import { authService } from "@/services/authService";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFinanceModal } from "@/contexts/ModalsProvider.tsx";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import { EveryDayBonusExpand } from "@/sections/components/EveryDayBonusExpand.tsx";
import { LimitOfferBonusExpand } from "@/sections/components/LimitOfferBonusExpand.tsx";
import { DoubleBonusExpand } from "@/sections/components/DoubleBonusExpand.tsx";
import { SPECIAL_OFFER_DEPOSIT_SET } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

export const BannerListTable = ({ onClose }: { onClose: () => void }) => {
  const queryClient = useQueryClient();

  const { t } = useTranslation();

  const { isUserFinanceOpen } = useFinanceModal();
  const { data, isFetching } = useGetPromoByPage(isUserFinanceOpen);

  const choicePromoFun = (id: string) => {
    authService.choicePromo({ promo_record_id: id }).then((res: any) => {
      if (res.code === 0) {
        onClose();
        queryClient.resetQueries({ queryKey: ["PromoByPage"] });
        queryClient.invalidateQueries({ queryKey: ["getPromoByPage"] });

        // 获取当前查询缓存的数据
        // const queryData = queryClient.getQueryData(['PromoByPage']) as any;

        // if (queryData?.pages) {
        //   // 遍历所有页面，更新 is_default 值
        //   const updatedPages = queryData.pages.map((page: any) => {
        //     if (page.data && Array.isArray(page.data)) {
        //       const updatedData = page.data.map((item: any) => {
        //         // 相同 id 且 is_default === 1 的保持不变，其他设为 0
        //         if (item.id === id) {
        //           return { ...item, is_default: 1 };
        //         } else {
        //           return { ...item, is_default: 0 };
        //         }
        //       });
        //       return { ...page, data: updatedData };
        //     }
        //     return page;
        //   });

        //   // 更新查询缓存
        //   queryClient.setQueryData(['PromoByPage'], {
        //     ...queryData,
        //     pages: updatedPages,
        //   });
        // }

      }
    });
  };

  const TableComponents = {
    Table: (props: any) => (
      <table
        className="border-base-300 table-fixed w-full border-collapse p-0"
        cellPadding={0}
        cellSpacing={0}
        style={
          {
            // borderTop: '1px solid color(display-p3 0.082 0.098 0.118)',
          }
        }
        {...props}
      />
    ),
    TableRow: (props: any) => <tr className="h-11 p-0" {...props} />,
    EmptyPlaceholder: () => (
      <tbody>
      <tr className={"text-xs text-base-content/50 text-center bg-base-300 rounded-lg mt-0.5"}>
        <td className={"p-8 rounded-lg"}>{t("common:common.noData")}</td>
      </tr>
      </tbody>
    ) as any
  };

  const tableData = useMemo(
    () => (isFetching ? Array.from({ length: 10 }) : data || []),
    [isFetching, data]
  );

  return (
    <div className=" relative flex-1 h-full w-full overflow-hidden p-0 ">
      <TableVirtuoso
        style={{
          height: "100%"
        }}
        className={"hide-scrollbar"}
        components={TableComponents}
        // endReached={() => (isFetching || !hasNextPage ? undefined : fetchNextPage())}
        data={tableData}
        itemContent={(_, item) => {
          if (isFetching) {
            return (
              <td>
                <div className="skeleton h-10 bg-base-300 rounded-lg" />
              </td>
            );
          }

          return (
            <td className="p-0 align-top !p-0" style={{ padding: 0 }}>
              <div
                className={`bg-base-300 rounded-lg mb-3 ${item.is_default === 1 ? "border-primary" : "border-transparent"}`}
                onClick={() => choicePromoFun(item.id)}
              >
                <InnerDisplayContent show={item?.promo_code === "special_offer_don_deposit"}>
                  <DoubleBonusExpand currentPromo={item} />
                </InnerDisplayContent>

                <InnerDisplayContent show={item?.promo_code === "special_offer_sunday"}>
                  <EveryDayBonusExpand currentPromo={item} />
                </InnerDisplayContent>

                <InnerDisplayContent show={SPECIAL_OFFER_DEPOSIT_SET.has(item?.promo_code)}>
                  <LimitOfferBonusExpand currentPromo={item} />
                </InnerDisplayContent>
              </div>
            </td>
          );
        }}
      />
    </div>
  );
};


