import { Injectable } from '@angular/core';
import { MemoryService } from './memory.service';

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

  public async load(memoryService: MemoryService) {
    this.sqlLiteDatabase = await memoryService.getDatabase();
    this._isLoaded = true;
  }
}