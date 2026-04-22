const express = require('express');
const {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middlewares/auth');

const router = express.Router();

router.get('/', listProducts);
router.get('/:id', getProductById);
router.post('/:id/reviews', protect, addReview);

router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
