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
  LedgerUpdateRequest,
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

  const [errors, setErrors] = useState(new Map() as LedgerListInputErrors)

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
      date: '',
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
              let error: LedgerListInputErrorItem = {}
              if (errors.has(`${row.journal_id}`)) {
                error = errors.get(`${row.journal_id}`) ?? {}
              }
              const setError: SetLedgerListInputError = (key, errorInfo) => {
                if (errorInfo.hasError) {
                  error = Object.assign({}, error)
                  error[key] = {
                    message: errorInfo.message,
                    targetId: errorInfo.targetId,
                  }
                  errors.set(`${row.journal_id}`, error)
                } else {
                  error = Object.assign({}, error)
                  delete error[key]
                  errors.set(`${row.journal_id}`, error)
                  if (Object.keys(error).length === 0) {
                    errors.delete(`${row.journal_id}`)
                  }
                }
              }
              const notifyError = () => {
                setErrors(new Map(errors))
              }
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
                    error={error}
                    setError={setError}
                    notifyError={notifyError}
                  />
                )
              } else {
                return (
                  <LedgerListRow
                    key={row.journal_id}
                    nendo={nendo}
                    ledgerCd={ledger_cd}
                    ledgerMonth={ledger_month}
                    pageNo={page_no}
                    pageSize={page_size}
                    ledger={row}
                    error={error}
                    setError={setError}
                    notifyError={notifyError}
                  />
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
  error: Readonly<LedgerListInputErrorItem>
  setError: SetLedgerListInputError
  notifyError: () => void
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

  const kariRef = createRef<HTMLInputElement>()
  const kasiRef = createRef<HTMLInputElement>()

  const reloadLedger = createReloadLedger(
    props.nendo,
    props.ledgerCd,
    props.ledgerMonth,
    props.pageNo,
    props.pageSize,
  )

  const updateDateDebounced = useDebouncedCallback((dateStr: string) => {
    dispatch(
      updateJournal({
        id: props.ledger.journal_id,
        journal: { date: dateStr },
        nextActions: reloadLedger(true),
      }),
    )
  }, 1500)

  const updateNoteDebounced = useDebouncedCallback((note: string) => {
    dispatch(
      updateJournal({
        id: props.ledger.journal_id,
        journal: { note },
        nextActions: [],
      }),
    )
  }, 1500)

  const updateLedgerDebounced = useDebouncedCallback(
    (request: LedgerUpdateRequest) => {
      //updateLedger(request.id, request, reloadLedger(false));
    },
    1500,
  )

  const updateDate = (dateStr: string) => {
    props.setError('date_required', { hasError: false })
    props.setError('date_format', { hasError: false })
    props.setError('date_nendo_range', { hasError: false })
    props.setError('date_month_range', { hasError: false })
    if (dateStr == null || dateStr.length === 0) {
      props.setError('date_required', {
        hasError: true,
        message: '日付が未入力です',
        targetId: ['date'],
      })
      return
    }
    const date = DateTime.fromFormat(dateStr, 'yyyymmdd')
    if (date.invalidReason != null) {
      props.setError('date_format', {
        hasError: true,
        message: `日付が不正です: ${dateStr}`,
        targetId: ['date'],
      })
      return
    }

    const nendoMaster = nendoMap.get(props.nendo)
    const isDateInNendoRange = (d: string) => {
      if (nendoMaster == null) {
        return false
      }
      if (!(d >= nendoMaster.start_date && d <= nendoMaster.end_date)) {
        return false
      }
      return true
    }
    if (!isDateInNendoRange(dateStr)) {
      props.setError('date_nendo_range', {
        hasError: true,
        message: `対象年度内の日付で入力してください: ${DateTime.fromFormat(
          dateStr,
          'yyyymmdd',
        ).toFormat('yyyy/mm/dd')}`,
        targetId: ['date'],
      })
      return
    }

    if (
      props.ledgerMonth !== 'all' &&
      dateStr.substr(4, 2) !== props.ledgerMonth
    ) {
      props.setError('date_month_range', {
        hasError: true,
        message: `対象月内の日付で入力してください: ${DateTime.fromFormat(
          dateStr,
          'yyyymmdd',
        ).toFormat('yyyy/mm/dd')}`,
        targetId: ['date'],
      })
      return
    }
    updateDateDebounced(dateStr)
  }

  // 借方金額更新処理
  const updateKariValue = (valueStr: string) => {
    props.setError('kari_format', { hasError: false })
    props.setError('kari_negative', { hasError: false })
    const ret = updateValues(valueStr, kasiRef.current!.value)
    if (!ret) {
      return
    }
    if (!isEmpty(valueStr)) {
      const numeral = Numeral(valueStr)
      const value = numeral.value()
      if (value == null) {
        props.setError('kari_format', {
          hasError: true,
          message: `数値で入力してください: ${valueStr}`,
          targetId: ['karikata_value'],
        })
        return
      }
      if (value <= 0) {
        props.setError('kari_negative', {
          hasError: true,
          message: `正の数値を入力してください: ${valueStr}`,
          targetId: ['karikata_value'],
        })
        return
      }
    }
    if (hasError(props.error, 'kasi_format', 'kasi_negative')) {
      return
    }
    updateLedgerDebounced({
      id: props.ledger.journal_id,
      ledger_cd: props.ledgerCd,
      other_cd: props.ledger.another_cd,
      karikata_value: toNumber(valueStr),
      kasikata_value: toNumber(kasiRef.current?.value),
    })
  }

  // 貸方金額更新処理
  const updateKasiValue = (valueStr: string) => {
    props.setError('kasi_format', { hasError: false })
    props.setError('kasi_negative', { hasError: false })
    const ret = updateValues(valueStr, kariRef.current!.value)
    if (!ret) {
      return
    }
    if (!isEmpty(valueStr)) {
      const numeral = Numeral(valueStr)
      const value = numeral.value()
      if (value == null) {
        props.setError('kasi_format', {
          hasError: true,
          message: `数値で入力してください: ${valueStr}`,
          targetId: ['kasikata_value'],
        })
        return
      }
      if (value <= 0) {
        props.setError('kasi_negative', {
          hasError: true,
          message: `正の数値を入力してください: ${valueStr}`,
          targetId: ['kasikata_value'],
        })
        return
      }
    }
    if (hasError(props.error, 'kari_format', 'kari_negative')) {
      return
    }
    updateLedgerDebounced({
      id: props.ledger.journal_id,
      ledger_cd: props.ledgerCd,
      other_cd: props.ledger.another_cd,
      karikata_value: toNumber(kariRef.current?.value),
      kasikata_value: toNumber(valueStr),
    })
  }

  // 借方・貸方関連チェック
  // どちらか片方だけが入力されていることをチェックする
  const updateValues = (kariValueStr: string, kasiValueStr: string) => {
    props.setError('value_both', { hasError: false })
    props.setError('value_neither', { hasError: false })
    if (isEmpty(kariValueStr) && isEmpty(kasiValueStr)) {
      props.setError('value_neither', {
        hasError: true,
        message: '金額が入力されていません',
        targetId: ['karikata_value', 'kasikata_value'],
      })
      return false
    }
    if (!isEmpty(kariValueStr) && !isEmpty(kasiValueStr)) {
      props.setError('value_neither', {
        hasError: true,
        message: '金額は借方・貸方どちらか一方のみ入力できます',
        targetId: ['karikata_value', 'kasikata_value'],
      })
      return false
    }
    return true
  }

  const updateCd = (otherCd: string) => {
    props.setError('cd_required', { hasError: false })
    props.setError('cd_invalid', { hasError: false })
    if (otherCd.length === 0) {
      props.setError('cd_required', {
        hasError: true,
        message: '相手科目コードが入力されていません',
        targetId: ['another_cd'],
      })
      return
    }
    if (
      !saimokuMap.has(otherCd.toUpperCase()) &&
      filterdSaimokuList.length !== 1
    ) {
      props.setError('cd_invalid', {
        hasError: true,
        message: `相手科目コードが正しくありません: ${otherCd}`,
        targetId: ['another_cd'],
      })
      return
    }
    let paramCd = otherCd
    if (saimokuMap.has(otherCd)) {
      setCd(otherCd)
      setCdName(saimokuMap.get(otherCd)!.saimoku_ryaku_name)
    } else if (filterdSaimokuList.length === 1) {
      setCd(filterdSaimokuList[0].saimoku_cd)
      setCdName(filterdSaimokuList[0].saimoku_ryaku_name)
      paramCd = filterdSaimokuList[0].saimoku_cd
    } else {
      setCd('')
      return
    }
    updateLedgerDebounced({
      id: props.ledger.journal_id,
      ledger_cd: props.ledgerCd,
      other_cd: paramCd,
      karikata_value: toNumber(kariRef.current?.value),
      kasikata_value: toNumber(kasiRef.current?.value),
    })
  }

  useEffect(() => {
    const date = DateTime.fromFormat(dateStr, 'yyyymmdd')
    if (date.invalidReason == null) {
      setDate(date.toFormat('yyyy/mm/dd'))
    }
    const kariValue = Numeral(kariValueStr)
    if (kariValue.value() === 0) {
      setKariValue('')
    } else {
      setKariValue(kariValue.format('0,0'))
    }
    const kasiValue = Numeral(kasiValueStr)
    if (kasiValue.value() === 0) {
      setKasiValue('')
    } else {
      setKasiValue(kasiValue.format('0,0'))
    }
  }, [])

  useEffect(() => {
    const saimoku = saimokuMap.get(props.ledger.another_cd)
    if (saimoku != null) {
      setCdName(saimoku.saimoku_ryaku_name)
    }
  }, [saimokuMap])

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
              value={getTargetYYYYMM(props.ledger.date)}
              maxLength={6}
              readOnly
              disabled
              className="w-18"
            />
            <input
              type="text"
              value={dateStrDD}
              maxLength={2}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setDateDD(e.target.value)
                updateDate(
                  `${props.nendo}${props.ledgerMonth}${e.target.value}`,
                )
              }}
              onBlur={() => {
                props.notifyError()
              }}
              className={`w-8 ledgerBody-date-dd ${
                props.error.date_format != null || props.error.date_required
                  ? 'error'
                  : ''
              }`}
            />
          </>
        ) : (
          <input
            type="text"
            value={dateStr}
            maxLength={8}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setDate(e.target.value)
              updateDate(e.target.value)
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
              props.notifyError()
            }}
            className={`ledgerBody-date-input ${
              props.error.date_format != null ||
              props.error.date_required ||
              props.error.date_month_range ||
              props.error.date_nendo_range
                ? 'error'
                : ''
            }`}
          />
        )}
      </td>
      <td className="ledgerBody-anotherCd">
        <div className="cdSelect">
          <input
            type="text"
            value={cd}
            onChange={(e: React.FocusEvent<HTMLInputElement>) => {
              setCd(e.target.value)
            }}
            onFocus={() => {
              setCdSelectMode(true)
            }}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
              setCdSelectMode(false)
              updateCd(e.target.value)
              props.notifyError()
            }}
            className={`w-12 search ${
              props.error.cd_required != null || props.error.cd_invalid != null
                ? 'error'
                : ''
            }`}
          />
          {cdSelectMode ? (
            <select size={5} className="candidate" tabIndex={-1}>
              {filterdSaimokuList.map((s) => {
                return (
                  <option key={s.saimoku_cd} value={s.saimoku_cd}>
                    {`${s.saimoku_cd}:${s.saimoku_ryaku_name}`}
                  </option>
                )
              })}
            </select>
          ) : (
            <></>
          )}
        </div>
      </td>
      <td className="ledgerBody-otherCdName">
        <input type="text" value={cdName} className="w-24" disabled readOnly />
      </td>
      <td className="ledgerBody-karikataValue">
        <input
          type="text"
          value={kariValueStr}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setKariValue(e.target.value)
            updateKariValue(e.target.value)
          }}
          onFocus={(e: React.ChangeEvent<HTMLInputElement>) => {
            const valueStr = e.target.value
            if (valueStr.length === 0) {
              return
            }
            const value = Numeral(valueStr)
            const rawValue = `${value.value()}`
            setKariValue(rawValue)
          }}
          onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
            const valueStr = e.target.value
            const value = Numeral(valueStr)
            const fmtValue = value.value() == null ? '' : value.format('0,0')
            setKariValue(fmtValue)
            props.notifyError()
          }}
          className={`w-24 text-right num value ${
            props.error.kari_format != null ||
            props.error.kari_negative != null ||
            props.error.value_both != null ||
            props.error.value_neither != null
              ? 'error'
              : ''
          }`}
          ref={kariRef}
        />
      </td>
      <td className="ledgerBody-kasikataValue">
        <input
          type="text"
          value={kasiValueStr}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setKasiValue(e.target.value)
            updateKasiValue(e.target.value)
          }}
          onFocus={(e: React.ChangeEvent<HTMLInputElement>) => {
            const valueStr = e.target.value
            if (valueStr.length === 0) {
              return
            }
            const value = Numeral(valueStr)
            const rawValue = `${value.value()}`
            setKasiValue(rawValue)
          }}
          onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
            const valueStr = e.target.value
            const value = Numeral(valueStr)
            const fmtValue = value.value() == null ? '' : value.format('0,0')
            setKasiValue(fmtValue)
            props.notifyError()
          }}
          className={`w-24 text-right num value ${
            props.error.kasi_format != null ||
            props.error.kasi_negative ||
            props.error.value_both != null ||
            props.error.value_neither != null
              ? 'error'
              : ''
          }`}
          ref={kasiRef}
        />
      </td>
      <td className="ledgerBody-note">
        <input
          type="text"
          value={note}
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
  error: Readonly<LedgerListInputErrorItem>
  setError: SetLedgerListInputError
  notifyError: () => void
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
  useEffect(() => {
    const date = `${props.nendo}${props.ledgerMonth}${dateStrDD}`
    LedgerCreateRequestForm.set('date', form, date)
  }, [dateStrDD, form, props.ledgerMonth, props.nendo])

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

  // const updateDate = (dateStr: string) => {
  //   props.setError('date_required', { hasError: false })
  //   props.setError('date_format', { hasError: false })
  //   props.setError('date_nendo_range', { hasError: false })
  //   props.setError('date_month_range', { hasError: false })
  //   if (dateStr == null || dateStr.length === 0) {
  //     props.setError('date_required', {
  //       hasError: true,
  //       message: '日付が未入力です',
  //       targetId: ['date'],
  //     })
  //     return false
  //   }
  //   // 日付項目にフォーカスがあるかどうかで表示形式が2パターン存在するため、
  //   // 二通りのフォーマットでチェックしどちらか片方がOKの場合に更新する
  //   const date1 = DateTime.fromFormat(dateStr, 'yyyymmdd')
  //   const date2 = DateTime.fromFormat(dateStr, 'yyyy/mm/dd')
  //   if (!(date1.invalidReason == null || date2.invalidReason == null)) {
  //     props.setError('date_format', {
  //       hasError: true,
  //       message: `日付が不正です: ${dateStr}`,
  //       targetId: ['date'],
  //     })
  //     return false
  //   }

  //   const rawDate = toRawDate(dateStr)
  //   const nendoMaster = nendoMap.get(props.nendo)
  //   const isDateInNendoRange = (d: string) => {
  //     if (nendoMaster == null) {
  //       return false
  //     }
  //     if (!(d >= nendoMaster.start_date && d <= nendoMaster.end_date)) {
  //       return false
  //     }
  //     return true
  //   }
  //   if (!isDateInNendoRange(rawDate)) {
  //     props.setError('date_nendo_range', {
  //       hasError: true,
  //       message: `対象年度内の日付で入力してください: ${DateTime.fromFormat(
  //         rawDate,
  //         'yyyymmdd',
  //       ).toFormat('yyyy/mm/dd')}`,
  //       targetId: ['date'],
  //     })
  //     return false
  //   }

  //   if (
  //     props.ledgerMonth !== 'all' &&
  //     rawDate.substr(4, 2) !== props.ledgerMonth
  //   ) {
  //     props.setError('date_month_range', {
  //       hasError: true,
  //       message: `対象月内の日付で入力してください: ${DateTime.fromFormat(
  //         rawDate,
  //         'yyyymmdd',
  //       ).toFormat('yyyy/mm/dd')}`,
  //       targetId: ['date'],
  //     })
  //     return false
  //   }

  //   return true
  // }

  // // 借方金額更新処理
  // const updateKariValue = (valueStr: string) => {
  //   props.setError('kari_format', { hasError: false })
  //   props.setError('kari_negative', { hasError: false })
  //   const ret = updateValues(valueStr, kasiRef.current!.value)
  //   if (!ret) {
  //     return false
  //   }
  //   if (isEmpty(valueStr)) {
  //     return true
  //   }
  //   const numeral = Numeral(valueStr)
  //   const value = numeral.value()
  //   if (value == null) {
  //     props.setError('kari_format', {
  //       hasError: true,
  //       message: `数値で入力してください: ${valueStr}`,
  //       targetId: ['karikata_value'],
  //     })
  //     return false
  //   }
  //   if (value <= 0) {
  //     props.setError('kari_negative', {
  //       hasError: true,
  //       message: `正の数値を入力してください: ${valueStr}`,
  //       targetId: ['karikata_value'],
  //     })
  //     return false
  //   }
  //   return true
  // }

  // // 貸方金額更新処理
  // const updateKasiValue = (valueStr: string) => {
  //   props.setError('kasi_format', { hasError: false })
  //   props.setError('kasi_negative', { hasError: false })
  //   const ret = updateValues(valueStr, kariRef.current!.value)
  //   if (!ret) {
  //     return false
  //   }
  //   if (isEmpty(valueStr)) {
  //     return true
  //   }
  //   const numeral = Numeral(valueStr)
  //   const value = numeral.value()
  //   if (value == null) {
  //     props.setError('kasi_format', {
  //       hasError: true,
  //       message: `数値で入力してください: ${valueStr}`,
  //       targetId: ['kasikata_value'],
  //     })
  //     return false
  //   }
  //   if (value <= 0) {
  //     props.setError('kasi_negative', {
  //       hasError: true,
  //       message: `正の数値を入力してください: ${valueStr}`,
  //       targetId: ['kasikata_value'],
  //     })
  //     return false
  //   }
  //   return true
  // }

  // // 借方・貸方関連チェック
  // // どちらか片方だけが入力されていることをチェックする
  // const updateValues = (kariValueStr: string, kasiValueStr: string) => {
  //   props.setError('value_both', { hasError: false })
  //   props.setError('value_neither', { hasError: false })
  //   if (isEmpty(kariValueStr) && isEmpty(kasiValueStr)) {
  //     props.setError('value_neither', {
  //       hasError: true,
  //       message: '金額が入力されていません',
  //       targetId: ['karikata_value', 'kasikata_value'],
  //     })
  //     return false
  //   }
  //   if (!isEmpty(kariValueStr) && !isEmpty(kasiValueStr)) {
  //     props.setError('value_neither', {
  //       hasError: true,
  //       message: '金額は借方・貸方どちらか一方のみ入力できます',
  //       targetId: ['karikata_value', 'kasikata_value'],
  //     })
  //     return false
  //   }
  //   return true
  // }

  // const updateCd = (otherCd: string) => {
  //   props.setError('cd_required', { hasError: false })
  //   props.setError('cd_invalid', { hasError: false })
  //   if (otherCd.length === 0) {
  //     props.setError('cd_required', {
  //       hasError: true,
  //       message: '相手科目コードが入力されていません',
  //       targetId: ['another_cd'],
  //     })
  //     return false
  //   }
  //   if (!saimokuMap.has(otherCd.toUpperCase())) {
  //     props.setError('cd_invalid', {
  //       hasError: true,
  //       message: `相手科目コードが正しくありません: ${otherCd}`,
  //       targetId: ['another_cd'],
  //     })
  //     return false
  //   }
  //   return true
  // }

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
    // dispatch(
    //   createLedger({
    //     nendo: props.nendo,
    //     date: toRawDate(date),
    //     ledger_cd: props.ledgerCd,
    //     other_cd: cd,
    //     karikata_value: toNumber(kariValueStr),
    //     kasikata_value: toNumber(kasiValueStr),
    //     note,
    //   }),
    // )

    // let date
    // if (props.ledgerMonth !== 'all') {
    //   date = `${getTargetYYYYMM(
    //     `${props.nendo}${props.ledgerMonth}01`,
    //   )}/${dateStrDD}`
    // } else {
    //   date = dateStr
    // }
    // const validateResutls = [
    //   true,
    //   // updateDate(date),
    //   // updateKariValue(kariValueStr),
    //   // updateKasiValue(kasiValueStr),
    //   // updateCd(cd),
    // ]
    // if (validateResutls.every((valid) => valid)) {
    //   dispatch(
    //     createLedger({
    //       nendo: props.nendo,
    //       date: toRawDate(date),
    //       ledger_cd: props.ledgerCd,
    //       other_cd: cd,
    //       karikata_value: toNumber(kariValueStr),
    //       kasikata_value: toNumber(kasiValueStr),
    //       note,
    //     }),
    //   )
    //   createLedger(
    //     {
    //       nendo: props.nendo,
    //       date: toRawDate(date),
    //       ledger_cd: props.ledgerCd,
    //       other_cd: cd,
    //       karikata_value: toNumber(kariValueStr),
    //       kasikata_value: toNumber(kasiValueStr),
    //       note,
    //     },
    //     reloadLedger(false)
    //   );
    //   dateRef.current?.focus();
    //   setDate("");
    //   setDateDD("");
    //   setCd("");
    //   setCdName("");
    //   setKariValue("");
    //   setKasiValue("");
    //   setNote("");
    // } else {
    //   props.notifyError()
    // }
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
              value={getTargetYYYYMM(`${props.nendo}${props.ledgerMonth}01`)}
              maxLength={6}
              readOnly
              disabled
              styles={() => ({
                root: { width: '80px', display: 'inline-block' },
              })}
            />
            <TextInput
              type="text"
              value={dateStrDD}
              maxLength={2}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setDateDD(e.target.value)
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  save()
                }
              }}
              onBlur={(e) => {
                const day = e.currentTarget.value
                if (day.length === 1) {
                  setDateDD(`0${day}`)
                }
              }}
              ref={dateRef}
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
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                save()
              }
            }}
            className={`ledgerBody-date-input ${
              props.error.date_format != null ||
              props.error.date_required ||
              props.error.date_month_range ||
              props.error.date_nendo_range
                ? 'error'
                : ''
            }`}
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
        {/* <Tooltip
          label={form.errors.karikata_value}
          opened={form.errors.karikata_value !== undefined}
          color="red"
          position="bottom"
          withArrow
        > */}
        <TextInput
          className={'w-24'}
          styles={() => ({
            input: {
              textAlign: 'right',
              ...(form.errors.karikata_value ? { borderColor: 'red' } : {}),
            },
          })}
          {...form.getInputProps('karikata_value')}
          value={form.values.karikata_value}
          error={null}
          onBlur={(e) => {
            const { errors } = form.validate()
            if (!LedgerCreateRequestForm.hasError('karikata_value', errors)) {
              const value = Numeral(e.currentTarget.value)
              if (value.value() != null) {
                LedgerCreateRequestForm.set(
                  'karikata_value',
                  form,
                  value.format('0,0'),
                )
              }
            }
          }}
          onFocus={(e) => {
            const value = Numeral(e.currentTarget.value)
            const num = value.value()
            if (num != null) {
              LedgerCreateRequestForm.set('karikata_value', form, `${num}`)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              save()
            }
          }}
        />
        {/* </Tooltip> */}
        {/* <input
          type="text"
          value={kariValueStr}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setKariValue(e.target.value)
            updateKariValue(e.target.value)
          }}
          onFocus={(e: React.ChangeEvent<HTMLInputElement>) => {
            const valueStr = e.target.value
            if (valueStr.length === 0) {
              return
            }
            const value = Numeral(valueStr)
            const rawValue = `${value.value()}`
            setKariValue(rawValue)
          }}
          onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
            const valueStr = e.target.value
            const value = Numeral(valueStr)
            const fmtValue = value.value() == null ? '' : value.format('0,0')
            setKariValue(fmtValue)
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              save()
            }
          }}
          className={`w-24 text-right num value ${
            props.error.kari_format != null ||
            props.error.kari_negative != null ||
            props.error.value_both != null ||
            props.error.value_neither != null
              ? 'error'
              : ''
          }`}
          ref={kariRef}
        /> */}
      </td>
      <td>
        <TextInput
          className={'w-24'}
          styles={() => ({
            input: {
              textAlign: 'right',
              ...(form.errors.kasikata_value ? { borderColor: 'red' } : {}),
            },
          })}
          {...form.getInputProps('kasikata_value')}
          value={form.values.kasikata_value}
          error={null}
          onBlur={(e) => {
            const { errors } = form.validate()
            if (!LedgerCreateRequestForm.hasError('kasikata_value', errors)) {
              const value = Numeral(e.currentTarget.value)
              if (value.value() != null) {
                LedgerCreateRequestForm.set(
                  'kasikata_value',
                  form,
                  value.format('0,0'),
                )
              }
            }
          }}
          onFocus={(e) => {
            const value = Numeral(e.currentTarget.value)
            const num = value.value()
            if (num != null) {
              LedgerCreateRequestForm.set('kasikata_value', form, `${num}`)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              save()
            }
          }}
        />
        {/* <input
          type="text"
          value={kasiValueStr}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setKasiValue(e.target.value)
            //updateKasiValue(e.target.value)
          }}
          onFocus={(e: React.ChangeEvent<HTMLInputElement>) => {
            const valueStr = e.target.value
            if (valueStr.length === 0) {
              return
            }
            const value = Numeral(valueStr)
            const rawValue = `${value.value()}`
            setKasiValue(rawValue)
          }}
          onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
            const valueStr = e.target.value
            const value = Numeral(valueStr)
            const fmtValue = value.value() == null ? '' : value.format('0,0')
            setKasiValue(fmtValue)
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              save()
            }
          }}
          className={`w-24 text-right value ${
            props.error.kasi_format != null ||
            props.error.kasi_negative ||
            props.error.value_both != null ||
            props.error.value_neither != null
              ? 'error'
              : ''
          }`}
          ref={kasiRef}
        /> */}
      </td>
      <td className="ledgerBody-note">
        <input
          type="text"
          value={note}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setNote(e.target.value)
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              save()
            }
          }}
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

interface Valid {
  hasError: false
}

interface Invalid {
  hasError: true
  message: string
  targetId: Array<
    keyof Pick<
      LedgerSearchResponse,
      'date' | 'karikata_value' | 'kasikata_value' | 'another_cd'
    >
  >
}

// 入力行単位のエラー情報
export interface LedgerListInputErrorItem {
  date_required?: Omit<Invalid, 'hasError'>
  date_format?: Omit<Invalid, 'hasError'>
  date_month_range?: Omit<Invalid, 'hasError'>
  date_nendo_range?: Omit<Invalid, 'hasError'>
  cd_required?: Omit<Invalid, 'hasError'>
  cd_invalid?: Omit<Invalid, 'hasError'>
  kari_format?: Omit<Invalid, 'hasError'>
  kari_negative?: Omit<Invalid, 'hasError'>
  kasi_format?: Omit<Invalid, 'hasError'>
  kasi_negative?: Omit<Invalid, 'hasError'>
  value_both?: Omit<Invalid, 'hasError'>
  value_neither?: Omit<Invalid, 'hasError'>
}

export const hasError = (
  errorItem: LedgerListInputErrorItem,
  ...keys: Array<keyof LedgerListInputErrorItem>
) => {
  let has = false
  for (const key of keys) {
    if (key in errorItem) {
      has = true
      break
    }
  }
  return has
}

// key: journal_id: 行を特定する情報
// value: [項目ID, エラーメッセージ]
export type LedgerListInputErrors = Map<string, LedgerListInputErrorItem>

export type SetLedgerListInputError = (
  key: keyof LedgerListInputErrorItem,
  errorInfo: Valid | Invalid,
) => void

export const LedgerListError = (props: { errors: LedgerListInputErrors }) => {
  if (props.errors.size === 0) {
    return <></>
  }

  return (
    <div className="ledgerListError">
      <ul>
        {Array.from(props.errors.keys()).flatMap((journalId) => {
          const errorItem = props.errors.get(journalId) as any
          if (errorItem == null) {
            return []
          }
          const ret: any[] = []
          const keys = Object.keys(errorItem)
          for (const key of keys) {
            if (errorItem[key] != null) {
              ret.push(<li>{errorItem[key]!.message}</li>)
            }
          }
          return ret
        })}
      </ul>
    </div>
  )
}
