"use client";

import { useState, useCallback, useEffect } from "react";
import { FitnessGoal } from "@/models/fitness-activity";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export function useFitnessGoals() {
  const { data: session } = useSession();
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all fitness goals for the current user
  const fetchGoals = useCallback(async () => {
    if (!session) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get("/api/fitness/goals");
      setGoals(response.data);
    } catch (err) {
      console.error("Error fetching fitness goals:", err);
      setError("Failed to load your fitness goals");
      toast.error("Failed to load your fitness goals");
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Add a new fitness goal
  const addGoal = useCallback(async (goalData: Omit<FitnessGoal, "userId" | "_id" | "createdAt">) => {
    if (!session) {
      toast.error("You must be logged in to save goals");
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post("/api/fitness/goals", goalData);
      
      // Refresh goals after saving
      await fetchGoals();
      
      toast.success("Fitness goal saved successfully!");
      return response.data;
    } catch (err) {
      console.error("Error saving fitness goal:", err);
      setError("Failed to save your fitness goal");
      toast.error("Failed to save your fitness goal");
      return null;
    } finally {
      setLoading(false);
    }
  }, [session, fetchGoals]);

  // Update a fitness goal's progress
  const updateGoalProgress = useCallback(async (goalId: string, progress: number, completed?: boolean) => {
    if (!session) {
      toast.error("You must be logged in to update goals");
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Determine if goal should be marked as completed based on progress
      const goal = goals.find(g => g._id && g._id.toString() === goalId);
      
      // If completed is not explicitly provided, calculate it based on progress and target
      if (completed === undefined && goal) {
        completed = progress >= goal.target;
      }
      
      await axios.put("/api/fitness/goals", {
        id: goalId,
        progress,
        completed,
      });
      
      // Update local state without refetching
      setGoals(prev => prev.map(goal => {
        if (goal._id && goal._id.toString() === goalId) {
          return {
            ...goal,
            progress,
            completed: completed || false,
          };
        }
        return goal;
      }));
      
      toast.success("Fitness goal updated successfully!");
      return true;
    } catch (err) {
      console.error("Error updating fitness goal:", err);
      setError("Failed to update your fitness goal");
      toast.error("Failed to update your fitness goal");
      return false;
    } finally {
      setLoading(false);
    }
  }, [session, goals]);

  // Get goal statistics (e.g., completion rate, upcoming deadlines)
  const getGoalStats = useCallback(() => {
    if (goals.length === 0) {
      return {
        totalGoals: 0,
        completedGoals: 0,
        completionRate: 0,
        upcomingDeadlines: [],
        overallProgress: 0,
      };
    }
    
    const now = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);
    
    const completedGoals = goals.filter(goal => goal.completed).length;
    const totalProgress = goals.reduce((acc, goal) => acc + (goal.progress / goal.target * 100), 0);
    const overallProgress = totalProgress / goals.length;
    
    const upcomingDeadlines = goals
      .filter(goal => !goal.completed && goal.deadline > now && goal.deadline < oneWeekFromNow)
      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
      .slice(0, 3); // Get 3 most imminent deadlines
    
    return {
      totalGoals: goals.length,
      completedGoals,
      completionRate: (completedGoals / goals.length) * 100,
      upcomingDeadlines,
      overallProgress,
    };
  }, [goals]);

  // Load goals on initial mount if user is logged in
  useEffect(() => {
    if (session) {
      fetchGoals();
    }
  }, [session, fetchGoals]);

  return {
    goals,
    loading,
    error,
    fetchGoals,
    addGoal,
    updateGoalProgress,
    getGoalStats,
  };
} 