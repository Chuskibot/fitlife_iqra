import { GuestCheck } from "@/components/auth/auth-check";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account - Fitlife",
  description: "Create a new Fitlife account",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GuestCheck>{children}</GuestCheck>;
} 