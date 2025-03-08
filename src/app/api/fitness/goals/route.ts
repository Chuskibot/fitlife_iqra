import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import { FitnessGoal } from "@/models/fitness-activity";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

// Schema for validating fitness goal request
const fitnessGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  target: z.number().min(1, "Target must be a positive number"),
  unit: z.string().min(1, "Unit is required"),
  deadline: z.string().transform(val => new Date(val)),
  progress: z.number().default(0),
  completed: z.boolean().default(false),
});

// GET all fitness goals for the authenticated user
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const { db } = await connectToDatabase();
    const goalsCollection = db.collection("fitness_goals");
    
    // Access user ID from the session
    const userId = (session as any).user.id;
    
    const fitnessGoals = await goalsCollection
      .find({ userId })
      .sort({ deadline: 1 })
      .toArray();
    
    return NextResponse.json(fitnessGoals);
  } catch (error) {
    console.error("Error retrieving fitness goals:", error);
    return NextResponse.json(
      { error: "Failed to retrieve fitness goals" },
      { status: 500 }
    );
  }
}

// POST a new fitness goal
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const validation = fitnessGoalSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const goalsCollection = db.collection("fitness_goals");
    
    // Access user ID from the session
    const userId = (session as any).user.id;
    
    const fitnessGoal: FitnessGoal = {
      ...validation.data,
      userId,
      deadline: new Date(validation.data.deadline),
      progress: validation.data.progress || 0,
      completed: validation.data.completed || false,
      createdAt: new Date(),
    };
    
    const result = await goalsCollection.insertOne(fitnessGoal);
    
    return NextResponse.json({
      message: "Fitness goal saved successfully",
      goalId: result.insertedId,
    });
  } catch (error) {
    console.error("Error saving fitness goal:", error);
    return NextResponse.json(
      { error: "Failed to save fitness goal" },
      { status: 500 }
    );
  }
}

// PUT update a fitness goal (for progress updates)
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: "Goal ID is required" },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const goalsCollection = db.collection("fitness_goals");
    
    // Access user ID from the session
    const userId = (session as any).user.id;
    
    // Create update object with only the fields that can be updated
    const updateFields: any = {};
    if (body.progress !== undefined) updateFields.progress = body.progress;
    if (body.completed !== undefined) updateFields.completed = body.completed;
    
    // Ensure the user only updates their own goals
    const { ObjectId } = require("mongodb");
    const result = await goalsCollection.updateOne(
      { _id: new ObjectId(body.id), userId },
      { $set: updateFields }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Goal not found or not authorized to update" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: "Fitness goal updated successfully",
    });
  } catch (error) {
    console.error("Error updating fitness goal:", error);
    return NextResponse.json(
      { error: "Failed to update fitness goal" },
      { status: 500 }
    );
  }
} 