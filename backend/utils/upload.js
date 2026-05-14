const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${ext}`);
  }
});

// só imagens
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Use JPEG, PNG, WEBP ou GIF.'), false);
  }
};

// upar 1 img (perfil)
const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
}).single('foto');

// upar multiplas imgs ...(máx 10)
const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).array('fotos', 10);

function handleUpload(uploadFn, req, res) {
  return new Promise((resolve, reject) => {
    uploadFn(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        reject({ status: 400, message: `Erro de upload: ${err.message}` });
      } else if (err) {
        reject({ status: 400, message: err.message });
      } else {
        resolve();
      }
    });
  });
}

// isso aqui vai DELETAR do disco (com segurança obviamente)
function deleteFile(filename) {
  if (!filename) return;
  const filePath = path.join(UPLOAD_DIR, path.basename(filename));
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

module.exports = { uploadSingle, uploadMultiple, handleUpload, deleteFile };