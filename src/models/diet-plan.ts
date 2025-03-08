import { ObjectId } from "mongodb";

export interface Meal {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface DietPlan {
  _id?: ObjectId;
  userId: string;
  name: string;
  goalType: "weight_loss" | "weight_gain" | "maintenance";
  targetCalories: number;
  meals: Meal[];
  date: Date;
  notes?: string;
} 