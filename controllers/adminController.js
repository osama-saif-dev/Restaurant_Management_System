import { asyncHandler } from "../components/asyncHandler.js";
import CustomError from "../components/customErrors.js";
import Category from "../models/categories.js";
import Subcategory from '../models/subcategories.js';
import Product from '../models/products.js';
import Offer from "../models/offers.js";
import { createProductSchema } from "../validations/createProduct.validation.js";
import { schemaResponse } from "../components/schemaResponse.js";

// Categories 
export const createCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name || name.trim() === '') {
        throw new CustomError('Category name is required', 400);
    }
    const category = await Category.create({ name });
    res.status(201).json({ message: 'Category created successfully', category });
});

export const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ categories });
});

export const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
        throw new CustomError('Category not found', 404);
    }
    res.status(200).json({ message: 'Category deleted successfully' });
});

export const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || name.trim() === '') {
        throw new CustomError('Category name is required', 400);
    }
    const category = await Category.findById(id);
    if (!category) {
        throw new CustomError('Category not found', 404);
    }
    category.name = name;
    await category.save();
    res.status(200).json({ message: 'Category updated successfully' });
});

export const getCategoryById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
        throw new CustomError('Category not found', 404);
    }
    res.status(200).json({ category });
});


// Subcategories
export const createSubcategory = asyncHandler(async (req, res) => {
    const { name, categoryId } = req.body;
    if (!name || !categoryId || name.trim() === '' || categoryId.trim() === '') {
        throw new CustomError('Name and Category ID are required', 400);
    }
    const subcategory = await Subcategory.create({
        name,
        categoryId
    });
    res.status(201).json({
        status: 'success',
        data: subcategory
    });
});

export const getAllSubcategories = asyncHandler(async (req, res) => {
    const subcategories = await Subcategory.find()
        .populate('categoryId', 'name');

    res.status(200).json({ status: 'success', data: subcategories });
});

export const getSubcategoryById = asyncHandler(async (req, res) => {
    const subcategory = await Subcategory.findById(req.params.id)
        .populate('categoryId', 'name');

    if (!subcategory) {
        throw new CustomError('Subcategory not found', 404);
    }

    res.status(200).json({
        status: 'success',
        data: subcategory
    });
});

export const updateSubcategory = asyncHandler(async (req, res) => {
    const { name, categoryId } = req.body;
    if (!name || !categoryId || name.trim() === '' || categoryId.trim() === '') {
        throw new CustomError('Name and Category ID are required', 400);
    }
    const subcategory = await Subcategory.findByIdAndUpdate(
        req.params.id,
        { name, categoryId },
        { new: true, runValidators: true }
    );

    if (!subcategory) {
        throw new CustomError('Subcategory not found', 404);
    }

    res.status(200).json({ status: 'success', data: subcategory });
});

export const deleteSubcategory = asyncHandler(async (req, res) => {
    const subcategory = await Subcategory.findByIdAndDelete(req.params.id);
    if (!subcategory) {
        throw new CustomError('Subcategory not found', 404);
    }
    res.status(200).json({ status: 'Subcategory Deleted Successfully' });
});


// Products
export const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, subcategoryId, sizes, offerId, quantity } = req.body;
    if (!name || !description || !price || !subcategoryId || !sizes || !quantity || !req.files) {
        throw new CustomError('All fields are required', 400);
    }
    schemaResponse(createProductSchema, req.body);

    const image = req.files.map(file => file.path);
    const sizesArray = Array.isArray(sizes) ? sizes : [sizes];
    if (sizesArray.some(size => !['small', 'medium', 'large'].includes(size))) {
        throw new CustomError('Invalid size value', 400);
    }

    const productData = {
        name,
        description,
        price,
        subcategoryId,
        sizes: sizesArray,
        image,
        offerId,
        quantity
    };

    if (offerId) {
        const offer = await Offer.findById(offerId);
        const discount = price * (  offer.discountPercentage / 100);
        const finalPrice = price - discount;
        productData.discountedPrice = finalPrice;
    }

    const product = await Product.create(productData);
    res.status(201).json({ status: 'success', data: product });
});

export const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find()
        .populate('subcategoryId', 'name')
        .populate('sizes');
    res.status(200).json({ status: 'success', data: products });
});

export const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('subcategoryId', 'name')
        .populate('sizes');
    if (!product) {
        throw new CustomError('Product not found', 404);
    }
    res.status(200).json({ status: 'success', data: product });
});

export const updateProduct = asyncHandler(async (req, res) => {
    const { name, description, price, subcategoryId, sizes, offerId, quantity } = req.body;
    if (!name || !description || !price || !sizes || !subcategoryId || !quantity) {
        throw new CustomError('All fields are required', 400);
    }
    schemaResponse(createProductSchema, req.body);
    const sizesArray = Array.isArray(sizes) ? sizes : [sizes];
    if (sizesArray.some(size => !['small', 'medium', 'large'].includes(size))) {
        throw new CustomError('Invalid size value', 400);
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
        throw new CustomError('Product not found', 404);
    }

    if (offerId) {
        const offer = await Offer.findById(offerId);
        const discount = price * ( offer.discountPercentage / 100 );
        const finalPrice = price - discount;
        product.discountedPrice = finalPrice;
    }

    product.name = name;
    product.description = description;
    product.price = price;
    product.subcategoryId = subcategoryId;
    product.sizes = sizesArray;
    product.offerId = offerId;
    product.quantity = quantity;

    if (req.files) {
        const image = req.files.map(file => file.path);
        product.image = image;
    }
    await product.save();
    res.status(200).json({ status: 'success', data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
        throw new CustomError('Product not found', 404);
    }
    res.status(204).json({ status: 'success', message: 'Product deleted successfully' });
});


// Offers
export const createOffer = asyncHandler(async (req, res) => {
    const { startDate, endDate, discountPercentage } = req.body;
    if (!startDate || !endDate || !discountPercentage) {
        throw new CustomError('All fields are required', 400);
    }
    const offer = await Offer.create(req.body);
    res.status(201).json({ status: 'success', data: offer });
});

export const getAllOffers = asyncHandler(async (req, res) => {
    const offers = await Offer.find({ endDate: { $gte: new Date() } });
    res.status(200).json({ status: 'success', data: offers });
});

export const getOfferById = asyncHandler(async (req, res) => {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
        throw new CustomError('Offer not found', 404);
    }
    res.status(200).json({ status: 'success', data: offer });
});

export const updateOffer = asyncHandler(async (req, res) => {
    const { startDate, endDate, discountPercentage } = req.body;            
    if (!startDate || !endDate || !discountPercentage) {
        throw new CustomError('All fields are required', 400);
    }
    const offer = await Offer.findByIdAndUpdate(
        req.params.id,
        { startDate, endDate, discountPercentage },     
        { new: true, runValidators: true }
    );

    if (!offer) {
        throw new CustomError('Offer not found', 404);
    }   
    res.status(200).json({ status: 'success', data: offer });
});

export const deleteOffer = asyncHandler(async (req, res) => {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) {
        throw new CustomError('Offer not found', 404);
    }
    res.status(204).json({ status: 'success', message: 'Offer deleted successfully' });
}); 


