"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { Header } from "@/containers/header";
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
      <span>this is ledger for {params.ledger_cd}</span>
    </div>
  );
}
