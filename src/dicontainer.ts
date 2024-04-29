import { PrismaClient } from "@prisma/client";
import { Container } from "inversify";

import { LedgerService, LedgerServiceImpl } from "@/services/ledger";
import { MasterService, MasterServiceImpl } from "@/services/master";

import { JournalService, JournalServiceImpl } from "./services/journal";

interface ServiceMap {
  MasterService: MasterService;
  LedgerService: LedgerService;
  JournalService: JournalService;
}

function register<T>(
  container: Container,
  serviceImplementation: new (...args: any[]) => T,
  serviceIdentifier: keyof ServiceMap
): void {
  container.bind<T>(serviceIdentifier).to(serviceImplementation);
}

const serviceContainer = new Container();
serviceContainer
  .bind<PrismaClient>("PrismaClient")
  .toConstantValue(new PrismaClient());

const registerService = register.bind(null, serviceContainer);
registerService(MasterServiceImpl, "MasterService");
registerService(LedgerServiceImpl, "LedgerService");
registerService(JournalServiceImpl, "JournalService");

function getService<K extends keyof ServiceMap>(key: K): ServiceMap[K] {
  return serviceContainer.get<ServiceMap[K]>(key);
}

export const Factory = {
  getMasterService: () => getService<"MasterService">("MasterService"),
  getJournalService: () => getService<"JournalService">("JournalService"),
  getLedgerService: () => getService<"LedgerService">("LedgerService"),
};

serviceContainer.bind<typeof Factory>("Factory").toConstantValue(Factory);
