const { ObjectId } = require('mongodb');
const { getDB } = require('../database/mongodb');
const { PRODUCT_COLLECTION } = require('../database/models/Product');
const {
    TRANSACTION_COLLECTION,
    validateTransaction,
    createTransactionDocument,
    createTransactionUpdate
} = require('../database/models/Transaction');

const buildTransactionItemsFromRequest = async (db, requestItems) => {
    const transactionItems = [];

    for (const item of requestItems) {
        const productId = item.productId || item.product?._id;

        if (!productId || !ObjectId.isValid(productId)) {
            throw new Error('Each transaction item must include a valid product ID');
        }

        const quantityPurchased = Number(item.quantityPurchased ?? item.quantity);

        if (
            !Number.isInteger(quantityPurchased) ||
            Number.isNaN(quantityPurchased) ||
            quantityPurchased < 1
        ) {
            throw new Error('Each transaction item quantity must be a whole number greater than 0');
        }

        const product = await db.collection(PRODUCT_COLLECTION).findOne({
            _id: new ObjectId(productId)
        });

        if (!product) {
            throw new Error('Product not found');
        }

        if (quantityPurchased > product.quantityInStock) {
            throw new Error(`Only ${product.quantityInStock} ${product.title} item(s) available in stock`);
        }

        transactionItems.push({
            product,
            priceAtCheckout: product.price,
            quantityPurchased
        });
    }

    return transactionItems;
};

const reduceInventoryForTransaction = async (db, items) => {
    for (const item of items) {
        await db.collection(PRODUCT_COLLECTION).updateOne(
            {
                _id: new ObjectId(item.product._id)
            },
            {
                $inc: {
                    quantityInStock: -item.quantityPurchased
                },
                $set: {
                    updatedAt: new Date()
                }
            }
        );
    }
};

const restoreInventoryForTransaction = async (db, items) => {
    for (const item of items) {
        await db.collection(PRODUCT_COLLECTION).updateOne(
            {
                _id: new ObjectId(item.product._id)
            },
            {
                $inc: {
                    quantityInStock: item.quantityPurchased
                },
                $set: {
                    updatedAt: new Date()
                }
            }
        );
    }
};

const getAllTransactions = async (req, res) => {
    try {
        const db = getDB();

        const transactions = await db
            .collection(TRANSACTION_COLLECTION)
            .find()
            .sort({ transactionDate: -1 })
            .toArray();

        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions',
            error: error.message
        });
    }
};

const getTransactionById = async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid transaction ID'
            });
        }

        const transaction = await db.collection(TRANSACTION_COLLECTION).findOne({
            _id: new ObjectId(id)
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        res.status(200).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transaction',
            error: error.message
        });
    }
};

const createTransaction = async (req, res) => {
    try {
        const db = getDB();

        const transactionItems = await buildTransactionItemsFromRequest(db, req.body.items || []);

        const transactionData = {
            items: transactionItems,
            transactionDate: req.body.transactionDate
        };

        const errors = validateTransaction(transactionData);

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid transaction data',
                errors
            });
        }

        const transaction = createTransactionDocument(transactionData);

        await reduceInventoryForTransaction(db, transaction.items);

        const result = await db.collection(TRANSACTION_COLLECTION).insertOne(transaction);

        res.status(201).json({
            success: true,
            message: 'Transaction created successfully',
            data: {
                _id: result.insertedId,
                ...transaction
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to create transaction',
            error: error.message
        });
    }
};

const updateTransaction = async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid transaction ID'
            });
        }

        const existingTransaction = await db.collection(TRANSACTION_COLLECTION).findOne({
            _id: new ObjectId(id)
        });

        if (!existingTransaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        await restoreInventoryForTransaction(db, existingTransaction.items);

        const transactionItems = await buildTransactionItemsFromRequest(db, req.body.items || []);

        const transactionData = {
            items: transactionItems,
            transactionDate: req.body.transactionDate ?? existingTransaction.transactionDate
        };

        const errors = validateTransaction(transactionData);

        if (errors.length > 0) {
            await reduceInventoryForTransaction(db, existingTransaction.items);

            return res.status(400).json({
                success: false,
                message: 'Invalid transaction data',
                errors
            });
        }

        const update = createTransactionUpdate(transactionData);

        await reduceInventoryForTransaction(db, update.items);

        await db.collection(TRANSACTION_COLLECTION).updateOne(
            {
                _id: new ObjectId(id)
            },
            {
                $set: update
            }
        );

        const updatedTransaction = await db.collection(TRANSACTION_COLLECTION).findOne({
            _id: new ObjectId(id)
        });

        res.status(200).json({
            success: true,
            message: 'Transaction updated successfully',
            data: updatedTransaction
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to update transaction',
            error: error.message
        });
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid transaction ID'
            });
        }

        const transaction = await db.collection(TRANSACTION_COLLECTION).findOne({
            _id: new ObjectId(id)
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        await restoreInventoryForTransaction(db, transaction.items);

        await db.collection(TRANSACTION_COLLECTION).deleteOne({
            _id: new ObjectId(id)
        });

        res.status(200).json({
            success: true,
            message: 'Transaction deleted successfully',
            data: transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete transaction',
            error: error.message
        });
    }
};

module.exports = {
    getAllTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction
};