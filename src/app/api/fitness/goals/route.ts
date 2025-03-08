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

interface FitnessGoal {
  userId: string;
  type: string;
  target: number;
  deadline: Date;
  progress: number;
  status: "active" | "completed" | "abandoned";
  notes?: string;
}

// GET fitness goals for the authenticated user
export async function GET(): Promise<Response> {
  const session = await getServerSession(authOptions) as ExtendedSession | null;
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const { db } = await connectToDatabase();
    const goalsCollection = db.collection("fitness_goals");
    
    const userId = session.user.id;
    
    const goals = await goalsCollection
      .find({ userId })
      .sort({ deadline: 1 })
      .toArray();
    
    return NextResponse.json(goals);
  } catch (error: unknown) {
    console.error("Error retrieving fitness goals:", error);
    return NextResponse.json(
      { error: "Failed to retrieve fitness goals" },
      { status: 500 }
    );
  }
}

// POST a new fitness goal
export async function POST(request: Request): Promise<Response> {
  const session = await getServerSession(authOptions) as ExtendedSession | null;
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const data = await request.json();
    const { db } = await connectToDatabase();
    const goalsCollection = db.collection("fitness_goals");
    
    const userId = session.user.id;
    
    const goal: FitnessGoal = {
      ...data,
      userId,
      progress: 0,
      status: "active",
      deadline: new Date(data.deadline),
    };
    
    const result = await goalsCollection.insertOne(goal);
    
    return NextResponse.json({
      message: "Fitness goal saved successfully",
      goalId: result.insertedId,
    });
  } catch (error: unknown) {
    console.error("Error saving fitness goal:", error);
    return NextResponse.json(
      { error: "Failed to save fitness goal" },
      { status: 500 }
    );
  }
}

// PUT update a fitness goal
export async function PUT(request: Request): Promise<Response> {
  const session = await getServerSession(authOptions) as ExtendedSession | null;
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const data = await request.json();
    const { db } = await connectToDatabase();
    const goalsCollection = db.collection("fitness_goals");
    
    const userId = session.user.id;
    const goalId = new ObjectId(data.goalId);
    
    const result = await goalsCollection.updateOne(
      { _id: goalId, userId },
      { $set: { progress: data.progress, status: data.status } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Goal not found or unauthorized" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: "Fitness goal updated successfully",
    });
  } catch (error: unknown) {
    console.error("Error updating fitness goal:", error);
    return NextResponse.json(
      { error: "Failed to update fitness goal" },
      { status: 500 }
    );
  }
} 