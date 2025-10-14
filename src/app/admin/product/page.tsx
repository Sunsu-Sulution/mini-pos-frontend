/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useHelperContext } from "@/components/providers/helper-provider";
import { isErrorResponse, Product } from "@/types/request";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const { backendClient, setFullLoading, router } = useHelperContext()();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState("");
  const [nextCursor, setNextCursor] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "true" | "false">(
    "all",
  );
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const s = (searchParams.get("status") ?? "all") as "all" | "true" | "false";
    const validStatus = ["all", "true", "false"].includes(s)
      ? (s as "all" | "true" | "false")
      : "all";

    setSearchText(q);
    setStatusFilter(validStatus);
    setNextCursor("");
    void fetchProduct(false, "", validStatus, q);
  }, []);

  const fetchProduct = async (
    append = false,
    cursor = nextCursor,
    canBeSold: "all" | "true" | "false" = statusFilter,
    query = searchText,
  ) => {
    if (!append) setFullLoading(true);
    const response = await backendClient.listProduct(
      10,
      cursor,
      canBeSold,
      query,
    );
    if (!append) setFullLoading(false);
    if (isErrorResponse(response)) {
      return;
    }
    if (append) {
      setProducts((prev) => [...prev, ...response.data]);
    } else {
      setProducts(response.data);
    }
    setNextCursor(response.next_cursor);
  };

  const onSearch = async () => {
    setNextCursor("");
    // Update URL query string
    const params = new URLSearchParams();
    if (searchText) params.set("q", searchText);
    params.set("status", statusFilter);
    router.replace(`/admin/product?${params.toString()}`);
    await fetchProduct(false, "", statusFilter, searchText);
  };

  const onChangeFilter = async (value: "all" | "true" | "false") => {
    if (value === statusFilter) return;
    setStatusFilter(value);
    setNextCursor("");
    // Update URL while preserving current search text
    const params = new URLSearchParams();
    if (searchText) params.set("q", searchText);
    params.set("status", value);
    router.replace(`/admin/product?${params.toString()}`);
    await fetchProduct(false, "", value, searchText);
  };

  const onLoadMore = async () => {
    if (!nextCursor) return;
    setIsLoadingMore(true);
    await fetchProduct(true, nextCursor);
    setIsLoadingMore(false);
  };

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-start">
        <div className="text-4xl mt-1.5">รายการสินค้า</div>
        <Button
          text={
            <span className="flex gap-1">
              <IconPlus /> เพิ่มสินค้า
            </span>
          }
          className="w-fit px-4 my-2 mb-6"
          onClick={() => {
            window.location.href = "/admin/product/add";
          }}
        />
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="ค้นหารายการสินค้าด้วย sku, ชื่อสินค้า"
          className="w-full"
          type="text"
          icon={<IconSearch />}
          value={searchText}
          onChange={setSearchText}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void onSearch();
            }
          }}
        />
        <Button
          text={<span className="text-text-primary">ค้นหา</span>}
          className="w-fit px-4 bg-transparent shadow-none border-text-primary border-2"
          onClick={onSearch}
        />
      </div>
      <div className="flex gap-2 mt-2">
        <div
          className={`px-3 text-xl py-1.5 rounded-2xl border-2 cursor-pointer select-none ${
            statusFilter === "all"
              ? "bg-text-primary text-white border-text-primary"
              : "bg-transparent text-text-primary border-text-primary"
          }`}
          onClick={() => onChangeFilter("all")}
        >
          ทั้งหมด
        </div>
        <div
          className={`px-3 text-xl py-1.5 rounded-2xl border-2 cursor-pointer select-none ${
            statusFilter === "true"
              ? "bg-text-primary text-white border-text-primary"
              : "bg-transparent text-text-primary border-text-primary"
          }`}
          onClick={() => onChangeFilter("true")}
        >
          ขาย
        </div>
        <div
          className={`px-3 text-xl py-1.5 rounded-2xl border-2 cursor-pointer select-none ${
            statusFilter === "false"
              ? "bg-text-primary text-white border-text-primary"
              : "bg-transparent text-text-primary border-text-primary"
          }`}
          onClick={() => onChangeFilter("false")}
        >
          ยังไม่เปิดขาย
        </div>
      </div>
      <div className="mt-6">
        {products.length === 0 ? (
          <div className="text-center mt-54 text-xl text-gray-600">
            ไม่พบรายการสินค้า
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 cursor-pointer">
            {products.map((p) => (
              <div
                onClick={() => {
                  setFullLoading(true);
                  window.location.href = `product/${p.id}`;
                }}
                key={p.id}
                className="border-2 border-text-primary rounded-xl p-4 bg-white flex gap-4 items-center"
              >
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="w-20 h-20 object-cover rounded-lg border-text-primary"
                />
                <div className="flex-1">
                  <div className="text-xl">
                    {p.name} <span className="text-gray-400">({p.sku})</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="text-text-primary text-lg">
                      {p.price.toLocaleString()} บาท
                    </div>
                    <div
                      className={`text-xl px-2 py-1 rounded-lg ${
                        p.can_be_sold
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      {p.can_be_sold ? "ขายได้" : "ยังไม่เปิดขาย"}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    คงเหลือทั้งหมด: {p.stock.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {nextCursor && products.length > 0 && (
          <div className="flex justify-center mt-6">
            <Button
              text={isLoadingMore ? "กำลังโหลด..." : "โหลดเพิ่มเติม"}
              className="w-fit px-6"
              onClick={onLoadMore}
            />
          </div>
        )}
      </div>
    </div>
  );
}
