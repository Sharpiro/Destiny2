import { DatabaseService } from "./database.service";
import { DestinyApiService } from "./destinyApi.service";
import * as idbKeyval from 'idb-keyval';
import * as sql from "sql.js"
import { ZipService } from "./zip.service";
import { APP_INITIALIZER } from "@angular/core";

export let databaseServiceFactory = async (destinyApiService: DestinyApiService, zipService: ZipService) => {
  let manifestResponse = await destinyApiService.getManifest();
  let newWorldDbPath = manifestResponse.json().Response.mobileWorldContentPaths.en;
  let cachedWorldDbPath = localStorage.getItem("dbPath");
  let hasChanged = newWorldDbPath !== cachedWorldDbPath;

  let dbStorageKey = "database";
  let dbBlob = <Uint8Array>(await idbKeyval.get(dbStorageKey));
  if (hasChanged || !dbBlob) {
    if (hasChanged) console.log("database has been updated, downloading...");
    if (!dbBlob) console.log("database not found in cache, downloading...");

    let databaseResponse = await destinyApiService.getDatabase(newWorldDbPath);
    dbBlob = await zipService.getDatabaseBlob(databaseResponse.blob());
    await idbKeyval.set(dbStorageKey, dbBlob)
    localStorage.setItem("dbPath", newWorldDbPath);
  }
  else console.log(`using cached database: '${cachedWorldDbPath}'`);

  return new DatabaseService(new sql.Database(dbBlob));
};

// export class TestService {
//   public test() {
//     return 123;
//   }
// }

// export function testFactory(auth: any, temp: any) {
//   return new Promise((res, rej) => {
//     res(new TestService());
//   });
// }

export let databaseService =
{
  provide: DatabaseService,
  useFactory: databaseServiceFactory,
  deps: [DestinyApiService, ZipService]
};

// export let databaseServiceProvider =
//   {
//     'provide': APP_INITIALIZER,
//     'useFactory': authFactory,
//     'deps': [DestinyApiService, ZipService],
//     'multi': true,
//   }