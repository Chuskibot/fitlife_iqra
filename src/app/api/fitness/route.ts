import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import { FitnessActivity } from "@/models/fitness-activity";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

// Schema for validating fitness activity request
const fitnessActivitySchema = z.object({
  activityType: z.enum(["cardio", "strength", "flexibility", "sports", "other"]),
  name: z.string().min(1, "Activity name is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  calories: z.number().min(0, "Calories must be a positive number"),
  notes: z.string().optional(),
  completed: z.boolean(),
  date: z.string().transform(val => new Date(val)),
});

// GET all fitness activities for the authenticated user
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const { db } = await connectToDatabase();
    const fitnessCollection = db.collection("fitness_activities");
    
    // Access user ID from the session
    const userId = (session as any).user.id;
    
    const fitnessActivities = await fitnessCollection
      .find({ userId })
      .sort({ date: -1 })
      .toArray();
    
    return NextResponse.json(fitnessActivities);
  } catch (error) {
    console.error("Error retrieving fitness activities:", error);
    return NextResponse.json(
      { error: "Failed to retrieve fitness activities" },
      { status: 500 }
    );
  }
}

// POST a new fitness activity
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const validation = fitnessActivitySchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const fitnessCollection = db.collection("fitness_activities");
    
    // Access user ID from the session
    const userId = (session as any).user.id;
    
    const fitnessActivity: FitnessActivity = {
      ...validation.data,
      userId,
      date: new Date(validation.data.date),
    };
    
    const result = await fitnessCollection.insertOne(fitnessActivity);
    
    return NextResponse.json({
      message: "Fitness activity saved successfully",
      activityId: result.insertedId,
    });
  } catch (error) {
    console.error("Error saving fitness activity:", error);
    return NextResponse.json(
      { error: "Failed to save fitness activity" },
      { status: 500 }
    );
  }
}

// DELETE a fitness activity
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Activity ID is required" },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const fitnessCollection = db.collection("fitness_activities");
    
    // Access user ID from the session
    const userId = (session as any).user.id;
    
    // Ensure the user only deletes their own activities
    const { ObjectId } = require("mongodb");
    const result = await fitnessCollection.deleteOne({
      _id: new ObjectId(id),
      userId,
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Activity not found or not authorized to delete" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: "Fitness activity deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting fitness activity:", error);
    return NextResponse.json(
      { error: "Failed to delete fitness activity" },
      { status: 500 }
    );
  }
} 