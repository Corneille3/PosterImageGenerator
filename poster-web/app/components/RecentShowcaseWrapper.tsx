// components/RecentShowcaseWrapper.tsx
"use client";
import RecentShowcase from "./RecentShowcase";
import { useSession } from "next-auth/react";

export default function RecentShowcaseWrapper() {
  const { data: session } = useSession();
  if (!session) return null;
  return <RecentShowcase />;
}
