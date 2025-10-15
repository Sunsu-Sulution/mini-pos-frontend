/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useHelperContext } from "@/components/providers/helper-provider";
import { Inventory, isErrorResponse, Product } from "@/types/request";
import React, { useEffect, useMemo, useState } from "react";

export default function Page() {
  const { backendClient, setFullLoading, userData } = useHelperContext()();
  const [products, setProducts] = useState<Product[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const productIdToQuantity = useMemo(() => {
    const map = new Map<string, number>();
    inventories.forEach((inv) => {
      const current = map.get(inv.product_id) ?? 0;
      map.set(inv.product_id, current + inv.quantity);
    });
    return map;
  }, [inventories]);

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

  return (
    <div className="px-4 py-6">
      <div className="text-4xl mb-4">สินค้าทั้งหมด</div>
      <div className="flex flex-col gap-4">
        {products
          .filter((product) => (productIdToQuantity.get(product.id) ?? 0) > 0)
          .map((product) => {
            const available = productIdToQuantity.get(product.id) ?? 0;
            return (
              <a
                href={`/order/${product.id}`}
                key={product.id}
                className="bg-white px-3 py-3 rounded-3xl shadow-md"
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="rounded-xl"
                />
                <div className="p-2">
                  <div className="text-3xl mt-3">{product.name}</div>
                  <div className="text-xl text-gray-500">
                    เหลืออยู่ {available.toLocaleString()}
                  </div>
                </div>
              </a>
            );
          })}
      </div>
    </div>
  );
}
