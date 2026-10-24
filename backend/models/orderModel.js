import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            seller: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            name:{
                type: String,
                required: true
            },
            price: {
                type: Number,
                min: 1,
                required: true
            },
            quantity: {
                type: Number,
                min: 1,
                default: 1,
                required: true
            },
            fulfillmentStatus: {
                type: String,
                enum: [
                    "pending",
                    "processing",
                    "shipped",
                    "delivered",
                    "cancelled"
                ],
                default: "pending",
                required: true
            }
        }
    ],
    totalPrice: {
        type: Number,
        min: 0,
        required: true
    },
    shippingAddress: {
        phone: {
            type: String,
            required: true,
            match: [
                /^[6-9]\d{9}$/,
                "Enter a valid 10-digit Indian mobile number"
            ]
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true,
            default: "India"
        }
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
        required: true
    },
    refundStatus: {
        type: String,
        enum: ["none", "required", "pending", "refunded", "failed"],
        default: "none",
        required: true
    },

    refundAmount: {
        type: Number,
        default: null,
        min: 0
    },

    refundRequestId: {
        type: String,
        default: null
    },

    refundInitiatedAt: {
        type: Date,
        default: null
    },

    paymentPayuId: {
        type: String,
        default: null
    },

    paymentTxnId: {
        type: String,
        default: null
    },

    paymentInitiatedAt: {
        type: Date,
        default: null
    },
    paymentAttempts: [
    {
        txnid: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["initiated", "success", "failed"],
            default: "initiated",
            required: true
        },
        initiatedAt: {
            type: Date,
            default: Date.now
        },
        payuId: {
            type: String,
            default: null
        },
        capturedAmount: {
            type: Number,
            min: 0,
            default: null
        },
        refundStatus: {
            type: String,
            enum: [
                "none",
                "required",
                "pending",
                "refunded",
                "failed"
            ],
            default: "none"
        },
        refundRequestId: {
            type: String,
            default: null
       },
        refundAmount: {
            type: Number,
            min: 0,
            default: null
        },
        refundInitiatedAt: {
            type: Date,
            default: null
        },
        refundToken: {
            type: String,
            default: null
        }
    }
],
    orderStatus: {
        type: String,
        enum: [
            "pending",
            "confirmed",
            "processing",
            "cancellation_requested",
            "shipped",
            "delivered",
            "cancelled"
        ],
        default: "pending",
        required: true
    },
    cancellationRequestedAt: {
        type: Date,
        default: null
    },
    inventoryStatus: {
        type: String,
        enum: ["reserved", "restored"],
        default: "reserved",
        required: true
    }
}, {
    timestamps: true
});

const Order = mongoose.model("Order", orderSchema);
export default Order;