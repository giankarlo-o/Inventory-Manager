const TRANSACTION_COLLECTION = 'transactions';

const calculateTransactionTotal = (items = []) => {
    return items.reduce((total, item) => {
        return total + item.priceAtCheckout * item.quantityPurchased;
    }, 0);
};

const validateTransaction = (transaction) => {
    const errors = [];

    if (!Array.isArray(transaction.items) || transaction.items.length === 0) {
        errors.push('Transaction must include at least one item');
        return errors;
    }

    transaction.items.forEach((item, index) => {
        if (!item.product || typeof item.product !== 'object') {
            errors.push(`Item ${index + 1} must include a product object`);
        }

        if (
            typeof item.priceAtCheckout !== 'number' ||
            Number.isNaN(item.priceAtCheckout) ||
            item.priceAtCheckout < 0
        ) {
            errors.push(`Item ${index + 1} price at checkout must be 0 or greater`);
        }

        if (
            !Number.isInteger(item.quantityPurchased) ||
            Number.isNaN(item.quantityPurchased) ||
            item.quantityPurchased < 1
        ) {
            errors.push(`Item ${index + 1} quantity purchased must be a whole number greater than 0`);
        }
    });

    return errors;
};

const createTransactionDocument = ({ items, transactionDate }) => {
    const now = new Date();

    const formattedItems = items.map((item) => {
        return {
            product: item.product,
            priceAtCheckout: item.priceAtCheckout,
            quantityPurchased: item.quantityPurchased,
            itemTotal: item.priceAtCheckout * item.quantityPurchased
        };
    });

    return {
        items: formattedItems,
        totalAmount: calculateTransactionTotal(formattedItems),
        transactionDate: transactionDate ? new Date(transactionDate) : now,
        createdAt: now,
        updatedAt: now
    };
};

const createTransactionUpdate = ({ items, transactionDate }) => {
    const formattedItems = items.map((item) => {
        return {
            product: item.product,
            priceAtCheckout: item.priceAtCheckout,
            quantityPurchased: item.quantityPurchased,
            itemTotal: item.priceAtCheckout * item.quantityPurchased
        };
    });

    return {
        items: formattedItems,
        totalAmount: calculateTransactionTotal(formattedItems),
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
        updatedAt: new Date()
    };
};

module.exports = {
    TRANSACTION_COLLECTION,
    calculateTransactionTotal,
    validateTransaction,
    createTransactionDocument,
    createTransactionUpdate
};

// const reduceInventoryForTransaction = async (db, items) => {
//     for (const item of items) {
//         const result = await db.collection(PRODUCT_COLLECTION).updateOne(
//             {
//                 _id: new ObjectId(item.product._id),
//                 quantityInStock: {
//                     $gte: item.quantityPurchased
//                 }
//             },
//             {
//                 $inc: {
//                     quantityInStock: -item.quantityPurchased
//                 },
//                 $set: {
//                     updatedAt: new Date()
//                 }
//             }
//         );
//
//         if (result.matchedCount === 0) {
//             throw new Error(`Not enough ${item.product.title} available in stock`);
//         }
//     }
// };
//
// const createTransaction = async (req, res) => {
//     let insertedTransactionId = null;
//
//     try {
//         const db = getDB();
//
//         const transactionItems = await buildTransactionItemsFromRequest(db, req.body.items || []);
//
//         const transactionData = {
//             items: transactionItems,
//             transactionDate: req.body.transactionDate
//         };
//
//         const errors = validateTransaction(transactionData);
//
//         if (errors.length > 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid transaction data',
//                 errors
//             });
//         }
//
//         const transaction = createTransactionDocument(transactionData);
//
//         const result = await db.collection(TRANSACTION_COLLECTION).insertOne(transaction);
//         insertedTransactionId = result.insertedId;
//
//         await reduceInventoryForTransaction(db, transaction.items);
//
//         res.status(201).json({
//             success: true,
//             message: 'Transaction created successfully',
//             data: {
//                 _id: result.insertedId,
//                 ...transaction
//             }
//         });
//     } catch (error) {
//         if (insertedTransactionId) {
//             const db = getDB();
//
//             await db.collection(TRANSACTION_COLLECTION).deleteOne({
//                 _id: insertedTransactionId
//             });
//         }
//
//         res.status(400).json({
//             success: false,
//             message: 'Failed to create transaction',
//             error: error.message
//         });
//     }
// };