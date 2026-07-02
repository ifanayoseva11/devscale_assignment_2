import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { WorkoutPlanService } from "./services.js";
import {
  WorkoutPlanIdParamSchema,
  WorkoutPlanListQuerySchema,
  UserWorkoutInputSchema,
} from "./schema.js";

type WeeklyPlanItem = {
  day?: string;
  focus?: string;
  durationMinutes?: number;
  exercises?: string[];
  coachNote?: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderWorkoutPlanView(workoutPlan: Awaited<
  ReturnType<typeof WorkoutPlanService.findById>
>): string {
  if (!workoutPlan) {
    return "";
  }

  const weeklyPlan = Array.isArray(workoutPlan.weeklyPlan)
    ? (workoutPlan.weeklyPlan as WeeklyPlanItem[])
    : [];

  const focusAreas = workoutPlan.focusAreas
    .map((item) => `<span class="pill">${escapeHtml(item)}</span>`)
    .join("");

  const safetyNotes = workoutPlan.safetyNotes
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  const scheduleCards = weeklyPlan
    .map((item) => {
      const exercises = Array.isArray(item.exercises)
        ? item.exercises
            .map((exercise) => `<li>${escapeHtml(exercise)}</li>`)
            .join("")
        : "";

      return `
        <section class="day-card">
          <div class="day-head">
            <div>
              <h3>${escapeHtml(item.day ?? "Sesi latihan")}</h3>
              <p>${escapeHtml(item.focus ?? "Fokus belum tersedia")}</p>
            </div>
            <span>${item.durationMinutes ?? workoutPlan.sessionMinutes} menit</span>
          </div>
          <ul class="exercise-list">
            ${exercises}
          </ul>
          <p class="coach-note">${escapeHtml(item.coachNote ?? "")}</p>
        </section>
      `;
    })
    .join("");

  const finalResponse = escapeHtml(workoutPlan.evaluatorFinalResponse).replaceAll(
    "\n",
    "<br />",
  );

  return `<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Workout Plan #${workoutPlan.id}</title>
    <style>
      :root {
        --bg: #f4efe6;
        --panel: #fffaf2;
        --ink: #1f2937;
        --muted: #6b7280;
        --accent: #db6b2d;
        --accent-soft: #f6d4bf;
        --line: #eadfce;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: Georgia, "Times New Roman", serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top left, #fff7ea 0, transparent 32%),
          linear-gradient(180deg, #f8f2e8 0%, var(--bg) 100%);
      }

      .wrap {
        max-width: 980px;
        margin: 0 auto;
        padding: 32px 20px 64px;
      }

      .hero,
      .panel,
      .day-card {
        background: rgba(255, 250, 242, 0.92);
        border: 1px solid var(--line);
        border-radius: 24px;
        box-shadow: 0 10px 30px rgba(84, 54, 31, 0.08);
      }

      .hero {
        padding: 28px;
        margin-bottom: 20px;
      }

      .eyebrow {
        display: inline-block;
        margin-bottom: 10px;
        padding: 6px 12px;
        border-radius: 999px;
        background: var(--accent-soft);
        color: #8b4518;
        font-size: 13px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      h1, h2, h3 {
        margin: 0;
        line-height: 1.2;
      }

      h1 {
        font-size: clamp(30px, 5vw, 46px);
        margin-bottom: 12px;
      }

      p {
        line-height: 1.7;
      }

      .meta {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 12px;
        margin-top: 20px;
      }

      .meta-card,
      .panel {
        padding: 18px;
      }

      .meta-card {
        border-radius: 18px;
        background: #fff;
        border: 1px solid var(--line);
      }

      .meta-card strong,
      .panel h2 {
        display: block;
        margin-bottom: 6px;
      }

      .grid {
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 20px;
        margin: 20px 0;
      }

      .pill-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 14px;
      }

      .pill {
        display: inline-flex;
        padding: 8px 14px;
        border-radius: 999px;
        background: #fff;
        border: 1px solid var(--line);
        font-size: 14px;
      }

      .day-grid {
        display: grid;
        gap: 16px;
      }

      .day-card {
        padding: 20px;
      }

      .day-head {
        display: flex;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 14px;
      }

      .day-head p,
      .coach-note,
      .muted {
        color: var(--muted);
      }

      .exercise-list,
      .note-list {
        margin: 0;
        padding-left: 20px;
      }

      .exercise-list li,
      .note-list li {
        margin-bottom: 8px;
        line-height: 1.6;
      }

      .coach-note {
        margin-top: 14px;
        padding-top: 14px;
        border-top: 1px dashed var(--line);
      }

      @media (max-width: 800px) {
        .grid {
          grid-template-columns: 1fr;
        }

        .day-head {
          flex-direction: column;
        }
      }
    </style>
  </head>
  <body>
    <main class="wrap">
      <section class="hero">
        <span class="eyebrow">AI Workout Planner</span>
        <h1>${escapeHtml(workoutPlan.primaryGoal || "Workout Plan")}</h1>
        <p>${finalResponse || escapeHtml(workoutPlan.summary)}</p>
        <div class="meta">
          <div class="meta-card">
            <strong>Level</strong>
            <span>${escapeHtml(workoutPlan.fitnessLevel || "-")}</span>
          </div>
          <div class="meta-card">
            <strong>Frekuensi</strong>
            <span>${workoutPlan.daysPerWeek} kali per minggu</span>
          </div>
          <div class="meta-card">
            <strong>Durasi</strong>
            <span>${workoutPlan.sessionMinutes} menit per sesi</span>
          </div>
          <div class="meta-card">
            <strong>Skor evaluator</strong>
            <span>${workoutPlan.evaluatorScore || 0}/100</span>
          </div>
        </div>
      </section>

      <section class="grid">
        <article class="panel">
          <h2>Fokus latihan</h2>
          <p class="muted">${escapeHtml(workoutPlan.summary || "-")}</p>
          <div class="pill-row">${focusAreas}</div>
        </article>

        <aside class="panel">
          <h2>Catatan penting</h2>
          <ul class="note-list">
            ${safetyNotes || "<li>Belum ada catatan tambahan.</li>"}
          </ul>
        </aside>
      </section>

      <section class="day-grid">
        ${scheduleCards}
      </section>
    </main>
  </body>
</html>`;
}

export const workoutPlanRouter = new Hono()
  .get("/", zValidator("query", WorkoutPlanListQuerySchema), async (c) => {
    const { page, limit } = c.req.valid("query");
    const result = await WorkoutPlanService.findMany(page, limit);
    return c.json(result);
  })
  .get("/:id/view", zValidator("param", WorkoutPlanIdParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const workoutPlan = await WorkoutPlanService.findById(id);

    if (!workoutPlan) {
      return c.html("<h1>Workout plan not found</h1>", 404);
    }

    return c.html(renderWorkoutPlanView(workoutPlan));
  })
  .get("/:id", zValidator("param", WorkoutPlanIdParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    const workoutPlan = await WorkoutPlanService.findById(id);

    if (!workoutPlan) {
      return c.json({ error: "Workout plan not found" }, 404);
    }

    return c.json(workoutPlan);
  })
  .post("/", zValidator("json", UserWorkoutInputSchema), async (c) => {
    const { input } = c.req.valid("json");
    const workoutPlan = await WorkoutPlanService.createPending(input);

    return c.json(
      {
        message: "Workout plan created successfully",
        workoutPlanId: workoutPlan.id,
        status: workoutPlan.status,
      },
      201,
    );
  });
