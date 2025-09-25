import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve(process.cwd(), "uploads");
const photosDir = path.join(uploadDir, "photos");
const audiosDir = path.join(uploadDir, "audios");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir, { recursive: true });
if (!fs.existsSync(audiosDir)) fs.mkdirSync(audiosDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === "photo") return cb(null, photosDir);
    if (file.fieldname === "audio") return cb(null, audiosDir);
    return cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    cb(null, name);
  },
});

function fileFilter(_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  // Autorise explicitement les champs 'photo' et 'audio' (certains navigateurs envoient application/octet-stream)
  if (file.fieldname === 'photo' || file.fieldname === 'audio') {
    return cb(null, true);
  }
  return cb(new Error("Champ de fichier non supporté"));
}

export const upload = multer({ storage });
export default upload;
