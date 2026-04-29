const { ObjectId } = require('mongodb');
const { getDB } = require('../database/mongodb');
const {
    PRODUCT_COLLECTION,
    validateProduct,
    createProductDocument,
    createProductUpdate
} = require('../database/models/Product');

const getAllProducts = async (req, res) => {
    try {
        const db = getDB();

        const products = await db
            .collection(PRODUCT_COLLECTION)
            .find()
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        const product = await db.collection(PRODUCT_COLLECTION).findOne({
            _id: new ObjectId(id)
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
            error: error.message
        });
    }
};

const createProduct = async (req, res) => {
    try {
        const db = getDB();

        const productData = {
            title: req.body.title,
            description: req.body.description,
            price: Number(req.body.price),
            quantityInStock: Number(req.body.quantityInStock)
        };

        const errors = validateProduct(productData);

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product data',
                errors
            });
        }

        const product = createProductDocument(productData);

        const result = await db.collection(PRODUCT_COLLECTION).insertOne(product);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: {
                _id: result.insertedId,
                ...product
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        const existingProduct = await db.collection(PRODUCT_COLLECTION).findOne({
            _id: new ObjectId(id)
        });

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const productData = {
            title: req.body.title ?? existingProduct.title,
            description: req.body.description ?? existingProduct.description,
            price: req.body.price !== undefined ? Number(req.body.price) : existingProduct.price,
            quantityInStock:
                req.body.quantityInStock !== undefined
                    ? Number(req.body.quantityInStock)
                    : existingProduct.quantityInStock
        };

        const errors = validateProduct(productData);

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product data',
                errors
            });
        }

        const update = createProductUpdate(productData);

        await db.collection(PRODUCT_COLLECTION).updateOne(
            {
                _id: new ObjectId(id)
            },
            {
                $set: update
            }
        );

        const updatedProduct = await db.collection(PRODUCT_COLLECTION).findOne({
            _id: new ObjectId(id)
        });

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        const result = await db.collection(PRODUCT_COLLECTION).findOneAndDelete({
            _id: new ObjectId(id)
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};