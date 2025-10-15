/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useHelperContext } from "@/components/providers/helper-provider";
import { isErrorResponse, Store } from "@/types/request";
import { IconPlus, IconSearch, IconTruckDelivery } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Page() {
  const { backendClient, setFullLoading, router } = useHelperContext()();
  const [stores, setStore] = useState<Store[]>([]);
  const [searchText, setSearchText] = useState("");
  const [nextCursor, setNextCursor] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "true" | "false">(
    "true",
  );
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const s = (searchParams.get("status") ?? "true") as
      | "all"
      | "true"
      | "false";
    const validStatus = ["all", "true", "false"].includes(s)
      ? (s as "all" | "true" | "false")
      : "true";

    setSearchText(q);
    setStatusFilter(validStatus);
    setNextCursor("");
    void fetchStore(false, "", validStatus, q);
  }, []);

  const fetchStore = async (
    append = false,
    cursor = nextCursor,
    canBeSold: "all" | "true" | "false" = statusFilter,
    query = searchText,
  ) => {
    if (!append) setFullLoading(true);
    const response = await backendClient.listStore(
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
      setStore((prev) => [...prev, ...response.data]);
    } else {
      setStore(response.data);
    }
    setNextCursor(response.next_cursor);
  };

  const onSearch = async () => {
    setNextCursor("");
    const params = new URLSearchParams();
    if (searchText) params.set("q", searchText);
    params.set("status", statusFilter);
    router.replace(`/admin/branch?${params.toString()}`);
    await fetchStore(false, "", statusFilter, searchText);
  };

  const onChangeFilter = async (value: "all" | "true" | "false") => {
    if (value === statusFilter) return;
    setStatusFilter(value);
    setNextCursor("");
    const params = new URLSearchParams();
    if (searchText) params.set("q", searchText);
    params.set("status", value);
    router.replace(`/admin/branch?${params.toString()}`);
    await fetchStore(false, "", value, searchText);
  };

  const onLoadMore = async () => {
    if (!nextCursor) return;
    setIsLoadingMore(true);
    await fetchStore(true, nextCursor);
    setIsLoadingMore(false);
  };

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-start">
        <div className="text-4xl mt-1.5">คลังสินค้า</div>
        <Button
          text={
            <span className="flex gap-1">
              <IconPlus /> เพิ่มคลังสินค้า
            </span>
          }
          className="w-fit px-4 my-2 mb-6"
          onClick={() => {
            window.location.href = "/admin/branch/add";
          }}
        />
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="ค้นหารายการด้วย ชื่อ, รหัสคลัง"
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
          เปิดใช้งาน
        </div>
        <div
          className={`px-3 text-xl py-1.5 rounded-2xl border-2 cursor-pointer select-none ${
            statusFilter === "false"
              ? "bg-text-primary text-white border-text-primary"
              : "bg-transparent text-text-primary border-text-primary"
          }`}
          onClick={() => onChangeFilter("false")}
        >
          ยังไม่เปิดใช้งาน
        </div>
      </div>

      <div className="mt-6">
        {stores.length === 0 ? (
          <div className="text-center mt-54 text-xl text-gray-600">
            ไม่พบรายการคลังสินค้า
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 cursor-pointer">
            {stores.map((store) => (
              <div
                onClick={() => {
                  setFullLoading(true);
                  window.location.href = `branch/${store.id}`;
                }}
                key={store.id}
                className="border-2 border-text-primary rounded-xl p-4 bg-white flex gap-4 items-center"
              >
                <div className="flex justify-between items-center w-full">
                  <div className="text-xl">
                    <IconTruckDelivery size={28} />
                    {store.name}{" "}
                    <span className="text-gray-400">({store.store_id})</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <div
                      className={`text-md px-2 py-1 rounded-lg ${
                        store.is_active
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      {store.is_active ? "เปิดใช้งาน" : "ยังไม่เปิดใช้งาน"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {nextCursor && stores.length > 0 && (
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
