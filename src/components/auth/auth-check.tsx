import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface AuthCheckProps {
  children: React.ReactNode;
}

export async function AuthCheck({ children }: AuthCheckProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return <>{children}</>;
}

interface GuestCheckProps {
  children: React.ReactNode;
}

export async function GuestCheck({ children }: GuestCheckProps) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return <>{children}</>;
} 