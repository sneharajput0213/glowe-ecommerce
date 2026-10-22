import { z } from "zod";

const priceSchema = z
  .union([z.string(), z.number()])
  .transform((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return NaN;
    }

    return Number(value);
  })
  .pipe(
    z.number()
      .finite()
      .min(0, "Price cannot be negative")
  );

const stockSchema = z
  .union([z.string(), z.number()])
  .transform((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return NaN;
    }

    return Number(value);
  })
  .pipe(
    z.number()
      .int("Stock must be a whole number")
      .min(0, "Stock cannot be negative")
  );

export const createProductSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(150, "Product name cannot exceed 150 characters"),

  brand: z.string()
    .trim()
    .min(2, "Brand must be at least 2 characters")
    .max(100, "Brand cannot exceed 100 characters"),

  category: z.string()
    .trim()
    .min(2, "Category must be at least 2 characters")
    .max(100, "Category cannot exceed 100 characters"),

  description: z.string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description cannot exceed 5000 characters"),

  price: priceSchema,

  countInStock: stockSchema,

  // Admins may assign products to approved sellers.
  // Ownership is enforced separately in the controller.
  seller: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid seller ID")
    .optional()

}).strict();


export const updateProductSchema = createProductSchema
  .omit({
    seller: true
  })
  .extend({
    removeImageIds: z.string()
      .default("[]")
      .transform((value, ctx) => {
        try {
          return JSON.parse(value);
        } catch {
          ctx.addIssue({
            code: "custom",
            message: "removeImageIds must be valid JSON"
          });

          return z.NEVER;
        }
      })
      .pipe(
        z.array(
          z.string().min(1, "Invalid image ID")
        ).max(5, "Cannot remove more than 5 images")
      )
  })
  .strict();

  const optionalPriceFilter = z.coerce.number()
  .finite()
  .min(0)
  .optional();

export const productQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  brand: z.string().trim().max(100).optional(),

  minPrice: optionalPriceFilter,
  maxPrice: optionalPriceFilter,

  sort: z.enum([
    "price_asc",
    "price_desc",
    "newest",
    "oldest"
  ]).optional(),

  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(9)
}).strict().refine(
  data =>
    data.minPrice === undefined ||
    data.maxPrice === undefined ||
    data.minPrice <= data.maxPrice,
  {
    message: "Minimum price cannot exceed maximum price",
    path: ["minPrice"]
  }
);

export const updateInventorySchema = z.object({
    countInStock: z.number()
        .int("Stock must be a whole number")
        .min(0, "Stock cannot be negative")
}).strict();