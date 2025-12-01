"use client";
/* eslint-disable @next/next/no-img-element */
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useHelperContext } from "@/components/providers/helper-provider";
import { isErrorResponse } from "@/types/request";
import { IconUserFilled, IconLockFilled } from "@tabler/icons-react";
import { useState } from "react";

export default function Page() {
  const { setFullLoading, backendClient } = useHelperContext()();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = async () => {
    if (username === "" || password === "") {
      return;
    }
    setFullLoading(true);
    const response = await backendClient.login({
      username,
      password,
    });
    setFullLoading(false);
    if (isErrorResponse(response)) {
      return;
    }
    window.location.reload();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onLogin();
    }
  };

  return (
    <div className="px-10 pt-20" onKeyDown={handleKeyDown}>
      <div className="bg-white rounded-md p-6 shadow-md pb-10">
        <div className="flex justify-center mb-10 mt-8">
          <img src="/logo.png" alt="logo" className="h-20 w-20" />
        </div>
        <div className="text-4xl mb-6 text-center">เข้าสู่ระบบ</div>
        <Input
          value={username}
          onChange={setUsername}
          placeholder="ชื่อผู้ใช้งาน"
          type="text"
          icon={<IconUserFilled />}
        />
        <Input
          value={password}
          onChange={setPassword}
          className="mt-8"
          placeholder="รหัสผ่าน"
          type="password"
          icon={<IconLockFilled />}
        />
        <Button
          className="mt-10"
          text="เข้าสู่ระบบ"
          disabled={username === "" || password === ""}
          onClick={onLogin}
          icon={<img src="/icon-bearhouse-1.png" alt="icon" />}
        />
      </div>
    </div>
  );
}
