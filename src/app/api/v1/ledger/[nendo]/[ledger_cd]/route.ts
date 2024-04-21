import { LedgerSearchRequest } from "@/models/ledger";
import { getPagingOffset } from "@/models/paging";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  _: NextRequest,
  {
    params,
  }: { params: { nendo: string; ledger_cd: string } & LedgerSearchRequest }
) {
  const nendo_list = await prisma.$queryRaw`
select
  *,
  count(*) over (partition by 1) as all_count
from
  (
    select
      j.id as journal_id,
      j.nendo,
      j.date,
      j.another_cd,
      j.karikata_cd,
      j.karikata_value,
      j.kasikata_cd,
      j.kasikata_value,
      sum(
        case
          when
            j.karikata_cd = ${params.ledger_cd}
          then
            j.karikata_value else 0 end
      ) over (
        order by
          j.date desc,
          j.created_at desc
        rows
          between current row and unbounded following
      ) karikata_sum,
      sum(
        case
          when
            j.kasikata_cd = ${params.ledger_cd}
          then
            j.kasikata_value else 0 end
      ) over (
        order by
          j.date desc,
          j.created_at desc
        rows
          between current row and unbounded following
      ) kasikata_sum,
      note,
      j.created_at
    from
      (
        select
          id,
          nendo,
          date,
          karikata_cd,
          kasikata_cd,
          karikata_value,
          kasikata_value,
          case karikata_cd
            when ${params.ledger_cd} then kasikata_cd
            else karikata_cd
          end as another_cd,
          note,
          created_at
        from
          journals j
        where
          nendo = ${params.nendo}
          and (
            karikata_cd = ${params.ledger_cd}
            or kasikata_cd = ${params.ledger_cd}
          )
      ) j
  ) j2
where
  (case when ${params.month} = 'all' then 'all' else ${params.month} end)
   = (case when ${
     params.month
   } = 'all' then 'all' else substring(j2.date, 5, 2) end)
order by
  j2.date desc,
  j2.created_at desc
limit ${params.page_size} offset ${getPagingOffset(params)}`;

  return NextResponse.json({ nendo_list });
}
