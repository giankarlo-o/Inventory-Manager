const { MongoClient } = require('mongodb');

const CONNECTION_STRING = 'mongodb://127.0.0.1:27017';
const DATABASE_NAME = 'inventoryManager';

let client;
let database;

const connectDB = async () => {
    try {
        client = await MongoClient.connect(CONNECTION_STRING);
        database = client.db(DATABASE_NAME);
        console.log('MongoDB successfully connected');
    } catch (error) {
        console.error('MongoDB connection failed', error);
        throw error;
    }
};

const getDB = () => {
    if (!database) {
        throw new Error('Database not connected');
    }

    return database;
};

module.exports = { connectDB, getDB };