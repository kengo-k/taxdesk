import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  const nendo_list = await prisma.nendo_masters.findMany({
    orderBy: {
      nendo: "desc",
    },
  });
  return NextResponse.json({ nendo_list });
}
