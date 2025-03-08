"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, Dumbbell, Salad, BarChart4, Timer, ChevronDown } from "lucide-react";
import { AuthStatus } from "@/components/ui/auth-status";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const features = [
  {
    icon: <BarChart4 className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
    title: "BMI Calculator",
    description: "Interactive BMI calculator with real-time results and health insights.",
    bgLight: "bg-blue-100",
    bgDark: "dark:bg-blue-900"
  },
  {
    icon: <Salad className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
    title: "AI Diet Planner",
    description: "Personalized meal plans based on your BMI and fitness goals.",
    bgLight: "bg-emerald-100",
    bgDark: "dark:bg-emerald-900"
  },
  {
    icon: <Dumbbell className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
    title: "Workout Tracker",
    description: "Log and monitor your exercise routines and progress over time.",
    bgLight: "bg-rose-100",
    bgDark: "dark:bg-rose-900"
  },
  {
    icon: <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
    title: "Progress Analytics",
    description: "Visualize your fitness journey with detailed charts and insights.",
    bgLight: "bg-blue-100",
    bgDark: "dark:bg-blue-900"
  }
];

const navItems = ["Features", "BMI Calculator", "Diet Planner", "Fitness Tracker"];
const footerLinks = ["Terms", "Privacy", "Contact"];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background/95 to-muted/30">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container flex h-16 items-center justify-between">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
              Fitlife
            </span>
          </motion.div>
          <nav className="hidden md:flex items-center gap-6">
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-6"
            >
              {navItems.map((item) => (
                <motion.div
                  key={item}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    href={item === "Features" ? "#features" : `/${item.toLowerCase().replace(" ", "-")}`}
                    className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {item === "Fitness Tracker" && <Timer className="inline h-4 w-4 mr-1" />}
                    {item}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <AuthStatus />
          </div>
        </div>
      </motion.header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 dark:bg-grid-black/10" />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 dark:from-blue-400/10 dark:to-cyan-400/10"
          />
          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <motion.div 
                className="flex flex-col justify-center space-y-4"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="space-y-2">
                  <motion.h1 
                    className="text-4xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Your Complete Fitness Journey Starts Here
                  </motion.h1>
                  <motion.p 
                    className="max-w-[600px] text-muted-foreground md:text-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Track your BMI, get personalized diet plans, and monitor your progress with our all-in-one fitness platform.
                  </motion.p>
                </div>
                <motion.div 
                  className="flex flex-col gap-2 min-[400px]:flex-row"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={fadeInUp}>
                    <Link href="/auth/register">
                      <Button size="lg" className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/20 transition-all duration-300">
                        <span className="relative z-10">Start Your Journey</span>
                        <ArrowRight className="relative z-10 ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-600 opacity-0 transition-opacity group-hover:opacity-100" />
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div variants={fadeInUp}>
                    <Link href="/bmi-calculator">
                      <Button size="lg" variant="outline" className="group hover:border-blue-500 transition-colors">
                        Try BMI Calculator
                        <ChevronDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
              <motion.div 
                className="flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative h-[350px] w-[350px] sm:h-[450px] sm:w-[450px]">
                  <Image
                    src="/fitness-hero.svg"
                    alt="Fitness Illustration"
                    fill
                    className="object-contain drop-shadow-xl"
                    priority
                  />
                </div>
              </motion.div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          >
            <Link href="#features">
              <Button variant="ghost" size="icon" className="rounded-full animate-bounce">
                <ChevronDown className="h-6 w-6" />
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-muted/50 to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 dark:bg-grid-black/10" />
          <div className="container px-4 md:px-6 relative">
            <motion.div 
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
                  Powerful Features for Your Fitness Goals
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to track, plan, and achieve your fitness goals in one place.
                </p>
              </div>
            </motion.div>
            <motion.div 
              className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  className="group relative overflow-hidden rounded-lg border bg-background/50 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative space-y-2">
                    <div className={`rounded-full ${feature.bgLight} ${feature.bgDark} w-12 h-12 flex items-center justify-center`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.2 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 dark:from-blue-400/10 dark:to-cyan-400/10"
          />
          <div className="container px-4 md:px-6 relative">
            <motion.div 
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
                  Ready to Transform Your Fitness Journey?
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Join thousands of users who have already improved their health with Fitlife.
                </p>
              </div>
              <motion.div 
                className="flex flex-col gap-2 min-[400px]:flex-row"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div variants={fadeInUp}>
                  <Link href="/auth/register">
                    <Button size="lg" className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/20">
                      Create Free Account
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-600 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Button>
                  </Link>
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <Link href="/auth/login">
                    <Button size="lg" variant="outline" className="group hover:border-blue-500 transition-colors">
                      Sign In
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t py-6 md:py-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <motion.p 
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            &copy; {new Date().getFullYear()} Fitlife. All rights reserved.
            <span className="ml-2">Created by vu@222311062</span>
          </motion.p>
          <motion.div 
            className="flex items-center gap-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {footerLinks.map((item) => (
              <motion.div key={item} variants={fadeInUp}>
                <Link 
                  href={`/${item.toLowerCase()}`} 
                  className="text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {item}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
