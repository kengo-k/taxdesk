import { type NextRequest, NextResponse } from 'next/server'

import { Prisma, PrismaClient } from '@prisma/client'

import { toApiResponse } from '@/lib/api-error'
import { prisma } from '@/lib/prisma/client'

export type Connection = PrismaClient | Prisma.TransactionClient

// Execute a transaction using the specified connection
// If a transaction is already started, use that transaction
export async function withTransaction<T>(
  conn: Connection,
  handler: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  try {
    // Determine if a transaction is started by checking if the $transaction property exists
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

export type RouteContext = {
  params: Record<string, string>
}

// Utility function to create API routes
// Intended to allow passing externally started transactions during testing
export const createApiRoute =
  <
    T extends (
      conn: Connection,
      args: { req: NextRequest; ctx: RouteContext },
    ) => Promise<Response>,
  >(
    fn: T,
    conn: Connection = prisma,
  ) =>
  (req: NextRequest, ctx: RouteContext) =>
    fn(conn, { req, ctx })
