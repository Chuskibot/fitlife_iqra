"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Activity, Salad, ArrowRight, Save, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useDietPlans } from "@/hooks/useDietPlans";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Meal, DietPlan } from "@/models/diet-plan";

interface GeneratedDietPlan {
  title: string;
  description: string;
  tips: string[];
  mealPlan: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snack1: string;
    snack2: string;
  };
  calories: number;
}

// Add these animation variants at the top level
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

const cardVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const staggerVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

export default function DietPlanner() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  
  // Get BMI data from URL if available
  const bmiFromUrl = searchParams.get('bmi');
  const categoryFromUrl = searchParams.get('category');

  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<string>("male");
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(170);
  const [activityLevel, setActivityLevel] = useState<string>("moderate");
  const [goal, setGoal] = useState<string>(categoryFromUrl === "Underweight" ? "gain" : 
                                         (categoryFromUrl === "Overweight" || categoryFromUrl === "Obese") ? "lose" : "maintain");
  const [dietType, setDietType] = useState<string>("balanced");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dietPlan, setDietPlan] = useState<GeneratedDietPlan | null>(null);
  const [bmi, setBmi] = useState<number | null>(bmiFromUrl ? parseFloat(bmiFromUrl) : null);
  const [fromBmiCalculator, setFromBmiCalculator] = useState<boolean>(!!bmiFromUrl);
  const [dietName, setDietName] = useState<string>("");
  const [dietNotes, setDietNotes] = useState<string>("");
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  
  // Use our custom diet plans hook
  const { plans, loading: plansLoading, savePlan } = useDietPlans();
  
  // Pre-fill with most recent plan parameters if available
  useEffect(() => {
    if (plans.length > 0 && !fromBmiCalculator) {
      const latestPlan = plans[0];
      setAge(30); // Default since it's not stored
      setGender("male"); // Default since it's not stored
      setGoal(latestPlan.goalType === "weight_loss" ? "lose" : 
             latestPlan.goalType === "weight_gain" ? "gain" : "maintain");
      setDietType(latestPlan.goalType); // Set diet type based on goal
    }
  }, [plans, fromBmiCalculator]);

  useEffect(() => {
    // If BMI is provided in URL, auto-generate a diet plan
    if (bmiFromUrl && !dietPlan) {
      generateDietPlan();
    }
  }, [bmiFromUrl]);

  // Calculate calories based on user inputs
  const calculateCalories = (): number => {
    // Base calorie calculation using the Harris-Benedict equation
    let bmr = 0;
    
    if (gender === "male") {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    
    // Activity level multiplier
    let activityMultiplier = 1.2; // Sedentary
    if (activityLevel === "light") {
      activityMultiplier = 1.375;
    } else if (activityLevel === "moderate") {
      activityMultiplier = 1.55;
    } else if (activityLevel === "active") {
      activityMultiplier = 1.725;
    } else if (activityLevel === "very-active") {
      activityMultiplier = 1.9;
    }
    
    let tdee = bmr * activityMultiplier;
    
    // Adjust for goal
    if (goal === "lose") {
      tdee -= 500; // Calorie deficit for weight loss
    } else if (goal === "gain") {
      tdee += 500; // Calorie surplus for weight gain
    }
    
    return Math.round(tdee);
  };

  // Generate meal items based on diet type and meal type
  const generateMealItems = (dietType: string, mealType: string): string[] => {
    const mealItems: {[key: string]: {[key: string]: string[]}} = {
      balanced: {
        breakfast: [
          "Oatmeal with berries and nuts",
          "Whole grain toast with avocado and eggs",
          "Greek yogurt with granola and fresh fruit",
          "Smoothie bowl with banana, berries, and chia seeds"
        ],
        lunch: [
          "Quinoa salad with mixed vegetables and grilled chicken",
          "Whole grain wrap with hummus, vegetables, and turkey",
          "Brown rice bowl with beans, vegetables, and avocado",
          "Mediterranean salad with chickpeas, feta, and olive oil dressing"
        ],
        dinner: [
          "Grilled salmon with roasted vegetables and quinoa",
          "Baked chicken breast with sweet potato and steamed broccoli",
          "Stir-fried tofu with brown rice and mixed vegetables",
          "Lentil soup with a side salad and whole grain bread"
        ],
        snack: [
          "Apple slices with almond butter",
          "Greek yogurt with honey",
          "Handful of mixed nuts and dried fruit",
          "Whole grain crackers with hummus",
          "Carrot sticks with guacamole"
        ]
      },
      highProtein: {
        breakfast: [
          "Protein smoothie with whey powder, banana, and almond milk",
          "Egg white omelet with spinach and turkey",
          "Greek yogurt with protein granola",
          "Cottage cheese with fruit and nuts"
        ],
        lunch: [
          "Grilled chicken breast with quinoa and vegetables",
          "Tuna salad with mixed greens",
          "Turkey and vegetable stir-fry with brown rice",
          "Lentil and vegetable soup with a side of grilled chicken"
        ],
        dinner: [
          "Baked salmon with asparagus and sweet potato",
          "Lean beef stir-fry with broccoli and brown rice",
          "Grilled chicken with roasted vegetables",
          "Tofu and vegetable curry with quinoa"
        ],
        snack: [
          "Protein bar",
          "Hard-boiled eggs",
          "Turkey slices with cucumber",
          "Protein shake",
          "Greek yogurt with berries"
        ]
      },
      lowCarb: {
        breakfast: [
          "Avocado and egg breakfast bowl",
          "Greek yogurt with berries and nuts",
          "Spinach and mushroom omelet",
          "Chia seed pudding with almond milk and berries"
        ],
        lunch: [
          "Salmon salad with mixed greens and olive oil dressing",
          "Lettuce wraps with grilled chicken and avocado",
          "Cauliflower rice bowl with grilled shrimp and vegetables",
          "Zucchini noodles with turkey meatballs"
        ],
        dinner: [
          "Grilled steak with roasted brussels sprouts",
          "Baked chicken thighs with cauliflower mash",
          "Grilled fish with asparagus and a side salad",
          "Stuffed bell peppers with ground turkey and vegetables"
        ],
        snack: [
          "Celery sticks with almond butter",
          "Hard-boiled eggs",
          "Cucumber slices with guacamole",
          "String cheese",
          "Handful of mixed nuts"
        ]
      }
    };
    
    const dietKey = dietType === "high-protein" ? "highProtein" : 
                   dietType === "low-carb" ? "lowCarb" : "balanced";
    
    const meals = mealItems[dietKey][mealType] || mealItems.balanced[mealType];
    
    // Return 1-2 random items from the list
    const shuffled = [...meals].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, mealType === "snack" ? 1 : 1);
  };

  // Generate diet recommendations based on BMI
  const generateDietRecommendations = (bmiValue: number | null): string => {
    if (!bmiValue) return "Personalized diet recommendations based on your health profile.";
    
    if (bmiValue < 18.5) {
      return "Your BMI indicates you're underweight. Focus on nutrient-dense foods to gain healthy weight.";
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      return "Your BMI is in the healthy range. Maintain a balanced diet to support overall health.";
    } else if (bmiValue >= 25 && bmiValue < 30) {
      return "Your BMI indicates you're overweight. Focus on portion control and increasing physical activity.";
    } else {
      return "Your BMI indicates obesity. Consider consulting a healthcare professional for personalized guidance.";
    }
  };

  // Generate a complete diet plan
  const generateDietPlan = () => {
    setIsLoading(true);
    
    // Calculate BMI if not already available from URL
    let calculatedBmi = bmi;
    if (!calculatedBmi) {
      const heightInMeters = height / 100;
      calculatedBmi = weight / (heightInMeters * heightInMeters);
      setBmi(parseFloat(calculatedBmi.toFixed(1)));
    }
    
    try {
      // Calculate daily calorie needs
      const calories = calculateCalories();
      
      // Generate diet recommendations
      const recommendations = generateDietRecommendations(calculatedBmi);
      
      // Generate meal items
      const breakfast = generateMealItems(dietType, "breakfast").join(", ");
      const lunch = generateMealItems(dietType, "lunch").join(", ");
      const dinner = generateMealItems(dietType, "dinner").join(", ");
      const snack1 = generateMealItems(dietType, "snack").join(", ");
      const snack2 = generateMealItems(dietType, "snack").join(", ");
      
      // Combine into a complete diet plan
      const generatedPlan: GeneratedDietPlan = {
        title: `${goal === "lose" ? "Weight Loss" : goal === "gain" ? "Weight Gain" : "Weight Maintenance"} Diet Plan`,
        description: recommendations,
        tips: [
          "Stay hydrated with at least 8 glasses of water daily",
          "Try to eat at regular intervals",
          "Include a variety of colorful vegetables in your meals",
          "Limit processed foods and added sugars",
          "Consider tracking your food intake for better awareness"
        ],
        mealPlan: {
          breakfast,
          lunch,
          dinner,
          snack1,
          snack2
        },
        calories
      };
      
      setDietPlan(generatedPlan);
      
      // Set a default diet plan name
      if (!dietName) {
        const goalType = goal === "lose" ? "Weight Loss" : 
                        goal === "gain" ? "Weight Gain" : "Maintenance";
        setDietName(`${goalType} Plan - ${format(new Date(), 'MMM d, yyyy')}`);
      }
    } catch (error) {
      console.error("Error generating diet plan:", error);
      toast.error("Error generating diet plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Save the current diet plan
  const handleSaveDietPlan = async () => {
    if (!dietName) {
      toast.error("Please give your diet plan a name");
      return;
    }

    if (!dietPlan) {
      toast.error("Please generate a diet plan first");
      return;
    }

    // Convert the meal plan format to match the expected structure
    const meals: Meal[] = Object.entries(dietPlan.mealPlan).map(([name, description]) => ({
      name: name.replace(/([A-Z])/g, ' $1').trim(),
      description,
      calories: Math.round(dietPlan.calories / 5), // Roughly divide calories among meals
      protein: 0, // These would need to be calculated properly in a real app
      carbs: 0,
      fats: 0
    }));

    await savePlan({
      name: dietName,
      notes: dietNotes || "",
      goalType: goal === "lose" ? "weight_loss" : 
               goal === "gain" ? "weight_gain" : "maintenance",
      targetCalories: dietPlan.calories,
      meals
    });
  };

  return (
    <motion.div 
      className="flex min-h-screen flex-col bg-gradient-to-br from-green-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/30">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold">Fitlife</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium hover:text-green-600 dark:hover:text-green-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/bmi-calculator" className="text-sm font-medium hover:text-green-600 dark:hover:text-green-400 transition-colors">
              BMI Calculator
            </Link>
            <Link href="/diet-planner" className="text-sm font-medium text-green-600 dark:text-green-400">
              Diet Planner
            </Link>
            <Link href="/fitness-tracker" className="text-sm font-medium hover:text-green-600 dark:hover:text-green-400 transition-colors">
              Fitness Tracker
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {session ? (
              <Button 
                variant="outline" 
                onClick={() => setHistoryOpen(true)}
                className="flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                History
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
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-cyan-500">
              Personalized Diet Planner
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create a customized diet plan based on your health goals and preferences.
              {bmi && <span className="block mt-2 text-green-600 dark:text-green-400">BMI: {bmi} - {categoryFromUrl}</span>}
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            <motion.div variants={itemVariants}>
              <Card className="w-full backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-2 hover:border-green-300 dark:hover:border-green-700 transition-all">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Your Profile
                  </CardTitle>
                <CardDescription>
                    Enter your details to get a personalized diet plan
                </CardDescription>
              </CardHeader>
                <CardContent className="space-y-6">
                  <motion.div 
                    className="grid gap-4 md:grid-cols-2"
                    variants={containerVariants}
                  >
                    <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                        className="focus-visible:ring-green-500"
                    />
                    </motion.div>
                    <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    </motion.div>
                    <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                        className="focus-visible:ring-green-500"
                    />
                    </motion.div>
                    <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                        className="focus-visible:ring-green-500"
                    />
                    </motion.div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="activity">Activity Level</Label>
                  <Select value={activityLevel} onValueChange={setActivityLevel}>
                      <SelectTrigger>
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="light">Light Activity</SelectItem>
                        <SelectItem value="moderate">Moderate Activity</SelectItem>
                        <SelectItem value="active">Very Active</SelectItem>
                        <SelectItem value="very-active">Extra Active</SelectItem>
                    </SelectContent>
                  </Select>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="goal">Goal</Label>
                  <Select value={goal} onValueChange={setGoal}>
                      <SelectTrigger>
                      <SelectValue placeholder="Select your goal" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="lose">Weight Loss</SelectItem>
                      <SelectItem value="maintain">Maintain Weight</SelectItem>
                        <SelectItem value="gain">Weight Gain</SelectItem>
                    </SelectContent>
                  </Select>
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="dietType">Diet Type</Label>
                  <Select value={dietType} onValueChange={setDietType}>
                      <SelectTrigger>
                      <SelectValue placeholder="Select diet type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="high-protein">High Protein</SelectItem>
                        <SelectItem value="low-carb">Low Carb</SelectItem>
                    </SelectContent>
                  </Select>
                  </motion.div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={generateDietPlan} 
                  disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-cyan-500 hover:from-green-700 hover:to-cyan-600 text-white"
                >
                  {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Generating Plan...
                    </div>
                  ) : (
                      <>
                        <Salad className="mr-2 h-4 w-4" />
                      Generate Diet Plan
                      </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            </motion.div>

            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {dietPlan && (
                  <motion.div
                    key="diet-plan"
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    exit="initial"
                  >
                    <Card className="w-full backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-2 hover:border-green-300 dark:hover:border-green-700 transition-all">
                <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <Salad className="h-5 w-5 text-green-600 dark:text-green-400" />
                          Your Diet Plan
                        </CardTitle>
                  <CardDescription>
                          {dietPlan.description}
                  </CardDescription>
                </CardHeader>
                      <CardContent className="space-y-6">
                        <motion.div 
                          className="text-center py-4"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                            {dietPlan.calories} kcal
                  </div>
                          <p className="text-sm text-muted-foreground">
                            Daily Calorie Target
                          </p>
                        </motion.div>

                        <motion.div 
                          className="space-y-4"
                          variants={containerVariants}
                          initial="hidden"
                          animate="show"
                        >
                          {Object.entries(dietPlan.mealPlan).map(([meal, items], index) => (
                            <motion.div
                              key={meal}
                              className="p-4 rounded-lg bg-gradient-to-br from-green-50/50 to-cyan-50/50 dark:from-green-950/50 dark:to-cyan-950/50 border border-green-100 dark:border-green-800"
                              variants={staggerVariants}
                              custom={index}
                            >
                              <h3 className="font-medium text-green-600 dark:text-green-400 mb-2 capitalize">
                                {meal.replace(/([A-Z])/g, ' $1').trim()}
                              </h3>
                              <p className="text-sm text-muted-foreground">{items}</p>
                            </motion.div>
                          ))}
                        </motion.div>

                        {session && (
                          <motion.div 
                            className="space-y-4 mt-6"
                            variants={itemVariants}
                          >
                            <div className="space-y-2">
                              <Label htmlFor="dietName">Plan Name</Label>
                              <Input
                                id="dietName"
                                value={dietName}
                                onChange={(e) => setDietName(e.target.value)}
                                placeholder="e.g., My Weight Loss Plan"
                                className="focus-visible:ring-green-500"
                              />
                      </div>
                            <div className="space-y-2">
                              <Label htmlFor="dietNotes">Notes</Label>
                              <Textarea
                                id="dietNotes"
                                value={dietNotes}
                                onChange={(e) => setDietNotes(e.target.value)}
                                placeholder="Add any notes about this diet plan..."
                                className="focus-visible:ring-green-500"
                              />
                  </div>
                          </motion.div>
                        )}
                </CardContent>
                      <CardFooter className="flex flex-col gap-4">
                        {session ? (
                          <Button 
                            onClick={handleSaveDietPlan}
                            className="w-full bg-gradient-to-r from-green-600 to-cyan-500 hover:from-green-700 hover:to-cyan-600 text-white"
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Save Diet Plan
                  </Button>
                        ) : (
                          <Alert className="bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800/30">
                            <AlertDescription className="text-xs">
                              Sign in to save your diet plan and track your progress.
                            </AlertDescription>
                          </Alert>
                        )}
                </CardFooter>
              </Card>
                  </motion.div>
                )}
              </AnimatePresence>
                </div>
          </div>
        </motion.div>
      </main>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-h-[80vh] overflow-auto backdrop-blur-lg bg-white/90 dark:bg-gray-900/90">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <History className="h-5 w-5 text-green-600 dark:text-green-400" />
              Your Diet Plans
            </DialogTitle>
            <DialogDescription>
              View your saved diet plans
            </DialogDescription>
          </DialogHeader>
          
          <motion.div 
            className="mt-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {plansLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="relative h-12 w-12">
                  <div className="absolute inset-0 rounded-full border-4 border-green-200 dark:border-green-900"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-green-600 dark:border-t-green-400 animate-spin"></div>
          </div>
        </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-8">
                <Salad className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">You haven't saved any diet plans yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {plans.map((plan, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    custom={index}
                  >
                    <Card className="border-2 hover:border-green-300 dark:hover:border-green-700 transition-all">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <span className="text-sm text-muted-foreground">
                            {plan.date ? format(new Date(plan.date), 'MMM d, yyyy') : 'No date'}
                          </span>
                        </div>
                        <CardDescription>
                          Goal: {plan.goalType.replace('_', ' ')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium">{plan.targetCalories} kcal/day</span>
                          </div>
                          {plan.notes && (
                            <div className="text-sm p-3 rounded-lg bg-muted/50">
                              <p className="font-medium mb-1">Notes:</p>
                              <p className="text-muted-foreground">{plan.notes}</p>
                            </div>
                          )}
                        </div>
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