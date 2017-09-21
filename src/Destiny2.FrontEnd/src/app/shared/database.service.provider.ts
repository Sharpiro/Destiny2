import { DatabaseService } from "./database.service";
import { APP_INITIALIZER } from "@angular/core";
import { MemoryService } from "./memory.service";

export let databaseServiceFactory = (memoryService: MemoryService, databaseService: DatabaseService) =>
  () => databaseService.load(memoryService);

export let databaseServiceProvider =
  {
    'provide': APP_INITIALIZER,
    'useFactory': databaseServiceFactory,
    'deps': [MemoryService, DatabaseService],
    'multi': true,
  }