
const stage = process.env.NEXT_PUBLIC_STAGE;

console.log(stage)
export const baseUrl =
  stage === "dev" ? "http://localhost:8000/api" : "https://wt.andresduvvuri.com/api";

export const socketUrl =
  stage === "dev" ? "ws://localhost:8000/api/ws" : "wss://wt.andresduvvuri.com/api/ws";
