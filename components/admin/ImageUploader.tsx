"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2, FileText, Globe } from "lucide-react";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  className?: string;
  accept?: string;
}

export function ImageUploader({
  value,
  onChange,
  bucket = "photos",
  folder = "",
  className = "",
  accept = "image/*",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);
    formData.append("folder", folder);

    const token = localStorage.getItem("jemiarian_admin_token");

    try {
      const response = await fetch(`${apiUrl}/upload`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || "Gagal mengunggah gambar");
      }

      onChange(resData.data.url);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Gagal mengunggah file. Pastikan server aktif.");
    } finally {
      setIsUploading(false);
    }
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      // Jangan kompres jika file kecil (di bawah 1MB)
      if (file.size < 1024 * 1024) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Batasi ukuran maksimal (misal: lebar/tinggi maks 1600px)
          const MAX_SIZE = 1600;
          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            } else {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Kompresi ke JPEG dengan kualitas 0.8
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            0.8
          );
        };
        img.onerror = () => resolve(file);
        img.src = event.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        try {
          const compressed = await compressImage(file);
          handleUpload(compressed);
        } catch (err) {
          handleUpload(file);
        }
      } else {
        handleUpload(file);
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 font-sans ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />

      {value ? (
        <div className="relative group w-full max-w-[200px] h-[150px] rounded-xl overflow-hidden border border-border/40 bg-secondary/10 flex flex-col items-center justify-center p-4">
          {value.toLowerCase().endsWith(".pdf") ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <FileText className="h-10 w-10 text-red-500" />
              <span className="text-[10px] text-muted-foreground font-semibold line-clamp-1 max-w-[160px]">
                {value.split("/").pop() || "CV_Resume.pdf"}
              </span>
            </div>
          ) : (() => {
            const isImageUrl = (url?: string) => {
              if (!url) return false;
              return (
                url.match(/\.(jpeg|jpg|gif|png|webp|svg|avif|afif)/i) != null ||
                url.includes("/storage/v1/object/public/")
              );
            };

            if (isImageUrl(value)) {
              return (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={value}
                  alt="Uploaded file"
                  className="w-full h-full object-cover"
                />
              );
            }

            return (
              <div className="flex flex-col items-center gap-2 text-center p-2">
                <Globe className="h-10 w-10 text-primary/50" />
                <span className="text-[9px] text-muted-foreground font-mono line-clamp-2 max-w-[160px]">
                  {value}
                </span>
              </div>
            );
          })()}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={triggerSelect}
              className="p-1.5 rounded-lg bg-background/80 hover:bg-background text-foreground text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              Ganti
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-lg bg-destructive/90 hover:bg-destructive text-destructive-foreground hover:scale-105 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={triggerSelect}
          className="border border-dashed border-border/60 hover:border-primary/50 bg-secondary/15 hover:bg-secondary/25 transition-all rounded-xl p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-2 max-w-[200px] min-h-[150px]"
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Mengunggah...</span>
            </div>
          ) : (
            <>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-foreground">
                  {accept.includes("pdf") ? "Unggah PDF" : "Unggah Gambar"}
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {accept.includes("pdf") ? "PDF s.d. 15MB" : "PNG, JPG, WebP, AVIF s.d. 15MB"}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-[10px] font-medium text-destructive font-sans">
          {error}
        </p>
      )}
    </div>
  );
}
