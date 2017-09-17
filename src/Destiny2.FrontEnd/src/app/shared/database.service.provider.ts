import { DatabaseService } from "./database.service";
import { DestinyApiService } from "./destinyApi.service";
// import * as idbKeyval from 'idb-keyval';
import * as sql from "sql.js"
import { ZipService } from "./zip.service";
import { APP_INITIALIZER } from "@angular/core";

// export let databaseServiceFactory = async (destinyApiService: DestinyApiService, zipService: ZipService,
//   databaseService: DatabaseService) => {
//   return () => databaseService.load(destinyApiService, zipService);
//   // return databaseService.load(destinyApiService, zipService);
// };

function databaseServiceFactory (destinyApiService: DestinyApiService, zipService: ZipService,
  databaseService: DatabaseService) {
  return () => databaseService.load(destinyApiService, zipService);
}

export let databaseServiceProvider =
  {
    'provide': APP_INITIALIZER,
    'useFactory': databaseServiceFactory,
    'deps': [DestinyApiService, ZipService, DatabaseService],
    'multi': true,
  }