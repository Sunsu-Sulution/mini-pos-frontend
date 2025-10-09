/* eslint-disable @next/next/no-img-element */
import React from "react";

const navbars = [
  {
    text: "สินค้า",
    route: "/main",
    icon: <img src="/icon-bearhouse-4.png" className="h-7" alt="order" />,
  },
  {
    text: "สาขา",
    route: "/main/branch",
    icon: <img src="/icon-bearhouse-2.png" className="h-7" alt="branch" />,
  },
  {
    text: "สรุปยอด",
    route: "/main/summary",
    icon: <img src="/icon-bearhouse-1.png" className="h-7" alt="summary" />,
  },
];

export default function Navbar() {
  return (
    <>
    <div className="h-30"></div>
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white select-none w-[100vw] md:w-[600px] flex justify-around pt-4 pb-3 shadow-2xl">
      {navbars.map((navbar) => (
        <a
          href={navbar.route}
          key={navbar.route}
          className="flex flex-col justify-center items-center gap-1"
        >
          {navbar.icon}
          <div className="text-md">{navbar.text}</div>
        </a>
      ))}
    </div>
    </>
  );
}
