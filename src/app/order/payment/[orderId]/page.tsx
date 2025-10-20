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
        fetchSaleOrder();
      } catch (error) {
        console.error("Error fetching order status:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId, backendClient]);

  const fetchSaleOrder = async () => {
    setFullLoading(true);
    const response = await backendClient.getSaleOrderById(orderId);
    if (isErrorResponse(response)) {
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

    setFullLoading(false);
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
        <div className="border-2 border-gray-500 p-4 rounded-2xl flex flex-col items-center">
          <div className="text-2xl">ชำระภายใน {formatTime(timeLeft)}</div>
        </div>
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
