import { FC, useEffect, useMemo, useRef } from 'react'
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

import { AppDispatch, RootState } from '@/store'
import { deleteJournal } from '@/store/journal'
import {
  createLedger,
  ledgerActions,
  loadLedgerList,
  updateLedger,
} from '@/store/ledger'
import { selectNendoMap, selectSaimokuMap } from '@/store/master'

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
  LedgerUpdateRequestFormItem,
  LedgerUpdateRequestFormSchema,
} from '@/models/ledger'
import { SaimokuWithSummary } from '@/models/master'
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

  const target_account = saimoku_map.get(ledger_cd)!

  const nendo_map = useSelector(selectNendoMap)
  const fixed = nendo_map.get(nendo.toString())?.fixed === '1'

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
    validate: zodResolver(LedgerUpdateRequestFormSchema),
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
          date: date_full,
          ledger_cd,
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
              return (
                <li key={key}>
                  {key}: {create_form.errors[key]}
                </li>
              )
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
              return (
                <li key={key}>
                  {key}: {update_form.errors[key]}
                </li>
              )
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
                <Text>
                  Debit
                  {target_account.kamoku_bunrui_type === 'L' ? ' [+]' : ' [-]'}
                </Text>
              </th>
              <th>
                <Text>
                  Credit
                  {target_account.kamoku_bunrui_type === 'R' ? ' [+]' : ' [-]'}
                </Text>
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
            {!fixed && (
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
            )}
            <LedgerListRows
              nendo={nendo}
              ledger_cd={ledger_cd}
              month={month}
              pageNo={page_no}
              pageSize={page_size}
              form={update_form}
              saimoku_map={saimoku_map}
              saimoku_list={saimoku_list}
              fixed={fixed}
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
  saimoku_map: Map<string, SaimokuWithSummary>
  saimoku_list: SaimokuWithSummary[]
}> = (props) => {
  const save = () => {
    const { hasErrors } = props.form.validate()
    if (hasErrors) {
      return
    }

    // Parse the input form and convert it into a request to be passed to the API.
    const { success, data } = LedgerCreateRequestFormSchema.safeParse(
      props.form.values,
    )

    if (!success) {
      return
    }

    let hasAdditionalErrors = false

    // Additional validation for date format.
    const date = data['date']
    if (!/^(\d{4}\/\d{2}\/\d{2})$/.test(date)) {
      props.form.setFieldError('date.format', 'Must be a yyyy/mm/dd.')
      hasAdditionalErrors = true
    }

    const journal_date = JournalDate.create(date)
    if (journal_date == null || !props.nendo.isInNendo(journal_date)) {
      const [from, to] = props.nendo.getRange('yyyy/MM/dd')
      props.form.setFieldError(
        'date.range',
        `Must be within the range ${from} to ${to}.`,
      )
      hasAdditionalErrors = true
    }

    data.date = date.replaceAll('/', '')

    // Additional validation for existence checks on the master data.
    const other_cd = data['other_cd']
    if (!props.saimoku_map.has(other_cd)) {
      props.form.setFieldError(
        'other_cd.existance',
        `Account code \`${other_cd}\` does not exist in master.`,
      )
      hasAdditionalErrors = true
    }

    // Additional validation for amount.
    const debit = data['karikata_value']
    const credit = data['kasikata_value']
    const both_null = debit === null && credit === null
    const both_notnull = debit !== null && credit !== null
    if (both_null || both_notnull) {
      props.form.setFieldError(
        'karikata_value|kasikata_value',
        `Either karikata_value or kasikata_value must be filled, but not both.`,
      )
      hasAdditionalErrors = true
    }

    if (hasAdditionalErrors) {
      return
    }

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
    date_ref.current?.focus()
  }

  const onSave = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // if (e.key === 'Enter') {
    //   save()
    // }
    if (
      e.key === 'Tab' &&
      !e.shiftKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.metaKey
    ) {
      save()
    }
  }

  const dispatch = useDispatch<AppDispatch>()

  const other_cd_name = useMemo(() => {
    const saimoku = props.saimoku_map.get(props.form.values.other_cd)
    return saimoku === null ? '' : saimoku?.saimoku_ryaku_name ?? ''
  }, [props.form.values.other_cd, props.saimoku_map])

  const date_ref = useRef<HTMLInputElement>(null)
  const counter_cd_ref = useRef<HTMLInputElement>(null)
  const note_ref = useRef<HTMLInputElement>(null)

  return (
    <tr>
      <td>
        {props.month !== null ? (
          <>
            <TextInput
              {...props.form.getInputProps('date_yymm')}
              readOnly
              disabled
              styles={() => ({
                root: { width: '80px', display: 'inline-block' },
              })}
            />
            <TextInput
              ref={date_ref}
              value={props.form.values.date_dd}
              maxLength={2}
              {...props.form.getInputProps('date_dd')}
              onBlur={(e) => {
                const { hasErrors } = props.form.validate()
                if (hasErrors) {
                  return
                }
                const day = e.currentTarget.value
                if (day.length === 1) {
                  props.form.setFieldValue('date_dd', `0${day}`)
                }
              }}
              onFocus={() => {
                date_ref.current?.select()
              }}
              onMouseUp={() => {
                date_ref.current?.select()
              }}
              error={null}
              styles={() => ({
                root: { width: '50px', display: 'inline-block' },
                input: {
                  ...(LedgerCreateRequestForm.hasError('date', props.form)
                    ? { borderColor: 'red' }
                    : {}),
                },
              })}
            />
          </>
        ) : (
          <TextInput
            ref={date_ref}
            {...props.form.getInputProps('date')}
            onFocus={(e) => {
              const date = JournalDate.create(e.currentTarget.value)
              if (date !== null) {
                LedgerCreateRequestForm.set(
                  'date',
                  props.form,
                  date.format('yyyyMMdd'),
                )
              }
              setTimeout(() => {
                date_ref.current?.select()
              })
            }}
            onBlur={(e) => {
              const date = JournalDate.create(e.currentTarget.value)
              if (date !== null) {
                LedgerCreateRequestForm.set(
                  'date',
                  props.form,
                  date.format('yyyy/MM/dd'),
                )
              }
              setTimeout(() => {
                props.form.validate()
              })
            }}
            error={null}
            maxLength={10}
            styles={() => ({
              root: { width: '110px' },
              input: {
                ...(LedgerCreateRequestForm.hasError('date', props.form)
                  ? { borderColor: 'red' }
                  : {}),
              },
            })}
          />
        )}
      </td>
      <td>
        <div style={{ width: '100%', position: 'relative' }}>
          <Autocomplete
            ref={counter_cd_ref}
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
              const { hasErrors } = props.form.validate()
              if (hasErrors) {
                return
              }
            }}
            onFocus={() => {
              counter_cd_ref.current?.select()
            }}
            onMouseUp={() => {
              counter_cd_ref.current?.select()
            }}
            className="w-14"
            styles={() => ({
              input: {
                ...(LedgerCreateRequestForm.hasError('other_cd', props.form)
                  ? { borderColor: 'red' }
                  : {}),
              },
            })}
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
        <AmountInputForCreate input_key="karikata_value" form={props.form} />
      </td>
      <td>
        <AmountInputForCreate input_key="kasikata_value" form={props.form} />
      </td>
      <td>
        <TextInput
          ref={note_ref}
          value={props.form.values.note}
          {...props.form.getInputProps('note')}
          onKeyDown={onSave}
          onFocus={() => {
            note_ref.current?.select()
          }}
          onMouseUp={() => {
            note_ref.current?.select()
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
  saimoku_map: Map<string, SaimokuWithSummary>
  saimoku_list: SaimokuWithSummary[]
  fixed: boolean
}> = (props) => {
  return props.form.values.items.map((item, index) => {
    return (
      <LedgerListRowItem
        key={item.journal_id}
        {...props}
        item={item}
        index={index}
      />
    )
  })
}

const LedgerListRowItem: FC<{
  nendo: Nendo
  ledger_cd: string
  month: Month | null
  form: UseFormReturnType<LedgerUpdateRequestForm>
  item: LedgerUpdateRequestFormItem
  index: number
  saimoku_map: Map<string, SaimokuWithSummary>
  saimoku_list: SaimokuWithSummary[]
  fixed: boolean
  pageNo: PageNo
  pageSize: PageSize
}> = ({
  item,
  index,
  form,
  saimoku_map,
  saimoku_list,
  fixed,
  nendo,
  ledger_cd,
  month,
  pageNo,
  pageSize,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const date_ref = useRef<HTMLInputElement>(null)
  const counter_cd_ref = useRef<HTMLInputElement>(null)
  const note_ref = useRef<HTMLInputElement>(null)

  const save = (update_row: LedgerUpdateRequestFormItem) => {
    const { hasErrors } = form.validate()
    if (hasErrors) {
      return
    }

    // Parse the input form and convert it into a request to be passed to the API.
    const { success, data } = LedgerUpdateRequestFormSchema.safeParse({
      items: [update_row],
    })

    if (!success) {
      return
    }

    const request = data.items[0]

    let hasAdditionalErrors = false
    // Additional validation for date format.
    const date = request.date
    if (!/^(\d{4}\/\d{2}\/\d{2})$/.test(date)) {
      form.setFieldError(`items.${index}.date.format`, 'Must be a yyyy/mm/dd.')
      hasAdditionalErrors = true
    }

    const journal_date = JournalDate.create(date)
    if (journal_date == null || !nendo.isInNendo(journal_date)) {
      const [from, to] = nendo.getRange('yyyy/MM/dd')
      form.setFieldError(
        `items.${index}.date.range`,
        `Must be within the range ${from} to ${to}.`,
      )
      hasAdditionalErrors = true
    }

    request.date = date.replaceAll('/', '')

    // Additional validation for existence checks on the master data.
    const other_cd = request.other_cd
    if (!saimoku_map.has(other_cd)) {
      form.setFieldError(
        `items.${index}.other_cd.existance`,
        `Account code \`${other_cd}\` does not exist in master.`,
      )
      hasAdditionalErrors = true
    }

    // Additional validation for amount.
    const debit = request.karikata_value
    const credit = request.kasikata_value
    const both_null = debit === null && credit === null
    const both_notnull = debit !== null && credit !== null
    if (both_null || both_notnull) {
      form.setFieldError(
        `items.${index}.karikata_value|kasikata_value`,
        `Either karikata_value or kasikata_value must be filled, but not both.`,
      )
      hasAdditionalErrors = true
    }

    if (hasAdditionalErrors) {
      return
    }

    dispatch(
      updateLedger({
        request: data.items[0],
        next: [
          loadLedgerList({
            nendo: toNendoString(nendo),
            ledger_cd: ledger_cd,
            month: toMonthString(month),
            page_no: toPageNo(pageNo),
            page_size: toPageSize(pageSize),
          }),
        ],
      }),
    )
  }

  const onSave = (update_row: LedgerUpdateRequestFormItem) => {
    return (e: React.KeyboardEvent<HTMLInputElement>) => {
      // if (e.key === 'Enter') {
      //   save(update_row)
      // }
      if (
        e.key === 'Tab' &&
        !e.shiftKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.metaKey
      ) {
        save(update_row)
      }
    }
  }

  const other_cd_name = useMemo(() => {
    const saimoku = saimoku_map.get(item.other_cd)
    return saimoku === null ? '' : saimoku?.saimoku_ryaku_name ?? ''
  }, [item.other_cd, saimoku_map])

  return (
    <tr key={item.journal_id}>
      <td>
        {month === null ? (
          <TextInput
            ref={date_ref}
            value={item.date}
            {...form.getInputProps(`items.${index}.date`)}
            onFocus={(e) => {
              const date = JournalDate.create(e.currentTarget.value)
              if (date !== null) {
                LedgerUpdateRequestForm.set(
                  'date',
                  form,
                  index,
                  date.format('yyyyMMdd'),
                )
              }
              setTimeout(() => {
                date_ref.current?.select()
              })
            }}
            onBlur={(e) => {
              const date = JournalDate.create(e.currentTarget.value)
              if (date !== null) {
                LedgerUpdateRequestForm.set(
                  'date',
                  form,
                  index,
                  date.format('yyyy/MM/dd'),
                )
              }
              setTimeout(() => {
                form.validate()
              })
            }}
            maxLength={10}
            styles={() => ({
              root: { width: '110px' },
              input: {
                ...(LedgerUpdateRequestForm.hasError('date', form, index)
                  ? { borderColor: 'red' }
                  : {}),
              },
            })}
            disabled={fixed}
          />
        ) : (
          <>
            <TextInput
              value={item.date_yymm}
              readOnly
              disabled
              styles={() => ({
                root: { width: '80px', display: 'inline-block' },
              })}
            />
            <TextInput
              ref={date_ref}
              value={item.date_dd}
              {...form.getInputProps(`items.${index}.date_dd`)}
              maxLength={2}
              styles={() => ({
                root: { width: '50px', display: 'inline-block' },
                input: {
                  ...(LedgerUpdateRequestForm.hasError('date', form, index)
                    ? { borderColor: 'red' }
                    : {}),
                },
              })}
              disabled={fixed}
              onBlur={(e) => {
                const { hasErrors } = form.validate()
                if (hasErrors) {
                  return
                }
                const day = e.currentTarget.value
                if (day.length === 1) {
                  form.setFieldValue(`items.${index}.date_dd`, `0${day}`)
                }
              }}
              onFocus={() => {
                date_ref.current?.select()
              }}
              onMouseUp={() => {
                date_ref.current?.select()
              }}
            />
          </>
        )}
      </td>
      <td>
        <div>
          <Autocomplete
            ref={counter_cd_ref}
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
              }
              const { hasErrors } = form.validate()
              if (hasErrors) {
                return
              }
            }}
            onFocus={() => {
              counter_cd_ref.current?.select()
            }}
            onMouseUp={() => {
              counter_cd_ref.current?.select()
            }}
            disabled={fixed}
            className="w-14"
            styles={() => ({
              input: {
                ...(LedgerUpdateRequestForm.hasError('other_cd', form, index)
                  ? { borderColor: 'red' }
                  : {}),
              },
            })}
            comboboxProps={{ width: '180px' }}
          />
        </div>
      </td>
      <td>
        <TextInput value={other_cd_name} className="w-16" disabled readOnly />
      </td>
      <td>
        <AmountInputForUpdate
          input_key="karikata_value"
          form={form}
          index={index}
          disabled={fixed}
        />
      </td>
      <td>
        <AmountInputForUpdate
          input_key="kasikata_value"
          form={form}
          index={index}
          disabled={fixed}
        />
      </td>
      <td>
        <TextInput
          ref={note_ref}
          value={item.note}
          {...form.getInputProps(`items.${index}.note`)}
          onKeyDown={onSave(item)}
          onFocus={() => {
            note_ref.current?.select()
          }}
          onMouseUp={() => {
            note_ref.current?.select()
          }}
          className={'w-96'}
          disabled={fixed}
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
          disabled={fixed}
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
}

const AmountInputForCreate: FC<{
  input_key: 'karikata_value' | 'kasikata_value'
  form: UseFormReturnType<LedgerCreateRequestForm>
  //onSave: (e: React.KeyboardEvent<HTMLInputElement>) => void
}> = ({ input_key, form /*onSave*/ }) => {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <TextInput
      ref={ref}
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
        const { hasErrors } = form.validate()
        if (hasErrors) {
          return
        }
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
        setTimeout(() => {
          ref.current?.select()
        })
      }}
      onMouseUp={() => {
        setTimeout(() => {
          ref.current?.select()
        })
      }}
      //onKeyDown={onSave}
    />
  )
}

const AmountInputForUpdate: FC<{
  input_key: 'karikata_value' | 'kasikata_value'
  form: UseFormReturnType<LedgerUpdateRequestForm>
  index: number
  //onSave: (e: React.KeyboardEvent<HTMLInputElement>) => void
  disabled: boolean
}> = ({ input_key, form, index, /*onSave,*/ disabled }) => {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <TextInput
      ref={ref}
      className={'w-24'}
      disabled={disabled}
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
        const { hasErrors } = form.validate()
        if (hasErrors) {
          return
        }
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
        setTimeout(() => {
          ref.current?.select()
        })
      }}
      onMouseUp={() => {
        setTimeout(() => {
          ref.current?.select()
        })
      }}
      //onKeyDown={onSave}
    />
  )
}
