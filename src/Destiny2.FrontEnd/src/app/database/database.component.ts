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
  private itemHash: string;
  private jsonEditorCode: JSONEditor;
  private jsonEditorView: JSONEditor;
  private tableNames: string[] = [];
  private currentTable;

  constructor(private route: ActivatedRoute, private router: Router, private databaseService: DatabaseService) { }

  async ngOnInit() {
    console.log("Initializing DatabaseComponent");
    var codeContainer = document.getElementById("jsonEditorCode");
    var viewContainer = document.getElementById("jsonEditorView");
    this.jsonEditorCode = new JSONEditor(codeContainer, { mode: "code" });
    this.jsonEditorView = new JSONEditor(viewContainer, { mode: "view" });

    this.route.params.subscribe(params => {
      this.currentTable = params['table'] ? params['table'] : this.currentTable;
      this.itemHash = params['hash'];
      console.log(`updating route params to: '${this.currentTable}/${this.itemHash}'`);
    });

    console.log(this.databaseService);

    // this.tableNames = this.databaseService.getTables();
    // zip.workerScriptsPath = "/assets/lib/zipjs/";

    // this.tableNames = this.databaseService.getTableNames();
    // this.lazyLoadTable(this.currentTable);

    // get data from sql
    // this.database = new sql.Database(dbBlob);

    // this.tableNames = this.database.exec("SELECT name FROM sqlite_master")[0].values
    //   .map(value => {
    //     return value[0];
    //   });

    // if (this.currentTable) this.lazyLoadTable(this.currentTable);
    // if (this.itemHash) this.searchHash(+this.itemHash);

    // 1345867571 -- coldheart
    // 2903592984 --lionheart
  }

  // public searchHash(hash: number) {
  //   console.log(`searching hash '${hash}' on ${this.currentTable}...`);
  //   if (hash)
  //     this.router.navigate([`database/${this.currentTable}/${hash}`]);
  //   else
  //     this.router.navigate([`database/${this.currentTable}`]);
  //   // this.lazyLoadTable(this.currentTable);
  //   var data = this.tablesDictionary[this.currentTable][hash];
  //   data = !data ? { res: "no data" } : data;
  //   this.jsonEditorCode.set(data);
  //   this.jsonEditorView.set(data);
  // }

  // private lazyLoadTable(tableName: string) {
  //   console.log(`lazily loading '${tableName}' table into memory`);
  //   if (!this.tablesDictionary[this.currentTable])
  //   this.tablesDictionary[tableName] = this.databaseService.getTable(tableName);
  // }

  // private lazyLoadDatabase() {

  // }

  // public onTableChange(table: string) {
  //   console.log(`table changed to: '${table}'`);
  //   this.router.navigate([`database/${this.currentTable}/${this.itemHash}`]);
  //   this.lazyLoadTable(table);
  // }
}