import { useState } from "react";
import AboutUs from "./AboutUs";
import ResponsibleGaming from "./ResponsibleGaming.tsx";
import TermOfService from "./TermOfService.tsx";
import { NavScrollBar, TBar } from "./NavScrollBar.tsx";

export function Index() {
  const [navIndex, setNavIndex] = useState<TBar>("aboutUs");

  return <div>
    <NavScrollBar setNavIndex={setNavIndex} />
    {navIndex === "aboutUs" && <AboutUs />}
    {navIndex === "responsibleGaming" && <ResponsibleGaming />}
    {navIndex === "termsOfService" && <TermOfService />}
  </div>;
}
