import { env } from "process";

const stage = env.STAGE || "dev";
export const baseUrl =
  stage === "dev" ? "http://localhost:8000/api" : "/weather-twin/api";

export const socketUrl =
  stage === "dev" ? "ws://localhost:8000/api/ws" : "/weather-twin/api/ws";
