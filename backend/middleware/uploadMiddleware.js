
import multer from "multer";

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPEG, PNG, and WebP images are allowed"
      ),
      false
    );
  }
};

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },

  fileFilter,
});

export default upload;
