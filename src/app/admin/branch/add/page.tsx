/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useHelperContext } from "@/components/providers/helper-provider";
import { isErrorResponse } from "@/types/request";
import React, { useState } from "react";

export default function Page() {
  const { setFullLoading, backendClient, setAlert } = useHelperContext()();
  const [name, setName] = useState("");
  const [storeId, setStoreId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const onAddStore = async () => {
    setFullLoading(true);
    const response = await backendClient.createStore({
      name: name,
      store_id: storeId,
      is_active: isActive,
    });
    setFullLoading(false);
    if (isErrorResponse(response)) {
      return;
    }
    setAlert(
      "สำเร็จ",
      `เพิ่มคลังสินค้า ${name}(${storeId}) เรียบร้อยแล้ว`,
      () => {
        window.location.href = `/admin/branch/${response.id}`;
      },
      false,
    );
  };

  return (
    <div className="px-4 py-6">
      <div className="text-4xl mb-4">เพิ่มรายการคลังใหม่</div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="requestTaxInvoice"
          name="taxInvoice"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-5 h-5 text-text-primary border-2"
        />
        <label htmlFor="requestTaxInvoice" className="text-2xl cursor-pointer">
          เปิดใช้งาน
        </label>
      </div>
      <div className="flex flex-col mt-4">
        <div className="text-2xl">ชื่อคลัง*</div>
        <Input
          type="text"
          value={name}
          onChange={setName}
          placeholder="แมวน้ำ"
        />
      </div>
      <div className="flex flex-col mt-4">
        <div className="text-2xl">store id*</div>
        <Input
          type="text"
          value={storeId}
          onChange={setStoreId}
          placeholder="BR01"
        />
      </div>
      <div className="mt-10 flex justify-end">
        <Button
          disabled={name === "" || storeId === ""}
          text="เพิ่มคลังสินค้า"
          className="px-4 w-full"
          icon={<img src="/icon-bearhouse-1.png" alt="icon" />}
          onClick={onAddStore}
        />
      </div>
    </div>
  );
}
