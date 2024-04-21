import { PagingRequest } from "@/models/paging";

export type LedgerSearchRequest = {
  nendo: string;
  ledger_cd: string;
  month?: string;
} & PagingRequest;
