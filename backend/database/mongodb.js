const { MongoClient } = require('mongodb');

const CONNECTION_STRING = 'mongodb://127.0.0.1:27017';
const DATABASE_NAME = 'inventoryManager';

let database;

const connectDB = async () => {
    try {
        const client = await MongoClient.connect(CONNECTION_STRING);
        database = client.db(DATABASE_NAME);
        console.log("MongoDB successfully connected");
    } catch (error) {
        console.error("MongoDB connection failed", error);
    }
};

const getDB = () => database;

module.exports = { connectDB, getDB };