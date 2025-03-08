import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import { DietPlan, Meal } from "@/models/diet-plan";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

// Schema for validating meal
const mealSchema = z.object({
  name: z.string().min(1, "Meal name is required"),
  description: z.string(),
  calories: z.number().min(0, "Calories must be a positive number"),
  protein: z.number().min(0, "Protein must be a positive number"),
  carbs: z.number().min(0, "Carbs must be a positive number"),
  fats: z.number().min(0, "Fats must be a positive number"),
});

// Schema for validating diet plan request
const dietPlanSchema = z.object({
  name: z.string().min(1, "Diet plan name is required"),
  goalType: z.enum(["weight_loss", "weight_gain", "maintenance"]),
  targetCalories: z.number().min(500, "Target calories must be at least 500"),
  meals: z.array(mealSchema).min(1, "At least one meal is required"),
  notes: z.string().optional(),
});

// GET all diet plans for the authenticated user
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const { db } = await connectToDatabase();
    const dietCollection = db.collection("diet_plans");
    
    // Access user ID from the session (from the JWT token)
    const userId = (session as any).user.id;
    
    const dietPlans = await dietCollection
      .find({ userId })
      .sort({ date: -1 })
      .toArray();
    
    return NextResponse.json(dietPlans);
  } catch (error) {
    console.error("Error retrieving diet plans:", error);
    return NextResponse.json(
      { error: "Failed to retrieve diet plans" },
      { status: 500 }
    );
  }
}

// POST a new diet plan
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const validation = dietPlanSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const dietCollection = db.collection("diet_plans");
    
    // Access user ID from the session (from the JWT token)
    const userId = (session as any).user.id;
    
    const dietPlan: DietPlan = {
      ...validation.data,
      userId,
      date: new Date(),
    };
    
    const result = await dietCollection.insertOne(dietPlan);
    
    return NextResponse.json({
      message: "Diet plan saved successfully",
      planId: result.insertedId,
    });
  } catch (error) {
    console.error("Error saving diet plan:", error);
    return NextResponse.json(
      { error: "Failed to save diet plan" },
      { status: 500 }
    );
  }
} 