const express = require('express');
const { ObjectId } = require('mongodb');
const {
    createEmptyCart,
    getCartWithProductInfo,
    addItemToCart,
    updateCartItemQuantity,
    removeItemFromCart,
    clearCart
} = require('../database/models/Cart');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const cart = await createEmptyCart();

        res.status(201).json({
            success: true,
            message: 'Cart created successfully',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create cart',
            error: error.message
        });
    }
});

router.get('/:cartId', async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.cartId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid cart ID'
            });
        }

        const cart = await getCartWithProductInfo(req.params.cartId);

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cart',
            error: error.message
        });
    }
});

router.post('/:cartId/items', async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.cartId) || !ObjectId.isValid(req.body.productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid cart ID or product ID'
            });
        }

        const cart = await addItemToCart(
            req.params.cartId,
            req.body.productId,
            Number(req.body.quantity || 1)
        );

        res.status(200).json({
            success: true,
            message: 'Item added to cart successfully',
            data: cart
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to add item to cart',
            error: error.message
        });
    }
});

router.put('/:cartId/items/:productId', async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.cartId) || !ObjectId.isValid(req.params.productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid cart ID or product ID'
            });
        }

        const cart = await updateCartItemQuantity(
            req.params.cartId,
            req.params.productId,
            Number(req.body.quantity)
        );

        res.status(200).json({
            success: true,
            message: 'Cart item updated successfully',
            data: cart
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to update cart item',
            error: error.message
        });
    }
});

router.delete('/:cartId/items/:productId', async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.cartId) || !ObjectId.isValid(req.params.productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid cart ID or product ID'
            });
        }

        const cart = await removeItemFromCart(req.params.cartId, req.params.productId);

        res.status(200).json({
            success: true,
            message: 'Item removed from cart successfully',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart',
            error: error.message
        });
    }
});

router.delete('/:cartId/items', async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.cartId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid cart ID'
            });
        }

        const cart = await clearCart(req.params.cartId);

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart',
            error: error.message
        });
    }
});

module.exports = router;