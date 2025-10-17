/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useHelperContext } from "@/components/providers/helper-provider";
import { removeItem } from "@/lib/storage";
import { isErrorResponse, SaleOrder } from "@/types/request";
import React, { useState, useEffect, use } from "react";

const mockQrCode = {
  image: "/demo/qr-code.png",
};

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export default function Page({ params }: PageProps) {
  const { orderId } = use(params);
  const { setFullLoading, backendClient, setAlert } = useHelperContext()();
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [saleOrder, setSaleOrder] = useState<SaleOrder>();

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

  const fetchSaleOrder = async () => {
    setFullLoading(true);
    const response = await backendClient.getSaleOrderById(orderId);
    if (isErrorResponse(response)) {
      return;
    }
    setSaleOrder(response.sale_order);
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
        <img src={mockQrCode.image} alt="qr-code" className="h-60" />
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
