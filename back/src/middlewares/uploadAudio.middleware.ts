import multer from "multer";
import path from "path";
import fs from "fs";

const audioDir = path.resolve(process.cwd(), "uploads/audios");
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, audioDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    cb(null, name);
  },
});

function fileFilter(_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (file.mimetype.startsWith("audio/")) cb(null, true);
  else cb(new Error("Seulement les fichiers audio sont autorisés !"));
}

export const uploadAudio = multer({ storage, fileFilter });
