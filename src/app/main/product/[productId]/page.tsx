/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useHelperContext } from "@/components/providers/helper-provider";
import { Inventory, isErrorResponse, Store } from "@/types/request";
import { IconPlus, IconBuildingStore } from "@tabler/icons-react";
import { IconSearch } from "@tabler/icons-react";
import React, { use, useEffect, useMemo, useState } from "react";
import { IconTruckDelivery } from "@tabler/icons-react";

type PageProps = {
  params: Promise<{ productId: string }>;
};

export default function Page({ params }: PageProps) {
  const { productId } = use(params);

  const { setFullLoading, backendClient, setAlert } = useHelperContext()();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState(0);

  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
    fetchInventory();
  }, []);

  const fetchProduct = async () => {
    setFullLoading(true);
    const response = await backendClient.getProductById(productId);
    if (isErrorResponse(response)) {
      window.location.href = "/admin/product";
      return;
    }
    setFullLoading(false);
    setName(response.name);
    setPrice(response.price);
    setSku(response.sku);
    setImageUrl(response.image_url);
  };

  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [store, setStore] = useState<Store[]>([]);
  const [inventoryQuery, setInventoryQuery] = useState("");
  const [isAddInventoryModalOpen, setIsAddInventoryModalOpen] = useState(false);
  const [storeQuery, setStoreQuery] = useState("");
  const [selectedTargetStoreId, setSelectedTargetStoreId] = useState("");
  const [isStoreInputFocused, setIsStoreInputFocused] = useState(false);
  const [quantityToAdd, setQuantityToAdd] = useState<number>(1);
  const storeById = useMemo(() => {
    const map = new Map<string, Store>();
    store.forEach((s) => map.set(s.id, s));
    return map;
  }, [store]);
  const inventoryWithStore = useMemo(() => {
    return inventory
      .map((inv) => ({ inv, store: storeById.get(inv.store_id) }))
      .filter((x) => !!x.store);
  }, [inventory, storeById]);

  const filteredInventoryWithStore = useMemo(() => {
    const keyword = inventoryQuery.trim().toLowerCase();
    if (keyword === "") return inventoryWithStore;
    return inventoryWithStore.filter(({ store }) => {
      const name = store?.name?.toLowerCase() ?? "";
      const code = store?.store_id?.toLowerCase() ?? "";
      return name.includes(keyword) || code.includes(keyword);
    });
  }, [inventoryQuery, inventoryWithStore]);

  const filteredStores = useMemo(() => {
    const keyword = storeQuery.trim().toLowerCase();
    if (keyword === "") return store;
    return store.filter((s) => {
      const name = s.name?.toLowerCase() ?? "";
      const code = s.store_id?.toLowerCase() ?? "";
      return name.includes(keyword) || code.includes(keyword);
    });
  }, [store, storeQuery]);

  const onAddInventoryToStore = async () => {
    if (!selectedTargetStoreId || quantityToAdd < 1) return;
    setFullLoading(true);
    const response = await backendClient.addInventory({
      store_id: selectedTargetStoreId,
      product_id: productId,
      quantity: Number(quantityToAdd),
    });
    setFullLoading(false);
    if (isErrorResponse(response)) {
      return;
    }
    setAlert(
      "สำเร็จ",
      `เพิ่มจำนวนสินค้า ${name} ที่สาขาที่เลือก จำนวน ${quantityToAdd} สำเร็จ`,
      () => {
        setIsAddInventoryModalOpen(false);
        setStoreQuery("");
        setSelectedTargetStoreId("");
        setQuantityToAdd(1);
        fetchInventory();
      },
      false,
    );
  };
  const fetchInventory = async () => {
    setFullLoading(true);
    const store = await backendClient.listStore(9999, "", "true", "");
    if (isErrorResponse(store)) {
      return;
    }
    setStore(store.data);

    const response = await backendClient.getInventoryByProductId(productId);
    if (isErrorResponse(response)) {
      return;
    }
    setInventory(response);
    setFullLoading(false);
  };

  return (
    <div className="px-4 py-6">
      <div className="bg-white p-5 rounded-2xl shadow-md">
        <div className="text-3xl">{name}</div>
        <div className="mt-4">
          <div className="text-2xl">รูปสินค้า</div>
          <div className="relative">
            <div
              className={`w-50 h-30 border-2 border-text-primary bg-transparent rounded-md flex items-center justify-center text-center transition-colors border-dashed`}
              tabIndex={0}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="ตัวอย่างรูปสินค้า"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="px-4 text-text-primary text-xl opacity-50">
                  ไม่มีรูปภาพ
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col mt-4">
          <div className="text-2xl">ชื่อสินค้า</div>
          <Input
            type="text"
            value={name}
            onChange={() => {}}
            placeholder="แมวน้ำ"
          />
        </div>
        <div className="flex flex-col mt-4">
          <div className="text-2xl">sku</div>
          <Input
            type="text"
            value={sku}
            onChange={() => {}}
            placeholder="sku-01"
          />
        </div>
        <div className="flex flex-col mt-4">
          <div className="text-2xl">ราคา</div>
          <Input
            type="number"
            inputMode="numeric"
            value={price}
            onChange={() => {}}
            placeholder="499.99"
          />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-md mt-5">
        <div className="flex items-center justify-between">
          <div className="text-2xl">สาขาที่มีสินค้า</div>
        </div>
        <div className="w-full mt-3">
          <Input
            type="text"
            className="w-full"
            value={inventoryQuery}
            onChange={setInventoryQuery}
            placeholder="ค้นหาสาขา หรือ Store ID"
            icon={<IconSearch />}
          />
        </div>
        <div className="mt-4">
          {filteredInventoryWithStore.length === 0 ? (
            <div className="text-center mt-10 text-xl text-gray-600">
              ไม่พบสาขาที่มีสินค้านี้
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 cursor-pointer">
              {filteredInventoryWithStore.map(({ inv, store }) => {
                if (!store) return null;
                return (
                  <div
                    key={inv.id}
                    onClick={() => {
                      window.location.href = `/admin/branch/${store.id}`;
                    }}
                    className="border-2 border-text-primary rounded-xl p-4 bg-white flex gap-4 items-center"
                  >
                    <div className="flex justify-between items-center w-full">
                      <div className="text-xl flex items-center gap-2">
                        <IconTruckDelivery size={28} />
                        <span>{store.name}</span>
                        <span className="text-gray-400">
                          ({store.store_id})
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="text-md px-2 py-1 rounded-lg bg-text-primary text-white">
                          {inv.quantity.toLocaleString()} ชิ้น
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isAddInventoryModalOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsAddInventoryModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 p-5 animate-bounce-in">
            <div className="flex items-center justify-between">
              <div className="text-2xl">เพิ่มสินค้าเข้าคลัง</div>
              <button
                type="button"
                className="text-xl px-3 py-1 rounded-lg cursor-pointer"
                onClick={() => setIsAddInventoryModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-2 mt-4 flex-col md:flex-row">
              <div className="flex flex-col w-full">
                <div className="text-xl text-gray-600 mb-1">เลือกสาขา*</div>
                <div className="relative w-full">
                  <Input
                    type="text"
                    value={storeQuery}
                    onChange={(v) => {
                      setStoreQuery(v);
                      setSelectedTargetStoreId("");
                    }}
                    icon={<IconBuildingStore />}
                    placeholder="เลือกคลัง โดยชื่อคลังหรือ Store ID"
                    onFocus={() => {
                      setStoreQuery("");
                      setSelectedTargetStoreId("");
                      setIsStoreInputFocused(true);
                    }}
                    onBlur={() => setIsStoreInputFocused(false)}
                  />
                  {isStoreInputFocused && (
                    <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto border-2 rounded-xl bg-white">
                      {filteredStores.length === 0 ? (
                        <div className="p-3 text-gray-500">ไม่พบคลัง</div>
                      ) : (
                        filteredStores.map((s) => (
                          <div
                            key={s.id}
                            className="p-3 hover:bg-gray-100 cursor-pointer flex items-center justify-between border-b-2 border-gray-300"
                            onMouseDown={() => {
                              setSelectedTargetStoreId(s.id);
                              setStoreQuery(`${s.name} (${s.store_id})`);
                            }}
                          >
                            <div className="flex gap-1 items-center">
                              <IconBuildingStore />
                              <div className="text-xl">{s.name}</div>
                              <div className="text-sm text-gray-500">
                                ({s.store_id})
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col w-full md:w-40">
                <div className="text-xl text-gray-600 mb-1">จำนวน*</div>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={quantityToAdd}
                  onChange={setQuantityToAdd}
                  placeholder="จำนวน"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-3 flex-col md:flex-row">
              <Button
                disabled={
                  selectedTargetStoreId === "" ||
                  quantityToAdd < 1 ||
                  name === ""
                }
                text={
                  <div className="flex items-center gap-2">
                    <IconPlus size={18} />
                    เพิ่มสินค้าเข้าคลัง
                  </div>
                }
                className="px-5 w-full"
                onClick={onAddInventoryToStore}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
