/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import { useHelperContext } from "@/components/providers/helper-provider";
import { Inventory, isErrorResponse, Product } from "@/types/request";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getItem, setItem } from "@/lib/storage";
import { useRouter } from "next/navigation";

export default function OrderPage() {
  const { setFullLoading, backendClient, userData } = useHelperContext()();

  const [products, setProducts] = useState<Product[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);
  const router = useRouter();
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!userData.store_id) return;
    const saved = getItem(`cart:${userData.store_id}`);
    if (saved && typeof saved === "object") {
      setCart(saved as Record<string, number>);
    } else {
      setCart({});
    }
    setHasLoadedCart(true);
  }, [userData.store_id]);

  useEffect(() => {
    if (!hasLoadedCart) return;
    if (Object.keys(cart).length === 0) {
      router.replace("/main");
    }
  }, [hasLoadedCart, cart, router]);

  useEffect(() => {
    if (editingProductId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingProductId]);

  useEffect(() => {
    const fetchAll = async () => {
      if (!userData.store_id) return;
      setFullLoading(true);
      const invs = await backendClient.getInventoryByStoreId(userData.store_id);
      if (!isErrorResponse(invs)) {
        setInventories(invs);
      }
      const prods = await backendClient.listProduct(9999, "", "true", "");
      if (!isErrorResponse(prods)) {
        setProducts(prods.data);
      }
      setFullLoading(false);
    };
    fetchAll();
  }, [userData.store_id]);

  const cartProducts = useMemo(() => {
    const ids = new Set(Object.keys(cart));
    return products.filter((p) => ids.has(p.id));
  }, [products, cart]);

  const productIdToAvailable = useMemo(() => {
    const map = new Map<string, number>();
    inventories.forEach((inv) => {
      const current = map.get(inv.product_id) ?? 0;
      map.set(inv.product_id, current + inv.quantity - inv.reserve);
    });
    return map;
  }, [inventories]);

  const totalPrice = useMemo(() => {
    return cartProducts.reduce((sum, p) => {
      const qty = cart[p.id] ?? 0;
      return sum + p.price * qty;
    }, 0);
  }, [cartProducts, cart]);

  const getAvailable = (productId: string) => {
    return productIdToAvailable.get(productId) ?? 0;
  };

  const getQty = (productId: string) => {
    return cart[productId] ?? 0;
  };

  const persistCart = (next: Record<string, number>) => {
    if (!userData.store_id) return;
    setItem(`cart:${userData.store_id}`, next);
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

  const onCreateDraft = async () => {
    const items = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([product_id, quantity]) => ({ product_id, quantity }));
    if (items.length === 0) return;

    setFullLoading(true);
    const response = await backendClient.createDraftSaleOrder({ items });
    setFullLoading(false);
    if (isErrorResponse(response)) {
      return;
    }
    window.location.href = `/order/member/${response.id}`;
  };

  return (
    <>
      <div className="px-4 py-6">
        <div className="text-4xl mb-4">ตะกร้าของฉัน</div>
        <div className="flex flex-col gap-3">
          {cartProducts.length === 0 ? (
            <div className="text-gray-500">ไม่มีสินค้าในตะกร้า</div>
          ) : (
            cartProducts.map((p) => {
              const available = getAvailable(p.id);
              const qty = getQty(p.id);
              return (
                <div
                  key={p.id}
                  className="flex bg-white px-3 py-3 rounded-xl shadow-md justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="rounded-xl w-24 h-20 object-cover flex-shrink-0"
                    />
                    <div className="">
                      <div className="text-2xl">{p.name}</div>
                      <div className="text-xl">
                        ราคา {p.price.toLocaleString()} บาท
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end ml-auto text-right">
                    <div
                      className="text-xl text-gray-500 w-full"
                      style={{ textAlign: "end", paddingRight: 5 }}
                    >
                      คงเหลือ {available.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        className="px-4"
                        text="-"
                        onClick={() => dec(p.id)}
                        disabled={qty === 0}
                      />
                      {editingProductId === p.id ? (
                        <input
                          ref={inputRef}
                          className="min-w-16 w-16 text-center text-xl border rounded-md py-1"
                          type="number"
                          inputMode="decimal"
                          min={0}
                          max={available}
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => commitEdit(p.id, available)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitEdit(p.id, available);
                            if (e.key === "Escape") cancelEdit();
                          }}
                        />
                      ) : (
                        <div
                          className="min-w-8 text-center text-xl cursor-pointer select-none"
                          title="แก้ไขจำนวน"
                          onClick={() => startEdit(p.id, qty)}
                        >
                          {qty}
                        </div>
                      )}
                      <Button
                        className="px-4"
                        text="+"
                        onClick={() => inc(p.id)}
                        disabled={qty >= available}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
              <div className="text-xl text-gray-500">จำนวนสินค้า</div>
              <div className="text-xl text-gray-500">
                {cartProducts
                  .reduce((sum, p) => sum + (cart[p.id] ?? 0), 0)
                  .toLocaleString()}{" "}
                ชิ้น
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
