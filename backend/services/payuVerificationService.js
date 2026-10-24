import crypto from "crypto";
import axios from "axios";

export const verifyPayUTransaction = async (txnid) => {
    const key = process.env.PAYU_KEY;
    const salt = process.env.PAYU_SALT;

    if (!key || !salt) {
        throw new Error("PayU credentials are missing");
    }

    const hashString = `${key}|verify_payment|${txnid}|${salt}`;

    const hash = crypto
        .createHash("sha512")
        .update(hashString)
        .digest("hex");

    const data = new URLSearchParams({
        key,
        command: "verify_payment",
        var1: txnid,
        hash
    });

    const response = await axios.post(
        "https://test.payu.in/merchant/postservice?form=2",
        data.toString(),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            timeout: 10000
        }
    );

    return response.data;
};