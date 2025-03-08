"use client";

import { useState, useCallback, useEffect } from "react";
import { FitnessActivity, calculateCaloriesBurned } from "@/models/fitness-activity";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

// Define the type for activity stats to fix typechecking errors
interface ActivityStats {
  totalActivities: number;
  totalDuration: number;
  totalCalories: number;
  avgDuration: number;
  typeCounts: Record<string, number>;
}

export function useFitnessActivities() {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<FitnessActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all fitness activities for the current user
  const fetchActivities = useCallback(async () => {
    if (!session) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get("/api/fitness");
      setActivities(response.data);
    } catch (err) {
      console.error("Error fetching fitness activities:", err);
      setError("Failed to load your fitness activities");
      toast.error("Failed to load your fitness activities");
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Add a new fitness activity
  const addActivity = useCallback(async (activityData: Omit<FitnessActivity, "userId" | "_id">) => {
    if (!session) {
      toast.error("You must be logged in to save activities");
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post("/api/fitness", activityData);
      
      // Refresh activities after saving
      await fetchActivities();
      
      toast.success("Fitness activity saved successfully!");
      return response.data;
    } catch (err) {
      console.error("Error saving fitness activity:", err);
      setError("Failed to save your fitness activity");
      toast.error("Failed to save your fitness activity");
      return null;
    } finally {
      setLoading(false);
    }
  }, [session, fetchActivities]);

  // Delete a fitness activity
  const deleteActivity = useCallback(async (activityId: string) => {
    if (!session) {
      toast.error("You must be logged in to delete activities");
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await axios.delete(`/api/fitness?id=${activityId}`);
      
      // Update local state without refetching
      setActivities(prev => prev.filter(activity => 
        activity._id && activity._id.toString() !== activityId
      ));
      
      toast.success("Fitness activity deleted successfully!");
      return true;
    } catch (err) {
      console.error("Error deleting fitness activity:", err);
      setError("Failed to delete your fitness activity");
      toast.error("Failed to delete your fitness activity");
      return false;
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Calculate and add a new fitness activity with calories estimated
  const quickAddActivity = useCallback(async (
    activityType: string,
    name: string,
    duration: number,
    weight?: number,
    notes?: string
  ) => {
    // Calculate calories based on activity type, duration, and weight
    const calories = calculateCaloriesBurned(activityType, duration, weight);
    
    const activityData: Omit<FitnessActivity, "userId" | "_id"> = {
      activityType: activityType as "cardio" | "strength" | "flexibility" | "sports" | "other",
      name,
      duration,
      calories,
      notes,
      completed: true,
      date: new Date(),
    };
    
    return await addActivity(activityData);
  }, [addActivity]);

  // Get activity stats (total calories, duration, etc.)
  const getActivityStats = useCallback((): ActivityStats => {
    if (activities.length === 0) {
      return {
        totalActivities: 0,
        totalDuration: 0,
        totalCalories: 0,
        avgDuration: 0,
        typeCounts: {}
      };
    }
    
    const stats = activities.reduce((acc, activity) => {
      acc.totalDuration += activity.duration;
      acc.totalCalories += activity.calories;
      
      if (!acc.typeCounts[activity.activityType]) {
        acc.typeCounts[activity.activityType] = 0;
      }
      acc.typeCounts[activity.activityType]++;
      
      return acc;
    }, {
      totalActivities: activities.length,
      totalDuration: 0,
      totalCalories: 0,
      typeCounts: {} as Record<string, number>
    } as ActivityStats);
    
    stats.avgDuration = stats.totalDuration / stats.totalActivities;
    
    return stats;
  }, [activities]);

  // Load activities on initial mount if user is logged in
  useEffect(() => {
    if (session) {
      fetchActivities();
    }
  }, [session, fetchActivities]);

  return {
    activities,
    loading,
    error,
    fetchActivities,
    addActivity,
    deleteActivity,
    quickAddActivity,
    getActivityStats,
  };
} 