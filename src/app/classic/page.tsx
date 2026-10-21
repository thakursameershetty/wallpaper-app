import { DeskNav } from "@/components/desk/DeskNav";
import { HeroDesk } from "@/components/desk/hero/HeroDesk";
import { Manifesto } from "@/components/desk/Manifesto";
import { MeetPencil } from "@/components/desk/MeetPencil";
import { WhatIDo } from "@/components/desk/WhatIDo";
import { WallArt } from "@/components/desk/WallArt";
import { Showreel } from "@/components/desk/Showreel";
import { Contact } from "@/components/desk/Contact";

export const metadata = { title: "Classic desk", robots: { index: false } };

export default function ClassicHome() {
  return (
    <div className="desk">
      <DeskNav />
      <main>
        <HeroDesk />
        <Manifesto />
        <MeetPencil />
        <WhatIDo />
        <WallArt />
        <Showreel />
        <Contact />
      </main>
    </div>
  );
}
