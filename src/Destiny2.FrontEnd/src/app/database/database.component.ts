import { Component, OnInit } from '@angular/core';
import { DestinyApiService } from "../shared/destinyApi.service";
import * as idbKeyval from 'idb-keyval';
import { ResponseContentType } from "@angular/http"
import { ZipService } from "../shared/zip.service";
import * as sql from "sql.js"
import { ActivatedRoute, Router } from '@angular/router';
import JSONEditor from "jsoneditor";
import { JSONEditorMode, JSONEditorOptions } from "jsoneditor";

declare let zip;

@Component({
  selector: 'app-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.css']
})
export class DatabaseComponent implements OnInit {
  public json: string;
  public routeParam: string;
  private itemDictionary: any = {};
  private itemHash: string;
  private jsonEditorCode: JSONEditor;
  private jsonEditorView: JSONEditor;

  constructor(private destinyApiService: DestinyApiService, private zipService: ZipService, private route: ActivatedRoute,
    private router: Router) { }

  async ngOnInit() {

    // var options: JSONEditorOptions = {
    //   mode: "view",
    //   modes: ['code', 'view']
    // };
    var codeContainer = document.getElementById("jsonEditorCode");
    var viewContainer = document.getElementById("jsonEditorView");
    this.jsonEditorCode = new JSONEditor(codeContainer, { mode: "code" });
    this.jsonEditorView = new JSONEditor(viewContainer, { mode: "view" });

    this.route.params.subscribe(params => {
      this.routeParam = params['hash']; // --> Name must match wanted parameter
      this.itemHash = this.routeParam;
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
    var db = new sql.Database(dbBlob);
    const rows = db.exec(`SELECT json FROM DestinyInventoryItemDefinition`);
    rows[0].values.forEach(value => {

      var data = JSON.parse(value[0]);
      this.itemDictionary[data.hash] = data;
    });
    if (this.routeParam) this.searchHash(+this.routeParam);

    // 1345867571 -- coldheart
    // 2903592984 --lionheart
  }

  public searchHash(hash: number) {
    console.log(`searching hash '${hash}'...`);
    var data = this.itemDictionary[hash];
    this.jsonEditorCode.set(data);
    this.jsonEditorView.set(data);
    this.json = !data ? "Not Found" : JSON.stringify(data);
    this.router.navigate([`database/${hash}`]);
  }
}