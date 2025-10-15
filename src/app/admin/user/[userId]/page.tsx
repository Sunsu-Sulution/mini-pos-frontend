/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useHelperContext } from "@/components/providers/helper-provider";
import { isErrorResponse, Store } from "@/types/request";
import { IconBuildingStore, IconRefresh } from "@tabler/icons-react";
import React, { use, useEffect, useMemo, useState } from "react";

type PageProps = {
  params: Promise<{ userId: string }>;
};

export default function Page({ params }: PageProps) {
  const { userId } = use(params);

  const { backendClient, setFullLoading, setAlert } = useHelperContext()();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [password, setPassword] = useState("");

  const [storeList, setStoreList] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [storeQuery, setStoreQuery] = useState("");
  const [isStoreInputFocused, setIsStoreInputFocused] = useState(false);

  useEffect(() => {
    fetchStore().then(() => {
      fetchUser();
    });
  }, []);

  const fetchUser = async () => {
    setFullLoading(true);
    const response = await backendClient.getUserById(userId);
    if (isErrorResponse(response)) {
      return;
    }
    setFullLoading(false);
    setName(response.name);
    setUsername(response.username);
    setSelectedStoreId(response.store_id);
    setRole((response.role as "admin" | "user") ?? "user");
  };

  const fetchStore = async () => {
    setFullLoading(true);
    const response = await backendClient.listStore(9999, "", "true", "");
    if (isErrorResponse(response)) {
      window.location.href = "/admin/user";
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

  const getStoreName = (storeId: string) => {
    const store = storeList.find((store) => store.id === storeId);
    return store ? `${store.name} (${store.store_id})` : storeId;
  };

  const generateRandomPassword = () => {
    const randomPassword = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    setPassword(randomPassword);
  };

  const onUpdateUser = async () => {
    setFullLoading(true);
    const response = await backendClient.updateUser(userId, {
      username: username,
      name: name,
      password: isChangingPassword ? password : "",
      store_id: selectedStoreId,
      role: role,
    });
    setFullLoading(false);
    if (isErrorResponse(response)) {
      return;
    }
    setAlert(
      "สำเร็จ",
      "อัพเดทข้อมูลผู้ใช้สำเร็จ",
      () => {
        window.location.href = "/admin/user";
      },
      false,
    );
  };

  useEffect(() => {
    if (isStoreInputFocused) return;
    if (!selectedStoreId) return;
    setStoreQuery(getStoreName(selectedStoreId));
  }, [storeList, selectedStoreId, isStoreInputFocused]);

  return (
    <div className="px-4 py-6">
      <div className="text-4xl mb-4">ข้อมูลของ {username}</div>
      <div className="bg-white p-5 rounded-2xl shadow-md">
        <div className="text-2xl mb-3">ข้อมูลผู้ใช้งาน</div>
        <div className="flex flex-col">
          <div className="text-xl">ชื่อ*</div>
          <Input
            type="text"
            value={username}
            onChange={setUsername}
            placeholder="john john"
          />
        </div>
        <div className="flex flex-col mt-4">
          <div className="text-xl">ชื่อผู้ใช้*</div>
          <Input
            type="text"
            value={name}
            onChange={setName}
            placeholder="john"
          />
        </div>
        <div className="flex flex-col mt-4">
          <div className="text-xl">สิทธิ์การใช้งาน</div>
          <select
            className="mt-2 border-2 rounded-xl px-3 py-2 text-xl"
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "user")}
          >
            <option value="user">ผู้ใช้งาน (user)</option>
            <option value="admin">ผู้ดูแล (admin)</option>
          </select>
        </div>
        <div className="flex flex-col mt-8">
          <div className="flex items-center justify-between">
            <div className="text-xl">รหัสผ่าน</div>
            <Button
              text={isChangingPassword ? "ยกเลิก" : "เปลี่ยนรหัสผ่าน"}
              className="w-fit px-4"
              onClick={() => {
                setIsChangingPassword((v) => !v);
                setPassword("");
              }}
            />
          </div>
          {isChangingPassword && (
            <div className="mt-2 flex gap-2">
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
          )}
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
            disabled={
              name === "" ||
              username === "" ||
              (isChangingPassword && password === "")
            }
            text="อัพเดทข้อมูลผู้ใช้"
            className="px-4 w-full"
            icon={<img src="/icon-bearhouse-1.png" alt="icon" />}
            onClick={onUpdateUser}
          />
        </div>
      </div>
    </div>
  );
}
