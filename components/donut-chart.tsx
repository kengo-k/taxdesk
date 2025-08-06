'use client'

import { useEffect, useRef } from 'react'

import { Chart, Color, registerables } from 'chart.js'

Chart.register(...registerables)

interface DonutChartProps {
  data: number[]
  labels: string[]
  colors: string[]
  title: string
  value: string
  amounts: number[] // 実際の金額データ
}

export function DonutChart({
  data,
  labels,
  colors,
  title,
  value,
  amounts,
}: DonutChartProps) {
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
        // 型アサーションを適用して、TypeScriptエラーを回避
        const config = {
          type: 'doughnut',
          data: {
            labels,
            datasets: [
              {
                data,
                backgroundColor: colors,
                borderWidth: 0,
                borderRadius: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%', // Chart.js v3では、doughnutチャートのcutoutプロパティは正しい
            plugins: {
              legend: {
                display: true,
                position: 'right',
                align: 'center',
                labels: {
                  boxWidth: 10,
                  padding: 10,
                  font: {
                    size: 11,
                  },
                  generateLabels: (chart: any) => {
                    const datasets = chart.data.datasets
                    return (
                      chart.data.labels?.map((label: string, i: number) => {
                        const dataset = datasets[0]
                        const value = dataset.data[i]
                        const backgroundColor =
                          dataset.backgroundColor instanceof Array
                            ? dataset.backgroundColor[i]
                            : dataset.backgroundColor

                        return {
                          text: `${label}: ${formatCurrency(value)}`,
                          fillStyle: backgroundColor as Color,
                          strokeStyle: backgroundColor as Color,
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
                  label: (context: any) => {
                    const label = context.label || ''
                    const index = context.dataIndex
                    // 実際の金額を表示
                    return `${label}: ${formatCurrency(amounts[index])}`
                  },
                },
              },
            },
          },
        }

        // Chart.jsのコンストラクタに渡す際に型アサーションを適用
        chartInstance.current = new Chart(ctx, config as any)
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, labels, colors, amounts])

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-medium text-lg">{title}</h3>
        <span className="font-bold text-lg">{value}</span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {data.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>データがありません</p>
          </div>
        ) : (
          <div className="relative w-full h-[300px]">
            <canvas ref={chartRef} />
          </div>
        )}
      </div>
    </div>
  )
}
