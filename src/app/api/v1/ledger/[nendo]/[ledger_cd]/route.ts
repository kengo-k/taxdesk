import { NextRequest, NextResponse } from "next/server";

import { DIContainer } from "@/dicontainer";
import { LedgerSearchRequest } from "@/models/ledger";

export async function GET(
  _: NextRequest,
  { params }: { params: LedgerSearchRequest }
) {
  const ledgerService =
    DIContainer.getService<"LedgerService">("LedgerService");

  const response = await ledgerService.selectLedgerList(params);

  return NextResponse.json(response);
}
