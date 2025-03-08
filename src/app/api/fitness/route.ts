import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Session } from "next-auth";
import { ObjectId } from "mongodb";

interface ExtendedSession extends Session {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
  };
}

interface FitnessActivity {
  userId: string;
  type: string;
  duration: number;
  intensity: "low" | "medium" | "high";
  caloriesBurned: number;
  date: Date;
  notes?: string;
}

// GET fitness activities for the authenticated user
export async function GET(): Promise<Response> {
  const session = await getServerSession(authOptions) as ExtendedSession | null;
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const { db } = await connectToDatabase();
    const activitiesCollection = db.collection("fitness_activities");
    
    const userId = session.user.id;
    
    const activities = await activitiesCollection
      .find({ userId })
      .sort({ date: -1 })
      .toArray();
    
    return NextResponse.json(activities);
  } catch (error: unknown) {
    console.error("Error retrieving fitness activities:", error);
    return NextResponse.json(
      { error: "Failed to retrieve fitness activities" },
      { status: 500 }
    );
  }
}

// POST a new fitness activity
export async function POST(request: Request): Promise<Response> {
  const session = await getServerSession(authOptions) as ExtendedSession | null;
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const data = await request.json();
    const { db } = await connectToDatabase();
    const activitiesCollection = db.collection("fitness_activities");
    
    const userId = session.user.id;
    
    const activity: FitnessActivity = {
      ...data,
      userId,
      date: new Date(data.date || new Date()),
    };
    
    const result = await activitiesCollection.insertOne(activity);
    
    return NextResponse.json({
      message: "Fitness activity saved successfully",
      activityId: result.insertedId,
    });
  } catch (error: unknown) {
    console.error("Error saving fitness activity:", error);
    return NextResponse.json(
      { error: "Failed to save fitness activity" },
      { status: 500 }
    );
  }
}

// DELETE a fitness activity
export async function DELETE(request: Request): Promise<Response> {
  const session = await getServerSession(authOptions) as ExtendedSession | null;
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get("id");
    
    if (!activityId) {
      return NextResponse.json(
        { error: "Activity ID is required" },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const activitiesCollection = db.collection("fitness_activities");
    
    const userId = session.user.id;
    const _id = new ObjectId(activityId);
    
    const result = await activitiesCollection.deleteOne({ _id, userId });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Activity not found or unauthorized" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: "Fitness activity deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Error deleting fitness activity:", error);
    return NextResponse.json(
      { error: "Failed to delete fitness activity" },
      { status: 500 }
    );
  }
} 