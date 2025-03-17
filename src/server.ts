import express, { Request, Response } from "express";

import {
  limitIdMiddleware,
  limitIpMiddleware,
} from "./middleware/rate-limiter-middleware";
import dotenv from "dotenv";
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

app.listen(PORT, () => {
  // main();
  console.log(`App running on port: ${PORT}`);
});
