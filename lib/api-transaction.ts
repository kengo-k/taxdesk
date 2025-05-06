import { NextResponse } from 'next/server'

import { Prisma, PrismaClient } from '@prisma/client'

import { toApiResponse } from '@/lib/api-error'
import { prisma } from '@/lib/prisma/client'

export type Connection = PrismaClient | Prisma.TransactionClient

export async function withTransaction<T>(
  conn: Connection,
  handler: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  try {
    if ('$transaction' in conn) {
      const result = await conn.$transaction(async (tx) => {
        return await handler(tx)
      })
      return NextResponse.json({
        success: true,
        data: result,
      })
    } else {
      const result = await handler(conn)
      return NextResponse.json({
        success: true,
        data: result,
      })
    }
  } catch (error) {
    return toApiResponse(error)
  }
}

export const createApiRoute =
  <T extends (conn: Connection, req: Request, ctx: any) => Promise<Response>>(
    fn: T,
    conn: Connection = prisma,
  ) =>
  (req: Request, ctx: any) =>
    fn(conn, req, ctx)
