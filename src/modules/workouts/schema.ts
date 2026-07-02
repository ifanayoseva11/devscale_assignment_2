import { z } from "zod";

export const UserWorkoutInputSchema = z.object({
  input: z
    .string()
    .trim()
    .min(1, "Input cannot be empty")
    .max(2000, "Input must be at most 2000 characters"),
});

export const WorkoutPlanListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const WorkoutPlanIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const WorkoutPlanJobPayloadSchema = z.object({
  workoutPlanId: z.number().int().positive(),
});

export const WorkoutRequirementSchema = z.object({
  fitnessLevel: z.string(),
  primaryGoal: z.string(),
  daysPerWeek: z.number().int().min(1).max(7),
  sessionMinutes: z.number().int().min(10).max(180),
  availableEquipment: z.array(z.string()),
  focusAreas: z.array(z.string()),
  constraints: z.array(z.string()),
  recoveryNeeds: z.array(z.string()),
  safetyNotes: z.array(z.string()),
});

export const WorkoutStructureSchema = z.object({
  programName: z.string(),
  summary: z.string(),
  splitType: z.string(),
  focusAreas: z.array(z.string()),
  weeklyPlan: z.array(
    z.object({
      day: z.string(),
      focus: z.string(),
      durationMinutes: z.number().int().min(10).max(180),
      exercises: z.array(z.string()),
      coachNote: z.string(),
    }),
  ),
});

export const WorkoutEvaluationSchema = z.object({
  score: z.number().int().min(0).max(100),
  feedback: z.string(),
  finalResponse: z.string(),
});

export const AIWorkoutPlanSchema = z.object({
  fitnessLevel: z.string(),
  primaryGoal: z.string(),
  daysPerWeek: z.number().int().min(1).max(7),
  sessionMinutes: z.number().int().min(10).max(180),
  equipment: z.array(z.string()),
  focusAreas: z.array(z.string()),
  summary: z.string(),
  safetyNotes: z.array(z.string()),
  weeklyPlan: z.array(
    z.object({
      day: z.string(),
      focus: z.string(),
      durationMinutes: z.number().int().min(10).max(180),
      exercises: z.array(z.string()),
      coachNote: z.string().optional(),
    }),
  ),
  evaluatorScore: z.number().int().min(0).max(100),
  evaluatorFeedback: z.string(),
  evaluatorFinalResponse: z.string(),
});

export type WorkoutPlanJobPayload = z.infer<typeof WorkoutPlanJobPayloadSchema>;
export type WorkoutRequirement = z.infer<typeof WorkoutRequirementSchema>;
export type WorkoutStructure = z.infer<typeof WorkoutStructureSchema>;
export type WorkoutEvaluation = z.infer<typeof WorkoutEvaluationSchema>;
export type AIWorkoutPlan = z.infer<typeof AIWorkoutPlanSchema>;
