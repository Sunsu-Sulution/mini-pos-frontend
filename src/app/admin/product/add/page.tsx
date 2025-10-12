/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useHelperContext } from "@/components/providers/helper-provider";
import { isErrorResponse } from "@/types/request";
import { IconSquareRoundedXFilled } from "@tabler/icons-react";
import React, { useRef, useState } from "react";

export default function Page() {
  const { setFullLoading, backendClient, setAlert } = useHelperContext()();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState(0);
  const [canBeSold, setCanBeSold] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const uploadImage = async (file: File) => {
    setFullLoading(true);
    const response = await backendClient.uploadFile(file, "product");
    setFullLoading(false);
    if (isErrorResponse(response)) {
      return;
    }

    setImageUrl(response.url);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    uploadImage(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const onPickFile = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const onDeleteImage = () => {
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onAddProduct = async () => {
    setFullLoading(true);
    const response = await backendClient.addProduct({
      sku: sku,
      name: name,
      price: price,
      can_be_sold: canBeSold,
      image_url: imageUrl ?? "",
    });
    setFullLoading(false);
    if (isErrorResponse(response)) {
      return;
    }
    setAlert(
      "สำเร็จ",
      `เพิ่มสินค้า ${name}(${sku}) เรียบร้อยแล้ว`,
      () => {
        window.location.href = `/admin/product`;
      },
      false,
    );
  };

  return (
    <div className="px-4 py-6">
      <div className="text-4xl mb-4">เพิ่มรายการสินค้าใหม่</div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="requestTaxInvoice"
          name="taxInvoice"
          checked={canBeSold}
          onChange={(e) => setCanBeSold(e.target.checked)}
          className="w-5 h-5 text-text-primary border-2"
        />
        <label htmlFor="requestTaxInvoice" className="text-2xl cursor-pointer">
          เปิดขาย
        </label>
      </div>
      <div className="mt-4">
        <div className="text-2xl">รูปสินค้า*</div>
        <div className="relative">
          <div
            className={`w-50 h-30 border-2 rounded-md flex items-center justify-center text-center cursor-pointer transition-colors border-dashed ${
              isDragActive
                ? "bg-gray-100"
                : `border-text-primary ${
                    imageUrl === null || imageUrl === ""
                      ? "bg-white"
                      : "bg-transparent"
                  }`
            }`}
            onClick={onPickFile}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            role="button"
            aria-label="อัพโหลดรูปสินค้า"
            tabIndex={0}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="ตัวอย่างรูปสินค้า"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="px-4 text-text-primary text-xl opacity-50">
                ลากและวางรูปภาพที่นี่ หรือคลิกเพื่อเลือกไฟล์
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
          </div>
          {imageUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteImage();
              }}
              className="absolute -top-2 left-47 w-6 h-6 bg-white text-text-primary rounded-lg flex items-center justify-center"
              aria-label="ลบรูปภาพ"
            >
              <IconSquareRoundedXFilled />
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col mt-4">
        <div className="text-2xl">ชื่อสินค้า*</div>
        <Input
          type="text"
          value={name}
          onChange={setName}
          placeholder="แมวน้ำ"
        />
      </div>
      <div className="flex flex-col mt-4">
        <div className="text-2xl">sku*</div>
        <Input type="text" value={sku} onChange={setSku} placeholder="sku-01" />
      </div>
      <div className="flex flex-col mt-4">
        <div className="text-2xl">ราคา*</div>
        <Input
          type="number"
          inputMode="numeric"
          value={price}
          onChange={(value) => {
            const raw = String(value ?? "");
            if (raw === "") {
              setPrice(0);
              return;
            }
            const trimmed = raw.replace(/^0+(?=\d)/, "");
            setPrice(Number(trimmed));
          }}
          placeholder="499.99"
        />
      </div>
      <div className="mt-10 flex justify-end">
        <Button
          disabled={
            name === "" ||
            sku === "" ||
            price < 0 ||
            imageUrl === "" ||
            imageUrl === null
          }
          text="เพิ่มสินค้า"
          className="px-4 w-full"
          icon={<img src="/icon-bearhouse-1.png" alt="icon" />}
          onClick={onAddProduct}
        />
      </div>
    </div>
  );
}
