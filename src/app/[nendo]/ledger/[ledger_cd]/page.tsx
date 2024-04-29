"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { Header } from "@/containers/header";
import { LedgerList } from "@/containers/ledger";
import { AppDispatch } from "@/store";
import { appActions } from "@/store/app";

interface PageProps {
  params: {
    nendo: string;
    ledger_cd: string;
  };
}

export default function Page({ params }: PageProps) {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(appActions.setNendo(params.nendo));
    dispatch(appActions.showLedger(true));
    dispatch(appActions.setLedgerCd(params.ledger_cd));
  }, [dispatch, params.nendo, params.ledger_cd]);

  return (
    <div>
      <Header />
      <LedgerList
        nendo={params.nendo}
        ledger_cd={params.ledger_cd}
        ledger_month={"03"}
        page_no={1}
        page_size={10}
      />
    </div>
  );
}
