
import { jest, describe, test, beforeAll, beforeEach, afterAll, expect } from "@jest/globals";
import mongoose from "mongoose";
import request from "supertest";
import jwt from "jsonwebtoken";

const mockPost = jest.fn();

jest.unstable_mockModule("axios", () => ({
    default: {
        post: mockPost
    }
}));
const { default: User } = await import("../models/userModel.js");
const { default: app } = await import("../app.js");
const { default: Order } = await import("../models/orderModel.js");
const { default: Product } = await import("../models/productModel.js");
const {
    setupTestDatabase,
    cleanupTestDatabase,
    closeTestDatabase
} = await import("./dbSetup.js");

const refundRequestId = "test-refund-request-001";
const txnid = "test-payment-001";
const payuId = "test-payu-payment-001";
const refundToken = "abcdefghijklmnopqrstuvw123456789";

let adminToken;
let orderId;
let productId;

beforeAll(async () => {
    await setupTestDatabase();

    process.env.PAYU_KEY = "test-payu-key";
    process.env.PAYU_SALT = "test-payu-salt";
});

beforeEach(async () => {
    await cleanupTestDatabase();
    mockPost.mockReset();

    const admin = await User.create({
    name: "Test Admin",
    email: "refund-admin@example.com",
    password: "SecurePass123",
    phone: "9876543210",
    role: "admin"
});

const adminId = admin._id;
const customerId = new mongoose.Types.ObjectId();
const sellerId = new mongoose.Types.ObjectId();

    adminToken = jwt.sign(
        { userId: adminId.toString(), role: "admin" },
        process.env.JWT_SECRET
    );

    const product = await Product.create({
        name: "Refund Test Product",
        image: "https://example.com/test.jpg",
        brand: "Test Brand",
        category: "Fashion",
        description: "Refund integration test product",
        price: 378,
        countInStock: 5,
        seller: sellerId
    });

    productId = product._id;

    const order = await Order.create({
        user: customerId,
        items: [{
            product: productId,
            seller: sellerId,
            name: product.name,
            price: 378,
            quantity: 1
        }],
        totalPrice: 378,
        shippingAddress: {
            phone: "9876543210",
            address: "Test Address",
            city: "Mumbai",
            state: "Maharashtra",
            postalCode: "400001",
            country: "India"
        },
        paymentStatus: "paid",
        paymentPayuId: payuId,
        orderStatus: "cancellation_requested",
        refundStatus: "pending",
        refundAmount: 378,
        refundRequestId,
        inventoryStatus: "reserved",
        paymentAttempts: [{
            txnid,
            status: "success",
            payuId,
            capturedAmount: 378,
            refundStatus: "pending",
            refundRequestId,
            refundAmount: 378,
            refundToken
        }]
    });

    orderId = order._id;

    mockPost.mockResolvedValue({
        data: {
            status: 1,
            msg: "Transaction fetched successfully",
            transaction_details: {
                [refundRequestId]: {
                    [refundRequestId]: {
                        mihpayid: payuId,
                        request_id: refundRequestId,
                        amt: "378.00",
                        action: "refund",
                        token: refundToken.slice(0, 23),
                        status: "success"
                    }
                }
            }
        }
    });
});

afterAll(async () => {
    await closeTestDatabase();
});

describe("GET refund status - successful refund", () => {
    test("cancels order and restores stock exactly once", async () => {
        const url =
            `/api/admin/refunds/${orderId}/payments/${txnid}/refund-status`;

        const firstResponse = await request(app)
            .get(url)
            .set("Authorization", `Bearer ${adminToken}`);

            console.log("AUTH DEBUG:", {
    status: firstResponse.status,
    body: firstResponse.body
});

        expect(firstResponse.status).toBe(200);
        expect(firstResponse.body.refundStatus).toBe("refunded");

        let order = await Order.findById(orderId);
        let product = await Product.findById(productId);

        expect(order.orderStatus).toBe("cancelled");
        expect(order.refundStatus).toBe("refunded");
        expect(order.inventoryStatus).toBe("restored");
        expect(product.countInStock).toBe(6);

        const secondResponse = await request(app)
            .get(url)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(secondResponse.status).toBe(200);

        order = await Order.findById(orderId);
        product = await Product.findById(productId);

        expect(order.inventoryStatus).toBe("restored");
        expect(product.countInStock).toBe(6);
    });
});
