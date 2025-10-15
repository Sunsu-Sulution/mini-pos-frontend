/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { useHelperContext } from "./providers/helper-provider";

const navbars = [
  {
    text: "สินค้า",
    route: "/main",
    icon: <img src="/icon-bearhouse-4.png" className="h-7" alt="order" />,
  },
  {
    text: "คลัง",
    route: "/main/branch",
    icon: <img src="/icon-bearhouse-2.png" className="h-7" alt="branch" />,
  },
  {
    text: "สรุปยอด",
    route: "/main/summary",
    icon: <img src="/icon-bearhouse-1.png" className="h-7" alt="summary" />,
  },
];

const adminNavbars = [
  // {
  //   text: "ยอดขาย",
  //   route: "/admin",
  //   icon: <img src="/icon-bearhouse-2.png" className="h-7" alt="branch" />,
  // },
  {
    text: "สินค้า",
    route: "/admin/product",
    icon: <img src="/icon-bearhouse-4.png" className="h-7" alt="order" />,
  },
  {
    text: "คลัง",
    route: "/admin/branch",
    icon: <img src="/icon-bearhouse-3.png" className="h-7" alt="branch" />,
  },
  {
    text: "ผู้ใช้งาน",
    route: "/admin/user",
    icon: <img src="/icon-bearhouse-1.png" className="h-7" alt="summary" />,
  },
];

export default function Navbar() {
  const { userData } = useHelperContext()();
  return (
    <>
      <div className="h-30"></div>
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[100vw] md:w-[600px]">
        <div className=" bg-white select-none  flex justify-around pt-4 pb-3 shadow-2xl">
          {(userData.role === "admin" ? adminNavbars : navbars).map(
            (navbar) => (
              <a
                href={navbar.route}
                key={navbar.route}
                className="flex flex-col justify-center items-center gap-1"
              >
                {navbar.icon}
                <div className="text-md">{navbar.text}</div>
              </a>
            ),
          )}
        </div>
        {process.env.NEXT_PUBLIC_ENV !== "production" && (
          <div className=" text-white bg-text-primary px-3 shadow text-center">
            Development Server
          </div>
        )}
      </div>
    </>
  );
}
