import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { z } from "zod";

// Schema for validating request
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { name, email, password } = validation.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // Connect to the database
      const { db } = await connectToDatabase();
      const usersCollection = db.collection("users");
      
      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        console.log(`User with email ${email} already exists`);
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 409 }
        );
      }

      // Create user
      const result = await usersCollection.insertOne({
        name,
        email,
        password: hashedPassword,
        role: "user",
        createdAt: new Date(),
      });

      console.log(`User created successfully with id: ${result.insertedId}`);
      
      return NextResponse.json({
        message: "User created successfully",
        userId: result.insertedId,
      });
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { error: "Database connection error. Please try again later." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
} 