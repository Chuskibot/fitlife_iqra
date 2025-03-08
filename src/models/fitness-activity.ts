import { ObjectId } from "mongodb";

export interface FitnessActivity {
  _id?: ObjectId;
  userId: string;
  date: Date;
  activityType: "cardio" | "strength" | "flexibility" | "sports" | "other";
  name: string;
  duration: number; // in minutes
  calories: number;
  notes?: string;
  completed: boolean;
}

export interface FitnessGoal {
  _id?: ObjectId;
  userId: string;
  name: string;
  target: number;
  unit: string;
  deadline: Date;
  progress: number;
  completed: boolean;
  createdAt: Date;
}

export function calculateCaloriesBurned(
  activityType: string, 
  duration: number, 
  weight: number = 70 // default weight in kg if not provided
): number {
  // MET (Metabolic Equivalent of Task) values for different activities
  const metValues: Record<string, number> = {
    cardio: 8.0, // Running/jogging
    strength: 5.0, // Weight training
    flexibility: 2.5, // Yoga/stretching
    sports: 6.0, // Basketball, soccer, etc.
    other: 4.0 // Default moderate activity
  };

  // Get MET value for the activity type, default to "other" if not found
  const met = metValues[activityType] || metValues.other;
  
  // Formula: Calories = MET × weight (kg) × duration (hours)
  // Convert duration from minutes to hours
  const durationInHours = duration / 60;
  
  // Calculate and round calories burned
  return Math.round(met * weight * durationInHours);
} 