/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useHelperContext } from "@/components/providers/helper-provider";
import { Inventory, isErrorResponse, Store } from "@/types/request";
import { IconSquareRoundedXFilled } from "@tabler/icons-react";
import { IconPlus, IconBuildingStore } from "@tabler/icons-react";
import React, { use, useEffect, useMemo, useRef, useState } from "react";
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
  const [canBeSold, setCanBeSold] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const uploadImage = async (file: File) => {
    setFullLoading(true);
    const response = await backendClient.uploadFile(file, "product");
    setFullLoading(false);
    if (isErrorResponse(response)) {
      return;
    }

    setImageUrl(response.url);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    uploadImage(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const onPickFile = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const onDeleteImage = () => {
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchInventory();
  }, []);

  const onUpdateProduct = async () => {
    setFullLoading(true);
    const response = await backendClient.updateProductById(productId, {
      sku: sku,
      name: name,
      price: price,
      can_be_sold: canBeSold,
      image_url: imageUrl ?? "",
    });
    setFullLoading(false);
    if (isErrorResponse(response)) {
      return;
    }
    setAlert(
      "สำเร็จ",
      `อัพเดทสินค้า ${name}(${sku}) เรียบร้อยแล้ว`,
      () => {
        window.location.href = "/admin/product";
      },
      false,
    );
  };

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
    setCanBeSold(response.can_be_sold);
    setImageUrl(response.image_url);
  };

  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [store, setStore] = useState<Store[]>([]);
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
        <div className="text-3xl">ข้อมูลสินค้า</div>
        <div className="flex items-center gap-3 mt-3">
          <input
            type="checkbox"
            id="requestTaxInvoice"
            name="taxInvoice"
            checked={canBeSold}
            onChange={(e) => setCanBeSold(e.target.checked)}
            className="w-5 h-5 text-text-primary border-2"
          />
          <label
            htmlFor="requestTaxInvoice"
            className="text-2xl cursor-pointer"
          >
            เปิดขาย
          </label>
        </div>
        <div className="mt-4">
          <div className="text-2xl">รูปสินค้า*</div>
          <div className="relative">
            <div
              className={`w-50 h-30 border-2 rounded-md flex items-center justify-center text-center cursor-pointer transition-colors border-dashed ${
                isDragActive
                  ? "bg-gray-100"
                  : `border-text-primary ${
                      imageUrl === null || imageUrl === ""
                        ? "bg-white"
                        : "bg-transparent"
                    }`
              }`}
              onClick={onPickFile}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              role="button"
              aria-label="อัพโหลดรูปสินค้า"
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
                  ลากและวางรูปภาพที่นี่ หรือคลิกเพื่อเลือกไฟล์
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </div>
            {imageUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteImage();
                }}
                className="absolute -top-2 left-47 w-6 h-6 bg-white text-text-primary rounded-lg flex items-center justify-center"
                aria-label="ลบรูปภาพ"
              >
                <IconSquareRoundedXFilled />
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col mt-4">
          <div className="text-2xl">ชื่อสินค้า*</div>
          <Input
            type="text"
            value={name}
            onChange={setName}
            placeholder="แมวน้ำ"
          />
        </div>
        <div className="flex flex-col mt-4">
          <div className="text-2xl">sku*</div>
          <Input
            type="text"
            value={sku}
            onChange={setSku}
            placeholder="sku-01"
          />
        </div>
        <div className="flex flex-col mt-4">
          <div className="text-2xl">ราคา*</div>
          <Input
            type="number"
            inputMode="numeric"
            value={price}
            onChange={(value) => {
              const raw = String(value ?? "");
              if (raw === "") {
                setPrice(0);
                return;
              }
              const trimmed = raw.replace(/^0+(?=\d)/, "");
              setPrice(Number(trimmed));
            }}
            placeholder="499.99"
          />
        </div>
        <div className="mt-10 flex justify-end">
          <Button
            disabled={
              name === "" ||
              sku === "" ||
              price < 0 ||
              imageUrl === null ||
              imageUrl === ""
            }
            text="บันทึก"
            className="px-4 w-full"
            icon={<img src="/icon-bearhouse-1.png" alt="icon" />}
            onClick={onUpdateProduct}
          />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-md mt-5">
        <div className="flex items-center justify-between">
          <div className="text-2xl">สาขาที่มีสินค้า</div>
          <Button
            text={
              <span className="flex gap-2 items-center">
                <IconPlus size={18} /> เพิ่มสินค้าเข้าคลัง
              </span>
            }
            className="px-4 w-fit"
            onClick={() => setIsAddInventoryModalOpen(true)}
          />
        </div>
        <div className="mt-4">
          {inventoryWithStore.length === 0 ? (
            <div className="text-center mt-10 text-xl text-gray-600">
              ไม่พบสาขาที่มีสินค้านี้
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 cursor-pointer">
              {inventoryWithStore.map(({ inv, store }) => {
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
