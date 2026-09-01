import { supabase } from "../config/supabase";

export class UploadService {
  static async uploadFile(bucket: string, file: Express.Multer.File, folderPath: string = "") {
    // Sanitize and generate unique filename
    const fileExt = file.originalname.split(".").pop()?.toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;

    let contentType = file.mimetype;
    if (fileExt === "avif" || fileExt === "afif") {
      if (!contentType || contentType === "application/octet-stream") {
        contentType = "image/avif";
      }
    }

    // Upload using Supabase storage client
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file.buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw { statusCode: 400, code: "UPLOAD_FAILED", message: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      path: filePath,
      url: publicUrl,
    };
  }

  static async deleteFile(bucket: string, filePath: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw { statusCode: 400, code: "DELETE_FAILED", message: error.message };
    }

    return true;
  }
}
