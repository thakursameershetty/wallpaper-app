"use client";

import React, { createContext, useContext, useState } from "react";
import { ImageViewer } from "@/components/ImageViewer";

interface ImageContextType {
  viewImage: (src: string) => void;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export function ImageProvider({ children }: { children: React.ReactNode }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <ImageContext.Provider value={{ viewImage: setSelectedImage }}>
      {children}
      <ImageViewer src={selectedImage} onClose={() => setSelectedImage(null)} />
    </ImageContext.Provider>
  );
}

export const useImage = () => {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error("useImage must be used within an ImageProvider");
  }
  return context;
};
