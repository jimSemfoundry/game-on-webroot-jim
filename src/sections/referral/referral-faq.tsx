import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { useTranslation } from "react-i18next";

const fallbackWebsiteUrl = "https://1st.game";
const fallbackWebsiteName = "1st.game";
const fallbackBusinessEmail = "business@1st.game";

const buildAnchor = (href: string, label: string) =>
  `<a target="_blank" rel="noopener noreferrer" href="${href}" class="text-primary font-bold text-sm">${label}</a>`;

export const ReferralFAQ = () => {
  const { t } = useTranslation('referral');

  const websiteUrl = import.meta.env.VITE_WEBSITE_URL ?? fallbackWebsiteUrl;
  const websiteNickname =
    import.meta.env.VITE_WEBSITE_NICKNAME ?? fallbackWebsiteName;
  const businessEmail =
    import.meta.env.VITE_BUSINESS_EMAIL ?? fallbackBusinessEmail;

  const websiteLink = buildAnchor(websiteUrl, websiteNickname);
  const emailLink = buildAnchor(`mailto:${businessEmail}`, businessEmail);

  const faqItems = [
    {
      id: "faq-1",
      question: t("referral:faqOne.title", {
        defaultValue: "How does the referral system work?",
      }),
      answer: t("referral:faqOne.content", {
        defaultValue:
          '<p class="leading-7">When you share your referral link with your friends and they sign up at our site; they become your referral and will earn you commission and referral rewards by playing at the {{gameLink}} Alliance.</p>',
        gameLink: websiteLink,
      }),
    },
    {
      id: "faq-2",
      question: t("referral:faqTwo.title", {
        defaultValue: "How much can I earn from my referral?",
      }),
      answer: t("referral:faqTwo.content", {
        defaultValue:
          '<p class="leading-7">You can earn {{percentage}} of their wager activity as commissions + {{amount}} per referral.</p>',
        amount: "$1200",
        percentage: "50%",
      }),
    },
    {
      id: "faq-3",
      question: t("referral:faqThree.title", {
        defaultValue:
          "What is the $1200 USD reward and how does it work?",
        amount: "$1200",
      }),
      answer: t("referral:faqThree.content", {
        defaultValue:
          '<p class="leading-7">There is a {{amount}} USD reward for each referral you bring to {{gameLink}}. This USD reward is given in {{parts}} parts as your referral level goes up from {{level}}.</p>',
        amount: "$1200",
        parts: "16",
        level: "VIP2 to VIP80",
        gameLink: websiteLink,
      }),
    },
    {
      id: "faq-4",
      question: t("referral:faqFour.title", {
        defaultValue:
          "I have a big audience. How can I get a special deal?",
      }),
      answer: t("referral:faqFour.content", {
        defaultValue:
          '<p class="leading-7">If you have a website with good traffic or a social media account with a big audience, you can email us at {{emailLink}}</p>',
        emailLink,
      }),
    },
    {
      id: "faq-5",
      question: t("referral:faqFive.title", {
        defaultValue:
          "How many affiliate links can I create if I have different websites/ social media accounts?",
      }),
      answer: t("referral:faqFive.content", {
        defaultValue:
          '<p class="leading-7">You can create up to {{codes}} unique codes for different sources of traffic</p>',
        codes: "20",
      }),
    },
    {
      id: "faq-6",
      question: t("referral:faqSix.title", {
        defaultValue: "Can I see the data of my referral?",
      }),
      answer: t("referral:faqSix.content", {
        defaultValue:
          '<p class="leading-7">Yes, Transparency, Trust, and Fairness are part of {{gameLink}}\'s core values. Data like username, total wager and commission earned are all available in the "My Commissions" and "Referral Rewards" tab.</p>',
        gameLink: websiteLink,
      }),
    },
    {
      id: "faq-7",
      question: t("referral:faqSeven.title", {
        defaultValue:
          "Can I share the commission rewards with my referrals?",
      }),
      answer: t("referral:faqSeven.content", {
        defaultValue:
          '<p class="leading-7">Yes, you can share the commission rewards with your referrals by clicking "create new campaign" and setting the commission split under the "Campaigns" tab.</p>',
      }),
    },
    {
      id: "faq-8",
      question: t("referral:faqEight.title", {
        defaultValue:
          "What is an indirect referral and what can I earn from them?",
      }),
      answer: t("referral:faqEight.content", {
        defaultValue:
          '<p class="leading-7">An indirect referral is an active player that comes in from the invite link of one of your direct referrals. If your VIP level is higher than the VIP level of your direct referral, you can also earn commission arising from your indirect referral.</p>',
      }),
    },
  ];

  return (
    <div className="w-full px-0 sm:px-15">
      <h2 className="text-lg sm:text-xl font-bold text-base-content text-center mb-6">
        {t("referral:faq", { defaultValue: "FAQ" })}
      </h2>
      <Accordion type="multiple" className="w-full flex flex-col gap-3">
        {faqItems.map((item) => (
          <AccordionItem
            key={item.id}
            value={item.id}
            className="bg-base-200 rounded-field px-4 sm:px-6"
          >
            <AccordionTrigger className="text-left text-xs sm:text-sm font-semibold text-base-content/70 hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-base-content/50 text-xs sm:text-sm leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: item.answer }} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
