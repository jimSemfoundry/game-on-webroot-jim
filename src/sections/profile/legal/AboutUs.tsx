import { useTranslation } from "react-i18next";
import { Container } from "./Container.tsx";
import { TFunction } from "i18next";

const content = (t: TFunction) => [
  {
    id: "aboutUs",
    text: {
      open: true,
      title: t("aboutUs:aboutUs.title"),
      content: t("aboutUs:aboutUs.content", {
        companyRegistrationNumber: "165406",
        registeredAddress: "9",
        gameLink: `<a target="_blank" href="${import.meta.env.VITE_WEBSITE_URL || "https://1st.game"}" class="text-primary font-bold text-sm">${import.meta.env.VITE_WEBSITE_NICKNAME || "1st.game"}</a>`,
        allianceLink: `<a target="_blank" href="${"https://okvipay.com"}" class="text-primary font-bold text-sm">${"okvipay.com"}</a>`,
        supportName: import.meta.env.VITE_WEBSITE_SUPPORT_NAME || "OKVIP"
      })
      // content: `
      //     <p class="leading-7">
      //       At {{gameLink}} Alliance, we have assembled a team to bring you the latest in online entertainment, fun-filled experiences and instantaneous access to your funds. Our mission is to become the ultimate crypto gaming destination for our audience worldwide.
      //     </p>
      //     <p class="leading-7">
      //       We are a part of the OKVIP alliance: Official Sponsors of Villareal CF, AC Milan and Argentina Football Association.
      //     </p>
      //     <p class="leading-7">
      //       Check out sponsorships by our OKVIP alliance here. {{allianceLink}}
      //     </p>
      //     <br />
      //     <p class="leading-7">
      //       {{gameLink}} Alliance is owned by <span class="font-bold text-base">Omnispect B.V.</span>, a limited liability company registered in Curacao with company registration number <span class="font-bold text-base">{{companyRegistrationNumber}}</span>, with a registered address at <span class="font-bold text-base"> Abraham de Veerstraat {{registeredAddress}}, Willemstad.</span>
      //     </p>
      //     <p class="leading-7">
      //      {{gameLink}} Alliance has passed all regulatory compliance and is legally authorized to conduct gaming operations for any and all online games of chance and wagering.
      //     </p>
      // `,
    }
  }
];

export default function Index() {
  const { t } = useTranslation('aboutUs');
  return (
    <div>
      {content(t).map((item) => (
        <Container key={item.id} text={item.text} />
      ))}
    </div>
  );
}
