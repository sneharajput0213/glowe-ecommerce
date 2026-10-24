import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../utils/cloudinaryUpload.js";
import { productQuerySchema } from "../validators/productValidators.js";


export const createProduct = async (req, res) => {
    const {
        name,
        brand,
        category,
        description,
        price,
        countInStock,
        seller: selectedSellerId
    } = req.validatedBody;

    const files = req.files || [];
    const uploadedImages = [];

    // Only sellers and admins can create products.
    if (!["seller", "admin"].includes(req.user.role)) {
        return res.status(403).json({
            message: "You are not authorized to create products"
        });
    }

    // Sellers cannot assign products to another seller.
    if (
        req.user.role === "seller" &&
        selectedSellerId !== undefined
    ) {
        return res.status(400).json({
            message: "Sellers cannot assign products to another seller"
        });
    }

    // New products must have Cloudinary-uploaded images.
    if (files.length === 0) {
        return res.status(400).json({
            message: "Please upload at least one product image"
        });
    }

    if (files.length > 5) {
        return res.status(400).json({
            message: "A product can have a maximum of 5 images"
        });
    }

    try {
        let sellerId;

        // Admins can create products for approved sellers.
        if (req.user.role === "admin") {
            if (
                typeof selectedSellerId !== "string" ||
                !/^[0-9a-fA-F]{24}$/.test(selectedSellerId)
            ) {
                return res.status(400).json({
                    message: "Please select a valid seller"
                });
            }

            const seller = await User.findOne({
                _id: selectedSellerId,
                role: "seller",
                isActive: true,
                sellerStatus: "approved"
            });

            if (!seller) {
                return res.status(400).json({
                    message: "Selected seller is not approved or active"
                });
            }

            sellerId = seller._id;
        } else {
            sellerId = req.user.id;
        }

        // Upload validated images to Cloudinary.
        for (const file of files) {
            const uploadedImage = await uploadImageToCloudinary(file);

            uploadedImages.push(uploadedImage);
        }

        // First uploaded image becomes the main product image.
        const mainImage = uploadedImages[0].url;

        // Create product in MongoDB.
        const createdProduct = await Product.create({
            name,
            image: mainImage,
            images: uploadedImages,
            brand,
            category,
            description,
            price,
            countInStock,
            seller: sellerId
        });

        return res.status(201).json({
            message: "Product created successfully",
            product: createdProduct
        });

    } catch (error) {
        console.error("Create product error:", error.message);

        // Remove newly uploaded images if creation fails.
        const cleanupResults = await Promise.allSettled(
            uploadedImages.map((img) =>
                deleteImageFromCloudinary(img.publicId)
            )
        );

        cleanupResults.forEach((result, index) => {
            if (result.status === "rejected") {
                console.error(
                    "Cloudinary cleanup failed:",
                    uploadedImages[index].publicId,
                    result.reason
                );
            }
        });

        return res.status(500).json({
            message: "Failed to create product"
        });
    }
};

export const getProducts = async (req, res) => {
  const parsed = productQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid product filters",
      errors: parsed.error.flatten()
    });
  }

  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    sort,
    page,
    limit
  } = parsed.data;

  const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const filter = { isActive: true };

  if (search) {
    const safeSearch = escapeRegex(search);

    filter.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { brand: { $regex: safeSearch, $options: "i" } },
      { category: { $regex: safeSearch, $options: "i" } },
      { description: { $regex: safeSearch, $options: "i" } }
    ];
  }

  if (category?.length > 0) {
    filter.category = {
      $in: category.map(
        (cat) => new RegExp(`^${escapeRegex(cat)}$`, "i")
      )
    };
  }

  if (brand) {
    filter.brand = {
      $regex: escapeRegex(brand),
      $options: "i"
    };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};

    if (minPrice !== undefined) {
      filter.price.$gte = minPrice;
    }

    if (maxPrice !== undefined) {
      filter.price.$lte = maxPrice;
    }
  }

  const sortOptions = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 }
  };

  const sortOption = sortOptions[sort] || { createdAt: -1 };

  const skip = (page - 1) * limit;

  try {
    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit),

      Product.countDocuments(filter)
    ]);

    return res.status(200).json({
      products,
      page,
      limit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit)
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};

export const getProductById = async (req, res) => {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            message: "Invalid product ID"
        });
    }
    try{
        const product = await Product.findOne({
            _id: req.params.id,
            isActive: true
        });

        if(!product){
            return res.status(404).json({
                message: "Product not found"
            });
        }
        return res.status(200).json({
            product
        });
    }catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};

export const updateProduct = async (req, res) => {
  const {
    name,
    brand,
    category,
    description,
    price,
    countInStock,
    removeImageIds
  } = req.validatedBody;

  const files = req.files || [];
  const uploadedImages = [];

  if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
    return res.status(400).json({
      message: "Invalid product ID"
    });
  }

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    // Sellers may only update their own products.
    if (
      req.user.role === "seller" &&
      product.seller.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only update your own products"
      });
    }

    const existingImages = product.images.map((img) => ({
      url: img.url,
      publicId: img.publicId
    }));

    // Check that all requested removals belong to this product.
    const existingIds = new Set(
      existingImages.map((img) => img.publicId)
    );

    if (
      new Set(removeImageIds).size !== removeImageIds.length ||
      removeImageIds.some((id) => !existingIds.has(id))
    ) {
      return res.status(400).json({
        message: "Invalid or duplicate image removal request"
      });
    }

    const imagesToKeep = existingImages.filter(
      (img) => !removeImageIds.includes(img.publicId)
    );

    const finalImageCount = imagesToKeep.length + files.length;

    if (finalImageCount > 5) {
      return res.status(400).json({
        message: "A product can have a maximum of 5 images"
      });
    }

    // Preserve legacy products that only have a main image URL.
    const legacyImage =
      existingImages.length === 0 ? product.image : null;

    if (finalImageCount === 0 && !legacyImage) {
      return res.status(400).json({
        message: "A product must have at least one image"
      });
    }

    // Upload new images.
    for (const file of files) {
      const uploaded = await uploadImageToCloudinary(file);
      uploadedImages.push(uploaded);
    }

    const finalImages = [...imagesToKeep, ...uploadedImages];

    const mainImage =
      finalImages.length > 0
        ? finalImages[0].url
        : legacyImage;

    // Save updated product details.
    product.name = name;
    product.brand = brand;
    product.category = category;
    product.description = description;
    product.price = price;
    product.countInStock = countInStock;
    product.images = finalImages;
    product.image = mainImage;

    await product.save();

    // Delete removed Cloudinary images after successful DB save.
    const imagesToDelete = existingImages.filter(
      (img) => removeImageIds.includes(img.publicId)
    );

    const deletionResults = await Promise.allSettled(
      imagesToDelete.map((img) =>
        deleteImageFromCloudinary(img.publicId)
      )
    );

    deletionResults.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          "Failed to delete old Cloudinary image:",
          imagesToDelete[index].publicId,
          result.reason
        );
      }
    });

    return res.status(200).json({
      message: "Product updated successfully",
      product
    });

  } catch (error) {
    console.error("Update product error:", error);

    // Clean up new images if upload or DB save fails.
    await Promise.allSettled(
      uploadedImages.map((img) =>
        deleteImageFromCloudinary(img.publicId)
      )
    );

    return res.status(500).json({
      message: "Failed to update product"
    });
  }
};


export const deleteProduct = async (req, res) => {
    const productId = req.params.id;

    if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
        return res.status(400).json({
            message: "Invalid product ID"
        });
    }

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (
            req.user.role !== "admin" &&
            (
                req.user.role !== "seller" ||
                product.seller.toString() !== req.user.id
            )
        ) {
            return res.status(403).json({
                message: "You are not authorized to delete this product"
            });
        }

        if (!product.isActive) {
            return res.status(400).json({
                message: "Product is already deactivated"
            });
        }

        product.isActive = false;

        await product.save();

        return res.status(200).json({
            message: "Product deactivated successfully"
        });

    } catch (error) {
        console.error("Delete product error:", error.message);

        return res.status(500).json({
            message: "Unable to deactivate product"
        });
    }
};

export const getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({
            seller: req.user.id
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            products,
            totalProducts: products.length
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};

export const getMyInventory = async (req, res) => {
    try {
        const products = await Product.find({
            seller: req.user.id
        })
            .select("name image category countInStock updatedAt")
            .sort({ name: 1 });

        return res.status(200).json({
            inventory: products,
            totalProducts: products.length
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};

export const updateMyInventory = async (req, res) => {
    try {
        const { countInStock } = req.validatedBody;
        if (
            countInStock === undefined ||
            !Number.isInteger(countInStock) ||
            countInStock < 0
        ) {
            return res.status(400).json({
                message: "Stock quantity must be a non-negative integer"
            });
        }

        if (
            countInStock === undefined ||
            !Number.isInteger(countInStock) ||
            countInStock < 0
        ) {
            return res.status(400).json({
                message: "Stock quantity must be a non-negative integer"
            });
        }

        const product = await Product.findOne({
            _id: req.validatedParams.productId,
            seller: req.user.id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        product.countInStock = countInStock;

        await product.save();

        return res.status(200).json({
            message: "Inventory updated successfully",
            product: {
                _id: product._id,
                name: product.name,
                countInStock: product.countInStock
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};

export const getBestSellers = async (req, res) => {
  try {
    const bestSellers = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          refundStatus: { $ne: "refunded" },
          orderStatus: { $ne: "cancelled" },
        },
      },
      { $unwind: "$items" },
      {
        $match: {
          "items.fulfillmentStatus": { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 4 },
    ]);

    const products = await Product.find({
      _id: { $in: bestSellers.map((item) => item._id) },
      isActive: true,
    });

    const salesMap = new Map(
      bestSellers.map((item) => [
        item._id.toString(),
        item.totalSold,
      ])
    );

    products.sort(
      (a, b) =>
        salesMap.get(b._id.toString()) -
        salesMap.get(a._id.toString())
    );

    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching best sellers",
    });
  }
};