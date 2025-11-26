"use client";
import { useEffect, useRef } from "react";
import { Chart, ChartConfiguration, registerables } from "chart.js";
import Button from "@/components/Button";
import Select from "@/components/Select";

Chart.register(...registerables);

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const formatBahtParts = (value: number) => [
      value.toLocaleString("th-TH"),
      "บาท",
    ];

    const fontFamily = "'DBHeaventRounded', 'Prompt', sans-serif";
    const baseFont = {
      family: fontFamily,
      size: 15,
    };

    const valueLabelPlugin = {
      id: "valueLabel",
      afterDatasetsDraw: (chart: Chart) => {
        const { ctx } = chart;
        ctx.save();
        ctx.font = `${baseFont.size}px ${baseFont.family}`;
        ctx.fillStyle = "#8c532a";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";

        chart.data.datasets.forEach((dataset, datasetIndex) => {
          const meta = chart.getDatasetMeta(datasetIndex);
          meta.data.forEach((element, index) => {
            const bar = element;
            if (!bar) return;

            const rawValue = dataset.data?.[index];
            const numericValue =
              typeof rawValue === "number" ? rawValue : Number(rawValue ?? 0);
            const [amount] = formatBahtParts(numericValue);
            ctx.fillText(amount, bar.x, bar.y - 6);
          });
        });

        ctx.restore();
      },
    };

    const config: ChartConfiguration<"bar"> = {
      type: "bar",
      data: {
        labels: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
        ],
        datasets: [
          {
            label: "ยอดขาย",
            data: [1300, 2539, 800, 811, 536, 525, 4320],
            backgroundColor: ["rgb(0, 166, 61)"],
            hoverBackgroundColor: ["rgb(0, 166, 61)"],
          },
        ],
      },
      plugins: [valueLabelPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            align: "center",
            labels: {
              usePointStyle: true,
              color: "#8c532a",
              font: baseFont,
            },
            display: false,
          },
          tooltip: {
            bodyFont: baseFont,
            titleFont: baseFont,
            callbacks: {
              label: (context) => {
                const value = Number(context.raw ?? 0);
                const [amount, unit] = formatBahtParts(value);
                if (context.dataset.label) {
                  return [`${context.dataset.label}: ${amount}`, unit];
                }
                return [amount, unit];
              },
            },
          },
        },
        scales: {
          x: {
            border: {
              display: false,
            },
            grid: {
              display: false,
            },
            ticks: {
              color: "#8c532a",
              font: baseFont,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 2000,
              color: "#8c532a",
              font: baseFont,
              callback: (value) => formatBahtParts(Number(value)),
            },
            border: {
              display: false,
            },
            grid: {
              color: "#8c532a55",
            },
          },
        },
      },
    };

    chartRef.current = new Chart(ctx, config);

    return () => {
      chartRef.current?.destroy();
    };
  }, []);

  return (
    <div className="px-4 py-6">
      <div className="text-4xl mb-6">สรุปยอดการขาย</div>
      <Button className="mb-6" text="ปิดรอบการขาย" onClick={() => {}} />

      <div className="text-2xl mb-3">สรุปผล</div>
      <div className="h-[300px] max-w-5xl mb-6 bg-white px-5 pr-7 py-6 rounded-md shadow-md">
        <canvas ref={canvasRef} />
      </div>
      <div className="flex justify-between gap-2 mb-6">
        <div className="bg-white w-[50%] rounded-md pt-3 pb-4 px-3 shadow-md">
          <div className="text-md">รายการที่ขายได้ (วัน)</div>
          <div className="text-xl text-green-600">31,130.65</div>
          <div className="flex justify-between text-md">
            <div>รายการ</div>
            <div className="text-green-600">54</div>
          </div>
          <div className="flex items-center justify-end text-green-600 gap-1 text-md leading-2">
            <svg
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 12L8 8L11 11L16 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 6H16V10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>12%</div>
          </div>
        </div>
        <div className="bg-white w-[50%] rounded-md pt-3 pb-4 px-3 shadow-md">
          <div className="text-md">รายการที่ขายได้ (สัปดาห์)</div>
          <div className="text-xl text-rose-600">311,305.23</div>
          <div className="flex justify-between text-md">
            <div>รายการ</div>
            <div className="text-rose-600">5,464</div>
          </div>
          <div className="flex items-center justify-end gap-1 text-rose-600 text-md leading-2">
            <svg
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 8L8 12L11 9L16 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 14H16V10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>6%</div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-2xl">รายการการขายที่ขายได้</div>
        <Select
          selections={[
            {
              name: "all",
              value: "all",
            },
            {
              name: "test",
              value: "test",
            },
          ]}
          onChange={() => {}}
        />
      </div>
      <div className="bg-white rounded-md p-3 shadow-md mt-3 flex justify-between">
        <div className="">
          <div className="text-md text-gray-400">QRCode</div>
          <div className="text-xl flex items-center gap-2">
            <div className="">BR6100/100004</div>
            <div className="bg-green-500 text-white px-3 h-5 rounded-md text-sm">
              Paid
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end justify-end">
          <div className="text-md text-gray-400">25/11/2025</div>
          <div className="text-xl">฿200.34</div>
        </div>
      </div>
    </div>
  );
}
