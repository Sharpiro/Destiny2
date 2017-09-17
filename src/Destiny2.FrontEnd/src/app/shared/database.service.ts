import { Injectable } from '@angular/core';

@Injectable()
export class DatabaseService {

  constructor(private sqlLiteDatabase: any) { }

  public test() {
    return "testing";
  }
  
  public getTables(): string[] {
    return this.sqlLiteDatabase.exec("SELECT name FROM sqlite_master")[0].values
      .map(value => {
        return value[0];
      });
  }
}