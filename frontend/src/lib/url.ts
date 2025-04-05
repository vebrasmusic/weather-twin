import { env } from "process";

const stage = env.STAGE || "dev";
export const baseUrl =
  stage === "dev" ? "http://localhost:8000/api" : "/weather-twin/api";

console.log(baseUrl);
