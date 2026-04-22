const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cloudinary = require('../utils/cloudinary');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const hasCloudinaryConfig =
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

const getUploadsDir = () => {
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

const uploadImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'File is required' });

  try {
    if (hasCloudinaryConfig) {
      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const result = await cloudinary.uploader.upload(base64, {
        folder: 'agromart/products'
      });

      return res.json({ url: result.secure_url, source: 'cloudinary' });
    }

    const uploadsDir = getUploadsDir();
    const extension = path.extname(req.file.originalname || '') || '';
    const fileName = `${crypto.randomUUID()}${extension}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.promises.writeFile(filePath, req.file.buffer);

    const publicBaseUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
    return res.json({ url: `${publicBaseUrl}/uploads/${fileName}`, source: 'local' });
  } catch (error) {
    console.error('Image upload failed:', error);
    return res.status(500).json({ message: 'Image upload failed', detail: error.message });
  }
};

module.exports = {
  upload,
  uploadImage
};
