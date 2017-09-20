import { Injectable } from '@angular/core';
import { DatabaseService } from "./database.service";
import { DestinyHttpService } from './destiny-http.service';
import * as idbKeyval from 'idb-keyval';
import { ZipService } from './zip.service';
import * as sql from "sql.js"

@Injectable()
export class MemoryService {
  private tablesDictionary: any = {};
  private promises = {};

  constructor(private databaseService: DatabaseService, private destinyHttpService: DestinyHttpService,
    private zipService: ZipService) { }

  public async getDatabase() {
    const manifestInfoKey = "manifestKey";
    const oneDayMilli = 24 * 60 * 60 * 1000;
    const dbStorageKey = "database";

    let manifestStorageValueObject = JSON.parse(localStorage.getItem(manifestInfoKey));
    let cachedWorldDbPath = manifestStorageValueObject && manifestStorageValueObject.cachedWorldDbPath;
    let timeStamp = manifestStorageValueObject && manifestStorageValueObject.timeStamp;

    var parsedDate = timeStamp ? Date.parse(timeStamp) : new Date().getDate() - 2;
    let timeSinceManifestUpdate = (<any>(new Date()) - parsedDate);
    console.log(`time before manifest update: ${oneDayMilli - timeSinceManifestUpdate}`);

    let dbManifestVersion = cachedWorldDbPath;
    let shouldUpdateManifest = !cachedWorldDbPath || timeSinceManifestUpdate > oneDayMilli

    if (shouldUpdateManifest) {
      console.log("getting manifest from bungie");
      dbManifestVersion = (await this.destinyHttpService.getManifest()).mobileWorldContentPaths.en;
      manifestStorageValueObject = { cachedWorldDbPath: dbManifestVersion, timeStamp: new Date() };
      let manifestStorageValueJson = JSON.stringify(manifestStorageValueObject);
      localStorage.setItem(manifestInfoKey, manifestStorageValueJson);
    }

    let dbBlob = <Uint8Array>(await idbKeyval.get(dbStorageKey));
    let shouldDownloadNewDb = dbManifestVersion !== cachedWorldDbPath;
    if (shouldDownloadNewDb || !dbBlob) {
      if (shouldDownloadNewDb) console.log("database has been updated, downloading...");
      if (!dbBlob) console.log("database not found in cache, downloading...");

      let databaseBlob = await this.destinyHttpService.getDatabase(dbManifestVersion);
      dbBlob = await this.zipService.getDatabaseBlob(databaseBlob);
      await idbKeyval.set(dbStorageKey, dbBlob)
    }
    else console.log(`using cached database: '${cachedWorldDbPath}'`);
    return new sql.Database(dbBlob);
  }

  public async getHash(hash: string, tableName: string) {
    const tableNameLower = tableName.toLowerCase();
    if (!this.tablesDictionary[tableNameLower] && !this.promises[tableNameLower]) {
      console.log(`lazily loading '${tableNameLower}' table into memory`);
      this.promises[tableNameLower] = this.databaseService.getTable(tableNameLower);
      const tableData = await this.promises[tableNameLower];
      this.tablesDictionary[tableNameLower] = tableData;
    }
    else if (!this.tablesDictionary[tableNameLower]) {
      const tableData = await this.promises[tableNameLower];
      this.promises[tableNameLower] = null;
      this.tablesDictionary[tableNameLower] = tableData;
    }
    return this.tablesDictionary[tableNameLower][hash];
  }
}