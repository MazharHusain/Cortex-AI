import Razorpay from "razorpay"
import dotenv from "dotenv"
dotenv.config()

export const getRazorpayConfig = (mode) => {
    const requested = String(mode || process.env.RAZORPAY_MODE || "").toLowerCase()
    const testId = process.env.RAZORPAY_TEST_KEY_ID
    const testSecret = process.env.RAZORPAY_TEST_KEY_SECRET
    const liveId = process.env.RAZORPAY_KEY_ID
    const liveSecret = process.env.RAZORPAY_KEY_SECRET
    const preferTest = requested === "test" || (requested !== "live" && process.env.NODE_ENV !== "production")
    if (requested && !["test", "live"].includes(requested)) {
        throw new Error("RAZORPAY_MODE must be either test or live")
    }
    if (preferTest && testId && testSecret) {
        return { keyId: testId, keySecret: testSecret, mode: "test" }
    }
    const keyId = liveId
    const keySecret = liveSecret
    if (preferTest && (!keyId || !keySecret || !keyId.startsWith("rzp_test_"))) {
        throw new Error("Test mode requires RAZORPAY_TEST_KEY_ID and RAZORPAY_TEST_KEY_SECRET")
    }
    if (!preferTest && (!keyId || !keySecret || !keyId.startsWith("rzp_live_"))) {
        throw new Error("Live mode requires live Razorpay credentials")
    }
    return {
        keyId,
        keySecret,
        mode: preferTest ? "test" : "live"
    }
}

export const getRazorpayClient = (mode) => {
    const config = getRazorpayConfig(mode)
    if (!config.keyId || !config.keySecret) {
        throw new Error("Razorpay keys are not configured")
    }
    return {
        config,
        client: new Razorpay({
            key_id: config.keyId,
            key_secret: config.keySecret
        })
    }
}
