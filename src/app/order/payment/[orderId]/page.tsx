/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useHelperContext } from "@/components/providers/helper-provider";
import { removeItem } from "@/lib/storage";
import { Charge, isErrorResponse, SaleOrder } from "@/types/request";
import React, { useState, useEffect, use } from "react";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export default function Page({ params }: PageProps) {
  const { orderId } = use(params);
  const { setFullLoading, backendClient, setAlert } = useHelperContext()();
  const [timeLeft, setTimeLeft] = useState(0);
  const [saleOrder, setSaleOrder] = useState<SaleOrder>();
  const [charge, setCharge] = useState<Charge>();
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  useEffect(() => {
    fetchSaleOrder();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        fetchSaleOrder(true);
      } catch (error) {
        console.error("Error fetching order status:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchSaleOrder = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setFullLoading(true);
    }

    const response = await backendClient.getSaleOrderById(orderId);
    if (isErrorResponse(response)) {
      if (isManualRefresh) {
        setIsRefreshing(false);
      } else {
        setFullLoading(false);
      }
      return;
    }
    if (response.charge.status === "successful") {
      removeItem("cart");
      removeItem("process_sale_order");
      window.location.href = `/order/payment/${orderId}/completed`;
    }

    if (
      response.charge.status === "expired" ||
      response.charge.status === "failed" ||
      response.charge.status === "reversed"
    ) {
      removeItem("cart");
      removeItem("process_sale_order");
      window.location.href = `/order/payment/${orderId}/failed`;
    }

    setSaleOrder(response.sale_order);
    setCharge(response.charge);
    if (response?.charge?.expired_at) {
      const expiredTime = new Date(response.charge.expired_at).getTime();
      const now = Date.now();
      const diffSeconds = Math.max(0, Math.floor((expiredTime - now) / 1000));
      setTimeLeft(diffSeconds);
    } else {
      setTimeLeft(0);
    }

    if (isManualRefresh) {
      setIsRefreshing(false);
    } else {
      setFullLoading(false);
    }
  };

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
        <button
          className="border-2 border-gray-500 p-4 rounded-2xl flex items-center"
          title="รีเฟรชข้อมูล"
          disabled={isRefreshing}
          onClick={() => fetchSaleOrder(true)}
        >
          <div className="text-2xl flex items-center gap-3">
            ชำระภายใน {formatTime(timeLeft)}
          </div>
          <div className="p-2 rounded-full transition-colors disabled:opacity-50">
            <svg
              className={`w-6 h-6 text-gray-600 ${
                isRefreshing ? "animate-spin" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
        </button>

        {charge?.qr_code && (
          <img src={charge.qr_code} alt="qr-code" className="w-70" />
        )}
        <div className="text-white text-2xl text-center bg-text-primary px-6">
          No. {saleOrder?.number} <br />
          ยอดชำระ {saleOrder?.total_amount.toLocaleString()} บาท <br />
        </div>
        <div
          className="text-gray-500 text-xl underline"
          onClick={() => {
            setAlert(
              "กรุณายืนยัน",
              "คุณต้องการที่จะยกเลิกรายการนี้ใช่หรือไม่",
              () => {
                removeItem("process_sale_order");
                window.location.href = "/payment/failed";
              },
              true,
            );
          }}
        >
          ยกเลิกรายการ
        </div>
      </div>

      {/* <div className="flex flex-col gap-3 px-10 pb-4">
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
      </div> */}
    </div>
  );
}
