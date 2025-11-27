/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import Select from "@/components/Select";
import DateSelect from "@/components/DateSelect";
import Graph from "@/components/Graph";
import { useCallback, useState, useEffect } from "react";
import {
  SaleOrder,
  SaleCycle,
  isErrorResponse,
  SaleOrderWithOrderLine,
} from "@/types/request";
import Input from "@/components/Input";
import {
  IconSearch,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { useHelperContext } from "@/components/providers/helper-provider";
import Link from "next/link";

type StatusOrder =
  | "draft"
  | "submit"
  | "waiting_payment"
  | "paid"
  | "cancelled"
  | "refunded";

const statusDisplay: Record<StatusOrder, { label: string; className: string }> =
  {
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

const formatDateQuery = (date?: Date) => {
  if (!date) return "";
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

export default function Page() {
  const { backendClient, setFullLoading } = useHelperContext()();
  const [cycles] = useState<SaleCycle[]>([]);

  const [dateCycle, setDateCycle] = useState<Date>();
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
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [orderDetails, setOrderDetails] = useState<
    Record<string, SaleOrderWithOrderLine>
  >({});

  const getLast7Days = () => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  };

  const [startDateSummary, setStartDateSummary] = useState<Date>(
    () => getLast7Days().start,
  );
  const [endDateSummary, setEndDateSummary] = useState<Date>(
    () => getLast7Days().end,
  );
  const [graphLabels, setGraphLabels] = useState<string[]>([]);
  const [graphDatas, setGraphDatas] = useState<number[]>([]);

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

  const handleDateChange = (date: Date | { start: Date; end: Date }) => {
    const selectedDate = date instanceof Date ? date : date.start;
    setDateOrder(selectedDate);
    void fetchSaleOrders({ append: false, cursor: "", date: selectedDate });
  };

  const handleDateCycleChange = (date: Date | { start: Date; end: Date }) => {
    const selectedDate = date instanceof Date ? date : date.start;
    setDateCycle(selectedDate);
  };

  const fetchSummary = useCallback(async () => {
    if (!startDateSummary || !endDateSummary) return;

    setFullLoading(true);
    const response = await backendClient.summarySale(
      formatDateQuery(startDateSummary),
      formatDateQuery(endDateSummary),
    );
    setFullLoading(false);

    if (isErrorResponse(response)) {
      setGraphLabels([]);
      setGraphDatas([]);
      return;
    }

    const labels = response.result.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "short",
      });
    });
    const datas = response.result.map((item) => item.amount_sale);

    setGraphLabels(labels);
    setGraphDatas(datas);
  }, [startDateSummary, endDateSummary]);

  const handleDateSummaryChange = (date: Date | { start: Date; end: Date }) => {
    if (date instanceof Date) {
      // Single date - use it as both start and end
      setStartDateSummary(date);
      setEndDateSummary(date);
    } else {
      // Range
      setStartDateSummary(date.start);
      setEndDateSummary(date.end);
    }
  };

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  const handleLoadMore = () => {
    if (!nextCursor) return;
    void fetchSaleOrders({ append: true });
  };

  const toggleOrderExpansion = async (orderId: string) => {
    const isExpanded = expandedOrders.has(orderId);
    const newExpanded = new Set(expandedOrders);

    if (isExpanded) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
      // Fetch order details if not already loaded
      if (!orderDetails[orderId]) {
        setFullLoading(true);
        const response = await backendClient.getSaleOrderById(orderId);
        setFullLoading(false);
        if (!isErrorResponse(response)) {
          setOrderDetails((prev) => ({ ...prev, [orderId]: response }));
        }
      }
    }

    setExpandedOrders(newExpanded);
  };

  const onCloseSaleCycle = () => {
    window.location.href = `/main/sale-cycle/${formatDateQuery(dateCycle)}`;
  };

  return (
    <div className="px-4 py-6">
      <div className="text-4xl mb-6">สรุปยอดขาย</div>

      {/* start summary */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-2xl mb-3">สรุปผล</div>
        <DateSelect
          range={true}
          value={
            startDateSummary && endDateSummary
              ? { start: startDateSummary, end: endDateSummary }
              : undefined
          }
          onChange={(date) => handleDateSummaryChange(date)}
          placeholder="เลือกวันที่"
        />
      </div>
      <div className="h-[300px] max-w-5xl mb-6 bg-white px-5 pr-7 py-6 rounded-md shadow-md">
        <Graph
          labels={graphLabels.length > 0 ? graphLabels : ["ไม่มีข้อมูล"]}
          datas={graphDatas.length > 0 ? graphDatas : [0]}
          formatPart={(value: number) => [value.toLocaleString("th-TH")]}
        />
      </div>
      <div className="flex justify-between gap-2 mb-6">
        <div className="bg-white w-[50%] rounded-md pt-3 pb-4 px-3 shadow-md">
          <div className="text-md">รายการที่ขายได้</div>
          <div className="text-xl text-green-600">
            {graphDatas.reduce((sum, n) => sum + n, 0).toLocaleString()} บาท
          </div>
        </div>
        <div className="bg-white w-[50%] rounded-md pt-3 pb-4 px-3 shadow-md">
          <div className="text-md">เฉลี่ยต่อวัน</div>
          <div className="text-xl text-rose-600">
            {(
              graphDatas.reduce((sum, n) => sum + n, 0) / graphDatas.length
            ).toLocaleString()}{" "}
            บาท
          </div>
        </div>
      </div>
      {/* end summary */}

      {/* start cycle */}
      <div className="flex justify-between items-center mb-3 mt-12">
        <div className="text-2xl mb-3">รอบการขาย</div>
        <DateSelect
          onChange={handleDateCycleChange}
          placeholder="เลือกวันที่"
        />
      </div>
      {cycles.length === 0 && (
        <div className="text-center">ยังไม่มีรอบการขายที่บันทึกไว้</div>
      )}
      {cycles.map((cycle) => {
        return (
          <div
            className="bg-white rounded-md p-3 shadow-md mt-3 flex justify-between"
            key={cycle.ref_code}
          >
            <div className="">
              <div className="text-md text-gray-400">Reference Code</div>
              <div className="text-xl flex items-center gap-2">
                <div>{cycle.ref_code}</div>
              </div>
            </div>
            <div className="flex flex-col items-end justify-end">
              <div className="text-md text-gray-400">{cycle.created_at}</div>
              <div className="text-xl">
                ฿{cycle.total_amount.toLocaleString()}
              </div>
            </div>
          </div>
        );
      })}
      <Button
        className="mb-6 mt-6"
        text="ปิดรอบการขาย"
        icon={<img src="/icon-bearhouse-1.png" alt="icon" />}
        onClick={onCloseSaleCycle}
      />
      {/* end cycle */}

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
          saleOrders.map((order) => {
            const isExpanded = expandedOrders.has(order.id);
            const details = orderDetails[order.id];

            return (
              <div
                key={order.id}
                className="bg-white rounded-md p-3 shadow-md transition-all duration-300 hover:shadow-lg"
              >
                <div
                  className="flex justify-between cursor-pointer"
                  onClick={() => toggleOrderExpansion(order.id)}
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
                  <div className="flex items-center gap-3">
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
                    {isExpanded ? (
                      <IconChevronUp className="text-gray-400 transition-transform duration-300 rotate-180" />
                    ) : (
                      <IconChevronDown className="text-gray-400 transition-transform duration-300" />
                    )}
                  </div>
                </div>
                {isExpanded && details && (
                  <div className="mt-4 pt-4 border-t border-gray-200 overflow-hidden">
                    <div className="space-y-3 text-base">
                      {details.sale_order.customer_phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">เบอร์สมาชิก:</span>
                          <span className="">
                            {details.sale_order.customer_phone}
                          </span>
                        </div>
                      )}
                      {details.sale_order.customer_email && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">อีเมล:</span>
                          <span className="">
                            {details.sale_order.customer_email}
                          </span>
                        </div>
                      )}
                      {details.sale_order.transaction_ref && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">
                            Transaction Ref:
                          </span>
                          <span className="">
                            {details.sale_order.transaction_ref}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">วันที่สร้าง:</span>
                        <span className="">
                          {new Date(
                            details.sale_order.created_at,
                          ).toLocaleString("th-TH")}
                        </span>
                      </div>
                      {details.sale_order_line &&
                        details.sale_order_line.length > 0 && (
                          <div className="mt-4">
                            <div className="text-gray-500 mb-3  text-lg">
                              รายการสินค้า:
                            </div>
                            <div className="space-y-2">
                              {details.sale_order_line.map((line, index) => (
                                <div
                                  key={line.id}
                                  className="flex justify-between bg-gray-50 p-3 rounded-lg"
                                >
                                  <div className="text-base">
                                    {index + 1}. {line.product_name}
                                  </div>
                                  <div className=" text-base">
                                    ฿{line.unit_price.toLocaleString()} x{" "}
                                    {line.quantity} = ฿
                                    {line.total_price.toLocaleString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Link
                        href={`/public/order/${order.id}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ดูใบเสร็จรับเงิน →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })
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
