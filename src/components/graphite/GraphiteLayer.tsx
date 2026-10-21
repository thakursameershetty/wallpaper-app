"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const GraphiteCanvas = dynamic(() => import("./GraphiteCanvas"), { ssr: false });

/**
 * Mounts the WebGL layer where WebGL works; elsewhere the artworks' own <img>s simply stay visible.
 * `trail={false}` turns off the pencil line and the colour the cursor leaves behind.
 */
export function GraphiteLayer({ trail = true }: { trail?: boolean }) {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const supported = !!document.createElement("canvas").getContext("webgl2");
    if (!supported) return;
    document.documentElement.classList.add("gl");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- feature detection needs the DOM
    setOk(true);
    return () => document.documentElement.classList.remove("gl");
  }, []);

  return ok ? <GraphiteCanvas trail={trail} /> : null;
}
