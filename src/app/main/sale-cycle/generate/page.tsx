/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import Button from "@/components/Button";
import { useHelperContext } from "@/components/providers/helper-provider";
import {
  GenerateSaleCycleResponse,
  isErrorResponse,
  SaleOrderWithOrderLine,
} from "@/types/request";
import {
  IconAlertSmall,
  IconCashBanknote,
  IconShoppingCart,
} from "@tabler/icons-react";
import React, { useEffect, useState } from "react";

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

export default function Page() {
  const { backendClient, setFullLoading, setAlert } = useHelperContext()();

  const [response, setResponse] = useState<GenerateSaleCycleResponse>();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [orderDetails, setOrderDetails] = useState<
    Record<string, SaleOrderWithOrderLine>
  >({});

  const fetchGenerateSaleCycle = async () => {
    setFullLoading(true);
    const response = await backendClient.generteSaleCycle();
    setFullLoading(false);
    if (isErrorResponse(response)) {
      return;
    }
    setResponse(response);
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

  useEffect(() => {
    fetchGenerateSaleCycle();
  }, []);

  const onCloseSaleCycle = async () => {
    setAlert(
      "ยืนยันการปิดรอบการขาย",
      `กรุณายืนยันการปิดรอบการขายจำนวน ${(
        response?.sale_cycle.total_amount ?? 0
      ).toLocaleString()} บาท`,
      async () => {
        setFullLoading(true);
        const saleCycle = await backendClient.closeSaleCycle(
          response?.sale_cycle.total_amount ?? 0,
        );
        setFullLoading(false);
        if (isErrorResponse(saleCycle)) {
          return;
        }
        setAlert(
          "สำเร็จ",
          "ปิดยอดการขายสำเร็จแล้ว",
          () => {
            window.location.href = "/main/summary";
          },
          false,
        );
      },
      true,
    );
  };

  return (
    <div className="px-4 py-6">
      <div className="text-4xl mb-3">ปิดยอดการขาย</div>
      <div className="flex gap-3">
        <div className="bg-white p-4 rounded-md shadow-md w-full">
          <div className="text-xl flex gap-2">
            <IconShoppingCart />
            จำนวน
          </div>
          <div className="text-3xl text-green-500">
            {response?.sale_orders.length ?? 0} รายการ
          </div>
        </div>
        <div className="bg-white p-4 rounded-md shadow-md w-full">
          <div className="text-xl flex gap-2">
            <IconCashBanknote />
            ยอดรวม
          </div>
          <div className="text-3xl text-green-500">
            {(response?.sale_cycle.total_amount ?? 0).toLocaleString()} บาท
          </div>
        </div>
      </div>
      <Button
        icon={<img src="/icon-bearhouse-2.png" alt="icon" />}
        text="ยืนยันการปิดรอบการขาย"
        onClick={onCloseSaleCycle}
        className="mt-3"
      />
      <div className="text-3xl mt-5">รายการทั้งหมด</div>
      <div className="flex mb-4 text-xl">
        <IconAlertSmall /> รายการที่ถูกปิดรอบการขายไปแล้วจะไม่นำมาคิด
      </div>
      <div className="mt-3 flex flex-col gap-3">
        {response?.sale_orders.map((saleOrder) => {
          const isExpanded = expandedOrders.has(saleOrder.id);
          const details = orderDetails[saleOrder.id];

          return (
            <div
              key={saleOrder.id}
              className="bg-white p-4 rounded-md shadow-md w-full transition-all duration-300"
            >
              <div
                className="flex justify-between cursor-pointer"
                onClick={() => toggleOrderExpansion(saleOrder.id)}
              >
                <div>
                  <div className="text-md text-gray-400">
                    {saleOrder.payment_type.split("_").join(" ")}
                  </div>
                  <div className="text-xl flex items-center gap-2">
                    <div>{saleOrder.number}</div>
                    {saleOrder.status !== "draft" && (
                      <div
                        className={`px-3 h-5 rounded-md text-sm flex items-center ${
                          statusDisplay[saleOrder.status].className
                        }`}
                      >
                        {statusDisplay[saleOrder.status].label}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end justify-end">
                    <div className="text-md text-gray-400">
                      {formatTime(saleOrder.created_at)}
                    </div>
                    <div className="text-xl">
                      ฿
                      {saleOrder.total_amount.toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
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
                        <span className="text-gray-500">Transaction Ref:</span>
                        <span className="">
                          {details.sale_order.transaction_ref}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">วันที่สร้าง:</span>
                      <span className="">
                        {new Date(details.sale_order.created_at).toLocaleString(
                          "th-TH",
                        )}
                      </span>
                    </div>
                    {details.sale_order_line &&
                      details.sale_order_line.length > 0 && (
                        <div className="mt-4">
                          <div className="text-gray-700 mb-3 text-lg">
                            รายการสินค้า
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
                                <div className="text-base">
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
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
