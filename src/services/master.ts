import { PrismaClient } from "@prisma/client";
import { injectable } from "inversify";

import { SaimokuSearchRequest, SaimokuSearchResponse } from "@/models/master";

const prisma = new PrismaClient();

export interface MasterService {
  selectSaimokuDetail(
    condition: SaimokuSearchRequest
  ): Promise<SaimokuSearchResponse[]>;
}

@injectable()
export class MasterServiceImpl implements MasterService {
  public async selectSaimokuDetail(
    condition: SaimokuSearchRequest
  ): Promise<SaimokuSearchResponse[]> {
    const ledger_list = await prisma.$queryRaw<SaimokuSearchResponse[]>`
    select
      k.kamoku_cd,
      s.saimoku_cd,
      b.kamoku_bunrui_type
    from
      saimoku_masters s
        inner join kamoku_masters k on
          k.kamoku_cd = s.kamoku_cd
        inner join kamoku_bunrui_masters b on
          b.kamoku_bunrui_cd = k.kamoku_bunrui_cd
    where
      saimoku_cd = ${condition.saimoku_cd}`;
    return ledger_list;
  }
}
