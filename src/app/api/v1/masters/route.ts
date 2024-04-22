import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

import { getDefault } from "@/constants/cache";

const cache = getDefault();
const prisma = new PrismaClient();

export async function GET() {
  const nendo_list = await prisma.nendo_masters.findMany({
    orderBy: {
      nendo: "desc",
    },
  });
  const kamoku_list = await prisma.kamoku_masters.findMany({
    orderBy: {
      kamoku_cd: "asc",
    },
  });
  const saimoku_list = await prisma.saimoku_masters.findMany({
    orderBy: {
      saimoku_cd: "asc",
    },
  });
  return NextResponse.json(
    { nendo_list, kamoku_list, saimoku_list },
    {
      status: 200,
      headers: cache.headers,
    }
  );
}

export const revalidate = cache.revalidate;
