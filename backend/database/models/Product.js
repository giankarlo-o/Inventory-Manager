const PRODUCT_COLLECTION = 'products';

const validateProduct = (product) => {
    const errors = [];

    if (!product.title || typeof product.title !== 'string') {
        errors.push('Title is required and must be text');
    }

    if (!product.description || typeof product.description !== 'string') {
        errors.push('Description is required and must be text');
    }

    if (typeof product.price !== 'number' || Number.isNaN(product.price) || product.price < 0) {
        errors.push('Price is required and must be 0 or greater');
    }

    if (
        !Number.isInteger(product.quantityInStock) ||
        Number.isNaN(product.quantityInStock) ||
        product.quantityInStock < 0
    ) {
        errors.push('Quantity in stock is required and must be a whole number 0 or greater');
    }

    return errors;
};

const createProductDocument = ({ title, description, price, quantityInStock }) => {
    const now = new Date();

    return {
        title: title.trim(),
        description,
        price,
        quantityInStock,
        createdAt: now,
        updatedAt: now
    };
};

const createProductUpdate = ({ title, description, price, quantityInStock }) => {
    return {
        title: title.trim(),
        description,
        price,
        quantityInStock,
        updatedAt: new Date()
    };
};

module.exports = {
    PRODUCT_COLLECTION,
    validateProduct,
    createProductDocument,
    createProductUpdate
};