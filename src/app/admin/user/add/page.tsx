/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useHelperContext } from "@/components/providers/helper-provider";
import { isErrorResponse, Store } from "@/types/request";
import { IconBuildingStore, IconRefresh } from "@tabler/icons-react";
import React, { useEffect, useMemo, useState } from "react";

export default function Page() {
  const { backendClient, setFullLoading, setAlert } = useHelperContext()();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [storeList, setStoreList] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [storeQuery, setStoreQuery] = useState("");
  const [isStoreInputFocused, setIsStoreInputFocused] = useState(false);

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {
    setFullLoading(true);
    const response = await backendClient.listStore(9999, "", "true", "");
    if (isErrorResponse(response)) {
      window.location.href = `/admin/user`;
      return;
    }
    setFullLoading(false);
    setStoreList(response.data);
  };

  const filteredStores = useMemo(() => {
    const keyword = storeQuery.trim().toLowerCase();
    if (keyword === "") return storeList;
    return storeList.filter((s) => {
      const name = s.name?.toLowerCase() ?? "";
      const code = s.store_id?.toLowerCase() ?? "";
      return name.includes(keyword) || code.includes(keyword);
    });
  }, [storeList, storeQuery]);

  const generateRandomPassword = () => {
    const randomPassword = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    setPassword(randomPassword);
  };

  const onRegister = async () => {
    setFullLoading(true);
    const response = await backendClient.register({
      username: username,
      name: name,
      password: password,
      store_id: selectedStoreId,
    });
    setFullLoading(false);
    if (isErrorResponse(response)) {
      return;
    }

    setAlert(
      "สำเร็จ",
      "เพิ่มผู้ใช้งานเรียบร้อยแล้ว",
      () => {
        window.location.href = `/admin/user/${response.user.id}`;
      },
      false,
    );
  };

  return (
    <div className="px-4 py-6">
      <div className="text-4xl mb-4">เพิ่มผู้ใช้งานใหม่</div>
      <div className="bg-white p-5 rounded-2xl shadow-md">
        <div className="text-2xl mb-3">ข้อมูลผู้ใช้งาน</div>
        <div className="flex flex-col">
          <div className="text-xl">ชื่อผู้ใช้งาน*</div>
          <Input
            type="text"
            value={name}
            onChange={setName}
            placeholder="john"
          />
        </div>
        <div className="flex flex-col mt-4">
          <div className="text-xl">ชื่อ*</div>
          <Input
            type="text"
            value={username}
            onChange={setUsername}
            placeholder="john john"
          />
        </div>
        <div className="flex flex-col mt-4">
          <div className="text-xl">รหัสผ่าน*</div>
          <div className="flex gap-2">
            <Input
              type="text"
              value={password}
              onChange={setPassword}
              placeholder="********"
              className="flex-1"
            />
            <Button
              text={
                <span className="flex gap-1 text-md">
                  <IconRefresh /> สุ่มรหัสผ่าน
                </span>
              }
              className="w-fit px-4"
              onClick={generateRandomPassword}
            />
          </div>
        </div>
        <div className="flex flex-col mt-4">
          <div className="text-xl">สาขาที่ดูแล</div>
          <div className="relative w-full">
            <Input
              type="text"
              value={storeQuery}
              onChange={(v) => {
                setStoreQuery(v);
                setSelectedStoreId("");
              }}
              icon={<IconBuildingStore />}
              placeholder="เลือกสาขาที่ดูแล โดยชื่อสาขาหรือ Store ID"
              onFocus={() => {
                setStoreQuery("");
                setSelectedStoreId("");
                setIsStoreInputFocused(true);
              }}
              onBlur={() => setIsStoreInputFocused(false)}
            />
            {isStoreInputFocused && (
              <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto border-2 rounded-xl bg-white">
                {filteredStores.length === 0 ? (
                  <div className="p-3 text-gray-500">ไม่พบสาขา</div>
                ) : (
                  filteredStores.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 hover:bg-gray-100 cursor-pointer flex items-center justify-between border-b-2 border-gray-300"
                      onMouseDown={() => {
                        setSelectedStoreId(s.id);
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
        <div className="mt-10 flex justify-end">
          <Button
            disabled={name === "" || username === "" || password === ""}
            text="เพิ่มผู้ใช้งาน"
            className="px-4 w-full"
            icon={<img src="/icon-bearhouse-1.png" alt="icon" />}
            onClick={onRegister}
          />
        </div>
      </div>
    </div>
  );
}
