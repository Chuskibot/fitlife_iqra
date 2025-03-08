import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/db";
import { BMIRecord } from "@/models/bmi-record";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import { Session } from "next-auth";

interface ExtendedSession extends Session {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
  };
}

// Schema for validating BMI record request
const bmiRecordSchema = z.object({
  height: z.number().min(50, "Height must be at least 50cm").max(300, "Height must be at most 300cm"),
  weight: z.number().min(20, "Weight must be at least 20kg").max(500, "Weight must be at most 500kg"),
  bmi: z.number(),
  category: z.string(),
  notes: z.string().optional(),
});

type BMIData = {
  height: number;
  weight: number;
  age: number;
  gender: string;
  userId: string;
};

// GET all BMI records for the authenticated user
export async function GET(request: Request): Promise<Response> {
  const session = await getServerSession(authOptions) as ExtendedSession | null;
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const { db } = await connectToDatabase();
    const bmiCollection = db.collection("bmi_records");
    
    const userId = session.user.id;
    
    const bmiRecords = await bmiCollection
      .find({ userId })
      .sort({ date: -1 })
      .toArray();
    
    return NextResponse.json(bmiRecords);
  } catch (error: unknown) {
    console.error("Error retrieving BMI records:", error);
    return NextResponse.json(
      { error: "Failed to retrieve BMI records" },
      { status: 500 }
    );
  }
}

// POST a new BMI record
export async function POST(request: Request): Promise<Response> {
  const session = await getServerSession(authOptions) as ExtendedSession | null;
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const data: BMIData = await request.json();
    const validation = bmiRecordSchema.safeParse(data);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const bmiCollection = db.collection("bmi_records");
    
    const userId = session.user.id;
    
    const bmiRecord: BMIRecord = {
      ...validation.data,
      userId,
      date: new Date(),
    };
    
    const result = await bmiCollection.insertOne(bmiRecord);
    
    return NextResponse.json({
      message: "BMI record saved successfully",
      recordId: result.insertedId,
    });
  } catch (error: unknown) {
    console.error("Error saving BMI record:", error);
    return NextResponse.json(
      { error: "Failed to save BMI record" },
      { status: 500 }
    );
  }
} 