/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { IconAlignCenter } from "@tabler/icons-react";
import React, { useState, useEffect } from "react";

interface Selection {
  name: string;
  value: any;
}

interface SelectProp {
  selections: Selection[];
  onChange?: (item: Selection) => void;
}

export default function Select({ selections, onChange }: SelectProp) {
  const [selected, setSelected] = useState<Selection | undefined>(
    selections[0],
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    setSelected(selections[0]);

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSelect = (item: Selection) => {
    setSelected(item);
    setIsOpen(false);
    if (onChange) {
      onChange(item);
    }
  };

  return (
    <>
      <div
        className="flex gap-3 items-center justify-between border-2 px-5 py-1 rounded-full cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-xl">
          {selected ? selected.name : selections[0]?.name}
        </div>
        <IconAlignCenter size={18} />
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Popup */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-md shadow-2xl max-h-[80vh] overflow-hidden w-[100vw] md:w-[600px] animate-slide-up mx-auto">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Options */}
            <div className="overflow-y-auto max-h-[calc(80vh-20px)]">
              {selections.map((item, index) => (
                <div
                  key={index}
                  className={`px-5 py-4 cursor-pointer text-xl hover:bg-gray-100 transition-colors border-b border-gray-100 ${
                    selected?.value === item.value ? "bg-gray-50" : ""
                  }`}
                  onClick={() => handleSelect(item)}
                >
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
