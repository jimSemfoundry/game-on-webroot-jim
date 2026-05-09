import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { DepositFiatAmount } from "@/components/modal/UserFinanceModal/c/DepositFiatAmount.tsx";
import {
  DepositFiatFormInit
} from "@/components/modal/UserFinanceModal/c/DepositFiatFormInit.tsx";
import { useFiatGatewayDepositParams } from "@/hooks/api/useAuth.ts";
import { authService } from "@/services/authService.ts";
import { useBoundStore } from "@/store";
import { useToggle } from "@/hooks/useToggle";
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import clsx from "clsx";
import { ErrorString } from "@/store/type.ts";
import {
  InnerFieldItem,
  InnerOptions,
  InnerUnnecessary
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { isROIBEST, useRumSdkUserLog, rumException } from "@/utils/helper.ts";
import { isEmpty } from "@/utils/helper.ts";
import { emitter } from "@/store/emitter.ts";
import { navigateNewTabPopup, preOpenNewTabPopup } from "@/utils/telegramWebApp";
import { DepositFiatSummary } from "@/components/modal/UserFinanceModal/c/DepositFiatSummary.tsx";

export const DepositFiatForm = ({ extraNode }: { extraNode?: ReactNode }) => {

  const { t } = useTranslation();

  const [loading, { set }] = useToggle<boolean>(false);

  // TODO: 可视区域过小的时候,需要腾出空间,避免影响用户的表单操作
  const [viewportHeight, setViewportHeight] = useState<number>(window.visualViewport?.height || window.innerHeight);

  const { rumCustomLog, rumResource } = useRumSdkUserLog();

  // from data store, share common data
  const { depositFiat, setDepositFiat, setSyncAction, openModal } = useBoundStore();

  // 网关必填字段
  const { data: fields } = useFiatGatewayDepositParams(depositFiat.method?.gateway_id, depositFiat.method?.pay_bankcode);

  // 客户端可见的表单生成
  const formItem = useMemo(() => {
    let amountNode: React.ReactNode = null;
    let selectNode: React.ReactNode[] = [];
    let nodes: React.ReactNode[] = [];
    if (fields?.data) {
      const transform = fields.data;

      for (const key in transform) {
        const field = transform[key];

        if (field.hide) continue;

        if (!field.required && !field.hide && !field.select) {
          nodes.push(<InnerUnnecessary
            key={`${key}_${depositFiat.method?.gateway_id}`} // key 的不同可以强制重新挂载新数据，方便数据状态重置
            name={key}
            field={field}
            onChange={(v) => {
              setDepositFiat({
                extraItem: { [key]: v.value }
              });
            }} />);
          continue;
        }

        if (key === "amount") {
          amountNode = <DepositFiatAmount key="amount" multiple={field?.multiple} />;
          continue;
        }

        if (Array.isArray(field.select) && field.select.length > 0) {
          selectNode.push(
            <InnerOptions
              key={`${key}_${depositFiat.method?.gateway_id}`} // key 的不同可以强制重新挂载新数据，方便数据状态重置
              name={key}
              field={field}
              onChange={(v) => {
                if (field.required) { // 必选
                  setDepositFiat({
                    formItem: { [key]: v.value },
                    [`${key}_error`]: v[`${key}_error`]
                  });
                } else { // 非必选
                  setDepositFiat({
                    extraItem: { [key]: v.value }
                  });
                }
              }} />
          );
          continue;
        }

        nodes.push(<InnerFieldItem
          key={`${key}_${depositFiat.method?.gateway_id}`} // key 的不同可以强制重新挂载新数据，方便数据状态重置
          name={key}
          field={field}
          onChange={(v) => {
            setDepositFiat({
              formItem: { [key]: v.value },
              [`${key}_error`]: v[`${key}_error`]
            });
          }} />);
      }
    }

    // 控制表单的显示顺序
    return nodes.concat(selectNode, amountNode);
  }, [fields, depositFiat.method?.gateway_id]);

  // 创建订单
  const createOrder = useCallback(async () => {
    set(true);

    // 用户点击同步栈里立即预开 about:blank 标签页,占住浏览器的"用户手势"额度。
    // 下单接口经常 >1s,异步 .then 里再 window.open 会被 Chrome/Safari 拦截。
    // Telegram WebApp 环境下返回 null,navigateNewTabPopup 会改走 SDK openLink。
    const popup = preOpenNewTabPopup();

    const params = {
      ...depositFiat.formItem,
      gateway_id: depositFiat.method?.gateway_id,
      return_url: isROIBEST() ? `${location.origin}${location.pathname}` : location.origin,
      pay_bankcode: depositFiat.method?.pay_bankcode
    };

    let url = "";
    let name = "";

    authService
      .createFiatDepositOrder(params)
      .then(({ code, data, _request_url, _request_name }) => {
        url = _request_url || "";
        name = _request_name || "";

        if (code === 0 || code === 200) {
          if (data.payment_url) {
            navigateNewTabPopup(popup, data.payment_url);
          } else {
            popup?.close();
            toast.error(t("toast:paymentUrlNotFound"));
          }

          // TODO rum 下单成功推送
          rumCustomLog(`Deposit ${depositFiat.currency?.currency} ✅`, { url });
        } else if (code === 40021) {
          popup?.close();
          // 提款AML措施-错误提示
          openModal("OPEN_FINANCE_AML_MODAL");
        } else {
          popup?.close();
          toast.error(t("toast:failedToCreateDepositOrder"));
        }
      })
      .catch((error) => {
        popup?.close();
        toast.error(t("toast:failedToCreateDepositOrder"));
        set(false);

        // 异常推送
        rumException(`Deposit ${depositFiat.currency?.currency} ❌`, error);
      })
      .finally(() => {
        set(false);

        // TODO rum 资源访问推送
        rumResource({
          url,
          name,
          event: `Deposit ${depositFiat.currency?.currency}`
        });
      });
  }, [t, depositFiat]);

  // 表单字段是否有错误
  const filed_value_null = useMemo(() => {
    return isEmpty(depositFiat.formItem) || (!!depositFiat.formItem && Object.values(depositFiat.formItem).some((value) => !value));
  }, [depositFiat.formItem]);

  // 表单字段是否有额外的错误
  const filed_value_error = useMemo(() => {
    const keys = Object.keys(depositFiat);
    return keys.filter((k) => k.includes("_error")).some((j) => depositFiat[j as ErrorString]);
  }, [depositFiat]);

  // 供应商不可用错误
  const provider_error = useMemo(() => {
    if (depositFiat.method) return depositFiat.method?.status === 0;
  }, [depositFiat.method]);

  // 滚动到错误字段并短暂高亮红色背景
  const scrollAndHighlight = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    // 容器：插入绝对定位遮罩层，浮在子元素之上（先清理旧的，防止连续点击叠加）
    el.querySelectorAll<HTMLElement>("[data-error-overlay]").forEach((o) => o.remove());
    el.style.position = "relative";
    const overlay = document.createElement("div");
    overlay.dataset.errorOverlay = "1";
    overlay.style.cssText = "position:absolute;inset:0;background:color-mix(in oklch,var(--color-warning) 30%,transparent);border-radius:0.5rem;z-index:10;pointer-events:none;transition:opacity 0.2s ease";
    el.appendChild(overlay);
    setTimeout(() => {
      overlay.style.transition = "opacity 1.5s ease";
      overlay.style.opacity = "0";
      setTimeout(() => overlay.remove(), 1500);
    }, 800);
  }, []);

  // 事件通知
  useEffect(() => {
    const em = emitter.addListener("SYNC_DEPOSIT_FIAT_CREATE", function() {
      void createOrder();
    });

    return () => em?.remove();
  }, [createOrder]);

  // TODO: 可视区域过小的时候,需要腾出空间,避免影响用户的表单操作
  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      const height = window.visualViewport!.height;
      setViewportHeight(height);
    };

    window.visualViewport.addEventListener("resize", handleResize);
    return () => window.visualViewport?.removeEventListener("resize", handleResize);
  }, []);

  return (
    <DepositFiatFormInit>
      {/* 表单 */}
      {formItem}

      {extraNode}

      {/*TODO: 可视区域过小的时候,需要腾出空间,避免影响用户的表单操作*/}
      <div className={clsx("w-full z-1", viewportHeight >= 700 && "sticky bottom-0")}>
        {/* Fiat 订单汇总 */}
        <DepositFiatSummary />

        {/* 提交 Fiat 存款 */}
        <div className="rounded-lg">
          <ConfirmBox
            loading={loading}
            // disabled={filed_value_null || filed_value_error || provider_error}
            onClick={() => {
              // TODO: 表单出现错误时候的UX表现
              if (filed_value_null) {
                const emptyKeys = Object.entries(depositFiat.formItem || {})
                  .filter(([, v]) => !v)
                  .map(([k]) => k.toUpperCase());
                const firstId = emptyKeys[0] ?? "AMOUNT";
                emptyKeys.forEach(scrollAndHighlight);
                document.getElementById(firstId)?.scrollIntoView({ behavior: "smooth", block: "center" });
                return;
              }
              if (filed_value_error || provider_error) return;
              setSyncAction("OPEN_DEPOSIT_FIAT_VIEW_MODAL");
            }}
          >
            {t("finance:continue")}
          </ConfirmBox>
        </div>
      </div>
    </DepositFiatFormInit>
  );
};
