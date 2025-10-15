/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useHelperContext } from "@/components/providers/helper-provider";
import { isErrorResponse, Store, User } from "@/types/request";
import { IconPlus, IconSearch, IconUser } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const { backendClient, setFullLoading, router } = useHelperContext()();
  const [searchText, setSearchText] = useState("");
  const [nextCursor, setNextCursor] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const searchParams = useSearchParams();

  const [userList, setUserList] = useState<User[]>([]);
  const [storeList, setStoreList] = useState<Store[]>([]);

  useEffect(() => {
    setFullLoading(false);
    const q = searchParams.get("q") ?? "";
    setSearchText(q);
    setNextCursor("");
    fetchStoreList();
    void fetchUser(false, "", q);
  }, []);

  const fetchUser = async (
    append = false,
    cursor = nextCursor,
    query = searchText,
  ) => {
    if (!append) setFullLoading(true);
    const response = await backendClient.listUser(10, cursor, query);
    if (!append) setFullLoading(false);
    if (isErrorResponse(response)) {
      return;
    }
    if (append) {
      setUserList((prev) => [...prev, ...(response.data ?? [])]);
    } else {
      setUserList(response.data ?? []);
    }
    setNextCursor(response.next_cursor);
  };

  const onSearch = async () => {
    setNextCursor("");
    const params = new URLSearchParams();
    if (searchText) params.set("q", searchText);
    router.replace(`/admin/user?${params.toString()}`);
    await fetchUser(false, "", searchText);
  };

  const onLoadMore = async () => {
    if (!nextCursor) return;
    setIsLoadingMore(true);
    await fetchUser(true, nextCursor);
    setIsLoadingMore(false);
  };

  const fetchStoreList = async () => {
    setFullLoading(true);
    const response = await backendClient.listStore(9999, "", "true", "");
    setFullLoading(false);
    if (isErrorResponse(response)) {
      window.location.href = "/admin/branch";
      return;
    }
    setStoreList(response.data);
  };

  const getStoreName = (storeId: string) => {
    const store = storeList.find((store) => store.id === storeId);
    return store ? `${store.name} (${store.store_id})` : storeId;
  };

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-start">
        <div className="text-4xl mt-1.5">ผู้ใช้งาน</div>
        <Button
          text={
            <span className="flex gap-1">
              <IconPlus /> เพิ่มผู้ใช้งาน
            </span>
          }
          className="w-fit px-4 my-2 mb-6"
          onClick={() => {
            window.location.href = "/admin/user/add";
          }}
        />
      </div>
      <div className="flex gap-4">
        <Input
          placeholder="ค้นหาด้วยชื่อ, ชื่อผู้ใช้"
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
      <div className="mt-6">
        {userList.length === 0 ? (
          <div className="text-center mt-54 text-xl text-gray-600">
            ไม่พบรายการผู้ใช้งาน
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 cursor-pointer">
            {userList.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  window.location.href = `/admin/user/${user.id}`;
                }}
                className="border-2 border-text-primary rounded-xl p-4 bg-white flex gap-4 items-center"
              >
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-3">
                    <IconUser size={28} className="text-text-primary" />
                    <div>
                      <div className="text-xl">
                        {user.name}{" "}
                        <span className="text-gray-400">({user.username})</span>
                      </div>
                      {user.store_id !== "" && (
                        <div className="text-md text-gray-500 mt-1">
                          คลัง: {getStoreName(user.store_id)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <div
                      className={`text-md px-2 py-1 rounded-lg ${
                        user.role === "admin"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      {user.role === "admin" ? "ผู้ดูแล" : "ผู้ใช้งาน"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {nextCursor && userList?.length > 0 && (
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
