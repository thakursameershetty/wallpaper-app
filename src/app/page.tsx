import { MotionConfig } from "framer-motion";
import { SmoothScroll } from "@/components/graphite/SmoothScroll";
import { GraphiteLayer } from "@/components/graphite/GraphiteLayer";
import { PencilCursor } from "@/components/graphite/PencilCursor";
import { Hero } from "@/components/graphite/Hero";
import { Nav } from "@/components/scrapbook/Nav";
import { About } from "@/components/scrapbook/About";
import { Work } from "@/components/scrapbook/Work";
import { Chapters } from "@/components/scrapbook/Chapters";
import { Footer } from "@/components/scrapbook/Footer";

export default function Home() {
  return (
    <SmoothScroll>
      <MotionConfig reducedMotion="user">
        <div className="desk graphite">
          {/* the WebGL layer sketches the hero's image in; About and Work are opaque and sit over it */}
          <GraphiteLayer trail={false} />
          <Nav />
          <PencilCursor />
          <main className="relative">
            <Hero />
            <About />
            <Work />
            <Chapters />
          </main>
          <Footer />
        </div>
      </MotionConfig>
    </SmoothScroll>
  );
}
