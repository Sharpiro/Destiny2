import { Injectable } from '@angular/core';
import { DestinyApiService } from './destinyApi.service';
import { ZipService } from './zip.service';
import * as idbKeyval from 'idb-keyval';
import * as sql from "sql.js"
import { DestinyHttpService } from './destiny-http.service';

@Injectable()
export class DatabaseService {
  private sqlLiteDatabase: any;
  private _isLoaded = false;

  get isLoaded(): boolean {
    return this._isLoaded;
  }

  constructor() { }

  public getTableNames(): string[] {
    return this.sqlLiteDatabase.exec("SELECT name FROM sqlite_master")[0].values
      .map(value => {
        return value[0];
      });
  }

  public getTable(tableName: string) {
    return new Promise((res, rej) => {
      const rows = this.sqlLiteDatabase.exec(`SELECT json FROM ${tableName}`);
      let dictionary = {};
      rows[0].values.forEach(value => {
        var data = JSON.parse(value[0]);
        dictionary[data.hash] = data;
      });
      res(dictionary);
    });
  }

  public async load(destinyHttpService: DestinyHttpService, zipService: ZipService) {
    let manifestResponse = await destinyHttpService.getManifest();
    let newWorldDbPath = manifestResponse.mobileWorldContentPaths.en;
    let cachedWorldDbPath = localStorage.getItem("dbPath");
    let hasChanged = newWorldDbPath !== cachedWorldDbPath;

    let dbStorageKey = "database";
    let dbBlob = <Uint8Array>(await idbKeyval.get(dbStorageKey));
    if (hasChanged || !dbBlob) {
      if (hasChanged) console.log("database has been updated, downloading...");
      if (!dbBlob) console.log("database not found in cache, downloading...");

      let databaseBlob = await destinyHttpService.getDatabase(newWorldDbPath);
      dbBlob = await zipService.getDatabaseBlob(databaseBlob);
      await idbKeyval.set(dbStorageKey, dbBlob)
      localStorage.setItem("dbPath", newWorldDbPath);
    }
    else console.log(`using cached database: '${cachedWorldDbPath}'`);

    this.sqlLiteDatabase = new sql.Database(dbBlob);
    this._isLoaded = true;
  }
}