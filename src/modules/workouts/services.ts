import { generateParsedAIResponse } from "../../utils/openai.js";
import { prisma } from "../../utils/prisma.js";
import { CREATE_WORKOUT_PLAN_JOB, workoutPlanQueue } from "../../utils/queue.js";
import { buildPipelineContext } from "./pipeline-context.js";
import {
  getWorkoutEvaluatorPrompt,
  getWorkoutRequirementExtractorPrompt,
  getWorkoutStructurePlannerPrompt,
} from "./prompts.js";
import {
  type AIWorkoutPlan,
  AIWorkoutPlanSchema,
  type WorkoutEvaluation,
  WorkoutEvaluationSchema,
  type WorkoutRequirement,
  WorkoutRequirementSchema,
  type WorkoutStructure,
  WorkoutStructureSchema,
} from "./schema.js";

function getAnalysisDate(): string {
  return new Date().toISOString().split("T")[0]!;
}

export class WorkoutPlanService {
  static async createPending(userInput: string) {
    const workoutPlan = await prisma.workoutPlans.create({
      data: { userInput },
    });

    await workoutPlanQueue.add(CREATE_WORKOUT_PLAN_JOB, {
      workoutPlanId: workoutPlan.id,
    });

    return workoutPlan;
  }

  static async findById(id: number) {
    return prisma.workoutPlans.findUnique({ where: { id } });
  }

  static async findMany(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.workoutPlans.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.workoutPlans.count(),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async processWorkoutPlan(workoutPlanId: number): Promise<string> {
    await prisma.workoutPlans.update({
      where: { id: workoutPlanId },
      data: { status: "PROCESSING" },
    });

    try {
      const workoutPlan = await prisma.workoutPlans.findUniqueOrThrow({
        where: { id: workoutPlanId },
      });

      const date = getAnalysisDate();
      const extractedRequirement: WorkoutRequirement =
        await generateParsedAIResponse(
          getWorkoutRequirementExtractorPrompt(date),
          buildPipelineContext({
            UserRequest: workoutPlan.userInput,
            OutputLanguage:
              "Bahasa Indonesia untuk field yang mungkin ditampilkan ke user",
          }),
          WorkoutRequirementSchema,
        );

      const recommendedStructure: WorkoutStructure =
        await generateParsedAIResponse(
          getWorkoutStructurePlannerPrompt(date),
          buildPipelineContext({
            UserRequest: workoutPlan.userInput,
            ExtractedRequirement: extractedRequirement,
          }),
          WorkoutStructureSchema,
        );

      const evaluationResult: WorkoutEvaluation = await generateParsedAIResponse(
        getWorkoutEvaluatorPrompt(date),
        buildPipelineContext({
          UserRequest: workoutPlan.userInput,
          ExtractedRequirement: extractedRequirement,
          RecommendedStructure: recommendedStructure,
        }),
        WorkoutEvaluationSchema,
      );

      const aiWorkoutPlan: AIWorkoutPlan = AIWorkoutPlanSchema.parse({
        fitnessLevel: extractedRequirement.fitnessLevel,
        primaryGoal: extractedRequirement.primaryGoal,
        daysPerWeek: extractedRequirement.daysPerWeek,
        sessionMinutes: extractedRequirement.sessionMinutes,
        equipment: extractedRequirement.availableEquipment,
        focusAreas: recommendedStructure.focusAreas,
        summary: recommendedStructure.summary,
        safetyNotes: extractedRequirement.safetyNotes,
        weeklyPlan: recommendedStructure.weeklyPlan,
        evaluatorScore: evaluationResult.score,
        evaluatorFeedback: evaluationResult.feedback,
        evaluatorFinalResponse: evaluationResult.finalResponse,
      });

      await prisma.workoutPlans.update({
        where: { id: workoutPlanId },
        data: {
          status: "COMPLETED",
          fitnessLevel: aiWorkoutPlan.fitnessLevel,
          primaryGoal: aiWorkoutPlan.primaryGoal,
          daysPerWeek: aiWorkoutPlan.daysPerWeek,
          sessionMinutes: aiWorkoutPlan.sessionMinutes,
          equipment: aiWorkoutPlan.equipment,
          focusAreas: aiWorkoutPlan.focusAreas,
          safetyNotes: aiWorkoutPlan.safetyNotes,
          extractedProfile: extractedRequirement,
          recommendedStructure,
          summary: aiWorkoutPlan.summary,
          weeklyPlan: aiWorkoutPlan.weeklyPlan,
          evaluatorScore: aiWorkoutPlan.evaluatorScore,
          evaluatorFeedback: aiWorkoutPlan.evaluatorFeedback,
          evaluatorFinalResponse: aiWorkoutPlan.evaluatorFinalResponse,
        },
      });

      return aiWorkoutPlan.evaluatorFinalResponse;
    } catch (error) {
      await prisma.workoutPlans.update({
        where: { id: workoutPlanId },
        data: { status: "FAILED" },
      });
      throw error;
    }
  }
}
