import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { workoutPlanRouter } from "./modules/workouts/route.js";
import "./utils/env.js";

const app = new Hono();

app.get("/", (c) =>
  c.json({
    app: "AI Workout Planner",
    status: "ok",
  }),
);

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return error.getResponse();
  }

  console.error("Unhandled error:", error);
  return c.json({ error: "Internal Server Error" }, 500);
});

app.notFound((c) => c.json({ error: "Not Found" }, 404));

app.route("/workout-plans", workoutPlanRouter);

serve(app, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});

