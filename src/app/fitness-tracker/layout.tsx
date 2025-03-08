import { AuthCheck } from "@/components/auth/auth-check";

export default function FitnessTrackerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthCheck>{children}</AuthCheck>;
} 