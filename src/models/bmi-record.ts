import { ObjectId } from "mongodb";

export interface BMIRecord {
  _id?: ObjectId;
  userId: string;
  height: number; // in cm
  weight: number; // in kg
  bmi: number;
  category: string;
  date: Date;
  notes?: string;
}

export function calculateBMI(weight: number, height: number): number {
  // BMI = weight (kg) / (height (m))^2
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  if (bmi < 35) return "Obesity Class I";
  if (bmi < 40) return "Obesity Class II";
  return "Obesity Class III";
} 