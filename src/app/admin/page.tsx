"use client";

import React, { useState, useRef, useEffect } from "react";
import { Folder, useFolders } from "@/context/FolderContext";
import { FolderCard } from "@/components/FolderCard";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { useImage } from "@/context/ImageContext";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableFolderWrapper({ folder, onClick }: { folder: Folder, onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folder.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`relative group ${isDragging ? 'opacity-50 scale-105 z-50 shadow-2xl' : ''}`}
    >
      <FolderCard folder={folder} className="w-[360px]" />
    </div>
  );
}

function SortableImage({ src, onDelete }: { src: string, onDelete: () => void }) {
  const { viewImage } = useImage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: src });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative aspect-square group ${isDragging ? 'opacity-70 scale-105 shadow-xl' : ''}`}
    >
      <div
        className="w-full h-full relative"
        onClick={(e) => {
          e.stopPropagation();
          viewImage(src);
        }}
      >
        <img src={src} alt="image" className="w-full h-full rounded-xl object-cover shadow-sm border border-black/5 dark:border-white/10 cursor-pointer hover:opacity-90 transition-opacity" />
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-md cursor-pointer"
        title="Delete Image"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

function CreatePostModal({
  onClose,
  folders,
  addFolder,
  updateFolder,
}: {
  onClose: () => void;
  folders: Folder[];
  addFolder: (f: Folder) => void;
  updateFolder: (id: string, f: Folder) => void;
}) {
  const [postImages, setPostImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("default-posts");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setPostImages((prev) => [...prev, ...filesArray]);

      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setPostImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (postImages.length === 0) return;
    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];
      for (const file of postImages) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('wallpaper-images')
          .upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('wallpaper-images')
          .getPublicUrl(fileName);
        uploadedUrls.push(publicUrl);
      }

      const targetFolderId = selectedCollectionId;
      let targetFolder = folders.find(f => f.id === targetFolderId);

      if (targetFolderId === "default-posts") {
        targetFolder = folders.find(f => f.name === "Posts");
      }

      if (!targetFolder && targetFolderId === "default-posts") {
        const newFolderId = crypto.randomUUID();
        const folderName = "Posts";
        const folderColor = "#111111";

        const { data: insertedData, error: dbError } = await supabase
          .from('folders')
          .insert([
            {
              id: newFolderId,
              name: folderName,
              color: folderColor,
              images: uploadedUrls,
              sort_order: 9999,
            }
          ])
          .select();

        if (dbError) throw dbError;

        addFolder(insertedData[0]);
      } else if (targetFolder) {
        const newImages = [...targetFolder.images, ...uploadedUrls];
        const { error: dbError } = await supabase
          .from('folders')
          .update({ images: newImages })
          .eq('id', targetFolder.id);

        if (dbError) throw dbError;

        updateFolder(targetFolder.id, { ...targetFolder, images: newImages });
      }

      onClose();
    } catch (error: unknown) {
      console.error(error);
      alert("Failed to create post: " + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isUploading) onClose();
      }}
    >
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[24px] w-full max-w-[500px] shadow-[0_24px_48px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[22px] text-[#111] dark:text-white font-bold tracking-tight">Create Post</h3>
          <button onClick={() => !isUploading && onClose()} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-zinc-600 dark:text-zinc-300">
              <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></line>
              <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></line>
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <label className="text-[15px] text-[#444] dark:text-zinc-300 font-semibold">Select Collection (Optional)</label>
          <select
            value={selectedCollectionId}
            onChange={(e) => setSelectedCollectionId(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 text-black dark:text-white font-medium appearance-none cursor-pointer"
          >
            <option value="default-posts">None (Default Post)</option>
            {folders.filter(f => f.name !== "Posts").map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-h-[200px] mb-6">
          <div className="grid grid-cols-3 gap-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-square rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-zinc-400 dark:text-zinc-500 mb-1">
                <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></line>
                <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></line>
              </svg>
              <span className="text-xs font-semibold text-zinc-500">Upload</span>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {previewUrls.map((url, i) => (
              <div key={i} className="relative aspect-square group">
                <img src={url} alt="preview" className="w-full h-full rounded-xl object-cover shadow-sm border border-black/5 dark:border-white/10" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-md"
                  title="Remove Image"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => !isUploading && onClose()}
            className="px-6 py-3 rounded-[14px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[15px] hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={isUploading || postImages.length === 0}
            className="px-6 py-3 rounded-[14px] bg-[#111] dark:bg-white text-white dark:text-black font-semibold text-[15px] hover:bg-[#333] dark:hover:bg-zinc-200 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isUploading ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { folders, addFolder, updateFolder, removeFolder, reorderFolders } = useFolders();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // FAB State
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  // Form state
  const [name, setName] = useState("");
  const [color, setColor] = useState("#ff9a9e");
  const [images, setImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingMore, setIsUploadingMore] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  const handleOpenModal = () => {
    setName("");
    setColor("#ff9a9e");
    setImages([]);
    setFiles([]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFiles(prev => [...prev, ...filesArray]);
      const newImageUrls = filesArray.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImageUrls]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, i) => i !== indexToRemove));
    setFiles(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleCreateFolder = async () => {
    setIsUploading(true);
    try {
      const uploadedImageUrls: string[] = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('wallpaper-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error("Error uploading image: ", uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('wallpaper-images')
          .getPublicUrl(fileName);

        uploadedImageUrls.push(publicUrl);
      }

      const finalImages = uploadedImageUrls.length > 0 ? uploadedImageUrls : images.length > 0 ? images : [
        "https://i.pinimg.com/1200x/cc/da/c6/ccdac614d96478b8e31845a39885f732.jpg",
        "https://i.pinimg.com/1200x/d5/9b/9e/d59b9e24f7ec01c87138f408999fd28b.jpg",
        "https://i.pinimg.com/1200x/80/69/e1/8069e1c4d79b4844dc35e6bb570c2eec.jpg",
        "https://i.pinimg.com/736x/11/7b/0a/117b0a8a7190ab3f0ce42edd1bf3d35f.jpg"
      ];

      const newFolderId = crypto.randomUUID();
      const folderName = name.trim() || "Untitled Collection";

      const { error: dbError } = await supabase.from('folders').insert([
        {
          id: newFolderId,
          name: folderName,
          color,
          images: finalImages
        }
      ]);

      if (dbError) {
        console.error("Error inserting folder:", dbError);
        alert("Database error: Please make sure you ran the SQL setup script in Supabase! " + dbError.message);
      } else {
        addFolder({
          id: newFolderId,
          name: folderName,
          color,
          images: finalImages
        });
      }

    } catch (error: unknown) {
      console.error(error);
      alert("An unexpected error occurred: " + (error as Error).message);
    } finally {
      setIsUploading(false);
      handleCloseModal();
    }
  };

  const handleDeleteImage = async (folderId: string, imageUrl: string) => {
    try {
      const fileName = imageUrl.split('/').pop();
      if (!fileName) return;

      const { error: storageError } = await supabase.storage.from('wallpaper-images').remove([fileName]);
      if (storageError) throw storageError;

      const folder = folders.find(f => f.id === folderId);
      if (!folder) return;
      const updatedImages = folder.images.filter(img => img !== imageUrl);

      const { error: dbError } = await supabase.from('folders').update({ images: updatedImages }).eq('id', folderId);
      if (dbError) throw dbError;

      updateFolder(folderId, { ...folder, images: updatedImages });
      setSelectedFolder(prev => prev ? { ...prev, images: updatedImages } : null);
    } catch (error: unknown) {
      console.error(error);
      alert("Failed to delete image: " + (error as Error).message);
    }
  };

  const handleUploadAdditionalImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedFolder) return;
    setIsUploadingMore(true);
    try {
      const filesArray = Array.from(e.target.files);
      const uploadedImageUrls: string[] = [];

      for (const file of filesArray) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('wallpaper-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error("Error uploading image: ", uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('wallpaper-images')
          .getPublicUrl(fileName);

        uploadedImageUrls.push(publicUrl);
      }

      if (uploadedImageUrls.length > 0) {
        const newImages = [...selectedFolder.images, ...uploadedImageUrls];
        const { error: dbError } = await supabase.from('folders').update({ images: newImages }).eq('id', selectedFolder.id);
        if (dbError) throw dbError;

        setSelectedFolder({ ...selectedFolder, images: newImages });
        updateFolder(selectedFolder.id, { ...selectedFolder, images: newImages });
      }
    } catch (error: unknown) {
      console.error(error);
      alert("Failed to upload images: " + (error as Error).message);
    } finally {
      setIsUploadingMore(false);
      if (editFileInputRef.current) editFileInputRef.current.value = "";
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedFolder) return;
    updateFolder(selectedFolder.id, selectedFolder);
    try {
      const { error } = await supabase
        .from('folders')
        .update({ name: selectedFolder.name, color: selectedFolder.color, images: selectedFolder.images })
        .eq('id', selectedFolder.id);
      if (error) throw error;
    } catch (error: unknown) {
      console.error(error);
      alert("Failed to save changes: " + (error as Error).message);
    }
    setSelectedFolder(null);
  };

  const handleUpdateFolderColor = async (folderId: string, newColor: string) => {
    try {
      const folder = folders.find(f => f.id === folderId);
      if (!folder) return;

      const { error: dbError } = await supabase.from('folders').update({ color: newColor }).eq('id', folderId);
      if (dbError) throw dbError;
    } catch (error: unknown) {
      console.error(error);
      alert("Failed to change color: " + (error as Error).message);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm("Are you sure you want to delete this entire collection?")) return;
    try {
      const folder = folders.find(f => f.id === folderId);
      if (!folder) return;

      const fileNames = folder.images.map(url => url.split('/').pop()).filter(Boolean) as string[];
      if (fileNames.length > 0) {
        await supabase.storage.from('wallpaper-images').remove(fileNames);
      }

      const { error: dbError } = await supabase.from('folders').delete().eq('id', folderId);
      if (dbError) throw dbError;

      removeFolder(folderId);
      setSelectedFolder(null);
    } catch (error: unknown) {
      console.error(error);
      alert("Failed to delete folder: " + (error as Error).message);
    }
  };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveFolderId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveFolderId(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = folders.findIndex(f => f.id === active.id);
      const newIndex = folders.findIndex(f => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderFolders(arrayMove(folders, oldIndex, newIndex));

        const updatedFolders = arrayMove(folders, oldIndex, newIndex);
        try {
          const promises = updatedFolders.map((folder, idx) =>
            supabase.from('folders').update({ sort_order: idx * 10 }).eq('id', folder.id)
          );
          await Promise.all(promises);
        } catch (error) {
          console.error("Failed to save new order to database:", error);
        }
      }
    }
  };

  const handleImageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!selectedFolder || !over || active.id === over.id) return;

    const oldIndex = selectedFolder.images.indexOf(active.id as string);
    const newIndex = selectedFolder.images.indexOf(over.id as string);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newImages = arrayMove(selectedFolder.images, oldIndex, newIndex);
      setSelectedFolder({ ...selectedFolder, images: newImages });
      updateFolder(selectedFolder.id, { ...selectedFolder, images: newImages });
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col items-center min-h-screen pt-20 px-5 pb-32 gap-12 relative">

      {/* FAB Menu */}
      <div className="fixed top-4 right-5 z-[105] flex flex-col items-end gap-3">
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={cn(
            "w-12 h-12 rounded-full bg-[#111] dark:bg-white flex items-center justify-center shadow-md transition-transform duration-300 z-50",
            isFabOpen ? "scale-[0.8] hover:scale-90" : "hover:scale-105"
          )}
        >
          <motion.div animate={{ rotate: isFabOpen ? 45 : 0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-white dark:text-black">
              <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2.5" strokeLinecap="round"></line>
              <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2.5" strokeLinecap="round"></line>
            </svg>
          </motion.div>
        </button>

        <AnimatePresence>
          {isFabOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              className="flex flex-col items-end gap-3 mt-1"
            >
              <button
                onClick={() => { setIsFabOpen(false); setIsPostModalOpen(true); }}
                className="bg-[#E5EFFF] dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-400 font-bold text-[14px] px-5 py-2.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:opacity-90 transition-opacity"
              >
                Create Post
              </button>

              <button
                onClick={() => { setIsFabOpen(false); handleOpenModal(); }}
                className="bg-[#F3E8FF] dark:bg-purple-900/30 text-[#9333EA] dark:text-purple-400 font-bold text-[14px] px-5 py-2.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:opacity-90 transition-opacity"
              >
                Create Collection
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Folders Container */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveFolderId(null)}
      >
        <div className="flex flex-wrap gap-y-[70px] gap-x-10 justify-center w-full max-w-[1200px] pt-10">
          <SortableContext
            items={folders.map(f => f.id)}
            strategy={rectSortingStrategy}
          >
            {folders.map(folder => (
              <SortableFolderWrapper key={folder.id} folder={folder} onClick={() => setSelectedFolder(folder)} />
            ))}
          </SortableContext>
        </div>
        <DragOverlay adjustScale={false} dropAnimation={null}>
          {activeFolderId ? (
            <div className="scale-105 shadow-2xl z-[9999] opacity-90 cursor-grabbing">
              <FolderCard folder={folders.find(f => f.id === activeFolderId)!} className="w-[360px]" />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[24px] w-full max-w-[340px] shadow-[0_24px_48px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-300">
            <div className="mb-6">
              <h3 className="text-[22px] text-[#111] dark:text-white font-bold tracking-tight">New Collection</h3>
            </div>

            <div className="flex flex-col gap-2 mb-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
              <label htmlFor="folderName" className="text-[15px] text-[#444] dark:text-zinc-300 font-semibold">Folder Name</label>
              <input
                type="text"
                id="folderName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Collection"
                className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-shadow text-black dark:text-white"
              />
            </div>

            <div className="flex items-center justify-between mb-6 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
              <label htmlFor="folderColor" className="text-[15px] text-[#444] dark:text-zinc-300 font-semibold">Theme Color</label>
              <input
                type="color"
                id="folderColor"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="appearance-none rounded-full w-10 h-10 border-none bg-transparent cursor-pointer p-0 overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-full shadow-sm hover:scale-105 transition-transform"
              />
            </div>

            <div className="flex flex-col gap-3 mb-8 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
              <div className="flex items-center justify-between">
                <label className="text-[15px] text-[#444] dark:text-zinc-300 font-semibold">Images</label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-sm rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                >
                  Upload
                </button>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>
              {images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar mt-2 pt-2">
                  {images.map((src, i) => (
                    <div key={i} className="relative flex-shrink-0 group">
                      <img src={src} alt="upload" className="w-14 h-14 rounded-xl object-cover shadow-sm border border-black/5 dark:border-white/10" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute -top-1.5 -right-1.5 bg-black/70 dark:bg-white/80 text-white dark:text-black rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 backdrop-blur-md shadow-md"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3">
                          <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></line>
                          <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></line>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-6 py-3 rounded-[14px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[15px] hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={isUploading}
                className="px-6 py-3 rounded-[14px] bg-[#111] dark:bg-white text-white dark:text-black font-semibold text-[15px] hover:bg-[#333] dark:hover:bg-zinc-200 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {isUploading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {selectedFolder && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedFolder(null);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[24px] w-full max-w-[500px] shadow-[0_24px_48px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={selectedFolder.color}
                  onChange={(e) => {
                    const newColor = e.target.value;
                    setSelectedFolder({ ...selectedFolder, color: newColor });
                  }}
                  title="Change Collection Color"
                  className="appearance-none rounded-full w-6 h-6 border-none bg-transparent cursor-pointer p-0 overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-full shadow-sm hover:scale-110 transition-transform flex-shrink-0"
                />
                <input
                  type="text"
                  value={selectedFolder.name}
                  onChange={(e) => setSelectedFolder({ ...selectedFolder, name: e.target.value })}
                  className="text-[22px] text-[#111] dark:text-white font-bold tracking-tight bg-transparent border-none outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 rounded-md px-1 w-full"
                />
              </div>
              <button onClick={() => setSelectedFolder(null)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-zinc-600 dark:text-zinc-300">
                  <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></line>
                  <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></line>
                </svg>
              </button>
            </div>

            <div className="flex-1 min-h-[300px]">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleImageDragEnd}
              >
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  <div
                    onClick={() => editFileInputRef.current?.click()}
                    className="relative aspect-square rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {isUploadingMore ? (
                      <div className="w-6 h-6 border-2 border-zinc-400 border-t-zinc-800 rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-zinc-400 dark:text-zinc-500 mb-1">
                          <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></line>
                          <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></line>
                        </svg>
                        <span className="text-xs font-semibold text-zinc-500">Add</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    ref={editFileInputRef}
                    onChange={handleUploadAdditionalImages}
                  />
                  <SortableContext items={selectedFolder.images} strategy={rectSortingStrategy}>
                    {selectedFolder.images.map((src) => (
                      <SortableImage key={src} src={src} onDelete={() => handleDeleteImage(selectedFolder.id, src)} />
                    ))}
                  </SortableContext>
                </div>
              </DndContext>
              {selectedFolder.images.length === 0 && !isUploadingMore && (
                <div className="h-[200px] flex items-center justify-center text-zinc-400 dark:text-zinc-500 font-medium">
                  No images left in this collection.
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <button
                onClick={() => handleDeleteFolder(selectedFolder.id)}
                className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Collection
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-6 py-2.5 rounded-xl bg-[#111] dark:bg-white text-white dark:text-black font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {isPostModalOpen && (
        <CreatePostModal
          onClose={() => setIsPostModalOpen(false)}
          folders={folders}
          addFolder={addFolder}
          updateFolder={updateFolder}
        />
      )}
    </div>
  );
}
