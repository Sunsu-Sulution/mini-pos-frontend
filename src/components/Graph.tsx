/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect, useRef } from "react";
import { Chart, ChartConfiguration, registerables } from "chart.js";

Chart.register(...registerables);

interface GraphProp {
  formatPart: (value: number) => string[];
  labels: string[];
  datas: number[];
}

export default function Graph({ formatPart, labels, datas }: GraphProp) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

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
            const [amount] = formatPart(numericValue);
            if (Number(amount) == 0) {
              return;
            }
            ctx.fillText(amount, bar.x, bar.y - 6);
          });
        });

        ctx.restore();
      },
    };

    const config: ChartConfiguration<"bar"> = {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            data: datas,
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
                const [amount, unit] = formatPart(value);
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
              callback: (value) => formatPart(Number(value)),
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
  }, [labels, datas, formatPart]);

  return <canvas ref={canvasRef} />;
}
