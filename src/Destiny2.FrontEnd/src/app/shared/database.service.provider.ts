import { DatabaseService } from "./database.service";
import * as sql from "sql.js"
import { ZipService } from "./zip.service";
import { APP_INITIALIZER } from "@angular/core";
import { DestinyHttpService } from "./destiny-http.service";

export let databaseServiceFactory = (destinyHttpService: DestinyHttpService, zipService: ZipService, databaseService: DatabaseService) =>
  () => databaseService.load(destinyHttpService, zipService);

export let databaseServiceProvider =
  {
    'provide': APP_INITIALIZER,
    'useFactory': databaseServiceFactory,
    'deps': [DestinyHttpService, ZipService, DatabaseService],
    'multi': true,
  }