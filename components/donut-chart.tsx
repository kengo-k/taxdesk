"use client"

import { useEffect, useRef } from "react"
import { Chart, type ChartConfiguration, registerables } from "chart.js"

Chart.register(...registerables)

interface DonutChartProps {
  data: number[]
  labels: string[]
  colors: string[]
  title: string
  value: string
  amounts: number[] // 実際の金額データ
}

export function DonutChart({ data, labels, colors, title, value, amounts }: DonutChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  // 金額をフォーマットする関数
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  useEffect(() => {
    if (chartRef.current) {
      // 既存のチャートインスタンスがあれば破棄
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current.getContext("2d")
      if (ctx) {
        const config: ChartConfiguration = {
          type: "doughnut",
          data: {
            labels,
            datasets: [
              {
                data,
                backgroundColor: colors,
                borderWidth: 0,
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "70%",
            plugins: {
              legend: {
                display: true,
                position: "bottom",
                labels: {
                  boxWidth: 10,
                  padding: 10,
                  font: {
                    size: 11,
                  },
                  generateLabels: (chart) => {
                    const datasets = chart.data.datasets
                    return (
                      chart.data.labels?.map((label, i) => {
                        const dataset = datasets[0]
                        const value = dataset.data[i]
                        const backgroundColor =
                          dataset.backgroundColor instanceof Array
                            ? dataset.backgroundColor[i]
                            : dataset.backgroundColor

                        return {
                          text: `${label}: ${value}%`,
                          fillStyle: backgroundColor,
                          strokeStyle: backgroundColor,
                          lineWidth: 0,
                          hidden: false,
                          index: i,
                        }
                      }) || []
                    )
                  },
                },
              },
              tooltip: {
                enabled: true,
                callbacks: {
                  label: (context) => {
                    const label = context.label || ""
                    const index = context.dataIndex
                    // 実際の金額を表示
                    return `${label}: ${formatCurrency(amounts[index])}`
                  },
                },
              },
            },
          },
        }

        chartInstance.current = new Chart(ctx, config)
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, labels, colors, amounts])

  return (
    <div className="relative h-full">
      <h2 className="font-medium text-left mb-2">{title}</h2>
      <div className="h-52 mb-8 relative">
        <div className="absolute inset-0 flex items-center justify-center text-center z-10 pointer-events-none">
          <h3 className="text-base font-medium">{value}</h3>
        </div>
        <canvas ref={chartRef} />
      </div>
    </div>
  )
}
