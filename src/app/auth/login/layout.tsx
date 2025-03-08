import { GuestCheck } from "@/components/auth/auth-check";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Fitlife",
  description: "Sign in to your Fitlife account",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GuestCheck>{children}</GuestCheck>;
} 