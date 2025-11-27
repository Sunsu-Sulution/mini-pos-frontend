/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import Select from "@/components/Select";
import DateSelect from "@/components/DateSelect";
import Graph from "@/components/Graph";
import { useCallback, useState, useEffect, ReactNode } from "react";
import {
  SaleOrder,
  SaleCycle,
  isErrorResponse,
  SaleOrderWithOrderLine,
} from "@/types/request";
import Input from "@/components/Input";
import { IconSearch } from "@tabler/icons-react";
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
  return date.toLocaleDateString("th-TH", {
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

type SectionProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

const Section = ({ title, subtitle, actions, children }: SectionProps) => {
  return (
    <section className="bg-white rounded-xl shadow-md px-5 py-4 space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
        <div>
          <p className="text-sm  uppercase tracking-wide text-gray-400">
            {title}
          </p>
          {subtitle && <p className="text-xl text-gray-900">{subtitle}</p>}
        </div>
        {actions && <div className="w-full md:w-auto">{actions}</div>}
      </div>
      <div>{children}</div>
    </section>
  );
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
    window.location.href = `/main/sale-cycle/generate`;
  };

  return (
    <div className="px-4 py-6 space-y-10">
      <div className="mb-4">
        <h1 className="text-4xl">สรุปยอดขาย</h1>
      </div>

      {/* Sales Section */}
      <Section
        title="ยอดการขาย"
        subtitle="ตรวจสอบรอบการขายและยอดในแต่ละรอบ"
        actions={
          <DateSelect
            onChange={handleDateCycleChange}
            placeholder="เลือกวันที่"
          />
        }
      >
        <div className="space-y-4">
          {cycles.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 py-8 text-center text-gray-500">
              ยังไม่มีรอบการขายที่บันทึกไว้
            </div>
          )}
          {cycles.map((cycle) => (
            <div
              key={cycle.ref_code}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-slate-50 px-5 py-4"
            >
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-400">
                  Reference Code
                </p>
                <p className="text-2xl  text-gray-900">{cycle.ref_code}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{cycle.created_at}</p>
                <p className="text-2xl  text-gray-900">
                  ฿{cycle.total_amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          <Button
            className="w-full justify-center"
            text="ปิดรอบการขาย"
            icon={<img src="/icon-bearhouse-1.png" alt="icon" />}
            onClick={onCloseSaleCycle}
          />
        </div>
      </Section>

      {/* Summary Section */}
      <Section
        title="สรุปผล"
        subtitle="ดูภาพรวมยอดขายตามช่วงวันที่ที่เลือก"
        actions={
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
        }
      >
        <div className="flex gap-6 flex-col">
          <div className="flex gap-4">
            <div className="rounded-lg border border-gray-100 bg-white px-4 py-5 text-center w-full">
              <p className="text-sm text-gray-500">ยอดขายรวม</p>
              <p className="text-3xl  text-green-600">
                {graphDatas.reduce((sum, n) => sum + n, 0).toLocaleString()} บาท
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-white px-4 py-5 text-center w-full">
              <p className="text-sm text-gray-500">เฉลี่ยต่อวัน</p>
              <p className="text-3xl  text-rose-600">
                {graphDatas.length
                  ? (
                      graphDatas.reduce((sum, n) => sum + n, 0) /
                      graphDatas.length
                    ).toLocaleString()
                  : 0}{" "}
                บาท
              </p>
            </div>
          </div>
          <div className="min-h-[360px] flex-1 rounded-lg border border-gray-100 bg-gradient-to-br from-white to-slate-50 px-4 py-3">
            <Graph
              labels={graphLabels.length > 0 ? graphLabels : ["ไม่มีข้อมูล"]}
              datas={graphDatas.length > 0 ? graphDatas : [0]}
              formatPart={(value: number) => [value.toLocaleString("th-TH")]}
            />
          </div>
        </div>
      </Section>

      {/* Orders Section */}
      <Section
        title="รายการที่ขายได้"
        subtitle="ค้นหาและจัดการใบเสร็จทั้งหมด"
        actions={
          <div className="flex flex-col gap-3 md:flex-row">
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
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex w-full flex-col gap-3 md:flex-row">
            <Input
              className="flex-1"
              type="text"
              placeholder="ค้นหาจากเลขใบเสร็จ"
              onChange={setQueryOrder}
              value={queryOrder}
            />
            <Button
              text={<IconSearch />}
              className="px-6"
              onClick={handleSearchOrders}
            />
          </div>

          <div className="mt-3 flex flex-col gap-3">
            {saleOrders.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 py-10 text-center text-gray-500">
                ยังไม่มีรายการขายในช่วงเวลานี้
              </div>
            ) : (
              saleOrders.map((order) => {
                const isExpanded = expandedOrders.has(order.id);
                const details = orderDetails[order.id];

                return (
                  <div
                    key={order.id}
                    className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300"
                  >
                    <div
                      className="flex cursor-pointer items-center justify-between"
                      onClick={() => toggleOrderExpansion(order.id)}
                    >
                      <div>
                        <p className="text-sm uppercase tracking-wide text-gray-400">
                          {order.payment_type.split("_").join(" ")}{" "}
                        </p>
                        <div className="flex items-center gap-2 text-xl ">
                          <span>{order.number}</span>
                          {order.status !== "draft" && (
                            <span
                              className={`px-3 h-5 rounded-md text-sm flex items-center ${
                                statusDisplay[order.status].className
                              }`}
                            >
                              {statusDisplay[order.status].label}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {formatTime(order.created_at)}
                          </p>
                          <p className="text-2xl  text-gray-900">
                            ฿
                            {order.total_amount.toLocaleString("th-TH", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {order.sale_cycle_id && (
                        <>บันทึกยอดขายแล้ว ({order.sale_cycle_id})</>
                      )}
                    </div>
                    {isExpanded && details && (
                      <div className="mt-4 pt-4 text-base">
                        <div className="space-y-3">
                          {details.sale_order.customer_phone && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                เบอร์สมาชิก:
                              </span>
                              <span>{details.sale_order.customer_phone}</span>
                            </div>
                          )}
                          {details.sale_order.customer_email && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">อีเมล:</span>
                              <span>{details.sale_order.customer_email}</span>
                            </div>
                          )}
                          {details.sale_order.transaction_ref && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                Transaction Ref:
                              </span>
                              <span>{details.sale_order.transaction_ref}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-500">วันที่สร้าง:</span>
                            <span>
                              {new Date(
                                details.sale_order.created_at,
                              ).toLocaleString("th-TH")}
                            </span>
                          </div>
                        </div>
                        {details.sale_order_line &&
                          details.sale_order_line.length > 0 && (
                            <div className="mt-5 rounded-lg border border-gray-100 bg-gray-100 px-4 py-4">
                              <p className="mb-3 text-lg font-medium text-gray-700">
                                รายการสินค้า
                              </p>
                              <div className="space-y-2">
                                {details.sale_order_line.map((line, index) => (
                                  <div
                                    key={line.id}
                                    className="flex flex-wrap justify-between gap-2 rounded-md bg-white px-3 py-2 text-base"
                                  >
                                    <span>
                                      {index + 1}. {line.product_name}
                                    </span>
                                    <span>
                                      ฿{line.unit_price.toLocaleString()} x{" "}
                                      {line.quantity} = ฿
                                      {line.total_price.toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        <div className="mt-4 border-t border-gray-200 pt-4">
                          <Link
                            href={`/public/order/${order.id}`}
                            target="_blank"
                            className="text-blue-600"
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
            <div className="flex justify-center pt-2">
              <Button
                text={isLoadingMore ? "กำลังโหลด..." : "โหลดเพิ่มเติม"}
                className="w-fit px-6"
                onClick={handleLoadMore}
              />
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
