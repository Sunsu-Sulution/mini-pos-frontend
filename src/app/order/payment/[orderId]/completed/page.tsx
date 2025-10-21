/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import { useHelperContext } from "@/components/providers/helper-provider";
import {
  Charge,
  isErrorResponse,
  SaleOrder,
  SaleOrderLine,
} from "@/types/request";
import {
  IconCircleCheckFilled,
  IconEye,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import React, { use, useEffect, useRef, useState } from "react";
import { removeItem, setItem } from "@/lib/storage";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export default function Page({ params }: PageProps) {
  const { orderId } = use(params);
  const { backendClient, setFullLoading } = useHelperContext()();

  const [saleOrder, setSaleOrder] = useState<SaleOrder>();
  const [charge, setCharge] = useState<Charge>();
  const [saleOrderLine, setSaleOrderLine] = useState<SaleOrderLine[]>();

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchSaleOrder();
  }, []);

  const fetchSaleOrder = async () => {
    setFullLoading(true);
    const response = await backendClient.getSaleOrderById(orderId);
    if (isErrorResponse(response)) {
      return;
    }
    setSaleOrder(response.sale_order);
    setCharge(response.charge);
    setSaleOrderLine(response.sale_order_line);
    setFullLoading(false);
  };

  const handlePreviewReceipt = () => {
    window.open(
      `${process.env.NEXT_PUBLIC_BACKEND_PATH}/sale-order/${orderId}/receipt`,
    );
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    setUploadedFiles((prev) => [...prev, ...newFiles]);
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

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadDocuments = async () => {
    if (uploadedFiles.length === 0) return;

    setFullLoading(true);
    try {
      const uploadPromises = uploadedFiles.map((file) =>
        backendClient.uploadDocumentFile(
          file,
          "sale-order",
          orderId,
          "sale-attachment",
        ),
      );

      const responses = await Promise.all(uploadPromises);
      const hasError = responses.some((response) => isErrorResponse(response));
      if (hasError) {
        setFullLoading(false);
        return;
      }

      setFullLoading(false);
    } catch {
      setFullLoading(false);
    }
  };

  return (
    <div className="px-1 pt-4">
      <div className="bg-white p-8 m-8 mt-0 rounded-2xl flex flex-col justify-center items-center gap-5 shadow-md">
        <IconCircleCheckFilled size={100} className="text-green-500" />
        <div className="text-4xl">การชำระเงินสำเร็จ</div>
        <div className="w-full">
          <div className="text-white text-2xl text-center bg-text-primary px-6">
            No. {saleOrder?.number}
          </div>
        </div>
        <div className="w-full text-xl text-gray-500">
          <div>
            <span className="mt-4 text-text-primary">Transaction</span>{" "}
            {charge?.id || "credit card"}
          </div>

          <div>
            <span className="mt-4 text-text-primary">เวลา</span>{" "}
            {saleOrder?.created_at}
          </div>

          {saleOrder?.customer_phone && (
            <div>
              <span className="mt-4 text-text-primary">เบอร์สมาชิก</span>{" "}
              {saleOrder.customer_phone}
            </div>
          )}

          {saleOrder?.customer_email && (
            <div>
              <span className="mt-4 text-text-primary">อีเมล</span>{" "}
              {saleOrder.customer_email}
            </div>
          )}

          <div className="mt-4 text-text-primary">รายการ</div>

          {(saleOrderLine || []).map((item, index) => (
            <div className="w-full flex gap-3 justify-between" key={item.id}>
              <div>
                {index + 1}. {item.product_name}
              </div>
              <div className="text-xl truncate">
                {item.unit_price.toLocaleString()}-. x {item.quantity}
              </div>
            </div>
          ))}

          <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

          <div className="flex justify-between">
            <span className="text-text-primary">รวมทั้งสิ้น</span>{" "}
            {saleOrder?.total_amount.toLocaleString()} บาท
          </div>
        </div>
      </div>

      <div className="bg-white p-8 m-8 rounded-2xl shadow-md">
        <div className="text-2xl mb-4 text-center">อัพโหลดเอกสารเพิ่มเติม</div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={onPickFile}
        >
          <IconUpload size={48} className="mx-auto mb-4 text-gray-400" />
          <div className="text-lg text-gray-600 mb-2">
            คลิกเพื่ออัพโหลดเอกสารเพิ่มเติม
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={onFileChange}
          className="hidden"
        />

        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <div className="text-lg mb-3">ไฟล์ที่เลือก:</div>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex items-center">
                    <IconUpload size={20} className="mr-3 text-gray-500" />
                    <span className="text-xl">{file.name}</span>
                    <span className="text-md text-gray-500 ml-2">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500"
                  >
                    <IconX size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mb-30 bg-white p-8 py-3 m-8 rounded-2xl shadow-md">
        <Button
          text={
            <>
              <IconEye size={20} className="mr-2" /> Preview ใบเสร็จรับเงิน
            </>
          }
          onClick={handlePreviewReceipt}
          className="px-4"
        />
      </div>

      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white px-4 pt-9 pb-6 shadow-md rounded-t-3xl select-none w-[100vw] md:w-[600px]">
        <Button
          className={`w-full ${
            uploadedFiles.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={async () => {
            if (uploadedFiles.length === 0) return;
            await uploadDocuments();
            removeItem("process_upload_sale_order");
            window.location.href = "/main";
          }}
          text={
            uploadedFiles.length === 0
              ? "กรุณาอัพโหลดเอกสารอย่างน้อย 1 ไฟล์"
              : "อัพโหลดเอกสารเพิิ่มเติม"
          }
          icon={<img src="/icon-bearhouse-2.png" alt="icon" />}
          disabled={uploadedFiles.length === 0}
        />
      </div>
    </div>
  );
}
