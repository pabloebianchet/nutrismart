import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Sube una imagen desde URL o base64 a Cloudinary.
 * @param {string} source  URL o data URL base64
 * @param {string} folder  Carpeta en Cloudinary (ej: "exercises")
 * @param {string} publicId Nombre del archivo (opcional)
 * @returns {Promise<string>} URL segura de la imagen subida
 */
export const uploadImage = async (source, folder = "exercises", publicId = null) => {
  const options = {
    folder,
    resource_type: "image",
    overwrite: true,
    ...(publicId && { public_id: publicId }),
  };
  const result = await cloudinary.uploader.upload(source, options);
  return result.secure_url;
};

export default cloudinary;
