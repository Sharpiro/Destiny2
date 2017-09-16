import { Component, OnInit } from '@angular/core';
import { DestinyApiService } from "../shared/destinyApi.service";
import * as idbKeyval from 'idb-keyval';
import { ResponseContentType } from "@angular/http"
import { ZipService } from "../shared/zip.service";
import * as sql from "sql.js"
import { ActivatedRoute, Router } from '@angular/router';
import JSONEditor from "jsoneditor";
import { JSONEditorMode, JSONEditorOptions } from "jsoneditor";
import { DatabaseService } from "../shared/database.service";

declare let zip;

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
  private database;

  constructor(private destinyApiService: DestinyApiService, private zipService: ZipService, private route: ActivatedRoute,
    private router: Router, private databaseService: DatabaseService) { }

  async ngOnInit() {
    var codeContainer = document.getElementById("jsonEditorCode");
    var viewContainer = document.getElementById("jsonEditorView");
    this.jsonEditorCode = new JSONEditor(codeContainer, { mode: "code" });
    this.jsonEditorView = new JSONEditor(viewContainer, { mode: "view" });

    this.route.params.subscribe(params => {
      this.currentTable = params['table'] ? params['table'] : this.currentTable;
      this.itemHash = params['hash'];
      console.log(`updating route params to: '${this.currentTable}/${this.itemHash}'`);
    });

    zip.workerScriptsPath = "/assets/lib/zipjs/";

    let manifestResponse = await this.destinyApiService.getManifest();
    let newWorldDbPath = manifestResponse.json().Response.mobileWorldContentPaths.en;
    let cachedWorldDbPath = localStorage.getItem("dbPath");
    let hasChanged = newWorldDbPath !== cachedWorldDbPath;

    let dbStorageKey = "database";
    let dbBlob = <Uint8Array>(await idbKeyval.get(dbStorageKey));
    if (hasChanged || !dbBlob) {
      if (hasChanged) console.log("database has been updated, downloading...");
      if (!dbBlob) console.log("database not found in cache, downloading...");

      let databaseResponse = await this.destinyApiService.getDatabase(newWorldDbPath);
      dbBlob = await this.zipService.getDatabaseBlob(databaseResponse.blob());
      await idbKeyval.set(dbStorageKey, dbBlob)
      localStorage.setItem("dbPath", newWorldDbPath);
    }
    else console.log(`using cached database: '${cachedWorldDbPath}'`);

    // get data from sql
    this.database = new sql.Database(dbBlob);

    this.tableNames = this.database.exec("SELECT name FROM sqlite_master")[0].values
      .map(value => {
        return value[0];
      });

    // if (this.currentTable) this.lazyLoadTable(this.currentTable);
    if (this.itemHash) this.searchHash(+this.itemHash);

    // 1345867571 -- coldheart
    // 2903592984 --lionheart
  }

  public searchHash(hash: number) {
    console.log(`searching hash '${hash}' on ${this.currentTable}...`);
    if (hash)
      this.router.navigate([`database/${this.currentTable}/${hash}`]);
    else
      this.router.navigate([`database/${this.currentTable}`]);
    if (!this.tablesDictionary[this.currentTable]) this.lazyLoadTable(this.currentTable);
    var data = this.tablesDictionary[this.currentTable][hash];
    data = !data ? {} : data;
    this.jsonEditorCode.set(data);
    this.jsonEditorView.set(data);
  }

  public lazyLoadTable(tableName: string) {
    console.log(`lazily loading '${tableName}' table into memory`);
    const rows = this.database.exec(`SELECT json FROM ${tableName}`);
    this.tablesDictionary[tableName] = {};
    rows[0].values.forEach(value => {
      var data = JSON.parse(value[0]);
      this.tablesDictionary[tableName][data.hash] = data;
    });
  }

  public onTableChange(table: string) {
    console.log(`table changed to: '${table}'`);
    this.router.navigate([`database/${this.currentTable}/${this.itemHash}`]);
  }
}