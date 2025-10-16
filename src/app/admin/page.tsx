/* eslint-disable @next/next/no-img-element */
"use client";
import { useHelperContext } from "@/components/providers/helper-provider";
import React from "react";

export default function Page() {
  const { userData, setAlert, backendClient } = useHelperContext()();

  const onLogout = async () => {
    setAlert(
      "ยืนยัน",
      "คุณต้องการออกจากระบบใช่หรือไม่",
      () => {
        backendClient.onLogout();
      },
      true,
    );
  };

  return (
    <div className="px-4 py-6">
      <div className="bg-white py-4 px-8 text-xl rounded-xl shadow-md mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="logo" className="h-10" />
          <div className="flex flex-col">
            <div>ยินตีต้อนรับ {userData.name}</div>
            <div>username: {userData.username}</div>
          </div>
        </div>
        <div
          className="text-sm text-gray-500 underline cursor-pointer"
          onClick={onLogout}
        >
          ออกจากระบบ
        </div>
      </div>
    </div>
  );
}
