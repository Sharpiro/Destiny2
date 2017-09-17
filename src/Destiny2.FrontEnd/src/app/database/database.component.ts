import { Component, OnInit } from '@angular/core';
import { DestinyApiService } from "../shared/destinyApi.service";
import * as idbKeyval from 'idb-keyval';
import { ResponseContentType } from "@angular/http"
import { ZipService } from "../shared/zip.service";
import * as sql from "sql.js"
import { ActivatedRoute, Router } from '@angular/router';
import JSONEditor from "jsoneditor";
import { JSONEditorMode, JSONEditorOptions } from "jsoneditor";
import { DatabaseService } from '../shared/database.service';

@Component({
  selector: 'app-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.css']
})
export class DatabaseComponent implements OnInit {
  private tablesDictionary: any = {};
  private jsonEditorCode: JSONEditor;
  private jsonEditorView: JSONEditor;
  private tableNames: string[] = [];
  private currentHash: string;
  private currentViewHash: string;
  private currentTable;

  constructor(private route: ActivatedRoute, private router: Router, private databaseService: DatabaseService) { }

  async ngOnInit() {
    console.log("Initializing DatabaseComponent");
    var codeContainer = document.getElementById("jsonEditorCode");
    var viewContainer = document.getElementById("jsonEditorView");
    this.jsonEditorCode = new JSONEditor(codeContainer, { mode: "code" });
    this.jsonEditorView = new JSONEditor(viewContainer, { mode: "view" });

    this.route.params.subscribe(async params => {
      this.currentTable = params['table'] ? params['table'] : this.currentTable;
      const hashChanged = params['hash'] !== this.currentHash;
      this.currentHash = params['hash'];
      this.currentViewHash = this.currentHash;
      console.log(`route updated to: '${this.currentTable}/${this.currentHash}'`);
      // if (this.currentHash && this.currentTable) await this.lazyLoadTable(this.currentTable);--lags ui table dropdown
      if (!hashChanged) return;
      if (this.currentHash) await this.completeHashSearch(this.currentHash);
    });

    this.tableNames = this.databaseService.getTableNames();

    // 1345867571 -- coldheart
    // 2903592984 --lionheart
  }

  public async initiateHashSearch(hash: string) {
    console.log(`searching hash '${hash}' on ${this.currentTable}...`);
    var navigateResponse: boolean;
    if (hash)
      navigateResponse = await this.router.navigate([`database/${this.currentTable}/${hash}`]);
    else
      navigateResponse = await this.router.navigate([`database/${this.currentTable}`]);

    if (navigateResponse) return;
    await this.completeHashSearch(hash);
  }

  private async completeHashSearch(hash: string) {
    await this.lazyLoadTable(this.currentTable);
    var data = this.tablesDictionary[this.currentTable][hash];
    data = !data ? { res: "no data" } : data;
    this.jsonEditorCode.set(data);
    this.jsonEditorView.set(data);
  }

  private async lazyLoadTable(tableName: string) {
    if (this.tablesDictionary[this.currentTable]) return;
    console.log(`lazily loading '${tableName}' table into memory`);
    this.tablesDictionary[tableName] = await this.databaseService.getTable(tableName);
  }

  public async onTableChange(table: string) {
    console.log(`table changed to: '${table}'`);
    var navResult = await this.currentHash ? this.router.navigate([`database/${this.currentTable}/${this.currentHash}`])
      : await this.router.navigate([`database/${this.currentTable}`]);
  }
}