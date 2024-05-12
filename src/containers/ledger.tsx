import { FC, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import {
  Alert,
  Autocomplete,
  Button,
  ComboboxItem,
  Pagination,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { UseFormReturnType, useForm, zodResolver } from '@mantine/form'
import { saimoku_masters } from '@prisma/client'

import { AppDispatch, RootState } from '@/store'
import { deleteJournal } from '@/store/journal'
import { createLedger, ledgerActions, loadLedgerList } from '@/store/ledger'
import { selectSaimokuMap } from '@/store/master'

import { Amount } from '@/models/amount'
import {
  JournalDate,
  Month,
  Nendo,
  toMonthString,
  toNendoMonthString,
  toNendoString,
} from '@/models/date'
import {
  LedgerCreateRequestForm,
  LedgerCreateRequestFormSchema,
  LedgerUpdateRequestForm,
  LedgerUpdateRequestSchema,
} from '@/models/ledger'
import {
  PageNo,
  PageSize,
  getPageCount,
  toPageNo,
  toPageSize,
} from '@/models/paging'

export const LedgerList: FC<{
  nendo: Nendo
  ledger_cd: string
  month: Month | null
  page_no: PageNo
  page_size: PageSize
}> = ({ nendo, ledger_cd, month, page_no, page_size }) => {
  const router = useRouter()
  const pathname = usePathname()
  const search_params = useSearchParams()
  const dispatch = useDispatch<AppDispatch>()

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

  const create_form = useForm<LedgerCreateRequestForm>({
    initialValues: {
      nendo: '',
      ledger_cd,
      date: '',
      date_yymm: '',
      date_dd: '',
      other_cd: '',
      karikata_value: '',
      kasikata_value: '',
      note: '',
    },
    validate: zodResolver(LedgerCreateRequestFormSchema),
  })

  useEffect(() => {
    dispatch(
      loadLedgerList({
        nendo: toNendoString(nendo),
        ledger_cd,
        month: toMonthString(month),
        page_no: toPageNo(page_no),
        page_size: toPageSize(page_size),
      }),
    )
    if (month) {
      create_form.setFieldValue('date_yymm', toNendoMonthString(nendo, month))
    } else {
      create_form.setFieldValue('date_yymm', '')
    }
    create_form.setFieldValue('nendo', toNendoString(nendo))
  }, [dispatch, ledger_cd, month, nendo, page_no, page_size]) // eslint-disable-line react-hooks/exhaustive-deps

  const page_count = getPageCount(ledger_state.all_count, page_size)

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
        const date = JournalDate.create(item.date)
        const date_full = date === null ? '' : date.format('yyyy/MM/dd')
        const date_yymm = date === null ? '' : date.format('yyyy/MM')
        const date_dd = date === null ? '' : date.format('dd')
        return {
          ...item,
          ledger_cd,
          date_full,
          date_yymm,
          date_dd,
          karikata_value:
            item.karikata_value === 0
              ? ''
              : Amount.create(item.karikata_value).toFormatedString(),
          kasikata_value:
            item.kasikata_value === 0
              ? ''
              : Amount.create(item.kasikata_value).toFormatedString(),
          other_cd_name: saimoku_map.get(item.other_cd)!.saimoku_ryaku_name,
          note: item.note ?? '',
          acc: item.acc,
        }
      }),
    })
  }, [ledger_state.ledger_list, saimoku_map]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (ledger_state.last_upserted !== null) {
      dispatch(ledgerActions.clearLastUpserted())
      const current_values = create_form.values
      create_form.reset()
      create_form.setFieldValue('nendo', current_values.nendo)
      create_form.setFieldValue('date_yymm', current_values.date_yymm)
    }
  }, [dispatch, ledger_state.last_upserted]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <Title>
        台帳:
        {saimoku_map.get(ledger_cd)?.saimoku_full_name}
        {month !== null ? ` - ${month}月分 ` : ''}
      </Title>
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
        <Pagination
          value={page_no.value}
          total={page_count}
          siblings={2}
          onChange={(page_no) => {
            const params = new URLSearchParams(search_params.toString())
            params.set('page_no', String(page_no))
            router.push(`${pathname}?${params.toString()}`)
          }}
        />
      </div>
      <div>
        <table>
          <thead>
            <tr>
              <th>
                <Text>Date</Text>
              </th>
              <th colSpan={2}>
                <Text>Counter Code</Text>
              </th>
              <th>
                <Text>Debit</Text>
              </th>
              <th>
                <Text>Credit</Text>
              </th>
              <th>
                <Text>Note</Text>
              </th>
              <th>
                <Text>Acc</Text>
              </th>
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

export const LedgerListNewRow: FC<{
  form: UseFormReturnType<LedgerCreateRequestForm>
  nendo: Nendo
  ledger_cd: string
  month: Month | null
  pageNo: PageNo
  pageSize: PageSize
  saimoku_map: Map<string, saimoku_masters>
  saimoku_list: saimoku_masters[]
}> = (props) => {
  const dispatch = useDispatch<AppDispatch>()

  const save = () => {
    const { hasErrors } = props.form.validate()
    if (hasErrors) {
      return
    }
    const { success, data } = LedgerCreateRequestFormSchema.safeParse(
      props.form.values,
    )
    if (success) {
      dispatch(
        createLedger({
          request: data,
          next: [
            loadLedgerList({
              nendo: toNendoString(props.nendo),
              ledger_cd: props.ledger_cd,
              month: toMonthString(props.month),
              page_no: toPageNo(props.pageNo),
              page_size: toPageSize(props.pageSize),
            }),
          ],
        }),
      )
    }
  }

  const onSave = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      save()
    }
  }

  const other_cd_name = useMemo(() => {
    const saimoku = props.saimoku_map.get(props.form.values.other_cd)
    return saimoku === null ? '' : saimoku?.saimoku_ryaku_name ?? ''
  }, [props.form.values.other_cd, props.saimoku_map])

  return (
    <tr>
      <td>
        {props.month !== null ? (
          <>
            <TextInput
              maxLength={7}
              {...props.form.getInputProps('date_yymm')}
              readOnly
              disabled
              styles={() => ({
                root: { width: '80px', display: 'inline-block' },
              })}
            />
            <TextInput
              value={props.form.values.date_dd}
              maxLength={2}
              {...props.form.getInputProps('date_dd')}
              onKeyDown={onSave}
              onBlur={(e) => {
                const day = e.currentTarget.value
                if (day.length === 1) {
                  props.form.setFieldValue('date_dd', `0${day}`)
                }
              }}
              error={null}
              styles={() => ({
                root: { width: '50px', display: 'inline-block' },
                input: {
                  ...(LedgerCreateRequestForm.hasError('date_dd', props.form)
                    ? { borderColor: 'red' }
                    : {}),
                },
              })}
            />
          </>
        ) : (
          <TextInput
            maxLength={8}
            {...props.form.getInputProps('date')}
            styles={() => ({
              root: { width: '110px' },
            })}
          />
        )}
      </td>
      <td>
        <div style={{ width: '100%', position: 'relative' }}>
          <Autocomplete
            value={props.form.values.other_cd}
            data={props.saimoku_list.map((s) => s.saimoku_cd)}
            filter={({ options, search }) => {
              return (options as ComboboxItem[]).filter((option) => {
                const key = search.trim().toLowerCase()
                if (key.length === 0) {
                  return true
                }
                const saimoku = props.saimoku_map.get(option.value)!
                const saimoku_cd = saimoku.saimoku_cd.toLowerCase()
                const kana = saimoku.saimoku_kana_name.toLowerCase()
                return saimoku_cd.includes(key) || kana.includes(key)
              })
            }}
            renderOption={({ option }) => {
              const saimoku = props.saimoku_map.get(option.value)!
              return (
                <div>{`${option.value}:${saimoku.saimoku_ryaku_name}`}</div>
              )
            }}
            onChange={(value: string) => {
              LedgerCreateRequestForm.set('other_cd', props.form, value)
            }}
            onBlur={(e) => {
              const keyword = e.currentTarget.value.toLowerCase()
              const results = props.saimoku_list.filter((s) => {
                const code = s.saimoku_cd.toLowerCase()
                const kana = s.saimoku_kana_name
                return code.includes(keyword) || kana.includes(keyword)
              })
              if (results.length === 1) {
                LedgerCreateRequestForm.set(
                  'other_cd',
                  props.form,
                  results[0].saimoku_cd,
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
          value={other_cd_name}
          className="w-16"
          disabled
          readOnly
        />
      </td>
      <td>
        <AmountInputForCreate
          input_key="karikata_value"
          form={props.form}
          onSave={onSave}
        />
      </td>
      <td>
        <AmountInputForCreate
          input_key="kasikata_value"
          form={props.form}
          onSave={onSave}
        />
      </td>
      <td>
        <TextInput
          value={props.form.values.note}
          {...props.form.getInputProps('note')}
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

const LedgerListRows: FC<{
  nendo: Nendo
  ledger_cd: string
  month: Month | null
  pageNo: PageNo
  pageSize: PageSize
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
            <TextInput
              value={item.date_full}
              {...form.getInputProps(`items.${index}.date_full`)}
              maxLength={8}
              styles={() => ({
                root: { width: '110px' },
              })}
            />
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
          <TextInput
            value={item.note}
            {...form.getInputProps(`items.${index}.note`)}
            className={'w-96'}
          />
        </td>
        <td>
          <TextInput
            value={Amount.create(item.acc).toFormatedString()}
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
          <Button
            color="red"
            onClick={() => {
              dispatch(
                deleteJournal({
                  request: { journal_id: item.journal_id, nendo: item.nendo },
                  next: [
                    loadLedgerList({
                      nendo: toNendoString(nendo),
                      ledger_cd,
                      month: toMonthString(month),
                      page_no: toPageNo(pageNo),
                      page_size: toPageSize(pageSize),
                    }),
                  ],
                }),
              )
            }}
          >
            Delete
          </Button>
        </td>
      </tr>
    )
  })
}

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
        if (!LedgerCreateRequestForm.hasError(input_key, form)) {
          const amount = Amount.fromString(e.currentTarget.value)
          if (amount != null) {
            LedgerCreateRequestForm.set(
              input_key,
              form,
              amount.toFormatedString(),
            )
          }
        }
      }}
      onFocus={(e) => {
        const amount = Amount.fromString(e.currentTarget.value)
        if (amount != null) {
          LedgerCreateRequestForm.set(input_key, form, amount.toRawString())
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
        if (!LedgerUpdateRequestForm.hasError(input_key, form, index)) {
          const amount = Amount.fromString(e.currentTarget.value)
          if (amount != null) {
            LedgerUpdateRequestForm.set(
              input_key,
              form,
              index,
              amount.toFormatedString(),
            )
          }
        }
      }}
      onFocus={(e) => {
        const amount = Amount.fromString(e.currentTarget.value)
        if (amount != null) {
          LedgerUpdateRequestForm.set(
            input_key,
            form,
            index,
            amount.toRawString(),
          )
        }
      }}
      onKeyDown={onSave}
    />
  )
}
