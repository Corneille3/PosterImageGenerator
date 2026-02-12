"use client"; // Client-only to use useSession

import RecentShowcase from "./RecentShowcase";
import { useSession } from "next-auth/react";

export default function RecentShowcaseWrapper() {
  const { data: session } = useSession();
  const isAuthenticated = !!session;

  if (!isAuthenticated) return null;

  return <RecentShowcase />;
}
