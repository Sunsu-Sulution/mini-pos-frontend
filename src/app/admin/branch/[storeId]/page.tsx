/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useHelperContext } from "@/components/providers/helper-provider";
import { isErrorResponse, Product } from "@/types/request";
import React, { use, useEffect, useState } from "react";

type PageProps = {
  params: Promise<{ storeId: string }>;
};

export default function Page({ params }: PageProps) {
  const { storeId } = use(params);

  const { setFullLoading, backendClient, setAlert } = useHelperContext()();
  const [name, setName] = useState("");
  const [storeCode, setStoreCode] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [productsList, setProductsList] = useState<Product[]>([]);

  const onUpdateStore = async () => {
    setFullLoading(true);
    const response = await backendClient.updateStoreById(storeId, {
      name: name,
      store_id: storeCode,
      is_active: isActive,
    });
    setFullLoading(false);
    if (isErrorResponse(response)) {
      return;
    }
    setAlert(
      "สำเร็จ",
      `อัพเดทคลังสินค้า ${name}(${storeCode}) เรียบร้อยแล้ว`,
      () => {
        window.location.href = `/admin/branch`;
      },
      false,
    );
  };

  const fetchProduct = async () => {
    setFullLoading(true);
    const response = await backendClient.listProduct(9999, "", "true", "");
    setFullLoading(false);
    if (isErrorResponse(response)) {
      window.location.href = "/admin/store";
      return;
    }
    setProductsList(response.data);
  };

  useEffect(() => {
    fetchStore();
    fetchProduct();
  }, []);

  const fetchStore = async () => {
    setFullLoading(true);
    const response = await backendClient.getStoreById(storeId);
    if (isErrorResponse(response)) {
      window.location.href = "/admin/branch";
      return;
    }
    setFullLoading(false);
    setName(response.name);
    setIsActive(response.is_active);
    setStoreCode(response.store_id);
  };

  return (
    <div className="px-4 py-6">
      <div className="text-4xl mb-4">แก้ไขรายการคลังสินค้า</div>
      <div className="bg-white p-5 rounded-2xl shadow-md">
        <div className="text-2xl mb-4">ข้อมูลคลังสินค้า</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="requestTaxInvoice"
              name="taxInvoice"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-5 h-5 text-text-primary border-2"
            />
            <label
              htmlFor="requestTaxInvoice"
              className="text-2xl cursor-pointer"
            >
              เปิดใช้งาน
            </label>
          </div>
          <Button
            disabled={name === "" || storeId === ""}
            text="แก้ไขคลังสินค้า"
            className="px-4 w-fit"
            icon={<img src="/icon-bearhouse-1.png" alt="icon" />}
            onClick={onUpdateStore}
          />
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
            value={storeCode}
            onChange={setStoreCode}
            placeholder="BR01"
          />
        </div>
      </div>

      <div className="bg-white p-5 pt-10 rounded-2xl shadow-md mt-5">
        <div className="text-2xl mb-4">สินค้าในคลัง</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="requestTaxInvoice"
              name="taxInvoice"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-5 h-5 text-text-primary border-2"
            />
            <label
              htmlFor="requestTaxInvoice"
              className="text-2xl cursor-pointer"
            >
              เปิดใช้งาน
            </label>
          </div>
          <Button
            disabled={name === "" || storeId === ""}
            text="เพิ่มสินค้าในคลัง"
            className="px-4 w-fit"
            icon={<img src="/icon-bearhouse-1.png" alt="icon" />}
            onClick={onUpdateStore}
          />
        </div>
      </div>
    </div>
  );
}
