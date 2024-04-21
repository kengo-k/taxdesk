"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { decrement, increment } from "@/store/counterSlice";
import master, { loadMasters } from "@/store/master";
import { AppDispatch, RootState } from "@/store";

export default function Home() {
  const count = useSelector((state: RootState) => state.counter.value);
  const message = useSelector((state: RootState) => state.counter.message);
  const {
    data: masters,
    error,
    loading,
  } = useSelector((state: RootState) => state.masters);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(loadMasters());
  }, [dispatch]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">{message}</h1>
      {loading ? (
        "loading..."
      ) : (
        <select>
          {masters.nendo_list.map((nendo: any) => {
            return <option key={nendo.id}>{nendo.nendo}</option>;
          })}
        </select>
      )}

      <div className="flex items-center space-x-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => dispatch(decrement())}
        >
          -
        </button>
        <span className="text-2xl">{count}</span>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => dispatch(increment())}
        >
          +
        </button>
      </div>
    </div>
  );
}
