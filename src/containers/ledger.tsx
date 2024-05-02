import { FC, createRef, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { DateTime } from 'luxon'
import Numeral from 'numeral'
import { useDebouncedCallback } from 'use-debounce'

import { Alert, Autocomplete, ComboboxItem, TextInput } from '@mantine/core'
import { UseFormReturnType, useForm, zodResolver } from '@mantine/form'
import { saimoku_masters } from '@prisma/client'

import { getPageList } from '@/misc/page'
import {
  LedgerCreateRequestForm,
  LedgerCreateRequestSchema,
  LedgerSearchResponse,
} from '@/models/ledger'
import { AppDispatch, RootState } from '@/store'
import { updateJournal } from '@/store/journal'
import { ledgerActions, loadLedgerList } from '@/store/ledger'
import { selectNendoMap, selectSaimokuMap } from '@/store/master'

interface LedgerListProps {
  nendo: string
  ledger_cd: string
  ledger_month: string | null
  page_no: number
  page_size: number
}

const AmountInput: FC<{
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

export const LedgerList: FC<LedgerListProps> = ({
  nendo,
  ledger_cd,
  ledger_month,
  page_no,
  page_size,
}) => {
  const { data: ledgerState } = useSelector((state: RootState) => state.ledger)
  const saimokuMap = useSelector(selectSaimokuMap)

  // const history = useNavigate();
  // const { loadLedger } = useActions();
  // const state = useState();
  // const saimokuMap = useSelector(selectSaimokuMap);

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(
      loadLedgerList({
        nendo,
        ledger_cd,
        month: ledger_month,
        page_no,
        page_size,
      }),
    )
  }, [dispatch, ledger_cd, ledger_month, nendo, page_no, page_size])

  const ledgerListRows: (
    | { isNewRow: true; journal_id: number }
    | LedgerSearchResponse
  )[] = [{ isNewRow: true, journal_id: -1 }, ...ledgerState.ledger_list]

  const pageInfo = getPageList(page_no, ledgerState.all_count, page_size)

  const create_form = useForm<LedgerCreateRequestForm>({
    initialValues: {
      nendo,
      ledger_cd,
      date_full: '',
      date_yymm: ledger_month ? `${nendo}/${ledger_month}` : '',
      date_dd: '',
      other_cd: '',
      karikata_value: '',
      kasikata_value: '',
      note: '',
    },
    validate: zodResolver(LedgerCreateRequestSchema),
  })

  return (
    <div className="ledgerList">
      <h1 className="subTitle">
        台帳:
        {saimokuMap.get(ledger_cd)?.saimoku_full_name}
        {ledger_month !== 'all' ? ` - ${ledger_month}月分 ` : ''}
      </h1>
      {Object.keys(create_form.errors).length > 0 && (
        <Alert
          variant="light"
          color="red"
          title="Failed to creating new ledgger."
        >
          <ul>
            {Object.keys(create_form.errors).map((key) => {
              return <li key={key}>{key}</li>
            })}
          </ul>
        </Alert>
      )}
      <div>
        <span className="pageSummary">
          {`${pageInfo.from}-${pageInfo.to}`}件(全
          {ledgerState.all_count ?? '0'}件)
        </span>
        <span className="pageList">
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
      <div className="ledgerList">
        <table>
          <thead className="ledgerHeader">
            <tr>
              <th>登録日</th>
              <th className="ledgerHeader-anotherCd" colSpan={2}>
                相手科目
              </th>
              <th className="ledgerHeader-karikataValue">金額(借方)</th>
              <th className="ledgerHeader-kasikataValue">金額(貸方)</th>
              <th className="ledgerHeader-note">備考</th>
              <th className="ledgerHeader-acc">累計</th>
              <th className="ledgerHeader-delete">
                <br />
              </th>
            </tr>
          </thead>
          <tbody className="ledgerBody">
            {ledgerListRows.map((row) => {
              if ('isNewRow' in row) {
                return (
                  <LedgerListNewRow
                    key={row.journal_id}
                    form={create_form}
                    nendo={nendo}
                    ledgerCd={ledger_cd}
                    ledgerMonth={ledger_month}
                    pageNo={page_no}
                    pageSize={page_size}
                  />
                )
              } else {
                return (
                  <tr key={row.journal_id}></tr>
                  // <LedgerListRow
                  //   key={row.journal_id}
                  //   nendo={nendo}
                  //   ledgerCd={ledger_cd}
                  //   ledgerMonth={ledger_month}
                  //   pageNo={page_no}
                  //   pageSize={page_size}
                  //   ledger={row}
                  // />
                )
              }
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const toNumber = (s: string | undefined) => {
  if (s == null) {
    return null
  }
  if (s.length === 0) {
    return null
  }
  return Numeral(s).value()
}

export const toRawDate = (dateStr: string) => {
  const date1 = DateTime.fromFormat(dateStr, 'yyyymmdd')
  const date2 = DateTime.fromFormat(dateStr, 'yyyy/mm/dd')
  if (date1.invalidReason == null) {
    return dateStr
  }
  if (date2.invalidReason == null) {
    return date2.toFormat('yyyymmdd')
  }
  throw new Error()
}

export const filterSaimokuList = (
  saimokuList: saimoku_masters[],
  cd: string,
) => {
  return saimokuList.flatMap((s) => {
    if (s.saimoku_cd.toLowerCase().startsWith(cd.toLowerCase())) {
      return [s]
    }
    if (s.saimoku_kana_name.toLowerCase().includes(cd.toLowerCase())) {
      return [s]
    }
    return []
  })
}

// 更新後に必要な処理
// 金額等を更新すると累計金額が全体的に変更されるため全データを取り直す必要がある。
export const createReloadLedger =
  (
    nendo: string,
    ledgerCd: string,
    ledgerMonth: string | null,
    pageNo: number,
    pageSize: number,
  ) =>
  (needClear?: boolean) => {
    const ret = []
    if (needClear) {
      // 日付を変更する場合、データの並び順が変わってしまうがその場合、
      // 再描画で行が重複してしまう(※原因要調査)ため事前にクリア処理をする。
      // ただしクリアするとフォーカスを失う模様。
      ret.push(ledgerActions.setLedgerList({ all_count: 0, ledger_list: [] }))
    }
    ret.push(
      loadLedgerList({
        nendo: nendo,
        ledger_cd: ledgerCd,
        month: ledgerMonth,
        page_no: pageNo,
        page_size: pageSize,
      }),
    )
    return ret
  }

export const getTargetYYYYMM = (dateStr: string) => {
  const date = DateTime.fromFormat(dateStr, 'yyyymmdd')
  let nendoStr = date.toFormat('yyyy')
  const mmStr = date.toFormat('mm')
  if ([1, 2, 3].includes(Number(mmStr))) {
    nendoStr = `${Number(nendoStr) + 1}`
  }
  return `${nendoStr}/${mmStr}`
}

const LedgerListRow = (props: {
  nendo: string
  ledgerCd: string
  ledgerMonth: string | null
  pageNo: number
  pageSize: number
  ledger: LedgerSearchResponse
}) => {
  const dispatch = useDispatch<AppDispatch>()

  //const { updateJournal, deleteJournal, updateLedger } = useActions();
  const { data: masters } = useSelector((state: RootState) => state.masters)
  const saimokuList = masters.saimoku_list
  const saimokuMap = useSelector(selectSaimokuMap)
  const nendoMap = useSelector(selectNendoMap)

  const [dateStr, setDate] = useState(props.ledger.date)
  const [dateStrDD, setDateDD] = useState(props.ledger.date.substr(6, 2))
  // prettier-ignore
  const [kariValueStr, setKariValue] = useState(`${props.ledger.karikata_value}`);
  // prettier-ignore
  const [kasiValueStr, setKasiValue] = useState(`${props.ledger.kasikata_value}`);
  const [cd, setCd] = useState(props.ledger.another_cd)
  const [cdName, setCdName] = useState('')
  const [cdSelectMode, setCdSelectMode] = useState(false)
  const [filterdSaimokuList, setFilterdSaimokuList] = useState(
    [] as saimoku_masters[],
  )
  const [note, setNote] = useState(props.ledger.note)

  const updateNoteDebounced = useDebouncedCallback((note: string) => {
    dispatch(
      updateJournal({
        id: props.ledger.journal_id,
        journal: { note },
        nextActions: [],
      }),
    )
  }, 1500)

  useEffect(() => {
    const filterdSaimokuList = filterSaimokuList(saimokuList, cd)
    setFilterdSaimokuList(filterdSaimokuList)
  }, [cd, saimokuList])

  return (
    <tr>
      <td>
        {props.ledgerMonth !== 'all' ? (
          <>
            <input
              type="text"
              maxLength={6}
              readOnly
              disabled
              className="w-18"
            />
            <input
              type="text"
              maxLength={2}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setDateDD(e.target.value)
              }}
            />
          </>
        ) : (
          <input type="text" maxLength={8} />
        )}
      </td>
      <td className="ledgerBody-anotherCd">
        <div className="cdSelect">
          <input type="text" />
        </div>
      </td>
      <td className="ledgerBody-otherCdName">
        <input type="text" className="w-24" disabled readOnly />
      </td>
      <td className="ledgerBody-karikataValue">
        <input type="text" />
      </td>
      <td className="ledgerBody-kasikataValue">
        <input type="text" value={kasiValueStr} />
      </td>
      <td className="ledgerBody-note">
        <input
          type="text"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setNote(e.target.value)
            updateNoteDebounced(e.target.value)
          }}
          className="w-24"
        />
      </td>
      <td className="ledgerBody-acc">
        <input
          type="text"
          value={Numeral(props.ledger.acc).format('0,0')}
          disabled
          className="w-28 text-right num readonly"
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
}

const isEmpty = (str: string) => str == null || str.length === 0

export const LedgerListNewRow = (props: {
  form: UseFormReturnType<LedgerCreateRequestForm>
  nendo: string
  ledgerCd: string
  ledgerMonth: string | null
  pageNo: number
  pageSize: number
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const form = props.form

  //const { createLedger } = useActions();
  const { data: masters } = useSelector((state: RootState) => state.masters)
  const saimokuList = masters.saimoku_list
  const saimokuMap = useSelector(selectSaimokuMap)
  const nendoMap = useSelector(selectNendoMap)

  const [dateStr, setDate] = useState('')

  const [dateStrDD, setDateDD] = useState('')

  const [kariValueStr, setKariValue] = useState('')
  const [kasiValueStr, setKasiValue] = useState('')
  const [cd, setCd] = useState('')
  const [cdName, setCdName] = useState('')
  const [cdSelectMode, setCdSelectMode] = useState(false)
  const [filterdSaimokuList, setFilterdSaimokuList] = useState(
    [] as saimoku_masters[],
  )
  const [note, setNote] = useState('')

  const dateRef = createRef<HTMLInputElement>()
  const kariRef = createRef<HTMLInputElement>()
  const kasiRef = createRef<HTMLInputElement>()

  const reloadLedger = createReloadLedger(
    props.nendo,
    props.ledgerCd,
    props.ledgerMonth,
    props.pageNo,
    props.pageSize,
  )

  const save = () => {
    const { hasErrors } = form.validate()
    if (hasErrors) {
      return
    }
    const { success, data } = LedgerCreateRequestSchema.safeParse(form.values)
    if (success) {
      console.log('create: ', data)
      //dispatch(createLedger(data))
    }
  }

  const onSave = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      save()
    }
  }

  useEffect(() => {
    const filterdSaimokuList = filterSaimokuList(saimokuList, cd)
    setFilterdSaimokuList(filterdSaimokuList)
  }, [cd, saimokuList])

  const [other_cd_name, setOtherCdName] = useState('')

  return (
    <tr>
      <td>
        {props.ledgerMonth !== 'all' ? (
          <>
            <TextInput
              type="text"
              value={form.values.date_yymm}
              maxLength={6}
              readOnly
              disabled
              styles={() => ({
                root: { width: '80px', display: 'inline-block' },
              })}
            />
            <TextInput
              type="text"
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
            data={filterdSaimokuList.map((s) => s.saimoku_cd)}
            filter={({ options, search }) => {
              return (options as ComboboxItem[]).filter((option) => {
                const key = search.trim().toLowerCase()
                if (key.length === 0) {
                  return true
                }
                const saimoku = saimokuMap.get(option.value)!
                const saimoku_cd = saimoku.saimoku_cd.toLowerCase()
                const kana = saimoku.saimoku_kana_name.toLowerCase()
                return saimoku_cd.includes(key) || kana.includes(key)
              })
            }}
            renderOption={({ option }) => {
              const saimoku = saimokuMap.get(option.value)!
              return (
                <div>{`${option.value}:${saimoku.saimoku_ryaku_name}`}</div>
              )
            }}
            onChange={(value: string) => {
              LedgerCreateRequestForm.set('other_cd', form, value)
            }}
            onBlur={(e) => {
              const keyword = e.currentTarget.value.toLowerCase()
              const results = saimokuList.filter((s) => {
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
          {/* <TextInput
            className="w-12"
            {...form.getInputProps('other_cd')}
            value={form.values.other_cd}
            // onChange={(e) => {
            //   const num = Number(e.currentTarget.value)
            //   form.setFieldValue('karikata_value', isNaN(num) ? null : num)
            // }}
            //error={null}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                console.log('enter')
                const result = form.validate()
                console.log(result)
                //form.onSubmit({})
                //const result = LedgerCreateRequestSchema.safeParse(form.values)
                //console.log(result)
                //save()
              }
            }}
          /> */}
          {/* <input
            type="text"
            value={cd}
            onChange={(e: React.FocusEvent<HTMLInputElement>) => {
              setCd(e.target.value)
            }}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              setCdSelectMode(true)
            }}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
              setCdSelectMode(false)
              const otherCd = e.target.value.toUpperCase()
              if (saimokuMap.has(otherCd)) {
                setCd(otherCd)
                setCdName(saimokuMap.get(otherCd)!.saimoku_ryaku_name)
              } else if (filterdSaimokuList.length === 1) {
                setCd(filterdSaimokuList[0].saimoku_cd)
                setCdName(filterdSaimokuList[0].saimoku_ryaku_name)
              } else {
                setCd('')
              }
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                save()
              }
            }}
            className={`w-12 search ${
              props.error.cd_required != null || props.error.cd_invalid != null
                ? 'error'
                : ''
            }`}
          /> */}
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
        <AmountInput input_key="karikata_value" form={form} onSave={onSave} />
      </td>
      <td>
        <AmountInput input_key="kasikata_value" form={form} onSave={onSave} />
      </td>
      <td>
        <input
          type="text"
          value={note}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setNote(e.target.value)
          }}
          onKeyDown={onSave}
          onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
            save()
          }}
          className="w-24"
        />
      </td>
      <td>
        <br />
      </td>
    </tr>
  )
}
