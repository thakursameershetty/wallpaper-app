import { SmoothScroll } from "@/components/graphite/SmoothScroll";
import { GraphiteLayer } from "@/components/graphite/GraphiteLayer";
import { Nav } from "@/components/graphite/Nav";
import { PencilCursor } from "@/components/graphite/PencilCursor";
import { Hero } from "@/components/graphite/Hero";
import { Statement } from "@/components/graphite/Statement";
import { Sketchbook } from "@/components/graphite/Sketchbook";
import { Mural } from "@/components/graphite/Mural";
import { Reel } from "@/components/graphite/Reel";
import { About } from "@/components/graphite/About";
import { Contact } from "@/components/graphite/Contact";

export default function Home() {
  return (
    <SmoothScroll>
      <div className="desk graphite">
        {/* the WebGL layer sits behind the page; sections stay transparent so it shows through */}
        <GraphiteLayer />
        <Nav />
        <PencilCursor />
        <main className="relative">
          <Hero />
          <Statement />
          <Sketchbook />
          <Mural />
          <Reel />
          <About />
          <Contact />
        </main>
      </div>
    </SmoothScroll>
  );
}
