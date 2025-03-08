import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Session } from "next-auth";

interface ExtendedSession extends Session {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
  };
}

interface DietPlan {
  userId: string;
  meals: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  calories: number;
  date: Date;
}

// GET diet plans for the authenticated user
export async function GET(request: Request): Promise<Response> {
  const session = await getServerSession(authOptions) as ExtendedSession | null;
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const { db } = await connectToDatabase();
    const dietCollection = db.collection("diet_plans");
    
    const userId = session.user.id;
    
    const dietPlans = await dietCollection
      .find({ userId })
      .sort({ date: -1 })
      .toArray();
    
    return NextResponse.json(dietPlans);
  } catch (error: unknown) {
    console.error("Error retrieving diet plans:", error);
    return NextResponse.json(
      { error: "Failed to retrieve diet plans" },
      { status: 500 }
    );
  }
}

// POST a new diet plan
export async function POST(request: Request): Promise<Response> {
  const session = await getServerSession(authOptions) as ExtendedSession | null;
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const data = await request.json();
    const { db } = await connectToDatabase();
    const dietCollection = db.collection("diet_plans");
    
    const userId = session.user.id;
    
    const dietPlan: DietPlan = {
      ...data,
      userId,
      date: new Date(),
    };
    
    const result = await dietCollection.insertOne(dietPlan);
    
    return NextResponse.json({
      message: "Diet plan saved successfully",
      planId: result.insertedId,
    });
  } catch (error: unknown) {
    console.error("Error saving diet plan:", error);
    return NextResponse.json(
      { error: "Failed to save diet plan" },
      { status: 500 }
    );
  }
} 