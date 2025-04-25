'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { FC, useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Alert,
  Autocomplete,
  ComboboxItem,
  LoadingOverlay,
  Modal,
  Pagination,
  TextInput
} from '@mantine/core'
import { UseFormReturnType, useForm, zodResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'

import { AppDispatch, RootState } from '@/store'
import { appActions } from '@/store/app'
import { deleteJournal, journalActions } from '@/store/journal'
import {
  createLedger,
  ledgerActions,
  loadLedgerList,
  updateLedger,
} from '@/store/ledger'
import {
  loadNendo,
  loadSaimoku,
  selectNendoMap,
  selectSaimokuMap,
} from '@/store/master'

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

export default function Page() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const searchParams = useSearchParams()

  const app_state = useSelector((state: RootState) => state.app)
  const masters_state = useSelector((state: RootState) => state.masters)

  const nendo_list = useMemo(() => {
    if (masters_state.nendo_list.error) {
      return []
    }
    const nendo_list = masters_state.nendo_list.data.map((n) => {
      return {
        value: n.nendo,
        label: n.nendo,
      }
    })
    return nendo_list
  }, [masters_state.nendo_list])

  const saimoku_list_options = useMemo(() => {
    if (masters_state.saimoku_list.error) {
      return []
    }
    const saimoku_list = masters_state.saimoku_list.data.map((s) => {
      return {
        value: `${s.saimoku_cd}`,
        label: `${s.saimoku_cd}: ${s.saimoku_full_name} (${s.count})`,
      }
    })
    return saimoku_list
  }, [masters_state.saimoku_list])

  const month_list = useMemo(() => {
    const list = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3].map((month) => ({
      value: `${month}`,
      label: `${month}月`,
    }))
    return list
  }, [])

  const nendo_map = useSelector(selectNendoMap)
  const nendo = Nendo.create(
    app_state.selected_nendo,
    Array.from(nendo_map.keys()),
  )

  const [_, month] = Month.create(app_state.selected_month)

  const page_no = PageNo.create(1)
  const page_size = PageSize.create(10)

  useEffect(() => {
    dispatch(loadNendo())
  }, [dispatch])

  useEffect(() => {
    if (!masters_state.nendo_list.loading && !masters_state.nendo_list.error) {
      const urlNendo = searchParams.get('nendo')
      if (urlNendo && masters_state.nendo_list.data.some(n => n.nendo === urlNendo)) {
        dispatch(appActions.setNendo(urlNendo))
      }
    }
  }, [dispatch, masters_state.nendo_list, searchParams])

  useEffect(() => {
    if (app_state.selected_nendo !== "") {
      dispatch(loadSaimoku(app_state.selected_nendo))
    }
  }, [dispatch, app_state.selected_nendo])

  useEffect(() => {
    if (!masters_state.saimoku_list.loading && !masters_state.saimoku_list.error) {
      const urlCode = searchParams.get('code')
      if (urlCode && masters_state.saimoku_list.data.some(s => s.saimoku_cd === urlCode)) {
        dispatch(appActions.setLedgerCd(urlCode))
      }
    }
  }, [dispatch, masters_state.saimoku_list, searchParams])

  useEffect(() => {
    if (app_state.selected_ledger_cd !== "") {
      const urlMonth = searchParams.get('month')
      if (urlMonth && month_list.some(m => m.value === urlMonth)) {
        dispatch(appActions.setMonth(urlMonth))
      }
    }
  }, [dispatch, app_state.selected_ledger_cd, searchParams])

  const updateUrlParams = (nendo: string, code?: string, month?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (nendo === "") {
      params.delete('nendo')
      params.delete('code')
      params.delete('month')
    } else {
      params.set('nendo', nendo)
      if (code) {
        params.set('code', code)
        if (month) {
          params.set('month', month)
        } else {
          params.delete('month')
        }
      } else {
        params.delete('code')
        params.delete('month')
      }
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>元帳検索</CardTitle>
          <CardDescription>
            表示する元帳の条件を指定してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fiscal-year">会計年度</Label>
              <Select
                value={app_state.selected_nendo || ""}
                onValueChange={(value) => {
                  if (value === "unset") {
                    // Reset all conditions
                    dispatch(appActions.setNendo(""))
                    dispatch(appActions.setLedgerCd(""))
                    dispatch(appActions.setMonth(""))
                    updateUrlParams("")
                  } else {
                    dispatch(appActions.setNendo(value))
                    updateUrlParams(value)
                  }
                }}
              >
                <SelectTrigger id="fiscal-year">
                  <SelectValue placeholder="会計年度を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unset">未設定</SelectItem>
                  {nendo_list.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-code">勘定科目</Label>
              <Select
                value={app_state.selected_ledger_cd || ""}
                onValueChange={(saimoku_cd) => {
                  if (saimoku_cd === "unset") {
                    // Reset this condition and the month
                    dispatch(appActions.setLedgerCd(""))
                    dispatch(appActions.setMonth(""))
                    updateUrlParams(app_state.selected_nendo)
                  } else {
                    dispatch(appActions.setLedgerCd(saimoku_cd))
                    updateUrlParams(app_state.selected_nendo, saimoku_cd)
                  }
                }}
                disabled={app_state.selected_nendo === ""}
              >
                <SelectTrigger id="account-code">
                  <SelectValue placeholder="勘定科目を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unset">未設定</SelectItem>
                  {saimoku_list_options.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="month">月</Label>
              <Select
                value={app_state.selected_month || ""}
                onValueChange={(month) => {
                  if (month === "unset") {
                    // Reset only the month
                    dispatch(appActions.setMonth(""))
                    updateUrlParams(app_state.selected_nendo, app_state.selected_ledger_cd)
                  } else {
                    dispatch(appActions.setMonth(month))
                    updateUrlParams(app_state.selected_nendo, app_state.selected_ledger_cd, month)
                  }
                }}
                disabled={app_state.selected_ledger_cd === ""}
              >
                <SelectTrigger id="month">
                  <SelectValue placeholder="月を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unset">未設定</SelectItem>
                  {month_list.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <LoadingOverlay
        visible={
          masters_state.nendo_list.loading ||
          masters_state.saimoku_list.loading
        }
        zIndex={1000}
        overlayProps={{ radius: 'sm' }}
        loaderProps={{ type: 'dots' }}
      />

      {nendo && app_state.selected_ledger_cd !== "" ? (
        <Card>
          <CardHeader>
            <CardTitle>元帳一覧</CardTitle>
            <CardDescription>
              {nendo.toString()}年度 {app_state.selected_ledger_cd}
              {month ? `${month}月` : '全期間'}の取引
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LedgerList
              nendo={nendo}
              ledger_cd={app_state.selected_ledger_cd}
              month={month}
              page_no={page_no}
              page_size={page_size}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

const LedgerList: FC<{
  nendo: Nendo
  ledger_cd: string
  month: Month | null
  page_no: PageNo
  page_size: PageSize
}> = ({ nendo, ledger_cd, month, page_no, page_size }) => {
  const dispatch = useDispatch<AppDispatch>()

  const masters_state = useSelector((state: RootState) => state.masters)
  const ledger_state = useSelector((state: RootState) => state.ledger)
  const journal_state = useSelector((state: RootState) => state.journal)
  const app_state = useSelector((state: RootState) => state.app)
  const saimoku_map = useSelector(selectSaimokuMap)

  const [ledger_error, ledger_list, ledger_count] = useMemo(() => {
    if (ledger_state.ledger_list.error) {
      return [true, [], 0]
    } else {
      return [
        false,
        ledger_state.ledger_list.data.list,
        ledger_state.ledger_list.data.all_count,
      ]
    }
  }, [ledger_state])

  const saimoku_list = useMemo(() => {
    if (masters_state.saimoku_list.error) {
      return []
    }
    return masters_state.saimoku_list.data.filter(
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
        page_no: app_state.page_no,
        page_size: app_state.page_size,
      }),
    )
    if (month) {
      create_form.setFieldValue('date_yymm', toNendoMonthString(nendo, month))
    } else {
      create_form.setFieldValue('date_yymm', '')
    }
    create_form.setFieldValue('nendo', toNendoString(nendo))
  }, [dispatch, ledger_cd, month, nendo, page_no, page_size]) // eslint-disable-line react-hooks/exhaustive-deps

  const page_count = getPageCount(ledger_count, page_size)

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
      items: ledger_list.map((item) => {
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

  const [
    isDeleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false)

  return (
    <div className="space-y-4">
      <Modal
        opened={isDeleteModalOpened}
        onClose={closeDeleteModal}
        title="Delete the Ledger"
      >
        <Button
          onClick={() => {
            if (!journal_state.delete_journal_id) {
              return
            }
            dispatch(
              deleteJournal({
                request: {
                  journal_id: journal_state.delete_journal_id,
                  nendo: toNendoString(nendo),
                },
                next: [
                  loadLedgerList({
                    nendo: toNendoString(nendo),
                    ledger_cd,
                    month: toMonthString(month),
                    page_no: toPageNo(page_no),
                    page_size: toPageSize(page_size),
                  }),
                  journalActions.setDeleteJournalId(null),
                ],
              }),
            )
          }}
        >
          Delete
        </Button>
      </Modal>

      <div className="bg-white">
        <div className="mb-4">
          <h2 className="text-xl">
            台帳:{saimoku_map.get(ledger_cd)?.saimoku_full_name}
          </h2>
          <p className="text-sm text-gray-500">
            {toNendoString(nendo)}年度 {month ? `${month}月分` : '全期間'}の取引
          </p>
        </div>

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

        <div className="mb-4">
          <Pagination
            value={app_state.page_no}
            total={page_count}
            siblings={2}
            onChange={(page_no) => {
              dispatch(appActions.setPageNo(page_no))
            }}
          />
        </div>

        <div className="border rounded-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-white">
                <th className="px-3 py-2 text-left font-normal text-gray-600 w-[130px]">
                  日付
                </th>
                <th className="px-3 py-2 text-left font-normal text-gray-600 w-[100px]">
                  相手科目
                </th>
                <th className="px-3 py-2 text-left font-normal text-gray-600 w-[100px]">
                  名称
                </th>
                <th className="px-3 py-2 text-right font-normal text-gray-600 w-[130px]">
                  借方 {target_account.kamoku_bunrui_type === 'L' ? '[+]' : '[-]'}
                </th>
                <th className="px-3 py-2 text-right font-normal text-gray-600 w-[130px]">
                  貸方 {target_account.kamoku_bunrui_type === 'R' ? '[+]' : '[-]'}
                </th>
                <th className="px-3 py-2 text-left font-normal text-gray-600">
                  摘要
                </th>
                <th className="px-3 py-2 text-right font-normal text-gray-600 w-[130px]">
                  残高
                </th>
                <th className="px-3 py-2 text-center font-normal text-gray-600 w-[80px]">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
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
                openDeleteModal={openDeleteModal}
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const LedgerListNewRow: FC<{
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
    // If all input fields are empty, end the process without doing anything.
    let canceled = true
    const excepts = ['date_yymm', 'nendo', 'ledger_cd']
    const values = props.form.getValues()
    for (const [key, value] of Object.entries(values)) {
      if (!excepts.includes(key) && value !== '') {
        canceled = false
        break
      }
    }

    if (canceled) {
      return
    }

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

  const ledger_state = useSelector((state: RootState) => state.ledger)

  useEffect(() => {
    if (
      !ledger_state.last_upserted.error &&
      ledger_state.last_upserted.data !== null
    ) {
      dispatch(ledgerActions.clearLastUpserted())
      const current_values = props.form.values
      props.form.reset()
      props.form.setFieldValue('nendo', current_values.nendo)
      props.form.setFieldValue('date_yymm', current_values.date_yymm)
      setTimeout(() => {
        date_ref.current?.focus()
      }, 0)
    }
  }, [dispatch, ledger_state.last_upserted, date_ref]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-3 py-2">
        {props.month !== null ? (
          <div className="flex gap-1">
            <TextInput
              {...props.form.getInputProps('date_yymm')}
              readOnly
              disabled
              styles={() => ({
                root: { width: '70px' },
                input: {
                  padding: '0 2px',
                  height: '28px',
                  backgroundColor: 'transparent',
                  border: '1px solid #d1d5db',
                },
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
                root: { width: '40px' },
                input: {
                  height: '28px',
                  padding: '0 4px',
                  backgroundColor: 'transparent',
                  border: '1px solid #e5e7eb',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  ...(LedgerCreateRequestForm.hasError('date', props.form)
                    ? { borderColor: 'red' }
                    : {}),
                },
              })}
            />
          </div>
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
              root: { width: '90px' },
              input: {
                height: '28px',
                padding: '0 4px',
                backgroundColor: 'transparent',
                border: '1px solid #e5e7eb',
                fontSize: '0.875rem',
                ...(LedgerCreateRequestForm.hasError('date', props.form)
                  ? { borderColor: 'red' }
                  : {}),
              },
            })}
          />
        )}
      </td>
      <td className="px-3 py-2">
        <div>
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
              root: { width: '60px' },
              input: {
                height: '28px',
                padding: '0 4px',
                backgroundColor: 'transparent',
                border: '1px solid #e5e7eb',
                fontSize: '0.875rem',
                ...(LedgerCreateRequestForm.hasError('other_cd', props.form)
                  ? { borderColor: 'red' }
                  : {}),
              },
            })}
            comboboxProps={{ width: '180px' }}
          />
        </div>
      </td>
      <td className="px-3 py-2">
        <TextInput
          type="text"
          value={other_cd_name}
          disabled
          readOnly
          styles={() => ({
            root: { width: '70px' },
            input: {
              height: '28px',
              padding: '0 4px',
              backgroundColor: 'transparent',
              border: '1px solid #e5e7eb',
              fontSize: '0.875rem',
            },
          })}
        />
      </td>
      <td className="px-3 py-2 text-right">
        <AmountInputForCreate input_key="karikata_value" form={props.form} />
      </td>
      <td className="px-3 py-2 text-right">
        <AmountInputForCreate input_key="kasikata_value" form={props.form} />
      </td>
      <td className="px-3 py-2">
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
          styles={() => ({
            root: { width: '100%' },
            input: {
              height: '28px',
              padding: '0 4px',
              backgroundColor: 'transparent',
              border: '1px solid #e5e7eb',
              fontSize: '0.875rem',
            },
          })}
        />
      </td>
      <td className="px-3 py-2 text-right text-gray-400">
        ---
      </td>
      <td className="px-3 py-2">
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
  openDeleteModal: () => void
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
  openDeleteModal: () => void
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
  openDeleteModal,
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
    <tr key={item.journal_id} className="hover:bg-gray-50">
      <td className="px-3 py-2">
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
              // 入力値を取得
              let inputValue = e.currentTarget.value;
              console.log('onBlur input value:', inputValue);

              // yyyyMMdd形式の場合、yyyy/MM/dd形式に変換
              if (/^\d{8}$/.test(inputValue)) {
                inputValue = `${inputValue.substring(0, 4)}/${inputValue.substring(4, 6)}/${inputValue.substring(6, 8)}`;
                console.log('Converted to yyyy/MM/dd format:', inputValue);
              }

              // 直接フォームの値を設定
              form.setFieldValue(`items.${index}.date`, inputValue);

              // バリデーションを実行
              console.log('Running validation');
              form.validate();
            }}
            maxLength={10}
            styles={() => ({
              root: { width: '90px' },
              input: {
                padding: '0 2px',
                height: '28px',
                backgroundColor: 'transparent',
                border: '1px solid #d1d5db',
                ...(LedgerUpdateRequestForm.hasError('date', form, index)
                  ? { borderColor: 'red' }
                  : {}),
              },
            })}
            disabled={fixed}
          />
        ) : (
          <div className="flex gap-1 w-full">
            <TextInput
              value={item.date_yymm}
              readOnly
              disabled
              styles={() => ({
                root: { width: '70px' },
                input: {
                  padding: '0 2px',
                  height: '28px',
                  backgroundColor: 'transparent',
                  border: '1px solid #d1d5db',
                },
              })}
            />
            <TextInput
              ref={date_ref}
              value={item.date_dd}
              {...form.getInputProps(`items.${index}.date_dd`)}
              maxLength={2}
              styles={() => ({
                root: { width: '40px' },
                input: {
                  padding: '0 2px',
                  height: '28px',
                  backgroundColor: 'transparent',
                  border: '1px solid #d1d5db',
                  textAlign: 'center',
                  ...(LedgerUpdateRequestForm.hasError('date', form, index)
                    ? { borderColor: 'red' }
                    : {}),
                },
              })}
              disabled={fixed}
              onBlur={(e) => {
                // 入力値を取得
                let day = e.currentTarget.value;
                console.log('onBlur date_dd value:', day);

                // 1桁の場合、2桁に変換
                if (day.length === 1) {
                  day = `0${day}`;
                  console.log('Converted to 2 digits:', day);
                }

                // date_yymmとdate_ddを組み合わせて日付を作成
                const dateYymm = item.date_yymm;
                const fullDate = `${dateYymm}/${day}`;
                console.log('Full date:', fullDate);

                // 日付を設定
                form.setFieldValue(`items.${index}.date_dd`, day);
                form.setFieldValue(`items.${index}.date`, fullDate);

                setTimeout(() => {
                  console.log('Running validation');
                  form.validate();
                });
              }}
              onFocus={() => {
                date_ref.current?.select()
              }}
              onMouseUp={() => {
                date_ref.current?.select()
              }}
            />
          </div>
        )}
      </td>
      <td className="px-3 py-2">
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
              root: { width: '60px' },
              input: {
                height: '28px',
                padding: '0 4px',
                backgroundColor: 'transparent',
                border: '1px solid #e5e7eb',
                fontSize: '0.875rem',
                ...(LedgerUpdateRequestForm.hasError('other_cd', form, index)
                  ? { borderColor: 'red' }
                  : {}),
              },
            })}
            comboboxProps={{ width: '180px' }}
          />
        </div>
      </td>
      <td className="px-3 py-2">
        <TextInput value={other_cd_name} className="w-16" disabled readOnly styles={() => ({
          root: { width: '70px' },
        })}/>
      </td>
      <td className="px-3 py-2 text-right">
        <AmountInputForUpdate
          input_key="karikata_value"
          form={form}
          index={index}
          disabled={fixed}
        />
      </td>
      <td className="px-3 py-2 text-right">
        <AmountInputForUpdate
          input_key="kasikata_value"
          form={form}
          index={index}
          disabled={fixed}
        />
      </td>
      <td className="px-3 py-2">
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
          styles={() => ({
            root: { width: '100%' },
            input: {
              height: '28px',
              padding: '0 4px',
              backgroundColor: 'transparent',
              border: '1px solid #e5e7eb',
              fontSize: '0.875rem',
            },
          })}
          disabled={fixed}
        />
      </td>
      <td className="px-3 py-2 text-right font-medium">
        <span className={Number(item.acc) < 0 ? 'text-red-500' : 'text-emerald-600'}>
          {Amount.create(item.acc).toFormatedString()}
        </span>
      </td>
      <td className="px-3 py-2 text-center">
        <button
          className="text-xs text-red-500 hover:text-red-600"
          disabled={fixed}
          onClick={() => {
            dispatch(journalActions.setDeleteJournalId(item.journal_id))
            openDeleteModal()
          }}
        >
          削除
        </button>
      </td>
    </tr>
  )
}

const AmountInputForCreate: FC<{
  input_key: 'karikata_value' | 'kasikata_value'
  form: UseFormReturnType<LedgerCreateRequestForm>
}> = ({ input_key, form }) => {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <TextInput
      ref={ref}
      styles={() => ({
        root: { width: '120px' },
        input: {
          height: '28px',
          padding: '0 4px',
          backgroundColor: 'transparent',
          border: '1px solid #e5e7eb',
          fontSize: '0.875rem',
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
    />
  )
}

const AmountInputForUpdate: FC<{
  input_key: 'karikata_value' | 'kasikata_value'
  form: UseFormReturnType<LedgerUpdateRequestForm>
  index: number
  disabled: boolean
}> = ({ input_key, form, index, disabled }) => {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <TextInput
      ref={ref}
      className="w-20"
      disabled={disabled}
      styles={() => ({
        input: {
          textAlign: 'right',
          padding: '0 2px',
          height: '28px',
          backgroundColor: 'transparent',
          border: '1px solid #d1d5db',
          ...(LedgerUpdateRequestForm.hasError(input_key, form, index)
            ? { borderColor: 'red', borderWidth: '1px', borderStyle: 'solid' }
            : {}),
          '&:focus': {
            borderColor: '#94a3b8',
            outline: 'none',
          },
        },
        root: {
          width: '100%',
        }
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
    />
  )
}
