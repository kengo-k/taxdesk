import { PagingRequest } from "@/models/paging";

export type LedgerSearchRequest = {
  nendo: string;
  ledger_cd: string;
  month?: string;
} & PagingRequest;

export interface LedgerUpdateRequest {
  id: number;
  ledger_cd: string;
  other_cd: string;
  karikata_value: number | null;
  kasikata_value: number | null;
}

export interface LedgerSearchResponse {
  journal_id: number;
  nendo: string;
  date: string;
  another_cd: string;
  karikata_cd: string;
  karikata_value: number;
  kasikata_cd: string;
  kasikata_value: number;
  karikata_sum: number;
  kasikata_sum: number;
  note: string;
  acc: number;
}

interface Valid {
  hasError: false;
}

interface Invalid {
  hasError: true;
  message: string;
  targetId: Array<
    keyof Pick<
      LedgerSearchResponse,
      "date" | "karikata_value" | "kasikata_value" | "another_cd"
    >
  >;
}

export interface LedgerListInputErrorItem {
  date_required?: Omit<Invalid, "hasError">;
  date_format?: Omit<Invalid, "hasError">;
  date_month_range?: Omit<Invalid, "hasError">;
  date_nendo_range?: Omit<Invalid, "hasError">;
  cd_required?: Omit<Invalid, "hasError">;
  cd_invalid?: Omit<Invalid, "hasError">;
  kari_format?: Omit<Invalid, "hasError">;
  kari_negative?: Omit<Invalid, "hasError">;
  kasi_format?: Omit<Invalid, "hasError">;
  kasi_negative?: Omit<Invalid, "hasError">;
  value_both?: Omit<Invalid, "hasError">;
  value_neither?: Omit<Invalid, "hasError">;
}

export type LedgerListInputErrors = Map<string, LedgerListInputErrorItem>;
