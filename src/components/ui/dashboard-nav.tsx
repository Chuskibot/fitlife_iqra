"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { LayoutDashboard, Activity, Salad, LogOut, Timer } from "lucide-react";
import { signOut } from "next-auth/react";

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function DashboardNav() {
  const pathname = usePathname();

  const NavItem = ({ href, children, icon }: NavItemProps) => {
    const isActive = pathname === href;

    return (
      <Link href={href}>
        <Button
          variant={isActive ? "default" : "ghost"}
          className={cn(
            "w-full justify-start gap-2 transition-all duration-300",
            isActive 
              ? "bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-400/20 border-none" 
              : "hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400"
          )}
        >
          {icon && <span className={cn(
            "transition-transform duration-300",
            isActive ? "scale-110" : "scale-100"
          )}>{icon}</span>}
          {children}
        </Button>
      </Link>
    );
  };

  return (
    <div className="grid gap-2">
      <NavItem href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>
        Dashboard
      </NavItem>
      <NavItem href="/bmi-calculator" icon={<Activity className="h-4 w-4" />}>
        BMI Calculator
      </NavItem>
      <NavItem href="/diet-planner" icon={<Salad className="h-4 w-4" />}>
        Diet Planner
      </NavItem>
      <NavItem href="/fitness-tracker" icon={<Timer className="h-4 w-4" />}>
        Fitness Tracker
      </NavItem>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-300"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
} 