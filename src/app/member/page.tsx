/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { IconPhoneFilled, IconMailFilled } from "@tabler/icons-react";
import React, { useState } from "react";

export default function Page() {
  const [requestTaxInvoice, setRequestTaxInvoice] = useState(false);

  return (
    <div className="px-4 py-6">
      <div className="text-4xl mb-4">ข้อมูลลูกค้า</div>
      <div className="bg-white px-4 py-5 rounded-2xl shadow-md">
        <div className="flex flex-col gap-2">
          <div className="text-2xl">สมาชิก Bearhouse</div>
          <Input
            icon={<IconPhoneFilled />}
            type="text"
            inputMode="numeric"
            placeholder="เบอร์สมาชิก Bearhouse"
          />
        </div>
      </div>

      <div className="bg-white px-4 py-5 mt-4 rounded-2xl shadow-md">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="requestTaxInvoice"
              name="taxInvoice"
              checked={requestTaxInvoice}
              onChange={(e) => setRequestTaxInvoice(e.target.checked)}
              className="w-5 h-5 text-text-primary border-2"
            />
            <label
              htmlFor="requestTaxInvoice"
              className="text-lg cursor-pointer"
            >
              ขอใบเสร็จรับเงิน
            </label>
          </div>

          {requestTaxInvoice && (
            <div className="flex flex-col gap-3">
              <div className="text-xl">อีเมล*</div>
              <Input
                type="email"
                inputMode="email"
                icon={<IconMailFilled />}
                placeholder="อีเมล"
              />
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white px-4 pt-9 pb-6 shadow-md rounded-t-3xl select-none w-[100vw] md:w-[600px]">
        <Button
          className="w-full"
          onClick={() => {
            window.location.href = "/payment/select";
          }}
          text="ยืนยันคำสั่งซื้อ"
          icon={<img src="/icon-bearhouse-1.png" alt="icon" />}
        />
      </div>
    </div>
  );
}
