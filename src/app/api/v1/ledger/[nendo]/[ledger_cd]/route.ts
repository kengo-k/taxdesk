import { NextRequest, NextResponse } from "next/server";

import { Factory } from "@/dicontainer";
import { LedgerSearchRequest } from "@/models/ledger";

export async function GET(
  _: NextRequest,
  { params }: { params: LedgerSearchRequest }
) {
  const ledgerService = Factory.getLedgerService();

  const response = await ledgerService.selectLedgerList(params);

  return NextResponse.json(response);
}
