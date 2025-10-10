"use client";
import React, { ReactNode } from "react";

interface ButtonProp {
  className?: string;
  icon?: ReactNode;
  disabled?: boolean;
  text: string | ReactNode;
  onClick: () => void;
}

export default function Button({
  className,
  icon,
  text,
  onClick,
  disabled = false,
}: ButtonProp) {
  return (
    <>
      <div
        onClick={disabled ? () => {} : onClick}
        className={`${
          disabled
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-text-primary cursor-pointer"
        } z-0 h-12 rounded-xl text-white flex justify-center items-center text-xl relative shadow-md ${className}`}
      >
        {text}
        {icon && (
          <div className="absolute -top-6 -right-4 rounded-full p-1 w-12">
            {icon}
          </div>
        )}
      </div>
    </>
  );
}
