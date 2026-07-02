-- CreateEnum
CREATE TYPE "WorkoutPlanStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "WorkoutPlans" (
    "id" SERIAL NOT NULL,
    "userInput" TEXT NOT NULL,
    "status" "WorkoutPlanStatus" NOT NULL DEFAULT 'PENDING',
    "fitnessLevel" TEXT NOT NULL DEFAULT '',
    "primaryGoal" TEXT NOT NULL DEFAULT '',
    "daysPerWeek" INTEGER NOT NULL DEFAULT 3,
    "sessionMinutes" INTEGER NOT NULL DEFAULT 45,
    "equipment" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "focusAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "safetyNotes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weeklyPlan" JSONB,
    "summary" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutPlans_pkey" PRIMARY KEY ("id")
);
