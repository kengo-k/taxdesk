'use client'

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Button, Radio, Table } from '@mantine/core'

import { AppDispatch, RootState } from '@/store'
import {
  createBackup,
  loadBackupList,
  restoreFromBackup,
} from '@/store/settings'

export default function Page() {
  const dispatch = useDispatch<AppDispatch>()
  const settings_state = useSelector((state: RootState) => state.settings)
  const backup_list = settings_state.backup_list.error
    ? []
    : settings_state.backup_list.data

  useEffect(() => {
    dispatch(loadBackupList())
  }, [dispatch])

  const [selected_row, set_selected_row] = useState<string | null>(null)

  return (
    <div>
      <Button
        onClick={() => {
          dispatch(createBackup())
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
          dispatch(restoreFromBackup(backup_id))
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
          {backup_list &&
            backup_list.map((item) => {
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
