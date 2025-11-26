/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import Select from "@/components/Select";
import DateSelect from "@/components/DateSelect";
import Graph from "@/components/Graph";
import { useEffect, useState } from "react";
import { SellCycle } from "@/types/request";

export default function Page() {
  const [dateCycle, setDateCycle] = useState<Date>();
  const [cycles, setCycles] = useState<SellCycle[]>([]);

  const [summaryOption, setSummaryOption] = useState<"day" | "month">("day");

  const [dateOrder, setDateOrder] = useState<Date>();
  const [statusOrder, setStatusOrder] = useState<
    "draft" | "submit" | "waiting_payment" | "paid" | "cancelled" | "refunded"
  >();

  return (
    <div className="px-4 py-6">
      <div className="text-4xl mb-6">สรุปยอดการขาย</div>

      {/* start cycle */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-2xl mb-3">รอบการขาย</div>
        <DateSelect onChange={setDateCycle} placeholder="เลือกวันที่" />
      </div>
      {cycles.length === 0 && (
        <div className="text-center">ยังไม่มีรอบการขายที่บันทึกไว้</div>
      )}
      {cycles.map((cycle) => {
        return (
          <div
            className="bg-white rounded-md p-3 shadow-md mt-3 flex justify-between"
            key={cycle.refCode}
          >
            <div className="">
              <div className="text-md text-gray-400">Reference Code</div>
              <div className="text-xl flex items-center gap-2">
                <div>{cycle.refCode}</div>
              </div>
            </div>
            <div className="flex flex-col items-end justify-end">
              <div className="text-md text-gray-400">{cycle.time}</div>
              <div className="text-xl">฿{cycle.amount.toLocaleString()}</div>
            </div>
          </div>
        );
      })}
      <Button
        className="mb-6 mt-6"
        text="ปิดรอบการขาย"
        icon={<img src="/icon-bearhouse-1.png" alt="icon" />}
        onClick={() => {}}
      />
      {/* end cycle */}

      {/* start summary */}
      <div className="flex justify-between items-center mb-3 mt-12">
        <div className="text-2xl mb-3">สรุปผล</div>
        <Select
          selections={[
            {
              name: "รายวัน",
              value: "day",
            },
            {
              name: "รายเดือน",
              value: "month",
            },
          ]}
          onChange={(value) =>
            setSummaryOption(value as unknown as "day" | "month")
          }
        />
      </div>
      <div className="h-[300px] max-w-5xl mb-6 bg-white px-5 pr-7 py-6 rounded-md shadow-md">
        <Graph
          labels={[
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
          ]}
          datas={[1300, 2539, 800, 811, 536, 525, 4320]}
          formatPart={(value: number) => [value.toLocaleString("th-TH"), "บาท"]}
        />
      </div>
      <div className="flex justify-between gap-2 mb-6">
        <div className="bg-white w-[50%] rounded-md pt-3 pb-4 px-3 shadow-md">
          <div className="text-md">รายการที่ขายได้ (วัน)</div>
          <div className="text-xl text-green-600">31,130.65</div>
          <div className="flex justify-between text-md">
            <div>รายการ</div>
            <div className="text-green-600">54</div>
          </div>
          <div className="flex items-center justify-end text-green-600 gap-1 text-md leading-2">
            <svg
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 12L8 8L11 11L16 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 6H16V10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>12%</div>
          </div>
        </div>
        <div className="bg-white w-[50%] rounded-md pt-3 pb-4 px-3 shadow-md">
          <div className="text-md">รายการที่ขายได้ (สัปดาห์)</div>
          <div className="text-xl text-rose-600">311,305.23</div>
          <div className="flex justify-between text-md">
            <div>รายการ</div>
            <div className="text-rose-600">5,464</div>
          </div>
          <div className="flex items-center justify-end gap-1 text-rose-600 text-md leading-2">
            <svg
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 8L8 12L11 9L16 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 14H16V10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>6%</div>
          </div>
        </div>
      </div>
      {/* end summary */}

      <div className="flex flex-col justify-start items-start gap-2 mb-2 mt-12">
        <div className="text-2xl">รายการที่ขายได้</div>
        <div className="flex gap-2">
          {/* "draft" | "submit" | "waiting_payment" | "paid" | "cancelled" | "refunded" */}
          <Select
            selections={[
              {
                name: "ทั้งหมด",
                value: "all",
              },
              {
                name: "ฉบับร่าง",
                value: "draft",
              },
              {
                name: "ส่งแล้ว",
                value: "submit",
              },
              {
                name: "รอชำระเงิน",
                value: "waiting_payment",
              },
              {
                name: "ชำระเงินแล้ว",
                value: "paid",
              },
              {
                name: "ยกเลิก",
                value: "cancelled",
              },
              {
                name: "คืนเงิน",
                value: "refunded",
              },
            ]}
            onChange={(value) => setStatusOrder(value.value)}
          />
          <DateSelect onChange={setDateOrder} placeholder="เลือกวันที่" />
        </div>
      </div>
      <div className="bg-white rounded-md p-3 shadow-md mt-3 flex justify-between">
        <div className="">
          <div className="text-md text-gray-400">QRCode</div>
          <div className="text-xl flex items-center gap-2">
            <div className="">BR6100/100004</div>
            <div className="bg-green-500 text-white px-3 h-5 rounded-md text-sm">
              Paid
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end justify-end">
          <div className="text-md text-gray-400">23:23</div>
          <div className="text-xl">฿200.34</div>
        </div>
      </div>
    </div>
  );
}
