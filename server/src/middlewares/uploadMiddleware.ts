import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  // Allow images
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  // Allow excel
  const excelTypes = /xlsx|xls|spreadsheet|excel/;

  const extname =
    imageTypes.test(path.extname(file.originalname).toLowerCase()) ||
    excelTypes.test(path.extname(file.originalname).toLowerCase());

  const mimetype =
    imageTypes.test(file.mimetype) ||
    excelTypes.test(file.mimetype) ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.mimetype === "application/vnd.ms-excel";

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Images and Excel files only!"));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
