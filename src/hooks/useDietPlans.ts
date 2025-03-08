"use client";

import { useState, useCallback, useEffect } from "react";
import { DietPlan } from "@/models/diet-plan";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export function useDietPlans() {
  const { data: session } = useSession();
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all diet plans for the current user
  const fetchPlans = useCallback(async () => {
    if (!session) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get("/api/diet");
      setPlans(response.data);
    } catch (err) {
      console.error("Error fetching diet plans:", err);
      setError("Failed to load your diet plans");
      toast.error("Failed to load your diet plans");
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Save a new diet plan
  const savePlan = useCallback(async (planData: Omit<DietPlan, "userId" | "date" | "_id">) => {
    if (!session) {
      toast.error("You must be logged in to save diet plans");
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post("/api/diet", planData);
      
      // Refresh plans after saving
      await fetchPlans();
      
      toast.success("Diet plan saved successfully!");
      return response.data;
    } catch (err) {
      console.error("Error saving diet plan:", err);
      setError("Failed to save your diet plan");
      toast.error("Failed to save your diet plan");
      return null;
    } finally {
      setLoading(false);
    }
  }, [session, fetchPlans]);

  // Load plans on initial mount if user is logged in
  useEffect(() => {
    if (session) {
      fetchPlans();
    }
  }, [session, fetchPlans]);

  return {
    plans,
    loading,
    error,
    fetchPlans,
    savePlan,
  };
} 