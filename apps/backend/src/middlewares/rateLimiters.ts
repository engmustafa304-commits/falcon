import rateLimit from "express-rate-limit";

const rateLimitMessage = {
  error: {
    code: "RATE_LIMIT_EXCEEDED",
    message: "تم تجاوز عدد المحاولات المسموح بها. حاول لاحقًا."
  }
};

export const apiRateLimiter = rateLimit({
  legacyHeaders: false,
  limit: 100,
  message: rateLimitMessage,
  standardHeaders: true,
  windowMs: 15 * 60 * 1000
});

export const authRateLimiter = rateLimit({
  legacyHeaders: false,
  limit: 10,
  message: rateLimitMessage,
  standardHeaders: true,
  windowMs: 15 * 60 * 1000
});

export const uploadRateLimiter = rateLimit({
  legacyHeaders: false,
  limit: 20,
  message: rateLimitMessage,
  standardHeaders: true,
  windowMs: 15 * 60 * 1000
});
