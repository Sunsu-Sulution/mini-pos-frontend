"use client";
/* eslint-disable @next/next/no-img-element */
import Button from "@/components/Button";
import Input from "@/components/Input";
import { IconUserFilled, IconLockFilled } from "@tabler/icons-react";

export default function Page() {
  return (
    <div className="px-10 pt-20">
      <div className="flex justify-center mb-12">
        <img src="/logo.png" alt="logo" className="h-30 w-30" />
      </div>
      <div className="text-4xl mb-6">เข้าสู่ระบบ</div>
      <Input
        placeholder="ชื่อผู้ใช้งาน"
        type="text"
        icon={<IconUserFilled />}
      />
      <Input
        className="mt-8"
        placeholder="รหัสผ่าน"
        type="password"
        icon={<IconLockFilled />}
      />
      <Button
        className="mt-10"
        text="เข้าสู่ระบบ"
        onClick={() => {
          window.location.href = "/main";
        }}
        icon={<img src="/icon-bearhouse-1.png" alt="icon" />}
      />
    </div>
  );
}
