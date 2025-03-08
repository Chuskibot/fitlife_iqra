"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  Activity, 
  User, 
  LogOut, 
  BarChart3, 
  Utensils, 
  Settings,
  Dumbbell,
  Timer,
  Heart,
  Flame,
  TrendingUp,
  Calendar,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import toast from "react-hot-toast";

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      // Simulate data loading
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [status, router]);
  
  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative h-24 w-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-900"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 dark:border-t-cyan-400 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="h-8 w-8 text-indigo-600 dark:text-cyan-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-1 text-gray-800 dark:text-white">Loading Fitlife Dashboard</h3>
          <p className="text-muted-foreground">Preparing your personalized fitness data...</p>
        </div>
      </div>
    );
  }
  
  // Handle logout
  const handleLogout = async () => {
    toast.loading("Logging out...");
    await signOut({ redirect: false });
    toast.success("Successfully logged out");
    router.push("/");
  };

  // Dashboard animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } },
  };

  // Mock fitness data for demo purposes
  const mockData = {
    todaysStats: {
      calories: 1250,
      steps: 7500,
      activeMinutes: 45,
      workouts: 1,
    },
    weeklyProgress: {
      caloriesGoal: 2000,
      caloriesBurned: 1250,
      stepsGoal: 10000,
      steps: 7500,
      workoutsGoal: 5,
      workouts: 3,
    },
    recentActivities: [
      { type: "Running", duration: "30 min", calories: 320, date: "Today, 8:30 AM", icon: <Timer className="h-5 w-5 text-blue-500" /> },
      { type: "Weight Training", duration: "45 min", calories: 280, date: "Yesterday, 6:15 PM", icon: <Dumbbell className="h-5 w-5 text-purple-500" /> },
      { type: "Yoga", duration: "20 min", calories: 120, date: "2 days ago, 7:00 AM", icon: <Activity className="h-5 w-5 text-green-500" /> },
    ],
    nutritionSummary: {
      calories: 1650,
      protein: 95,
      carbs: 180,
      fat: 55,
      water: 1.8,
    },
    upcomingGoals: [
      { name: "Run 25 km", progress: 18, total: 25, unit: "km", dueDate: "In 5 days" },
      { name: "Lose 5 kg", progress: 3.2, total: 5, unit: "kg", dueDate: "In 12 days" },
    ],
  };

  return (
    <motion.div 
      className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/30 dark:supports-[backdrop-filter]:bg-gray-900/30">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold">Fitlife</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-indigo-600 dark:text-cyan-400">
              Dashboard
            </Link>
            <Link href="/bmi-calculator" className="text-sm font-medium hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
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
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                <User className="h-4 w-4 text-indigo-600 dark:text-cyan-400" />
              </div>
              <span className="text-sm font-medium hidden md:inline-block">
                {session?.user?.name || "User"}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <motion.div
          className="space-y-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Welcome Section */}
          <motion.div variants={item} className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {session?.user?.name?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-muted-foreground">
              Here's a summary of your fitness journey progress
            </p>
          </motion.div>

          {/* Dashboard Tabs */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <motion.div 
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <motion.div variants={item}>
                  <Card className="overflow-hidden border-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:shadow-md">
                    <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Flame className="mr-2 h-4 w-4 text-orange-500" />
                        Calories Burned
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold">{mockData.todaysStats.calories}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="text-green-500 font-medium">{Math.round((mockData.todaysStats.calories / mockData.weeklyProgress.caloriesGoal) * 100)}%</span> of daily goal
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div variants={item}>
                  <Card className="overflow-hidden border-2 hover:border-cyan-300 dark:hover:border-cyan-700 transition-all hover:shadow-md">
                    <CardHeader className="pb-2 bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Timer className="mr-2 h-4 w-4 text-cyan-500" />
                        Active Minutes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold">{mockData.todaysStats.activeMinutes}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="text-green-500 font-medium">+10%</span> from yesterday
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div variants={item}>
                  <Card className="overflow-hidden border-2 hover:border-green-300 dark:hover:border-green-700 transition-all hover:shadow-md">
                    <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                        Steps
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold">{mockData.todaysStats.steps.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="text-amber-500 font-medium">{Math.round((mockData.todaysStats.steps / mockData.weeklyProgress.stepsGoal) * 100)}%</span> of daily goal
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div variants={item}>
                  <Card className="overflow-hidden border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:shadow-md">
                    <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Dumbbell className="mr-2 h-4 w-4 text-purple-500" />
                        Workouts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold">{mockData.todaysStats.workouts}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="text-green-500 font-medium">{Math.round((mockData.todaysStats.workouts / mockData.weeklyProgress.workoutsGoal) * 100)}%</span> of weekly goal
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <motion.div variants={item}>
                  <Card className="h-full hover:shadow-lg transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Activity className="mr-2 h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                        Recent Activities
                      </CardTitle>
                      <CardDescription>Your latest workouts</CardDescription>
            </CardHeader>
            <CardContent>
                      <div className="space-y-4">
                        {mockData.recentActivities.map((activity, index) => (
                          <motion.div 
                            key={index} 
                            className="flex items-center"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.5 }}
                          >
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 mr-3">
                              {activity.icon}
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {activity.type}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {activity.duration} • {activity.calories} cal
                              </p>
                </div>
                            <div className="text-xs text-muted-foreground">
                              {activity.date}
                </div>
                          </motion.div>
                        ))}
              </div>
            </CardContent>
            <CardFooter>
                      <Button variant="ghost" className="w-full" onClick={() => router.push("/fitness-tracker")}>
                        View All Activities
              </Button>
            </CardFooter>
          </Card>
                </motion.div>

                <motion.div variants={item}>
                  <Card className="h-full hover:shadow-lg transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Target className="mr-2 h-5 w-5 text-indigo-600 dark:text-cyan-400" />
                        Weekly Progress
                      </CardTitle>
                      <CardDescription>Your goals and achievements</CardDescription>
            </CardHeader>
            <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Flame className="mr-2 h-4 w-4 text-orange-500" />
                              <span className="text-sm font-medium">Calories</span>
                            </div>
                            <span className="text-xs font-medium">
                              {mockData.weeklyProgress.caloriesBurned} / {mockData.weeklyProgress.caloriesGoal} kcal
                            </span>
                          </div>
                          <Progress 
                            value={(mockData.weeklyProgress.caloriesBurned / mockData.weeklyProgress.caloriesGoal) * 100} 
                            className="h-2" 
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium">Steps</span>
                            </div>
                            <span className="text-xs font-medium">
                              {mockData.weeklyProgress.steps.toLocaleString()} / {mockData.weeklyProgress.stepsGoal.toLocaleString()}
                            </span>
                          </div>
                          <Progress 
                            value={(mockData.weeklyProgress.steps / mockData.weeklyProgress.stepsGoal) * 100} 
                            className="h-2" 
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Dumbbell className="mr-2 h-4 w-4 text-purple-500" />
                              <span className="text-sm font-medium">Workouts</span>
                            </div>
                            <span className="text-xs font-medium">
                              {mockData.weeklyProgress.workouts} / {mockData.weeklyProgress.workoutsGoal}
                            </span>
                </div>
                          <Progress 
                            value={(mockData.weeklyProgress.workouts / mockData.weeklyProgress.workoutsGoal) * 100} 
                            className="h-2" 
                          />
                </div>
              </div>
            </CardContent>
            <CardFooter>
                      <Button variant="ghost" className="w-full" onClick={() => setActiveTab("goals")}>
                        View All Goals
              </Button>
            </CardFooter>
          </Card>
                </motion.div>
              </div>
            </TabsContent>
            
            {/* Activities Tab */}
            <TabsContent value="activities">
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
          <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Your Activities</CardTitle>
                        <CardDescription>Track your physical activities</CardDescription>
                      </div>
                      <Button onClick={() => router.push("/fitness-tracker")}>
                        Go to Fitness Tracker
                      </Button>
                    </div>
            </CardHeader>
            <CardContent>
                    <div className="text-center p-8">
                      <Timer className="h-12 w-12 text-indigo-600 dark:text-cyan-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Track Your Fitness Journey</h3>
                      <p className="text-muted-foreground mb-4">
                        Log your workouts, set goals, and monitor your progress with our Fitness Tracker.
                      </p>
                      <Button onClick={() => router.push("/fitness-tracker")}>
                        Get Started
                      </Button>
                </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            {/* Nutrition Tab */}
            <TabsContent value="nutrition">
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                <div>
                        <CardTitle>Your Nutrition</CardTitle>
                        <CardDescription>Track your diet and nutrition</CardDescription>
                      </div>
                      <Button onClick={() => router.push("/diet-planner")}>
                        Go to Diet Planner
                      </Button>
                </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-8">
                      <Utensils className="h-12 w-12 text-indigo-600 dark:text-cyan-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Plan Your Perfect Diet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Get personalized diet plans based on your body metrics and fitness goals.
                      </p>
                      <Button onClick={() => router.push("/diet-planner")}>
                        Get Started
                      </Button>
              </div>
            </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            {/* Goals Tab */}
            <TabsContent value="goals">
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Your Fitness Goals</CardTitle>
                    <CardDescription>Track and manage your goals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {mockData.upcomingGoals.map((goal, index) => (
                        <motion.div 
                          key={index}
                          className="space-y-2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{goal.name}</p>
                            <div className="flex items-center">
                              <span className="text-xs text-muted-foreground mr-2">{goal.dueDate}</span>
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                {Math.round((goal.progress / goal.total) * 100)}%
                              </span>
                            </div>
                          </div>
                          <Progress value={(goal.progress / goal.total) * 100} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{goal.progress} / {goal.total} {goal.unit}</span>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Update Progress</Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="text-center mt-8">
                      <Button onClick={() => router.push("/fitness-tracker")}>
                        Set New Goal
              </Button>
                    </div>
                  </CardContent>
          </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Fitlife. All rights reserved.
            <span className="ml-2">Created by vu@222311062</span>
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline underline-offset-4">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline underline-offset-4">
              Privacy
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:underline underline-offset-4">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </motion.div>
  );
} 