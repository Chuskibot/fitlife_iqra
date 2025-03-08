import { AuthCheck } from "@/components/auth/auth-check";
import DashboardLayout from "../dashboard/layout";

export default function BMICalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthCheck>{children}</AuthCheck>;
} 