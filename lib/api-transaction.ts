import { NextResponse } from 'next/server'

import { Prisma } from '@prisma/client'

import { toApiResponse } from '@/lib/api-error'
import { prisma } from '@/lib/prisma/client'

export async function withTransaction<T>(
  handler: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  try {
    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Execute handler function (automatically rolled back if error occurs)
      return await handler(tx)
    })

    // Return success response
    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return toApiResponse(error)
  }
}
