import { Queue } from "bullmq";
import {
  PLAN_WORKOUT_QUEUE_NAME,
  CREATE_WORKOUT_PLAN_JOB,
  connection,
} from "./queue-config.js";

export { CREATE_WORKOUT_PLAN_JOB };

export const workoutPlanQueue = new Queue(PLAN_WORKOUT_QUEUE_NAME, {
  connection,
});

