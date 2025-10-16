/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import { useHelperContext } from "@/components/providers/helper-provider";
import { Inventory, isErrorResponse, Product } from "@/types/request";
import React, { use, useEffect, useState, useCallback } from "react";

type PageProps = {
  params: Promise<{ productId: string }>;
};

export default function OrderPage({ params }: PageProps) {
  const { productId } = use(params);
  const { setFullLoading, backendClient, userData } = useHelperContext()();

  const [inventory, setInventory] = useState<Inventory>();
  const [product, setProduct] = useState<Product>();
  const [quantity, setQuantity] = useState(1);

  const fetchProduct = useCallback(async () => {
    if (!userData.store_id) {
      return;
    }
    setFullLoading(true);
    const inventories = await backendClient.getInventoryByStoreId(
      userData.store_id,
    );
    if (!isErrorResponse(inventories)) {
      setInventory(
        inventories.find((inventory) => inventory.product_id === productId),
      );
    }

    const product = await backendClient.getProductById(productId);
    if (!isErrorResponse(product)) {
      setProduct(product);
    }
    setFullLoading(false);
  }, [userData.store_id, productId, backendClient, setFullLoading]);

  useEffect(() => {
    fetchProduct();
  }, [userData.store_id, product?.id, inventory?.id]);

  useEffect(() => {}, [inventory, product]);

  const [isEditing, setIsEditing] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const handleIncrease = () => {
    if (inventory && quantity < inventory.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setQuantity(0);
    } else {
      const numValue = parseInt(value);
      if (
        !isNaN(numValue) &&
        numValue >= 1 &&
        inventory &&
        numValue <= inventory.quantity
      ) {
        setQuantity(numValue);
      }
    }
  };

  const handleQuantityBlur = () => {
    if (quantity === 0) {
      setQuantity(1);
    }
    setIsEditing(false);
  };

  const handleQuantityClick = () => {
    setIsEditing(true);
  };

  const totalPrice = quantity * (product?.price || 0);

  const onCreateDraft = async () => {
    setFullLoading(true);
    const response = await backendClient.createDraftSaleOrder({
      items: [
        {
          product_id: productId,
          quantity: quantity,
        },
      ],
    });
    setFullLoading(false);
    if (isErrorResponse(response)) {
      return;
    }
    window.location.href = `/order/member/${response.id}`;
  };

  return (
    <>
      <div className="px-4 py-6">
        <div className="text-4xl mb-4">ระบุจำนวนสินค้า</div>
        <div className="bg-white px-3 py-3 rounded-3xl shadow-md flex flex-col gap-3">
          <div className="flex gap-3">
            <img
              src={product?.image_url}
              alt={product?.name}
              className="rounded-xl w-24 h-20 object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-3xl truncate">
                {product?.name || "กำลังโหลด..."}
              </div>
              <div className="text-md text-gray-500">
                เหลืออยู่{" "}
                {(
                  (inventory?.quantity || 0) - (inventory?.reserve || 0)
                ).toLocaleString() || "0"}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              onClick={handleDecrease}
              text="-"
              className="w-fit px-4 text-xl"
            />
            {isEditing ? (
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={quantity === 0 ? "" : quantity}
                onChange={handleQuantityChange}
                onBlur={handleQuantityBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (quantity === 0) {
                      setQuantity(1);
                    }
                    setIsEditing(false);
                  }
                }}
                className="text-2xl font-bold w-full text-center border-2 border-blue-500 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                min="1"
                max={inventory?.quantity}
                autoFocus
              />
            ) : (
              <div
                className="text-2xl font-bold w-full text-center cursor-pointer hover:bg-gray-100 rounded-lg py-1"
                onClick={handleQuantityClick}
              >
                {quantity}
              </div>
            )}
            <Button
              onClick={handleIncrease}
              text="+"
              className="w-fit px-4 text-3xl"
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white px-4 pb-6 shadow-md rounded-t-3xl select-none w-[100vw] md:w-[600px]">
        <div
          className="flex justify-between items-center py-7 cursor-pointer"
          onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
        >
          <div className="text-2xl">สรุปคำสั่งซื้อ</div>
          <div
            className={`transform transition-transform duration-200 ${
              isSummaryExpanded ? "rotate-180" : "rotate-0"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            isSummaryExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pt-2 pb-5">
            <div className="flex justify-between">
              <div className="text-xl text-gray-500">ราคาต่อหน่วย</div>
              <div className="text-xl text-gray-500">
                {product?.price?.toLocaleString() || "0"} บาท
              </div>
            </div>
            <div className="flex justify-between">
              <div className="text-xl text-gray-500">จำนวน</div>
              <div className="text-xl text-gray-500">
                {quantity.toLocaleString()} หน่วย
              </div>
            </div>
            <div className="border-t-2 border-dashed border-gray-300 my-4"></div>
            <div className="flex justify-between">
              <div className="text-xl">รวมทั้งสิ้น</div>
              <div className="text-xl">{totalPrice.toLocaleString()} บาท</div>
            </div>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={onCreateDraft}
          text="ยืนยันคำสั่งซื้อ"
          icon={<img src="/icon-bearhouse-1.png" alt="icon" />}
        />
      </div>
    </>
  );
}
