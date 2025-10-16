/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useHelperContext } from "@/components/providers/helper-provider";
import { renderStatusBadge } from "@/lib/frontend";
import { isErrorResponse, SaleOrderWithOrderLine } from "@/types/request";
import {
  IconPhoneFilled,
  IconMailFilled,
  IconCreditCardFilled,
  IconCheck,
} from "@tabler/icons-react";
import React, { use, useEffect, useState } from "react";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

const paymentMethods = [
  {
    id: "thai_qr",
    name: "Thai QR Payment",
    icon: (
      <img
        src="/thai-qr-icon.png"
        alt="thai-qr-icon"
        className="w-17 h-17 rounded-xl"
      />
    ),
  },
  {
    id: "credit_card",
    name: "Credit Card",
    icon: (
      <div className="w-17 h-17 flex justify-center items-center">
        <IconCreditCardFilled className="w-17 h-17" />
      </div>
    ),
  },
];

export default function Page({ params }: PageProps) {
  const { orderId } = use(params);
  const { setFullLoading, backendClient } = useHelperContext()();
  const [saleOrder, setSaleOrder] = useState<SaleOrderWithOrderLine>();

  const [selectedPayment, setSelectedPayment] = useState<
    "credit_card" | "thai_qr" | "unspecified"
  >("unspecified");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchSaleOrder();
  }, []);

  const fetchSaleOrder = async () => {
    setFullLoading(true);
    const response = await backendClient.getSaleOrderById(orderId);
    if (isErrorResponse(response)) {
      return;
    }
    setSaleOrder(response);
    setFullLoading(false);
  };

  const onSubmit = async () => {
    setFullLoading(true);
    // const response = await backendClient.editDraftSaleOrderById(orderId, {
    //   phone: phone,
    //   email: email,
    //   payment_type: selectedPayment,
    // });
    // setFullLoading(false);
  };

  return (
    <div className="px-4 py-6">
      <div className="bg-white rounded-xl shadow-md mb-6 p-5 flex items-center justify-between">
        <div className="text-2xl">No. {saleOrder?.sale_order.number}</div>
        <div className="text-xl flex items-center gap-2">
          {renderStatusBadge(saleOrder?.sale_order.status)}
        </div>
      </div>

      <div className="text-3xl mb-2">ข้อมูลลูกค้า</div>
      <div className="bg-white px-4 py-5 rounded-2xl shadow-md">
        <div className="flex flex-col gap-2">
          <div className="text-2xl">สมาชิก Bearhouse</div>
          <Input
            value=""
            onChange={() => {}}
            icon={<IconPhoneFilled />}
            type="text"
            inputMode="numeric"
            placeholder="เบอร์สมาชิก Bearhouse"
          />
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <div className="text-2xl">อีเมลสำหรับขอใบเสร็จรับเงิน</div>
          <Input
            value={email}
            onChange={() => {}}
            type="email"
            inputMode="email"
            icon={<IconMailFilled />}
            placeholder="อีเมล"
          />
        </div>
      </div>

      <div className="text-3xl mt-4 mb-2">วิธีการชำระเงิน</div>
      <div className="bg-white rounded-xl shadow-md px-5 py-7 flex flex-col gap-5">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`bg-white rounded-2xl border-2 p-3 flex items-center gap-5 cursor-pointer transition-all duration-200 ${
              selectedPayment === method.id
                ? "border-text-primary"
                : "hover:bg-gray-50 border-gray-300"
            }`}
            onClick={() =>
              setSelectedPayment(
                method.id as "unspecified" | "thai_qr" | "credit_card",
              )
            }
          >
            {method.icon}
            <div className="text-2xl flex-1">{method.name}</div>
            {selectedPayment === method.id && (
              <div className="w-5 h-5 bg-text-primary rounded-full flex items-center justify-center">
                <IconCheck className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white px-4 pt-9 pb-6 shadow-md rounded-t-3xl select-none w-[100vw] md:w-[600px]">
        <Button
          className="w-full"
          onClick={onSubmit}
          text="ยืนยันคำสั่งซื้อ"
          icon={<img src="/icon-bearhouse-1.png" alt="icon" />}
        />
      </div>
    </div>
  );
}
