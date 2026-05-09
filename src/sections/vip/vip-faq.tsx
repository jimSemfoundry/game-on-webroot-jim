import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/Accordion";
import { useTranslation } from "react-i18next";
import { ReactNode, useMemo } from "react";
import { useBonusSwitch, useCurrentUser } from "@/hooks/api/useAuth.ts";

export function VipFAQ() {
  const { t } = useTranslation(["vipFaq", "vip"]);

  const faqItems = [
    {
      id: "vip-faq-1",
      question: t("vipFaq:faqOne.title"),
      answer: t("vipFaq:faqOne.content")
    },
    // {
    //   id: "vip-faq-2",
    //   question: t("vipFaq:faqTwo.title"),
    //   answer: t("vipFaq:faqTwo.content")
    // },
    {
      id: "vip-faq-4",
      question: t("vipFaq:faqFour.title"),
      answer: t("vipFaq:faqFour.content")
    },
    {
      id: "vip-faq-5",
      question: t("vipFaq:faqFive.title"),
      answer: t("vipFaq:faqFive.content")
    },
    {
      id: "vip-faq-6",
      question: t("vipFaq:faqSix.title"),
      answer: t("vipFaq:faqSix.content")
    },
    {
      id: "vip-faq-7",
      question: t("vipFaq:faqEight.title"),
      answer: t("vipFaq:faqEight.content", { minWager: "$300" })
    },
    {
      id: "vip-faq-8",
      question: t("vipFaq:faqNine.title"),
      answer: t("vipFaq:faqNine.content")
    }
  ];

  return (
    <div className="w-full px-0 sm:px-15">
      <h2 className="text-lg sm:text-xl font-bold text-base-content text-center mb-6">
        {t("vip:faq")}
      </h2>
      <Accordion type="multiple" className="w-full flex flex-col gap-3">
        {faqItems.map((item) => (
          <InnerGuardContainer item={item}>
            <AccordionItem
              key={item.id}
              value={item.id}
              className="bg-base-200 rounded-field px-4 sm:px-6"
            >
              <AccordionTrigger
                className="text-left text-xs sm:text-sm font-semibold text-base-content/70 hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-base-content/50 text-xs sm:text-sm leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: item.answer }} />
              </AccordionContent>
            </AccordionItem>
          </InnerGuardContainer>
        ))}
      </Accordion>
    </div>
  );
}

export const InnerGuardContainer = (
  {
    item,
    children
  }: {
    item: Record<string, any>
    children: ReactNode
  }
) => {
  const { data } = useCurrentUser();

  const { switchData } = useBonusSwitch();

  // TODO: 是否隐藏用户成就
  const is_achievements = useMemo(() => switchData?.bonus_switch?.achievements === 0 && (item?.id === "vip-faq-3" || item?.field === "achievements"), [switchData]);
  // TODO: 是否隐藏推荐佣金
  const is_referral_commission = useMemo(() => data?.status?.referral_enable === 0 && item?.field === "group", [data?.status?.referral_enable]);
  
  return ((is_achievements || is_referral_commission) ? null : children);
};
