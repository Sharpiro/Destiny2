import { Component, OnInit } from '@angular/core';
import { DestinyApiService } from "../shared/destinyApi.service";
import * as idbKeyval from 'idb-keyval';
import { ResponseContentType } from "@angular/http"
import { ZipService } from "../shared/zip.service";

declare let zip;

@Component({
  selector: 'app-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.css']
})
export class DatabaseComponent implements OnInit {

  constructor(private destinyApiService: DestinyApiService, private zipService: ZipService) { }

  async ngOnInit() {
    zip.workerScriptsPath = "/assets/lib/zipjs/";

    // let temp = await this.destinyApiService.searchPlayer("sharpirox");
    // console.log(temp);

    let manifestResponse = await this.destinyApiService.getManifest();
    let worldDbPath = manifestResponse.json().Response.mobileWorldContentPaths.en;
    let cachedData = localStorage.getItem("dbPath");
    let hasChanged = worldDbPath !== cachedData;
    console.log(worldDbPath);

    let dbStorageKey = "database";
    let dbBlob = <Uint8Array>(await idbKeyval.get(dbStorageKey));
    if (hasChanged || !dbBlob) {
      if (hasChanged) console.log("database has been updated, downloading...");
      if (!dbBlob) console.log("database not found in cache, downloading...");

      let databaseResponse = await this.destinyApiService.getDatabase(worldDbPath);
      dbBlob = await this.zipService.getDatabaseBlob(databaseResponse.blob());
      await idbKeyval.set(dbStorageKey, dbBlob)
      localStorage.setItem("dbPath", worldDbPath);
    }
    else console.log("database already exists in memory!");
  }
}