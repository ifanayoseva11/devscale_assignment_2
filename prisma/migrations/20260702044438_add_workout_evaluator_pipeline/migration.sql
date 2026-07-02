-- AlterTable
ALTER TABLE "WorkoutPlans" ADD COLUMN     "evaluatorFeedback" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "evaluatorFinalResponse" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "evaluatorScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "extractedProfile" JSONB,
ADD COLUMN     "recommendedStructure" JSONB;
