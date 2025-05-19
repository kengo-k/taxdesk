'use client'

import { useEffect, useRef } from 'react'

import { Chart, type ChartConfiguration, registerables } from 'chart.js'

Chart.register(...registerables)

interface StackedBarChartProps {
  title: string
  data: {
    labels: string[] // X軸のラベル（月）
    datasets: {
      label: string
      data: number[]
      backgroundColor: string
    }[]
  }
}

export function StackedBarChart({ title, data }: StackedBarChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  // 金額をフォーマットする関数
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  useEffect(() => {
    if (chartRef.current) {
      // 既存のチャートインスタンスがあれば破棄
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current.getContext('2d')
      if (ctx) {
        const config: ChartConfiguration = {
          type: 'bar',
          data: data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                stacked: true,
                grid: {
                  display: false,
                },
              },
              y: {
                stacked: true,
                ticks: {
                  callback: (value) => formatCurrency(Number(value)),
                },
              },
            },
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  boxWidth: 10,
                  padding: 10,
                  font: {
                    size: 11,
                  },
                },
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    let label = context.dataset.label || ''
                    if (label) {
                      label += ': '
                    }
                    if (context.parsed.y !== null) {
                      label += formatCurrency(context.parsed.y)
                    }
                    return label
                  },
                  footer: (tooltipItems) => {
                    let sum = 0
                    tooltipItems.forEach((tooltipItem) => {
                      sum += tooltipItem.parsed.y
                    })
                    return '合計: ' + formatCurrency(sum)
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
  }, [data])

  return (
    <div className="relative h-full">
      <h2 className="font-medium text-left mb-2">{title}</h2>
      <div className="h-64 relative">
        <canvas ref={chartRef} />
      </div>
    </div>
  )
}
