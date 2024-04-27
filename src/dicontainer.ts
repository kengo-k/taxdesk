import { Container } from "inversify";

import "reflect-metadata";
import { MasterService, MasterServiceImpl } from "./services/master";

interface ServiceMap {
  MasterService: MasterService;
}

function bind<T>(
  container: Container,
  serviceImplementation: new (...args: any[]) => T,
  serviceIdentifier: keyof ServiceMap
): void {
  container.bind<T>(serviceIdentifier).to(serviceImplementation);
}

const serviceContainer = new Container();
bind<MasterService>(serviceContainer, MasterServiceImpl, "MasterService");

function getService<K extends keyof ServiceMap>(key: K): ServiceMap[K] {
  return serviceContainer.get<ServiceMap[K]>(key);
}

export const DIContainer = { getService } as const;
