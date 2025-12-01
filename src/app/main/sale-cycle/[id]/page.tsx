/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useHelperContext } from "@/components/providers/helper-provider";
import {
  isErrorResponse,
  SaleCycle,
  SaleOrder,
  SaleOrderWithOrderLine,
} from "@/types/request";
import React, { use, useEffect, useState } from "react";
import QRCodeSVG from "react-qr-code";
import Barcode from "react-barcode";
import {
  IconShoppingCart,
  IconCashBanknote,
  IconCopy,
} from "@tabler/icons-react";

type PageProps = {
  params: Promise<{ id: string }>;
};

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

export default function Page({ params }: PageProps) {
  const { id } = use(params);
  const { backendClient, setFullLoading } = useHelperContext()();
  const [saleCycle, setSaleCycle] = useState<SaleCycle>();
  const [saleOrder, setSaleOrder] = useState<SaleOrder[]>();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [orderDetails, setOrderDetails] = useState<
    Record<string, SaleOrderWithOrderLine>
  >({});
  const [codeType, setCodeType] = useState<"qrcode" | "barcode">("qrcode");
  const [tooltipText, setTooltipText] = useState<string>("คัดลอก");
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [isTooltipExiting, setIsTooltipExiting] = useState<boolean>(false);

  const fetchSaleCycle = async () => {
    setFullLoading(true);
    const response = await backendClient.getSaleCycleById(id);
    setFullLoading(false);
    if (isErrorResponse(response)) {
      return;
    }
    setSaleCycle(response.sale_cycle);
    setSaleOrder(response.sale_orders);
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
    fetchSaleCycle();
  }, []);

  if (!saleCycle) {
    return <div className="px-4 py-6"></div>;
  }

  return (
    <div className="px-4 py-6">
      {/* Sale Cycle Info */}
      <div className="bg-white p-5 rounded-2xl shadow-md mb-5">
        <div className="text-3xl mb-4">ข้อมูลรอบการขาย</div>
        <div className="flex gap-3 mb-4">
          <div className="bg-white p-4 rounded-md shadow-md w-full">
            <div className="text-xl flex gap-2">
              <IconShoppingCart />
              จำนวน
            </div>
            <div className="text-3xl text-green-500">
              {saleOrder?.length ?? 0} รายการ
            </div>
          </div>
          <div className="bg-white p-4 rounded-md shadow-md w-full">
            <div className="text-xl flex gap-2">
              <IconCashBanknote />
              ยอดรวม
            </div>
            <div className="text-3xl text-green-500">
              {(saleCycle.total_amount ?? 0).toLocaleString()} บาท
            </div>
          </div>
        </div>
        <div className="mb-4">
          <div className="text-xl text-gray-500">เวลาที่ปิดยอดการขาย</div>
          <div className="text-xl">
            {new Date(saleCycle.created_at).toLocaleString("th-TH")}
          </div>
        </div>

        {/* QR Code / Barcode */}
        {saleCycle.ref_code && (
          <div className="mt-10 flex flex-col items-center text-xl">
            {/* Code Type Selector */}
            <div className="mb-4 flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setCodeType("qrcode")}
                className={`px-4 py-2 rounded-md transition-colors ${
                  codeType === "qrcode"
                    ? "bg-text-primary text-white"
                    : "bg-transparent text-gray-700"
                }`}
              >
                คิวอาร์โค้ด
              </button>
              <button
                onClick={() => setCodeType("barcode")}
                className={`px-4 py-2 rounded-md transition-colors ${
                  codeType === "barcode"
                    ? "bg-text-primary text-white"
                    : "bg-transparent text-gray-700"
                }`}
              >
                บาร์โค้ด
              </button>
            </div>

            <div className="bg-white p-4 rounded-lg my-5">
              {codeType === "qrcode" ? (
                <QRCodeSVG value={saleCycle.ref_code} size={300} />
              ) : (
                <div className="flex justify-center">
                  <Barcode
                    value={saleCycle.ref_code}
                    format="CODE128"
                    width={3}
                    height={200}
                    displayValue={false}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="w-full bg-gray-100 p-3 rounded-2xl mt-5 text-2xl flex items-center justify-between gap-3">
          <span className="flex-1 font-bold pl-5">{saleCycle.ref_code}</span>
          <div className="relative">
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(saleCycle.ref_code);
                  setTooltipText("คัดลอกแล้ว");
                  setIsTooltipExiting(false);
                  setShowTooltip(true);
                  setTimeout(() => {
                    setIsTooltipExiting(true);
                    setTimeout(() => {
                      setShowTooltip(false);
                      setIsTooltipExiting(false);
                      setTooltipText("คัดลอก");
                    }, 300);
                  }, 500);
                } catch {
                  setTooltipText("ไม่สามารถคัดลอกได้");
                  setIsTooltipExiting(false);
                  setShowTooltip(true);
                  setTimeout(() => {
                    setIsTooltipExiting(true);
                    setTimeout(() => {
                      setShowTooltip(false);
                      setIsTooltipExiting(false);
                      setTooltipText("คัดลอก");
                    }, 300);
                  }, 500);
                }
              }}
              className="p-2 rounded-lg transition-colors flex items-center justify-center relative"
            >
              <IconCopy size={20} className="text-gray-700" />
              {showTooltip && (
                <div
                  className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap z-10 pointer-events-none 
                    ${
                      isTooltipExiting
                        ? "animate-tooltip-fade-out"
                        : "animate-tooltip-bounce-in"
                    }`}
                >
                  {tooltipText}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sale Orders List */}
      {saleOrder && saleOrder.length > 0 && (
        <div>
          <div className="text-3xl mb-3">รายการทั้งหมด</div>
          <div className="mt-3 flex flex-col gap-3">
            {saleOrder.map((order) => {
              const isExpanded = expandedOrders.has(order.id);
              const details = orderDetails[order.id];

              return (
                <div
                  key={order.id}
                  className="bg-white p-4 rounded-md shadow-md w-full transition-all duration-300"
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
                        <div>{order.number}</div>
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
      )}
    </div>
  );
}
