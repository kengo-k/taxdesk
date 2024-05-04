import { FC, createRef, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { DateTime } from 'luxon'
import Numeral from 'numeral'

import { Alert, Autocomplete, ComboboxItem, TextInput } from '@mantine/core'
import { UseFormReturnType, useForm, zodResolver } from '@mantine/form'
import { saimoku_masters } from '@prisma/client'

import { formatDate, fromDateString } from '@/misc/format'
import { getPageList } from '@/misc/page'
import {
  Month,
  Nendo,
  toMonthString,
  toNendoMonthString,
  toNendoString,
} from '@/models/date'
import {
  LedgerCreateRequestForm,
  LedgerCreateRequestSchema,
  LedgerUpdateRequestForm,
  LedgerUpdateRequestSchema,
} from '@/models/ledger'
import { AppDispatch, RootState } from '@/store'
import { loadLedgerList } from '@/store/ledger'
import { selectSaimokuMap } from '@/store/master'

const AmountInputForCreate: FC<{
  input_key: 'karikata_value' | 'kasikata_value'
  form: UseFormReturnType<LedgerCreateRequestForm>
  onSave: (e: React.KeyboardEvent<HTMLInputElement>) => void
}> = ({ input_key, form, onSave }) => {
  return (
    <TextInput
      className={'w-24'}
      styles={() => ({
        input: {
          textAlign: 'right',
          ...(LedgerCreateRequestForm.hasError(input_key, form)
            ? { borderColor: 'red' }
            : {}),
        },
      })}
      {...form.getInputProps(input_key)}
      value={form.values[input_key]}
      error={null}
      onBlur={(e) => {
        form.validate()
        if (!LedgerCreateRequestForm.hasError(input_key, form)) {
          const value = Numeral(e.currentTarget.value)
          if (value.value() != null) {
            LedgerCreateRequestForm.set(input_key, form, value.format('0,0'))
          }
        }
      }}
      onFocus={(e) => {
        const value = Numeral(e.currentTarget.value)
        const num = value.value()
        if (num != null) {
          LedgerCreateRequestForm.set(input_key, form, `${num}`)
        }
      }}
      onKeyDown={onSave}
    />
  )
}

const AmountInputForUpdate: FC<{
  input_key: 'karikata_value' | 'kasikata_value'
  form: UseFormReturnType<LedgerUpdateRequestForm>
  index: number
  onSave: (e: React.KeyboardEvent<HTMLInputElement>) => void
}> = ({ input_key, form, index, onSave }) => {
  return (
    <TextInput
      className={'w-24'}
      styles={() => ({
        input: {
          textAlign: 'right',
          ...(LedgerUpdateRequestForm.hasError(input_key, form, index)
            ? { borderColor: 'red' }
            : {}),
        },
      })}
      {...form.getInputProps(`items.${index}.${input_key}`)}
      value={form.values.items[index][input_key]}
      error={null}
      onBlur={(e) => {
        form.validate()
        if (!LedgerUpdateRequestForm.hasError(input_key, form, index)) {
          const value = Numeral(e.currentTarget.value)
          if (value.value() != null) {
            LedgerUpdateRequestForm.set(
              input_key,
              form,
              index,
              value.format('0,0'),
            )
          }
        }
      }}
      onFocus={(e) => {
        const value = Numeral(e.currentTarget.value)
        const num = value.value()
        if (num != null) {
          LedgerUpdateRequestForm.set(input_key, form, index, `${num}`)
        }
      }}
      onKeyDown={onSave}
    />
  )
}

export const LedgerList: FC<{
  nendo: Nendo
  ledger_cd: string
  month: Month | null
  page_no: number
  page_size: number
}> = ({ nendo, ledger_cd, month, page_no, page_size }) => {
  const { data: masters_state } = useSelector(
    (state: RootState) => state.masters,
  )
  const { data: ledger_state } = useSelector((state: RootState) => state.ledger)

  const saimoku_map = useSelector(selectSaimokuMap)
  const saimoku_list = useMemo(() => {
    return masters_state.saimoku_list.filter(
      (saimoku) => saimoku.saimoku_cd !== ledger_cd,
    )
  }, [masters_state.saimoku_list, ledger_cd])

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(
      loadLedgerList({
        nendo: toNendoString(nendo),
        ledger_cd,
        month: toMonthString(month),
        page_no,
        page_size,
      }),
    )
  }, [dispatch, ledger_cd, month, nendo, page_no, page_size])

  const pageInfo = getPageList(page_no, ledger_state.all_count, page_size)

  const create_form = useForm<LedgerCreateRequestForm>({
    initialValues: {
      nendo: toNendoString(nendo),
      ledger_cd,
      date_full: '',
      date_yymm: month ? `${toNendoMonthString(nendo, month)}` : '',
      date_dd: '',
      other_cd: '',
      karikata_value: '',
      kasikata_value: '',
      note: '',
    },
    validate: zodResolver(LedgerCreateRequestSchema),
  })

  const update_form = useForm<LedgerUpdateRequestForm>({
    initialValues: {
      items: [],
    },
    validate: zodResolver(LedgerUpdateRequestSchema),
  })

  useEffect(() => {
    if (saimoku_map.size === 0) {
      return
    }
    update_form.setValues({
      items: ledger_state.ledger_list.map((item) => {
        const date = fromDateString(item.date)
        const date_full = date === null ? '' : formatDate(date, 'yyyy/MM/dd')
        const date_yymm = date === null ? '' : formatDate(date, 'yyyy/MM')
        const date_dd = date === null ? '' : formatDate(date, 'dd')
        return {
          ...item,
          ledger_cd,
          date_full,
          date_yymm,
          date_dd,
          karikata_value:
            item.karikata_value === 0 ? '' : String(item.karikata_value),
          kasikata_value:
            item.kasikata_value === 0 ? '' : String(item.kasikata_value),
          other_cd_name: saimoku_map.get(item.other_cd)!.saimoku_ryaku_name,
          acc: item.acc,
        }
      }),
    })
  }, [ledger_state.ledger_list, saimoku_map]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h1>
        台帳:
        {saimoku_map.get(ledger_cd)?.saimoku_full_name}
        {month !== null ? ` - ${month}月分 ` : ''}
      </h1>
      {Object.keys(create_form.errors).length > 0 && (
        <Alert
          variant="light"
          color="red"
          title="Failed to creating a new ledgger."
        >
          <ul>
            {Object.keys(create_form.errors).map((key) => {
              return <li key={key}>{key}</li>
            })}
          </ul>
        </Alert>
      )}
      {Object.keys(update_form.errors).length > 0 && (
        <Alert
          variant="light"
          color="red"
          title="Failed to updating a ledgger."
        >
          <ul>
            {Object.keys(update_form.errors).map((key) => {
              return <li key={key}>{key}</li>
            })}
          </ul>
        </Alert>
      )}
      <div>
        <span>
          {`${pageInfo.from}-${pageInfo.to}`}件(全
          {ledger_state.all_count ?? '0'}件)
        </span>
        <span>
          {pageInfo.pageList.map((no) =>
            no === page_no ? (
              <a key={no}>{no}</a>
            ) : (
              <a
                key={no}
                onClick={() => {
                  const url = new URL(location.href)
                  url.searchParams.set('page_no', `${no}`)
                  //history(`${url.pathname}${url.search}`);
                }}
              >
                {no}
              </a>
            ),
          )}
        </span>
      </div>
      <div>
        <table>
          <thead>
            <tr>
              <th>登録日</th>
              <th colSpan={2}>相手科目</th>
              <th>金額(借方)</th>
              <th>金額(貸方)</th>
              <th>備考</th>
              <th>累計</th>
              <th>
                <br />
              </th>
            </tr>
          </thead>
          <tbody>
            <LedgerListNewRow
              form={create_form}
              nendo={nendo}
              ledger_cd={ledger_cd}
              month={month}
              pageNo={page_no}
              pageSize={page_size}
              saimoku_map={saimoku_map}
              saimoku_list={saimoku_list}
            />
            <LedgerListRows
              nendo={nendo}
              ledger_cd={ledger_cd}
              month={month}
              pageNo={page_no}
              pageSize={page_size}
              form={update_form}
              saimoku_map={saimoku_map}
              saimoku_list={saimoku_list}
            />
          </tbody>
        </table>
      </div>
    </div>
  )
}

const LedgerListRows: FC<{
  nendo: Nendo
  ledger_cd: string
  month: Month | null
  pageNo: number
  pageSize: number
  form: UseFormReturnType<LedgerUpdateRequestForm>
  saimoku_map: Map<string, saimoku_masters>
  saimoku_list: saimoku_masters[]
}> = ({
  nendo,
  ledger_cd,
  month,
  pageNo,
  pageSize,
  form,
  saimoku_map,
  saimoku_list,
}) => {
  const dispatch = useDispatch<AppDispatch>()

  const save = () => {
    const { hasErrors } = form.validate()
    if (hasErrors) {
      return
    }
    const { success, data } = LedgerUpdateRequestSchema.safeParse(form.values)
    if (success) {
      //console.log('create: ', data)
      //dispatch(createLedger(data))
    }
  }

  const onSave = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      save()
    }
  }

  return form.values.items.map((item, index) => {
    return (
      <tr key={item.journal_id}>
        <td>
          {month === null ? (
            <input type="text" maxLength={8} />
          ) : (
            <>
              <TextInput
                value={item.date_yymm}
                maxLength={6}
                readOnly
                disabled
                styles={() => ({
                  root: { width: '80px', display: 'inline-block' },
                })}
              />
              <TextInput
                value={item.date_dd}
                {...form.getInputProps(`items.${index}.date_dd`)}
                maxLength={2}
                styles={() => ({
                  root: { width: '50px', display: 'inline-block' },
                })}
              />
            </>
          )}
        </td>
        <td>
          <div>
            <Autocomplete
              value={item.other_cd}
              data={saimoku_list.map((s) => s.saimoku_cd)}
              {...form.getInputProps(`items.${index}.other_cd`)}
              filter={({ options, search }) => {
                return (options as ComboboxItem[]).filter((option) => {
                  const key = search.trim().toLowerCase()
                  if (key.length === 0) {
                    return true
                  }
                  const saimoku = saimoku_map.get(option.value)!
                  const saimoku_cd = saimoku.saimoku_cd.toLowerCase()
                  const kana = saimoku.saimoku_kana_name.toLowerCase()
                  return saimoku_cd.includes(key) || kana.includes(key)
                })
              }}
              renderOption={({ option }) => {
                const saimoku = saimoku_map.get(option.value)!
                return (
                  <div>{`${option.value}:${saimoku.saimoku_ryaku_name}`}</div>
                )
              }}
              onBlur={(e) => {
                const keyword = e.currentTarget.value.toLowerCase()
                const results = saimoku_list.filter((s) => {
                  const code = s.saimoku_cd.toLowerCase()
                  const kana = s.saimoku_kana_name
                  return code.includes(keyword) || kana.includes(keyword)
                })
                if (results.length === 1) {
                  LedgerUpdateRequestForm.set(
                    'other_cd',
                    form,
                    index,
                    results[0].saimoku_cd,
                  )
                  LedgerUpdateRequestForm.set(
                    'other_cd_name',
                    form,
                    index,
                    results[0].saimoku_ryaku_name,
                  )
                }
              }}
              className="w-14"
              comboboxProps={{ width: '180px' }}
            />
          </div>
        </td>
        <td>
          <TextInput
            type="text"
            value={item.other_cd_name}
            className="w-16"
            disabled
            readOnly
          />
        </td>
        <td>
          <AmountInputForUpdate
            input_key="karikata_value"
            form={form}
            index={index}
            onSave={onSave}
          />
        </td>
        <td>
          <AmountInputForUpdate
            input_key="kasikata_value"
            form={form}
            index={index}
            onSave={onSave}
          />
        </td>
        <td>
          <TextInput className={'w-96'} />
        </td>
        <td>
          <TextInput
            value={Numeral(item.acc).format('0,0')}
            styles={() => ({
              input: {
                textAlign: 'right',
              },
            })}
            disabled
            className="w-28"
          />
        </td>
        <td>
          <button
            onClick={() => {
              //deleteJournal(props.ledger.journal_id, reloadLedger(false));
            }}
          >
            削除
          </button>
        </td>
      </tr>
    )
  })
}

export const LedgerListNewRow: FC<{
  form: UseFormReturnType<LedgerCreateRequestForm>
  nendo: Nendo
  ledger_cd: string
  month: Month | null
  pageNo: number
  pageSize: number
  saimoku_map: Map<string, saimoku_masters>
  saimoku_list: saimoku_masters[]
}> = ({
  form,
  nendo,
  ledger_cd,
  month,
  pageNo,
  pageSize,
  saimoku_map,
  saimoku_list,
}) => {
  const dispatch = useDispatch<AppDispatch>()

  //const { createLedger } = useActions();

  const [dateStr, setDate] = useState('')

  const [dateStrDD, setDateDD] = useState('')

  const [note, setNote] = useState('')

  const dateRef = createRef<HTMLInputElement>()

  const save = () => {
    const { hasErrors } = form.validate()
    if (hasErrors) {
      return
    }
    const { success, data } = LedgerCreateRequestSchema.safeParse(form.values)
    if (success) {
      //console.log('create: ', data)
      //dispatch(createLedger(data))
    }
  }

  const onSave = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      save()
    }
  }

  const [other_cd_name, setOtherCdName] = useState('')

  return (
    <tr>
      <td>
        {month !== null ? (
          <>
            <TextInput
              value={form.values.date_yymm}
              maxLength={6}
              readOnly
              disabled
              styles={() => ({
                root: { width: '80px', display: 'inline-block' },
              })}
            />
            <TextInput
              value={form.values.date_dd}
              maxLength={2}
              {...form.getInputProps('date_dd')}
              onKeyDown={onSave}
              onBlur={(e) => {
                const day = e.currentTarget.value
                if (day.length === 1) {
                  setDateDD(`0${day}`)
                }
              }}
              styles={() => ({
                root: { width: '50px', display: 'inline-block' },
              })}
            />
          </>
        ) : (
          <input
            type="text"
            value={dateStr}
            maxLength={8}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setDate(e.target.value)
            }}
            onFocus={(e: React.ChangeEvent<HTMLInputElement>) => {
              const dateStr = e.target.value
              const date = DateTime.fromFormat(dateStr, 'yyyy/mm/dd')
              if (date.invalidReason == null) {
                setDate(date.toFormat('yyyymmdd'))
              }
            }}
            onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
              const dateStr = e.target.value
              const date = DateTime.fromFormat(dateStr, 'yyyymmdd')
              if (date.invalidReason == null) {
                setDate(date.toFormat('yyyy/mm/dd'))
              }
            }}
            onKeyDown={onSave}
            ref={dateRef}
          />
        )}
      </td>
      <td>
        <div style={{ width: '100%', position: 'relative' }}>
          <Autocomplete
            value={form.values.other_cd}
            data={saimoku_list.map((s) => s.saimoku_cd)}
            filter={({ options, search }) => {
              return (options as ComboboxItem[]).filter((option) => {
                const key = search.trim().toLowerCase()
                if (key.length === 0) {
                  return true
                }
                const saimoku = saimoku_map.get(option.value)!
                const saimoku_cd = saimoku.saimoku_cd.toLowerCase()
                const kana = saimoku.saimoku_kana_name.toLowerCase()
                return saimoku_cd.includes(key) || kana.includes(key)
              })
            }}
            renderOption={({ option }) => {
              const saimoku = saimoku_map.get(option.value)!
              return (
                <div>{`${option.value}:${saimoku.saimoku_ryaku_name}`}</div>
              )
            }}
            onChange={(value: string) => {
              LedgerCreateRequestForm.set('other_cd', form, value)
            }}
            onBlur={(e) => {
              const keyword = e.currentTarget.value.toLowerCase()
              const results = saimoku_list.filter((s) => {
                const code = s.saimoku_cd.toLowerCase()
                const kana = s.saimoku_kana_name
                return code.includes(keyword) || kana.includes(keyword)
              })
              if (results.length === 1) {
                LedgerCreateRequestForm.set(
                  'other_cd',
                  form,
                  results[0].saimoku_cd,
                )
                setOtherCdName(results[0].saimoku_ryaku_name)
              }
            }}
            className="w-14"
            comboboxProps={{ width: '180px' }}
          />
        </div>
      </td>
      <td>
        <TextInput
          type="text"
          value={other_cd_name}
          className="w-16"
          disabled
          readOnly
        />
      </td>
      <td>
        <AmountInputForCreate
          input_key="karikata_value"
          form={form}
          onSave={onSave}
        />
      </td>
      <td>
        <AmountInputForCreate
          input_key="kasikata_value"
          form={form}
          onSave={onSave}
        />
      </td>
      <td>
        <TextInput
          type="text"
          value={note}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setNote(e.target.value)
          }}
          onKeyDown={onSave}
          onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
            save()
          }}
          className="w-96"
        />
      </td>
      <td>
        <br />
      </td>
    </tr>
  )
}
