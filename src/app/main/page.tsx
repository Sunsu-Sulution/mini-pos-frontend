/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import Input from "@/components/Input";
import { useHelperContext } from "@/components/providers/helper-provider";
import { Inventory, isErrorResponse, Product } from "@/types/request";
import { IconGardenCartFilled, IconSearch } from "@tabler/icons-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getItem, setItem, removeItem } from "@/lib/storage";
import Button from "@/components/Button";

export default function Page() {
  const { backendClient, setFullLoading, userData, setAlert } =
    useHelperContext()();
  const [products, setProducts] = useState<Product[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [searchText, setSearchText] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cartCount = useMemo(() => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }, [cart]);
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

  useEffect(() => {
    if (editingProductId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingProductId]);

  useEffect(() => {
    if (!userData.store_id) return;
    const saved = getItem(`cart`);
    if (saved && typeof saved === "object") {
      setCart(saved as Record<string, number>);
    } else {
      setCart({});
    }
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

  const getAvailable = (productId: string) => {
    return productIdToQuantity.get(productId) ?? 0;
  };

  const getQty = (productId: string) => {
    return cart[productId] ?? 0;
  };

  const persistCart = (next: Record<string, number>) => {
    if (!userData.store_id) return;
    setItem(`cart`, next);
  };

  const inc = (productId: string) => {
    setCart((prev) => {
      const next = { ...prev };
      const current = next[productId] ?? 0;
      const available = getAvailable(productId);
      if (current < available) {
        next[productId] = current + 1;
        persistCart(next);
      }
      return next;
    });
  };

  const dec = (productId: string) => {
    setCart((prev) => {
      const next = { ...prev };
      const current = next[productId] ?? 0;
      if (current > 0) {
        const updated = current - 1;
        if (updated === 0) {
          delete next[productId];
        } else {
          next[productId] = updated;
        }
        persistCart(next);
      }
      return next;
    });
  };

  const startEdit = (productId: string, currentQty: number) => {
    setEditingProductId(productId);
    setEditingValue(String(currentQty));
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setEditingValue("");
  };

  const commitEdit = (productId: string, available: number) => {
    const raw = editingValue.trim();
    if (raw === "") {
      cancelEdit();
      return;
    }
    let nextQty = Number.parseInt(raw, 10);
    if (Number.isNaN(nextQty)) nextQty = 0;
    if (nextQty < 0) nextQty = 0;
    if (nextQty > available) nextQty = available;
    setCart((prev) => {
      const next = { ...prev };
      if (nextQty === 0) {
        delete next[productId];
      } else {
        next[productId] = nextQty;
      }
      persistCart(next);
      return next;
    });
    cancelEdit();
  };

  const clearCart = () => {
    if (!userData.store_id) return;
    setAlert(
      "ยืนยัน",
      "ต้องการล้างสินค้าในตะกร้าทั้งหมดใช่หรือไม่",
      () => {
        setCart({});
        removeItem(`cart`);
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
      <div className="flex items-center mb-4 justify-between">
        <div className="text-4xl">สินค้าทั้งหมด</div>
        <a href="/order" className="cursor-pointer mr-4 relative">
          <IconGardenCartFilled size={35} />
          {cartCount > 0 && (
            <div
              className="absolute bottom-0 bg-text-primary text-white text-xs rounded-full flex justify-center items-center"
              style={{ width: 18, height: 18, right: -3 }}
            >
              {cartCount}
            </div>
          )}
        </a>
      </div>
      <div className="flex gap-4 mb-3">
        <Input
          placeholder="ค้นหารายการสินค้าด้วย sku, ชื่อสินค้า"
          className="w-full"
          type="text"
          icon={<IconSearch />}
          value={searchText}
          onChange={setSearchText}
        />
      </div>
      <div
        className="text-gray-500 text-md underline mb-3 cursor-pointer flex justify-end"
        onClick={clearCart}
      >
        ล้างสินค้าในตะกร้า
      </div>
      <div className="flex flex-col gap-4">
        {filteredProducts
          .filter((product) => (productIdToQuantity.get(product.id) ?? 0) > 0)
          .map((product) => {
            const available = productIdToQuantity.get(product.id) ?? 0;
            return (
              <div
                key={product.id}
                className="flex flex-col md:flex-row bg-white px-3 py-3 rounded-xl shadow-md justify-between"
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

                <div className="flex flex-col items-end">
                  <div
                    className="text-xl text-gray-500 w-full"
                    style={{ textAlign: "end", paddingRight: 5 }}
                  >
                    คงเหลือ {available.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between md:justify-start gap-4">
                    <Button
                      className="px-4"
                      text="-"
                      onClick={() => dec(product.id)}
                      disabled={getQty(product.id) === 0}
                    />
                    {editingProductId === product.id ? (
                      <input
                        ref={inputRef}
                        className="min-w-16 w-16 text-center text-xl border rounded-md py-1"
                        type="number"
                        min={0}
                        max={available}
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => commitEdit(product.id, available)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            commitEdit(product.id, available);
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                    ) : (
                      <div
                        className="min-w-8 text-center text-xl cursor-pointer select-none"
                        title="แก้ไขจำนวน"
                        onClick={() =>
                          startEdit(product.id, getQty(product.id))
                        }
                      >
                        {getQty(product.id)}
                      </div>
                    )}
                    <Button
                      className="px-4"
                      text="+"
                      onClick={() => inc(product.id)}
                      disabled={getQty(product.id) >= available}
                    />
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
