/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import React, { useState, useEffect } from "react";

const mockQrCode = {
  image: "/demo/qr-code.png",
};

export default function Page() {
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="px-1 pt-4">
      <div className="bg-white p-8 m-8 mt-0 rounded-2xl flex flex-col justify-center items-center gap-5 shadow-md">
        <div className="flex gap-2">
          <img src="/logo.png" alt="logo-bearhouse" className="w-10 h-10" />
          <div className="text-4xl">ชำระเงิน</div>
        </div>
        <div className="border-2 border-gray-500 p-4 rounded-2xl flex flex-col items-center">
          <div className="text-2xl">ชำระภายใน {formatTime(timeLeft)}</div>
        </div>
        <img src={mockQrCode.image} alt="qr-code" className="h-60" />
        <div className="text-white text-2xl text-center bg-text-primary px-6">
          Invoice#51271 <br />
          ยอดชำระ 490.00 บาท <br />
        </div>
        <div
          className="text-gray-500 text-xl underline"
          onClick={() => {
            window.location.href = "/payment/failed";
          }}
        >
          ยกเลิกรายการ
        </div>
      </div>

      <div className="flex flex-col gap-3 px-10 pb-4">
        <Button
          text="Test Payment Completed"
          onClick={() => {
            window.location.href = "/payment/completed";
          }}
        />
        <Button
          text="Test Payment Failed"
          onClick={() => {
            window.location.href = "/payment/failed";
          }}
        />
      </div>
    </div>
  );
}
