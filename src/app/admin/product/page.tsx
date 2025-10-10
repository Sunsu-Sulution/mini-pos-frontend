"use client";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { IconSearch } from "@tabler/icons-react";
import React, { useState } from "react";

export default function Page() {
  const [searchText, setSearchText] = useState("");
  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-5">
        <div className="text-4xl mb-4">รายการสินค้า</div>
        <Button
          text="เพิ่มสินค้าใหม่"
          className="w-fit px-4"
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
        />
        <Button
          disabled={searchText === ""}
          text="ค้นหา"
          className="w-fit px-4"
          onClick={() => {}}
        />
      </div>
    </div>
  );
}
