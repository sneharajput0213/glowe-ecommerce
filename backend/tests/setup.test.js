
import { connectTestDatabase } from "./testDb.js";

describe("Test database safety", () => {
  test("refuses to connect when MONGO_URI is missing", async () => {
    const originalUri = process.env.MONGO_URI;

    delete process.env.MONGO_URI;

    try {
      await expect(connectTestDatabase()).rejects.toThrow(
        "Test database URI is missing."
      );
    } finally {
      if (originalUri === undefined) {
        delete process.env.MONGO_URI;
      } else {
        process.env.MONGO_URI = originalUri;
      }
    }
  });

  test("refuses to connect to the development database", async () => {
    const originalUri = process.env.MONGO_URI;

    process.env.MONGO_URI =
      "mongodb+srv://example:example@cluster0.example.mongodb.net/glowe";

    try {
      await expect(connectTestDatabase()).rejects.toThrow(
        "Safety check failed: tests may connect only to glowe_test."
      );
    } finally {
      if (originalUri === undefined) {
        delete process.env.MONGO_URI;
      } else {
        process.env.MONGO_URI = originalUri;
      }
    }
  });
});
