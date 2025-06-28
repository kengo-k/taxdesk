'use client'

import { useEffect, useRef, useState } from 'react'

import { Input } from '@/components/ui/input'

export interface AutocompleteOption {
  value: string
  label: string
  code?: string
  kana_name?: string
}

interface AutocompleteProps {
  value: string
  placeholder?: string
  options: AutocompleteOption[]
  onSelect: (option: AutocompleteOption) => void
  onChange: (value: string) => void
  onKeyDown?: (event: React.KeyboardEvent) => void
  onFocus?: () => void
  onBlur?: () => void
  className?: string
  disabled?: boolean
}

export function Autocomplete({
  value,
  placeholder,
  options,
  onSelect,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  className,
  disabled = false,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([])
  
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 入力値に基づいてオプションをフィルタリング
  useEffect(() => {
    if (!value) {
      setFilteredOptions(options)
    } else {
      const filtered = options.filter(option => 
        option.code?.toLowerCase().includes(value.toLowerCase()) ||
        option.label.toLowerCase().includes(value.toLowerCase()) ||
        option.kana_name?.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredOptions(filtered)
    }
    setSelectedIndex(-1)
  }, [value, options])

  // フォーカス時にドロップダウンを開く
  const handleFocus = () => {
    setIsOpen(true)
    onFocus?.()
  }

  // ブラー時にドロップダウンを閉じる（遅延あり）
  const handleBlur = (event: React.FocusEvent) => {
    // containerRef内の要素にフォーカスが移動する場合は閉じない
    setTimeout(() => {
      if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
        setIsOpen(false)
        setSelectedIndex(-1)
        onBlur?.()
      }
    }, 150)
  }

  // キーボード操作の処理
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        setIsOpen(true)
        return
      }
    }

    if (isOpen) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          )
          break
        case 'Enter':
          event.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) {
            handleSelect(filteredOptions[selectedIndex])
          } else {
            // Enterキーを親コンポーネントに伝播
            onKeyDown?.(event)
          }
          break
        case 'Tab':
          if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) {
            event.preventDefault()
            handleSelect(filteredOptions[selectedIndex])
          } else {
            setIsOpen(false)
          }
          break
        case 'Escape':
          event.preventDefault()
          setIsOpen(false)
          setSelectedIndex(-1)
          inputRef.current?.blur()
          break
        default:
          break
      }
    }

    // その他のキーは親コンポーネントに伝播
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Enter' && event.key !== 'Tab' && event.key !== 'Escape') {
      onKeyDown?.(event)
    }
  }

  // オプション選択の処理
  const handleSelect = (option: AutocompleteOption) => {
    onSelect(option)
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  // 入力値変更の処理
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
    if (!isOpen) {
      setIsOpen(true)
    }
  }

  // 選択されたアイテムをビューに表示
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        })
      }
    }
  }, [selectedIndex])

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={className}
        disabled={disabled}
        autoComplete="off"
      />
      
      {isOpen && filteredOptions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 max-h-60 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg"
          style={{
            minWidth: '280px', // 最小幅を設定
            width: 'max-content', // コンテンツに合わせて幅を自動調整
            maxWidth: '400px', // 最大幅を制限
          }}
        >
          {filteredOptions.map((option, index) => (
            <li
              key={option.value}
              className={`px-3 py-2 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex 
                  ? 'bg-blue-50 text-blue-900' 
                  : 'hover:bg-gray-50'
              }`}
              onMouseDown={(e) => {
                e.preventDefault() // ブラーを防ぐ
                handleSelect(option)
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-center gap-3 whitespace-nowrap">
                <span className="font-mono font-medium text-blue-600 min-w-[3rem]">{option.code}</span>
                <span className="text-gray-800">{option.label}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}