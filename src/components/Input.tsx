/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { HTMLInputTypeAttribute, useRef, ReactNode } from "react";

interface InputProp {
  placeholder?: string;
  type: HTMLInputTypeAttribute;
  value: any;
  onChange: (value: any) => void;
  className?: string;
  icon?: ReactNode;
  inputMode?:
    | "email"
    | "search"
    | "tel"
    | "text"
    | "url"
    | "none"
    | "numeric"
    | "decimal"
    | undefined;
}

export default function Input({
  placeholder,
  type,
  icon,
  className,
  inputMode,
  value,
  onChange,
}: InputProp) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className={`border-2 border-text-primary rounded-xl bg-white flex justify-center items-center gap-3 pl-3 cursor-text ${className}`}
      onClick={handleClick}
    >
      {icon}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        inputMode={inputMode}
        ref={inputRef}
        className="w-full py-2 text-xl"
        placeholder={placeholder ?? ""}
      />
    </div>
  );
}
