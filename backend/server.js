const express = require('express');
const cors = require('cors');
const { connectDB } = require('./database/mongodb');

const app = express();

app.use(cors());
app.use(express.json());

const startServer = async () => {
    await connectDB();

    app.listen(3000, () => {
        console.log('Server started on port 3000');
    });
};

startServer();