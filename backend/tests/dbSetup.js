import mongoose from "mongoose";
import {
  connectTestDatabase,
  disconnectTestDatabase
} from "./testDb.js";

export async function setupTestDatabase() {
  await connectTestDatabase();
}

export async function cleanupTestDatabase() {
  if (mongoose.connection.name !== "glowe_test") {
    throw new Error("Refusing to clean a non-test database");
  }

  const collections = mongoose.connection.collections;

  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
}

export async function closeTestDatabase() {
  await disconnectTestDatabase();
}