import { PrismaClient, journals } from "@prisma/client";
import { injectable } from "inversify";

import { NullableOptional } from "@/misc/types";

const prisma = new PrismaClient();

export interface JournalService {
  deleteById(id: number): Promise<journals>;
  updateById(
    id: number,
    condition: NullableOptional<Omit<journals, "id">>
  ): Promise<journals>;
}

@injectable()
export class JournalServiceImpl implements JournalService {
  public async deleteById(id: number): Promise<journals> {
    const deleted = await prisma.journals.delete({ where: { id } });
    return deleted;
  }
  public async updateById(
    id: number,
    condition: NullableOptional<Omit<journals, "id">>
  ): Promise<journals> {
    const new_condition = {} as { [key: string]: any };
    for (const key in Object.keys(condition)) {
      const value = condition[key as keyof typeof condition];
      if (value !== undefined) {
        new_condition[key] = value;
      }
    }
    const updated = await prisma.journals.update({
      where: { id },
      data: new_condition,
    });
    return updated;
  }
}
