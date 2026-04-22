const express = require('express');
const { protect, adminOnly } = require('../middlewares/auth');
const { upload, uploadImage } = require('../controllers/uploadController');

const router = express.Router();

router.post('/', protect, adminOnly, upload.single('image'), uploadImage);

module.exports = router;
