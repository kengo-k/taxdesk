"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { Header } from "@/containers/header";
import { AppDispatch } from "@/store";
import { appActions } from "@/store/app";

interface PageProps {
  params: {
    nendo: string;
  };
}

export default function Page({ params }: PageProps) {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(appActions.setNendo(params.nendo));
  }, [dispatch, params.nendo]);

  return (
    <div>
      <Header />
    </div>
  );
}
