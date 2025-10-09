/* eslint-disable @next/next/no-img-element */
import React from "react";

const mockProducts = [
  {
    id: "mock-order-1",
    name: "บัตร Bearhouse สีแดง",
    unit: "ใบ",
    price: 490,
    available: 2452,
    image: "/demo/product-1.jpeg",
  },
];
export default function Page() {
  return (
    <div className="px-4 py-6">
      <div className="text-4xl mb-4">สินค้าทั้งหมด</div>
      <div className="flex flex-col gap-4">
        {mockProducts.map((product) => (
          <a
            href={`/order/${product.id}`}
            key={product.id}
            className="bg-white px-3 py-3 rounded-3xl shadow-md"
          >
            <img src={product.image} alt={product.name} className="rounded-xl" />
            <div className="p-2">
              <div className="text-3xl mt-3">{product.name}</div>
              <div className="text-xl text-gray-500">
                เหลืออยู่ {product.available.toLocaleString()} {product.unit}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
