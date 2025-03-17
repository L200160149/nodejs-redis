import express, { Request, Response } from "express";

import {
  limitIdMiddleware,
  limitIpMiddleware,
} from "./middleware/rate-limiter-middleware";
import dotenv from "dotenv";
import { redisClient } from "./applications/redis";
import { prismaClient } from "./applications/database";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get(
  "/limit-ip",
  limitIpMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    try {
      return res
        .status(200)
        .json({ message: "Request allowed", attempts: req.rateLimitCount });
    } catch (error: any) {
      console.error("error", error.message);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

app.get(
  "/limit-uid",
  limitIdMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    try {
      return res
        .status(200)
        .json({ message: "Request allowed", attempts: req.rateLimitCount });
    } catch (error: any) {
      console.error("error", error.message);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
);

app.get("/caching", async (req: Request, res: Response): Promise<any> => {
  const start = new Date().getTime();
  const cacheKey = "aggregate_users_by_location";

  try {
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.info("⏳ Caching from redis");
      const end = new Date().getTime();

      return res.status(200).json({
        message: `success (cached) in: ${end - start}ms`,
        data: JSON.parse(cachedData),
      });
    }

    console.log("⏳ Fetching from MySQL...");

    const result = await prismaClient.user.groupBy({
      by: ["location"],
      _count: { id: true },
    });

    // 10 minutes expired
    await redisClient.setEx(cacheKey, 600, JSON.stringify(result));

    const end = new Date().getTime();

    res.status(200).json({
      message: `success in: ${end - start}`,
      start: new Date(start).getMilliseconds(),
      end: new Date(end).getMilliseconds(),
      data: result,
    });
  } catch (error: any) {
    console.error("Error", error?.message);
    res.status(500).json;
    ({ message: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`App running on port: ${PORT}`);
});
