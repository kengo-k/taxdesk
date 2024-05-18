'use client'

import { useEffect, useState } from 'react'

import { Button, Radio, Table } from '@mantine/core'

export default function Page() {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/v1/settings/backup')
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const jsonData = await response.json()
        setData(jsonData.data)
      } catch (error) {}
    }
    fetchData()
  }, [])

  const [data, setData] = useState<
    { key: string; size: number; createdAt: number }[]
  >([])

  const [selected_row, set_selected_row] = useState<string | null>(null)

  return (
    <div>
      <Button
        onClick={async () => {
          const response = await fetch('/api/v1/settings/backup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          })
        }}
      >
        Create Backup
      </Button>

      <Button
        color="red"
        disabled={selected_row === null}
        onClick={async () => {
          if (selected_row === null) {
            return
          }
          const backup_id = getTimestamp(selected_row)
          if (backup_id === null) {
            return null
          }
          const response = await fetch(`/api/v1/settings/backup/${backup_id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          })
        }}
      >
        Restore Backup
      </Button>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Check</Table.Th>
            <Table.Th>File</Table.Th>
            <Table.Th>Size</Table.Th>
            <Table.Th>CreatedAt</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((item) => {
            return (
              <Table.Tr key={item.key}>
                <Table.Td>
                  <Radio
                    checked={selected_row === item.key}
                    onChange={() => {
                      set_selected_row(item.key)
                    }}
                  />
                </Table.Td>
                <Table.Td>{item.key}</Table.Td>
                <Table.Td>{item.size}</Table.Td>
                <Table.Td>{item.createdAt}</Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>
    </div>
  )
}

function getTimestamp(fileName: string): string | null {
  const regex = /.*-(\d{14})\.sql$/
  const match = fileName.match(regex)

  if (match) {
    return match[1]
  } else {
    return null
  }
}
