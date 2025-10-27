import { useState } from "react";
import { DisplayContent } from "@/components/modal/UserFinanceModal";
import AboutUs from "./AboutUs";
import ResponsibleGaming from "./ResponsibleGaming.tsx";
import TermOfService from "./TermOfService.tsx";
import { NavScrollBar, TBar } from "./NavScrollBar.tsx";

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
