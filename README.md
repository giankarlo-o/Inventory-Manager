
# Inventory Manager (POS)

## Project Overview

Inventory Manager is a full-stack web application designed to help small businesses track and manage product inventory in real time. It functions as a simplified point-of-service (POS) system, allowing users to view available items, update stock levels, and manage product information through an easy-to-use interface.

The application is built with the MEAN stack, using an Angular frontend, a Node.js and Express backend, and a MongoDB database for persistent storage. In plain terms, this means the app has a user-facing website, a server that handles requests, and a database that saves inventory data.

## Product Purpose

- Help small businesses organize and monitor inventory.
- Provide a simple POS-style foundation for managing products and carts.
- Allow users to create, view, update, and delete product records.
- Store product and cart information reliably in MongoDB.
- Support future features such as checkout, sales tracking, and reporting.

## Core Features

- **Product Management**
  - Add new inventory items.
  - View all available products.
  - View a single product by ID.
  - Edit existing product details.
  - Delete products that are no longer needed.

- **Inventory Tracking**
  - Store product quantity levels.
  - Track how many units are currently in stock.
  - Prevent invalid stock values, such as negative quantities.
  - Validate that product quantity is stored as a whole number.

- **Product Details**
  - Each product includes:
    - Title
    - Description
    - Price
    - Quantity in stock
    - Creation timestamp
    - Last updated timestamp

- **Cart / POS Foundation**
  - Create a cart.
  - Add products to a cart.
  - Update product quantities in a cart.
  - Remove individual products from a cart.
  - Clear all items from a cart.
  - Validate that cart quantity does not exceed available inventory.
  - Store the product price at the time the item is added to the cart.
  - Calculate item totals and full cart totals for display.

- **MongoDB Product Lookup**
  - Cart items store a product ID.
  - Product information is retrieved from

## Tech Stack

- **Frontend**
  - Angular
  - TypeScript
  - HTML / CSS

- **Backend**
  - Node.js
  - Express.js

- **Database**
  - MongoDB
  - Native MongoDB Node.js driver

- **Architecture**
  - Full-stack JavaScript/TypeScript application
  - REST-style API design
  - Client-server communication between Angular and Express
  - Persistent product and cart data stored in MongoDB
  - MongoDB collections used directly through `MongoClient`

## API Endpoints

### Product Routes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Get all products |
| `GET` | `/api/products/:id` | Get one product by ID |
| `POST` | `/api/products` | Create a new product |
| `PUT` | `/api/products/:id` | Update an existing product |
| `DELETE` | `/api/products/:id` | Delete a product |

### Cart Routes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/carts` | Create a new cart |
| `GET` | `/api/carts/:cartId` | Get a cart with product details |
| `POST` | `/api/carts/:cartId/items` | Add a product to a cart |
| `PUT` | `/api/carts/:cartId/items/:productId` | Update a product quantity in a cart |
| `DELETE` | `/api/carts/:cartId/items/:productId` | Remove a product from a cart |
| `DELETE` | `/api/carts/:cartId/items` | Clear all items from a cart |

## Product Data Model

Each inventory product stores the following information:

- **Title**
  - The name of the product.
  - Required field.
  - Trimmed to remove extra spacing.

- **Description**
  - A short explanation of the product.
  - Required field.

- **Price**
  - The product cost.
  - Required field.
  - Must be `0` or greater.

- **Quantity in Stock**
  - The number of available units.
  - Required field.
  - Must be `0` or greater.
  - Must be a whole number.

- **Timestamps**
  - `createdAt` tracks when a product is created.
  - `updatedAt` tracks when a product is last updated.

Example product document:

`json { "_id": "ObjectId", "title": "Coffee Beans", "description": "One pound bag of medium roast coffee beans", "price": 12.99, "quantityInStock": 25, "createdAt": "Date", "updatedAt": "Date" }`

## Cart Data Model

The cart system is designed as a starting point for POS checkout functionality.

Each cart contains:

- **Items**
  - A list of products added to the cart.

Each cart item includes:

- **Product ID**
  - Connects the cart item to an existing product in the products collection.

- **Quantity**
  - The number of units added to the cart.
  - Must be at least `1`.
  - Cannot exceed the product’s available stock.

- **Price**
  - Stores the product price at the time it is added to the cart.
  - Helps preserve accurate pricing even if the product price changes later.

- **Calculated Values**
  - `itemTotal` is calculated from `quantity * price`.
  - `totalAmount` is calculated by adding all item totals in the cart.

Example cart document:

`json { "_id": "ObjectId", "items": , "createdAt": "Date", "updatedAt": "Date" }`

## MongoDB Concepts Demonstrated

This project uses the native MongoDB driver to demonstrate direct database knowledge, including:

- Connecting to MongoDB with `MongoClient`.
- Selecting a database with `client.db(...)`.
- Accessing collections with `db.collection(...)`.
- Creating documents with `insertOne`.
- Reading documents with `find` and `findOne`.
- Updating documents with `updateOne` and `$set`.
- Removing documents with `findOneAndDelete`.
- Removing nested cart items with `$pull`.
- Converting string IDs into MongoDB `ObjectId` values.
- Validating IDs with `ObjectId.isValid`.
- Joining cart items with product data using aggregation and `$lookup`.

## Planned Improvements

Future updates may include:

- Checkout system that automatically deducts inventory.
- Transaction history for daily sales.
- Sales reports and revenue summaries.
- Product search and filtering tools.
- Low-stock alerts.
- User authentication for staff or admin access.
- Dashboard for inventory and sales insights.
- MongoDB indexes for faster product and cart lookups.

## Skills Demonstrated

This project demonstrates foundational full-stack development skills, including:

- Building a data-driven web application.
- Designing backend REST APIs.
- Connecting a frontend interface to a backend server.
- Working directly with MongoDB collections.
- Performing CRUD operations with the MongoDB native driver.
- Validating request data before saving it to the database.
- Structuring a scalable Node.js and Express backend.
- Planning for future POS and inventory management features.

## Summary

Inventory Manager is a practical inventory and POS-style application built for small-scale business needs. It provides the core tools needed to manage product data, create carts, validate available stock, and calculate cart totals while leaving room for future checkout, reporting, and sales-tracking features.