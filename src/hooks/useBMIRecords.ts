"use client";

import { useState, useCallback, useEffect } from "react";
import { BMIRecord, calculateBMI, getBMICategory } from "@/models/bmi-record";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export function useBMIRecords() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<BMIRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all BMI records for the current user
  const fetchRecords = useCallback(async () => {
    if (!session) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get("/api/bmi");
      setRecords(response.data);
    } catch (err) {
      console.error("Error fetching BMI records:", err);
      setError("Failed to load your BMI history");
      toast.error("Failed to load your BMI history");
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Save a new BMI record
  const saveRecord = useCallback(async (height: number, weight: number, notes?: string) => {
    if (!session) {
      toast.error("You must be logged in to save records");
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const bmiValue = calculateBMI(weight, height);
      const category = getBMICategory(bmiValue);
      
      const recordData = {
        height,
        weight,
        bmi: parseFloat(bmiValue.toFixed(1)),
        category,
        notes,
      };
      
      const response = await axios.post("/api/bmi", recordData);
      
      // Refresh records after saving
      await fetchRecords();
      
      toast.success("BMI record saved successfully!");
      return response.data;
    } catch (err) {
      console.error("Error saving BMI record:", err);
      setError("Failed to save your BMI record");
      toast.error("Failed to save your BMI record");
      return null;
    } finally {
      setLoading(false);
    }
  }, [session, fetchRecords]);

  // Load records on initial mount if user is logged in
  useEffect(() => {
    if (session) {
      fetchRecords();
    }
  }, [session, fetchRecords]);

  return {
    records,
    loading,
    error,
    fetchRecords,
    saveRecord,
  };
} 