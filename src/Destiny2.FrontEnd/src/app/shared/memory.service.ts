import { Injectable } from '@angular/core';
import { DatabaseService } from "./database.service";
import { DestinyApiService } from './destinyApi.service';
import { DestinyHttpService } from './destiny-http.service';

@Injectable()
export class MemoryService {
  private tablesDictionary: any = {};
  private promises = {};

  constructor(private databaseService: DatabaseService, private destinyHttpService: DestinyHttpService) { }

  public getManifest() {
    return this.destinyHttpService.getManifest();
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