/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import { useHelperContext } from "@/components/providers/helper-provider";
import {
  Charge,
  isErrorResponse,
  SaleOrder,
  SaleOrderLine,
} from "@/types/request";
import { IconCircleCheckFilled, IconEye } from "@tabler/icons-react";
import React, { use, useEffect, useState } from "react";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export default function Page({ params }: PageProps) {
  const { orderId } = use(params);
  const { backendClient, setFullLoading } = useHelperContext()();

  const [saleOrder, setSaleOrder] = useState<SaleOrder>();
  const [charge, setCharge] = useState<Charge>();
  const [saleOrderLine, setSaleOrderLine] = useState<SaleOrderLine[]>();

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
    setCharge(response.charge);
    setSaleOrderLine(response.sale_order_line);
    setFullLoading(false);
  };

  const handlePreviewReceipt = () => {
    window.open(
      `${process.env.NEXT_PUBLIC_BACKEND_PATH}/sale-order/${orderId}/receipt`,
    );
  };

  return (
    <div className="px-1 pt-4">
      <div className="bg-white p-8 m-8 mt-0 rounded-2xl flex flex-col justify-center items-center gap-5 shadow-md">
        <IconCircleCheckFilled size={100} className="text-green-500" />
        <div className="text-4xl">การชำระเงินสำเร็จ</div>
        <div className="w-full">
          <div className="text-white text-2xl text-center bg-text-primary px-6">
            No. {saleOrder?.number}
          </div>
        </div>
        <div className="w-full text-xl text-gray-500">
          <div>
            <span className="mt-4 text-text-primary">Transaction</span>{" "}
            {charge?.id}
          </div>

          <div>
            <span className="mt-4 text-text-primary">เวลา</span>{" "}
            {charge?.updated_at}
          </div>

          {saleOrder?.customer_phone && (
            <div>
              <span className="mt-4 text-text-primary">เบอร์สมาชิก</span>{" "}
              {saleOrder.customer_phone}
            </div>
          )}

          {saleOrder?.customer_email && (
            <div>
              <span className="mt-4 text-text-primary">อีเมล</span>{" "}
              {saleOrder.customer_email}
            </div>
          )}

          <div className="mt-4 text-text-primary">รายการ</div>

          {(saleOrderLine || []).map((item, index) => (
            <div className="w-full flex gap-3 justify-between" key={item.id}>
              <div>
                {index + 1}. {item.product_name}
              </div>
              <div className="text-xl truncate">
                {item.unit_price.toLocaleString()}-. x {item.quantity}
              </div>
            </div>
          ))}

          <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

          <div className="flex justify-between">
            <span className="text-text-primary">รวมทั้งสิ้น</span>{" "}
            {saleOrder?.total_amount.toLocaleString()} บาท
          </div>

          <Button
            text={
              <>
                <IconEye size={20} className="mr-2" /> Preview ใบเสร็จรับเงิน
              </>
            }
            onClick={handlePreviewReceipt}
            className="px-4 mt-4"
          />
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
