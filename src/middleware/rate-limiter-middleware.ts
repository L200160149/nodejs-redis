import { redisClient } from "../applications/redis";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

// Extend Request type to include rateLimitCount
declare module "express-serve-static-core" {
  interface Request {
    rateLimitCount?: number;
  }
}
const limitIpMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userIp = `users_${ip}`;
    const limitRequest = parseInt(process.env.LIMIT_REQUEST || "5", 10);
    const expired = parseInt(process.env.LIMIT_TIME_REQUEST || "60", 10);

    const reqCount = await redisClient.get(userIp);
    let count = reqCount ? parseInt(reqCount, 10) : 0;

    if (count >= limitRequest) {
      return res
        .status(429)
        .json({ message: "Too Many Requests. Try again later." });
    }

    if (count === 0) {
      await redisClient.set(userIp, "1", { EX: expired });
    } else {
      await redisClient.INCR(userIp);
    }

    // Store count in req for access in the route handler
    req.rateLimitCount = count + 1;

    return next();
  } catch (error: any) {
    console.error("Rate Limiting Error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const limitIdMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // case: get user id from extracted jwt token or api key
    // const uid = req.user.uid;

    // dummy uid
    const uid = "2d4336ec-6698-4b04-bb3a-6265a1d102db";
    const limitRequest = parseInt(process.env.LIMIT_REQUEST || "5", 10);
    const expired = parseInt(process.env.LIMIT_TIME_REQUEST || "60", 10);

    const reqCount = await redisClient.get(uid);
    const count = reqCount ? parseInt(reqCount, 10) : 0;
    if (count >= limitRequest) {
      return res
        .status(429)
        .json({ message: "Too Many Requests. Try again later." });
    }

    if (count === 0) {
      await redisClient.set(uid, 1, { EX: expired });
    } else {
      await redisClient.INCR(uid);
    }
    // Store count in req for access in the route handler
    req.rateLimitCount = count + 1;

    return next();
  } catch (error: any) {
    console.error("Rate Limiting Error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { limitIpMiddleware, limitIdMiddleware };
