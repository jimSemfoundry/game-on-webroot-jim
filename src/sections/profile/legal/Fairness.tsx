import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { Container } from "@/sections/profile/legal/Container.tsx";

const content = (t: TFunction) => [
  {
    id: "fairness",
    text: {
      title: t("fairness:fairness.title"),
      content: t("fairness:fairness.content", {

        gameLink: `<a target="_blank" href="${import.meta.env.VITE_WEBSITE_URL || "https://1st.game"}" class="text-primary font-bold text-sm">${import.meta.env.VITE_WEBSITE_NICKNAME || "1st.game"}</a>`

      })
      //   content: `
      //           <p class="leading-7">
      //             At {{gameLink}} Alliance, Fairness and Trust are the bedrock of our business. This is the reason why we only work with trusted top tier game partners to give our customers the quality experience they deserve.
      //           </p>
      //           <p class="leading-7">
      //             All games from our partners are rigorously tested for randomness by independent auditors, and are licensed by gaming regulators which subject them to frequent audits on their Random Number Generator.
      //           </p>
      //           <br />
      //           <p class="leading-7">
      //             The underlying concept of provable fairness is that players have the ability to prove and verify that their results are fair and unmanipulated. This is achieved through the use of a commitment scheme, along with cryptographic hashing.
      //           </p>
      //           <p class="leading-7">
      //             The commitment scheme is used to ensure that the player has an influence on all results generated. Cryptographic hashing is used to ensure that the casino also remains honest to this commitment scheme. Both concepts combined creates a trust-less environment when gambling online.
      //           </p>
      //           <p class="leading-7">
      //             This is simplified in the following representation:
      //           </p>
      //           <div class="leading-8 rounded-2xl text-xs font-blod bg-base-100 my-3">
      //             <p class="px-2">fair result = operators input (hashed) + customers input</p>
      //           </div>
      //           <p class="leading-7">
      //             As we work to develop our own {{gameLink}} Alliance originals, we will endeavour to post our GITHUB progress here.
      //           </p>
      //         `,
    }
  }
];

export default function Index() {
  const { t } = useTranslation('fairness');
  return (
    <div>
      {content(t).map((item) => (
        <Container key={item.id} text={item.text} />
      ))}
    </div>
  );
}
