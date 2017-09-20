import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DatabaseComponent } from './database/database.component';
import { HttpModule } from '@angular/http';
import { ZipService } from "./shared/zip.service";
import { DestinyApiService } from "./shared/destinyApi.service";
import { FormsModule } from '@angular/forms';
import { databaseServiceProvider } from './shared/database.service.provider';
import { DatabaseService } from './shared/database.service';
import { PlayerComponent } from './player/player.component';
import { KeysPipe } from './shared/keys.pipe';
import { HashPipe } from './shared/hash.pipe';
import { MemoryService } from "./shared/memory.service";
import { StaticDataService } from './shared/static-data.service';
import { DestinyHttpService } from './shared/destiny-http.service';

@NgModule({
  declarations: [
    AppComponent,
    DatabaseComponent,
    PlayerComponent,
    KeysPipe,
    HashPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpModule,
    FormsModule
  ],
  providers: [
    DestinyApiService,
    ZipService,
    DatabaseService,
    databaseServiceProvider,
    MemoryService,
    StaticDataService,
    DestinyHttpService],
  bootstrap: [AppComponent]
})
export class AppModule { }