import { useMemo } from "react";
import i18n from "@/i18n";
import { InfoTheme } from "./InfoTheme.tsx";
import { ChevronDown, ChevronRight } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { InnerCountdown, msg_type_need_countdown } from "./InnerCountdown.tsx";
import { parser, InnerMsgLink } from "./InnerMsgLink.tsx";
import { Trans, useTranslation } from "react-i18next";
import { Decimal } from "decimal.js";
import getSymbolFromCurrency from "currency-symbol-map";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import {
  InnerCustomIcon,
  InnerDisplayContent,
  InnerIsRead
} from "@/components/header/message-v2/c/InnerComponents.tsx";

export const InnerMsgItem = ({ i, item, handle, statement, resetAnimate, onClose, dataMatching }: {
  i: number,
  item: Record<string, any>,
  handle: () => void,
  statement: Record<string, any> | null,
  dataMatching: Record<string, any> | null,
  resetAnimate: boolean
  onClose?: () => void
}) => {
  // 根据用户的语言匹配相应的模版内容
  const language_match = useMemo(() => {
    const keys = Object.keys(item?.content?.information || '')
    return keys.find((l) => l === i18n.language) ?? (keys[0] || 'en')
  }, [i18n.language])

  const content_match = useMemo(() => item?.content?.information?.[language_match] ?? null, [language_match]);

  const is_read = useMemo(() => {
    if (!item?.is_global) return item?.is_read;
    return !!dataMatching?.find((m: Record<string, any>) => m.message_id === item?.id)
  }, [item, dataMatching])

  return (<InfoTheme i={i} key={item.id} type={String(item?.content?.name_key)} resetAnimate={resetAnimate}>
    {({ data }) => (<>
      <div className="flex items-center gap-2 w-full" onClick={(e) => {
        e.stopPropagation();
        handle();
      }}>
        <InnerIsRead read={is_read || statement?.["read_" + item.id]} />
        <InnerCustomIcon icon={content_match?.icon || data.icon} />
        <div className="flex flex-col gap-2 w-full flex-1">
          <DisplayDifferentMessages
            type={item?.content?.name_key}
            content={content_match}
            payload={item?.content?.payload}
            language_match={language_match}
          />
          <InnerDisplayContent show={msg_type_need_countdown.includes(item?.content?.name_key)}>
            <InnerCountdown
              type={item?.content?.name_key}
              status={item?.content?.handle_status}
              payload={item?.content?.payload}
              jump_url={item?.content?.jump_url}
              expired_at={item?.content?.expired_at}
              onClose={onClose}
            />
          </InnerDisplayContent>
        </div>
        <button className="btn btn-primary btn-soft btn-sm btn-square">
          {statement?.["view_" + item.id]
            ? <ChevronDown className="w-4 h-4" strokeWidth={3} />
            : <ChevronRight className="w-4 h-4" strokeWidth={3} />}
        </button>
      </div>
      <AnimatePresence>
        {statement?.["view_" + item.id] && <m.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.1, ease: "easeInOut", opacity: { duration: 0.075 } }}
        >
          <div
            className="leading-4 text-[12px] mt-3 font-semibold max-h-[400px] overflow-y-auto hide-scrollbar text-white/75">
            {content_match?.images?.map((img: string) => (
              <img src={img} alt="" className="rounded-xl mx-auto mb-2" />))}
            <DisplayDifferentMessages
              type={item?.content?.name_key}
              display={2}
              content={content_match}
              payload={item?.content?.payload}
              language_match={language_match}
            />
            <InnerDisplayContent
              show={item?.content?.jump_url}>
              <InnerMsgLink
                type={item?.content?.name_key}
                status={item?.content?.handle_status}
                jump_url={item?.content?.jump_url}
                expired_at={item?.content?.expired_at || 0}
                onClose={onClose}/>
            </InnerDisplayContent>
          </div>
        </m.div>}
      </AnimatePresence>
    </>)}
  </InfoTheme>);
};

const DisplayDifferentMessages = ({ type, content, payload, display = 1, language_match }: {
  type: string, content: Record<string, any>,
  payload: string,
  display?: 1 | 2,
  language_match: string
}) => {
  const { user } = useAuth();

  const { t } = useTranslation();

  const { convertCurrency, isLoading, formatCurrency, exchangeRates } = useCurrencyData();

  const source = useMemo(() => {
    if (!payload) return

    const parsed_payload = parser(payload);
    const targetCurrency = (user?.currency_fiat ?? "USD");
    console.info(parsed_payload);
    if (type.includes("promo_code")) {
      const min_amount = convertCurrency({
        amount: parsed_payload?.extra_data?.min_amount || 0,
        fromCurrency: "USDT",
        toCurrency: targetCurrency,
        exchangeRates
      });
      const min_amount_final = targetCurrency !== "USD"
        ? `${getSymbolFromCurrency(targetCurrency) ?? ""}${Decimal(String(min_amount).replace(/,/g, ""))
          .toDP(0, Decimal.ROUND_CEIL).toNumber().toLocaleString()}`
        : `$${min_amount}`;
      return {
        ...parsed_payload,
        min_amount: isLoading ? "0.00" : min_amount_final,
        bonus_amount: isLoading ? "0.00" : formatCurrency({
          amount: convertCurrency({
            amount: parsed_payload?.extra_data?.bonus_amount || 0,
            fromCurrency: "USDT",
            toCurrency: targetCurrency,
            exchangeRates
          }),
          currency: targetCurrency,
          showSymbol: true, showCode: false
        }).formatted,
        currency: targetCurrency
      };
    }

    if (type.includes("conquest")) {
      return {
        ...parsed_payload,
        reward_amount: isLoading ? "0.00" : formatCurrency({
          amount: convertCurrency({
            amount: parsed_payload?.reward_amount || 0,
            fromCurrency: "USDT",
            toCurrency: targetCurrency,
            exchangeRates
          }),
          currency: targetCurrency,
          showSymbol: true, showCode: false
        }).formatted,
        currency: "",
        conquest_key: i18n.getDataByLanguage(language_match)?.bonus?.item?.[parsed_payload?.key] ?? parsed_payload?.key
      };
    }

    if (type.includes("achievement")) {
      const with_count_types_times = [
        "achievement_bet_count",
        "achievement_deposit_count",
        "achievement_slots_win_count",
        "achievement_talkative",
        "achievement_slots_multiplier"
      ];
      const with_count_types_level = [
        "achievement_game_explorer",
        "achievement_super_spreader",
        "achievement_conquistador"
      ];

      return {
        ...parsed_payload,
        step: [...with_count_types_times, ...with_count_types_level].includes(parsed_payload?.key)
          ? `${with_count_types_level.includes(parsed_payload?.key) ? t("bonus:level") : ""} ${parsed_payload?.step}`
          : "",
        reward_amount: isLoading ? "0.00" : formatCurrency({
          amount: convertCurrency({
            amount: parsed_payload?.reward_amount || 0,
            fromCurrency: "USDT",
            toCurrency: targetCurrency,
            exchangeRates
          }),
          currency: targetCurrency,
          showSymbol: true, showCode: false
        }).formatted,
        currency: "",
        achievement_key: (i18n.getDataByLanguage(language_match)?.bonus?.[parsed_payload?.key] as any)?.name ?? parsed_payload?.key
      };
    }

    if (type.includes("withdraw")) {
      return {
        ...parsed_payload,
        amount: Decimal(parsed_payload?.amount || 0).toDP(8, Decimal.ROUND_DOWN)
      };
    }

    if (type.includes("deposit")) {
      return {
        ...parsed_payload,
        amount: Decimal(parsed_payload?.amount || 0).toDP(8, Decimal.ROUND_DOWN),
        pool_amount: isLoading ? "0.00" : formatCurrency({
          amount: convertCurrency({
            amount: parsed_payload?.rakeback_log?.amount || 0,
            fromCurrency: "USDT",
            toCurrency: targetCurrency,
            exchangeRates
          }),
          currency: targetCurrency,
          showSymbol: true, showCode: false
        }).formatted,
        pool_currency: ""
      };
    }

    return {
      ...parsed_payload,
      amount: isLoading ? "0.00" : formatCurrency({
        amount: convertCurrency({
          amount: parsed_payload?.amount || 0,
          fromCurrency: "USDT",
          toCurrency: targetCurrency,
          exchangeRates
        }),
        currency: targetCurrency,
        showSymbol: true, showCode: false
      }).formatted,
      currency: ''
    };
  }, [i18n, isLoading, user?.currency_fiat, language_match]);

  return (display === 1
    ? (<>
      <div className="text-[14px] text-white leading-4 text-left flex-1 font-semibold">
        <Trans
          i18nKey={content?.title}
          values={source}
        />
      </div>
      <InnerDisplayContent show={content?.subtitle}>
        <div className="text-[12px] text-white/50 leading-4 text-left flex-1 font-semibold">
          <Trans
            i18nKey={content?.subtitle}
            values={source}
          />
        </div>
      </InnerDisplayContent>
    </>)
    : (<Trans
      i18nKey={`<0>${content?.detail_user}</0>`}
      values={source}
      components={[<article className="whitespace-pre-line" />]}
    />));
};
