/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useHelperContext } from "@/components/providers/helper-provider";
import {
  Inventory,
  InventoryMovement,
  isErrorResponse,
  Product,
} from "@/types/request";
import {
  IconPlus,
  IconChevronDown,
  IconMinus,
  IconSearch,
  IconBasketFilled,
} from "@tabler/icons-react";
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
  const [inventoryMovementList, setInventoryMovementList] = useState<
    InventoryMovement[]
  >([]);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isProductInputFocused, setIsProductInputFocused] = useState(false);

  const [isStoreInfoOpen, setIsStoreInfoOpen] = useState(true);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isManageInventoryModalOpen, setIsManageInventoryModalOpen] =
    useState(false);
  const [isInventoryMovementOpen, setIsInventoryMovementOpen] = useState(false);

  const productById = useMemo(() => {
    const map = new Map<string, Product>();
    productsList.forEach((product) => map.set(product.id, product));
    return map;
  }, [productsList]);

  const filteredProducts = useMemo(() => {
    const keyword = productQuery.trim().toLowerCase();
    if (keyword === "") return productsList;
    return productsList.filter((p) => {
      const name = p.name?.toLowerCase() ?? "";
      const sku = p.sku?.toLowerCase() ?? "";
      return name.includes(keyword) || sku.includes(keyword);
    });
  }, [productsList, productQuery]);

  const productSpecificMovements = useMemo(() => {
    if (!selectedProductId) return [] as InventoryMovement[];
    return inventoryMovementList
      .filter((m) => m.product_id === selectedProductId)
      .slice()
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }, [inventoryMovementList, selectedProductId]);

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

    const inventoryMovementResponse =
      await backendClient.getInventoryMovementByStoreById(storeId);
    if (isErrorResponse(inventoryMovementResponse)) {
      window.location.href = "/admin/branch";
      return;
    }
    setInventoryMovementList(inventoryMovementResponse);
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
    setProductQuery("");
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
    setProductQuery("");
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
            <div className="flex justify-end mb-3">
              <Button
                text={
                  <div className="flex gap-2">
                    <IconBasketFilled /> จัดการสินค้าในคลัง
                  </div>
                }
                className="px-4 w-fit"
                onClick={() => setIsManageInventoryModalOpen(true)}
              />
            </div>
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
                      className="flex items-center justify-between border-2 rounded-xl p-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedProductId(product.id);
                        setProductQuery(`${product.name} (${product.sku})`);
                        setIsManageInventoryModalOpen(true);
                      }}
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
                        {inv.quantity.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {isManageInventoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsManageInventoryModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 p-5 animate-bounce-in">
            <div className="flex items-center justify-between">
              <div className="text-2xl">จัดการสินค้าในคลัง</div>
              <button
                type="button"
                className="text-xl px-3 py-1 rounded-lg cursor-pointer"
                onClick={() => setIsManageInventoryModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <div className="relative w-full">
                <Input
                  type="text"
                  value={productQuery}
                  onChange={(v) => {
                    setProductQuery(v);
                    setSelectedProductId("");
                  }}
                  icon={<IconSearch />}
                  placeholder="ค้นหาสินค้าโดยชื่อหรือ SKU"
                  onFocus={() => {
                    setProductQuery("");
                    setSelectedProductId("");
                    setIsProductInputFocused(true);
                  }}
                  onBlur={() => setIsProductInputFocused(false)}
                />
                {isProductInputFocused && (
                  <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto border-2 rounded-xl bg-white">
                    {filteredProducts.length === 0 ? (
                      <div className="p-3 text-gray-500">ไม่พบสินค้า</div>
                    ) : (
                      filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className="p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3 border-b-2 border-gray-300"
                          onMouseDown={() => {
                            setSelectedProductId(product.id);
                            setProductQuery(`${product.name} (${product.sku})`);
                          }}
                        >
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div className="flex flex-col">
                            <div className="text-xl">{product.name}</div>
                            <div className="text-xl text-gray-500">
                              {product.sku}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
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
                  quantity < 1
                }
                text={
                  <div className="flex items-center gap-2">
                    <IconPlus size={18} />
                    เพิ่มจำนวนสินค้า
                  </div>
                }
                className="px-5 w-full"
                onClick={async () => {
                  await onAddInventory();
                  setIsManageInventoryModalOpen(false);
                }}
              />
              <Button
                disabled={
                  name === "" ||
                  storeId === "" ||
                  selectedProductId === "" ||
                  quantity < 1
                }
                text={
                  <div className="flex items-center gap-2">
                    <IconMinus size={18} />
                    ลดจำนวนสินค้า
                  </div>
                }
                className="px-5 w-full"
                onClick={async () => {
                  await onRemoveInventory();
                  setIsManageInventoryModalOpen(false);
                }}
              />
            </div>
            <div className="mt-4">
              <div className="text-xl mb-2">ประวัติของสินค้า</div>
              {selectedProductId === "" ? (
                <div className="text-gray-500">
                  โปรดเลือกสินค้าเพื่อดูประวัติ
                </div>
              ) : productSpecificMovements.length === 0 ? (
                <div className="text-gray-500">
                  ยังไม่มีประวัติสำหรับสินค้านี้
                </div>
              ) : (
                <div className="border-2 border-text-primary rounded-xl bg-white w-full p-3 text-lg h-40 overflow-auto">
                  <ul className="list-disc pl-6">
                    {productSpecificMovements.map((m) => {
                      const dateTime = new Date(m.created_at);
                      return (
                        <li key={m.id}>
                          {`[${dateTime.getFullYear()}-${dateTime.getMonth()}-${dateTime.getDate()} ${dateTime.getHours()}:${dateTime.getMinutes()}] ${
                            m.description
                          }`}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-5 rounded-2xl shadow-md mt-5">
        <div
          className="flex items-center justify-between"
          onClick={() => setIsInventoryMovementOpen((v) => !v)}
        >
          <div className="text-2xl">ประวัติการย้ายสินค้าในคลัง</div>
          <div className="p-2 rounded-lg">
            <IconChevronDown
              size={22}
              className={`${
                isInventoryMovementOpen ? "rotate-0" : "-rotate-90"
              } transition-transform duration-200`}
            />
          </div>
        </div>
        {isInventoryMovementOpen && (
          <>
            <div className="mt-4">
              {inventoryMovementList.length === 0 ? (
                <div className="text-gray-500">ไม่มีประวัติการย้ายสินค้า</div>
              ) : (
                <div className="border-2 border-text-primary rounded-xl bg-white w-full p-3 text-xl h-60 max-h-60 overflow-auto">
                  <ul className="list-disc pl-6">
                    {inventoryMovementList
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(b.created_at).getTime() -
                          new Date(a.created_at).getTime(),
                      )
                      .map((m) => {
                        const dateTime = new Date(m.created_at);
                        return (
                          <li key={m.id} className="mb-2">
                            {[
                              `[${dateTime.getFullYear()}-${dateTime.getMonth()}-${dateTime.getDate()} ${dateTime.getHours()}:${dateTime.getMinutes()}] ${
                                m.description
                              }`,
                            ]}
                          </li>
                        );
                      })}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
