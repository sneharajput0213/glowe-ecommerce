
import User from "../models/userModel.js";
import {
  connectTestDatabase,
  disconnectTestDatabase
} from "./testDb.js";

export async function setupTestDatabase() {
  await connectTestDatabase();
}

export async function cleanupTestDatabase() {
  await User.deleteMany({});
}

export async function closeTestDatabase() {
  await disconnectTestDatabase();
}
