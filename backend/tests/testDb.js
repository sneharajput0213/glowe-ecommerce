
import mongoose from "mongoose";

export async function connectTestDatabase() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("Test database URI is missing.");
  }

  let databaseName;

  try {
    databaseName = new URL(mongoUri).pathname.slice(1);
  } catch {
    throw new Error("Test database URI is invalid.");
  }

  if (databaseName !== "glowe_test") {
    throw new Error(
      "Safety check failed: tests may connect only to glowe_test."
    );
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000
  });

  if (mongoose.connection.name !== "glowe_test") {
    await mongoose.disconnect();

    throw new Error(
      "Safety check failed: connected database is not glowe_test."
    );
  }
}

export async function disconnectTestDatabase() {
  await mongoose.disconnect();
}
