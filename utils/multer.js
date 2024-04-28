import multer from "multer";
import path from "path";

export const profileMulter = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  }),
});

export const s3Multer = multer();
