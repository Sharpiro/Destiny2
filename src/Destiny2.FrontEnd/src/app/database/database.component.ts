import { Component, OnInit } from '@angular/core';
import { DatabaseService } from "./database.service";
import * as idbKeyval from 'idb-keyval';
import { ResponseContentType } from "@angular/http"
import { ZipService } from "../shared/zip.service";

declare var zip;

@Component({
  selector: 'app-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.css']
})
export class DatabaseComponent implements OnInit {

  constructor(private databaseService: DatabaseService, private zipService: ZipService) { }

  async ngOnInit() {
    // const url = "https://sharpirotestfunctions.azurewebsites.net/api/FacebookCallback";
    // const url = "https://www.bungie.net/Platform/Destiny2/Manifest/";
    // const url = "https://www.bungie.net/common/destiny2_content/sqlite/en/world_sql_content_281de46e3cd73e5747595936fd2dffa9.content";
    const url = "http://localhost:4200/assets/test.zip";

    zip.workerScriptsPath = "/assets/lib/zipjs/";

    var dbStorageKey = "database";
    var dbBlob = <Uint8Array>(await idbKeyval.get(dbStorageKey));
    if (!dbBlob) {
      console.log("database not found, downloading...");
      var response = await this.databaseService.getData(url, ResponseContentType.Blob)
      dbBlob = await this.zipService.getDatabaseBlob(response.blob());
      await idbKeyval.set(dbStorageKey, dbBlob)
    }
    else {
      console.log("database already exists in memory!");
    }
  }
}