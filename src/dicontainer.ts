import { Container } from "inversify";
import "reflect-metadata";

import { LedgerService, LedgerServiceImpl } from "@/services/ledger";
import { MasterService, MasterServiceImpl } from "@/services/master";

interface ServiceMap {
  MasterService: MasterService;
  LedgerService: LedgerService;
}

function register<T>(
  container: Container,
  serviceImplementation: new (...args: any[]) => T,
  serviceIdentifier: keyof ServiceMap
): void {
  container.bind<T>(serviceIdentifier).to(serviceImplementation);
}

const serviceContainer = new Container();
const registerService = register.bind(null, serviceContainer);
registerService(MasterServiceImpl, "MasterService");
registerService(LedgerServiceImpl, "LedgerService");

function getService<K extends keyof ServiceMap>(key: K): ServiceMap[K] {
  return serviceContainer.get<ServiceMap[K]>(key);
}

export const DIContainer = { getService } as const;
