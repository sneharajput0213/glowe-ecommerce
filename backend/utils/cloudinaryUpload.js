
import { Readable } from "stream";
import { fileTypeFromBuffer } from "file-type";
import cloudinary from "../config/cloudinary.js";

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const uploadImageToCloudinary = async (file) => {
  if (!file?.buffer) {
    throw new Error("No image file provided");
  }

  // Check the actual file contents, not just its extension
  const detectedType = await fileTypeFromBuffer(file.buffer);

  if (
    !detectedType ||
    !allowedTypes.includes(detectedType.mime)
  ) {
    throw new Error("Invalid image file. Use JPEG, PNG, or WebP.");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "glowe/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};

export const deleteImageFromCloudinary = async (publicId) => {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
};
