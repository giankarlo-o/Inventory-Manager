const { ObjectId } = require('mongodb');
const { getDB } = require('../mongodb');
const { PRODUCT_COLLECTION } = require('./Product');

const CART_COLLECTION = 'carts';

const calculateTotalAmount = (items = []) => {
    return items.reduce((total, item) => {
        return total + item.quantity * item.price;
    }, 0);
};

const formatCartForResponse = (cart) => {
    if (!cart) {
        return null;
    }

    const items = cart.items || [];

    return {
        ...cart,
        items: items.map((item) => ({
            ...item,
            itemTotal: item.quantity * item.price
        })),
        totalAmount: calculateTotalAmount(items)
    };
};

const getCartWithProductInfo = async (cartId) => {
    const db = getDB();

    const carts = await db.collection(CART_COLLECTION).aggregate([
        {
            $match: {
                _id: new ObjectId(cartId)
            }
        },
        {
            $unwind: {
                path: '$items',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: PRODUCT_COLLECTION,
                localField: 'items.productId',
                foreignField: '_id',
                as: 'items.product'
            }
        },
        {
            $unwind: {
                path: '$items.product',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: '$_id',
                items: {
                    $push: '$items'
                },
                createdAt: {
                    $first: '$createdAt'
                },
                updatedAt: {
                    $first: '$updatedAt'
                }
            }
        }
    ]).toArray();

    const cart = carts[0];

    if (!cart) {
        return null;
    }

    return formatCartForResponse(cart);
};

const createEmptyCart = async () => {
    const db = getDB();
    const now = new Date();

    const cart = {
        items: [],
        createdAt: now,
        updatedAt: now
    };

    const result = await db.collection(CART_COLLECTION).insertOne(cart);

    return {
        _id: result.insertedId,
        ...cart,
        totalAmount: 0
    };
};

const addItemToCart = async (cartId, productId, quantity = 1) => {
    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error('Quantity must be a whole number greater than 0');
    }

    const db = getDB();

    const product = await db.collection(PRODUCT_COLLECTION).findOne({
        _id: new ObjectId(productId)
    });

    if (!product) {
        throw new Error('Product not found');
    }

    const cart = await db.collection(CART_COLLECTION).findOne({
        _id: new ObjectId(cartId)
    });

    if (!cart) {
        throw new Error('Cart not found');
    }

    const items = cart.items || [];

    const existingItem = items.find((item) => {
        return item.productId.toString() === productId.toString();
    });

    const currentCartQuantity = existingItem ? existingItem.quantity : 0;
    const requestedQuantity = currentCartQuantity + quantity;

    if (requestedQuantity > product.quantityInStock) {
        throw new Error(`Only ${product.quantityInStock} item(s) available in stock`);
    }

    let updatedItems;

    if (existingItem) {
        updatedItems = items.map((item) => {
            if (item.productId.toString() === productId.toString()) {
                return {
                    ...item,
                    quantity: requestedQuantity,
                    price: product.price
                };
            }

            return item;
        });
    } else {
        updatedItems = [
            ...items,
            {
                productId: product._id,
                quantity,
                price: product.price
            }
        ];
    }

    await db.collection(CART_COLLECTION).updateOne(
        {
            _id: new ObjectId(cartId)
        },
        {
            $set: {
                items: updatedItems,
                updatedAt: new Date()
            }
        }
    );

    return getCartWithProductInfo(cartId);
};

const updateCartItemQuantity = async (cartId, productId, quantity) => {
    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error('Quantity must be a whole number greater than 0');
    }

    const db = getDB();

    const product = await db.collection(PRODUCT_COLLECTION).findOne({
        _id: new ObjectId(productId)
    });

    if (!product) {
        throw new Error('Product not found');
    }

    if (quantity > product.quantityInStock) {
        throw new Error(`Only ${product.quantityInStock} item(s) available in stock`);
    }

    const cart = await db.collection(CART_COLLECTION).findOne({
        _id: new ObjectId(cartId)
    });

    if (!cart) {
        throw new Error('Cart not found');
    }

    const items = cart.items || [];

    const existingItem = items.find((item) => {
        return item.productId.toString() === productId.toString();
    });

    if (!existingItem) {
        throw new Error('Item not found in cart');
    }

    const updatedItems = items.map((item) => {
        if (item.productId.toString() === productId.toString()) {
            return {
                ...item,
                quantity,
                price: product.price
            };
        }

        return item;
    });

    await db.collection(CART_COLLECTION).updateOne(
        {
            _id: new ObjectId(cartId)
        },
        {
            $set: {
                items: updatedItems,
                updatedAt: new Date()
            }
        }
    );

    return getCartWithProductInfo(cartId);
};

const removeItemFromCart = async (cartId, productId) => {
    const db = getDB();

    await db.collection(CART_COLLECTION).updateOne(
        {
            _id: new ObjectId(cartId)
        },
        {
            $pull: {
                items: {
                    productId: new ObjectId(productId)
                }
            },
            $set: {
                updatedAt: new Date()
            }
        }
    );

    return getCartWithProductInfo(cartId);
};

const clearCart = async (cartId) => {
    const db = getDB();

    await db.collection(CART_COLLECTION).updateOne(
        {
            _id: new ObjectId(cartId)
        },
        {
            $set: {
                items: [],
                updatedAt: new Date()
            }
        }
    );

    return getCartWithProductInfo(cartId);
};

module.exports = {
    CART_COLLECTION,
    calculateTotalAmount,
    formatCartForResponse,
    getCartWithProductInfo,
    createEmptyCart,
    addItemToCart,
    updateCartItemQuantity,
    removeItemFromCart,
    clearCart
};