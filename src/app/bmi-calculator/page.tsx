"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  ChevronRight, 
  Salad, 
  Save, 
  History, 
  X, 
  Scale, 
  Ruler, 
  ChartBar, 
  Info,
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBMIRecords } from "@/hooks/useBMIRecords";
import toast from "react-hot-toast";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useSession, signOut } from "next-auth/react";

// Animation variants
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const scaleVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
};

const progressVariants = {
  initial: { width: 0 },
  animate: { 
    width: "100%",
    transition: { duration: 1, ease: "easeOut" }
  }
};

export default function BMICalculator() {
  const router = useRouter();
  const { data: session } = useSession();
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(170);
  const [bmi, setBmi] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<string>("");
  const [showDietRecommendation, setShowDietRecommendation] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [bmiComparison, setBmiComparison] = useState<{
    previousBmi: number | null;
    difference: number;
    isImproving: boolean;
  }>({
    previousBmi: null,
    difference: 0,
    isImproving: false
  });
  
  // Use our custom BMI records hook
  const { records, loading, error, saveRecord } = useBMIRecords();
  
  // Pre-fill with most recent record if available
  useEffect(() => {
    if (records.length > 0) {
      const latestRecord = records[0];
      if (heightUnit === "cm") {
        setHeight(latestRecord.height);
      } else {
        // Convert cm to feet
        setHeight(latestRecord.height / 30.48);
      }
      
      if (weightUnit === "kg") {
        setWeight(latestRecord.weight);
      } else {
        // Convert kg to pounds
        setWeight(latestRecord.weight * 2.20462);
      }
    }
  }, [records, heightUnit, weightUnit]);

  const calculateBMI = () => {
    if (!height || !weight) {
      toast.error("Please enter both height and weight");
      return;
    }
    
    const heightInMeters = height / 100;
    const bmiValue = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
    setBmi(bmiValue);

    // Determine BMI category
    if (bmiValue < 18.5) {
      setBmiCategory("Underweight");
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      setBmiCategory("Normal weight");
    } else if (bmiValue >= 25 && bmiValue < 30) {
      setBmiCategory("Overweight");
    } else if (bmiValue >= 30 && bmiValue < 35) {
      setBmiCategory("Obesity Class I");
    } else if (bmiValue >= 35 && bmiValue < 40) {
      setBmiCategory("Obesity Class II");
    } else {
      setBmiCategory("Obesity Class III");
    }

    // Calculate comparison with previous BMI if records exist
    if (records && records.length > 0) {
      const previousBmi = records[0].bmi;
      const difference = parseFloat((bmiValue - previousBmi).toFixed(1));
      
      // Determine if health is improving based on BMI category changes
      let isImproving = false;
      
      if (previousBmi < 18.5) {
        // If previously underweight, improvement means getting closer to normal range
        isImproving = difference > 0 && bmiValue <= 25;
      } else if (previousBmi >= 25) {
        // If previously overweight/obese, improvement means getting closer to normal range
        isImproving = difference < 0;
      } else {
        // If previously in normal range, improvement means staying in that range
        isImproving = bmiValue >= 18.5 && bmiValue < 25;
      }
      
      setBmiComparison({
        previousBmi,
        difference,
        isImproving
      });
    }

    setShowDietRecommendation(true);
  };

  // Save the current BMI record
  const handleSaveRecord = async () => {
    if (!session) {
      toast.error("You must be logged in to save records");
      return;
    }
    
    if (!bmi) {
      toast.error("Please calculate your BMI first");
      return;
    }
    
    // Convert to standard units (cm and kg) for storage
    let heightInCm = height;
    let weightInKg = weight;
    
    if (heightUnit === "ft") {
      heightInCm = height * 30.48;
    }
    
    if (weightUnit === "lb") {
      weightInKg = weight * 0.453592;
    }
    
    await saveRecord(heightInCm, weightInKg, notes);
  };

  const getBmiColor = () => {
    if (!bmi) return "text-gray-500";
    if (bmi < 18.5) return "text-blue-500";
    if (bmi >= 18.5 && bmi < 25) return "text-green-500";
    if (bmi >= 25 && bmi < 30) return "text-yellow-500";
    if (bmi >= 30 && bmi < 35) return "text-orange-500";
    return "text-red-500";
  };

  // Handle logout
  const handleLogout = async () => {
    toast.loading("Logging out...");
    await signOut({ redirect: false });
    toast.success("Successfully logged out");
    router.push("/");
  };

  // Type definition for diet recommendation
  type DietRecommendation = {
    title: string;
    description: string;
    tips: string[];
    mealPlan: {
      breakfast: string;
      snack1: string;
      lunch: string;
      snack2: string;
      dinner: string;
    };
  };

  const getDietRecommendation = (): DietRecommendation => {
    if (!bmi) {
      return {
        title: "No BMI Calculated",
        description: "Please calculate your BMI first",
        tips: [],
        mealPlan: {
          breakfast: "",
          snack1: "",
          lunch: "",
          snack2: "",
          dinner: ""
        }
      };
    }
    
    if (bmi < 18.5) {
      return {
        title: "Weight Gain Diet Plan",
        description: "Focus on nutrient-dense foods to gain healthy weight.",
        tips: [
          "Increase caloric intake by 300-500 calories per day",
          "Consume protein-rich foods like lean meats, eggs, and legumes",
          "Include healthy fats from avocados, nuts, and olive oil",
          "Eat complex carbohydrates like whole grains, potatoes, and rice",
          "Consider protein smoothies with fruits, milk, and protein powder"
        ],
        mealPlan: {
          breakfast: "Oatmeal with banana, nuts, and whole milk",
          snack1: "Greek yogurt with honey and berries",
          lunch: "Grilled chicken sandwich with avocado and sweet potato fries",
          snack2: "Protein smoothie with banana, peanut butter, and milk",
          dinner: "Salmon with quinoa and roasted vegetables"
        }
      };
    } else if (bmi >= 18.5 && bmi < 25) {
      return {
        title: "Balanced Maintenance Diet Plan",
        description: "Focus on maintaining your healthy weight with balanced nutrition.",
        tips: [
          "Maintain current caloric intake with balanced macronutrients",
          "Include a variety of fruits and vegetables daily",
          "Choose whole grains over refined carbohydrates",
          "Stay hydrated with water and limit sugary beverages",
          "Include lean proteins and healthy fats in your meals"
        ],
        mealPlan: {
          breakfast: "Whole grain toast with eggs and spinach",
          snack1: "Apple with almond butter",
          lunch: "Mixed greens salad with grilled chicken and olive oil dressing",
          snack2: "Carrot sticks with hummus",
          dinner: "Baked fish with brown rice and steamed vegetables"
        }
      };
    } else if (bmi >= 25 && bmi < 30) {
      return {
        title: "Weight Management Diet Plan",
        description: "Focus on gradual weight loss with sustainable habits.",
        tips: [
          "Create a moderate calorie deficit of 300-500 calories per day",
          "Increase protein intake to maintain muscle mass",
          "Fill half your plate with non-starchy vegetables",
          "Choose high-fiber foods to increase satiety",
          "Limit processed foods, added sugars, and refined carbohydrates"
        ],
        mealPlan: {
          breakfast: "Greek yogurt with berries and a small handful of nuts",
          snack1: "Celery sticks with hummus",
          lunch: "Grilled chicken salad with mixed vegetables and light dressing",
          snack2: "Small apple with 1 tablespoon of peanut butter",
          dinner: "Grilled fish with roasted vegetables and a small portion of quinoa"
        }
      };
    } else {
      return {
        title: "Therapeutic Diet Plan",
        description: "Focus on gradual, sustainable weight loss with professional guidance.",
        tips: [
          "Consult with a healthcare professional for personalized advice",
          "Create a moderate calorie deficit with nutrient-dense foods",
          "Prioritize protein to maintain muscle mass during weight loss",
          "Include plenty of fiber from vegetables, fruits, and whole grains",
          "Stay hydrated and limit foods high in added sugars and saturated fats"
        ],
        mealPlan: {
          breakfast: "Vegetable omelet with 2 eggs and a small piece of whole grain toast",
          snack1: "Small handful of nuts or seeds",
          lunch: "Large salad with lean protein and olive oil-based dressing",
          snack2: "Sliced bell peppers with 2 tablespoons of guacamole",
          dinner: "Lean protein with plenty of steamed vegetables and a small portion of whole grains"
        }
      };
    }
  };

  const handleGetPersonalizedDiet = () => {
    if (bmi) {
      // Navigate to diet planner with BMI value
      router.push(`/diet-planner?bmi=${bmi}&category=${bmiCategory}`);
    }
  };

  const getComparisonMessage = () => {
    if (!bmiComparison.previousBmi) return "";
    
    const { difference, isImproving } = bmiComparison;
    const diffStr = Math.abs(difference).toFixed(1);
    
    if (bmiCategory === "Normal weight") {
      if (isImproving) {
        return `Great job! Your BMI is in the healthy range, ${difference > 0 ? 'up' : 'down'} by ${diffStr} points.`;
      } else {
        return `Your BMI has changed by ${diffStr} points. Focus on maintaining a healthy range.`;
      }
    } else if (bmiCategory === "Underweight") {
      if (isImproving) {
        return `Good progress! Your BMI has increased by ${diffStr} points toward a healthy range.`;
      } else {
        return `Your BMI has decreased by ${diffStr} points. Focus on healthy weight gain.`;
      }
    } else {
      if (isImproving) {
        return `Excellent progress! Your BMI has decreased by ${diffStr} points toward a healthy range.`;
      } else {
        return `Your BMI has increased by ${diffStr} points. Consider focusing on healthy weight loss.`;
      }
    }
  };

  return (
    <motion.div 
      className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/30 dark:supports-[backdrop-filter]:bg-gray-900/30">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold">Fitlife</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/bmi-calculator" className="text-sm font-medium text-indigo-600 dark:text-cyan-400">
              BMI Calculator
            </Link>
            <Link href="/diet-planner" className="text-sm font-medium hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
              Diet Planner
            </Link>
            <Link href="/fitness-tracker" className="text-sm font-medium hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
              Fitness Tracker
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {session ? (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            ) : (
              <Link href="/auth/login">
              <Button>Get Started</Button>
            </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <motion.div 
          className="mx-auto max-w-4xl space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div 
            className="text-center space-y-4"
            variants={itemVariants}
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-500">
              BMI Calculator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Calculate your Body Mass Index (BMI) to determine if you have a healthy body weight and get personalized diet recommendations.
            </p>
          </motion.div>

          <motion.div 
            className="flex flex-wrap items-center justify-between gap-4"
            variants={itemVariants}
          >
            <div className="flex items-center gap-4">
              {bmi && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button 
                    variant="outline" 
                    onClick={handleSaveRecord}
                    className="flex items-center gap-2 hover:border-indigo-400 hover:text-indigo-600"
                  >
                    <Save className="h-4 w-4" />
                    Save Results
                  </Button>
                </motion.div>
              )}
              
              <Button
                variant="outline"
                onClick={() => setHistoryOpen(true)}
                className="flex items-center gap-2 hover:border-cyan-400 hover:text-cyan-600"
              >
                <History className="h-4 w-4" />
                History
              </Button>
          </div>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            <motion.div variants={itemVariants}>
              <Card className="w-full backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Scale className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                    Calculate Your BMI
                  </CardTitle>
                <CardDescription>
                  Enter your weight and height to calculate your Body Mass Index.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Weight Input */}
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                  <div className="flex justify-between items-center">
                      <Label htmlFor="weight" className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-indigo-600 dark:text-cyan-400" />
                        Weight
                      </Label>
                      <Tabs 
                        defaultValue={weightUnit} 
                        onValueChange={(value) => setWeightUnit(value as "kg" | "lb")}
                        className="h-8"
                      >
                        <TabsList className="h-8">
                          <TabsTrigger value="kg" className="h-8">kg</TabsTrigger>
                          <TabsTrigger value="lb" className="h-8">lb</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="weight"
                      min={weightUnit === "kg" ? 30 : 66}
                      max={weightUnit === "kg" ? 200 : 440}
                      step={weightUnit === "kg" ? 1 : 2}
                      value={[weight]}
                      onValueChange={(value) => setWeight(value[0])}
                      className="flex-1"
                    />
                      <div className="w-20">
                      <Input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="text-center"
                      />
                    </div>
                  </div>
                  </motion.div>

                {/* Height Input */}
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                  <div className="flex justify-between items-center">
                      <Label htmlFor="height" className="flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-indigo-600 dark:text-cyan-400" />
                        Height
                      </Label>
                      <Tabs 
                        defaultValue={heightUnit} 
                        onValueChange={(value) => setHeightUnit(value as "cm" | "ft")}
                        className="h-8"
                      >
                        <TabsList className="h-8">
                          <TabsTrigger value="cm" className="h-8">cm</TabsTrigger>
                          <TabsTrigger value="ft" className="h-8">ft</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="height"
                      min={heightUnit === "cm" ? 100 : 3.3}
                      max={heightUnit === "cm" ? 220 : 7.2}
                      step={heightUnit === "cm" ? 1 : 0.1}
                      value={[height]}
                      onValueChange={(value) => setHeight(value[0])}
                      className="flex-1"
                    />
                      <div className="w-20">
                      <Input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        className="text-center"
                      />
                    </div>
                  </div>
                  </motion.div>
              </CardContent>
              <CardFooter>
                  <Button 
                    onClick={calculateBMI} 
                    className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white"
                  >
                    Calculate BMI
                  </Button>
              </CardFooter>
            </Card>
            </motion.div>

            <div className="space-y-6">
              <AnimatePresence mode="wait">
              {bmi && (
                  <motion.div
                    key="bmi-result"
                    initial="initial"
                    animate="animate"
                    exit="initial"
                    variants={scaleVariants}
                  >
                    <Card className="w-full backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-2 hover:border-cyan-300 dark:hover:border-cyan-700 transition-all">
                  <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <ChartBar className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                          Your BMI Result
                        </CardTitle>
                    <CardDescription>
                      Based on your weight and height measurements
                    </CardDescription>
                  </CardHeader>
                      <CardContent className="space-y-6">
                        <motion.div 
                          className="text-center py-6"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        >
                          <div className="text-6xl font-bold mb-3">
                        <span className={getBmiColor()}>{bmi?.toFixed(1)}</span>
                      </div>
                          <div className={`text-2xl font-medium ${getBmiColor()}`}>
                        {bmiCategory}
                      </div>
                        </motion.div>
                        <motion.div 
                          className="p-4 border rounded-lg bg-gradient-to-br from-indigo-50/50 to-cyan-50/50 dark:from-indigo-950/50 dark:to-cyan-950/50"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                      <p className="text-sm text-muted-foreground">
                        {bmiCategory === "Underweight" && "You are underweight. Consider consulting with a nutritionist for a healthy weight gain plan."}
                        {bmiCategory === "Normal weight" && "You have a healthy weight. Maintain your current lifestyle with regular exercise and balanced diet."}
                        {bmiCategory === "Overweight" && "You are overweight. Consider adopting a healthier diet and increasing physical activity."}
                            {bmiCategory === "Obesity Class I" && "You are in the obese category. It's recommended to consult with a healthcare professional for a weight management plan."}
                            {bmiCategory === "Obesity Class II" && "You are in the obese category. It's recommended to consult with a healthcare professional for a weight management plan."}
                            {bmiCategory === "Obesity Class III" && "You are in the obese category. It's recommended to consult with a healthcare professional for a weight management plan."}
                          </p>
                        </motion.div>
                        {bmiComparison.previousBmi && (
                          <motion.div 
                            className="absolute bottom-4 right-4 max-w-[250px]"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            <div className="bg-gradient-to-br from-indigo-50/90 to-cyan-50/90 dark:from-indigo-950/90 dark:to-cyan-950/90 rounded-lg p-4 backdrop-blur-sm border border-indigo-200 dark:border-indigo-800 shadow-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`h-2.5 w-2.5 rounded-full ${bmiComparison.isImproving ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                <p className="text-sm font-medium">
                                  Previous BMI: {bmiComparison.previousBmi}
                                </p>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                                <motion.div
                                  className={`h-full ${bmiComparison.isImproving ? 'bg-green-500' : 'bg-yellow-500'}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: '100%' }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={`text-sm ${bmiComparison.isImproving ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                  {bmiComparison.difference > 0 ? '↑' : '↓'} {Math.abs(bmiComparison.difference)}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                {getComparisonMessage()}
                      </p>
                    </div>
                          </motion.div>
                        )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleGetPersonalizedDiet} 
                      className="w-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white hover:from-indigo-600 hover:to-cyan-500"
                    >
                      <Salad className="mr-2 h-4 w-4" />
                      Get Personalized Diet Plan
                    </Button>
                  </CardFooter>
                </Card>
                  </motion.div>
              )}

              {showDietRecommendation && bmi && (
                  <motion.div
                    key="diet-recommendation"
                    initial="initial"
                    animate="animate"
                    exit="initial"
                    variants={scaleVariants}
                  >
                    <Card className="w-full backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-2 hover:border-green-300 dark:hover:border-green-700 transition-all">
                  <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <Salad className="h-5 w-5 text-green-600 dark:text-green-400" />
                          {getDietRecommendation().title}
                        </CardTitle>
                    <CardDescription>
                      {getDietRecommendation().description}
                    </CardDescription>
                  </CardHeader>
                      <CardContent className="space-y-6">
                        <motion.div 
                          className="space-y-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h3 className="font-medium flex items-center gap-2">
                            <Info className="h-4 w-4 text-indigo-600 dark:text-cyan-400" />
                            Dietary Tips
                          </h3>
                          <ul className="space-y-2">
                        {getDietRecommendation().tips.map((tip, index) => (
                              <motion.li 
                                key={index} 
                                className="text-sm flex items-start"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                              >
                                <ChevronRight className="h-4 w-4 mr-2 mt-0.5 text-indigo-600 dark:text-cyan-400" />
                            {tip}
                              </motion.li>
                        ))}
                      </ul>
                        </motion.div>
                        
                        <motion.div 
                          className="space-y-4 p-4 rounded-lg bg-gradient-to-br from-indigo-50/50 to-cyan-50/50 dark:from-indigo-950/50 dark:to-cyan-950/50"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <h3 className="font-medium flex items-center gap-2">
                            <Salad className="h-4 w-4 text-green-600 dark:text-green-400" />
                            Sample Daily Meal Plan
                          </h3>
                          <div className="space-y-3 text-sm">
                            <p><span className="font-medium text-indigo-600 dark:text-cyan-400">Breakfast:</span> {getDietRecommendation().mealPlan.breakfast}</p>
                            <p><span className="font-medium text-indigo-600 dark:text-cyan-400">Morning Snack:</span> {getDietRecommendation().mealPlan.snack1}</p>
                            <p><span className="font-medium text-indigo-600 dark:text-cyan-400">Lunch:</span> {getDietRecommendation().mealPlan.lunch}</p>
                            <p><span className="font-medium text-indigo-600 dark:text-cyan-400">Afternoon Snack:</span> {getDietRecommendation().mealPlan.snack2}</p>
                            <p><span className="font-medium text-indigo-600 dark:text-cyan-400">Dinner:</span> {getDietRecommendation().mealPlan.dinner}</p>
                      </div>
                        </motion.div>
                  </CardContent>
                  <CardFooter>
                    <Alert className="w-full bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800/30">
                      <AlertDescription className="text-xs">
                        These recommendations are general guidelines. For a fully personalized plan, consult with a registered dietitian or healthcare provider.
                      </AlertDescription>
                    </Alert>
                  </CardFooter>
                </Card>
                  </motion.div>
              )}
              </AnimatePresence>
            </div>
          </div>

          <motion.div 
            className="text-center space-y-6"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-bold">What is BMI?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Body Mass Index (BMI) is a measure of body fat based on height and weight that applies to adult men and women. 
              It is used to categorize a person as underweight, normal weight, overweight, or obese.
            </p>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <motion.div 
                className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all"
                variants={itemVariants}
              >
                <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-2">Underweight</h3>
                <p className="text-sm">BMI less than 18.5</p>
              </motion.div>
              <motion.div 
                className="p-6 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-2 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 transition-all"
                variants={itemVariants}
              >
                <h3 className="font-bold text-green-600 dark:text-green-400 mb-2">Normal</h3>
                <p className="text-sm">BMI between 18.5 and 24.9</p>
              </motion.div>
              <motion.div 
                className="p-6 rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-2 border-yellow-200 dark:border-yellow-800 hover:border-yellow-400 dark:hover:border-yellow-600 transition-all"
                variants={itemVariants}
              >
                <h3 className="font-bold text-yellow-600 dark:text-yellow-400 mb-2">Overweight</h3>
                <p className="text-sm">BMI between 25 and 29.9</p>
              </motion.div>
              <motion.div 
                className="p-6 rounded-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-2 border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 transition-all"
                variants={itemVariants}
              >
                <h3 className="font-bold text-red-600 dark:text-red-400 mb-2">Obese</h3>
                <p className="text-sm">BMI 30 or greater</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Fitlife. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>

      {/* BMI History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-h-[80vh] overflow-auto backdrop-blur-lg bg-white/90 dark:bg-gray-900/90">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-600 dark:text-cyan-400" />
              Your BMI History
            </DialogTitle>
            <DialogDescription>
              View your past BMI measurements
            </DialogDescription>
          </DialogHeader>
          
          <motion.div 
            className="mt-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="relative h-12 w-12">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-900"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 dark:border-t-cyan-400 animate-spin"></div>
                </div>
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-8">
                <Scale className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">You don't have any saved BMI records yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((record, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    custom={index}
                  >
                    <Card className="border-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <span className={getBmiColor()}>BMI: {record.bmi}</span>
                          </CardTitle>
                          <span className="text-sm text-muted-foreground">
                            {record.date ? format(new Date(record.date), 'MMM d, yyyy') : 'No date'}
                          </span>
                        </div>
                        <CardDescription>Category: {record.category}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Ruler className="h-4 w-4 text-indigo-600 dark:text-cyan-400" />
                            Height: {record.height} cm
                          </div>
                          <div className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-indigo-600 dark:text-cyan-400" />
                            Weight: {record.weight} kg
                          </div>
                        </div>
                        {record.notes && (
                          <div className="mt-4 text-sm p-3 rounded-lg bg-muted/50">
                            <p className="font-medium mb-1">Notes:</p>
                            <p className="text-muted-foreground">{record.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
    </div>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
} 