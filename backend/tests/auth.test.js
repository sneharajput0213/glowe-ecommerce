
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/userModel.js";
import {
  setupTestDatabase,
  cleanupTestDatabase,
  closeTestDatabase
} from "./dbSetup.js";

beforeAll(async () => {
  await setupTestDatabase();
});

beforeEach(async () => {
  await cleanupTestDatabase();
});

afterAll(async () => {
  await closeTestDatabase();
});

describe("POST /api/auth/register", () => {
  test("registers a valid user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "SecurePass123",
        phone: "9876543210"
      });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe("test@example.com");
    expect(response.body.user.role).toBe("customer");
    expect(response.body.token).toBeDefined();
    expect(response.body.user.password).toBeUndefined();

    const savedUser = await User.findOne({
      email: "test@example.com"
    });

    expect(savedUser).not.toBeNull();
    expect(savedUser.password).not.toBe("SecurePass123");
  });

  test("rejects an invalid email", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "not-an-email",
        password: "SecurePass123",
        phone: "9876543210"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid registration details");
  });

  test("rejects a weak password", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "weak@example.com",
        password: "123",
        phone: "9876543210"
      });

    expect(response.status).toBe(400);
  });

  test("does not allow the client to register as admin", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "role-test@example.com",
        password: "SecurePass123",
        phone: "9876543210",
        role: "admin"
      });

    expect(response.status).toBe(201);
    expect(response.body.user.role).toBe("customer");
  });

  test("rejects duplicate email registration", async () => {
    const userData = {
      name: "Test User",
      email: "duplicate@example.com",
      password: "SecurePass123",
      phone: "9876543210"
    };

    await request(app)
      .post("/api/auth/register")
      .send(userData);

    const response = await request(app)
      .post("/api/auth/register")
      .send(userData);

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("User already exists");
  });
});
