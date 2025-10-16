/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import Input from "@/components/Input";
import { useHelperContext } from "@/components/providers/helper-provider";
import { Inventory, isErrorResponse, Product } from "@/types/request";
import { IconSearch } from "@tabler/icons-react";
import React, { useEffect, useMemo, useState } from "react";

export default function Page() {
  const { backendClient, setFullLoading, userData, setAlert } =
    useHelperContext()();
  const [products, setProducts] = useState<Product[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [searchText, setSearchText] = useState("");
  const productIdToQuantity = useMemo(() => {
    const map = new Map<string, number>();
    inventories.forEach((inv) => {
      const current = map.get(inv.product_id) ?? 0;
      map.set(inv.product_id, current + inv.quantity - inv.reserve);
    });
    return map;
  }, [inventories]);

  const filteredProducts = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (keyword === "") return products;
    return products.filter((product) => {
      const name = product.name?.toLowerCase() ?? "";
      const sku = product.sku?.toLowerCase() ?? "";
      return name.includes(keyword) || sku.includes(keyword);
    });
  }, [products, searchText]);

  useEffect(() => {
    fetchProducts();
  }, [userData.store_id]);

  const fetchProducts = async () => {
    if (!userData.store_id) {
      return;
    }
    setFullLoading(true);
    const inventories = await backendClient.getInventoryByStoreId(
      userData.store_id,
    );
    if (!isErrorResponse(inventories)) {
      setInventories(inventories);
    }

    const products = await backendClient.listProduct(9999, "", "true", "");
    if (!isErrorResponse(products)) {
      setProducts(products.data);
    }
    setFullLoading(false);
  };

  const onLogout = async () => {
    setAlert(
      "ยืนยัน",
      "คุณต้องการออกจากระบบใช่หรือไม่",
      () => {
        backendClient.onLogout();
      },
      true,
    );
  };

  return (
    <div className="px-4 py-6">
      <div className="bg-white py-5 px-8 text-xl rounded-xl shadow-md mb-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <img src="/logo.png" alt="logo" className="h-10" />
          <div className="flex flex-col">
            <div>ยินตีต้อนรับ {userData.name}</div>
            <div>username: {userData.username}</div>
          </div>
        </div>
        <div
          className="text-sm text-gray-500 underline cursor-pointer"
          onClick={onLogout}
        >
          ออกจากระบบ
        </div>
      </div>
      <div className="text-4xl mb-4">สินค้าทั้งหมด</div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="ค้นหารายการสินค้าด้วย sku, ชื่อสินค้า"
          className="w-full"
          type="text"
          icon={<IconSearch />}
          value={searchText}
          onChange={setSearchText}
        />
      </div>

      <div className="flex flex-col gap-4">
        {filteredProducts
          .filter((product) => (productIdToQuantity.get(product.id) ?? 0) > 0)
          .map((product) => {
            const available = productIdToQuantity.get(product.id) ?? 0;
            return (
              <a
                href={`/order/${product.id}`}
                key={product.id}
                className="flex bg-white px-3 py-3 rounded-xl shadow-md justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="rounded-xl w-30"
                  />
                  <div className="">
                    <div className="text-2xl">{product.name}</div>
                    <div className="text-xl">
                      ราคา {product.price.toLocaleString()} บาท
                    </div>
                  </div>
                </div>
                <div className="text-xl text-gray-500">
                  คงเหลือ {available.toLocaleString()}
                </div>
              </a>
            );
          })}
      </div>
    </div>
  );
}
