import { useState } from "react";
import AboutUs from "./AboutUs";
import ResponsibleGaming from "./ResponsibleGaming.tsx";
import TermOfService from "./TermOfService.tsx";
import { NavScrollBar, TBar } from "./NavScrollBar.tsx";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

export function Index() {
  const [navIndex, setNavIndex] = useState<TBar>("aboutUs");

  return <div>
    <NavScrollBar setNavIndex={setNavIndex} />
    <DisplayContent status={navIndex === "aboutUs"}>
      <AboutUs />
    </DisplayContent>
    <DisplayContent status={navIndex === "responsibleGaming"}>
      <ResponsibleGaming />
    </DisplayContent>
    <DisplayContent status={navIndex === "termsOfService"}>
      <TermOfService />
    </DisplayContent>
  </div>;
}
