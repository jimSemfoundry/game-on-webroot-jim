import { TableVirtuoso } from 'react-virtuoso';
import { BannerList } from './BannerList';
import { useQueryClient } from '@tanstack/react-query';
import { useGetPromoByPage } from "@/query/promo";
import { authService } from '@/services/authService';

export const BannerListTable = ({ onClose }: { onClose: () => void }) => {
  const queryClient = useQueryClient();
  const { data, isFetching } = useGetPromoByPage();

  const choicePromoFun = (id: string) => {
    authService.choicePromo({ promo_record_id: id }).then((res: any) => {
      if (res.code === 0) {
        onClose();
        queryClient.resetQueries({ queryKey: ['PromoByPage'] });
        queryClient.invalidateQueries({ queryKey: ['getPromoByPage'] });

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
    })
  };

  // const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
  //   queryKey: ['PromoByPage'],
  //   queryFn: ({ pageParam }) =>
  //     getPromoByPageV2({
  //       limit: 20,
  //       // created_at: pageParam,
  //       page: Number(pageParam),
  //     }),
  //   initialPageParam: 1,
  //   getNextPageParam: (lastPage) => {
  //     return lastPage.code === 0 && lastPage.totalPages > lastPage.page
  //       ? lastPage.page + 1
  //       : undefined;
  //     // return lastPage.data?.length > 0 ? lastPage.data[lastPage.data.length - 1].created_at : undefined;
  //   },
  //   enabled: !!user && isOpen,
  //   refetchOnMount: true,
  // });



  // const allItems = data?.pages.flatMap((page) => page.data || []) || [];

  // const TableComponents = {
  //   Table: (props: any) => <table className="table-md border-base-300 table border-t border-b" {...props} />,
  //   TableBody: (props: any) => <tbody className="bg-base-200 text-sm">{props.children}</tbody>,
  //   TableRow: (props: any) => <tr className="border-base-300 h-11 border-t border-b">{...props}</tr>,
  // };

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
  };

  // Flatten the data from infinite query pages

  return (
    <div className=" relative flex-1 h-full w-full overflow-hidden p-0 ">
      <TableVirtuoso
        style={{
          height: '100%',
        }}
        components={TableComponents}
        // endReached={() => (isFetching || !hasNextPage ? undefined : fetchNextPage())}
        data={data || []}
        itemContent={(_, item) => (
          <td className="p-0 align-top !p-0" style={{ padding: 0 }}>
            <div
              className={`border rounded-lg mb-3 ${item.is_default === 1 ? 'border-primary' : 'border-transparent'}`}
              onClick={() => choicePromoFun(item.id)}
            >
              <BannerList currentPromo={item} />
            </div>
          </td>
        )}
      />
      {isFetching && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="loading loading-spinner loading-xl text-primary"></span>
        </div>
      )}
    </div>
  );
};


