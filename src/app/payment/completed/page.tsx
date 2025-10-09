/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import { IconCircleCheckFilled } from "@tabler/icons-react";
import React from "react";

const mockReceipt = {
  id: "rec51271",
  invocieId: "inv51271",
  transactionId: "7528550913849131",
  paidTime: "2025-10-12 12:34:23",
  items: [
    {
      name: "บัตร Bearhouse สีแดง",
      unit: "ใบ",
      image: "/demo/product-1.jpeg",
      price: 490,
      qty: 2,
      total: 490 * 2,
    },
  ],
  status: "paid",
  total: 490 * 2,
};

export default function Page() {
  return (
    <div className="px-1 pt-4">
      <div className="bg-white p-8 m-8 mt-0 rounded-2xl flex flex-col justify-center items-center gap-5 shadow-md">
        <IconCircleCheckFilled size={100} className="text-green-500" />
        <div className="text-4xl">การชำระเงินสำเร็จ</div>
        <div className="w-full">
          <div className="text-white text-2xl text-center bg-text-primary px-6">
            Receipt#{mockReceipt.id}
          </div>
        </div>
        <div className="w-full text-xl text-gray-500">
          <div>
            <span className="mt-4 text-text-primary">Invoice</span>{" "}
            {mockReceipt.invocieId}
          </div>

          <div>
            <span className="mt-4 text-text-primary">Transaction</span>{" "}
            {mockReceipt.transactionId}
          </div>

          <div>
            <span className="mt-4 text-text-primary">เวลา</span>{" "}
            {mockReceipt.paidTime}
          </div>

          <div className="mt-4 text-text-primary">รายการ</div>

          {mockReceipt.items.map((item, index) => (
            <div className="w-full flex gap-3 justify-between" key={item.name}>
              <div>
                {index + 1}. {item.name}
              </div>
              <div className="text-xl truncate">
                {item.price.toLocaleString()}-. x {item.qty}
              </div>
            </div>
          ))}

          <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

          <div className="flex justify-between">
            <span className="text-text-primary">รวมทั้งสิ้น</span>{" "}
            {mockReceipt.total.toLocaleString()} บาท
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white px-4 pt-9 pb-6 shadow-md rounded-t-3xl select-none w-[100vw] md:w-[600px]">
        <Button
          className="w-full"
          onClick={() => {
            window.location.href = "/main";
          }}
          text="กลับหน้าหลัก"
          icon={<img src="/icon-bearhouse-2.png" alt="icon" />}
        />
      </div>
    </div>
  );
}
