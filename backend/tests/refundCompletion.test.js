import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import {
    setupTestDatabase,
    cleanupTestDatabase,
    closeTestDatabase
} from "./dbSetup.js";
import { restoreOrderStock } from "../services/inventoryService.js";

beforeAll(async () => {
    await setupTestDatabase();
});

beforeEach(async () => {
    await cleanupTestDatabase();
});

afterAll(async () => {
    await closeTestDatabase();
});

describe("Refund completion and inventory restoration", () => {
    test("restores stock exactly once", async () => {
        const customerId = new mongoose.Types.ObjectId();
        const sellerId = new mongoose.Types.ObjectId();

        const product = await Product.create({
            name: "Test Product",
            image: "https://example.com/product.jpg",
            brand: "Test Brand",
            category: "Fashion",
            description: "Product for refund testing",
            price: 378,
            countInStock: 5,
            seller: sellerId
        });

        const order = await Order.create({
            user: customerId,
            items: [{
                product: product._id,
                seller: sellerId,
                name: product.name,
                price: 378,
                quantity: 2
            }],
            totalPrice: 756,
            shippingAddress: {
                phone: "9876543210",
                address: "Test Address",
                city: "Mumbai",
                state: "Maharashtra",
                postalCode: "400001",
                country: "India"
            },
            paymentStatus: "paid",
            orderStatus: "cancelled",
            refundStatus: "refunded",
            inventoryStatus: "reserved",
            paymentPayuId: "test-payu-id",
            paymentAttempts: [{
                txnid: "test-txn-001",
                status: "success",
                payuId: "test-payu-id",
                capturedAmount: 756,
                refundStatus: "refunded",
                refundAmount: 756,
                refundRequestId: "test-refund-001",
                refundToken: "test-token"
            }]
        });

        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                await restoreOrderStock(order._id, session);
            });

            let updatedProduct = await Product.findById(product._id);
            let updatedOrder = await Order.findById(order._id);

            expect(updatedProduct.countInStock).toBe(7);
            expect(updatedOrder.inventoryStatus).toBe("restored");

            // Repeat the operation to verify idempotency.
            await session.withTransaction(async () => {
                await restoreOrderStock(order._id, session);
            });

            updatedProduct = await Product.findById(product._id);
            updatedOrder = await Order.findById(order._id);

            expect(updatedProduct.countInStock).toBe(7);
            expect(updatedOrder.inventoryStatus).toBe("restored");
        } finally {
            await session.endSession();
        }
    });
});
