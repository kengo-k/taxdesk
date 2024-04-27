import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

import { getDefault } from "@/constants/cache";
import { DIContainer } from "@/dicontainer";

const cache = getDefault();
const prisma = new PrismaClient();

export async function GET() {
  const service = DIContainer.getService<"MasterService">("MasterService");
  const nendo_list = await service.selectNendoList();
  const kamoku_list = await service.selectKamokuList();
  const saimoku_list = await service.selectSaimokuList();
  return NextResponse.json(
    { nendo_list, kamoku_list, saimoku_list },
    {
      status: 200,
      headers: cache.headers,
    }
  );
}

export const revalidate = cache.revalidate;
