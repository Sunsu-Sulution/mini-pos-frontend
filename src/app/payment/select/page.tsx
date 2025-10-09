/* eslint-disable @next/next/no-img-element */

"use client";
import Button from "@/components/Button";
import { IconCreditCardFilled, IconCheck } from "@tabler/icons-react";
import React, { useState } from "react";

export default function Page() {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const paymentMethods = [
    {
      id: "thai-qr",
      name: "Thai QR Payment",
      icon: (
        <img
          src="/thai-qr-icon.png"
          alt="thai-qr-icon"
          className="w-17 h-17 rounded-xl"
        />
      ),
    },
    {
      id: "credit-card",
      name: "Credit Card QR",
      icon: (
        <div className="w-17 h-17 flex justify-center items-center">
          <IconCreditCardFilled className="w-17 h-17" />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="px-4 py-6">
        <div className="text-4xl mb-4">เลือกวิธีการชำระเงิน</div>
        <div className="flex flex-col gap-5">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`bg-white rounded-2xl p-3 flex items-center gap-5 cursor-pointer transition-all duration-200 ${
                selectedPayment === method.id
                  ? "ring-2 ring-text-primary bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedPayment(method.id)}
            >
              {method.icon}
              <div className="text-2xl flex-1">{method.name}</div>
              {selectedPayment === method.id && (
                <div className="w-5 h-5 bg-text-primary rounded-full flex items-center justify-center">
                  <IconCheck className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white px-4 pt-9 pb-6 shadow-md rounded-t-3xl select-none w-[100vw] md:w-[600px]">
        <Button
          className="w-full"
          onClick={() => {
            window.location.href = "/payment/pay";
          }}
          disabled={selectedPayment == null}
          text="ยืนยันคำสั่งซื้อ"
          icon={<img src="/icon-bearhouse-1.png" alt="icon" />}
        />
      </div>
    </>
  );
}
