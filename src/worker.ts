import { Worker } from "bullmq";
import { WorkoutPlanService } from "./modules/workouts/services.js";
import { WorkoutPlanJobPayloadSchema } from "./modules/workouts/schema.js";
import {
  CREATE_WORKOUT_PLAN_JOB,
  PLAN_WORKOUT_QUEUE_NAME,
  connection,
} from "./utils/queue-config.js";
import "./utils/env.js";

export const worker = new Worker(
  PLAN_WORKOUT_QUEUE_NAME,
  async (job) => {
    if (job.name !== CREATE_WORKOUT_PLAN_JOB) {
      throw new Error(`Unknown job name: ${job.name}`);
    }

    const { workoutPlanId } = WorkoutPlanJobPayloadSchema.parse(job.data);
    return WorkoutPlanService.processWorkoutPlan(workoutPlanId);
  },
  {
    connection,
    concurrency: 1,
  },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed for workout plan processing`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});

worker.on("error", (error) => {
  console.error("Worker error:", error.message);
});

async function shutdown() {
  console.log("Shutting down worker...");
  await worker.close();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

