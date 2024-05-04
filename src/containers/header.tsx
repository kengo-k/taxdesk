import { FC } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useRouter } from 'next/navigation'

//import { Box, Select } from '@mantine/core'
import { AppDispatch, RootState } from '@/store'
import { appActions } from '@/store/app'

//import Numeral from "numeral";
//import { useNavigate } from "react-router";

export const Header: FC = () => {
  const appState = useSelector((state: RootState) => state.app)
  const { data: masters } = useSelector((state: RootState) => state.masters)

  const dispatch = useDispatch<AppDispatch>()

  // useEffect(() => {
  //   dispatch(loadMasters())
  // }, [dispatch])

  // // load initial data
  // const { loadInit, loadSummary, setSummary, setTmpLedgerCd, setLedger } =
  //   useActions();
  // const state = useState();

  // const [journalChecked, setJournalChecked] = React.useState(props.showJournal);
  // const [ledgerChecked, setLedgerChecked] = React.useState(
  //   props.ledgerCd != null
  // );
  // const [ledgerCd, setLedgerCd] = React.useState(props.ledgerCd);
  // const [journalsOrder, setJournalsOrder] = React.useState(
  //   undefined as string | undefined
  // );
  // const [ledgerMonth, setLedgerMonth] = React.useState(
  //   undefined as string | undefined
  // );

  // const journalRef = React.createRef<HTMLInputElement>();
  // const ledgerRef = React.createRef<HTMLInputElement>();
  // const ledgerCdSelectRef = React.createRef<HTMLSelectElement>();

  // const createUrl = (props: {
  //   nendo: string | undefined;
  //   showJournal: boolean;
  //   showLedger: boolean;
  //   ledgerCd: string | undefined;
  //   journalsOrder: string | undefined;
  //   ledgerMonth: string | undefined;
  //   pageNo?: number | undefined;
  // }): string => {
  //   const url = [];
  //   if (props.nendo === "") {
  //     return "/";
  //   }
  //   url.push(props.nendo);
  //   if (props.showJournal) {
  //     url.push("journal");
  //   }
  //   if (props.showLedger) {
  //     url.push("ledger");
  //   }
  //   if (props.ledgerCd != null) {
  //     url.push(props.ledgerCd);
  //   }
  //   const query = [];
  //   if (props.journalsOrder != null) {
  //     query.push(`journals_order=${props.journalsOrder}`);
  //   }
  //   if (props.ledgerMonth != null) {
  //     query.push(`month=${props.ledgerMonth}`);
  //   }
  //   if (props.pageNo != null) {
  //     query.push(`page_no=${props.pageNo}`);
  //   }
  //   const ret = `/${url.join("/")}${
  //     query.length === 0 ? "" : `?${query.join("&")}`
  //   }`;
  //   return ret;
  // };

  // React.useEffect(() => {
  //   loadInit();
  // }, []);

  // React.useEffect(() => {
  //   if (props.ledgerCd != null) {
  //     setTmpLedgerCd(props.ledgerCd);
  //   }
  // }, [props.ledgerCd]);

  // React.useEffect(() => {
  //   if (props.nendo != null) {
  //     loadSummary({ nendo: props.nendo });
  //   } else {
  //     setSummary({ sales: 0, expenses: 0, tax: undefined });
  //   }
  // }, [props.nendo, state.journalList, state.ledgerList]);

  // React.useEffect(() => {
  //   if (props.journalsOrder != null) {
  //     setJournalsOrder(props.journalsOrder);
  //   }
  // }, [props.journalsOrder]);

  // React.useEffect(() => {
  //   setLedgerMonth(props.ledgerMonth);
  // }, [props.ledgerMonth]);

  //const history = useNavigate();

  const router = useRouter()

  return (
    <>
      <div className="mainHeaderRoot">
        <h1 className="subTitle">帳票選択</h1>
        <div className="mainHeader">
          <label>
            {/* <Box m={20}>
              <Select
                withAsterisk
                label="Ledger Year"
                data={masters.nendo_list.map((n) => n.nendo)}
                placeholder="Pick one"
              />
            </Box> */}
            <select
              value={appState.selected_nendo ?? ''}
              onChange={(e) => {
                dispatch(
                  appActions.setNendo(
                    e.target.value === '' ? undefined : e.target.value,
                  ),
                )
                router.push(`/${e.target.value}`)
              }}
            >
              <option value="">未指定</option>
              {masters.nendo_list.map((n) => {
                return (
                  <option key={n.nendo} value={n.nendo}>
                    {n.nendo}
                  </option>
                )
              })}
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={appState.is_journal}
              disabled={appState.selected_nendo == null}
              onChange={(e) => {
                dispatch(appActions.showJournal(e.target.checked))
                if (e.target.checked) {
                  router.push(`/${appState.selected_nendo}/journal`)
                } else {
                  router.push(`/${appState.selected_nendo}`)
                }
              }}
              // onClick={() => {
              //   if (journalRef.current?.checked) {
              //     setJournalChecked(true);
              //     setLedgerChecked(false);
              //     history(
              //       createUrl({
              //         nendo: props.nendo,
              //         ledgerCd: undefined,
              //         showJournal: true,
              //         showLedger: false,
              //         journalsOrder: undefined,
              //         ledgerMonth: undefined,
              //       })
              //     );
              //   } else {
              //     setJournalChecked(false);
              //     history(
              //       createUrl({
              //         nendo: props.nendo,
              //         ledgerCd: undefined,
              //         showJournal: false,
              //         showLedger: false,
              //         journalsOrder: undefined,
              //         ledgerMonth: undefined,
              //       })
              //     );
              //   }
              // }}
              //ref={journalRef}
              //disabled={props.nendo == null}
            />
            仕訳帳
          </label>
          <label>
            <input
              type="checkbox"
              disabled={appState.selected_nendo == null}
              checked={appState.is_ledger}
              onChange={(e) => {
                dispatch(appActions.showLedger(e.target.checked))
                if (appState.selected_ledger_cd == null) {
                  router.push(`/${appState.selected_nendo}`)
                } else {
                  router.push(
                    `/${appState.selected_nendo}/ledger/${appState.selected_ledger_cd}`,
                  )
                }
              }}
              //checked={ledgerChecked}
              // onClick={() => {
              //   if (ledgerRef.current?.checked) {
              //     setLedgerChecked(true);
              //     setJournalChecked(false);
              //     if (state.tmpLedgerCd != null) {
              //       history(
              //         createUrl({
              //           nendo: props.nendo,
              //           ledgerCd: state.tmpLedgerCd,
              //           showJournal: false,
              //           showLedger: true,
              //           journalsOrder: undefined,
              //           ledgerMonth: undefined,
              //         })
              //       );
              //     } else {
              //       history(
              //         createUrl({
              //           nendo: props.nendo,
              //           ledgerCd: undefined,
              //           showJournal: false,
              //           showLedger: true,
              //           journalsOrder: undefined,
              //           ledgerMonth: undefined,
              //         })
              //       );
              //     }
              //   } else {
              //     setLedgerChecked(false);
              //     history(
              //       createUrl({
              //         nendo: props.nendo,
              //         ledgerCd: undefined,
              //         showJournal: false,
              //         showLedger: false,
              //         journalsOrder: undefined,
              //         ledgerMonth: undefined,
              //       })
              //     );
              //   }
              // }}
              // ref={ledgerRef}
              // disabled={props.nendo == null}
            />
            出納帳
          </label>
          <select
            disabled={!appState.is_ledger}
            value={appState.selected_ledger_cd}
            onChange={(e) => {
              dispatch(
                appActions.setLedgerCd(
                  e.target.value != null ? e.target.value : undefined,
                ),
              )
              if (e.target.value != '') {
                router.push(
                  `/${appState.selected_nendo}/ledger/${e.target.value}`,
                )
              } else {
                router.push(`/${appState.selected_nendo}`)
              }
            }}
            // onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            //   setLedger({ all_count: 0, list: [] });
            //   setLedgerCd(e.target.value);
            //   setTmpLedgerCd(e.target.value);
            //   history(
            //     createUrl({
            //       nendo: props.nendo,
            //       ledgerCd: e.target.value,
            //       showJournal: false,
            //       showLedger: true,
            //       journalsOrder: undefined,
            //       ledgerMonth: undefined,
            //       pageNo: 1,
            //     })
            //   );
            // }}
            // disabled={!ledgerChecked}
            // ref={ledgerCdSelectRef}
          >
            <option value=""></option>
            {masters.saimoku_list.map((s) => {
              return (
                <option key={s.saimoku_cd} value={s.saimoku_cd}>
                  {s.saimoku_cd}: {s.saimoku_full_name}
                </option>
              )
            })}
          </select>
          {/* {props.showLedger ? (
            <div className="ledgerSearchOption">
              <hr />
              {props.showLedger && props.ledgerCd == null ? (
                <span className="warning">台帳コードを選択してください</span>
              ) : (
                <></>
              )}
              {props.showLedger && props.ledgerCd != null ? (
                <>
                  対象月:
                  <select
                    value={ledgerMonth == null ? "" : ledgerMonth}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const value = e.target.value; //=== "" ? undefined : e.target.value;
                      setLedgerMonth(value);
                      history(
                        createUrl({
                          nendo: props.nendo,
                          ledgerCd: props.ledgerCd,
                          showJournal: false,
                          showLedger: true,
                          journalsOrder: undefined,
                          ledgerMonth: value,
                          pageNo: 1,
                        })
                      );
                    }}
                  >
                    {[
                      "all",
                      "04",
                      "05",
                      "06",
                      "07",
                      "08",
                      "09",
                      "10",
                      "11",
                      "12",
                      "01",
                      "02",
                      "03",
                    ].map((m) => {
                      //const value = m !== "" ? Numeral(m).format("00") : "";
                      return <option value={m}>{m === "all" ? "" : m}</option>;
                    })}
                  </select>
                </>
              ) : (
                <></>
              )}
            </div>
          ) : (
            <></>
          )}
          {props.showJournal ? (
            <div className="journalSearchOption">
              <hr />
              表示順:
              <select
                value={journalsOrder}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const value = e.target.value;
                  setJournalsOrder(value);
                  history(
                    createUrl({
                      nendo: props.nendo,
                      ledgerCd: undefined,
                      showJournal: true,
                      showLedger: false,
                      journalsOrder: value,
                      ledgerMonth: undefined,
                    })
                  );
                }}
              >
                <option value="0"></option>
                <option value="1">更新日/降順</option>
                <option value="2">金額/降順</option>
                <option value="3">金額/昇順</option>
              </select>
            </div>
          ) : (
            <></>
          )} */}
        </div>
      </div>
      {/* <div className="summaryHeader">
        <h1 className="subTitle">納税額計算</h1> */}
      {/* <div className="summaryHeader-base">
          <table>
            <tbody>
              <tr>
                <th>売上計</th>
                <td>{Numeral(state.summary.sales).format("0,0")}</td>
              </tr>
              <tr>
                <th>費用計</th>
                <td>{Numeral(state.summary.expenses).format("0,0")}</td>
              </tr>
              <tr>
                <th></th>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div> */}
      {/* <div className="summaryHeader-tax">
          <table>
            <tbody>
              <tr>
                <th>法人税</th>
                <td>{format(state.summary.tax?.fixedCotax)}</td>
              </tr>
              <tr>
                <th>地方法人税</th>
                <td>{format(state.summary.tax?.fixedLocalCotax)}</td>
              </tr>
              <tr>
                <th>法人市民税</th>
                <td>{format(state.summary.tax?.fixedMunicipalTax)}</td>
              </tr>
              <tr>
                <th>法人事業税</th>
                <td>{format(state.summary.tax?.fixedBizTax)}</td>
              </tr>
              <tr>
                <th>地方法人特別税</th>
                <td>{format(state.summary.tax?.fixedSpecialLocalCotax)}</td>
              </tr>
              <tr>
                <th>合計納税額</th>
                <td>
                  {(() => {
                    let sum = "";
                    if (state.summary.tax != null) {
                      const t = state.summary.tax;
                      const sumValue =
                        t.fixedCotax +
                        t.fixedLocalCotax +
                        t.fixedMunicipalTax +
                        t.fixedBizTax +
                        t.fixedSpecialLocalCotax;
                      sum = Numeral(sumValue).format("0,0");
                    }
                    return sum;
                  })()}
                </td>
              </tr>
            </tbody>
          </table>
        </div> */}
      {/* </div> */}
    </>
  )
}

// const format = (n: number | undefined) => {
//   if (format == null) {
//     return "";
//   }
//   return Numeral(n).format("0,0");
// };
