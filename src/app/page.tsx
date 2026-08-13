"use client";

import { useFolders } from "@/context/FolderContext";
import { useImage } from "@/context/ImageContext";
import { useSearch } from "@/context/SearchContext";

export default function Home() {
  const { folders } = useFolders();
  const { viewImage } = useImage();
  const { searchQuery } = useSearch();

  // Extract all images from all folders into a single flat array, filter by search query
  const allImages = folders.flatMap(folder => folder.images).filter(src => src.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col items-center min-h-screen pt-6 px-5 pb-10">
      {allImages.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400 mt-10 text-center max-w-sm">
          No images uploaded yet. Create a collection in /admin to see images here.
        </p>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6 w-full max-w-[1200px]">
          {allImages.map((src, index) => (
            <div key={index} className="break-inside-avoid relative overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow mb-6 cursor-pointer group" onClick={() => viewImage(src)}>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10"></div>
              <img
                src={src}
                alt={`Uploaded image ${index + 1}`}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
