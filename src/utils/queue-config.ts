import type { ConnectionOptions } from "bullmq";
import { env } from "./env.js";

export const PLAN_WORKOUT_QUEUE_NAME = "plan-workout";
export const CREATE_WORKOUT_PLAN_JOB = "createWorkoutPlan";

export const connection: ConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  db: env.REDIS_DB,
};

