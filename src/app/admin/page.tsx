"use client";
import { useHelperContext } from "@/components/providers/helper-provider";
import React from "react";

export default function Page() {
  const { userData } = useHelperContext()();
  return (
    <div className="px-4 py-6">
      <div className="text-4xl mb-4">สวัสดี&apos; {userData.name}</div>
    </div>
  );
}
