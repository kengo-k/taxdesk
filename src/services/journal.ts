import { PrismaClient, journals } from "@prisma/client";
import { inject, injectable } from "inversify";

import { Factory } from "@/dicontainer";
import { NullableOptional } from "@/misc/types";

export interface JournalService {
  create(entity: journals): Promise<journals>;
  updateById(
    id: number,
    condition: NullableOptional<Omit<journals, "id">>
  ): Promise<journals>;
  deleteById(id: number): Promise<journals>;
}

@injectable()
export class JournalServiceImpl implements JournalService {
  constructor(
    @inject("PrismaClient") private prisma: PrismaClient,
    @inject("Factory") private factory: typeof Factory
  ) {}
  public async create(entity: journals): Promise<journals> {
    const new_entity = await this.prisma.journals.create({ data: entity });
    return new_entity;
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
    const updated = await this.prisma.journals.update({
      where: { id },
      data: new_condition,
    });
    return updated;
  }
  public async deleteById(id: number): Promise<journals> {
    const deleted = await this.prisma.journals.delete({ where: { id } });
    return deleted;
  }
}
