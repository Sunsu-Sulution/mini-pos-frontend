/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useHelperContext } from "@/components/providers/helper-provider";
import { Inventory, isErrorResponse, Product } from "@/types/request";
import { IconPlus, IconChevronDown, IconMinus } from "@tabler/icons-react";
import React, { use, useEffect, useMemo, useState } from "react";

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
  const [inventoryList, setInventoryList] = useState<Inventory[]>([]);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState<number>(1);

  const [isStoreInfoOpen, setIsStoreInfoOpen] = useState(true);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isManageInventoryOpen, setIsManageInventoryOpen] = useState(false);

  const productById = useMemo(() => {
    const map = new Map<string, Product>();
    productsList.forEach((product) => map.set(product.id, product));
    return map;
  }, [productsList]);

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
      undefined,
      false,
    );
  };

  const fetchProduct = async () => {
    setFullLoading(true);
    const response = await backendClient.listProduct(9999, "", "true", "");
    setFullLoading(false);
    if (isErrorResponse(response)) {
      window.location.href = "/admin/branch";
      return;
    }
    setProductsList(response.data);
  };

  const fetchInventory = async () => {
    setFullLoading(true);
    const response = await backendClient.getInventoryByStoreById(storeId);
    setFullLoading(false);
    if (isErrorResponse(response)) {
      window.location.href = "/admin/branch";
      return;
    }
    setInventoryList(response);
  };

  useEffect(() => {
    fetchStore();
    fetchProduct().then(() => {
      fetchInventory();
    });
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

  const onAddInventory = async () => {
    setFullLoading(true);
    const response = await backendClient.addInventory({
      store_id: storeId,
      product_id: selectedProductId,
      quantity: Number(quantity),
    });
    setFullLoading(false);
    if (isErrorResponse(response)) {
      return;
    }
    setSelectedProductId("");
    setQuantity(1);
    setAlert(
      "สำเร็จ",
      `เพิ่มจำนวนสินค้า ${response.name} ที่ ${name} จำนวน ${quantity} สำเร็จ`,
      () => {
        fetchInventory();
      },
      false,
    );
  };

  const onRemoveInventory = async () => {
    setFullLoading(true);
    const response = await backendClient.removeInventory({
      store_id: storeId,
      product_id: selectedProductId,
      quantity: Number(quantity),
    });
    setFullLoading(false);
    if (isErrorResponse(response)) {
      return;
    }
    setSelectedProductId("");
    setQuantity(1);
    setAlert(
      "สำเร็จ",
      `ลบจำนวนสินค้า ${response.name} ที่ ${name} จำนวน ${quantity} สำเร็จ`,
      () => {
        fetchInventory();
      },
      false,
    );
  };

  return (
    <div className="px-4 py-6">
      <div className="text-4xl mb-4">{name}</div>
      <div className="bg-white p-5 rounded-2xl shadow-md">
        <div
          className="flex items-center justify-between"
          onClick={() => setIsStoreInfoOpen((v) => !v)}
        >
          <div className="text-2xl">ข้อมูลคลังสินค้า</div>
          <div className="p-2 rounded-lg">
            <IconChevronDown
              size={22}
              className={`${
                isStoreInfoOpen ? "rotate-0" : "-rotate-90"
              } transition-transform duration-200`}
            />
          </div>
        </div>
        {isStoreInfoOpen && (
          <>
            <div className="flex items-center justify-between mt-6">
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
                text="แก้ไขข้อมูล"
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
          </>
        )}
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-md mt-5">
        <div
          className="flex items-center justify-between"
          onClick={() => setIsManageInventoryOpen((v) => !v)}
        >
          <div className="text-2xl">จัดการสินค้าในคลัง</div>
          <div className="p-2 rounded-lg">
            <IconChevronDown
              size={22}
              className={`${
                isManageInventoryOpen ? "rotate-0" : "-rotate-90"
              } transition-transform duration-200`}
            />
          </div>
        </div>
        {isManageInventoryOpen && (
          <>
            <div className="flex items-center gap-2 mt-4">
              <select
                className="border-2 h-12 rounded-xl px-3 text-xl w-full"
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                }}
              >
                <option value="">เลือกสินค้า</option>
                {productsList.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
              <Input
                type="number"
                inputMode="decimal"
                value={quantity}
                onChange={setQuantity}
                placeholder="จำนวน"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                disabled={
                  name === "" ||
                  storeId === "" ||
                  selectedProductId === "" ||
                  quantity == 0
                }
                text={
                  <div className="flex items-center gap-2">
                    <IconPlus size={18} />
                    เพิ่มสินค้า
                  </div>
                }
                className="px-5 w-full"
                onClick={onAddInventory}
              />
              <Button
                disabled={
                  name === "" ||
                  storeId === "" ||
                  selectedProductId === "" ||
                  quantity == 0
                }
                text={
                  <div className="flex items-center gap-2">
                    <IconMinus size={18} />
                    ลดสินค้า
                  </div>
                }
                className="px-5 w-full"
                onClick={onRemoveInventory}
              />
            </div>
          </>
        )}
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-md mt-5">
        <div
          className="flex items-center justify-between"
          onClick={() => setIsInventoryOpen((v) => !v)}
        >
          <div className="text-2xl">สินค้าในคลัง</div>
          <div className="p-2 rounded-lg">
            <IconChevronDown
              size={22}
              className={`${
                isInventoryOpen ? "rotate-0" : "-rotate-90"
              } transition-transform duration-200`}
            />
          </div>
        </div>
        {isInventoryOpen && (
          <>
            {inventoryList.length === 0 ? (
              <div className="text-gray-500">ไม่มีสินค้าในคลัง</div>
            ) : (
              <div className="flex flex-col gap-3">
                {inventoryList.map((inv) => {
                  const product = productById.get(inv.product_id);
                  if (!product) return null;
                  return (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between border-2 rounded-xl p-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex flex-col">
                          <div className="text-xl">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            {product.sku}
                          </div>
                        </div>
                      </div>
                      <div className="text-xl font-semibold">
                        x{inv.quantity}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
