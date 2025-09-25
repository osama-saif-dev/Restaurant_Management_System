import express from 'express';
import checkRole from '../middlewares/checkRole.js';
import { 
    createCategory, createSubcategory, deleteCategory, deleteSubcategory,
    getAllCategories, getCategoryById, getSubcategoryById, getAllSubcategories,
    updateCategory, updateSubcategory, createProduct, getAllProducts, getProductById,
     updateProduct, deleteProduct, getAllOffers, getOfferById, updateOffer, deleteOffer,
     createOffer
} from '../controllers/adminController.js';
import upload from '../libs/uploads.js';
import { protecteRoute } from '../middlewares/protectRoutes.js';

const router = express.Router();
router.use(protecteRoute);
router.use(checkRole('admin'));

// Categories
router.post('/create-category', createCategory);
router.get('/categories', getAllCategories);
router.get('/categories/:id', getCategoryById);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Subcategories
router.post('/create-subcategory', createSubcategory);
router.get('/subcategories', getAllSubcategories);
router.get('/subcategories/:id', getSubcategoryById);
router.put('/subcategories/:id', updateSubcategory);
router.delete('/subcategories/:id', deleteSubcategory);

// Products
router.post('/create-product', upload.any('image'), createProduct);
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.put('/products/:id', upload.any('image'), updateProduct);
router.delete('/products/:id', deleteProduct);

// offers
router.post('/create-offer', createOffer);
router.get('/offers', getAllOffers);
router.get('/offers/:id', getOfferById);
router.put('/offers/:id', updateOffer);
router.delete('/offers/:id', deleteOffer);

export default router;