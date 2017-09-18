import { DatabaseService } from "./database.service";
import { DestinyApiService } from "./destinyApi.service";
import * as sql from "sql.js"
import { ZipService } from "./zip.service";
import { APP_INITIALIZER } from "@angular/core";

let databaseServiceFactory = (destinyApiService: DestinyApiService, zipService: ZipService,
  databaseService: DatabaseService) => () => databaseService.load(destinyApiService, zipService);

export let databaseServiceProvider =
  {
    'provide': APP_INITIALIZER,
    'useFactory': databaseServiceFactory,
    'deps': [DestinyApiService, ZipService, DatabaseService],
    'multi': true,
  }