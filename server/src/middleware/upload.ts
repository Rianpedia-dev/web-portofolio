import multer from "multer";

// Store file in memory to upload to Supabase Storage as a buffer
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and document types (PDF)
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/afif",
      "image/svg+xml",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const ext = file.originalname.split(".").pop()?.toLowerCase();
    const isAllowedExt = [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "avif",
      "afif",
      "svg",
      "gif",
      "pdf",
      "doc",
      "docx",
    ].includes(ext || "");

    if (allowedMimeTypes.includes(file.mimetype) || isAllowedExt) {
      cb(null, true);
    } else {
      cb(new Error("Format file tidak didukung. Hanya gambar (JPEG, PNG, WebP, AVIF, SVG) dan Dokumen (PDF, DOC/DOCX) yang diizinkan.") as any);
    }
  },
});
