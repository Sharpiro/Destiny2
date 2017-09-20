import { Injectable } from '@angular/core';
import { DatabaseService } from "./database.service";

@Injectable()
export class MemoryService {
  private tablesDictionary: any = {};
  private promises = {};

  constructor(private databaseService: DatabaseService) { }

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

  public getGenderByType(type: number) {
    return type === 0 ? "Male" : "Female";
  }

  public getClassByType(type: number) {
    switch (type) {
      case 0: return "Titan";
      case 1: return "Hunter";
      case 2: return "Warlock";
    }
  }

  public getRaceByType(type: number) {
    switch (type) {
      case 0: return "Human";
      case 1: return "Awoken";
      case 2: return "Exo";
    }
  }
}