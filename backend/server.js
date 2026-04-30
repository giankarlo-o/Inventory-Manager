const express = require('express');
const cors = require('cors');
const { connectDB } = require('./database/mongodb');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/transactions', transactionRoutes);

const startServer = async () => {
    await connectDB();

    app.listen(3000, () => {
        console.log('Server started on port 3000');
    });
};

startServer().catch((error) => {
    console.error('Failed to start server:', error);
});