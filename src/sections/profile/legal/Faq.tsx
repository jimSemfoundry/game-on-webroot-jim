import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { Container } from "@/sections/profile/legal/Container.tsx";

const content = (t: TFunction) => [
  {
    id: "faqOne",
    text: {
      title: t("faq:faqOne.title"),
      content: t("faq:faqOne.content", {
        faqAge: "18"
      })
      //   content: `
      //       <p class="leading-7">
      //         You must be at least {{faqAge}} years old or of the age of majority in your jurisdiction to register. You must also be legally permitted to play online games according to the laws that are applicable to you. For more information, please read our terms of service.
      //       </p>
      //       <p class="leading-7">
      //         Gaming can be addictive, and players are advised to exercise self control.
      //       </p>
      //       `,
    }
  },
  {
    id: "faqTwo",
    text: {
      title: t("faq:faqTwo.title"),
      content: t("faq:faqTwo.content", {
        currency: "BTC ETH TON TRX BNB USDT USDC SOL NOT"
      }),
      open: false
    }
    //   content: `
    //       <p class="leading-7">
    //         We support major cryptocurrencies like {{currency}}
    //       </p>
    //     `,
  },
  {
    id: "faqThree",
    text: {
      title: t("faq:faqThree.title"),
      content: t("faq:faqThree.content"),
      open: false
    }
    //       content: `
    //           <p class="leading-7">
    // Go to your profile page and click on "Deposit", select the cryptocurrency of your choice, copy the wallet address or scan the QR code for payment.
    //           </p>
    //         `,
  },
  {
    id: "faqFour",
    text: {
      title: t("faq:faqFour.title"),
      content: t("faq:faqFour.content", {
        siteName: `<a target="_blank" href="${import.meta.env.VITE_WEBSITE_URL || "https://1st.game"}" class="text-primary font-bold text-sm">${import.meta.env.VITE_WEBSITE_NICKNAME || "1st.game"}</a>`
      }),
      open: false
      // content: `
      // <p class="leading-7">
      //   {{siteName}} offers a swap feature where you can safely and easily swap your cryptocurrencies into other cryptocurrencies. However, due to coin mixing concerns, all crypto deposited into {{siteName}} has a 1x rollover requirement, meaning you have to wager with your deposited funds at least 1 time before you can swap it.
      // </p>
      // `,
    }
  },
  {
    id: "faqFive",
    text: {
      title: t("faq:faqFive.title"),
      content: t("faq:faqFive.content"),
      open: false
      //       content: `
      //       <p class="leading-7">
      // Go to your profile page and click on "Withdraw", enter the address of the wallet you wish to withdraw to and the amount that you wish to withdraw. (Please note that there might be different fees imposed according to the different blockchains)
      //       </p>
      //     `,
    }
  },
  {
    id: "faqSix",
    text: {
      title: t("faq:faqSix.title"),
      content: t("faq:faqSix.content"),
      open: false
      //       content: `
      //       <p class="leading-7">
      // Due to the different value of cryptocurrency as well as the different mining fees involved, please check your withdrawal page for minimum withdrawal amounts pertaining to each cryptocurrency.      </p>
      //     `,
    }
  },
  {
    id: "faqSeven",
    text: {
      title: t("faq:faqSeven.title"),
      content: t("faq:faqSeven.content"),
      open: false
      //       content: `
      //       <p class="leading-7">
      // Each transaction on the blockchain requires several cycles to confirm.
      //       </p>

      //       <p class="leading-7">

      // Generally speaking, each transaction requires 5-10 minutes before it can be confirmed by the blockchain network for BTC and ETH chain; and about 1-2 minutes for TRON, TON, SOLANA chain.
      //             </p>

      // <p class="leading-7">
      // If you encounter any problem during deposit or withdrawal, you can check your transaction using the respective blockchain explorer for the network or contact our live support.
      //       </p>
      //     `,
    }
  },
  {
    id: "faqEight",
    text: {
      title: t("faq:faqEight.title"),
      content: t("faq:faqEight.content"),
      open: false
      //       content: `
      //       <p class="leading-7">
      // All confirmation information comes from the blockchain and miners for the blockchain
      //      </p>
      //     `,
    }
  },
  {
    id: "faqNine",
    text: {
      title: t("faq:faqNine.title"),
      content: t("faq:faqNine.content", {
        gameLink: `<a target="_blank" href="${import.meta.env.VITE_WEBSITE_URL || "https://1st.game"}" class="text-primary font-bold text-sm">${import.meta.env.VITE_WEBSITE_NICKNAME || "1st.game"}</a>`
      }),
      open: false
      //       content: `
      //       <p class="leading-7">
      // Transparency, Trust, and Fairness are part of {{gameLink}}'s core values and the bedrock of our business. This is the reason why we only work with trusted top tier game partners to give our customers the quality experience they deserve.
      //       </p>

      // <p class="leading-7">

      // All games from our partners are rigorously tested for randomness by independent auditors, and are licensed by gaming regulators which subject them to frequent audits on their Random Number Generator.
      //       </p>
      //     `,
    }
  },
  {
    id: "faqTen",
    text: {
      title: t("faq:faqTen.title"),
      content: t("faq:faqTen.content"),
      open: false
      //       content: `
      //       <p class="leading-7">
      // If you encounter any technical problems, please try to refresh the page. Game states are saved by our providers and you should see your previous game state when you reconnect.     </p>
      //     `,
    }
  }
];

export default function Index() {
  const { t } = useTranslation();
  return (
    <div className={"flex flex-col gap-2"}>
      {content(t).map((item) => (
        <Container key={item.id} text={item.text} />
      ))}
    </div>
  );
}
