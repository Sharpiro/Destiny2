import { Pipe, PipeTransform } from '@angular/core';
import { DatabaseService } from './database.service';

@Pipe({
  name: 'hash'
})
export class HashPipe implements PipeTransform {
  private temp = 0;
  private tablePromise;
  private table;

  constructor(private databaseService: DatabaseService) {
  }

  async transform(value: any, args?: any) {
    if (!this.tablePromise) {
      this.tablePromise = this.databaseService.getTable("DestinyInventoryItemDefinition");
    }
    this.table = await this.tablePromise;

    return this.table[value].displayProperties.name;
  }
}