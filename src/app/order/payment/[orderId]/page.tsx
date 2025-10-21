/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import Button from "@/components/Button";
import { useHelperContext } from "@/components/providers/helper-provider";
import { removeItem, setItem } from "@/lib/storage";
import { Charge, isErrorResponse, SaleOrder } from "@/types/request";
import React, { useState, useEffect, use, useRef } from "react";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export default function Page({ params }: PageProps) {
  const { orderId } = use(params);
  const { setFullLoading, backendClient, setAlert } = useHelperContext()();
  const [timeLeft, setTimeLeft] = useState(0);
  const [saleOrder, setSaleOrder] = useState<SaleOrder>();
  const [charge, setCharge] = useState<Charge>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (saleOrder?.payment_type === "credit_card") return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [saleOrder?.payment_type]);

  useEffect(() => {
    fetchSaleOrder();
  }, []);

  useEffect(() => {
    if (saleOrder?.payment_type === "credit_card") return;

    const interval = setInterval(async () => {
      try {
        await checkOmiseStatus();
      } catch (error) {
        console.error("Error checking Omise status:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [charge?.id, saleOrder?.payment_type]);

  const fetchSaleOrder = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setFullLoading(true);
    }

    try {
      const response = await backendClient.getSaleOrderById(orderId);
      if (isErrorResponse(response)) {
        if (isManualRefresh) {
          setIsRefreshing(false);
        } else {
          setFullLoading(false);
        }
        return;
      }

      if (response.charge.status === "successful") {
        removeItem("cart");
        removeItem("process_sale_order");
        setItem("process_upload_sale_order", orderId);
        window.location.href = `/order/payment/${orderId}/completed`;
        return;
      }

      if (
        response.charge.status === "expired" ||
        response.charge.status === "failed" ||
        response.charge.status === "reversed"
      ) {
        removeItem("cart");
        removeItem("process_sale_order");
        window.location.href = `/order/payment/${orderId}/failed`;
        return;
      }

      setSaleOrder(response.sale_order);
      setCharge(response.charge);

      if (response?.charge?.expired_at) {
        const expiredTime = new Date(response.charge.expired_at).getTime();
        const now = Date.now();
        const diffSeconds = Math.max(0, Math.floor((expiredTime - now) / 1000));
        setTimeLeft(diffSeconds);
      } else {
        setTimeLeft(0);
      }

      if (response.charge?.id) {
        await checkOmiseStatus(response.charge.id);
      }
    } catch (error) {
      console.error("Error fetching order status:", error);
    } finally {
      if (isManualRefresh) {
        setIsRefreshing(false);
      } else {
        setFullLoading(false);
      }
    }
  };

  const checkOmiseStatus = async (chargeId?: string) => {
    const currentChargeId = chargeId || charge?.id;
    if (!currentChargeId) return;

    try {
      const omiseStatus = await backendClient.getOmiseChargeStatus(
        currentChargeId,
      );
      if (!isErrorResponse(omiseStatus) && charge) {
        const updatedCharge = { ...charge, ...omiseStatus };
        setCharge(updatedCharge);

        if (omiseStatus.status === "successful") {
          removeItem("cart");
          removeItem("process_sale_order");
          setItem("process_upload_sale_order", orderId);
          window.location.href = `/order/payment/${orderId}/completed`;
          return;
        }

        if (
          omiseStatus.status === "expired" ||
          omiseStatus.status === "failed" ||
          omiseStatus.status === "reversed"
        ) {
          removeItem("cart");
          removeItem("process_sale_order");
          window.location.href = `/order/payment/${orderId}/failed`;
          return;
        }
      }
    } catch (error) {
      console.error("Error checking Omise status:", error);
    }
  };

  const cancelSaleOrder = async () => {
    setAlert(
      "กรุณายืนยัน",
      "คุณต้องการที่จะยกเลิกรายการนี้ใช่หรือไม่",
      async () => {
        setFullLoading(true);
        const response = await backendClient.cancelSaleOrderById(orderId);
        setFullLoading(true);
        if (isErrorResponse(response)) {
          return;
        }
        removeItem("cart");
        removeItem("process_sale_order");
        window.location.href = `/order/payment/${orderId}/failed`;
      },
      true,
    );
  };

  const changePaymentMethod = async () => {
    setAlert(
      "กรุณายืนยัน",
      "คุณต้องการที่จะเปลี่ยนวิธีการชำระเงินนี้ใช่หรือไม่",
      async () => {
        setFullLoading(true);
        const response = await backendClient.cancelSaleOrderById(orderId);
        setFullLoading(true);
        if (isErrorResponse(response)) {
          return;
        }
        removeItem("process_sale_order");
        window.location.href = `/order/member?phone=${saleOrder?.customer_phone}&email=${saleOrder?.customer_email}`;
      },
      true,
    );
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
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
    if (uploadedFiles.length === 0) {
      setAlert(
        "กรุณาอัพโหลดไฟล์",
        "กรุณาอัพโหลดเอกสารยืนยันการชำระเงินอย่างน้อย 1 ไฟล์",
        () => {},
        false,
      );
      return;
    }

    setFullLoading(true);
    try {
      const uploadPromises = uploadedFiles.map((file) =>
        backendClient.uploadDocumentFile(file, "payment", orderId, "payment"),
      );

      const responses = await Promise.all(uploadPromises);
      const hasError = responses.some((response) => isErrorResponse(response));
      if (hasError) {
        setFullLoading(false);
        return;
      }

      const response = await backendClient.completeSaleOrderCreditCard(orderId);
      if (isErrorResponse(response)) {
        setFullLoading(false);
        return;
      }

      removeItem("cart");
      removeItem("process_sale_order");
      setItem("process_upload_sale_order", orderId);
      window.location.href = `/order/payment/${orderId}/completed`;
    } catch (error) {
      console.error("Error uploading documents:", error);
      setFullLoading(false);
    }
  };

  return (
    <div className="px-1 pt-4">
      <div className="bg-white p-8 m-8 mt-0 rounded-2xl flex flex-col justify-center items-center gap-5 shadow-md">
        <div className="flex gap-2">
          <img src="/logo.png" alt="logo-bearhouse" className="w-10 h-10" />
          <div className="text-4xl">ชำระเงิน</div>
        </div>

        {saleOrder?.payment_type === "credit_card" ? (
          // Credit Card Payment UI
          <>
            <div className="text-white text-2xl text-center bg-text-primary px-6">
              No. {saleOrder?.number} <br />
              ยอดชำระ {saleOrder?.total_amount.toLocaleString()} บาท <br />
            </div>
            <div className="text-2xl text-center text-gray-700">
              กรุณาอัพโหลดเอกสารยืนยันการชำระเงิน
            </div>

            {/* File Upload Area */}
            <div
              className={`w-full max-w-md border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={onPickFile}
            >
              <div className="text-gray-500 text-lg">
                คลิกหรือลากไฟล์มาวางที่นี่
              </div>
              <div className="text-gray-400 text-sm mt-2">
                รองรับไฟล์รูปภาพและ PDF
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={onFileChange}
              className="hidden"
            />

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="w-full max-w-md">
                <div className="text-xl mb-2">ไฟล์ที่อัพโหลด:</div>
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-100 p-3 rounded-lg mb-2"
                  >
                    <span className="text-xl truncate flex-1">{file.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button
              text="ดำเนินการต่อ"
              className="w-full"
              disabled={uploadedFiles.length < 1}
              onClick={uploadDocuments}
            />
          </>
        ) : (
          // Thai QR Payment UI
          <>
            <button
              className="border-2 border-gray-500 p-4 rounded-2xl flex items-center"
              title="รีเฟรชข้อมูล"
              disabled={isRefreshing}
              onClick={() => checkOmiseStatus()}
            >
              <div className="text-2xl flex items-center gap-3">
                ชำระภายใน {formatTime(timeLeft)}
              </div>
              <div className="p-2 rounded-full transition-colors disabled:opacity-50">
                <svg
                  className={`w-6 h-6 text-gray-600 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
            </button>

            {charge?.qr_code && (
              <img src={charge.qr_code} alt="qr-code" className="w-70" />
            )}
            <div className="text-white text-2xl text-center bg-text-primary px-6">
              No. {saleOrder?.number} <br />
              ยอดชำระ {saleOrder?.total_amount.toLocaleString()} บาท <br />
            </div>
          </>
        )}

        <div className="flex gap-6">
          <div
            className="text-gray-500 text-xl underline"
            onClick={changePaymentMethod}
          >
            เปลี่ยนวิธีการชำระเงิน
          </div>
          <div
            className="text-gray-500 text-xl underline"
            onClick={cancelSaleOrder}
          >
            ยกเลิกรายการ
          </div>
        </div>
      </div>

      {/* <div className="flex flex-col gap-3 px-10 pb-4">
        <Button
          text="Test Payment Completed"
          onClick={() => {
            window.location.href = "/payment/completed";
          }}
        />
        <Button
          text="Test Payment Failed"
          onClick={() => {
            window.location.href = "/payment/failed";
          }}
        />
      </div> */}
    </div>
  );
}
