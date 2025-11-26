/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import Select from "@/components/Select";
import DateSelect from "@/components/DateSelect";
import Graph from "@/components/Graph";
import { useCallback, useState } from "react";
import { SaleOrder, SellCycle, isErrorResponse } from "@/types/request";
import Input from "@/components/Input";
import { IconSearch } from "@tabler/icons-react";
import { useHelperContext } from "@/components/providers/helper-provider";
import Link from "next/link";

export default function Page() {
  const { backendClient, setFullLoading } = useHelperContext()();
  const [cycles] = useState<SellCycle[]>([]);

  const [, setDateCycle] = useState<Date>();
  const [, setSummaryOption] = useState<"day" | "month">("day");
  const [dateOrder, setDateOrder] = useState<Date>();
  const [queryOrder, setQueryOrder] = useState<string>("");
  const [statusOrder, setStatusOrder] = useState<
    | "all"
    | "draft"
    | "submit"
    | "waiting_payment"
    | "paid"
    | "cancelled"
    | "refunded"
  >("all");
  const [saleOrders, setSaleOrders] = useState<SaleOrder[]>([]);
  const [nextCursor, setNextCursor] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const formatDateQuery = (date?: Date) => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const fetchSaleOrders = useCallback(
    async ({
      append = false,
      cursor = "",
      status,
      query,
      date,
    }: {
      append?: boolean;
      cursor?: string;
      status?: typeof statusOrder;
      query?: string;
      date?: Date;
    } = {}) => {
      const resolvedStatus = status ?? statusOrder;
      const resolvedQuery = query ?? queryOrder;
      const resolvedDate = date ?? dateOrder;
      const resolvedCursor = append ? nextCursor : cursor;

      if (append) {
        setIsLoadingMore(true);
      } else {
        setFullLoading(true);
      }

      const response = await backendClient.listSaleOrder(
        10,
        resolvedCursor,
        resolvedQuery,
        formatDateQuery(resolvedDate),
        resolvedStatus === "all" ? "" : resolvedStatus,
      );

      if (append) {
        setIsLoadingMore(false);
      } else {
        setFullLoading(false);
      }

      if (isErrorResponse(response)) {
        if (!append) {
          setSaleOrders([]);
          setNextCursor("");
        }
        return;
      }

      if (append) {
        setSaleOrders((prev) => [...prev, ...response.data]);
      } else {
        setSaleOrders(response.data);
      }
      setNextCursor(response.next_cursor);
    },
    [
      backendClient,
      dateOrder,
      nextCursor,
      queryOrder,
      setFullLoading,
      statusOrder,
    ],
  );

  const handleSearchOrders = () => {
    void fetchSaleOrders({ append: false, cursor: "", query: queryOrder });
  };

  const handleStatusChange = (
    value:
      | "all"
      | "draft"
      | "submit"
      | "waiting_payment"
      | "paid"
      | "cancelled"
      | "refunded",
  ) => {
    if (value === statusOrder) return;
    setStatusOrder(value);
    void fetchSaleOrders({ append: false, cursor: "", status: value });
  };

  const handleDateChange = (date: Date) => {
    setDateOrder(date);
    void fetchSaleOrders({ append: false, cursor: "", date });
  };

  const handleLoadMore = () => {
    if (!nextCursor) return;
    void fetchSaleOrders({ append: true });
  };

  const statusDisplay: Record<
    Exclude<typeof statusOrder, "all">,
    { label: string; className: string }
  > = {
    draft: { label: "ฉบับร่าง", className: "bg-gray-300 text-gray-800" },
    submit: { label: "ส่งแล้ว", className: "bg-blue-200 text-blue-800" },
    waiting_payment: {
      label: "รอชำระเงิน",
      className: "bg-amber-200 text-amber-800",
    },
    paid: { label: "ชำระเงินแล้ว", className: "bg-green-500 text-white" },
    cancelled: { label: "ยกเลิก", className: "bg-rose-200 text-rose-800" },
    refunded: { label: "คืนเงิน", className: "bg-sky-200 text-sky-800" },
  };

  const formatTime = (value: string) => {
    const date = new Date(value);
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        <div className="flex w-full gap-2">
          <Input
            className="w-full flex-1"
            type="text"
            placeholder="ค้นหาจากเลขใบเสร็จ"
            onChange={setQueryOrder}
            value={queryOrder}
          />
          <Button
            text={<IconSearch />}
            className="px-2"
            onClick={handleSearchOrders}
          />
        </div>

        <div className="flex gap-2">
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
            onChange={(value) =>
              handleStatusChange(
                value.value as
                  | "all"
                  | "draft"
                  | "submit"
                  | "waiting_payment"
                  | "paid"
                  | "cancelled"
                  | "refunded",
              )
            }
          />
          <DateSelect
            value={dateOrder}
            onChange={handleDateChange}
            placeholder="เลือกวันที่"
          />
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-3">
        {saleOrders.length === 0 ? (
          <div className="text-center text-gray-500">
            ยังไม่มีรายการขายในช่วงเวลานี้
          </div>
        ) : (
          saleOrders.map((order) => (
            <Link
              href={`/public/order/${order.id}`}
              target="_blank"
              className="bg-white rounded-md p-3 shadow-md flex justify-between cursor-pointer"
              key={order.id}
            >
              <div>
                <div className="text-md text-gray-400">
                  {order.payment_type.split("_").join(" ")}
                </div>
                <div className="text-xl flex items-center gap-2">
                  <div className="">{order.number}</div>
                  {order.status !== "draft" && (
                    <div
                      className={`px-3 h-5 rounded-md text-sm flex items-center ${
                        statusDisplay[order.status].className
                      }`}
                    >
                      {statusDisplay[order.status].label}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end justify-end">
                <div className="text-md text-gray-400">
                  {formatTime(order.created_at)}
                </div>
                <div className="text-xl">
                  ฿
                  {order.total_amount.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
      {nextCursor && saleOrders.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button
            text={isLoadingMore ? "กำลังโหลด..." : "โหลดเพิ่มเติม"}
            className="w-fit px-6"
            onClick={handleLoadMore}
          />
        </div>
      )}
    </div>
  );
}
