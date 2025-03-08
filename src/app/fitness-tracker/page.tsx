"use client";

import { useState } from "react";
import { 
  Activity, 
  BarChart2, 
  Target, 
  Calendar, 
  Plus,
  X,
  Dumbbell,
  Timer,
  Leaf,
  Trophy,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useFitnessActivities } from "@/hooks/useFitnessActivities";
import { useFitnessGoals } from "@/hooks/useFitnessGoals";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Add animation variants at the top level
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
      delayChildren: 0.2
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

export default function FitnessTracker() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Activity form state
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [activityType, setActivityType] = useState<string>("cardio");
  const [activityName, setActivityName] = useState<string>("");
  const [activityDuration, setActivityDuration] = useState<number>(30);
  const [activityNotes, setActivityNotes] = useState<string>("");
  
  // Goal form state
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [goalName, setGoalName] = useState<string>("");
  const [goalTarget, setGoalTarget] = useState<number>(0);
  const [goalUnit, setGoalUnit] = useState<string>("km");
  const [goalDeadline, setGoalDeadline] = useState<string>(
    format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd") // Default to 30 days from now
  );
  
  // Edit goal progress state
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [goalProgress, setGoalProgress] = useState<number>(0);
  
  // Use custom hooks for activities and goals
  const { 
    activities, 
    loading: activitiesLoading, 
    quickAddActivity, 
    deleteActivity, 
    getActivityStats 
  } = useFitnessActivities();
  
  const { 
    goals, 
    loading: goalsLoading, 
    addGoal, 
    updateGoalProgress, 
    getGoalStats 
  } = useFitnessGoals();
  
  // Stats derived from hooks
  const activityStats = getActivityStats();
  const goalStats = getGoalStats();
  
  // Handler for adding a new activity
  const handleAddActivity = async () => {
    if (!activityName) {
      toast.error("Please enter an activity name");
      return;
    }
    
    if (activityDuration <= 0) {
      toast.error("Duration must be greater than 0");
      return;
    }
    
    const success = await quickAddActivity(
      activityType,
      activityName,
      activityDuration,
      undefined, // Using default weight
      activityNotes
    );
    
    if (success) {
      // Reset form
      setActivityName("");
      setActivityDuration(30);
      setActivityNotes("");
      setActivityDialogOpen(false);
    }
  };
  
  // Handler for adding a new goal
  const handleAddGoal = async () => {
    if (!goalName) {
      toast.error("Please enter a goal name");
      return;
    }
    
    if (goalTarget <= 0) {
      toast.error("Target must be greater than 0");
      return;
    }
    
    const goalData = {
      name: goalName,
      target: goalTarget,
      unit: goalUnit,
      deadline: new Date(goalDeadline), // Convert string to Date
      progress: 0,
      completed: false,
    };
    
    const success = await addGoal(goalData);
    
    if (success) {
      // Reset form
      setGoalName("");
      setGoalTarget(0);
      setGoalUnit("km");
      setGoalDeadline(format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));
      setGoalDialogOpen(false);
    }
  };
  
  // Handler for updating goal progress
  const handleUpdateProgress = async () => {
    if (selectedGoalId) {
      const success = await updateGoalProgress(selectedGoalId, goalProgress);
      
      if (success) {
        setProgressDialogOpen(false);
      }
    }
  };
  
  // Function to open the progress dialog for a specific goal
  const openProgressDialog = (goalId: string, currentProgress: number) => {
    setSelectedGoalId(goalId);
    setGoalProgress(currentProgress);
    setProgressDialogOpen(true);
  };
  
  // Function to get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "cardio":
        return <Timer className="h-5 w-5 text-red-500" />;
      case "strength":
        return <Dumbbell className="h-5 w-5 text-blue-500" />;
      case "flexibility":
        return <Leaf className="h-5 w-5 text-green-500" />;
      case "sports":
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800"
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
            <Link href="/dashboard" className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/bmi-calculator" className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              BMI Calculator
            </Link>
            <Link href="/diet-planner" className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Diet Planner
            </Link>
            <Link href="/fitness-tracker" className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Fitness Tracker
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {session ? (
              <Button 
                variant="outline" 
                onClick={() => setActivityDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Log Activity
              </Button>
            ) : (
              <Link href="/auth/login">
                <Button>Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto py-8">
        <motion.div 
          className="mb-8 flex items-center justify-between"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.h1 
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
            variants={itemVariants}
          >
            Fitness Tracker
          </motion.h1>
          <motion.div 
            className="flex space-x-3"
            variants={itemVariants}
          >
            <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Log Activity
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log New Activity</DialogTitle>
                  <DialogDescription>
                    Record your latest workout or physical activity
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="activity-type">Activity Type</Label>
                    <Select 
                      value={activityType} 
                      onValueChange={setActivityType}
                    >
                      <SelectTrigger id="activity-type">
                        <SelectValue placeholder="Select activity type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cardio">Cardio</SelectItem>
                        <SelectItem value="strength">Strength Training</SelectItem>
                        <SelectItem value="flexibility">Flexibility & Yoga</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="activity-name">Activity Name</Label>
                    <Input 
                      id="activity-name" 
                      placeholder="e.g., Running, Weight Lifting, Yoga" 
                      value={activityName}
                      onChange={(e) => setActivityName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="activity-duration">
                      Duration (min): {activityDuration}
                    </Label>
                    <Slider
                      id="activity-duration"
                      min={5}
                      max={180}
                      step={5}
                      value={[activityDuration]}
                      onValueChange={(values) => setActivityDuration(values[0])}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="activity-notes">Notes (Optional)</Label>
                    <Textarea 
                      id="activity-notes" 
                      placeholder="Any additional details about your activity"
                      value={activityNotes}
                      onChange={(e) => setActivityNotes(e.target.value)}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setActivityDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddActivity}>
                    Log Activity
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Target className="mr-2 h-4 w-4" />
                  Set Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set New Fitness Goal</DialogTitle>
                  <DialogDescription>
                    Create a new goal to track your fitness progress
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="goal-name">Goal Name</Label>
                    <Input 
                      id="goal-name" 
                      placeholder="e.g., Run 100km, Lose 5kg" 
                      value={goalName}
                      onChange={(e) => setGoalName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="goal-target">Target</Label>
                      <Input 
                        id="goal-target" 
                        type="number" 
                        min={1}
                        value={goalTarget}
                        onChange={(e) => setGoalTarget(Number(e.target.value))}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="goal-unit">Unit</Label>
                      <Select 
                        value={goalUnit} 
                        onValueChange={setGoalUnit}
                      >
                        <SelectTrigger id="goal-unit">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="km">Kilometers</SelectItem>
                          <SelectItem value="mi">Miles</SelectItem>
                          <SelectItem value="kg">Kilograms</SelectItem>
                          <SelectItem value="lbs">Pounds</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="sessions">Sessions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="goal-deadline">Deadline</Label>
                    <Input 
                      id="goal-deadline" 
                      type="date" 
                      value={goalDeadline}
                      onChange={(e) => setGoalDeadline(e.target.value)}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setGoalDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddGoal}>
                    Set Goal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>
        </motion.div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r from-blue-500 to-purple-500 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="activities" className="data-[state=active]:bg-gradient-to-r from-blue-500 to-purple-500 data-[state=active]:text-white">Activities</TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-gradient-to-r from-blue-500 to-purple-500 data-[state=active]:text-white">Goals</TabsTrigger>
          </TabsList>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <motion.div 
                  className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div variants={itemVariants}>
                    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          Total Activities
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <motion.div 
                          className="text-3xl font-bold text-blue-600 dark:text-blue-400"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        >
                          {activityStats.totalActivities}
                        </motion.div>
                        <p className="text-xs text-muted-foreground">
                          {activityStats.totalDuration} minutes total
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <BarChart2 className="h-4 w-4 text-blue-500" />
                          Calories Burned
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <motion.div 
                          className="text-3xl font-bold text-blue-600 dark:text-blue-400"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        >
                          {activityStats.totalCalories}
                        </motion.div>
                        <p className="text-xs text-muted-foreground">
                          Last 30 days
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-500" />
                          Active Goals
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <motion.div 
                          className="text-3xl font-bold text-blue-600 dark:text-blue-400"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        >
                          {goalStats.totalGoals - goalStats.completedGoals}
                        </motion.div>
                        <p className="text-xs text-muted-foreground">
                          {goalStats.completedGoals} completed
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <BarChart2 className="h-4 w-4 text-blue-500" />
                          Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <motion.div 
                          className="text-3xl font-bold text-blue-600 dark:text-blue-400"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        >
                          {goalStats.totalGoals ? Math.round(goalStats.overallProgress) : 0}%
                        </motion.div>
                        <p className="text-xs text-muted-foreground">
                          Towards all goals
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
                
                <motion.div 
                  className="grid gap-4 md:grid-cols-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div variants={itemVariants}>
                    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all h-full">
                      <CardHeader>
                        <CardTitle>Recent Activities</CardTitle>
                        <CardDescription>Your latest workouts</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {activitiesLoading ? (
                          <div className="flex items-center justify-center h-40">
                            <p>Loading activities...</p>
                          </div>
                        ) : activities.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-40 text-center">
                            <Activity className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">No activities recorded yet</p>
                            <Button 
                              variant="link" 
                              className="mt-2"
                              onClick={() => {
                                setActiveTab("activities");
                                setActivityDialogOpen(true);
                              }}
                            >
                              Log your first activity
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {activities.slice(0, 5).map((activity, index) => (
                              <div key={index} className="flex items-center">
                                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted mr-3">
                                  {getActivityIcon(activity.activityType)}
                                </div>
                                <div className="flex-1 space-y-1">
                                  <p className="text-sm font-medium leading-none">
                                    {activity.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {activity.duration} min • {activity.calories} cal
                                  </p>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(activity.date), 'MMM d')}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="ghost" 
                          className="w-full" 
                          onClick={() => setActiveTab("activities")}
                        >
                          View All Activities
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all h-full">
                      <CardHeader>
                        <CardTitle>Goal Progress</CardTitle>
                        <CardDescription>Track your fitness goals</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {goalsLoading ? (
                          <div className="flex items-center justify-center h-40">
                            <p>Loading goals...</p>
                          </div>
                        ) : goals.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-40 text-center">
                            <Target className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">No goals set yet</p>
                            <Button 
                              variant="link" 
                              className="mt-2"
                              onClick={() => {
                                setActiveTab("goals");
                                setGoalDialogOpen(true);
                              }}
                            >
                              Set your first goal
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {goals.filter(goal => !goal.completed).slice(0, 3).map((goal, index) => (
                              <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium">{goal.name}</p>
                                  <span className="text-xs text-muted-foreground">
                                    {Math.round((goal.progress / goal.target) * 100)}%
                                  </span>
                                </div>
                                <Progress value={(goal.progress / goal.target) * 100} className="h-2" />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>
                                    {goal.progress} / {goal.target} {goal.unit}
                                  </span>
                                  <span>
                                    Due {format(new Date(goal.deadline), 'MMM d, yyyy')}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="ghost" 
                          className="w-full" 
                          onClick={() => setActiveTab("goals")}
                        >
                          View All Goals
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </motion.div>
              </TabsContent>
              
              {/* Activities Tab */}
              <TabsContent value="activities" className="space-y-6">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Your Activities</CardTitle>
                          <CardDescription>View and manage your fitness activities</CardDescription>
                        </div>
                        <Button onClick={() => setActivityDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Log Activity
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {activitiesLoading ? (
                        <div className="flex items-center justify-center h-40">
                          <p>Loading activities...</p>
                        </div>
                      ) : activities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-center">
                          <Activity className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">No activities recorded yet</p>
                          <Button 
                            variant="link" 
                            className="mt-2"
                            onClick={() => setActivityDialogOpen(true)}
                          >
                            Log your first activity
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {activities.map((activity, index) => (
                            <Card key={index} className="overflow-hidden">
                              <div className="flex p-4">
                                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted mr-3">
                                  {getActivityIcon(activity.activityType)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium">{activity.name}</h4>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-8 w-8 text-red-500"
                                      onClick={() => activity._id && deleteActivity(activity._id.toString())}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                    <span>{format(new Date(activity.date), 'MMM d, yyyy')}</span>
                                    <span>•</span>
                                    <span>{activity.duration} minutes</span>
                                    <span>•</span>
                                    <span>{activity.calories} calories</span>
                                  </div>
                                  {activity.notes && (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                      {activity.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
              
              {/* Goals Tab */}
              <TabsContent value="goals" className="space-y-6">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Your Fitness Goals</CardTitle>
                          <CardDescription>Track and manage your goals</CardDescription>
                        </div>
                        <Button onClick={() => setGoalDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Goal
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {goalsLoading ? (
                        <div className="flex items-center justify-center h-40">
                          <p>Loading goals...</p>
                        </div>
                      ) : goals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-center">
                          <Target className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">No goals set yet</p>
                          <Button 
                            variant="link" 
                            className="mt-2"
                            onClick={() => setGoalDialogOpen(true)}
                          >
                            Set your first goal
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <h3 className="text-lg font-medium">Active Goals</h3>
                            <div className="space-y-4">
                              {goals.filter(goal => !goal.completed).map((goal, index) => (
                                <Card key={index} className="overflow-hidden">
                                  <div className="p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-sm font-medium">{goal.name}</h4>
                                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted">
                                        Due {format(new Date(goal.deadline), 'MMM d, yyyy')}
                                      </span>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                          {goal.progress} / {goal.target} {goal.unit}
                                        </span>
                                        <span className="text-xs font-medium">
                                          {Math.round((goal.progress / goal.target) * 100)}%
                                        </span>
                                      </div>
                                      <Progress value={(goal.progress / goal.target) * 100} className="h-2" />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => goal._id && openProgressDialog(goal._id.toString(), goal.progress)}
                                      >
                                        Update Progress
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => goal._id && updateGoalProgress(goal._id.toString(), goal.target, true)}
                                      >
                                        Mark Complete
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                          
                          {goals.some(goal => goal.completed) && (
                            <div className="space-y-2">
                              <h3 className="text-lg font-medium">Completed Goals</h3>
                              <div className="space-y-4">
                                {goals.filter(goal => goal.completed).map((goal, index) => (
                                  <Card key={index} className="overflow-hidden bg-muted/30">
                                    <div className="p-4 space-y-4">
                                      <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium line-through">{goal.name}</h4>
                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                          Completed
                                        </span>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs text-muted-foreground">
                                            {goal.target} {goal.unit}
                                          </span>
                                          <span className="text-xs font-medium">
                                            100%
                                          </span>
                                        </div>
                                        <Progress value={100} className="h-2" />
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>

      {/* Activity Dialog with enhanced animations */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DialogHeader>
              <DialogTitle>Log New Activity</DialogTitle>
              <DialogDescription>
                Record your latest workout or physical activity
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="activity-type">Activity Type</Label>
                <Select 
                  value={activityType} 
                  onValueChange={setActivityType}
                >
                  <SelectTrigger id="activity-type">
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="strength">Strength Training</SelectItem>
                    <SelectItem value="flexibility">Flexibility & Yoga</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="activity-name">Activity Name</Label>
                <Input 
                  id="activity-name" 
                  placeholder="e.g., Running, Weight Lifting, Yoga" 
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="activity-duration">
                  Duration (min): {activityDuration}
                </Label>
                <Slider
                  id="activity-duration"
                  min={5}
                  max={180}
                  step={5}
                  value={[activityDuration]}
                  onValueChange={(values) => setActivityDuration(values[0])}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="activity-notes">Notes (Optional)</Label>
                <Textarea 
                  id="activity-notes" 
                  placeholder="Any additional details about your activity"
                  value={activityNotes}
                  onChange={(e) => setActivityNotes(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setActivityDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddActivity}>
                Log Activity
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Goal Dialog with enhanced animations */}
      <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DialogHeader>
              <DialogTitle>Set New Fitness Goal</DialogTitle>
              <DialogDescription>
                Create a new goal to track your fitness progress
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="goal-name">Goal Name</Label>
                <Input 
                  id="goal-name" 
                  placeholder="e.g., Run 100km, Lose 5kg" 
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="goal-target">Target</Label>
                  <Input 
                    id="goal-target" 
                    type="number" 
                    min={1}
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(Number(e.target.value))}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="goal-unit">Unit</Label>
                  <Select 
                    value={goalUnit} 
                    onValueChange={setGoalUnit}
                  >
                    <SelectTrigger id="goal-unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="km">Kilometers</SelectItem>
                      <SelectItem value="mi">Miles</SelectItem>
                      <SelectItem value="kg">Kilograms</SelectItem>
                      <SelectItem value="lbs">Pounds</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="sessions">Sessions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="goal-deadline">Deadline</Label>
                <Input 
                  id="goal-deadline" 
                  type="date" 
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setGoalDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddGoal}>
                Set Goal
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Progress Update Dialog with enhanced animations */}
      <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
        <DialogContent className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DialogHeader>
              <DialogTitle>Update Goal Progress</DialogTitle>
              <DialogDescription>
                Track your progress towards your fitness goal
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="goal-progress">Current Progress</Label>
                <Input 
                  id="goal-progress" 
                  type="number"
                  min={0}
                  value={goalProgress}
                  onChange={(e) => setGoalProgress(Number(e.target.value))}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setProgressDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProgress}>
                Update Progress
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="w-full border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/30 py-6 mt-8">
        <div className="container max-w-7xl mx-auto flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-semibold">Fitlife</span>
          </div>
          <p className="text-sm text-muted-foreground">Diet Planner and Fitness Tracker</p>
          <p className="text-xs text-muted-foreground mt-2">Created by vu@222311062</p>
        </div>
      </footer>
    </motion.div>
  );
} 